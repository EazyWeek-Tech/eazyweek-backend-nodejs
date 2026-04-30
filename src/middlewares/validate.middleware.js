const { validationResult } = require("express-validator");

/**
 * Runs after express-validator chains.
 * If validation fails, throws a structured error caught by errorHandler.
 *
 * Usage:
 *   router.post("/login", loginValidation, validate, authController.login);
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error("Validation failed");
    err.isValidation = true;
    err.errors = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(err);
  }
  next();
};

module.exports = validate;
