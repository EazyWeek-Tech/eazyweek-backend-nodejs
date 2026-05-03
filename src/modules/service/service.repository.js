const { sql, getPool } = require("../../config/db");

// ─── LIST ─────────────────────────────────────────────────────────────────────
const loadServiceList = async (centerCode) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("CENTERCODE", sql.NVarChar, centerCode || "")
    .input("Employee",   sql.NVarChar, "")
    .execute("SpLoadServiceList");
  return result.recordset;
};

// ─── DETAILS ──────────────────────────────────────────────────────────────────
const loadServiceDetails = async (serviceCode, recId, centerCode) => {
  const pool = getPool();

  // 1. General
  const dtGeneral = await pool
    .request()
    .input("SERVICECODE",  sql.NVarChar, serviceCode)
    .input("SERVICERECID", sql.Int,      recId)
    .input("CENTERCODE",   sql.NVarChar, centerCode)
    .input("ReferenceID",  sql.NVarChar, "General")
    .execute("SpLoadServiceDetails");

  const g = dtGeneral.recordset[0] || {};

  // 2. BOM
  const dtBOM = await pool
    .request()
    .input("SERVICECODE", sql.NVarChar, serviceCode)
    .execute("SpLoadServiceBOM");

  // 3. Price — query directly by SERVICECODE (SpLoadServicePrice uses SERVICERECID
  //    which is an internal FK and unreliable from the list row)
  const dtPrice = await pool
    .request()
    .input("SERVICECODE", sql.NVarChar, serviceCode)
    .query(`
      SELECT
        p.CENTERCODE,
        cc.CNAME       AS CNAME,
        p.PRICE,
        p.TAXINCLUDED,
        p.TAXPERCENT,
        p.STORERELEASE
      FROM CLINIC_SERVICE_PRICE p
      LEFT JOIN CLINIC_CENTERS cc ON cc.CENTERCODE = p.CENTERCODE
      WHERE p.SERVICECODE = @SERVICECODE
        AND p.Active = 1
      ORDER BY p.CENTERCODE
    `);

  // 4. Doctors/Nurses
  const dtDoc = await pool
    .request()
    .input("SERVICECODE", sql.NVarChar, serviceCode)
    .input("ReferenceID", sql.NVarChar, "All")
    .execute("SpLoadServiceDoc");

  return { general: g, bom: dtBOM.recordset, price: dtPrice.recordset, practitioners: dtDoc.recordset };
};

// ─── GENERAL ──────────────────────────────────────────────────────────────────
const insertServiceGeneral = async (data, centerCode, createdBy) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("SERVICECODE",         sql.NVarChar, data.serviceCode)
    .input("SERVICENAME",         sql.NVarChar, data.serviceName)
    .input("ArabicName",          sql.NVarChar, data.serviceArabicName   || "")
    .input("SERVICEDES",          sql.NVarChar, data.serviceDesc          || "")
    .input("SERVICECCODE",        sql.NVarChar, data.serviceCategoryCode  || "")
    .input("SERVICECSCODE",       sql.NVarChar, data.serviceSubCategoryCode || "")
    .input("SERVICECSSCODE",      sql.NVarChar, data.serviceSubSubCategoryCode || "")
    .input("SERVICEINTIME",       sql.NVarChar, data.serviceTime          || "")
    .input("ALLOWIDEALBOMCONSUMPTION",                    sql.NVarChar, data.allowIdealBOMConsumption || "No")
    .input("ALLOWIDEALBOMCONSUMPTIONWITHINTERVENTION",    sql.NVarChar, data.allowIdealBOMConsumptionWithIntervention || "No")
    .input("ALLOWLOYALITYACCRUAL",    sql.NVarChar, data.allowLoyalityAccurul    || "No")
    .input("ALLOWLOYALITYREDEMPTION", sql.NVarChar, data.allowLoyalityRedemption || "No")
    .input("ADDITIONALFIELD1",    sql.NVarChar, data.additionalField1 || "")
    .input("ADDITIONALFIELD2",    sql.NVarChar, data.additionalField2 || "")
    .input("ADDITIONALFIELD3",    sql.NVarChar, data.additionalField3 || "")
    .input("ADDITIONALFIELD4",    sql.NVarChar, data.additionalField4 || "")
    .input("ADDITIONALFIELD5",    sql.NVarChar, data.additionalField5 || "")
    .input("ISDRAFT",             sql.Int,      data.isDraft ?? 1)
    .input("CENTERCODE",          sql.NVarChar, centerCode)
    .input("CREATEDBY",           sql.NVarChar, createdBy)
    .execute("SpInsertServiceGeneral");

  const row = result.recordset[0] || {};
  return {
    status:       row[Object.keys(row)[0]] || "Success",
    serviceRecID: row[Object.keys(row)[1]] || 0,
    message:      "Service general saved successfully",
  };
};

