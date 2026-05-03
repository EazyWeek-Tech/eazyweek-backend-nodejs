const { Router }   = require("express");
const controller   = require("./service.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");

const router = Router();

router.use(verifyToken);

// ── List & Details ──────────────────────────────────────────────────────────
// Old: GET  /api/Master/LoadService
// Old: POST /api/Master/FetchServiceDetails/:ServiceCode/:RecId
router.get("/LoadService",                              controller.loadService);
router.post("/FetchServiceDetails/:ServiceCode/:RecId", controller.fetchServiceDetails);

// ── General ─────────────────────────────────────────────────────────────────
// Old: POST /api/Master/InsertServiceGeneral
router.post("/InsertServiceGeneral",    controller.insertServiceGeneral);

// ── Pricing ──────────────────────────────────────────────────────────────────
// Old: POST /api/Master/InsertServicePrice
router.post("/InsertServicePrice",      controller.insertServicePrice);

// ── BOM ──────────────────────────────────────────────────────────────────────
// Old: POST /api/Master/InsertServiceBOM
router.post("/InsertServiceBOM",        controller.insertServiceBOM);

// ── Practitioners ────────────────────────────────────────────────────────────
// Old: POST /api/Master/InsertServicePractioner  (typo preserved from .NET)
router.post("/InsertServicePractioner", controller.insertServicePractitioner);

// ── Forms ────────────────────────────────────────────────────────────────────
// Old: POST /api/Master/InsertServiceForms
router.post("/InsertServiceForms",      controller.insertServiceForms);

// ── Search consumables ───────────────────────────────────────────────────────
// Old: GET /api/Master/Service/SearchConsumables?SearchValue=
router.get("/Service/SearchConsumables", controller.searchConsumables);

// ── Categories ───────────────────────────────────────────────────────────────
// Old: GET /api/Master/ServiceCategory
// Old: GET /api/Master/ServiceSubCategory?categoryCode=
// Old: GET /api/Master/ServiceSubSubCategory?categoryCode=&subCategoryCode=
router.get("/ServiceCategory",          controller.loadServiceCategory);
router.get("/ServiceSubCategory",       controller.loadServiceSubCategory);
router.get("/ServiceSubSubCategory",    controller.loadServiceSubSubCategory);

module.exports = router;