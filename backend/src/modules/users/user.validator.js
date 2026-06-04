const Joi = require("joi");

const updateSchema = Joi.object({
  name:    Joi.string().min(2).optional(),
  phone:   Joi.string().allow("").optional(),
  role:    Joi.string().valid("patient", "doctor").optional(),
  // profile fields
  age:              Joi.number().min(0).max(130).optional(),
  gender:           Joi.string().allow("").optional(),
  bloodGroup:       Joi.string().allow("").optional(),
  address:          Joi.string().allow("").optional(),
  allergies:        Joi.array().items(Joi.string()).optional(),
  chronicConds:     Joi.array().items(Joi.string()).optional(),
  emergencyContact: Joi.object().optional(),
});

module.exports = {
  update: (req) => updateSchema.validate(req.body),
};
