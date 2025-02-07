
import { Request, Response } from "express";
import {
  getCartService,
  addToCartService,
  updateCartItemService,
  removeCartItemService,
  clearCartService,
} from "../models/cartModel";

export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.user_id;
    const result = await getCartService(userId);

    if (result.error) {
      res.status(400).json({
        error: true,
        message: result.message,
        data: null,
      });
      return;
    }

    res.status(200).json({
      error: false,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Error fetching cart",
      data: null,
    });
  }
};

export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.user_id;
    const { product_id, quantity } = req.body;

    const result = await addToCartService(userId, product_id, quantity);

    if (result.error) {
      res.status(400).json({
        error: true,
        message: result.message,
        data: null,
      });
      return;
    }

    res.status(201).json({
      error: false,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Error adding item to cart",
      data: null,
    });
  }
};

export const updateCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cartItemId = parseInt(req.params.id);
    const { quantity } = req.body;

    if (!quantity) {
      res.status(400).json({
        error: true,
        message: "Quantity is required",
        data: null,
      });
      return;
    }

    const result = await updateCartItemService(cartItemId, quantity);

    if (result.error) {
      res.status(400).json({
        error: true,
        message: result.message,
        data: null,
      });
      return;
    }

    res.status(200).json({
      error: false,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Error updating cart item",
      data: null,
    });
  }
};

export const removeCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cartItemId = parseInt(req.params.id);
    const result = await removeCartItemService(cartItemId);

    if (result.error) {
      res.status(404).json({
        error: true,
        message: result.message,
        data: null,
      });
      return;
    }

    res.status(200).json({
      error: false,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Error removing cart item",
      data: null,
    });
  }
};

export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.user_id;
    const result = await clearCartService(userId);

    if (result.error) {
      res.status(400).json({
        error: true,
        message: result.message,
        data: null,
      });
      return;
    }

    res.status(200).json({
      error: false,
      message: result.message,
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Error clearing cart",
      data: null,
    });
  }
};
