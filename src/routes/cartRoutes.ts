import express from 'express';

import { authenticateUser } from '../middleware/auth';
import { getCart,addToCart,updateCartItem,removeCartItem,clearCart } from '../controllers/cartController';
import { validateParams, validateRequest } from '../middleware/validateRequest';
import { addToCartSchema, cartItemIdParamSchema, updateCartItemSchema } from '../validations/cartValidation';

const router = express.Router();


router.get('/', authenticateUser, getCart);
router.post('/add', authenticateUser,validateRequest(addToCartSchema), addToCart);
router.put('/item/:id', authenticateUser,validateParams(cartItemIdParamSchema),validateRequest(updateCartItemSchema), updateCartItem);
router.delete('/item/:id',validateParams(cartItemIdParamSchema),authenticateUser,removeCartItem);
router.delete('/clear',authenticateUser,clearCart)


export default router; 