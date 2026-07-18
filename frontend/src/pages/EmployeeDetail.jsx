import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";

export default function EmployeeDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  const [salaryForm, setSalaryForm] = useState({ baseSalary: "", bonus: "", reason: "", effectiveDate: "" });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  function loadEmployee() {
    api.getEmployee(id).then(setEmployee).catch((err) => setError(err.message));
    api.getSalaryHistory(id).then(setHistory).catch(() => {});
  }

  useEffect(() => {
    loadEmployee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (employee) {
      setSalaryForm({
        baseSalary: employee.baseSalary,
        bonus: employee.bonus,
        reason: "",
        effectiveDate: new Date().toISOString().slice(0, 10),
      });
    }
  }, [employee]);

  async function handleSalarySubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg("");

    const baseSalary = Number(salaryForm.baseSalary);
    if (!Number.isFinite(baseSalary) || baseSalary < 0) {
      setError("Base salary must be a valid positive number");
      setSaving(false);
      return;
    }

    try {
      await api.updateSalary(id, {
        baseSalary,
        bonus: Number(salaryForm.bonus) || 0,
        reason: salaryForm.reason,
        effectiveDate: salaryForm.effectiveDate,
      });
      setSuccessMsg("✓ Salary updated");
      setTimeout(() => setSuccessMsg(""), 3000);
      loadEmployee();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (error && !employee) return <p className="text-red-600">{error}</p>;
  if (!employee) return <p className="text-slate-400">Loading...</p>;

  return (
    <div>
      <Link to="/employees" className="text-sm text-slate-500 hover:underline">&larr; Back to employees</Link>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{employee.firstName} {employee.lastName}</h1>
          <p className="text-slate-500 text-sm">{employee.designation} · {employee.department} · {employee.country}</p>
          <p className="text-slate-400 text-sm">{employee.email}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${employee.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
          {employee.status}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h2 className="font-medium text-slate-900 mb-3">Current compensation</h2>
          <dl className="text-sm grid grid-cols-2 gap-y-2">
            <dt className="text-slate-500">Base salary</dt>
            <dd className="text-right">{employee.baseSalary.toLocaleString()} {employee.currency}</dd>
            <dt className="text-slate-500">Bonus</dt>
            <dd className="text-right">{employee.bonus.toLocaleString()} {employee.currency}</dd>
            <dt className="text-slate-500 font-medium">Total</dt>
            <dd className="text-right font-medium">{employee.totalCompensation.toLocaleString()} {employee.currency}</dd>
          </dl>

          <form onSubmit={handleSalarySubmit} className="mt-4 border-t border-slate-100 pt-4 space-y-2">
            <h3 className="text-sm font-medium text-slate-700">Update salary</h3>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-slate-500">
                New base salary
                <input
                  type="number"
                  className="w-full border border-slate-300 rounded px-2 py-1 mt-1"
                  value={salaryForm.baseSalary}
                  onChange={(e) => setSalaryForm((f) => ({ ...f, baseSalary: e.target.value }))}
                  required
                  min="0"
                />
              </label>
              <label className="text-xs text-slate-500">
                Bonus
                <input
                  type="number"
                  className="w-full border border-slate-300 rounded px-2 py-1 mt-1"
                  value={salaryForm.bonus}
                  onChange={(e) => setSalaryForm((f) => ({ ...f, bonus: e.target.value }))}
                  min="0"
                />
              </label>
            </div>
            <label className="text-xs text-slate-500 block">
              Reason
              <input
                type="text"
                placeholder="e.g. Annual increment"
                className="w-full border border-slate-300 rounded px-2 py-1 mt-1"
                value={salaryForm.reason}
                onChange={(e) => setSalaryForm((f) => ({ ...f, reason: e.target.value }))}
              />
            </label>
            <label className="text-xs text-slate-500 block">
              Effective date
              <input
                type="date"
                className="w-full border border-slate-300 rounded px-2 py-1 mt-1"
                value={salaryForm.effectiveDate}
                onChange={(e) => setSalaryForm((f) => ({ ...f, effectiveDate: e.target.value }))}
              />
            </label>
            {error && <p className="text-red-600 text-xs">{error}</p>}
            {successMsg && <p className="text-emerald-600 text-xs">{successMsg}</p>}
            <button
              type="submit"
              disabled={saving}
              className="bg-slate-900 text-white text-sm px-3 py-1.5 rounded-md disabled:opacity-50 w-full"
            >
              {saving ? "Saving..." : "Save salary change"}
            </button>
          </form>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h2 className="font-medium text-slate-900 mb-3">Salary history</h2>
          {history.length === 0 ? (
            <p className="text-sm text-slate-400">No changes recorded yet.</p>
          ) : (
            <ul className="text-sm space-y-3">
              {history.map((h) => (
                <li key={h.id} className="border-b border-slate-100 pb-2 last:border-0">
                  <div className="flex justify-between">
                    <span>{h.oldBaseSalary?.toLocaleString() ?? "—"} → {h.newBaseSalary.toLocaleString()}</span>
                    <span className="text-slate-400 text-xs">{h.effectiveDate}</span>
                  </div>
                  {h.reason && <div className="text-slate-500 text-xs mt-0.5">{h.reason}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
