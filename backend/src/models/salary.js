// Salary changes always go through here so we never overwrite a
// salary without leaving a history row behind - that's the whole
// point of not just editing a spreadsheet cell.
//
// The transaction ensures both operations (insert history, update employee)
// are atomic - either both succeed or both rollback. If the insert succeeds
// but the update fails, the entire change is rolled back and the caller gets
// an error instead of a half-updated state.

function updateSalary(db, employeeId, { baseSalary, bonus, reason, effectiveDate }) {
  const employee = db.prepare("SELECT * FROM employees WHERE id = ?").get(employeeId);
  if (!employee) return null;

  if (baseSalary === undefined || baseSalary === null || baseSalary < 0) {
    const err = new Error("baseSalary must be a non-negative number");
    err.status = 400;
    throw err;
  }

  const newBonus = bonus === undefined || bonus === null ? employee.bonus : bonus;

  const applyChange = db.transaction(() => {
    db.prepare(
      `INSERT INTO salary_history
        (employee_id, old_base_salary, new_base_salary, old_bonus, new_bonus, reason, effective_date)
       VALUES (@employeeId, @oldBase, @newBase, @oldBonus, @newBonus, @reason, @effectiveDate)`
    ).run({
      employeeId,
      oldBase: employee.base_salary,
      newBase: baseSalary,
      oldBonus: employee.bonus,
      newBonus,
      reason: reason || null,
      effectiveDate: effectiveDate || new Date().toISOString().slice(0, 10),
    });

    db.prepare(
      `UPDATE employees SET base_salary = @baseSalary, bonus = @bonus, updated_at = datetime('now') WHERE id = @id`
    ).run({ id: employeeId, baseSalary, bonus: newBonus });
  });

  applyChange();

  return getSalaryHistory(db, employeeId);
}

function getSalaryHistory(db, employeeId) {
  return db
    .prepare(
      `SELECT id, old_base_salary AS oldBaseSalary, new_base_salary AS newBaseSalary,
              old_bonus AS oldBonus, new_bonus AS newBonus, reason, effective_date AS effectiveDate,
              changed_at AS changedAt
       FROM salary_history WHERE employee_id = ? ORDER BY id DESC`
    )
    .all(employeeId);
}

module.exports = { updateSalary, getSalaryHistory };
