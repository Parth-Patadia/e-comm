import { Request, Response } from "express";
import {
  createProductService,
  getProductByIdService,
  getAllProductsService,
  getProductsByCategoryService,
  addFeedbackService,
  getProductFeedbackService,
  filters,updateProduct
} from "../models/productModel";

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await createProductService(req.body);

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
      message: "Error creating product",
      data: null,
    });
  }
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productId = parseInt(req.params.id);
    const result = await getProductByIdService(productId);

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
      message: "Error fetching product",
      data: null,
    });
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await getAllProductsService();

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
      message: "Error fetching products",
      data: null,
    });
  }
};

export const getProductsByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categoryId = parseInt(req.params.id);
    const result = await getProductsByCategoryService(categoryId);

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
      message: "Error fetching products by category",
      data: null,
    });
  }
};

export const addProductFeedback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.user_id;
    const { product_id, rating, description } = req.body;

    const feedback = {
      user_id: userId,
      product_id,
      rating,
      description,
    };

    const result = await addFeedbackService(feedback);

    if (result.error) {
      res.status(403).json({
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
      message: "Error adding feedback",
      data: null,
    });
  }
};

export const getProductFeedback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productId = parseInt(req.body.product_id);
    const result = await getProductFeedbackService(productId);

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
      message: "Error fetching product feedback",
      data: null,
    });
  }
};

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "product_price",
      sortOrder = "ASC",
      search = "",
      minPrice,
      maxPrice,
      minRating,
    } = req.body;

    // Validate sortOrder
    if (!["ASC", "DESC"].includes(sortOrder)) {
      res.status(400).json({
        error: true,
        message: "Invalid sort order. Use 'ASC' or 'DESC'.",
        data: null,
      });
    }
    // if(sortOrder !== 'ASC' || sortOrder!== 'DESC')
    // {
    //   res.status(400).json({
    //     error: true,
    //     message: "Invalid sort order. Use 'ASC' or 'DESC'.",
    //     data: null,
    // });
    // }

    const result = await filters(
      parseInt(page as string),
      parseInt(limit as string),
      sortBy,
      sortOrder,
      search,
      minPrice,
      maxPrice,
      minRating
    );

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
      message: "Server error",
      data: null,
    });
  }
};

export const updateProductHandler = async (req: Request, res: Response) => {
  try {
      const product_id = parseInt(req.params.id); // Get product ID from request parameters
      const productData = req.body; // Get the fields to update from the request body

      const updatedProduct = await updateProduct(product_id, productData);

      if (updatedProduct.error) {
           res.status(404).json({
              error: true,
              message: updatedProduct.message,
              data: null,
          });return
      }

      res.status(200).json({
          error: false,
          message: updatedProduct.message,
          data: updatedProduct.data,
      });
  } catch (error) {
      console.error("Error in updateProduct:", error);
      res.status(500).json({
          error: true,
          message: "Failed to update Product",
          data: error,
      });
  }
};
