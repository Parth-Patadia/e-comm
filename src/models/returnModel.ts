import pool from "../config/database";

import { updateOrder } from "./orderModel";

interface ServiceResponse {
  error: boolean;
  message: string;
  data: any;
}

export const createReturnService = async (
  order_id: number,
  order_item_id: number,
  quantity: number,
  reason: string,
  userId: number
): Promise<ServiceResponse> => {
  try {
    // Check if order exists and belongs to user
    const order = await pool.query(
      `SELECT o.* 
           FROM orders o 
           WHERE o.order_id = $1 
           AND o.user_id = $2 
           AND o.status IN ('delivered', 'partially_returned')`,
      [order_id, userId]
    );

    if (order.rows.length === 0) {
      return {
        error: true,
        message: "Order not found or not eligible for return",
        data: null,
      };
    }

    // Get order item and check available quantity for return
    const orderItem = await pool.query(
      `SELECT oi.*, p.product_name 
           FROM orders_item oi
           JOIN products p ON oi.product_id = p.product_id 
           WHERE oi.order_id = $1 
           AND oi.order_item_id = $2`,
      [order_id, order_item_id]
    );

    if (orderItem.rows.length === 0) {
      return {
        error: true,
        message: "Order item not found",
        data: null,
      };
    }

    const availableForReturn =
      orderItem.rows[0].quantity - (orderItem.rows[0].returned_quantity || 0);

    if (availableForReturn === 0) {
      return {
        error: true,
        message: "This item has already been fully returned",
        data: null,
      };
    }

    if (quantity > availableForReturn) {
      return {
        error: true,
        message: `Cannot return ${quantity} items. Maximum available for return: ${availableForReturn}`,
        data: {
          ordered_quantity: orderItem.rows[0].quantity,
          already_returned: orderItem.rows[0].returned_quantity || 0,
          available_for_return: availableForReturn,
        },
      };
    }

    // Calculate refund amount
    const refundAmount = orderItem.rows[0].product_price * quantity;

    // Create return record
    const newReturn = await pool.query(
      `INSERT INTO returns 
          (order_id, user_id, total_refund_amount, status) 
          VALUES ($1, $2, $3, $4) 
          RETURNING *`,
      [order_id, userId, refundAmount, "pending"]
    );

    // Create return item
    const returnItem = await pool.query(
      `INSERT INTO returns_item 
          (return_id, order_item_id, quantity, product_price, reason, status) 
          VALUES ($1, $2, $3, $4, $5, $6) 
          RETURNING *`,
      [
        newReturn.rows[0].return_id,
        order_item_id,
        quantity,
        orderItem.rows[0].product_price,
        reason,
        "pending",
      ]
    );

    // Update returned quantity in orders_item
    await pool.query(
      `UPDATE orders_item 
           SET returned_quantity = COALESCE(returned_quantity, 0) + $1 
           WHERE order_item_id = $2`,
      [quantity, order_item_id]
    );

    // Check if all items in the order are fully returned
    const allOrderItems = await pool.query(
      `SELECT oi.order_item_id, oi.quantity, COALESCE(oi.returned_quantity, 0) as returned_quantity
           FROM orders_item oi
           WHERE oi.order_id = $1`,
      [order_id]
    );

    let allItemsFullyReturned = true;
    for (const item of allOrderItems.rows) {
      if (item.quantity > item.returned_quantity) {
        allItemsFullyReturned = false;
        break;
      }
    }

    // Update order status
    await pool.query(
      `UPDATE orders 
           SET status = $1, 
           updated_at = CURRENT_TIMESTAMP 
           WHERE order_id = $2`,
      [allItemsFullyReturned ? "returned" : "partially_returned", order_id]
    );

    return {
      error: false,
      message: "Return request created successfully",
      data: {
        ...newReturn.rows[0],
        item: {
          ...returnItem.rows[0],
          product_name: orderItem.rows[0].product_name,
          ordered_quantity: orderItem.rows[0].quantity,
          total_returned:
            parseInt(orderItem.rows[0].returned_quantity || 0) + quantity,
          remaining_quantity:
            parseInt(orderItem.rows[0].quantity) -
            (parseInt(orderItem.rows[0].returned_quantity || 0) + quantity),
        },
      },
    };
  } catch (error) {
    return {
      error: true,
      message: "Error in creating return",
      data: error,
    };
  }
};

export const updateStatusService = async (
  status: string,
  return_id: number
) => {
  try {
    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      return {
        error: true,
        message: "Status must be either 'approved' or 'rejected'",
        data: null,
      };
    }

    // Check if return exists and is pending
    const returnRequest = await pool.query(
      `SELECT r.*, ri.order_item_id, ri.quantity, ri.status as item_status
           FROM returns r
           JOIN returns_item ri ON r.return_id = ri.return_id
           WHERE r.return_id = $1 AND r.status = 'pending'`,
      [return_id]
    );

    if (returnRequest.rows.length === 0) {
      return {
        error: true,
        message: "Return request not found or already processed",
        data: null,
      };
    }

    // Update return header status
    await pool.query(
      `UPDATE returns 
           SET status = $1, 
           updated_at = CURRENT_TIMESTAMP 
           WHERE return_id = $2`,
      [status, return_id]
    );

    // Update return item status
    await pool.query(
      `UPDATE returns_item 
           SET status = $1, 
           updated_at = CURRENT_TIMESTAMP 
           WHERE return_id = $2`,
      [status, return_id]
    );

    if (status === "rejected") {
      // If rejected, revert the returned_quantity in orders_item
      await pool.query(
        `UPDATE orders_item 
               SET returned_quantity = returned_quantity - $1 
               WHERE order_item_id = $2`,
        [returnRequest.rows[0].quantity, returnRequest.rows[0].order_item_id]
      );

      // Check if order status needs to be updated back to 'delivered'
      const remainingReturns = await pool.query(
        `SELECT COUNT(*) as count
               FROM returns r
               JOIN returns_item ri ON r.return_id = ri.return_id
               WHERE r.order_id = $1 AND r.status = 'approved'`,
        [returnRequest.rows[0].order_id]
      );

      if (parseInt(remainingReturns.rows[0].count) === 0) {
        await pool.query(
          `UPDATE orders 
                   SET status = 'delivered', 
                   updated_at = CURRENT_TIMESTAMP 
                   WHERE order_id = $1`,
          [returnRequest.rows[0].order_id]
        );
      }
    }

    if (status === "approved") {
      // If approved, update product quantity
      const orderItem = await pool.query(
        `SELECT oi.product_id 
               FROM orders_item oi 
               WHERE oi.order_item_id = $1`,
        [returnRequest.rows[0].order_item_id]
      );

      await pool.query(
        `UPDATE products 
               SET current_quantity = current_quantity + $1 
               WHERE product_id = $2`,
        [returnRequest.rows[0].quantity, orderItem.rows[0].product_id]
      );
    }

    return {
      error: false,
      message: `Return request ${status} successfully`,
      data: return_id,
      status,
      updated_at: new Date(),
    };
  } catch (error) {
    return {
      error: true,
      message: "Error in updating status",
      data: error,
    };
  }
};
