const repo = require("./invoice.repository");

const createInvoice      = (data)                         => repo.insertInvoice(data);
const fetchInvoiceDetails = (invoiceNumber, centerCode)   => repo.getInvoiceDetails(invoiceNumber, centerCode);
const emailInvoice       = (payload)                      => repo.sendInvoiceEmail(payload);

module.exports = { createInvoice, fetchInvoiceDetails, emailInvoice };