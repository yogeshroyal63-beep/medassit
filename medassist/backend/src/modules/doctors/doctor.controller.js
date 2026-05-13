const doctorService = require("./doctor.service");

async function list(req, res, next) {
  try {
    const docs = await doctorService.listApproved({ specialization: req.query.specialization });
    res.json(docs);
  } catch (e) {
    next(e);
  }
}

async function me(req, res, next) {
  try {
    const doc = await doctorService.getMe(req.user);
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

async function getOne(req, res, next) {
  try {
    const doc = await doctorService.getById(req.params.id);
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

async function register(req, res, next) {
  try {
    const doc = await doctorService.registerDoctor(req.user, req.body || {}, req.files || {});
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
}

async function availability(req, res, next) {
  try {
    const doc = await doctorService.updateAvailability(req.user, req.body || {});
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

module.exports = { list, me, getOne, register, availability };

