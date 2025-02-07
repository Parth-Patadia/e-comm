import express from 'express';

import { authenticateUser, isAdmin } from '../middleware/auth';
import { createProduct,getProductById,getProductsByCategory,addProductFeedback,getProductFeedback, getAllProducts, getProducts, updateProductHandler } from '../controllers/productController';
import { validateParams, validateRequest } from '../middleware/validateRequest';
import { addFeedbackSchema, createProductSchema, productFeedbackSchema, productIdParamSchema } from '../validations/productValidation';

const router = express.Router();

router.get('/',getAllProducts)
router.post('/',authenticateUser,isAdmin,validateRequest(createProductSchema),createProduct);
router.get('/getProduct/:id', validateParams(productIdParamSchema),getProductById);
router.get('/category/:id', validateParams(productIdParamSchema),getProductsByCategory);
router.get('/filter',getProducts)
router.put('/update/:id',authenticateUser,isAdmin,updateProductHandler)

router.post('/feedback',authenticateUser,validateRequest(addFeedbackSchema),addProductFeedback);
router.get('/productFeedback',validateRequest(productFeedbackSchema),getProductFeedback)

export default router; 