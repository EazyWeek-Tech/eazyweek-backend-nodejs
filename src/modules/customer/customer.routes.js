const express    = require("express");
const router     = express.Router();
const controller = require("./customer.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");

// All routes require JWT
router.use(verifyToken);

// GET  /api/Customer/LoadCustomers
router.get( "/LoadCustomers",            controller.loadCustomers);

// POST /api/Customer/SaveCustomer
router.post("/SaveCustomer",             controller.saveCustomer);

// POST /api/Customer/FetchCustomerDetails
router.post("/FetchCustomerDetails",     controller.fetchCustomerDetails);

// POST /api/Customer/FetchCustomerInvoice
router.post("/FetchCustomerInvoice",     controller.fetchCustomerInvoice);

// POST /api/Customer/FetchCustomerAppointment
router.post("/FetchCustomerAppointment", controller.fetchCustomerAppointment);

module.exports = router;