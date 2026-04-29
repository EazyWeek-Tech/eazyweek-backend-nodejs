const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Eazyweek Beta API is running 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.APP_ENV });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});