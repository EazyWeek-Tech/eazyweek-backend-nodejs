const { sql, getPool } = require("../../config/db");

const EMPLOYEE_SELECT = `
  RECID, EMPLOYEECODE, FIRSTNAME, MIDDLENAME, LASTNAME,
  USERNAME, JOB, CENTERCODE, ROLE, NICKNAME,
  EMAIL, MOBILEPHONE, HOMEPHONE, WORKPHONE,
  GENDER, BIRTHDAY, ANNIVERSARY, CITY, COUNTRY,
  Active, CREATEDDATE, EMPIMAGENAME
`;

/**
 * Uses stored proc SpLoadEmployetoddl — matches .NET exactly
 * Returns: RECID, NAME, CODE, MOBILEPHONE, EMAIL
 */
const findAllForDropdown = async (centerCode) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("CENTERCODE", sql.VarChar, centerCode)
    .execute("SpLoadEmployetoddl");
  return result.recordset;
};

/**
 * Full employee list with pagination + search
 */
const findAll = async ({ centerCode, search, offset, limit }) => {
  const pool = getPool();
  const request = pool.request()
    .input("OFFSET", sql.Int, offset)
    .input("LIMIT", sql.Int, limit);

  let whereClause = "WHERE e.Active = 1";

  if (centerCode) {
    request.input("CENTERCODE", sql.VarChar, centerCode);
    whereClause += " AND e.CENTERCODE = @CENTERCODE";
  }
  if (search) {
    request.input("SEARCH", sql.VarChar, `%${search}%`);
    whereClause += ` AND (
      e.FIRSTNAME LIKE @SEARCH OR
      e.LASTNAME  LIKE @SEARCH OR
      e.EMAIL     LIKE @SEARCH OR
      e.EMPLOYEECODE LIKE @SEARCH OR
      e.MOBILEPHONE  LIKE @SEARCH
    )`;
  }

  const result = await request.query(`
    SELECT ${EMPLOYEE_SELECT}, COUNT(*) OVER() AS TotalCount
    FROM CLINIC_EMPLOYEE e
    ${whereClause}
    ORDER BY e.FIRSTNAME, e.LASTNAME
    OFFSET @OFFSET ROWS FETCH NEXT @LIMIT ROWS ONLY
  `);

  const total = result.recordset[0]?.TotalCount || 0;
  const data = result.recordset.map(({ TotalCount, ...row }) => row);
  return { data, total };
};

const findById = async (id) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("RECID", sql.Int, id)
    .query(`SELECT ${EMPLOYEE_SELECT} FROM CLINIC_EMPLOYEE WHERE RECID = @RECID`);
  return result.recordset[0] || null;
};

const findByEmployeeCode = async (employeeCode) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("EMPLOYEECODE", sql.VarChar, employeeCode)
    .query(`SELECT RECID, EMPLOYEECODE, FIRSTNAME, LASTNAME, Active FROM CLINIC_EMPLOYEE WHERE EMPLOYEECODE = @EMPLOYEECODE`);
  return result.recordset[0] || null;
};

const create = async (data) => {
  const pool = getPool();

  // Empty string fallback for NOT NULL varchar columns
  const str = (val) => val ?? "";

  const {
    EMPLOYEECODE, FIRSTNAME, MIDDLENAME, LASTNAME, USERNAME,
    JOB, CENTERCODE, ROLE, NICKNAME, EMAIL,
    MOBILEPHONE, HOMEPHONE, WORKPHONE, GENDER,
    BIRTHDAY, ANNIVERSARY, CITY, COUNTRY, CREATEDBY,
  } = data;

  const parseDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  await pool.request()
    .input("EMPLOYEECODE",  sql.VarChar,  str(EMPLOYEECODE))
    .input("FIRSTNAME",     sql.VarChar,  str(FIRSTNAME))
    .input("MIDDLENAME",    sql.VarChar,  str(MIDDLENAME))
    .input("LASTNAME",      sql.VarChar,  str(LASTNAME))
    .input("USERNAME",      sql.VarChar,  str(USERNAME))
    .input("JOB",           sql.VarChar,  str(JOB))
    .input("CENTERCODE",    sql.VarChar,  str(CENTERCODE))
    .input("ROLE",          sql.VarChar,  str(ROLE))
    .input("NICKNAME",      sql.VarChar,  str(NICKNAME))
    .input("EMAIL",         sql.VarChar,  str(EMAIL))
    .input("MOBILEPHONE",   sql.VarChar,  str(MOBILEPHONE))
    .input("HOMEPHONE",     sql.VarChar,  str(HOMEPHONE))
    .input("WORKPHONE",     sql.VarChar,  str(WORKPHONE))
    .input("GENDER",        sql.VarChar,  str(GENDER))
    .input("BIRTHDAY",      sql.DateTime, parseDate(BIRTHDAY))
    .input("ANNIVERSARY",   sql.DateTime, parseDate(ANNIVERSARY))
    .input("CITY",          sql.VarChar,  str(CITY))
    .input("COUNTRY",       sql.VarChar,  str(COUNTRY))
    .input("CREATEDBY",     sql.VarChar,  str(CREATEDBY))
    .query(`
      INSERT INTO CLINIC_EMPLOYEE
      (EMPLOYEECODE, FIRSTNAME, MIDDLENAME, LASTNAME, USERNAME,
       JOB, CENTERCODE, ROLE, NICKNAME, EMAIL,
       MOBILEPHONE, HOMEPHONE, WORKPHONE, GENDER,
       BIRTHDAY, ANNIVERSARY, CITY, COUNTRY,
       Active, CREATEDDATE, CREATEDBY)
      VALUES
      (@EMPLOYEECODE, @FIRSTNAME, @MIDDLENAME, @LASTNAME, @USERNAME,
       @JOB, @CENTERCODE, @ROLE, @NICKNAME, @EMAIL,
       @MOBILEPHONE, @HOMEPHONE, @WORKPHONE, @GENDER,
       @BIRTHDAY, @ANNIVERSARY, @CITY, @COUNTRY,
       1, GETDATE(), @CREATEDBY)
    `);
};

