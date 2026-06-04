const userService = require("./user.service");

async function me(req, res, next) {
  try {
    const result = await userService.getMe(req.user);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function updateMe(req, res, next) {
  try {
    const result = await userService.updateMe(req.user, req.body || {});
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function changePassword(req, res, next) {
  try {
    const result = await userService.changePassword(req.user, req.body || {});
    res.json(result);
  } catch (e) {
    next(e);
  }
}

module.exports = { me, updateMe, changePassword };
