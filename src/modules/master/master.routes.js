const { Router } = require("express");
const controller = require("./master.controller");
const { verifyToken, authorize } = require("../../middlewares/auth.middleware");
const { ROLES } = require("../../config/constants");

const router = Router();

// All routes require authentication
router.use(verifyToken);

// ─── CLINICS ─────────────────────────────────────────────────────────────────
// Matches old: GET  /api/Master/LoadCenters
// Matches old: POST /api/Master/ClinicInsert
// Matches old: POST /api/Master/ClinicRemove
router.get("/LoadCenters",  controller.loadCenters);
router.post("/ClinicInsert", authorize(ROLES.ADMIN), controller.insertClinic);
router.post("/ClinicRemove", authorize(ROLES.ADMIN), controller.removeClinic);

// ─── DEPARTMENTS ─────────────────────────────────────────────────────────────
router.get("/LoadDepartment",      controller.loadDepartments);
router.post("/DepartmentInsert",   authorize(ROLES.ADMIN), controller.insertDepartment);
router.post("/DepartmentRemove",   authorize(ROLES.ADMIN), controller.removeDepartment);

// ─── COUNTRY / NATIONALITY ───────────────────────────────────────────────────
router.get("/LoadCountry",         controller.loadCountries);
router.get("/Nationality/:country", controller.loadNationalities);

// ─── PRACTITIONERS / ROOMS / DOCTORS ─────────────────────────────────────────
router.get("/LoadAllPractioner/:centerCode", controller.loadPractitioners);
router.get("/LoadRoom/:centerCode",          controller.loadRooms);
router.get("/LoadDoctorMapping",             controller.loadDoctors);

router.post("/DoctorMappingInsert", authorize(ROLES.ADMIN, ROLES.CLINIC_MANAGER), controller.insertDoctorMapping);
router.post("/DoctorMappingRemove", authorize(ROLES.ADMIN, ROLES.CLINIC_MANAGER), controller.removeDoctorMapping);
 
router.get("/LoadAllCategory",                              controller.loadAllCategory);
router.get("/GetServiceByCategory/:categoryCode/:centerCode", controller.getServiceByCategory);

module.exports = router;