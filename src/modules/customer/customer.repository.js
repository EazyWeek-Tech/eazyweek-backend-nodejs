const { sql, getPool } = require("../../config/db");

// ── Helpers ───────────────────────────────────────────────────────────────────
const safeStr  = (v) => (v === null || v === undefined ? "" : String(v));
const safeInt  = (v) => (v === null || v === undefined ? 0  : parseInt(v) || 0);
const safeBool = (v) => v !== null && v !== undefined && v !== false && parseInt(v) !== 0;
const safeDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d.getTime()) || d.getFullYear() <= 1900) return null;
  return d;
};

// ─── LOAD CUSTOMER LIST ────────────────────────────────────────────────────────
// Mirrors: LoadCustomerListAsync → SpLoadCustomerList
const loadCustomerList = async (centerCode) => {
  const pool   = getPool();
  const result = await pool
    .request()
    .input("centerCode", sql.NVarChar, centerCode)
    .execute("SpLoadCustomerList");

  return result.recordset.map((r) => ({
    recId:             safeInt(r.RECID),
    custId:            safeStr(r.CUSTID),
    firstName:         safeStr(r.FIRST_NAME),
    lastName:          safeStr(r.LAST_NAME),
    mobile:            safeStr(r.NUMBER),
    lastVisit:         safeStr(r.LASTVISIT),
    membership:        safeStr(r.Membership),
    centerName:        safeStr(r.CNAME),
    isLoyaltyEnrolled: safeBool(r.IS_LOYALTY_ENROLLED),
  }));
};

// ─── FETCH CUSTOMER DETAILS ────────────────────────────────────────────────────
// Mirrors: FetchCustomerDetailsAsync → SpFetchCustomerDetails
// Column order matches .NET exactly (indexes 0-38)
const fetchCustomerDetails = async (custId, centerCode) => {
  const pool   = getPool();
  const result = await pool
    .request()
    .input("CUSTID",      sql.NVarChar, custId)
    .input("centerCode",  sql.NVarChar, centerCode)
    .execute("SpFetchCustomerDetails");

  if (!result.recordset.length) return null;
  const r = result.recordset[0];

  return {
    customerId:                         safeStr(r.CUSTID        ?? Object.values(r)[0]),
    firstName:                          safeStr(r.FIRST_NAME    ?? Object.values(r)[1]),
    middleName:                         safeStr(r.MIDDLE_NAME   ?? Object.values(r)[2]),
    lastName:                           safeStr(r.LAST_NAME     ?? Object.values(r)[3]),
    preferredName:                      safeStr(r.PREFERRED_NAME ?? Object.values(r)[4]),
    email:                              safeStr(r.EMAIL         ?? Object.values(r)[5]),
    mobilePhone:                        safeStr(r.NUMBER        ?? Object.values(r)[6]),
    homePhone:                          safeStr(r.HOME_PHONE    ?? Object.values(r)[7]),
    workPhone:                          safeStr(r.WORK_PHONE    ?? Object.values(r)[8]),
    gender:                             safeStr(r.GENDER_NAME   ?? Object.values(r)[9]),
    birthDay:                           safeDate(r.DATE_OF_BIRTH ?? Object.values(r)[10]),
    anniversary:                        safeDate(r.ANNIVERSARY_DATE ?? Object.values(r)[11]),
    referal:                            safeStr(r.REFERRAL      ?? Object.values(r)[12]),
    refBy:                              safeStr(r.RefBy         ?? Object.values(r)[13]),
    primaryEmployee:                    safeStr(r.PRIMARY_EMPLOYEE ?? Object.values(r)[14]),
    address1:                           safeStr(r.ADDRESS_1     ?? Object.values(r)[15]),
    address2:                           safeStr(r.ADDRESS_2     ?? Object.values(r)[16]),
    city:                               safeStr(r.CITY          ?? Object.values(r)[17]),
    nationalityCode:                    safeInt(r.NATIONALITY_ID ?? Object.values(r)[18]),
    countryCode:                        safeInt(r.COUNTRY_ID    ?? Object.values(r)[19]),
    stateCode:                          safeInt(r.STATE_ID      ?? Object.values(r)[20]),
    stateOther:                         safeStr(r.STATE_OTHER   ?? Object.values(r)[21]),
    nationalityId:                      safeStr(r.NATIONALITY_NUMBER ?? Object.values(r)[22]),
    centerCode:                         safeStr(r.CENTERCODE    ?? Object.values(r)[23]),
    language:                           safeInt(r.LANGUAGE_ID   ?? Object.values(r)[24]),
    userName:                           safeStr(r.USERNAME      ?? Object.values(r)[25]),
    tags:                               safeStr(r.TAGS          ?? Object.values(r)[26]),
    transactionalSMSEnable:             safeInt(r.TransactionalSMSEnable             ?? Object.values(r)[27]),
    transactionalEmailEnable:           safeInt(r.TransactionalEmailEnable           ?? Object.values(r)[28]),
    marketingSMSEnable:                 safeInt(r.MarketingSMSEnable                 ?? Object.values(r)[29]),
    marketingEmailEnable:               safeInt(r.MarketingEmailEnable               ?? Object.values(r)[30]),
    marketingLoyalPointSMSandEmailEnable: safeInt(r.MarketingLoyalPointSMSandEmailEnable ?? Object.values(r)[31]),
    blockGuestFromEditCustomerData:     safeInt(r.CAN_EDIT_PERSONAL_INFO             ?? Object.values(r)[32]),
    blockGuestFromOnlineAppointmentBooking: safeInt(r.IS_ONLINE_BOOKING_BLOCKED      ?? Object.values(r)[33]),
    nationalityName:                    safeStr(r.NationalityName ?? Object.values(r)[34]),
    countryName:                        safeStr(r.CountryName    ?? Object.values(r)[35]),
    stateName:                          safeStr(r.StateName      ?? Object.values(r)[36]),
    centerName:                         safeStr(r.CNAME          ?? Object.values(r)[37]),
    isLoyaltyEnrolled:                  safeBool(r.IS_LOYALTY_ENROLLED ?? Object.values(r)[38]),
  };
};

