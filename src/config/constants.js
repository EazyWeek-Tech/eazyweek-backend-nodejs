module.exports = {
  JWT_EXPIRY: "8h",

  ROLES: {
    ADMIN:           "Admin",
    CLINIC_MANAGER:  "Clinic Manager",
    TEAM_MEMBER:     "Team Member",
    HOD:             "HOD",
    FINANCE:         "Finance Reviwer",       // kept as-is from DB
    SERVICE_QUALITY: "Service Qualtiy-Reviwer", // kept as-is from DB
    SYSTEM_USER:     "System User",
  },

  PAGINATION: {
    DEFAULT_PAGE:  1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT:     100,
  },

  HTTP_STATUS: {
    OK:                    200,
    CREATED:               201,
    BAD_REQUEST:           400,
    UNAUTHORIZED:          401,
    FORBIDDEN:             403,
    NOT_FOUND:             404,
    CONFLICT:              409,
    INTERNAL_SERVER_ERROR: 500,
  },
};