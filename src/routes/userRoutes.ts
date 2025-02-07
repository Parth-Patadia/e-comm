import express from 'express';

import { registerUser,loginUser,getUserProfile } from '../controllers/userController';
import { authenticateUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { registerSchema,loginSchema } from '../validations/userValidation';

const router = express.Router();

router.post('/register',validateRequest(registerSchema),registerUser);
router.post('/login',validateRequest(loginSchema), loginUser);
router.get('/profile/:id', authenticateUser, getUserProfile);


export default router; 