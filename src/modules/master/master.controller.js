const service = require("./master.service");
const { success } = require("../../utils/response");
const asyncHandler = require("../../utils/asyncHandler");

// ─── CLINICS ─────────────────────────────────────────────────────────────────

const loadCenters = asyncHandler(async (req, res) => {
  const data = await service.getCenters();
  return success(res, data);
});

const insertClinic = asyncHandler(async (req, res) => {
  const result = await service.createClinic(req.body);
  return success(res, null, result.message);
});

const removeClinic = asyncHandler(async (req, res) => {
  const code = req.body.code || req.params.code;
  const result = await service.deleteClinic(code);
  return success(res, null, result.message);
});

// ─── DEPARTMENTS ─────────────────────────────────────────────────────────────

const loadDepartments = asyncHandler(async (req, res) => {
  const data = await service.getDepartments();
  return success(res, data);
});

const insertDepartment = asyncHandler(async (req, res) => {
  const result = await service.createDepartment(req.body);
  return success(res, null, result.message);
});

const removeDepartment = asyncHandler(async (req, res) => {
  const code = req.body.dCode || req.params.code;
  const result = await service.deleteDepartment(code);
  return success(res, null, result.message);
});

// ─── COUNTRY / NATIONALITY ───────────────────────────────────────────────────

const loadCountries = asyncHandler(async (req, res) => {
  const data = await service.getCountries();
  return success(res, data);
});

const loadNationalities = asyncHandler(async (req, res) => {
  const data = await service.getNationalities(req.params.country);
  return success(res, data);
});

// ─── PRACTITIONERS / ROOMS / DOCTORS ─────────────────────────────────────────

const loadPractitioners = asyncHandler(async (req, res) => {
  const data = await service.getPractitioners(req.params.centerCode);
  return success(res, data);
});

const loadRooms = asyncHandler(async (req, res) => {
  const data = await service.getRooms(req.params.centerCode);
  return success(res, data);
});

const loadDoctors = asyncHandler(async (req, res) => {
  const centerCode = req.user.centerCode;
  const data = await service.getDoctors(centerCode);
  return success(res, data);
});

module.exports = {
  loadCenters, insertClinic, removeClinic,
  loadDepartments, insertDepartment, removeDepartment,
  loadCountries, loadNationalities,
  loadPractitioners, loadRooms, loadDoctors,
};