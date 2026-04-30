const service = require("./employee.service");
const { success, created, paginated, notFound } = require("../../utils/response");
const asyncHandler = require("../../utils/asyncHandler");

const getAll = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await service.getAll(req.query);
  return paginated(res, data, total, page, limit);
});

const getById = asyncHandler(async (req, res) => {
  const employee = await service.getById(Number(req.params.id));
  return success(res, employee);
});

const createEmployee = asyncHandler(async (req, res) => {
  await service.create(req.body, req.user.employeeCode);
  return created(res, null, "Employee created successfully");
});

const updateEmployee = asyncHandler(async (req, res) => {
  await service.update(Number(req.params.id), req.body);
  return success(res, null, "Employee updated successfully");
});

const deactivateEmployee = asyncHandler(async (req, res) => {
  await service.deactivate(Number(req.params.id));
  return success(res, null, "Employee deactivated successfully");
});

module.exports = { getAll, getById, createEmployee, updateEmployee, deactivateEmployee };
