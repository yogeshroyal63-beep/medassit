const mongoose = require("mongoose");
const Message = require("./message.model");
const User = require("../auth/auth.model");

async function send(user, body) {
  const receiverId = body.receiverId;
  // Accept both "content" and "text" for compatibility
  const content = String(body.content || body.text || "").trim();
  if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
    const err = new Error("receiverId is required");
    err.status = 400;
    throw err;
  }
  if (!content) {
    const err = new Error("content is required");
    err.status = 400;
    throw err;
  }

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    const err = new Error("Receiver not found");
    err.status = 404;
    throw err;
  }

  return Message.create({ senderId: user.id, receiverId, content, read: false });
}

async function conversations(user) {
  const myId = user.id;
  const msgs = await Message.find({ $or: [{ senderId: myId }, { receiverId: myId }] })
    .sort({ createdAt: -1 })
    .limit(500);

  const seen = new Map(); // other userId -> latest message
  const conv = [];

  for (const m of msgs) {
    const other = (m.senderId.toString() === myId.toString() ? m.receiverId : m.senderId).toString();
    if (seen.has(other)) continue;
    seen.set(other, m);
    // Use the other user's ID as the conversation identifier
    conv.push({ _id: other, userId: other, lastMessage: m.content, lastAt: m.createdAt });
  }

  // Populate participant names
  const otherIds = conv.map(c => c.userId);
  const users = await User.find({ _id: { $in: otherIds } }).select("name");
  const userMap = {};
  for (const u of users) userMap[u._id.toString()] = u.name;

  return conv.map(c => ({ ...c, participantName: userMap[c.userId] || "Unknown" }));
}

async function conversationWith(user, otherUserId) {
  if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
    const err = new Error("Invalid userId");
    err.status = 400;
    throw err;
  }

  const myId = user.id;
  const messages = await Message.find({
    $or: [
      { senderId: myId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: myId },
    ],
  }).sort({ createdAt: 1 });

  await Message.updateMany({ senderId: otherUserId, receiverId: myId, read: false }, { read: true });
  return messages;
}

module.exports = { send, conversations, conversationWith };
