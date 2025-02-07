import Joi from "joi";

export const createCategorySchema = Joi.object({
  category_name: Joi.string().required().trim().min(2).max(50),
});

export const updateCategorySchema = Joi.object({
  category_name: Joi.string().required().trim().min(2).max(50),
});

// For path parameters
export const categoryIdSchema = Joi.object({
  id: Joi.number().required().integer().positive(),
});
