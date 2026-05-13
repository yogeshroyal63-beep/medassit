const appointmentService = require("./appointment.service");

async function book(req, res, next) {
  try {
    const result = await appointmentService.book(req.user, req.body || {});
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

async function my(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
    const result = await appointmentService.myAppointments(req.user, { page, limit });
    res.json(result);
  } catch (e) {
    next(e);
  }
}

// Bug fix: pass req.user so the service can verify the calling doctor
// owns the appointment before changing its status.
async function status(req, res, next) {
  try {
    const result = await appointmentService.updateStatus(req.params.id, req.body.status, req.user);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function cancel(req, res, next) {
  try {
    const result = await appointmentService.cancel(req.user, req.params.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

module.exports = { book, my, status, cancel };
