import Joi from "joi";

export const createOrderSchema = Joi.object({
  address_id: Joi.number().required().integer().positive(),
  discount_id: Joi.number().optional().integer().positive().allow(null),
  payment_method: Joi.string()
    .required()
    .valid("credit_card", "debit_card", "upi", "cod", "net_banking"),
});

export const updateOrderStatusSchema = Joi.object({
  order_id: Joi.number().required().integer().positive(),
  status: Joi.string()
    .required()
    .valid("pending", "processing", "shipped", "delivered", "cancelled"),
});

export const createReturnSchema = Joi.object({
  order_id: Joi.number().required().integer().positive(),
  order_item_id: Joi.number().required().integer().positive(),
  quantity: Joi.number().required().integer().positive(),
  reason: Joi.string().required().trim().min(10).max(500),
});

export const updateReturnStatusSchema = Joi.object({
  return_id: Joi.number().required().integer().positive(),
  status: Joi.string().required().valid("approved", "rejected"),
});

export const orderIdSchema = Joi.object({
  order_id: Joi.number().required().integer().positive(),
});