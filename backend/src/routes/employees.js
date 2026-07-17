const express = require("express");
const {
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployeeDetails,
} = require("../models/employee");
const { updateSalary, getSalaryHistory } = require("../models/salary");

module.exports = function buildEmployeeRoutes(db) {
  const router = express.Router();

  router.get("/", (req, res) => {
    const { search, department, country, status, page, pageSize } = req.query;
    const result = listEmployees(db, {
      search,
      department,
      country,
      status,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 25,
    });
    res.json(result);
  });

  router.get("/:id", (req, res) => {
    const employee = getEmployeeById(db, req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  });

  router.post("/", (req, res, next) => {
    try {
      const required = ["firstName", "lastName", "email", "department", "designation", "country", "currency", "baseSalary", "joinDate"];
      const missing = required.filter((f) => req.body[f] === undefined || req.body[f] === "");
      if (missing.length) {
        return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
      }
      const employee = createEmployee(db, { bonus: 0, ...req.body });
      res.status(201).json(employee);
    } catch (err) {
      next(err);
    }
  });

  router.patch("/:id", (req, res) => {
    const employee = updateEmployeeDetails(db, req.params.id, req.body);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  });

  router.get("/:id/salary-history", (req, res) => {
    const employee = getEmployeeById(db, req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(getSalaryHistory(db, req.params.id));
  });

  router.post("/:id/salary", (req, res, next) => {
    try {
      const history = updateSalary(db, req.params.id, req.body);
      if (!history) return res.status(404).json({ error: "Employee not found" });
      res.status(201).json(history);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
