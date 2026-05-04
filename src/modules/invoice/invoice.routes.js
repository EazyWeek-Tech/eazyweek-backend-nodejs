const express    = require("express");
const router     = express.Router();
const controller = require("./invoice.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");

// POST   /api/Invoice                              → insert invoice
// POST   /api/Invoice/InvoiceEmail                → send email
// GET    /api/Invoice/GetInvoiceDetails/:invoiceNumber → fetch invoice

router.post(  "/",                               verifyToken, controller.insertInvoice);
router.post(  "/InvoiceEmail",                   verifyToken, controller.invoiceEmail);
router.get(   "/GetInvoiceDetails/:invoiceNumber", verifyToken, controller.getInvoiceDetails);

module.exports = router;