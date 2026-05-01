const { Router } = require("express");
const { setSession, getSession, clearSession } = require("./session.controller");

const router = Router();

router.post("/set",   setSession);
router.get("/get",    getSession);
router.post("/clear", clearSession);

module.exports = router;