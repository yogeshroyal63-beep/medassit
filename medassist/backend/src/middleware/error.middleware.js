const logger = require("../utils/logger");

// eslint-disable-next-line no-unused-vars
module.exports = function errorMiddleware(err, _req, res, _next) {
  logger.error(err);
  const status  = err.status || err.statusCode || 500;
  const message = status < 500 && err.message ? err.message : "Internal server error";
  res.status(status).json({ message });
};
