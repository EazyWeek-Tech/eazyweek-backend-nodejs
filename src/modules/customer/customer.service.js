const repo = require("./customer.repository");

const getCustomerList        = (centerCode)          => repo.loadCustomerList(centerCode);
const getCustomerDetails     = (custId, centerCode)  => repo.fetchCustomerDetails(custId, centerCode);
const getCustomerInvoices    = (custId, centerCode)  => repo.fetchCustomerInvoices(custId, centerCode);
const getCustomerAppointments= (custId, centerCode)  => repo.fetchCustomerAppointments(custId, centerCode);
const createCustomer         = (data)                => repo.saveCustomer(data);
const searchCustomers        = (key, centerCode)     => repo.searchCustomers(key, centerCode);

module.exports = {
  getCustomerList,
  getCustomerDetails,
  getCustomerInvoices,
  getCustomerAppointments,
  createCustomer,
  searchCustomers,
};