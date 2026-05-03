const service    = require("./service.service");
const { success } = require("../../utils/response");
const asyncHandler = require("../../utils/asyncHandler");

// GET /api/Master/LoadService  (session centerCode from JWT)
const loadService = asyncHandler(async (req, res) => {
  const centerCode = req.user.centerCode || "";
  const data       = await service.getServiceList(centerCode);
  return success(res, data);
});

// POST /api/Master/FetchServiceDetails/:ServiceCode/:RecId
const fetchServiceDetails = asyncHandler(async (req, res) => {
  const { ServiceCode, RecId } = req.params;
  const centerCode             = req.user.centerCode || "";
  const details                = await service.getServiceDetails(ServiceCode, parseInt(RecId), centerCode);

  // Shape response to match what React expects (matching .NET response exactly)
  const g = details.general;
  return success(res, {
    serviceCode:         g.SERVICECODE  || g[Object.keys(g)[0]]  || "",
    serviceName:         g.SERVICENAME  || g[Object.keys(g)[1]]  || "",
    serviceDescription:  g.SERVICEDES   || g[Object.keys(g)[2]]  || "",
    arabicServiceName:   g.ARABICSERVICENAME || g[Object.keys(g)[25]] || "",
    serviceCategoryCode: g.SERVICECCODE  || "",
    serviceSubCategoryCode: g.SERVICECSCODE || "",
    serviceSubSubCategoryCode: g.SERVICECSSCODE || "",
    serviceTime:         g.SERVICEINTIME || "",
    allowIdealBOMConsumption:                 g.ALLOWIDEALBOMCONSUMPTION || "No",
    allowBOMConsumptionWithIntervention:      g.ALLOWIDEALBOMCONSUMPTIONWITHINTERVENTION || "No",
    allowLoyalityAccrual:    g.ALLOWLOYALITYACCRUAL    || "No",
    allowLoyalityRedemption: g.ALLOWLOYALITYREDEMPTION || "No",
    additionalField1: g.ADDITIONALFIELD1 || "",
    additionalField2: g.ADDITIONALFIELD2 || "",
    additionalField3: g.ADDITIONALFIELD3 || "",
    additionalField4: g.ADDITIONALFIELD4 || "",
    additionalField5: g.ADDITIONALFIELD5 || "",
    stageForFormCompletionCode: g.FORMSTAGEFORCOMPLETION || "",
    blockFromProceedingListIfFormNotFilled: g.FORMBLOCKIFNOTFILLED || "",
    form: g.FORM || "",
    optionalField1: g.FIELD1 || "",
    optionalField2: g.FIELD2 || "",
    optionalField3: g.FIELD3 || "",
    optionalField4: g.FIELD4 || "",
    optionalField5: g.FIELD5 || "",
    pricingJson: details.price.map((p) => ({
      centerCode:  p.CENTERCODE  || "",
      centerName:  p.CNAME       || p.CENTERCODE || "",
      price:       p.PRICE       || "0",
      taxIncluded: p.TAXINCLUDED || "",
      taxPercent:  p.TAXPERCENT  || "0",
      storeRelease:p.STORERELEASE || "No",
    })),
    consumablesJson: details.bom.map((b) => ({
      code:  b.CONSUMABLECODE || "",
      name:  b.CONSUMABLENAME || "",
      qty:   b.QTY            || "1",
      uom:   b.UOM            || "",
    })),
    doctorsJson: details.practitioners
      .filter((p) => p.PRACTITIONERTYPE === "Doctor")
      .map((p) => ({
        doctorCode:  p.PRACTITIONER || "",
        doctorName:  p.DNAME        || "",
        clinicCode:  p.CENTERCODE   || "",
        clinicName:  p.CNAME        || "",
      })),
    nursesJson: details.practitioners
      .filter((p) => p.PRACTITIONERTYPE === "Nurses")
      .map((p) => ({
        nurseCode:  p.PRACTITIONER || "",
        nurseName:  p.NDNAME       || "",
        clinicCode: p.CENTERCODE   || "",
        clinicName: p.NCNAME       || "",
      })),
  });
});

