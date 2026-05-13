const messageService = require("./message.service");

async function send(req, res, next) {
  try {
    const msg = await messageService.send(req.user, req.body || {});
    res.status(201).json(msg);
  } catch (e) {
    next(e);
  }
}

async function list(req, res, next) {
  try {
    const conv = await messageService.conversations(req.user);
    res.json(conv);
  } catch (e) {
    next(e);
  }
}

async function conversation(req, res, next) {
  try {
    const msgs = await messageService.conversationWith(req.user, req.params.userId);
    res.json(msgs);
  } catch (e) {
    next(e);
  }
}

module.exports = { send, list, conversation };

