
import pool from "../config/database";

interface Product {
  product_id?: number;
  product_name: string;
  product_description: string;
  product_price: number;
  minimum_quantity: number;
  current_quantity: number;
  avg_rating: number;
  category_id: number;
}

interface Feedback {
  user_id: number;
  product_id: number;
  rating: number;
  description: string;
}

interface ServiceResponse {
  error: boolean;
  message: string;
  data: any;
}

export const createProductService = async (product: Product): Promise<ServiceResponse> => {
  try {
    if (!product.product_name || !product.product_price || 
        !product.minimum_quantity || !product.current_quantity) {
      return {
        error: true,
        message: "Required fields missing",
        data: null
      };
    }

    const { rows } = await pool.query(
      `INSERT INTO products (
        product_name, product_description, product_price,
        minimum_quantity, current_quantity, avg_rating, category_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [
        product.product_name,
        product.product_description,
        product.product_price,
        product.minimum_quantity,
        product.current_quantity,
        product.avg_rating,
        product.category_id
      ]
    );

    return {
      error: false,
      message: "Product created successfully",
      data: rows[0]
    };
  } catch (error) {
    return {
      error: true,
      message: "Error creating product",
      data: null
    };
  }
};

export const getProductByIdService = async (productId: number): Promise<ServiceResponse> => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM products WHERE product_id = $1",
      [productId]
    );

    if (rows.length === 0) {
      return {
        error: true,
        message: "Product not found",
        data: null
      };
    }

    return {
      error: false,
      message: "Product fetched successfully",
      data: rows[0]
    };
  } catch (error) {
    return {
      error: true,
      message: "Error fetching product",
      data: null
    };
  }
};

export const getAllProductsService = async (): Promise<ServiceResponse> => {
  try {
    const { rows } = await pool.query("SELECT * FROM products");
    return {
      error: false,
      message: "Products fetched successfully",
      data: rows
    };
  } catch (error) {
    return {
      error: true,
      message: "Error fetching products",
      data: null
    };
  }
};

export const getProductsByCategoryService = async (
  categoryId: number
): Promise<ServiceResponse> => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM products WHERE category_id = $1",
      [categoryId]
    );
    return {
      error: false,
      message: "Products fetched successfully",
      data: rows
    };
  } catch (error) {
    return {
      error: true,
      message: "Error fetching products by category",
      data: null
    };
  }
};

export const addFeedbackService = async (
  feedback: Feedback
): Promise<ServiceResponse> => {
  try {
    // Check if user has purchased the product
    const purchaseCheck = await pool.query(
      `SELECT o.order_id 
       FROM orders o 
       JOIN orders_item oi ON o.order_id = oi.order_id 
       WHERE o.user_id = $1 AND oi.product_id = $2`,
      [feedback.user_id, feedback.product_id]
    );

    if (purchaseCheck.rows.length === 0) {
      return {
        error: true,
        message: "You cannot give feedback to this product",
        data: null
      };
    }

    // Add feedback
    const { rows } = await pool.query(
      `INSERT INTO feedback (user_id, product_id, rating, description) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [feedback.user_id, feedback.product_id, feedback.rating, feedback.description]
    );

    // Update average rating
    await pool.query(
      `UPDATE products 
       SET avg_rating = (
         SELECT AVG(rating) 
         FROM feedback 
         WHERE product_id = $1
       ) 
       WHERE product_id = $1`,
      [feedback.product_id]
    );

    return {
      error: false,
      message: "Feedback added successfully",
      data: rows[0]
    };
  } catch (error) {
    return {
      error: true,
      message: "Error adding feedback",
      data: null
    };
  }
};

export const getProductFeedbackService = async (
  productId: number
): Promise<ServiceResponse> => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM feedback WHERE product_id = $1",
      [productId]
    );
    return {
      error: false,
      message: "Feedbacks fetched successfully",
      data: rows
    };
  } catch (error) {
    return {
      error: true,
      message: "Error fetching feedbacks",
      data: null
    };
  }
};