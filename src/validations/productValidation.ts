import Joi from "joi";

export const createProductSchema = Joi.object({
  product_name: Joi.string().required().min(2).max(100),
  product_description: Joi.string().allow("").max(1000),

  product_price: Joi.number().required().positive().precision(2),
  minimum_quantity: Joi.number().required().integer().min(1),
  current_quantity: Joi.number().required().integer().min(0),
  avg_rating: Joi.number().min(0).max(5).default(0),

  category_id: Joi.number().required().integer().positive(),
});

export const productIdParamSchema = Joi.object({
  id: Joi.number().required().integer().positive(),
});

export const addFeedbackSchema = Joi.object({
  product_id: Joi.number().required().integer().positive(),

  rating: Joi.number().required().min(1).max(5),

  description: Joi.string().required().min(10).max(500),
});

export const productFeedbackSchema = Joi.object({
  product_id: Joi.number().required().integer().positive(),
});
