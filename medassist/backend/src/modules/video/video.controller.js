const videoService = require("./video.service");

async function createRoom(req, res, next) {
  try {
    res.json(videoService.createRoom(req.user));
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