const update = async (id, data) => {
  const pool = getPool();

  const parseDate = (val) => {
  if (!val) return new Date("1900-01-01");
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date("1900-01-01") : d;
};

  // Helper — empty string fallback for NOT NULL varchar columns
  const str = (val) => val ?? "";

  const {
    FIRSTNAME, MIDDLENAME, LASTNAME, JOB, CENTERCODE,
    NICKNAME, EMAIL, MOBILEPHONE, HOMEPHONE,
    WORKPHONE, GENDER, BIRTHDAY, ANNIVERSARY, CITY, COUNTRY,
  } = data;

  await pool.request()
    .input("RECID",       sql.Int,      id)
    .input("FIRSTNAME",   sql.VarChar,  str(FIRSTNAME))
    .input("MIDDLENAME",  sql.VarChar,  str(MIDDLENAME))
    .input("LASTNAME",    sql.VarChar,  str(LASTNAME))
    .input("JOB",         sql.VarChar,  str(JOB))
    .input("CENTERCODE",  sql.VarChar,  str(CENTERCODE))
    .input("NICKNAME",    sql.VarChar,  str(NICKNAME))
    .input("EMAIL",       sql.VarChar,  str(EMAIL))
    .input("MOBILEPHONE", sql.VarChar,  str(MOBILEPHONE))
    .input("HOMEPHONE",   sql.VarChar,  str(HOMEPHONE))
    .input("WORKPHONE",   sql.VarChar,  str(WORKPHONE))
    .input("GENDER",      sql.VarChar,  str(GENDER))
    .input("BIRTHDAY",    sql.DateTime, parseDate(BIRTHDAY))
    .input("ANNIVERSARY", sql.DateTime, parseDate(ANNIVERSARY))
    .input("CITY",        sql.VarChar,  str(CITY))
    .input("COUNTRY",     sql.VarChar,  str(COUNTRY))
    .query(`
      UPDATE CLINIC_EMPLOYEE SET
        FIRSTNAME   = @FIRSTNAME,   MIDDLENAME  = @MIDDLENAME,
        LASTNAME    = @LASTNAME,    JOB         = @JOB,
        CENTERCODE  = @CENTERCODE,  NICKNAME    = @NICKNAME,
        EMAIL       = @EMAIL,       MOBILEPHONE = @MOBILEPHONE,
        HOMEPHONE   = @HOMEPHONE,   WORKPHONE   = @WORKPHONE,
        GENDER      = @GENDER,      BIRTHDAY    = @BIRTHDAY,
        ANNIVERSARY = @ANNIVERSARY, CITY        = @CITY,
        COUNTRY     = @COUNTRY
      WHERE RECID = @RECID
    `);
};
/**
 * Deactivate employee — sets Active = 0 in CLINIC_EMPLOYEE
 * and deactivates CLINIC_AUTHENTICATION too
 */
