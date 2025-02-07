// import { Request, Response } from "express";
// import {
//   checkCart,
//   createCart,
//   fetchCartItem,
//   findProduct,
//   checkExistingCartItem,
//   updateCartItemQuantity,
//   addNewCartItem,
//   getCartItemById,
//   deleteCartItem,
//   clearCartItems,
// } from "../models/cartModel";

// export const getCart = async (req: Request, res: Response) => {
//   try {
//     const user_id = (req as any).user.user_id;

//     let cart_id = await checkCart(user_id);

//     if (!cart_id) {
//       cart_id = await createCart(user_id);
//       res.status(200).json({
//         message: "Cart created",
//       });
//       return;
//     }

//     const cartItems = await fetchCartItem(cart_id);

//     if (!cartItems.length) {
//       res.status(200).json({
//         message: "Cart is Empty",
//       });
//       return;
//     }

//     res.json({
//       message: "Cart details fetched successfully",
//       cart: cart_id,
//       items: cartItems,
//     });
//   } catch (error) {
//     console.error("Error in getCart:", error);
//     res.status(500).json({ message: "Failed to fetch Cart", error });
//   }
// };

// export const addToCart = async (req: Request, res: Response) => {
//   try {
//     const user_id = (req as any).user.user_id;
//     const { product_id, quantity } = req.body;

//     let cart_id = await checkCart(user_id);
//     if (!cart_id) {
//       cart_id = await createCart(user_id);
//     }

//     const product = await findProduct(product_id);
//     if (!product) {
//       res.status(404).json({ message: "Product not found" });
//       return;
//     }

//     if (product.current_quantity < quantity) {
//       res.status(400).json({
//         message: "Insufficient product quantity",
//         available_quantity: product.current_quantity,
//       });
//       return;
//     }

//     const existingCartItem = await checkExistingCartItem(cart_id, product_id);
//     let cartItem;

//     if (existingCartItem) {
//       const newQuantity =
//         parseInt(existingCartItem.quantity) + parseInt(quantity);

//       if (product.current_quantity < newQuantity) {
//         res.status(400).json({
//           message: "Insufficient product quantity",
//           quantity: product.current_quantity,
//         });
//         return;
//       }

//       cartItem = await updateCartItemQuantity(
//         newQuantity,
//         existingCartItem.cart_item_id
//       );
//     } else {
//       cartItem = await addNewCartItem(cart_id, product_id, quantity);
//     }

//     res.status(201).json(cartItem);
//   } catch (error) {
//     console.error("Error in addToCart:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const updateCartItem = async (req: Request, res: Response) => {
//   try {
//     const cart_item_id = (req as any).params.id;
//     const { quantity } = req.body;

//     const cartItem = await getCartItemById(cart_item_id);
//     if (!cartItem) {
//       res.status(404).json({ message: "Cart item not found" });
//       return;
//     }

//     const product = await findProduct(cartItem.product_id);
//     if (product.current_quantity < quantity) {
//       res.status(400).json({
//         message: "Insufficient stock available",
//         available_quantity: product.current_quantity,
//       });
//       return;
//     }

//     const updatedItem = await updateCartItemQuantity(quantity, cart_item_id);

//     res.status(200).json({
//       message: "Quantity updated successfully",
//       Item: updatedItem,
//     });
//   } catch (error) {
//     console.error("Error in updateCartItem:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const removeCartItem = async (req: Request, res: Response) => {
//   try {
//     const cart_item_id = (req as any).params.id;
//     const removedItem = await deleteCartItem(cart_item_id);

//     if (!removedItem) {
//       res.status(404).json({
//         message: "Cart item not found",
//       });
//       return;
//     }

//     res.json({ message: "Item removed from cart" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// export const clearCart = async (req: Request, res: Response) => {
//   try {
//     const user_id = (req as any).user.user_id;
//     await clearCartItems(user_id);

//     res.status(200).json({
//       message: "Cart cleared successfully",
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

//-------------------------------------------------------------------------------
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
