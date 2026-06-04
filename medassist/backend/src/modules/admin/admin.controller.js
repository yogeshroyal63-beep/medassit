const adminService = require("./admin.service");

async function stats(req, res, next) {
  try {
    res.json(await adminService.stats());
  } catch (e) {
    next(e);
  }
}

async function pending(req, res, next) {
  try {
    res.json(await adminService.pendingDoctors());
  } catch (e) {
    next(e);
  }
}

async function approve(req, res, next) {
  try {
    res.json(await adminService.approveDoctor(req.params.id));
  } catch (e) {
    next(e);
  }
}

async function reject(req, res, next) {
  try {
    res.json(await adminService.rejectDoctor(req.params.id, req.body.reason));
  } catch (e) {
    next(e);
  }
}

async function users(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);
    res.json(await adminService.users({ page, limit }));
  } catch (e) {
    next(e);
  }
}

async function audit(req, res, next) {
  try {
    res.json(await adminService.auditLogs());
  } catch (e) {
    next(e);
  }
}

module.exports = { stats, pending, approve, reject, users, audit };

