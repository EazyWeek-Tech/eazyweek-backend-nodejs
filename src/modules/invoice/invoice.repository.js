const { sql, getPool } = require("../../config/db");
const nodemailer = require("nodemailer");

// ─── INSERT INVOICE ────────────────────────────────────────────────────────────
// Mirrors: InsertInvoiceAsync → SpInsertInvoiceXML
// Payload shape: { appointmentID, centerCode, createdBy, headerJson[], linesJson[], paymentJson[] }
const insertInvoice = async (data) => {
  const pool = getPool();

  // ── Header XML ──
  let headerXml = "<HeaderJsonTableXML>";
  for (const h of (data.headerJson || [])) {
    headerXml += "<HeaderJsonTableXMLs>";
    headerXml += `<APPOINTMENTID>${data.appointmentID || ""}</APPOINTMENTID>`;
    headerXml += `<CENTERCODE>${data.centerCode || ""}</CENTERCODE>`;
    headerXml += `<ISCLOSED>1</ISCLOSED>`;
    headerXml += `<NETPRICE>${h.netPrice ?? 0}</NETPRICE>`;
    headerXml += `<TAX>${h.tax ?? 0}</TAX>`;
    headerXml += `<ROUNDINGOFF>${h.roundingOff ?? 0}</ROUNDINGOFF>`;
    headerXml += `<SUMTOTAL>${h.sumTotal ?? 0}</SUMTOTAL>`;
    headerXml += `<CUSTID>${h.custId || ""}</CUSTID>`;
    headerXml += `<FIRSTNAME>${h.firstName || ""}</FIRSTNAME>`;
    headerXml += `<LASTNAME>${h.lastName || ""}</LASTNAME>`;
    headerXml += `<GENDER>${h.gender || ""}</GENDER>`;
    headerXml += `<MOBILENUMBER>${h.mobileNumber || ""}</MOBILENUMBER>`;
    headerXml += `<EMAILID>${h.emailID || ""}</EMAILID>`;
    headerXml += `<CREATEDBY>${data.createdBy || ""}</CREATEDBY>`;
    headerXml += "</HeaderJsonTableXMLs>";
  }
  headerXml += "</HeaderJsonTableXML>";

  // ── Lines XML ──
  let linesXml = "<LinesJsonTableXML>";
  for (const line of (data.linesJson || [])) {
    linesXml += "<LinesJsonTableXMLs>";
    linesXml += `<APPOINTMENTID>${data.appointmentID || ""}</APPOINTMENTID>`;
    linesXml += `<ITEMCODE>${line.itemCode || ""}</ITEMCODE>`;
    linesXml += `<ITEMNAME>${line.itemName || ""}</ITEMNAME>`;
    linesXml += `<ITEMTYPE>${line.itemType || "service"}</ITEMTYPE>`;
    linesXml += `<SALESAMOUNT>${line.salesAmount ?? 0}</SALESAMOUNT>`;
    linesXml += `<TAXAMOUNT>${line.taxamount ?? 0}</TAXAMOUNT>`;
    linesXml += `<FINALAMOUNT>${line.finalAmount ?? 0}</FINALAMOUNT>`;
    linesXml += `<DISCOUNTAMOUNT>${line.discountAmount ?? 0}</DISCOUNTAMOUNT>`;
    linesXml += `<LINENUM>${line.lineNo ?? 1}</LINENUM>`;
    linesXml += `<QUANTITY>${line.quantity ?? 1}</QUANTITY>`;
    linesXml += `<THERAPISTCODE>${line.therapistCode || ""}</THERAPISTCODE>`;
    linesXml += `<THERAPISTNAME>${line.therapistName || ""}</THERAPISTNAME>`;
    linesXml += `<CREATEDBY>${data.createdBy || ""}</CREATEDBY>`;
    linesXml += "</LinesJsonTableXMLs>";
  }
  linesXml += "</LinesJsonTableXML>";

  // ── Payment XML ──
  let paymentXml = "<PaymentJsonTableXML>";
  for (const pay of (data.paymentJson || [])) {
    paymentXml += "<PaymentJsonTableXMLs>";
    paymentXml += `<APPOINTMENTID>${data.appointmentID || ""}</APPOINTMENTID>`;
    paymentXml += `<PAYMENTMODE>${pay.paymentMode ?? 0}</PAYMENTMODE>`;
    paymentXml += `<PAYMENTNAME>${pay.paymentName || ""}</PAYMENTNAME>`;
    paymentXml += `<CARDNUMBER>${pay.cardNumber || ""}</CARDNUMBER>`;
    paymentXml += `<TOTALAMOUNT>${pay.totalAmount ?? 0}</TOTALAMOUNT>`;
    paymentXml += `<PAIDAMOUNT>${pay.paidAmount ?? 0}</PAIDAMOUNT>`;
    paymentXml += `<LINENUM>${pay.lineNo ?? 1}</LINENUM>`;
    paymentXml += `<CREATEDBY>${data.createdBy || ""}</CREATEDBY>`;
    paymentXml += "</PaymentJsonTableXMLs>";
  }
  paymentXml += "</PaymentJsonTableXML>";

  // ── Execute SP ──
  const result = await pool
    .request()
    .input("centercode",       sql.NVarChar, data.centerCode || "")
    .input("HeaderJsonXML",    sql.NVarChar, headerXml)
    .input("LineJsonXML",      sql.NVarChar, linesXml)
    .input("PaymentJsonXML",   sql.NVarChar, paymentXml)
    .execute("SpInsertInvoiceXML");

  const dt = result.recordset || [];
  if (dt.length > 0) {
    const firstRow = dt[0];
    const keys = Object.keys(firstRow);
    return {
      success: true,
      message: String(firstRow[keys[0]] || ""),
    };
  }
  return { success: false, message: "No response from SP" };
};

