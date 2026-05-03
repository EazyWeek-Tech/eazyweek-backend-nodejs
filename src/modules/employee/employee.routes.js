const { Router } = require("express");
const controller = require("./employee.controller");
const {
  createEmployeeValidation,
  updateEmployeeValidation,
  resetPasswordValidation,
} = require("./employee.validator");
const { verifyToken, authorize } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const { ROLES } = require("../../config/constants");

const router = Router();

router.use(verifyToken);

// ✅ Named routes FIRST — must be before /:id
router.get("/dropdown",                   controller.getDropdown);
router.get("/roles",                      controller.getRolesController);
router.get("/first-login-check",          controller.firstLoginCheck);
router.post("/first-login-done",          controller.firstLoginDone);
router.put("/reset-password",             resetPasswordValidation, validate, controller.resetPassword);
router.post("/role-mapping",              controller.addRoleMappingController);                        // ✅ ADD THIS
router.delete("/role-mapping/:recId",     authorize(ROLES.ADMIN), controller.removeRoleMappingController);
router.get("/doctors", controller.getDoctorEmployeesController);

// ✅ Generic GET routes
router.get("/",    controller.getAll);
router.get("/:id", controller.getById);

// ✅ Employee code specific — after /:id to avoid conflict
router.get("/:employeeCode/role-mapping", controller.getRoleMappingController);

// ✅ Create — Admin + Clinic Manager
router.post(
  "/",
  authorize(ROLES.ADMIN, ROLES.CLINIC_MANAGER),
  createEmployeeValidation, validate,
  controller.createEmployee
);

// ✅ Update — Admin + Clinic Manager
router.put(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.CLINIC_MANAGER),
  updateEmployeeValidation, validate,
  controller.updateEmployee
);

// ✅ Deactivate — Admin only
router.put(
  "/:employeeCode/deactivate",
  authorize(ROLES.ADMIN),
  controller.deactivateEmployee
);



module.exports = router;