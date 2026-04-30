const { AppError } = require("../../middlewares/error.middleware");
const repo = require("./employee.repository");
const { getPagination } = require("../../utils/pagination");

const getAll = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const { centerCode, search } = query;
  const { data, total } = await repo.findAll({ centerCode, search, offset, limit });
  return { data, total, page, limit };
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

const deactivate = async (id) => {
  const employee = await repo.findById(id);
  if (!employee) throw new AppError("Employee not found", 404);
  await repo.deactivate(id);
};

module.exports = { getAll, getById, create, update, deactivate };