// ─── GET INVOICE DETAILS ───────────────────────────────────────────────────────
// Mirrors: GetInvoiceDetailsAsync → SpGetInvoiceDetails (Header / Items / Payment)
const getInvoiceDetails = async (invoiceNumber, centerCode) => {
  const pool = getPool();

  const runQuery = (dataFetchType) =>
    pool
      .request()
      .input("invoiceNumber", sql.NVarChar, invoiceNumber)
      .input("CenterCode",    sql.NVarChar, centerCode)
      .input("DataFetchType", sql.NVarChar, dataFetchType)
      .execute("SpGetInvoiceDetails");

  // Header
  const dtHeader  = await runQuery("Header");
  // Items
  const dtLines   = await runQuery("Items");
  // Payment
  const dtPayment = await runQuery("Payment");

  const hRows = dtHeader.recordset  || [];
  const lRows = dtLines.recordset   || [];
  const pRows = dtPayment.recordset || [];

  // Shape header — column order matches .NET: [0]=InvoiceNumber [1]=InvoiceDate
  // [2]=AppointmentID [3]=FirstName [4]=LastName [5]=CustId
  // [6]=Gender [7]=MobileNumber [8]=EmailID
  // [9]=NetPrice [10]=Tax [11]=RoundingOff [12]=SumTotal
  const header = hRows.length > 0 ? (() => {
    const r = hRows[0];
    const v = Object.values(r);
    return {
      invoiceNumber: v[0]  || "",
      invoiceDate:   v[1]  || null,
      appointmentID: v[2]  || "",
      firstName:     v[3]  || "",
      lastName:      v[4]  || "",
      custId:        v[5]  || "",
      gender:        v[6]  || "",
      mobileNumber:  v[7]  || "",
      emailID:       v[8]  || "",
      netPrice:      Number(v[9]  ?? 0),
      tax:           Number(v[10] ?? 0),
      roundingOff:   Number(v[11] ?? 0),
      sumTotal:      Number(v[12] ?? 0),
    };
  })() : null;

  // Shape lines — [0]=ItemCode [1]=ItemName [2]=ItemType [3]=LineNo
  // [4]=SalesAmount [5]=TaxAmount [6]=FinalAmount [7]=Quantity
  // [8]=DiscountAmount [9]=? [10]=TherapistName
  const lines = lRows.map((r) => {
    const v = Object.values(r);
    return {
      itemCode:       v[0]  || "",
      itemName:       v[1]  || "",
      itemType:       v[2]  || "",
      lineNo:         Number(v[3]  ?? 0),
      salesAmount:    Number(v[4]  ?? 0),
      taxAmount:      Number(v[5]  ?? 0),
      finalAmount:    Number(v[6]  ?? 0),
      quantity:       Number(v[7]  ?? 1),
      discountAmount: Number(v[8]  ?? 0),
      therapistName:  v[10] || "",
    };
  });

  // Shape payments — [0]=PaymentMode [1]=PaymentName [2]=LineNo
  // [3]=CardNumber [4]=PaidAmount [5]=TotalAmount [6]=PaymentDate
  const payments = pRows.map((r) => {
    const v = Object.values(r);
    return {
      paymentMode:  Number(v[0] ?? 0),
      paymentName:  v[1] || "",
      lineNo:       Number(v[2] ?? 0),
      cardNumber:   v[3] || "",
      paidAmount:   Number(v[4] ?? 0),
      totalAmount:  Number(v[5] ?? 0),
      paymentDate:  v[6] || null,
    };
  });

  return {
    invoiceNumber,
    centerCode,
    invoiceDate: header?.invoiceDate || new Date().toISOString(),
    appointmentID: header?.appointmentID || "",
    status: "Success",
    responseMessage: "Data Retrieved",
    headerJson:  header  ? [header]  : [],
    linesJson:   lines,
    paymentJson: payments,
  };
};

// ─── SEND EMAIL ────────────────────────────────────────────────────────────────
// Email is sent server-side (matches .NET InvoiceEmailAsync)
// Requires nodemailer to be installed: npm install nodemailer
const sendInvoiceEmail = async ({ invoiceNo, custEmailID, invoiceHtml }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || "Service@centriq.sa",
      pass: process.env.SMTP_PASS || "",
    },
  });

  await transporter.sendMail({
    from:    process.env.SMTP_USER || "Service@centriq.sa",
    to:      custEmailID,
    subject: `Invoice No: ${invoiceNo}`,
    html:    invoiceHtml,
  });

  return { success: true, message: "Email Sent Successfully." };
};

module.exports = {
  insertInvoice,
  getInvoiceDetails,
  sendInvoiceEmail,
};