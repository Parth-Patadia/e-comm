import pool from "../config/database";

interface OrderData {
  user_id: number;
  address_id: number;
  total_amount: number;
  discount_id?: number;
  final_amount: number;
  payment_method: string;
}

interface ServiceResponse {
  error: boolean;
  message: string;
  data: any;
}
//{
// export const getUserCart = async (userId: number) => {
//   const result = await pool.query("SELECT * FROM cart WHERE user_id = $1", [
//     userId,
//   ]);
//   return result.rows[0];
// };

// export const getCartItems = async (cartId: number) => {
//   const result = await pool.query(
//     `SELECT ci.*, p.product_price, p.current_quantity
//          FROM cart_item ci
//          JOIN products p ON ci.product_id = p.product_id
//          WHERE ci.cart_id = $1`,
//     [cartId]
//   );
//   return result.rows;
// };

// export const getDiscount = async (discountId: number) => {
//   const result = await pool.query(
//     "SELECT * FROM discount WHERE discount_id = $1",
//     [discountId]
//   );
//   return result.rows[0];
// };

// {export const createOrder = async (orderData: OrderData) => {
//     const result = await pool.query(
//         `INSERT INTO orders
//          (user_id, address_id, total_amount, discount_id, final_amount, payment_method)
//          VALUES ($1, $2, $3, $4, $5, $6)
//          RETURNING *`,
//         [
//             orderData.user_id,
//             orderData.address_id,
//             orderData.total_amount,
//             orderData.discount_id,
//             orderData.final_amount,
//             orderData.payment_method
//         ]
//     );
//     return result.rows[0];
// };

// export const createOrderItem = async (
//     orderId: number,
//     productId: number,
//     quantity: number,
//     productPrice: number
// ) => {
//     await pool.query(
//         `INSERT INTO orders_item (order_id, product_id, quantity, product_price)
//          VALUES ($1, $2, $3, $4)`,
//         [orderId, productId, quantity, productPrice]
//     );
// };

// export const updateProductQuantity = async (quantity: number, productId: number) => {
//     await pool.query(
//         "UPDATE products SET current_quantity = current_quantity - $1 WHERE product_id = $2",
//         [quantity, productId]
//     );
// };

// export const clearCartItems = async (cartId: number) => {
//     await pool.query(
//         "DELETE FROM cart_item WHERE cart_id = $1",
//         [cartId]
//     );
// };}}

export const createOrderService = async (
  user_id: number,
  address_id: number,
  discount_id: number,
  payment_method: any
): Promise<ServiceResponse> => {
  try {
    const cart = await pool.query("SELECT * FROM cart WHERE user_id = $1", [
      user_id,
    ]);

    if (!cart) {
      return {
        error: true,
        message: "Cart is empty",
        data: null,
      };
    }

    const cartItems = await pool.query(
      `SELECT ci.*, p.product_price, p.current_quantity 
               FROM cart_item ci 
               JOIN products p ON ci.product_id = p.product_id 
               WHERE ci.cart_id = $1`,
      [cart.rows[0].cart_id]
    );
    console.log(cartItems.rows);
    if (cartItems.rows.length === 0) {
      return {
        error: true,
        message: "Cart is empty",
        data: null,
      };
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of cartItems.rows) {
      totalAmount += item.product_price * item.quantity;
    }

    let finalAmount = totalAmount;
    if (discount_id) {
      const discount = await pool.query(
        "SELECT * FROM discount WHERE discount_id = $1",
        [discount_id]
      );
      if (discount && totalAmount >= discount.rows[0].min_order_amount) {
        const discountAmount = Math.min(
          discount.rows[0].discount_amount,
          discount.rows[0].max_discount || Infinity
        );
        finalAmount = totalAmount - discountAmount;
      }
    }

    const newOrder = await pool.query(
      `INSERT INTO orders 
               (user_id, address_id, total_amount, discount_id, final_amount, payment_method) 
               VALUES ($1, $2, $3, $4, $5, $6) 
               RETURNING *`,
      [
        user_id,
        address_id,
        totalAmount,
        discount_id,
        finalAmount,
        payment_method,
      ]
    );

    // Process cart items
    for (const item of cartItems.rows) {
      if (item.current_quantity < item.quantity) {
        return {
          error: true,
          message: `Insufficient stock for product ID ${item.product_id}`,
          data: null,
        };
      }

      await pool.query(
        `INSERT INTO orders_item (order_id, product_id, quantity, product_price) 
            VALUES ($1, $2, $3, $4)`,
        [
          newOrder.rows[0].order_id,
          item.product_id,
          item.quantity,
          item.product_price,
        ]
      );

      await pool.query(
        "UPDATE products SET current_quantity = current_quantity - $1 WHERE product_id = $2",
        [item.quantity, item.product_id]
      );
    }

    await pool.query("DELETE FROM cart_item WHERE cart_id = $1", [
      cart.rows[0].cart_id,
    ]);
    //console.log(cart.rows[0].cart_id);

    return {
      error: false,
      message: "Order Created successfully",
      data: newOrder.rows[0],
    };
  } catch (err) {
    return {
      error: true,
      message: "Error in creatinggggg order",
      data: err,
    };
  }
};

export const getUserOrders = async (user_id: number) => {
  try {
    const result = await pool.query(`SELECT * FROM orders WHERE user_id = $1`, [
      user_id,
    ]);

    if (!result) {
      return {
        error: true,
        message: "No orders found",
        data: null,
      };
    }

    return {
      error: false,
      message: "Order Created successfully",
      data: result.rows,
    };
  } catch (error) {
    return {
      error: true,
      message: "Error in fetching orders",
      data: error,
    };
  }
};

export const updateOrder = async (orderId: number, status: string) => {
  try {
    const result = await pool.query(
      "UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2 RETURNING *",
      [status, orderId]
    );

    if (!result) {
      return {
        error: true,
        message: "No orders found",
        data: null,
      };
    }

    return {
      error: false,
      message: "Order updated successfully",
      data: result.rows[0],
    };
  } catch (error) {
    return {
      error: true,
      message: "Error in updating orders",
      data: error,
    };
  }
};