// POST /api/Master/InsertServiceGeneral
const insertServiceGeneral = asyncHandler(async (req, res) => {
  const centerCode = req.user.centerCode  || "";
  const createdBy  = req.user.employeeCode || "";
  const result     = await service.saveGeneral(req.body, centerCode, createdBy);
  return success(res, result, "Service general saved");
});

// POST /api/Master/InsertServicePrice
const insertServicePrice = asyncHandler(async (req, res) => {
  const centerCode = req.user.centerCode  || "";
  const createdBy  = req.user.employeeCode || "";
  await service.savePrice(req.body, centerCode, createdBy);
  return success(res, null, "Pricing saved");
});

// POST /api/Master/InsertServiceBOM
const insertServiceBOM = asyncHandler(async (req, res) => {
  const { serviceCode, productCode } = req.body;
  await service.saveBOM(serviceCode, [{ productCode }]);
  return success(res, null, "BOM item saved");
});

// POST /api/Master/InsertServicePractioner
const insertServicePractitioner = asyncHandler(async (req, res) => {
  await service.savePractitioners([req.body]);
  return success(res, null, "Practitioner mapped");
});

// POST /api/Master/InsertServiceForms
const insertServiceForms = asyncHandler(async (req, res) => {
  const centerCode = req.user.centerCode  || "";
  const createdBy  = req.user.employeeCode || "";
  await service.saveForms(req.body, centerCode, createdBy);
  return success(res, null, "Forms saved");
});

// GET /api/Master/Service/SearchConsumables?SearchValue=
const searchConsumables = asyncHandler(async (req, res) => {
  const data = await service.searchConsumables(req.query.SearchValue || "");
  return success(res, data);
});

// GET /api/Master/ServiceCategory
const loadServiceCategory = asyncHandler(async (req, res) => {
  const data = await service.getServiceCategory();
  return success(res, data.map((r) => ({
    categoryCode: r.PCCODE || r.CATEGORYCODE || "",
    categoryName: r.CATEGORYNAME || "",
  })));
});

// GET /api/Master/ServiceSubCategory?categoryCode=
const loadServiceSubCategory = asyncHandler(async (req, res) => {
  const data = await service.getServiceSubCategory(req.query.categoryCode || "");
  return success(res, data.map((r) => ({
    categoryCode:    r.PCODE        || "",
    subCategoryCode: r.SUBCCODE     || "",
    subCategoryName: r.CATEGORYNAME || "",
  })));
});

// GET /api/Master/ServiceSubSubCategory?categoryCode=&subCategoryCode=
const loadServiceSubSubCategory = asyncHandler(async (req, res) => {
  const data = await service.getServiceSubSubCategory(
    req.query.categoryCode    || "",
    req.query.subCategoryCode || ""
  );
  return success(res, data.map((r) => ({
    subSubCategoryCode: r.CSSCODE      || "",
    subSubCategoryName: r.CATEGORYNAME || "",
  })));
});


const loadPractitionersByClinic = asyncHandler(async (req, res) => {
  const data = await service.getPractitionersByClinic(req.params.centerCode);
  return success(res, data);
});

const loadServicePractitionerMapping = asyncHandler(async (req, res) => {
  const data = await service.getServicePractitionerMapping(req.params.serviceCode);
  return success(res, data);
});


module.exports = {
  loadService, fetchServiceDetails,
  insertServiceGeneral, insertServicePrice,
  insertServiceBOM, insertServicePractitioner, insertServiceForms,
  loadPractitionersByClinic, loadServicePractitionerMapping,
  searchConsumables,
  loadServiceCategory, loadServiceSubCategory, loadServiceSubSubCategory,
};