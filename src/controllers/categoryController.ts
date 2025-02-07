// import { Request, Response } from "express";
// import pool from "../config/database";
// import {
//   allCategory,
//   insertCategory,
//   catById,
//   updatecategory,
// } from "../models/categoryModel";

// export const createCategory = async (req: Request, res: Response) => {
//   try {
//     const { category_name } = req.body;

//     if (!category_name) {
//       res.status(400).json({
//         message: "category name required",
//       });
//     }
//     const query = await insertCategory(category_name);

//     res.status(200).json({
//       message: "Category Created",
//       query,
//     });
//   } catch (error) {
//     res.status(401).json({
//       message: "Error in creating category",
//       error,
//     });
//   }
// };

// export const getAllCategories = async (req: Request, res: Response) => {
//   try {
//     const categories = await allCategory();
//     //console.log(categories);
//     res.status(200).json({
//       message: "All Categories",
//       categories,
//     });
//   } catch (error) {
//     res.status(400).json({
//       message: "Error in fetching all category",
//       error,
//     });
//   }
// };

// export const getCategoryById = async (req: Request, res: Response) => {
//   try {
//     const category_id = (req as any).params.id;

//     const categoryInfo = await catById(category_id);

//     res.status(200).json({
//       message: "Category details found successfully",
//       product_details: categoryInfo,
//     });
//   } catch (error) {
//     res.status(400).json({
//       message: "Error in fetching Category",
//       error,
//     });
//   }
// };

// export const updateCategory = async (req: Request, res: Response) => {
//   try {
//     const { category_name } = req.body;
//     const category_id = (req as any).params.id;

//     if (!category_name) {
//       res.status(401).json({
//         message: "Category name is required",
//       });
//     }

//     //console.log(category_id,category_name);

//     const updateCat = await updatecategory(category_name, category_id);

//     if (!updateCat) {
//       res.status(400).json({
//         message: "Category not found",
//       });
//       return;
//     }

//     //const catinfo = await pool.query(`select * from category where category_id = $1`,[category_id]);

//     res.status(200).json({
//       message: "Category updated successfully",
//       updatedCategory: updateCat,
//     });
//   } catch (error) {
//     res.status(400).json({
//       message: "Failed to update category",
//       error,
//     });
//   }
// };

//-------------------------------------------------------------------------------
import { Request, Response } from "express";
import {
  getAllCategoriesService,
  createCategoryService,
  getCategoryByIdService,
  updateCategoryService,
} from "../models/categoryModel";

export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category_name } = req.body;
    const result = await createCategoryService(category_name);

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
      message: "Error creating category",
      data: null,
    });
  }
};

export const getAllCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await getAllCategoriesService();

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
      message: "Error fetching categories",
      data: null,
    });
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const category_id = parseInt(req.params.id);
    const result = await getCategoryByIdService(category_id);

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
      message: "Error fetching category",
      data: null,
    });
  }
};

export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category_name } = req.body;
    const category_id = parseInt(req.params.id);

    const result = await updateCategoryService(category_name, category_id);

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
      message: "Error updating category",
      data: null,
    });
  }
};
