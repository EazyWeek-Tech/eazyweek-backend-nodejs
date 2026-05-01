const jwt = require("jsonwebtoken");
const { AppError } = require("../../middlewares/error.middleware");
const { findAuthRecord, findEmployeeByCode } = require("./auth.repository");
const { JWT_EXPIRY } = require("../../config/constants");

const buildPayload = (employee, centerCode, username) => ({
  recId:        employee.RECID,
  employeeCode: employee.EMPLOYEECODE,
  firstName:    employee.FIRSTNAME,
  lastName:     employee.LASTNAME,
  fullName:     `${employee.FIRSTNAME || ""} ${employee.LASTNAME || ""}`.trim(),
  nickname:     employee.NICKNAME     || "",
  username:     username              || employee.USERNAME,
  job:          employee.JOB         || "",
  centerCode:   centerCode           || employee.CENTERCODE,
  role:         employee.RNAME       || "Staff",
  roleCode:     employee.RCODE       || "",
  email:        employee.EMAIL       || "",
  mobilePhone:  employee.MOBILEPHONE || "",
  gender:       employee.GENDER      || "",
});

const login = async ({ username, password }) => {
  // 1. Validate credentials
  const authRecord = await findAuthRecord(username);
  if (!authRecord || authRecord.PASSWORD.trim() !== password.trim()) {
    throw new AppError("Invalid username or password", 401);
  }

  // 2. Fetch employee + role (primary clinic)
  const employee = await findEmployeeByCode(authRecord.EMPLOYEECODE);
  if (!employee) {
    throw new AppError("Employee account is inactive or not found", 401);
  }

  // 3. Build payload and sign token
  const payload = buildPayload(employee, employee.ACTIVECENTERCODE || employee.CENTERCODE, authRecord.USERNAME);
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });

  return { token, user: payload };
};

const switchClinic = async ({ employeeCode, centerCode }) => {
  // Fetch employee + role for the selected clinic
  const employee = await findEmployeeByCode(employeeCode, centerCode);
  if (!employee) throw new AppError("Employee not found", 404);

  // Build payload with new centerCode and its role
  const payload = buildPayload(employee, centerCode, employee.USERNAME);
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });

  return { token, user: payload };
};

module.exports = { login, switchClinic };