const session = require("express-session");

const sessionMiddleware = session({
  name: "eazyweek.sid",
  secret: process.env.SESSION_SECRET || "eazyweek_session_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.APP_ENV === "production", // true in prod (HTTPS), false locally
    sameSite: process.env.APP_ENV === "production" ? "none" : "lax",
    maxAge: 8 * 60 * 60 * 1000, // 8 hours — matches JWT expiry
  },
});

module.exports = { sessionMiddleware };