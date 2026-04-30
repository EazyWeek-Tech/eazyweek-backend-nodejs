const jwt = require("jsonwebtoken");
const { AppError } = require("../../middlewares/error.middleware");
const { findAuthRecord, findEmployeeByCode } = require("./auth.repository");
const { JWT_EXPIRY } = require("../../config/constants");

const login = async ({ username, password }) => {
  // 1. Find auth record
  const authRecord = await findAuthRecord(username);
  if (!authRecord || authRecord.PASSWORD !== password) {
    throw new AppError("Invalid username or password", 401);
  }

  // 2. Find employee details
  const employee = await findEmployeeByCode(authRecord.EMPLOYEECODE);
  if (!employee) {
    throw new AppError("Employee account is inactive or not found", 401);
  }

  // 3. Build token payload
  const payload = {
    recId: employee.RECID,
    employeeCode: employee.EMPLOYEECODE,
    firstName: employee.FIRSTNAME,
    lastName: employee.LASTNAME,
    fullName: `${employee.FIRSTNAME || ""} ${employee.LASTNAME || ""}`.trim(),
    nickname: employee.NICKNAME,
    username: authRecord.USERNAME,
    job: employee.JOB,
    centerCode: employee.CENTERCODE,
    role: employee.ROLE,
    email: employee.EMAIL,
    mobilePhone: employee.MOBILEPHONE,
    gender: employee.GENDER,
  };

  // 4. Sign JWT
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });

  return { token, user: payload };
};

module.exports = { login };
