const { sql, getPool } = require("../../config/db");

// ─── CLINICS ────────────────────────────────────────────────────────────────

const loadCenters = async () => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("CENTERCODE", sql.VarChar, "")
    .execute("SpLoadClinics");
  return result.recordset.map((r) => ({
    recId:    r.RECID,
    zone:     r.ZONE     || "",
    code:     r.CODE     || "",
    name:     r.NAME     || "",
    address:  r.ADDRRESS || "",
  }));
};

const insertClinic = async ({ zone, code, name, address }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("Zone",          sql.VarChar, zone    || "")
    .input("ClinicCode",    sql.VarChar, code)
    .input("ClinicName",    sql.VarChar, name)
    .input("ClinicAddress", sql.VarChar, address || "")
    .execute("SpCreateNewClinic");

  const rows = result.recordset;
  if (rows.length > 0 && parseInt(rows[0][Object.keys(rows[0])[0]]) === 1) {
    return { success: true, message: "Clinic created successfully" };
  }
  return { success: false, message: "Clinic code already exists" };
};

const removeClinic = async (code) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("CENTERCODE", sql.VarChar, code)
    .execute("SpRemoveClinic");

  const rows = result.recordset;
  if (rows.length > 0 && parseInt(rows[0][Object.keys(rows[0])[0]]) === 1) {
    return { success: true, message: "Clinic removed successfully" };
  }
  return { success: false, message: "Failed to remove clinic" };
};

// ─── DEPARTMENT ──────────────────────────────────────────────────────────────

const loadDepartments = async () => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("DCODE", sql.VarChar, "")
    .execute("SpLoadDepartment");
  return result.recordset.map((r) => ({
    code: r.Code || "",
    name: r.Name || "",
  }));
};

const insertDepartment = async ({ dCode, dName }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("DEPARTMENTCODE", sql.VarChar, dCode)
    .input("DEPARTMENTNAME", sql.VarChar, dName)
    .execute("SpCreateNewDepartment");

  const rows = result.recordset;
  if (rows.length > 0 && parseInt(rows[0][Object.keys(rows[0])[0]]) === 1) {
    return { success: true, message: "Department created successfully" };
  }
  return { success: false, message: "Department already exists" };
};

const removeDepartment = async (dCode) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("DEPARTMENTCODE", sql.VarChar, dCode)
    .execute("SpRemoveDepartment");

  const rows = result.recordset;
  if (rows.length > 0 && parseInt(rows[0][Object.keys(rows[0])[0]]) === 1) {
    return { success: true, message: "Department removed successfully" };
  }
  return { success: false, message: "Failed to remove department" };
};

// ─── COUNTRY / NATIONALITY ───────────────────────────────────────────────────

const loadCountries = async () => {
  const pool = getPool();
  const result = await pool.request().execute("SpLoadCountry");
  return result.recordset.map((r) => ({
    code: r.CCODE       || "",
    name: r.COUNTRYNAME || "",
  }));
};

const loadNationalities = async (country) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("country", sql.VarChar, country || "")
    .execute("SpLoadAllNationality");
  return result.recordset.map((r) => ({
    id:   r.NCODE || "",
    name: r.NAME  || "",
  }));
};

// ─── PRACTITIONERS ───────────────────────────────────────────────────────────

const loadAllPractitioners = async (centerCode) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("centerCode", sql.VarChar, centerCode)
    .execute("SpLoadAllPractioner");
  return result.recordset.map((r) => ({
    id:   r.PRACTITIONER || "",
    name: r.NAME         || "",
  }));
};

// ─── ROOMS ───────────────────────────────────────────────────────────────────

const loadRooms = async (centerCode) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("centerCode", sql.VarChar, centerCode)
    .execute("SpLoadAllRoom");
  return result.recordset.map((r) => ({
    id:        r.CCODE     || "",
    roomNo:    r.ROOMNO    || "",
    equipment: r.EQUIPMENT || "",
  }));
};

// ─── DOCTORS ─────────────────────────────────────────────────────────────────

const loadDoctorMapping = async (centerCode) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("TopClinicCode", sql.VarChar, centerCode)
    .input("EMPLOYEECODE",  sql.VarChar, "")
    .input("UserID",        sql.VarChar, "")
    .execute("SpLoadDoctors");
  return result.recordset.map((r) => ({
    employeeCode:     r["Employee Code"]    || "",
    firstName:        r["First Name"]       || "",
    lastName:         r["Last Name"]        || "",
    associatedClinic: r["Associated Clinic"]|| "",
  }));
};

module.exports = {
  loadCenters, insertClinic, removeClinic,
  loadDepartments, insertDepartment, removeDepartment,
  loadCountries, loadNationalities,
  loadAllPractitioners, loadRooms, loadDoctorMapping,
};