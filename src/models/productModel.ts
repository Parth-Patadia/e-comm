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

export const createProductService = async (
  product: Product
): Promise<ServiceResponse> => {
  try {
    if (
      !product.product_name ||
      !product.product_price ||
      !product.minimum_quantity ||
      !product.current_quantity
    ) {
      return {
        error: true,
        message: "Required fields missing",
        data: null,
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
        product.category_id,
      ]
    );

    return {
      error: false,
      message: "Product created successfully",
      data: rows[0],
    };
  } catch (error) {
    return {
      error: true,
      message: "Error creating product",
      data: null,
    };
  }
};

export const getProductByIdService = async (
  productId: number
): Promise<ServiceResponse> => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM products WHERE product_id = $1",
      [productId]
    );

    if (rows.length === 0) {
      return {
        error: true,
        message: "Product not found",
        data: null,
      };
    }

    return {
      error: false,
      message: "Product fetched successfully",
      data: rows[0],
    };
  } catch (error) {
    return {
      error: true,
      message: "Error fetching product",
      data: null,
    };
  }
};

export const getAllProductsService = async (): Promise<ServiceResponse> => {
  try {
    const { rows } = await pool.query("SELECT * FROM products");
    return {
      error: false,
      message: "Products fetched successfully",
      data: rows,
    };
  } catch (error) {
    return {
      error: true,
      message: "Error fetching products",
      data: null,
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
      data: rows,
    };
  } catch (error) {
    return {
      error: true,
      message: "Error fetching products by category",
      data: null,
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
        data: null,
      };
    }

    // Add feedback
    const { rows } = await pool.query(
      `INSERT INTO feedback (user_id, product_id, rating, description) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [
        feedback.user_id,
        feedback.product_id,
        feedback.rating,
        feedback.description,
      ]
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
      data: rows[0],
    };
  } catch (error) {
    return {
      error: true,
      message: "Error adding feedback",
      data: null,
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
      data: rows,
    };
  } catch (error) {
    return {
      error: true,
      message: "Error fetching feedbacks",
      data: null,
    };
  }
};

export const filters = async (
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "ASC" | "DESC",
  search: string,
  minPrice?: number,
  maxPrice?: number,
  minRating?: number
): Promise<ServiceResponse> => {
  try {
    const offset = (page - 1) * limit;

    const params: any[] = [];
    let paramIndex = 1;

    // Search Query
    let searchQuery = "";
    if (search) {
      searchQuery = `AND product_name ILIKE $${paramIndex++}`;
      params.push(`%${search}%`);
    }

    // Price Filter
    let priceFilter = "";
    if (minPrice !== undefined && maxPrice !== undefined) {
      priceFilter = `AND product_price BETWEEN $${paramIndex} AND $${
        paramIndex + 1
      }`;
      params.push(minPrice, maxPrice);
      paramIndex += 2;
    } else if (minPrice !== undefined) {
      priceFilter = `AND product_price >= $${paramIndex}`;
      params.push(minPrice);
      paramIndex += 1;
    } else if (maxPrice !== undefined) {
      priceFilter = `AND product_price <= $${paramIndex}`;
      params.push(maxPrice);
      paramIndex += 1;
    }

    // Rating Filter
    let ratingFilter = "";
    if (minRating !== undefined) {
      ratingFilter = `AND avg_rating >= $${paramIndex}`;
      params.push(minRating);
      paramIndex += 1;
    }

    // Total Count Query
    const totalQuery = `
      SELECT COUNT(*) FROM products 
      WHERE TRUE 
      ${searchQuery} 
      ${priceFilter} 
      ${ratingFilter}
    `;

    const totalResult = await pool.query(totalQuery, params);
    //console.log(totalResult.rows[0]);
    const totalCount = parseInt(totalResult.rows[0].count);

    // Add Pagination
    params.push(limit, offset);

    // Main Query
    const query = `
      SELECT * FROM products 
      WHERE TRUE 
      ${searchQuery} 
      ${priceFilter} 
      ${ratingFilter}
      ORDER BY ${sortBy} ${sortOrder} 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await pool.query(query, params);
    //console.log(result)

    return {
      error: false,
      message: "Products fetched successfully",
      data: {
        totalCount,
        products: result.rows,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      error: true,
      message: "Error fetching products",
      data: error,
    };
  }
};

export const updateProduct = async (
  product_id: number,
  productData: Product
) => {
  const fields = Object.keys(productData);
  const values = Object.values(productData);

  if (fields.length === 0) {
    return {
      error: true,
      message: "No fields to update",
      data: null,
    };
  }

  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  try {
    const result = await pool.query(
      `UPDATE products 
           SET ${setClause} ,,updated_at = CURRENT_TIMESTAMP
           WHERE product_id = $${fields.length + 1} 
           RETURNING *`,
      [...values, product_id]
    );

    if (result.rows.length === 0) {
      return {
        error: true,
        message: "Product not found or not updated",
        data: null,
      };
    }

    return {
      error: false,
      message: "Product updated successfully",
      data: result.rows[0],
    };
  } catch (error) {
    return {
      error: true,
      message: "Product not updated",
      data: null,
    };
  }
};

export const deleteProduct = async (product_id: number) => {
  try {
      const result = await pool.query(
          `DELETE FROM products 
           WHERE product_id = $1 
           RETURNING *`,
          [product_id]
      );

      if (result.rows.length === 0) {
          return {
              error: true,
              message: "Product not found or not deleted",
              data: null,
          };
      }

      return {
          error: false,
          message: "Product deleted successfully",
          data: result.rows[0],
      };
  } catch (error) {
    console.log(error)
      return {
          error: true,
          message: "Product not deleted",
          data: null,
      };
  }
};
