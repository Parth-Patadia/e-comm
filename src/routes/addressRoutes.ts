import { Request, Response } from "express";
import express from 'express';
import { addAddress,deleteAddress,allAddress, updateAddressHandler } from "../controllers/addressController";
import { authenticateUser } from "../middleware/auth";
import { validateParams, validateRequest } from "../middleware/validateRequest";
import { addAddressSchema, addressIdParamSchema,updateAddressSchema } from "../validations/addressValidation";

const router = express.Router();


router.post('/',authenticateUser,validateRequest(addAddressSchema),addAddress);
router.delete('/:id',authenticateUser,validateParams(addressIdParamSchema),deleteAddress)
router.get('/allAddress',authenticateUser,allAddress);
router.put('/update/:id',authenticateUser,validateParams(addressIdParamSchema),validateRequest(updateAddressSchema),updateAddressHandler)

export default router;  