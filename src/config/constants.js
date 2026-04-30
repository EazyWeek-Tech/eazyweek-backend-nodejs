module.exports = {
  JWT_EXPIRY: "8h",

  ROLES: {
    ADMIN: "Admin",
    MANAGER: "Manager",
    STAFF: "Staff",
    CALL_CENTRE: "Call Centre Executive",
  },

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
  },
};
