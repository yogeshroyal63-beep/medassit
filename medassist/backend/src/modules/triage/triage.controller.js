const triageService = require("./triage.service");

async function triage(req, res, next) {
  try {
    const result = await triageService.runTriage(req.user, req.body || {}, req.requestId);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function history(req, res, next) {
  try {
    // Support optional pagination via ?page=&limit=
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
    const result = await triageService.history(req.user, { page, limit });
    res.json(result);
  } catch (e) {
    next(e);
  }
}

module.exports = { triage, history };
