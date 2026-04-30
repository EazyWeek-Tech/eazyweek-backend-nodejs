const { Router } = require("express");
const controller = require("./employee.controller");
const { createEmployeeValidation, updateEmployeeValidation } = require("./employee.validator");
const { verifyToken, authorize } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const { ROLES } = require("../../config/constants");

const router = Router();

// All routes require authentication
router.use(verifyToken);

router.get("/",       controller.getAll);
router.get("/:id",    controller.getById);
router.post("/",      authorize(ROLES.ADMIN, ROLES.MANAGER), createEmployeeValidation, validate, controller.createEmployee);
router.put("/:id",    authorize(ROLES.ADMIN, ROLES.MANAGER), updateEmployeeValidation, validate, controller.updateEmployee);
router.delete("/:id", authorize(ROLES.ADMIN),                controller.deactivateEmployee);

module.exports = router;
