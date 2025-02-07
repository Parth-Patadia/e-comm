import { Request, Response } from "express";
import pool from "../config/database";
import {
  createOrderService,
  getUserOrders,
  updateOrder,getOrderItems
} from "../models/orderModel";
import {
  createReturnService,
  updateStatusService,
} from "../models/returnModel";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.user_id;
    const { address_id, discount_id, payment_method } = req.body;

    const cart = await createOrderService(
      userId,
      address_id,
      discount_id,
      payment_method
    );
    //console.log(cart);

    if (cart.error) {
      res.status(400).json({
        error: true,
        message: cart.message,
        data: null,
      });
      return;
    }

    res.status(201).json({
      error: false,
      message: cart.message,
      data: cart.data,
    });
  } catch (error) {
    console.error("Error in createOrder:", error);
    res
      .status(500)
      .json({ error: true, message: "Error in create order", data: error });
  }
};

export const getUserOrder = async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user.user_id;
    const orders = await getUserOrders(user_id);
    if (orders.error) {
      res.status(400).json({
        error: true,
        message: orders.message,
        data: null,
      });
      return;
    }

    res.status(201).json({
      error: false,
      message: orders.message,
      data: orders.data,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: true, message: "Error in fetching order", data: error });
  }
};

export const getOrderItemsById = async (req:Request, res:Response) =>{
  try {
    const user_id = (req as any).user.user_id;
    const {order_id} = req.body;

    const orderItems = await getOrderItems(user_id,order_id);
    res.status(201).json({
      error: false,
      message: orderItems.message,
      data: orderItems.data,
    });

  } catch (error) {
    res
      .status(500)
      .json({ error: true, message: "Error in fetching order items", data: error });
  }
}

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { order_id, status } = req.body;
    const updatedOrder = await updateOrder(order_id, status);

    if (!updatedOrder) {
      res.status(400).json({
        error: true,
        message: "Order not found",
        data: null,
      });
      return;
    }
    res.status(201).json({
      error: false,
      message: "Status updated successfully",
      data: updateOrder,
    });
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    res
      .status(500)
      .json({
        error: true,
        message: "Error in update order status",
        data: error,
      });
  }
};

export const createReturn = async (req: Request, res: Response) => {
  try {
    const { order_id, order_item_id, quantity, reason } = req.body;
    const userId = (req as any).user.user_id;

    const order = await createReturnService(
      order_id,
      order_item_id,
      quantity,
      reason,
      userId
    );

    if (order.error) {
      res.status(400).json({
        error: true,
        message: order.message,
        data: null,
      });
      return;
    }

    res.status(201).json({
      error: false,
      message: order.message,
      data: order.data,
    });
  } catch (error) {
    console.error("Error in createReturn:", error);
    res
      .status(500)
      .json({ error: true, message: "Error in return order", data: error });
  }
};

export const updateReturnStatus = async (req: Request, res: Response) => {
  try {
    const { status, return_id } = req.body;

    const updateStatus = await updateStatusService(status, return_id);

    if (updateStatus.error) {
      res.status(400).json({
        error: true,
        message: updateStatus.message,
        data: null,
      });
      return;
    }

    res.status(201).json({
      error: false,
      message: `Return request ${status} successfully`,
      data: return_id,
      status,
      updated_at: new Date(),
    });
  } catch (error) {
    console.error("Error in updateReturnStatus:", error);
    res.status(500).json({
      error: true,
      message: "Error in update return status",
      data: error,
    });
  }
};
