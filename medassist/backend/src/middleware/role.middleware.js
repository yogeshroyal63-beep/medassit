module.exports = function roleGuard(...roles) {
  return (req, _res, next) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      const err = new Error("Forbidden");
      err.status = 403;
      return next(err);
    }
    return next();
  };
};
