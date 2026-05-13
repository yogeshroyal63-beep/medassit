const Joi = require("joi");

const addSchema = Joi.object({
  title:       Joi.string().required(),
  type:        Joi.string()
                 .valid("lab", "prescription", "imaging", "diagnosis", "vaccination", "other")
                 .required(),
  description: Joi.string().allow("").optional(),
  date:        Joi.string().required(),
  doctorName:  Joi.string().allow("").optional(),
  fileUrl:     Joi.string().allow("").optional(),
  tags:        Joi.array().items(Joi.string()).optional(),
});

module.exports = {
  add: (req) => addSchema.validate(req.body),
};
