/**
 * Standardised API response helpers.
 * Usage: res.json(success(data)) or res.json(error("Not found", 404))
 */

function success(data, message = "OK") {
  return { success: true, message, data };
}

function error(message = "An error occurred", statusCode = 500) {
  return { success: false, message, statusCode };
}

module.exports = { success, error };
