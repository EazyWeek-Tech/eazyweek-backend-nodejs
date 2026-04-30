const { sql, getPool } = require("../../config/db");

const EMPLOYEE_SELECT = `
  RECID, EMPLOYEECODE, FIRSTNAME, MIDDLENAME, LASTNAME,
  USERNAME, JOB, CENTERCODE, ROLE, NICKNAME,
  EMAIL, MOBILEPHONE, HOMEPHONE, WORKPHONE,
  GENDER, BIRTHDAY, ANNIVERSARY, CITY, COUNTRY,
  Active, CREATEDDATE
`;

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
    whereClause += " AND (e.FIRSTNAME LIKE @SEARCH OR e.LASTNAME LIKE @SEARCH OR e.EMAIL LIKE @SEARCH)";
  }

  const result = await request.query(`
    SELECT ${EMPLOYEE_SELECT}, COUNT(*) OVER() AS TotalCount
    FROM CLINIC_EMPLOYEE e
    ${whereClause}
    ORDER BY e.FIRSTNAME
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
    .query(`SELECT RECID FROM CLINIC_EMPLOYEE WHERE EMPLOYEECODE = @EMPLOYEECODE`);
  return result.recordset[0] || null;
};

const create = async (data) => {
  const pool = getPool();
  const {
    EMPLOYEECODE, FIRSTNAME, MIDDLENAME, LASTNAME, USERNAME,
    JOB, CENTERCODE, ROLE, NICKNAME, EMAIL,
    MOBILEPHONE, HOMEPHONE, WORKPHONE, GENDER,
    BIRTHDAY, ANNIVERSARY, CITY, COUNTRY, CREATEDBY,
  } = data;

  await pool.request()
    .input("EMPLOYEECODE", sql.VarChar, EMPLOYEECODE)
    .input("FIRSTNAME", sql.VarChar, FIRSTNAME)
    .input("MIDDLENAME", sql.VarChar, MIDDLENAME || null)
    .input("LASTNAME", sql.VarChar, LASTNAME || null)
    .input("USERNAME", sql.VarChar, USERNAME)
    .input("JOB", sql.VarChar, JOB || null)
    .input("CENTERCODE", sql.VarChar, CENTERCODE)
    .input("ROLE", sql.VarChar, ROLE || null)
    .input("NICKNAME", sql.VarChar, NICKNAME || null)
    .input("EMAIL", sql.VarChar, EMAIL || null)
    .input("MOBILEPHONE", sql.VarChar, MOBILEPHONE || null)
    .input("HOMEPHONE", sql.VarChar, HOMEPHONE || null)
    .input("WORKPHONE", sql.VarChar, WORKPHONE || null)
    .input("GENDER", sql.VarChar, GENDER || null)
    .input("BIRTHDAY", sql.DateTime, BIRTHDAY || null)
    .input("ANNIVERSARY", sql.DateTime, ANNIVERSARY || null)
    .input("CITY", sql.VarChar, CITY || null)
    .input("COUNTRY", sql.VarChar, COUNTRY || null)
    .input("CREATEDBY", sql.VarChar, CREATEDBY || null)
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
  const {
    FIRSTNAME, MIDDLENAME, LASTNAME, JOB, CENTERCODE,
    ROLE, NICKNAME, EMAIL, MOBILEPHONE, HOMEPHONE,
    WORKPHONE, GENDER, BIRTHDAY, ANNIVERSARY, CITY, COUNTRY,
  } = data;

  await pool.request()
    .input("RECID", sql.Int, id)
    .input("FIRSTNAME", sql.VarChar, FIRSTNAME)
    .input("MIDDLENAME", sql.VarChar, MIDDLENAME || null)
    .input("LASTNAME", sql.VarChar, LASTNAME || null)
    .input("JOB", sql.VarChar, JOB || null)
    .input("CENTERCODE", sql.VarChar, CENTERCODE)
    .input("ROLE", sql.VarChar, ROLE || null)
    .input("NICKNAME", sql.VarChar, NICKNAME || null)
    .input("EMAIL", sql.VarChar, EMAIL || null)
    .input("MOBILEPHONE", sql.VarChar, MOBILEPHONE || null)
    .input("HOMEPHONE", sql.VarChar, HOMEPHONE || null)
    .input("WORKPHONE", sql.VarChar, WORKPHONE || null)
    .input("GENDER", sql.VarChar, GENDER || null)
    .input("BIRTHDAY", sql.DateTime, BIRTHDAY || null)
    .input("ANNIVERSARY", sql.DateTime, ANNIVERSARY || null)
    .input("CITY", sql.VarChar, CITY || null)
    .input("COUNTRY", sql.VarChar, COUNTRY || null)
    .query(`
      UPDATE CLINIC_EMPLOYEE SET
        FIRSTNAME = @FIRSTNAME, MIDDLENAME = @MIDDLENAME, LASTNAME = @LASTNAME,
        JOB = @JOB, CENTERCODE = @CENTERCODE, ROLE = @ROLE, NICKNAME = @NICKNAME,
        EMAIL = @EMAIL, MOBILEPHONE = @MOBILEPHONE, HOMEPHONE = @HOMEPHONE,
        WORKPHONE = @WORKPHONE, GENDER = @GENDER, BIRTHDAY = @BIRTHDAY,
        ANNIVERSARY = @ANNIVERSARY, CITY = @CITY, COUNTRY = @COUNTRY
      WHERE RECID = @RECID
    `);
};

const deactivate = async (id) => {
  const pool = getPool();
  await pool.request()
    .input("RECID", sql.Int, id)
    .query(`UPDATE CLINIC_EMPLOYEE SET Active = 0 WHERE RECID = @RECID`);
};

module.exports = { findAll, findById, findByEmployeeCode, create, update, deactivate };
