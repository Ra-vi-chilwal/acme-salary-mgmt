const express = require("express");

// These are the "answer questions about how the org pays people"
// endpoints - the whole reason the HR manager isn't in Excel anymore.
// Aggregation is pushed into SQL rather than pulled into JS, since
// that's the part that has to stay fast at 10k+ rows.

module.exports = function buildAnalyticsRoutes(db) {
  const router = express.Router();

  router.get("/summary", (req, res) => {
    const totals = db
      .prepare(
        `SELECT COUNT(*) AS headcount,
                SUM(base_salary + bonus) AS totalPayroll,
                AVG(base_salary + bonus) AS avgCompensation
         FROM employees WHERE status = 'active'`
      )
      .get();
    res.json(totals);
  });

  router.get("/by-department", (req, res) => {
    const rows = db
      .prepare(
        `SELECT department,
                COUNT(*) AS headcount,
                ROUND(AVG(base_salary + bonus), 2) AS avgCompensation,
                MIN(base_salary + bonus) AS minCompensation,
                MAX(base_salary + bonus) AS maxCompensation
         FROM employees
         WHERE status = 'active'
         GROUP BY department
         ORDER BY avgCompensation DESC`
      )
      .all();
    res.json(rows);
  });

  router.get("/by-country", (req, res) => {
    const rows = db
      .prepare(
        `SELECT country, currency,
                COUNT(*) AS headcount,
                ROUND(AVG(base_salary + bonus), 2) AS avgCompensation,
                SUM(base_salary + bonus) AS totalPayroll
         FROM employees
         WHERE status = 'active'
         GROUP BY country, currency
         ORDER BY totalPayroll DESC`
      )
      .all();
    res.json(rows);
  });

  // Salary bands give the HR manager a quick "what does the pay
  // spread actually look like" view instead of eyeballing a sorted
  // spreadsheet column.
  router.get("/salary-bands", (req, res) => {
    const bands = [
      { label: "< 5L", min: 0, max: 500000 },
      { label: "5L - 10L", min: 500000, max: 1000000 },
      { label: "10L - 20L", min: 1000000, max: 2000000 },
      { label: "20L - 40L", min: 2000000, max: 4000000 },
      { label: "40L+", min: 4000000, max: Number.MAX_SAFE_INTEGER },
    ];

    const results = bands.map((band) => {
      const count = db
        .prepare(
          `SELECT COUNT(*) AS count FROM employees
           WHERE status = 'active' AND (base_salary + bonus) >= ? AND (base_salary + bonus) < ?`
        )
        .get(band.min, band.max).count;
      return { label: band.label, count };
    });

    res.json(results);
  });

  router.get("/top-paid", (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const rows = db
      .prepare(
        `SELECT id, first_name AS firstName, last_name AS lastName, department, country,
                designation, (base_salary + bonus) AS totalCompensation
         FROM employees WHERE status = 'active'
         ORDER BY totalCompensation DESC LIMIT ?`
      )
      .all(limit);
    res.json(rows);
  });

  return router;
};
