const logger = require("../utils/logger");

/**
 * Axios errors carry the full request config, including headers such as
 * x-internal-secret. Never log that object: keep only what is needed to debug.
 */
function loggable(err) {
  if (err && err.isAxiosError) {
    return {
      message: err.message,
      name: err.name,
      code: err.code,
      status: err.response && err.response.status,
      method: err.config && err.config.method,
      url: err.config && err.config.url,
      upstreamRouting: err.response && err.response.headers && err.response.headers["x-render-routing"],
    };
  }
  return err;
}

// eslint-disable-next-line no-unused-vars
module.exports = function errorMiddleware(err, _req, res, _next) {
  logger.error(loggable(err));

  let status = err.status || err.statusCode || 500;

  // An upstream (AI service) 429/5xx must not be shown to the user as their own error.
  if (err && err.isAxiosError && err.response && [429, 502, 503, 504].includes(err.response.status)) {
    status = 503;
    return res.status(status).json({ message: "The AI service is waking up. Please try again in a few seconds." });
  }

  const message = status < 500 && err.message ? err.message : "Internal server error";
  res.status(status).json({ message });
};
