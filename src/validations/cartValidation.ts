import Joi from "joi";

export const addToCartSchema = Joi.object({
  product_id: Joi.number().required().integer().positive(),
  quantity: Joi.number().required().integer().min(1),
});

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().required().integer().min(1),
});

export const cartItemIdParamSchema = Joi.object({
  id: Joi.number().required().integer().positive(),
});
