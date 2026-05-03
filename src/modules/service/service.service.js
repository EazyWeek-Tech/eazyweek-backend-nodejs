const repo = require("./service.repository");

const getServiceList    = (centerCode)                      => repo.loadServiceList(centerCode);
const getServiceDetails = (serviceCode, recId, centerCode)  => repo.loadServiceDetails(serviceCode, recId, centerCode);

const saveGeneral       = (data, centerCode, createdBy)     => repo.insertServiceGeneral(data, centerCode, createdBy);
const savePrice         = (data, centerCode, createdBy)     => repo.insertServicePrice(data, centerCode, createdBy);
const saveForms         = (data, centerCode, createdBy)     => repo.insertServiceForms(data, centerCode, createdBy);

const saveBOM = async (serviceCode, items) => {
  for (const item of items) {
    await repo.insertServiceBOM(serviceCode, item.productCode);
  }
};

const savePractitioners = async (rows) => {
  for (const row of rows) {
    await repo.insertServicePractitioner(row);
  }
};

const searchConsumables       = (searchValue)                       => repo.searchConsumables(searchValue);
const getServiceCategory      = ()                                  => repo.loadServiceCategory();
const getServiceSubCategory   = (categoryCode)                      => repo.loadServiceSubCategory(categoryCode);
const getServiceSubSubCategory= (categoryCode, subCategoryCode)     => repo.loadServiceSubSubCategory(categoryCode, subCategoryCode);

module.exports = {
  getServiceList, getServiceDetails,
  saveGeneral, savePrice, saveBOM, savePractitioners, saveForms,
  searchConsumables,
  getServiceCategory, getServiceSubCategory, getServiceSubSubCategory,
};