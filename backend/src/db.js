const Database = require("better-sqlite3");
const path = require("path");

// dbPath is overridable so tests can point at an in-memory db instead
// of touching the real salary.sqlite file on disk.
function createDb(dbPath) {
  const resolvedPath =
    dbPath || process.env.DB_PATH || path.join(__dirname, "..", "salary.sqlite");

  const db = new Database(resolvedPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      department TEXT NOT NULL,
      designation TEXT NOT NULL,
      country TEXT NOT NULL,
      currency TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      join_date TEXT NOT NULL,
      manager_id TEXT,
      base_salary REAL NOT NULL,
      bonus REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS salary_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT NOT NULL,
      old_base_salary REAL,
      new_base_salary REAL NOT NULL,
      old_bonus REAL,
      new_bonus REAL NOT NULL,
      reason TEXT,
      effective_date TEXT NOT NULL,
      changed_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
    CREATE INDEX IF NOT EXISTS idx_employees_country ON employees(country);
    CREATE INDEX IF NOT EXISTS idx_salary_history_employee ON salary_history(employee_id);
  `);

  return db;
}

module.exports = { createDb };
