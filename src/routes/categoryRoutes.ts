import express from "express";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  getCategoryById,
} from "../controllers/categoryController";
import { authenticateUser, isAdmin } from "../middleware/auth";
import { validateParams, validateRequest } from "../middleware/validateRequest";
import { categoryIdSchema, createCategorySchema,updateCategorySchema } from "../validations/categoryValidation";

const router = express.Router();

router.post("/", authenticateUser,isAdmin,validateRequest(createCategorySchema), createCategory);
router.get("/", getAllCategories);
router.get("/:id", validateParams(categoryIdSchema),getCategoryById);
router.put("/:id", authenticateUser,isAdmin,validateParams(categoryIdSchema),
validateRequest(updateCategorySchema), updateCategory);

export default router;
