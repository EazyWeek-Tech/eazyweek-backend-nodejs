const service = require("./employee.service");
const { success, created, paginated } = require("../../utils/response");
const asyncHandler = require("../../utils/asyncHandler");

// GET /api/employee?centerCode=&search=&page=&limit=
const getAll = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await service.getAll(req.query);
  return paginated(res, data, total, page, limit);
});

// GET /api/employee/dropdown?centerCode=Bright
const getDropdown = asyncHandler(async (req, res) => {
  const data = await service.getAllForDropdown(req.query.centerCode);
  return success(res, data);
});

// GET /api/employee/:id
const getById = asyncHandler(async (req, res) => {
  const employee = await service.getById(Number(req.params.id));
  return success(res, employee);
});

// POST /api/employee
const createEmployee = asyncHandler(async (req, res) => {
  await service.create(req.body, req.user.employeeCode);
  return created(res, null, "Employee created successfully");
});

// PUT /api/employee/:id
const updateEmployee = asyncHandler(async (req, res) => {
  await service.update(Number(req.params.id), req.body);
  return success(res, null, "Employee updated successfully");
});

// PUT /api/employee/:employeeCode/deactivate
const deactivateEmployee = asyncHandler(async (req, res) => {
  await service.deactivate(req.params.employeeCode);
  return success(res, null, "Employee deactivated successfully");
});

// PUT /api/employee/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { employeeCode, newPassword } = req.body;
  await service.resetPassword(employeeCode, newPassword);
  return success(res, null, "Password reset successfully");
});

// GET /api/employee/first-login-check?employeeCode=CENT-00101
const firstLoginCheck = asyncHandler(async (req, res) => {
  const isFirst = await service.checkFirstLogin(req.query.employeeCode);
  return success(res, { isFirstLogin: isFirst });
});

// POST /api/employee/first-login-done
const firstLoginDone = asyncHandler(async (req, res) => {
  await service.markFirstLoginDone(req.body.employeeCode);
  return success(res, null, "First login marked as done");
});
const getRoleMappingController = asyncHandler(async (req, res) => {
  const data = await service.getRoleMapping(req.params.employeeCode);
  return success(res, data);
});

const removeRoleMappingController = asyncHandler(async (req, res) => {
  await service.removeRoleMapping(Number(req.params.recId));
  return success(res, null, "Role mapping removed");
});

const getRolesController = asyncHandler(async (req, res) => {
  const data = await service.getAllRoles();
  return success(res, data);
});

const addRoleMappingController = asyncHandler(async (req, res) => {
  await service.insertRoleMapping(req.body);
  return success(res, null, "Role mapping added");
});

module.exports = {
  getAll, getDropdown, getById,
  createEmployee, updateEmployee, deactivateEmployee,
  resetPassword, firstLoginCheck, firstLoginDone,
  getRoleMappingController, removeRoleMappingController, getRolesController,addRoleMappingController
};