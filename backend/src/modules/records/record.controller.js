const recordService = require("./record.service");

async function add(req, res, next) {
  try {
    const result = await recordService.add(req.user, req.body || {});
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

async function list(req, res, next) {
  try {
    const result = await recordService.list(req.user, req.query.type);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function getOne(req, res, next) {
  try {
    const result = await recordService.getOne(req.user, req.params.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const result = await recordService.remove(req.user, req.params.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

module.exports = { add, list, getOne, remove };

