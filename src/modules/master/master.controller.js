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
  const centerCode   = req.user.centerCode   || "";
  const employeeCode = req.query.employeeCode || "";
  const userId       = req.user.employeeCode  || "";
  const data = await service.getDoctors(centerCode, employeeCode, userId);
  return success(res, data);
});

const insertDoctorMapping = asyncHandler(async (req, res) => {
  const result = await service.insertDoctorMapping(req.body);
  if (!result.success) {
    return res.status(409).json({ success: false, message: result.message });
  }
  return success(res, null, result.message);
});

const removeDoctorMapping = asyncHandler(async (req, res) => {
  const result = await service.removeDoctorMapping(req.body.employeeCode);
  return success(res, null, result.message);
});

 
// GET /api/Master/LoadAllCategory
// Uses centerCode from JWT so each clinic sees only its own quick tabs
const loadAllCategory = asyncHandler(async (req, res) => {
  const centerCode = req.user.centerCode || "";
  const data = await service.getAllCategories(centerCode);
  return success(res, data);
});
 
// GET /api/Master/GetServiceByCategory/:categoryCode/:centerCode
const getServiceByCategory = asyncHandler(async (req, res) => {
  const { categoryCode, centerCode } = req.params;
  const data = await service.getServiceByCategory(categoryCode, centerCode);
  return success(res, data);
});

module.exports = {
  loadCenters, insertClinic, removeClinic,
  loadDepartments, insertDepartment, removeDepartment,
  loadCountries, loadNationalities,
  loadPractitioners, loadRooms, loadDoctors,insertDoctorMapping,removeDoctorMapping,loadAllCategory,getServiceByCategory
};