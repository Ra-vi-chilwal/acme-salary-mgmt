const { createDb } = require("../src/db");
const { createApp } = require("../src/app");

// Every test file gets its own in-memory sqlite db so tests don't
// step on each other and don't touch the real salary.sqlite file.
function buildTestApp() {
  const db = createDb(":memory:");
  const app = createApp(db);
  return { app, db };
}

module.exports = { buildTestApp };
