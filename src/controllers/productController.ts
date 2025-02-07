// import { Request, Response } from "express";
// import pool from "../config/database";
// import {
//   addFeedback,
//   addProduct,
//   allFeedback,
//   checkPurchase,
//   fetchAllProd,
//   fetchProdByCat,
//   fetchProdById,
//   updateRating,
// } from "../models/productModel";

// export const createProduct = async (req: Request, res: Response) => {
//   try {
//     const {
//       product_name,
//       product_description,
//       product_price,
//       minimum_quantity,
//       current_quantity,
//       avg_rating,
//       category_id,
//     } = req.body;

//     if (
//       !product_name ||
//       !product_price ||
//       !minimum_quantity ||
//       !current_quantity
//     ) {
//       res.status(400).json({
//         message:
//           "Product name , price , minimum quantity , current_quantity required",
//       });
//     }

//     const newProduct = await addProduct(
//       product_name,
//       product_description,
//       product_price,
//       minimum_quantity,
//       current_quantity,
//       avg_rating,
//       category_id
//     );

//     res.status(201).json({
//       message: "Product created successfully",
//       Product: {
//         product_name: newProduct.product_name,
//         product_description: newProduct.product_description,
//         product_price: newProduct.product_price,
//       },
//     });
//   } catch (error) {
//     res.status(401).json({
//       message: "Error in Creating Product",
//     });
//   }
// };

// export const getProductById = async (req: Request, res: Response) => {
//   try {
//     const product_id = Number(req.params.id);
//     //console.log(product_id);
//     if (!product_id) {
//       res.status(400).json({ message: "Product ID is not found" });
//     }

//     const productInfo = await fetchProdById(product_id);
//     res.status(200).json({
//       message: "Product details found successfully",
//       product_details: productInfo,
//     });
//   } catch (error) {
//     res.status(400).json({
//       message: "Error in fetching Product1",
//     });
//   }
// };

// export const getAllProduct = async (req: Request, res: Response) => {
//   try {
//     const allProducts = await fetchAllProd();

//     res.status(200).json({
//       message: "Product details found successfully",
//       product_details: allProducts,
//     });
//   } catch (error) {
//     res.status(401).json({
//       message: "Error in fetching Product2",
//     });
//   }
// };

// export const getProductByCategory = async (req: Request, res: Response) => {
//   try {
//     const category_id = (req as any).params.id;

//     const products = await fetchProdByCat(category_id);

//     res.status(200).json({
//       message: "Products found Successfully",
//       products: products,
//     });
//   } catch (error) {
//     res.status(401).json({
//       message: "Error in fetching Product3",
//     });
//   }
// };

// export const addProductFeedback = async (req: Request, res: Response) => {
//   try {
//     const user_id = (req as any).user.user_id;
//     const { product_id, rating, description } = req.body;

//     // Check if user has purchased this product
//     const hasPurchased = checkPurchase(user_id, product_id);

//     if (!hasPurchased) {
//       res.status(403).json({
//         message: "You can not give feedback to this product",
//       });
//       return;
//     }

//     // Add feedback
//     const newFeedback = await addFeedback(
//       user_id,
//       product_id,
//       rating,
//       description
//     );

//     // Update average rating
//     await updateRating(product_id);

//     res.status(201).json({
//       message: "Feedback Added",
//       feedback: newFeedback,
//     });
//   } catch (error) {
//     console.error("Error in addProductFeedback:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const productFeedback = async (req: Request, res: Response) => {
//   try {
//     //const user_id = (req as any).user.user_id;
//     const { product_id } = req.body;

//     const feedback = allFeedback(product_id);

//     res.status(200).json({
//       message: "All feedbacks",
//       Feedbacks: feedback,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch feedbacks",error });
//   }
// };

//-------------------------------------------------------------------------------

import { Request, Response } from "express";
import {
  createProductService,
  getProductByIdService,
  getAllProductsService,
  getProductsByCategoryService,
  addFeedbackService,
  getProductFeedbackService
} from "../models/productModel";

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await createProductService(req.body);

    if (result.error) {
      res.status(400).json({
        error: true,
        message: result.message,
        data: null
      });
      return;
    }

    res.status(201).json({
      error: false,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Error creating product",
      data: null
    });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.id);
    const result = await getProductByIdService(productId);

    if (result.error) {
      res.status(404).json({
        error: true,
        message: result.message,
        data: null
      });
      return;
    }

    res.status(200).json({
      error: false,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Error fetching product",
      data: null
    });
  }
};

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getAllProductsService();

    if (result.error) {
      res.status(400).json({
        error: true,
        message: result.message,
        data: null
      });
      return;
    }

    res.status(200).json({
      error: false,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Error fetching products",
      data: null
    });
  }
};

export const getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryId = parseInt(req.params.id);
    const result = await getProductsByCategoryService(categoryId);

    if (result.error) {
      res.status(400).json({
        error: true,
        message: result.message,
        data: null
      });
      return;
    }

    res.status(200).json({
      error: false,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Error fetching products by category",
      data: null
    });
  }
};

export const addProductFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.user_id;
    const { product_id, rating, description } = req.body;

    const feedback = {
      user_id: userId,
      product_id,
      rating,
      description
    };

    const result = await addFeedbackService(feedback);

    if (result.error) {
      res.status(403).json({
        error: true,
        message: result.message,
        data: null
      });
      return;
    }

    res.status(201).json({
      error: false,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Error adding feedback",
      data: null
    });
  }
};

export const getProductFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.body.product_id);
    const result = await getProductFeedbackService(productId);

    if (result.error) {
      res.status(400).json({
        error: true,
        message: result.message,
        data: null
      });
      return;
    }

    res.status(200).json({
      error: false,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Error fetching product feedback",
      data: null
    });
  }
};