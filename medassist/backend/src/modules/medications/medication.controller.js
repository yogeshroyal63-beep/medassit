const medicationService = require("./medication.service");

async function add(req, res, next) {
  try {
    const result = await medicationService.add(req.user, req.body || {});
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

async function list(req, res, next) {
  try {
    const result = await medicationService.getAll(req.user);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const result = await medicationService.update(req.user, req.params.id, req.body || {});
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const result = await medicationService.remove(req.user, req.params.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function taken(req, res, next) {
  try {
    const result = await medicationService.markTaken(req.user, req.params.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

module.exports = { add, list, update, remove, taken };

