/**
 * Wraps async controller functions to automatically catch errors
 * and forward to the global error handler.
 *
 * Usage:
 *   router.get("/", asyncHandler(myController.getAll));
 *
 * Without this, every controller needs its own try/catch.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
