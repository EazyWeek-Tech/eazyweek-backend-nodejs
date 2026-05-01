const { Router } = require("express");
const { loginController, switchClinicController  } = require("./auth.controller");
const { loginValidation } = require("./auth.validator");
const { authLimiter } = require("../../middlewares/rateLimiter.middleware");
const validate = require("../../middlewares/validate.middleware");
const { verifyToken } = require("../../middlewares/auth.middleware");


const router = Router();

router.post("/login",         authLimiter, loginValidation, validate, loginController);
router.post("/switch-clinic", verifyToken, switchClinicController);

module.exports = router;