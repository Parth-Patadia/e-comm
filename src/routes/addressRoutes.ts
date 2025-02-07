import { Request, Response } from "express";
import express from 'express';
import { addAddress,deleteAddress,allAddress } from "../controllers/addressController";
import { authenticateUser } from "../middleware/auth";
import { validateParams, validateRequest } from "../middleware/validateRequest";
import { addAddressSchema, addressIdParamSchema } from "../validations/addressValidation";

const router = express.Router();


router.post('/',authenticateUser,validateRequest(addAddressSchema),addAddress);
router.delete('/:id',authenticateUser,validateParams(addressIdParamSchema),deleteAddress)
router.get('/allAddress',authenticateUser,allAddress);

export default router; 