// ─── FETCH CUSTOMER INVOICE LIST ───────────────────────────────────────────────
// Mirrors: FetchCustomerInvoiceDetailsAsync → SpFetchCustomerInvoice
const fetchCustomerInvoices = async (custId, centerCode) => {
  const pool   = getPool();
  const result = await pool
    .request()
    .input("CUSTID",     sql.NVarChar, custId)
    .input("centerCode", sql.NVarChar, centerCode)
    .execute("SpFetchCustomerInvoice");

  return result.recordset.map((r) => ({
    invoiceNum:  safeStr(r.INVOICENUM),
    invoiceDate: safeStr(r.INVOICEDATE),
    amount:      parseFloat(r.SUMTOTAL   || 0),
    tax:         parseFloat(r.TAX        || 0),
    roundingOff: parseFloat(r.ROUNDINGOFF|| 0),
    paymentMode: safeStr(r.PAYMENTMODE),
  }));
};

// ─── FETCH CUSTOMER APPOINTMENT LIST ──────────────────────────────────────────
// Mirrors: FetchCustomerAppListAsync → SpLoadCustomerAppList
const fetchCustomerAppointments = async (custId, centerCode) => {
  const pool   = getPool();
  const result = await pool
    .request()
    .input("centerCode", sql.NVarChar, centerCode)
    .input("CUSTID",     sql.NVarChar, custId)
    .execute("SpLoadCustomerAppList");

  return result.recordset.map((r) => ({
    appointmentId:   safeStr(r.appointmentId),
    invoiceNo:       safeStr(r.InvoiceNo),
    service:         safeStr(r.servicename),
    serviceDate:     safeStr(r.startdate),
    status:          safeStr(r.appstatus),
    therapist:       safeStr(r.therapist),
    paymentType:     safeStr(r.paymentType),
    appointmentType: safeStr(r.AppointmentType),
    addedBy:         safeStr(r.CreatedBy),
    centerName:      safeStr(r.CNAME),
    dateCreated:     safeStr(r.startdate),
    notes:           safeStr(r.ADDNOTES),
  }));
};

