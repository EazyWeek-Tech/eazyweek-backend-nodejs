const { login, switchClinic } = require("./auth.service");
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
const switchClinicController = asyncHandler(async (req, res) => {
  const { centerCode } = req.body;
  const employeeCode = req.user.employeeCode;
  const result = await switchClinic({ employeeCode, centerCode });
  return success(res, result, "Clinic switched successfully");
});

module.exports = { loginController, switchClinicController };
