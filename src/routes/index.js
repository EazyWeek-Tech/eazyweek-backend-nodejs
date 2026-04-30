const { Router } = require("express");
const router = Router();

router.use("/auth",     require("../modules/auth/auth.routes"));
router.use("/employee", require("../modules/employee/employee.routes"));

// Future modules — uncomment as they are migrated:
// router.use("/master",      require("../modules/master/master.routes"));
// router.use("/customer",    require("../modules/customer/customer.routes"));
// router.use("/appointment", require("../modules/appointment/appointment.routes"));
// router.use("/audit",       require("../modules/audit/audit.routes"));
// router.use("/loyalty",     require("../modules/loyalty/loyalty.routes"));
// router.use("/invoice",     require("../modules/invoice/invoice.routes"));

module.exports = router;