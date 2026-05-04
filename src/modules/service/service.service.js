const repo = require("./service.repository");

const getServiceList     = (centerCode)              => repo.loadServiceList(centerCode);
const getServiceDetails  = (serviceCode, recId, cc)  => repo.loadServiceDetails(serviceCode, recId, cc);
const saveGeneral        = (data, cc, by)             => repo.insertServiceGeneral(data, cc, by);
const savePrice          = (data, cc, by)             => repo.insertServicePrice(data, cc, by);
const saveBOM            = (serviceCode, productCode) => repo.insertServiceBOM(serviceCode, productCode);
const savePractitioners  = async (rows) => { for (const row of rows) await repo.insertServicePractitioner(row); };
const saveForms          = (data, cc, by)             => repo.insertServiceForms(data, cc, by);
const searchConsumables  = (val)                      => repo.searchConsumables(val);
const getServiceCategory    = ()              => repo.loadServiceCategory();
const getServiceSubCategory = (cat)           => repo.loadServiceSubCategory(cat);
const getServiceSubSubCategory = (cat, sub)   => repo.loadServiceSubSubCategory(cat, sub);
const getPractitionersByClinic      = (centerCode)   => repo.loadPractitionersByClinic(centerCode);
const getServicePractitionerMapping = (serviceCode)  => repo.loadServicePractitionerMapping(serviceCode);
const getServiceByName   = (searchValue, centerCode) => repo.searchServiceByName(searchValue, centerCode);

module.exports = {
  getServiceList,
  getServiceDetails,
  saveGeneral,
  savePrice,
  saveBOM,
  savePractitioners,
  saveForms,
  searchConsumables,
  getServiceCategory,
  getServiceSubCategory,
  getServiceSubSubCategory,
  getPractitionersByClinic,
  getServicePractitionerMapping,
  getServiceByName,
};