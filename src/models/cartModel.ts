// import pool from "../config/database";

// export const checkCart = async (user_id: number) => {
//   let cart = await pool.query("SELECT cart_id FROM cart WHERE user_id = $1", [
//     user_id,
//   ]);
//   return cart.rows.length ? cart.rows[0].cart_id : null;
// };

// export const createCart = async (user_id: number) => {
//   let cart = await pool.query(
//     "INSERT INTO cart (user_id) VALUES ($1) RETURNING *",
//     [user_id]
//   );
//   return cart.rows[0].cart_id;
// };

// export const fetchCartItem = async (cart_id: number) => {
//   const items = await pool.query(
//     `SELECT ci.*, p.product_name, p.product_price, p.product_description 
//          FROM cart_item ci 
//          JOIN products p ON ci.product_id = p.product_id 
//          WHERE ci.cart_id = $1`,
//     [cart_id]
//   );
//   return items.rows;
// };

// export const findProduct = async (product_id: number) => {
//   const product = await pool.query(
//     "SELECT * FROM products WHERE product_id = $1",
//     [product_id]
//   );
//   return product.rows[0];
// };

// export const checkExistingCartItem = async (
//   cart_id: number,
//   product_id: number
// ) => {
//   const result = await pool.query(
//     "SELECT * FROM cart_item WHERE cart_id = $1 AND product_id = $2",
//     [cart_id, product_id]
//   );
//   return result.rows[0];
// };

// export const updateCartItemQuantity = async (
//   newQuantity: number,
//   cart_item_id: number
// ) => {
//   const result = await pool.query(
//     "UPDATE cart_item SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE cart_item_id = $2 RETURNING *",
//     [newQuantity, cart_item_id]
//   );
//   return result.rows[0];
// };

// export const addNewCartItem = async (
//   cart_id: number,
//   product_id: number,
//   quantity: number
// ) => {
//   const result = await pool.query(
//     "INSERT INTO cart_item (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
//     [cart_id, product_id, quantity]
//   );
//   return result.rows[0];
// };

// export const getCartItemById = async (cart_item_id: number) => {
//   const result = await pool.query(
//     "SELECT * FROM cart_item WHERE cart_item_id = $1",
//     [cart_item_id]
//   );
//   return result.rows[0];
// };

// export const deleteCartItem = async (cart_item_id: number) => {
//   const result = await pool.query(
//     `DELETE FROM cart_item WHERE cart_item_id = $1 RETURNING *`,
//     [cart_item_id]
//   );
//   return result.rows[0];
// };

// export const clearCartItems = async (user_id: number) => {
//   return await pool.query(
//     `DELETE FROM cart_item WHERE cart_id = (SELECT cart_id FROM cart WHERE user_id = $1)`,
//     [user_id]
//   );
// };

//----------------------------------------------------------------------------------
import { number } from "joi";
import pool from "../config/database";

 interface Cart {
  cart_id: number;
  user_id: number;
 
}

 interface CartItem {
  cart_item_id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  product_name?: string;
  product_price?: number;
  product_description?: string;
 
}

 interface ServiceResponse {
  error: boolean;
  message: string;
  data: any;
}

export const getCartService = async (userId: number): Promise<ServiceResponse> => {
  try {
    // Check existing cart
    let { rows: [cart] } = await pool.query(
      "SELECT cart_id FROM cart WHERE user_id = $1",
      [userId]
    );

    // Create new cart if doesn't exist
    if (!cart) {
      const { rows: [newCart] } = await pool.query(
        "INSERT INTO cart (user_id) VALUES ($1) RETURNING cart_id",
        [userId]
      );
      return {
        error: false,
        message: "Cart created successfully",
        data: { cart_id: newCart.cart_id, items: [] }
      };
    }

    // Fetch cart items
    const { rows: cartItems } = await pool.query(
      `SELECT ci.*, p.product_name, p.product_price, p.product_description 
       FROM cart_item ci 
       JOIN products p ON ci.product_id = p.product_id 
       WHERE ci.cart_id = $1`,
      [cart.cart_id]
    );

    return {
      error: false,
      message: cartItems.length ? "Cart items fetched successfully" : "Cart is empty",
      data: { cart_id: cart.cart_id, items: cartItems }
    };
  } catch (error) {
    return {
      error: true,
      message: "Error fetching cart",
      data: null
    };
  }
};