// ─── SAVE CUSTOMER ─────────────────────────────────────────────────────────────
// Mirrors: SaveCustomerDetailsAsync → SpInsertCustomerMaster
const saveCustomer = async (data) => {
  const pool   = getPool();
  const result = await pool
    .request()
    .input("CUSTID",                             sql.NVarChar, data.customerId   || "")
    .input("FIRST_NAME",                         sql.NVarChar, data.firstName    || "")
    .input("MIDDLE_NAME",                        sql.NVarChar, data.middleName   || "")
    .input("LAST_NAME",                          sql.NVarChar, data.lastName     || "")
    .input("PreferredName",                      sql.NVarChar, data.preferredName|| "")
    .input("EMAIL",                              sql.NVarChar, data.email        || "")
    .input("NUMBER",                             sql.NVarChar, data.mobilePhone  || "")
    .input("HOME_PHONE",                         sql.NVarChar, data.homePhone    || "")
    .input("WORK_PHONE",                         sql.NVarChar, data.workPhone    || "")
    .input("GENDER_NAME",                        sql.NVarChar, data.gender       || "")
    .input("DATE_OF_BIRTH",                      data.birthDay ? sql.DateTime : sql.NVarChar,
                                                 data.birthDay ? new Date(data.birthDay) : "")
    .input("ANNIVERSARY_DATE",                   sql.NVarChar,
           data.anniversary ? new Date(data.anniversary).toISOString().split("T")[0] : "")
    .input("REFERRAL",                           sql.NVarChar, data.referal         || "")
    .input("RefBy",                              sql.NVarChar, data.refBy           || "")
    .input("PRIMARY_EMPLOYEE",                   sql.NVarChar, data.primaryEmployee || "")
    .input("ADDRESS_1",                          sql.NVarChar, data.address1        || "")
    .input("ADDRESS_2",                          sql.NVarChar, data.address2        || "")
    .input("CITY",                               sql.NVarChar, data.city            || "")
    .input("NATIONALITY_NUMBER",                 sql.NVarChar, data.nationalityId   || "")
    .input("COUNTRY_ID",                         sql.Int,      safeInt(data.countryCode))
    .input("STATE_ID",                           sql.Int,      safeInt(data.stateCode))
    .input("STATE_OTHER",                        sql.NVarChar, data.stateOther      || "")
    .input("NATIONALITY_ID",                     sql.Int,      safeInt(data.nationalityCode))
    .input("CENTERCODE",                         sql.NVarChar, data.centerCode      || "")
    .input("LANGUAGE_ID",                        sql.Int,      safeInt(data.language))
    .input("TransactionalSMSEnable",             sql.Int,      safeInt(data.transactionalSMSEnable))
    .input("TransactionalEmailEnable",           sql.Int,      safeInt(data.transactionalEmailEnable))
    .input("MarketingSMSEnable",                 sql.Int,      safeInt(data.marketingSMSEnable))
    .input("MarketingEmailEnable",               sql.Int,      safeInt(data.marketingEmailEnable))
    .input("MarketingLoyalPointSMSandEmailEnable", sql.Int,    safeInt(data.marketingLoyalPointSMSandEmailEnable))
    .input("CAN_EDIT_PERSONAL_INFO",             sql.Int,      safeInt(data.blockGuestFromEditCustomerData))
    .input("USERNAME",                           sql.NVarChar, data.userName       || "")
    .input("TAGS",                               sql.NVarChar, data.tags           || "")
    .input("IS_ONLINE_BOOKING_BLOCKED",          sql.Int,      safeInt(data.blockGuestFromOnlineAppointmentBooking))
    .input("id",                                 sql.NVarChar, require("crypto").randomUUID())
    .input("IS_LOYALTY_ENROLLED",                sql.Int,      data.isLoyaltyEnrolled ? 1 : 0)
    .execute("SpInsertCustomerMaster");

  const rows = result.recordset || [];
  if (rows.length > 0) {
    const custExist = parseInt(Object.values(rows[0])[0]) || 0;
    return custExist === 0
      ? { success: true,  message: "Customer Data Inserted" }
      : { success: false, message: "CustID already existed" };
  }
  return { success: false, message: "No response from SP" };
};

// ─── SEARCH CUSTOMERS (for invoice CustomerSearch autocomplete) ────────────────
// Used by: GET /api/Master/GetCustomerBySearchKey/:searchKey/:centerCode
const searchCustomers = async (searchKey, centerCode) => {
  const pool   = getPool();
  const result = await pool
    .request()
    .input("centerCode", sql.NVarChar, centerCode)
    .input("SearchKey",  sql.NVarChar, searchKey || "")
    .query(`
      SELECT TOP 20
        RECID         AS recId,
        CUSTID        AS custId,
        FIRST_NAME    AS firstName,
        LAST_NAME     AS lastName,
        EMAIL         AS email,
        NUMBER        AS mobile,
        NATIONALITY_ID AS nationalityId,
        CENTERCODE    AS centerCode,
        IS_LOYALTY_ENROLLED AS isLoyaltyEnrolled
      FROM CLINIC_CUSTOMER
      WHERE Active = 1
        AND CENTERCODE = @centerCode
        AND (
          FIRST_NAME  LIKE '%' + @SearchKey + '%' OR
          LAST_NAME   LIKE '%' + @SearchKey + '%' OR
          NUMBER      LIKE '%' + @SearchKey + '%' OR
          EMAIL       LIKE '%' + @SearchKey + '%' OR
          CUSTID      LIKE '%' + @SearchKey + '%'
        )
      ORDER BY FIRST_NAME
    `);
  return result.recordset.map((r) => ({
    recId:             safeInt(r.recId),
    custId:            safeStr(r.custId),
    firstName:         safeStr(r.firstName),
    lastName:          safeStr(r.lastName),
    email:             safeStr(r.email),
    mobile:            safeStr(r.mobile),
    nationalityId:     safeStr(r.nationalityId),
    centerCode:        safeStr(r.centerCode),
    isLoyaltyEnrolled: safeBool(r.isLoyaltyEnrolled),
  }));
};

module.exports = {
  loadCustomerList,
  fetchCustomerDetails,
  fetchCustomerInvoices,
  fetchCustomerAppointments,
  saveCustomer,
  searchCustomers,
};