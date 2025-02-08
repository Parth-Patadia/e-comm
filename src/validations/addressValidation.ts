import Joi from "joi";

export const addAddressSchema = Joi.object({
  address_line_1: Joi.string().required().min(5).max(100),
  address_line_2: Joi.string().max(100),
  area: Joi.string().required().min(2).max(50),
  city: Joi.string()
    .required()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/),
  state: Joi.string()
    .required()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/),
  pincode: Joi.string()
    .required()
    .pattern(/^[0-9]{6}$/),
});

export const addressIdParamSchema = Joi.object({
  id: Joi.number().required().integer().positive(),
});

export const updateAddressSchema = Joi.object({
  address_line_1: Joi.string().min(5).max(100),
  address_line_2: Joi.string().max(100),
  area: Joi.string().min(2).max(50),
  city: Joi.string()
    
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/),
  state: Joi.string()
    
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/),
  pincode: Joi.string()
   
    .pattern(/^[0-9]{6}$/),
});
