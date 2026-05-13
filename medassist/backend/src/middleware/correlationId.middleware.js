/**
 * Correlation ID middleware.
 *
 * Attaches a unique request ID (X-Request-Id) to every request so that log
 * entries from the Node API and the Python AI service can be correlated when
 * debugging a specific triage call.
 *
 * The ID is:
 *  1. Read from the incoming X-Request-Id header (forwarded by load balancers).
 *  2. Validated: must be alphanumeric/hyphens only, max 64 chars — otherwise
 *     a fresh UUID is generated.  This prevents log injection and header bloat
 *     from untrusted user-supplied values.
 *  3. Generated fresh (crypto.randomUUID) when absent or invalid.
 *
 * The ID is echoed back in the response header and attached to req.requestId
 * for use in logger calls and the AI service axios request header.
 */

const crypto = require("crypto");

const VALID_ID  = /^[a-zA-Z0-9-]{1,64}$/;

module.exports = function correlationId(req, res, next) {
  const incoming = req.headers["x-request-id"];
  const id = (incoming && VALID_ID.test(incoming))
    ? incoming
    : crypto.randomUUID();

  req.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
};
