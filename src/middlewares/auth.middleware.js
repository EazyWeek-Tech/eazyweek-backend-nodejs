const jwt = require("jsonwebtoken");
const { unauthorized, forbidden } = require("../utils/response");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) return unauthorized(res, "Access token missing");

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    next(err); // forwards to global error handler (handles JWT errors)
  }
};

/**
 * Role-based access control.
 * Usage: router.delete("/", verifyToken, authorize("Admin"), controller.delete)
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return forbidden(res, "You do not have permission to perform this action");
  }
  next();
};

module.exports = { verifyToken, authorize };
