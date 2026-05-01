const { AppError } = require("../../middlewares/error.middleware");
const repo = require("./employee.repository");
const { getPagination } = require("../../utils/pagination");

const getAll = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const { centerCode, search } = query;
  const { data, total } = await repo.findAll({ centerCode, search, offset, limit });
  return { data, total, page, limit };
};

const getAllForDropdown = async (centerCode) => {
  if (!centerCode) throw new AppError("centerCode is required", 400);
  return repo.findAllForDropdown(centerCode);
};

const getById = async (id) => {
  const employee = await repo.findById(id);
  if (!employee) throw new AppError("Employee not found", 404);
  return employee;
};

const create = async (data, createdBy) => {
  const existing = await repo.findByEmployeeCode(data.EMPLOYEECODE);
  if (existing) throw new AppError(`Employee code ${data.EMPLOYEECODE} already exists`, 409);
  await repo.create({ ...data, CREATEDBY: createdBy });
};

const update = async (id, data) => {
  const employee = await repo.findById(id);
  if (!employee) throw new AppError("Employee not found", 404);
  await repo.update(id, data);
};

const deactivate = async (employeeCode) => {
  const employee = await repo.findByEmployeeCode(employeeCode);
  if (!employee) throw new AppError("Employee not found", 404);
  if (!employee.Active) throw new AppError("Employee is already deactivated", 400);
  await repo.deactivate(employeeCode);
};

const resetPassword = async (employeeCode, newPassword) => {
  const employee = await repo.findByEmployeeCode(employeeCode);
  if (!employee) throw new AppError("Employee not found", 404);
  const success = await repo.resetPassword(employeeCode, newPassword);
  if (!success) throw new AppError("Password reset failed", 500);
};

const getRoleMapping    = (employeeCode) => repo.getRoleMapping(employeeCode);
const removeRoleMapping = (recId)        => repo.removeRoleMapping(recId);
const getAllRoles        = ()             => repo.getAllRoles();


const checkFirstLogin = async (employeeCode) => {
  return repo.isFirstLogin(employeeCode);
};

const markFirstLoginDone = async (employeeCode) => {
  await repo.markFirstLoginDone(employeeCode);
};

const insertRoleMapping = (data) => repo.insertRoleMapping(data);

module.exports = {
  getAll, getAllForDropdown, getById,
  create, update, deactivate,
  resetPassword, checkFirstLogin, markFirstLoginDone,insertRoleMapping,
  getRoleMapping, removeRoleMapping, getAllRoles,
};