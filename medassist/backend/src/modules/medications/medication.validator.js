const Joi = require("joi");

const addSchema = Joi.object({
  name:         Joi.string().required(),
  dosage:       Joi.string().required(),
  frequency:    Joi.string().required(),
  times:        Joi.array().items(Joi.string()).optional(),
  startDate:    Joi.string().required(),
  endDate:      Joi.string().allow("").optional(),
  instructions: Joi.string().allow("").optional(),
  prescribedBy: Joi.string().allow("").optional(),
  isActive:     Joi.boolean().optional(),
});

const updateSchema = addSchema.fork(
  ["name", "dosage", "frequency", "startDate"],
  (field) => field.optional()
);

module.exports = {
  add:    (req) => addSchema.validate(req.body),
  update: (req) => updateSchema.validate(req.body),
};
