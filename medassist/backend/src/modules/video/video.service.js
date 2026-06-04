const crypto = require("crypto");

function createRoom(_user) {
  const roomId = crypto.randomUUID();
  const token = crypto.randomBytes(24).toString("hex");
  return { roomId, token };
}

function joinRoom(roomId) {
  if (!roomId) {
    const err = new Error("roomId required");
    err.status = 400;
    throw err;
  }
  return { roomId };
}

module.exports = { createRoom, joinRoom };