const deactivate = async (employeeCode) => {
  const pool = getPool();
  const transaction = pool.transaction();
  await transaction.begin();
  try {
    await transaction.request()
      .input("EMPLOYEECODE", sql.VarChar, employeeCode)
      .query(`UPDATE CLINIC_EMPLOYEE SET Active = 0 WHERE EMPLOYEECODE = @EMPLOYEECODE`);

    await transaction.request()
      .input("EMPLOYEECODE", sql.VarChar, employeeCode)
      .query(`UPDATE CLINIC_AUTHENTICATION SET Active = 0, MODIFIEDDATE = GETDATE() WHERE EMPLOYEECODE = @EMPLOYEECODE`);

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/**
 * Reset password — updates both CLINIC_EMPLOYEE and CLINIC_AUTHENTICATION
 * Matches .NET ResetPasswordAsync exactly
 */
const resetPassword = async (employeeCode, newPassword) => {
  const pool = getPool();
  const transaction = pool.transaction();
  await transaction.begin();
  try {
    const empResult = await transaction.request()
      .input("EMPLOYEECODE", sql.VarChar, employeeCode)
      .input("PASSWORD",     sql.VarChar, newPassword)
      .query(`UPDATE CLINIC_EMPLOYEE SET [PASSWORD] = @PASSWORD WHERE EMPLOYEECODE = @EMPLOYEECODE`);

    if (empResult.rowsAffected[0] === 0) {
      await transaction.rollback();
      return false;
    }

    await transaction.request()
      .input("EMPLOYEECODE", sql.VarChar, employeeCode)
      .input("PASSWORD",     sql.VarChar, newPassword)
      .query(`
        UPDATE CLINIC_AUTHENTICATION
        SET PASSWORD = @PASSWORD, MODIFIEDDATE = GETDATE()
        WHERE EMPLOYEECODE = @EMPLOYEECODE AND Active = 1
      `);

    await transaction.commit();
    return true;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/**
 * Mark first login as done — sets a flag so modal doesn't show again
 */
const markFirstLoginDone = async (employeeCode) => {
  const pool = getPool();
  await pool.request()
    .input("EMPLOYEECODE", sql.VarChar, employeeCode)
    .query(`
      UPDATE CLINIC_AUTHENTICATION
      SET MODIFIEDDATE = GETDATE()
      WHERE EMPLOYEECODE = @EMPLOYEECODE AND Active = 1
    `);
};

/**
 * Check if this is a first login —
 * If CREATEDDATE and MODIFIEDDATE are the same (or MODIFIEDDATE is null), it's first login
 */
const isFirstLogin = async (employeeCode) => {
  const pool = getPool();
  const result = await pool.request()
    .input("EMPLOYEECODE", sql.VarChar, employeeCode)
    .query(`
      SELECT
        CASE
          WHEN MODIFIEDDATE IS NULL THEN 1
          WHEN DATEDIFF(SECOND, CREATEDDATE, MODIFIEDDATE) < 5 THEN 1
          ELSE 0
        END AS IsFirstLogin
      FROM CLINIC_AUTHENTICATION
      WHERE EMPLOYEECODE = @EMPLOYEECODE AND Active = 1
    `);
  return result.recordset[0]?.IsFirstLogin === 1;
};
const getRoleMapping = async (employeeCode) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("EMPLOYEECODE", sql.VarChar, employeeCode)
    .query(`
      SELECT 
        cer.RECID, cer.EMPLOYEECODE, cer.RCODE, cer.CENTERCODE, 
        cer.PRIMARYCLINIC, cer.Active,
        cr.RNAME
      FROM CLINIC_EMPLOYEROLESMAPPING cer
      LEFT JOIN CLINIC_ROLE cr ON cer.RCODE = cr.RCODE AND cr.Active = 1
      WHERE cer.EMPLOYEECODE = @EMPLOYEECODE AND cer.Active = 1
      ORDER BY cer.PRIMARYCLINIC DESC
    `);
  return result.recordset;
};
 
const removeRoleMapping = async (recId) => {
  const pool = getPool();
  await pool
    .request()
    .input("RECID", sql.Int, recId)
    .query(`UPDATE CLINIC_EMPLOYEROLESMAPPING SET Active = 0 WHERE RECID = @RECID`);
};
 
const getAllRoles = async () => {
  const pool = getPool();
  const result = await pool
    .request()
    .query(`SELECT RCODE, RNAME FROM CLINIC_ROLE WHERE Active = 1 ORDER BY RNAME`);
  return result.recordset;
};


const insertRoleMapping = async ({ employeeCode, centerCode, rCode, primaryClinic, createdBy }) => {
  const pool = getPool();
 
  // If setting as primary, first unset existing primary
  if (primaryClinic === 1) {
    await pool.request()
      .input("EMPLOYEECODE", sql.VarChar, employeeCode)
      .query(`
        UPDATE CLINIC_EMPLOYEROLESMAPPING 
        SET PRIMARYCLINIC = 0 
        WHERE EMPLOYEECODE = @EMPLOYEECODE AND Active = 1
      `);
  }
 
  await pool.request()
    .input("EMPLOYEECODE",  sql.VarChar, employeeCode)
    .input("RCODE",         sql.VarChar, rCode)
    .input("CENTERCODE",    sql.VarChar, centerCode)
    .input("PRIMARYCLINIC", sql.Int,     primaryClinic || 0)
    .input("CREATEDBY",     sql.VarChar, createdBy || "")
    .query(`
      INSERT INTO CLINIC_EMPLOYEROLESMAPPING
      (EMPLOYEECODE, RCODE, CENTERCODE, PRIMARYCLINIC, Active, CREATEDDATE, CREATEDBY)
      VALUES
      (@EMPLOYEECODE, @RCODE, @CENTERCODE, @PRIMARYCLINIC, 1, GETDATE(), @CREATEDBY)
    `);
};

module.exports = {
  findAllForDropdown, findAll, findById, findByEmployeeCode,
  create, update, deactivate, resetPassword, markFirstLoginDone, isFirstLogin,
  getRoleMapping, removeRoleMapping, getAllRoles,insertRoleMapping
};