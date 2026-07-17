const express = require("express");
const cors = require("cors");
const { createDb } = require("./db");
const buildEmployeeRoutes = require("./routes/employees");
const buildAnalyticsRoutes = require("./routes/analytics");

// Takes a db instance so tests can pass in an in-memory db instead of
// the real one. Production just calls createApp() with no args.
function createApp(db = createDb()) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (req, res) => res.json({ ok: true }));

  app.use("/api/employees", buildEmployeeRoutes(db));
  app.use("/api/analytics", buildAnalyticsRoutes(db));

  // fallback error handler - keeps route handlers from needing try/catch everywhere
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || "Something went wrong" });
  });

  return app;
}

module.exports = { createApp };
