import Joi from "joi";

export const registerSchema = Joi.object({
  first_name: Joi.string().required().min(2).max(20),

  last_name: Joi.string().allow("").max(20),

  email: Joi.string().required().email(),

  password: Joi.string()
    .required()
    .min(6)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])")),

  phone_number: Joi.string().pattern(new RegExp("^[0-9]{10}$")),

  date_of_birth: Joi.date().max("now"),
});

export const loginSchema = Joi.object({
  email: Joi.string().required().email(),

  password: Joi.string().required(),
});
