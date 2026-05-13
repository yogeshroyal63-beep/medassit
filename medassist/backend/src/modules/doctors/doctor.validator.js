const Joi = require("joi");

const registerSchema = Joi.object({
  licenseNumber:  Joi.string().required(),
  specialization: Joi.string().required(),
  experience:     Joi.number().min(0).required(),
  hospital:       Joi.string().required(),
  bio:            Joi.string().allow("").optional(),
});

const availabilitySchema = Joi.object({
  availableDays:  Joi.array().items(Joi.string()).optional(),
  availableHours: Joi.object({
    start: Joi.string().optional(),
    end:   Joi.string().optional(),
  }).optional(),
});

module.exports = {
  register:     (req) => registerSchema.validate(req.body),
  availability: (req) => availabilitySchema.validate(req.body),
};
