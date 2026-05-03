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

const loadDoctorMapping = async (centerCode, employeeCode = "", userId = "") => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("TopClinicCode", sql.NVarChar, centerCode   || "")
    .input("EMPLOYEECODE",  sql.NVarChar, employeeCode || "")
    .input("UserID",        sql.NVarChar, userId       || "")
    .execute("SpLoadDoctors");

  return result.recordset.map((r) => ({
    employeeCode:     r["Employee Code"]     || "",
    firstName:        r["First Name"]        || "",
    lastName:         r["Last Name"]         || "",
    associatedClinic: r["Associated Clinic"] || "",
  }));
};

const insertDoctorMapping = async ({ employeeCode, firstName, lastName, associatedClinic }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("EMPLOYEE",         sql.NVarChar, employeeCode)
    .input("FIRSTNAME",        sql.NVarChar, firstName    || "")
    .input("LASTNAME",         sql.NVarChar, lastName     || "")
    .input("ASSOCIATEDCLINIC", sql.NVarChar, associatedClinic)
    .execute("SpCreateNewDoctor");

  const rows = result.recordset;
  const val  = rows.length > 0 ? parseInt(Object.values(rows[0])[0]) : 0;
  if (val === 1) return { success: true,  message: "Practitioner added successfully" };
  return              { success: false, message: "Practitioner already exists for this clinic" };
};

const removeDoctorMapping = async (employeeCode) => {
  const pool = getPool();
  await pool
    .request()
    .input("EMPLOYEECODE", sql.NVarChar, employeeCode)
    .execute("SpRemoveDoctor");

  return { success: true, message: "Practitioner removed successfully" };
};
module.exports = {
  loadCenters, insertClinic, removeClinic,
  loadDepartments, insertDepartment, removeDepartment,
  loadCountries, loadNationalities,
  loadAllPractitioners, loadRooms, loadDoctorMapping,insertDoctorMapping, removeDoctorMapping,
};