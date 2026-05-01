const { success, badRequest } = require("../../utils/response");
const asyncHandler = require("../../utils/asyncHandler");

/**
 * POST /api/session/set
 * Stores LoginCode, TopCode, UserID in the server-side session.
 * Matches the .NET SetSession endpoint exactly.
 */
const setSession = asyncHandler(async (req, res) => {
  const { LoginCode, TopCode, userID } = req.body;

  if (!LoginCode || !TopCode) {
    return badRequest(res, "LoginCode and TopCode are required");
  }

  req.session.LoginCode = LoginCode;
  req.session.TopCode   = TopCode;
  req.session.userID    = userID || "";

  return success(res, null, "Session values set.");
});

/**
 * GET /api/session/get
 * Returns current session values.
 * Matches the .NET GetSession endpoint exactly.
 */
const getSession = asyncHandler(async (req, res) => {
  const sessionData = {
    sessionId : req.session.id,
    loginCode : req.session.LoginCode || "Not Set",
    topCode   : req.session.TopCode   || "Not Set",
    userID    : req.session.userID    || "Not Set",
  };

  return success(res, sessionData);
});

/**
 * POST /api/session/clear
 * Clears all session data.
 * Matches the .NET ClearSession endpoint exactly.
 */
const clearSession = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Failed to clear session" });
    }
    res.clearCookie("eazyweek.sid");
    return success(res, null, "Session cleared.");
  });
});

module.exports = { setSession, getSession, clearSession };