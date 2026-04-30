const { sql, getPool } = require("../../config/db");

const findAuthRecord = async (username) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("USERNAME", sql.VarChar, username)
    .query(`
      SELECT RECID, EMPLOYEECODE, USERNAME, PASSWORD
      FROM CLINIC_AUTHENTICATION
      WHERE USERNAME = @USERNAME AND Active = 1
    `);
  return result.recordset[0] || null;
};

const findEmployeeByCode = async (employeeCode) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("EMPLOYEECODE", sql.VarChar, employeeCode)
    .query(`
      SELECT
        RECID, EMPLOYEECODE, FIRSTNAME, MIDDLENAME, LASTNAME,
        USERNAME, JOB, CENTERCODE, ROLE, NICKNAME,
        EMAIL, MOBILEPHONE, GENDER, Active
      FROM CLINIC_EMPLOYEE
      WHERE EMPLOYEECODE = @EMPLOYEECODE AND Active = 1
    `);
  return result.recordset[0] || null;
};

module.exports = { findAuthRecord, findEmployeeByCode };
