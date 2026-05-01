const { sql, getPool } = require("../../config/db");

const findAuthRecord = async (login) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("LOGIN", sql.VarChar, login)
    .query(`
      SELECT TOP 1 RECID, EMPLOYEECODE, USERNAME, PASSWORD
      FROM CLINIC_AUTHENTICATION
      WHERE LOWER(USERNAME) = LOWER(@LOGIN)
      AND Active = 1
      ORDER BY RECID DESC
    `);
  
  console.log("Auth record found:", result.recordset);
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
