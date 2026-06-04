const Joi = require("joi");

const bookSchema = Joi.object({
  doctorId: Joi.string().required(),
  date: Joi.string().required(),
  time: Joi.string().required(),
  type: Joi.string().valid("in-person", "video").default("in-person"),
  reason: Joi.string().allow("").optional(),
  notes: Joi.string().allow("").optional(),
});

const statusSchema = Joi.object({
  status: Joi.string().valid("pending", "confirmed", "cancelled", "completed").required(),
});

module.exports = {
  book: (req) => bookSchema.validate(req.body),
  status: (req) => statusSchema.validate(req.body),
};

