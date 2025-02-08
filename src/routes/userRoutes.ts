import express from 'express';

import { registerUser,loginUser,getUserProfile, updateUserHandler } from '../controllers/userController';
import { authenticateUser } from '../middleware/auth';
import { validateParams, validateRequest } from '../middleware/validateRequest';
import { registerSchema,loginSchema, userIdParamSchema,updateUserSchema } from '../validations/userValidation';

const router = express.Router();

router.post('/register',validateRequest(registerSchema),registerUser);
router.post('/login',validateRequest(loginSchema), loginUser);
router.get('/profile/:id', authenticateUser,validateParams(userIdParamSchema), getUserProfile);

router.put('/update',authenticateUser,validateRequest(updateUserSchema),updateUserHandler)

export default router; 