const vitalService = require("./vital.service");

async function log(req, res, next) {
  try {
    const result = await vitalService.log(req.user, req.body || {});
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

async function latest(req, res, next) {
  try {
    const result = await vitalService.getLatest(req.user);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function trend(req, res, next) {
  try {
    const months = Math.min(12, parseInt(req.query.months, 10) || 6);
    const result = await vitalService.getTrend(req.user, months);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

module.exports = { log, latest, trend };
