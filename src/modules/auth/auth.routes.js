const { Router } = require("express");
const { loginController } = require("./auth.controller");
const { loginValidation } = require("./auth.validator");
const { authLimiter } = require("../../middlewares/rateLimiter.middleware");
const validate = require("../../middlewares/validate.middleware");

const router = Router();

router.post("/login", authLimiter, loginValidation, validate, loginController);

module.exports = router;