module.exports = function validate(validator) {
  return (req, _res, next) => {
    const { error } = validator(req);
    if (error) {
      const err = new Error(error.details?.[0]?.message || "Validation error");
      err.status = 400;
      return next(err);
    }
    return next();
  };
};