export const addToCartService = async (
  userId: number,
  productId: number,
  quantity: number
): Promise<ServiceResponse> => {
  try {
    // Start transaction

    // Get or create cart
    let { rows: [cart] } = await pool.query(
      "SELECT cart_id FROM cart WHERE user_id = $1",
      [userId]
    );

    if (!cart) {
      const { rows: [newCart] } = await pool.query(
        "INSERT INTO cart (user_id) VALUES ($1) RETURNING cart_id",
        [userId]
      );
      cart = newCart;
    }

    // Check product availability
    const { rows: [product] } = await pool.query(
      "SELECT * FROM products WHERE product_id = $1",
      [productId]
    );

    if (!product) {
      return {
        error: true,
        message: "Product not found",
        data: null
      };
    }

    if (product.current_quantity < quantity) {
      return {
        error: true,
        message: "Insufficient product quantity",
        data: null
      };
    }

    // Check existing cart item
    const { rows: [existingItem] } = await pool.query(
      "SELECT * FROM cart_item WHERE cart_id = $1 AND product_id = $2",
      [cart.cart_id, productId]
    );

    let cartItem;
    if (existingItem) {
      const newQuantity = Number(existingItem.quantity) + Number(quantity);
      
      if (product.current_quantity < newQuantity) {
        return {
          error: true,
          message: "Insufficient product quantity",
          data: null
        };
      }

      const { rows: [updatedItem] } = await pool.query(
        `UPDATE cart_item 
         SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE cart_item_id = $2 
         RETURNING *`,
        [newQuantity, existingItem.cart_item_id]
      );
      cartItem = updatedItem;
    } else {
      const { rows: [newItem] } = await pool.query(
        `INSERT INTO cart_item (cart_id, product_id, quantity) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [cart.cart_id, productId, quantity]
      );
      cartItem = newItem;
    }


    return {
      error: false,
      message: "Item added to cart successfully",
      data: cartItem
    };
  } catch (error) {
    return {
      error: true,
      message: "Error adding item to cart",
      data: null
    };
  }
};


export const updateCartItemService = async (
  cartItemId: number,
  quantity: number
): Promise<ServiceResponse> => {
  try {

    // Check cart item exists
    const { rows: [cartItem] } = await pool.query(
      "SELECT * FROM cart_item WHERE cart_item_id = $1",
      [cartItemId]
    );

    if (!cartItem) {
      return {
        error: true,
        message: "Cart item not found",
        data: null
      };
    }

    // Check product availability
    const { rows: [product] } = await pool.query(
      "SELECT * FROM products WHERE product_id = $1",
      [cartItem.product_id]
    );

    if (product.current_quantity < quantity) {
      return {
        error: true,
        message: "Insufficient stock",
        data: null
      };
    }

    // Update quantity
    const { rows: [updatedItem] } = await pool.query(
      `UPDATE cart_item 
       SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE cart_item_id = $2 
       RETURNING *`,
      [quantity, cartItemId]
    );


    return {
      error: false,
      message: "Cart item updated successfully",
      data: updatedItem
    };
  } catch (error) {
    return {
      error: true,
      message: "Error updating cart item",
      data: null
    };
  }
};

export const removeCartItemService = async (
  cartItemId: number
): Promise<ServiceResponse> => {
  try {
    const { rows: [removedItem] } = await pool.query(
      "DELETE FROM cart_item WHERE cart_item_id = $1 RETURNING *",
      [cartItemId]
    );

    if (!removedItem) {
      return {
        error: true,
        message: "Cart item not found",
        data: null
      };
    }

    return {
      error: false,
      message: "Item removed from cart successfully",
      data: removedItem
    };
  } catch (error) {
    return {
      error: true,
      message: "Error removing cart item",
      data: null
    };
  }
};

export const clearCartService = async (
  userId: number
): Promise<ServiceResponse> => {
  try {
    await pool.query(
      `DELETE FROM cart_item 
       WHERE cart_id = (
         SELECT cart_id 
         FROM cart 
         WHERE user_id = $1
       )`,
      [userId]
    );

    return {
      error: false,
      message: "Cart cleared successfully",
      data: null
    };
  } catch (error) {
    return {
      error: true,
      message: "Error clearing cart",
      data: null
    };
  }
};
