const { verifyToken } = require("../utils/jwt");
const User = require("../modules/auth/auth.model");

module.exports = async function authMiddleware(req, _res, next) {
  const header = req.headers.authorization || "";
  const [, token] = header.split(" ");
  if (!token) {
    const err = new Error("Unauthorized");
    err.status = 401;
    return next(err);
  }
  try {
    const payload = verifyToken(token);
    req.user = payload;

    // Check if the token was issued before the user changed their password.
    // If so, reject the token so all old sessions are invalidated immediately.
    if (payload.id && payload.id !== "admin" && payload.iat) {
      const dbUser = await User.findById(payload.id).select("passwordChangedAt").lean();
      if (
        dbUser &&
        dbUser.passwordChangedAt &&
        payload.iat * 1000 < new Date(dbUser.passwordChangedAt).getTime()
      ) {
        const err = new Error("Token invalidated — please log in again");
        err.status = 401;
        return next(err);
      }
    }

    return next();
  } catch (e) {
    const err = new Error("Unauthorized");
    err.status = 401;
    return next(err);
  }
};
