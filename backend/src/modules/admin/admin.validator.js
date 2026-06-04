const Joi = require("joi");

const approveSchema = Joi.object({}).unknown(true); // no body required

const rejectSchema = Joi.object({
  reason: Joi.string().allow("").optional(),
});

module.exports = {
  approve: (req) => approveSchema.validate(req.body),
  reject:  (req) => rejectSchema.validate(req.body),
};