// ─── PRICING ──────────────────────────────────────────────────────────────────
const insertServicePrice = async (data, centerCode, createdBy) => {
  const pool = getPool();

  if (!data.priceLines || data.priceLines.length === 0) return;

  // Build XML exactly as .NET does
  let xml = "<ServicePriceTableXML>";
  for (const line of data.priceLines) {
    xml += "<ServicePriceTableXMLs>";
    xml += `<SERVICECODE>${data.serviceCode}</SERVICECODE>`;
    xml += `<CENTERCODE>${line.centerCode || centerCode}</CENTERCODE>`;
    xml += `<PRICE>${parseFloat(line.price || 0)}</PRICE>`;
    xml += `<TAXINCLUDED>${line.taxIncluded || ""}</TAXINCLUDED>`;
    xml += `<TAXPERCENT>${parseFloat(line.taxPercentage || 0)}</TAXPERCENT>`;
    xml += `<SERVICERECID>${parseInt(line.serviceRecID || 0)}</SERVICERECID>`;
    xml += `<CREATEDBY>${createdBy}</CREATEDBY>`;
    xml += `<STORERELEASE>${line.storeRelease || "No"}</STORERELEASE>`;
    xml += "</ServicePriceTableXMLs>";
  }
  xml += "</ServicePriceTableXML>";

  await pool
    .request()
    .input("SERVICECODE",          sql.NVarChar, data.serviceCode)
    .input("CENTERCODES",          sql.NVarChar, centerCode)
    .input("ProductPriceTableXML", sql.NVarChar, xml)
    .input("ISDRAFT",              sql.Int,      data.isDraft ?? 1)
    .execute("SpInsertServicePrice");
};

// ─── BOM ──────────────────────────────────────────────────────────────────────
const insertServiceBOM = async (serviceCode, productCode) => {
  const pool = getPool();
  await pool
    .request()
    .input("SERVICECODE",    sql.NVarChar, serviceCode)
    .input("CONSUMABLECODE", sql.NVarChar, productCode)
    .execute("SpInsertServiceBOM");
};

// ─── PRACTITIONER ─────────────────────────────────────────────────────────────
const insertServicePractitioner = async (data) => {
  const pool = getPool();
  await pool
    .request()
    .input("SERVICECODE",   sql.NVarChar, data.serviceCode)
    .input("DoctorCode",    sql.NVarChar, data.doctorCode)
    .input("ClinicCode",    sql.NVarChar, data.clinicCode)
    .input("CustomerType",  sql.NVarChar, data.practionerType)
    .execute("SpInsertServiceDoc");
};

// ─── FORMS ────────────────────────────────────────────────────────────────────
const insertServiceForms = async (data, centerCode, createdBy) => {
  const pool = getPool();
  await pool
    .request()
    .input("SERVICECODE",             sql.NVarChar, data.serviceCode)
    .input("FORMSTAGEFORCOMPLETION",  sql.NVarChar, data.formStageForCompletion || "")
    .input("FORMBLOCKIFNOTFILLED",    sql.NVarChar, data.formBlockIfNotFilled   || "Yes")
    .input("FORM",                    sql.NVarChar, data.form                   || "")
    .input("FIELD1",                  sql.NVarChar, data.field1                 || "")
    .input("FIELD2",                  sql.NVarChar, data.field2                 || "")
    .input("FIELD3",                  sql.NVarChar, data.field3                 || "")
    .input("FIELD4",                  sql.NVarChar, data.field4                 || "")
    .input("FIELD5",                  sql.NVarChar, data.field5                 || "")
    .input("CENTERCODE",              sql.NVarChar, centerCode)
    .input("CREATEDBY",               sql.NVarChar, createdBy)
    .input("ISDRAFT",                 sql.Int,      data.isDraft ?? 1)
    .execute("SpInsertServiceForms");
};

