const service      = require("./invoice.service");
const { success }  = require("../../utils/response");
const asyncHandler = require("../../utils/asyncHandler");
const AppError     = require("../../utils/AppError");

// ── POST /api/Invoice ──────────────────────────────────────────────────────────
// Mirrors: [HttpPost] InsertInvoiceAsync
// Body: { appointmentID, invoiceDate, centerCode, createdBy,
//          headerJson[], linesJson[], paymentJson[] }
const insertInvoice = asyncHandler(async (req, res) => {
  const data = req.body;

  // Basic validation
  if (!data.headerJson || !data.headerJson.length) {
    throw new AppError("headerJson is required", 400);
  }
  if (!data.linesJson || !data.linesJson.length) {
    throw new AppError("linesJson is required", 400);
  }
  if (!data.paymentJson || !data.paymentJson.length) {
    throw new AppError("paymentJson is required", 400);
  }

  // Enrich with JWT user if not provided by client
  if (!data.createdBy && req.user?.employeeCode) {
    data.createdBy = req.user.employeeCode;
  }
  if (!data.centerCode && req.user?.centerCode) {
    data.centerCode = req.user.centerCode;
  }

  const result = await service.createInvoice(data);

  if (!result.success) {
    throw new AppError(result.message || "Invoice insertion failed", 500);
  }

  return success(res, result.message, result.message);
});

// ── POST /api/Invoice/InvoiceEmail ─────────────────────────────────────────────
// Mirrors: [HttpPost("InvoiceEmail")] InvoiceEmailAsync
// Body: { invoiceNo, custID, custEmailID, invoiceHtml }
const invoiceEmail = asyncHandler(async (req, res) => {
  const { invoiceNo, custEmailID, invoiceHtml } = req.body;

  if (!custEmailID) throw new AppError("custEmailID is required", 400);
  if (!invoiceHtml) throw new AppError("invoiceHtml is required", 400);

  const result = await service.emailInvoice({ invoiceNo, custEmailID, invoiceHtml });
  return success(res, null, result.message);
});

// ── GET /api/Invoice/GetInvoiceDetails/:invoiceNumber ──────────────────────────
// Mirrors: [HttpGet("GetInvoiceDetails/{invoiceNumber}")] GetInvoiceDetailsAsync
// Uses centerCode from JWT (same logic as .NET session LoginCode/TopCode)
const getInvoiceDetails = asyncHandler(async (req, res) => {
  const { invoiceNumber } = req.params;
  const centerCode = req.user?.centerCode || "";

  if (!centerCode) throw new AppError("Session expired or center code missing", 401);

  const data = await service.fetchInvoiceDetails(invoiceNumber, centerCode);
  return success(res, data);
});

module.exports = { insertInvoice, invoiceEmail, getInvoiceDetails };