const videoService = require("./video.service");

async function createRoom(req, res, next) {
  try {
    const appointmentId = req.body?.appointmentId || req.query?.appointmentId || null;
    res.json(await videoService.createRoom(req.user, appointmentId));
  } catch (e) {
    next(e);
  }
}

async function join(req, res, next) {
  try {
    res.json(videoService.joinRoom(req.params.roomId));
  } catch (e) {
    next(e);
  }
}

module.exports = { createRoom, join };
