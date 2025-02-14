import express from 'express';

import {createOrder,getUserOrder, updateOrderStatus,createReturn,updateReturnStatus,getOrderItemsById} from '../controllers/orderController'

import { authenticateUser,isAdmin } from '../middleware/auth';
import { validateParams, validateRequest } from '../middleware/validateRequest';
import { createOrderSchema, createReturnSchema, orderIdSchema, updateOrderStatusSchema, updateReturnStatusSchema } from '../validations/orderValidation';

const router = express.Router();

router.post('/', authenticateUser,validateRequest(createOrderSchema),createOrder);
router.get('/userOrder', authenticateUser, getUserOrder);
router.get('/orderById',authenticateUser,validateParams(orderIdSchema),getOrderItemsById)
router.put('/updateStatus',authenticateUser,isAdmin,validateRequest(updateOrderStatusSchema),updateOrderStatus)

router.post('/return', authenticateUser,validateRequest(createReturnSchema), createReturn);
router.put('/approve',authenticateUser,isAdmin,validateRequest(updateReturnStatusSchema),updateReturnStatus)

export default router; 