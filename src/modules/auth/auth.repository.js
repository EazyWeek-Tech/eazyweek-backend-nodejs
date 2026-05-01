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
  return result.recordset[0] || null;
};

const findEmployeeByCode = async (employeeCode, centerCode = null) => {
  const pool = getPool();

  let result;

  if (centerCode) {
    // Switch clinic — get role for specific center
    result = await pool
      .request()
      .input("EMPLOYEECODE", sql.VarChar, employeeCode)
      .input("CENTERCODE",   sql.VarChar, centerCode)
      .query(`
        SELECT TOP 1
          ce.RECID, ce.EMPLOYEECODE, ce.FIRSTNAME, ce.MIDDLENAME, ce.LASTNAME,
          ce.USERNAME, ce.JOB, ce.CENTERCODE, ce.NICKNAME,
          ce.EMAIL, ce.MOBILEPHONE, ce.GENDER, ce.Active,
          cer.CENTERCODE AS ACTIVECENTERCODE,
          cr.RCODE, cr.RNAME
        FROM CLINIC_EMPLOYEE ce
        LEFT JOIN CLINIC_EMPLOYEROLESMAPPING cer
          ON  cer.EMPLOYEECODE = ce.EMPLOYEECODE
          AND cer.CENTERCODE   = @CENTERCODE
          AND cer.Active       = 1
        LEFT JOIN CLINIC_ROLE cr
          ON  cr.RCODE  = cer.RCODE
          AND cr.Active = 1
        WHERE ce.EMPLOYEECODE = @EMPLOYEECODE
          AND ce.Active = 1
      `);
  } else {
    // Login — get role for primary clinic
    result = await pool
      .request()
      .input("EMPLOYEECODE", sql.VarChar, employeeCode)
      .query(`
        SELECT TOP 1
          ce.RECID, ce.EMPLOYEECODE, ce.FIRSTNAME, ce.MIDDLENAME, ce.LASTNAME,
          ce.USERNAME, ce.JOB, ce.CENTERCODE, ce.NICKNAME,
          ce.EMAIL, ce.MOBILEPHONE, ce.GENDER, ce.Active,
          cer.CENTERCODE AS ACTIVECENTERCODE,
          cr.RCODE, cr.RNAME
        FROM CLINIC_EMPLOYEE ce
        LEFT JOIN CLINIC_EMPLOYEROLESMAPPING cer
          ON  cer.EMPLOYEECODE   = ce.EMPLOYEECODE
          AND cer.PRIMARYCLINIC  = 1
          AND cer.Active         = 1
        LEFT JOIN CLINIC_ROLE cr
          ON  cr.RCODE  = cer.RCODE
          AND cr.Active = 1
        WHERE ce.EMPLOYEECODE = @EMPLOYEECODE
          AND ce.Active = 1
      `);
  }

  const emp = result.recordset[0] || null;

  // Debug — remove after confirming role works
  console.log("findEmployeeByCode result:", {
    employeeCode,
    centerCode,
    RCODE: emp?.RCODE,
    RNAME: emp?.RNAME,
    ACTIVECENTERCODE: emp?.ACTIVECENTERCODE,
  });

  return emp;
};

module.exports = { findAuthRecord, findEmployeeByCode };