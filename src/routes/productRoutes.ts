import express from 'express';

import { authenticateUser, isAdmin } from '../middleware/auth';
import { createProduct,getProductById,getProductsByCategory,addProductFeedback,getProductFeedback, getAllProducts } from '../controllers/productController';
import { validateParams, validateRequest } from '../middleware/validateRequest';
import { addFeedbackSchema, createProductSchema, productFeedbackSchema, productIdParamSchema } from '../validations/productValidation';

const router = express.Router();

router.get('/',getAllProducts)
router.post('/',authenticateUser,isAdmin,validateRequest(createProductSchema),createProduct);
router.get('/getProduct/:id', validateParams(productIdParamSchema),getProductById);
router.get('/category/:id', validateParams(productIdParamSchema),getProductsByCategory);

router.post('/feedback',authenticateUser,validateRequest(addFeedbackSchema),addProductFeedback);
router.get('/productFeedback',validateRequest(productFeedbackSchema),getProductFeedback)

export default router; 