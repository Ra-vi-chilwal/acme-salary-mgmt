const { randomUUID } = require("crypto");

// Small wrapper around the employees table. Kept as plain functions
// (not a class) since we just need a handful of queries and this is
// easier to unit test - pass in a db, get data back.

function serialize(row) {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    department: row.department,
    designation: row.designation,
    country: row.country,
    currency: row.currency,
    status: row.status,
    joinDate: row.join_date,
    managerId: row.manager_id,
    baseSalary: row.base_salary,
    bonus: row.bonus,
    totalCompensation: row.base_salary + row.bonus,
  };
}

function listEmployees(db, { search, department, country, status, page = 1, pageSize = 25 }) {
  const clauses = [];
  const params = {};

  if (search) {
    clauses.push("(first_name LIKE @search OR last_name LIKE @search OR email LIKE @search)");
    params.search = `%${search}%`;
  }
  if (department) {
    clauses.push("department = @department");
    params.department = department;
  }
  if (country) {
    clauses.push("country = @country");
    params.country = country;
  }
  if (status) {
    clauses.push("status = @status");
    params.status = status;
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const offset = (Math.max(1, page) - 1) * pageSize;

  const total = db.prepare(`SELECT COUNT(*) AS count FROM employees ${where}`).get(params).count;

  const rows = db
    .prepare(
      `SELECT * FROM employees ${where} ORDER BY last_name, first_name LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit: pageSize, offset });

  return {
    data: rows.map(serialize),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

function getEmployeeById(db, id) {
  const row = db.prepare("SELECT * FROM employees WHERE id = ?").get(id);
  return serialize(row);
}

function createEmployee(db, input) {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO employees
      (id, first_name, last_name, email, department, designation, country, currency, status, join_date, manager_id, base_salary, bonus)
     VALUES (@id, @firstName, @lastName, @email, @department, @designation, @country, @currency, @status, @joinDate, @managerId, @baseSalary, @bonus)`
  ).run({
    id,
    status: "active",
    managerId: null,
    ...input,
  });
  return getEmployeeById(db, id);
}

function updateEmployeeDetails(db, id, input) {
  const existing = db.prepare("SELECT * FROM employees WHERE id = ?").get(id);
  if (!existing) return null;

  const fields = ["first_name", "last_name", "email", "department", "designation", "country", "status", "manager_id"];
  const map = {
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    department: input.department,
    designation: input.designation,
    country: input.country,
    status: input.status,
    manager_id: input.managerId,
  };

  const setClauses = [];
  const params = { id };
  for (const field of fields) {
    if (map[field] !== undefined) {
      setClauses.push(`${field} = @${field}`);
      params[field] = map[field];
    }
  }
  if (setClauses.length === 0) return getEmployeeById(db, id);

  setClauses.push("updated_at = datetime('now')");
  db.prepare(`UPDATE employees SET ${setClauses.join(", ")} WHERE id = @id`).run(params);
  return getEmployeeById(db, id);
}

module.exports = {
  serialize,
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployeeDetails,
};
