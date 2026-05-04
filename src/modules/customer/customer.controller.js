const service      = require("./customer.service");
const { success }  = require("../../utils/response");
const asyncHandler = require("../../utils/asyncHandler");
const AppError     = require("../../utils/AppError");

// GET /api/Customer/LoadCustomers
const loadCustomers = asyncHandler(async (req, res) => {
  const centerCode = req.user.centerCode || "";
  if (!centerCode) throw new AppError("Session expired or center code missing", 401);
  const data = await service.getCustomerList(centerCode);
  return success(res, data);
});

// POST /api/Customer/FetchCustomerDetails   body: { custID }
const fetchCustomerDetails = asyncHandler(async (req, res) => {
  const { custID } = req.body;
  if (!custID) throw new AppError("custID is required", 400);
  const centerCode = req.user.centerCode || "";
  const data = await service.getCustomerDetails(custID, centerCode);
  if (!data) throw new AppError("Customer not found", 404);
  return success(res, data);
});

// POST /api/Customer/FetchCustomerInvoice   body: { custID }
const fetchCustomerInvoice = asyncHandler(async (req, res) => {
  const { custID } = req.body;
  if (!custID) throw new AppError("custID is required", 400);
  const centerCode = req.user.centerCode || "";
  const data = await service.getCustomerInvoices(custID, centerCode);
  return success(res, data);
});

// POST /api/Customer/FetchCustomerAppointment   body: { custID }
const fetchCustomerAppointment = asyncHandler(async (req, res) => {
  const { custID } = req.body;
  if (!custID) throw new AppError("custID is required", 400);
  const centerCode = req.user.centerCode || "";
  const data = await service.getCustomerAppointments(custID, centerCode);
  return success(res, data);
});

// POST /api/Customer/SaveCustomer   body: CustomerDetails
const saveCustomer = asyncHandler(async (req, res) => {
  const data = req.body;
  if (!data.customerId) throw new AppError("customerId is required", 400);
  // Enrich centerCode from JWT if not provided
  if (!data.centerCode && req.user.centerCode) data.centerCode = req.user.centerCode;
  const result = await service.createCustomer(data);
  if (!result.success) throw new AppError(result.message, 400);
  return success(res, null, result.message);
});

// GET /api/Master/GetCustomerBySearchKey/:searchKey/:centerCode
// (placed in customer module but registered under /Master/ prefix for React compatibility)
const searchCustomers = asyncHandler(async (req, res) => {
  const { searchKey, centerCode } = req.params;
  const data = await service.searchCustomers(searchKey, centerCode);
  return success(res, data);
});

module.exports = {
  loadCustomers,
  fetchCustomerDetails,
  fetchCustomerInvoice,
  fetchCustomerAppointment,
  saveCustomer,
  searchCustomers,
};