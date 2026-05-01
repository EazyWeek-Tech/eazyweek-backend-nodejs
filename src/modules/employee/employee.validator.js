const { body, param } = require("express-validator");

const createEmployeeValidation = [
  body("EMPLOYEECODE").trim().notEmpty().withMessage("Employee code is required"),
  body("FIRSTNAME").trim().notEmpty().withMessage("First name is required"),
  body("USERNAME").trim().notEmpty().withMessage("Username is required"),
  body("CENTERCODE").trim().notEmpty().withMessage("Center code is required"),
  body("EMAIL").optional().isEmail().withMessage("Invalid email format"),
  body("MOBILEPHONE").optional().isMobilePhone().withMessage("Invalid mobile number"),
  body("GENDER").optional().isIn(["Male", "Female", "Other"]).withMessage("Invalid gender value"),
];

const updateEmployeeValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid employee ID"),
  body("FIRSTNAME").trim().notEmpty().withMessage("First name is required"),
  body("CENTERCODE").trim().notEmpty().withMessage("Center code is required"),
  body("EMAIL").optional().isEmail().withMessage("Invalid email format"),
  body("GENDER").optional().isIn(["Male", "Female", "Other"]).withMessage("Invalid gender value"),
];
const resetPasswordValidation = [
  body("employeeCode").trim().notEmpty().withMessage("Employee code is required"),
  body("newPassword").isLength({ min: 3 }).withMessage("Password must be at least 3 characters"),
];

module.exports = { createEmployeeValidation, updateEmployeeValidation, resetPasswordValidation };