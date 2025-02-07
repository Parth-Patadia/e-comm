

import pool from "../config/database";

interface Category {
  category_id: number;
  category_name: string;
  created_at: Date;
  updated_at: Date;
}

interface ServiceResponse {
  error: boolean;
  message: string;
  data: any;
}

export const getAllCategoriesService = async (): Promise<ServiceResponse> => {
  try {
    const { rows } = await pool.query(
      "SELECT category_id, category_name, created_at, updated_at FROM category"
    );
    return {
      error: false,
      message: "Categories fetched successfully",
      data: rows,
    };
  } catch (error) {
    return {
      error: true,
      message: "Error fetching categories",
      data: null,
    };
  }
};

export const createCategoryService = async (
  category_name: string
): Promise<ServiceResponse> => {
  try {
    if (!category_name.trim()) {
      return {
        error: true,
        message: "Category name is required",
        data: null,
      };
    }

    const { rows } = await pool.query(
      `INSERT INTO category (category_name) 
       VALUES ($1) 
       RETURNING category_id, category_name, created_at, updated_at`,
      [category_name]
    );

    return {
      error: false,
      message: "Category created successfully",
      data: rows[0],
    };
  } catch (error) {
    return {
      error: true,
      message: "Error creating category",
      data: null,
    };
  }
};

export const getCategoryByIdService = async (
  category_id: number
): Promise<ServiceResponse> => {
  try {
    const { rows } = await pool.query(
      `SELECT category_id, category_name, created_at, updated_at 
       FROM category 
       WHERE category_id = $1`,
      [category_id]
    );

    if (rows.length === 0) {
      return {
        error: true,
        message: "Category not found",
        data: null,
      };
    }

    return {
      error: false,
      message: "Category fetched successfully",
      data: rows[0],
    };
  } catch (error) {
    return {
      error: true,
      message: "Error fetching category",
      data: null,
    };
  }
};

export const updateCategoryService = async (
  category_name: string,
  category_id: number
): Promise<ServiceResponse> => {
  try {
    if (!category_name.trim()) {
      return {
        error: true,
        message: "Category name is required",
        data: null,
      };
    }

    const { rows } = await pool.query(
      `UPDATE category 
       SET category_name = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE category_id = $2 
       RETURNING category_id, category_name, created_at, updated_at`,
      [category_name, category_id]
    );

    if (rows.length === 0) {
      return {
        error: true,
        message: "Category not found",
        data: null,
      };
    }

    return {
      error: false,
      message: "Category updated successfully",
      data: rows[0],
    };
  } catch (error) {
    return {
      error: true,
      message: "Error updating category",
      data: null,
    };
  }
};
