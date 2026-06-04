const Joi = require("joi");

const registerSchema = Joi.object({
  name:     Joi.string().min(2).required(),
  email:    Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role:     Joi.string().valid("patient", "doctor").required(),
  phone:    Joi.string().allow("", null).optional(),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  register: (req) => registerSchema.validate(req.body),
  login:    (req) => loginSchema.validate(req.body),
};
