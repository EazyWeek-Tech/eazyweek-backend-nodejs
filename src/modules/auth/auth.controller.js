const { login } = require("./auth.service");
const { success } = require("../../utils/response");
const asyncHandler = require("../../utils/asyncHandler");

/**
 * POST /api/auth/login
 * Controller only handles HTTP in/out.
 * Business logic lives in auth.service.js
 */
const loginController = asyncHandler(async (req, res) => {
  const result = await login(req.body);
  return success(res, result, "Login successful");
});

module.exports = { loginController };
