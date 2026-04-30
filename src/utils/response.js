/**
 * Standardised API response format for all endpoints.
 * Every response across the entire app goes through one of these.
 */

const success = (res, data = null, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const created = (res, data = null, message = "Created successfully") => {
  return success(res, data, message, 201);
};

const paginated = (res, data, total, page, limit, message = "Success") => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  });
};

const error = (res, message = "Something went wrong", statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

const notFound = (res, message = "Resource not found") => {
  return error(res, message, 404);
};

const unauthorized = (res, message = "Unauthorized") => {
  return error(res, message, 401);
};

const forbidden = (res, message = "Forbidden") => {
  return error(res, message, 403);
};

const badRequest = (res, message = "Bad request", errors = null) => {
  return error(res, message, 400, errors);
};

module.exports = { success, created, paginated, error, notFound, unauthorized, forbidden, badRequest };