// ─── SEARCH CONSUMABLES ───────────────────────────────────────────────────────
const searchConsumables = async (searchValue) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("ProductName", sql.NVarChar, searchValue || "")
    .execute("SpSearchProductList");
  return result.recordset;
};

// ─── SERVICE CATEGORIES ───────────────────────────────────────────────────────
const loadServiceCategory = async () => {
  const pool = getPool();
  const result = await pool.request().execute("SpLoadServiceCategorytoddl");
  return result.recordset;
};

const loadServiceSubCategory = async (categoryCode) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("CCODE", sql.NVarChar, categoryCode)
    .execute("SpLoadServiceSubCategorytoddl");
  return result.recordset;
};

const loadServiceSubSubCategory = async (categoryCode, subCategoryCode) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("CCODE",  sql.NVarChar, categoryCode)
    .input("CSCODE", sql.NVarChar, subCategoryCode)
    .execute("SpLoadServiceSubSubCategorytoddl");
  return result.recordset;
};



// ─── PRACTITIONER LOOKUP ───────────────────────────────────────────────────────

// Load all active practitioners for a clinic from CLINIC_DOCTORS
// Joins CLINIC_EMPLOYEE for names (CLINIC_DOCTORS.EMPLOYEE = CLINIC_EMPLOYEE.EMPLOYEECODE)
const loadPractitionersByClinic = async (centerCode) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("CENTERCODE", sql.NVarChar, centerCode)
    .query(`
      SELECT
        d.RECID,
        d.EMPLOYEE                               AS practitionerCode,
        e.FIRSTNAME                              AS firstName,
        e.LASTNAME                               AS lastName,
        LTRIM(RTRIM(ISNULL(e.FIRSTNAME,'') + ' ' + ISNULL(e.LASTNAME,''))) AS fullName,
        d.ASSOCIATEDCLINIC                       AS centerCode,
        cc.CNAME                                 AS clinicName
      FROM CLINIC_DOCTORS d
      LEFT JOIN CLINIC_EMPLOYEE e
        ON e.EMPLOYEECODE = d.EMPLOYEE
      LEFT JOIN CLINIC_CENTERS cc
        ON cc.CENTERCODE = d.ASSOCIATEDCLINIC
      WHERE d.ASSOCIATEDCLINIC = @CENTERCODE
        AND d.Active = 1
        AND d.EMPLOYEE IS NOT NULL
        AND d.EMPLOYEE <> ''
      ORDER BY e.FIRSTNAME
    `);
  return result.recordset;
};

// Load existing practitioner mappings for a service
// Joins CLINIC_EMPLOYEE for names (PRACTITIONER = EMPLOYEECODE)
const loadServicePractitionerMapping = async (serviceCode) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("SERVICECODE", sql.NVarChar, serviceCode)
    .query(`
      SELECT
        spm.RECID,
        spm.SERVICECODE,
        spm.SERVICECODE                          AS serviceCode,
        spm.CENTERCODE                           AS centerCode,
        spm.PRACTITIONER                         AS practitionerCode,
        spm.PRACTITIONERTYPE                     AS practitionerType,
        e.FIRSTNAME                              AS firstName,
        e.LASTNAME                               AS lastName,
        LTRIM(RTRIM(ISNULL(e.FIRSTNAME,'') + ' ' + ISNULL(e.LASTNAME,''))) AS fullName,
        cc.CNAME                                 AS clinicName
      FROM CLINIC_SERVICE_PRACTITIONERMAPPING spm
      LEFT JOIN CLINIC_EMPLOYEE e
        ON e.EMPLOYEECODE = spm.PRACTITIONER
      LEFT JOIN CLINIC_CENTERS cc
        ON cc.CENTERCODE = spm.CENTERCODE
      WHERE spm.SERVICECODE = @SERVICECODE
        AND spm.Active = 1
        AND spm.PRACTITIONER IS NOT NULL
        AND spm.PRACTITIONER <> ''
      ORDER BY spm.PRACTITIONERTYPE, e.FIRSTNAME
    `);
  return result.recordset;
};

module.exports = {
  loadServiceList,
  loadServiceDetails,
  insertServiceGeneral,
  insertServicePrice,
  insertServiceBOM,
  insertServicePractitioner,
  insertServiceForms,
  searchConsumables,
  loadServiceCategory,
  loadServiceSubCategory,
  loadServiceSubSubCategory,
  loadPractitionersByClinic,
  loadServicePractitionerMapping,
};