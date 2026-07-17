import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

const DEPARTMENTS = ["Engineering", "Sales", "Marketing", "Human Resources", "Finance", "Operations", "Customer Support", "Product"];
const COUNTRIES = ["India", "United States", "United Kingdom", "Germany", "Singapore", "Canada"];

export default function Employees() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [country, setCountry] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], pagination: { totalPages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [search, department, country]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .listEmployees({ search, department, country, page, pageSize: 20 })
      .then((res) => {
        if (!cancelled) setResult(res);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [search, department, country, page]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-4">Employees</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          className="border border-slate-300 rounded-md px-3 py-1.5 text-sm flex-1 min-w-[200px]"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border border-slate-300 rounded-md px-3 py-1.5 text-sm"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          className="border border-slate-300 rounded-md px-3 py-1.5 text-sm"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="">All countries</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Department</th>
              <th className="px-4 py-2 font-medium">Designation</th>
              <th className="px-4 py-2 font-medium">Country</th>
              <th className="px-4 py-2 font-medium text-right">Compensation</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">Loading...</td>
              </tr>
            ) : result.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">No employees match these filters.</td>
              </tr>
            ) : (
              result.data.map((emp) => (
                <tr key={emp.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <Link to={`/employees/${emp.id}`} className="text-slate-900 font-medium hover:underline">
                      {emp.firstName} {emp.lastName}
                    </Link>
                    <div className="text-xs text-slate-400">{emp.email}</div>
                  </td>
                  <td className="px-4 py-2">{emp.department}</td>
                  <td className="px-4 py-2">{emp.designation}</td>
                  <td className="px-4 py-2">{emp.country}</td>
                  <td className="px-4 py-2 text-right">
                    {emp.totalCompensation.toLocaleString()} {emp.currency}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3 text-sm text-slate-500">
        <div>{result.pagination.total.toLocaleString()} employees</div>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 border border-slate-300 rounded disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          <span>Page {page} of {result.pagination.totalPages || 1}</span>
          <button
            className="px-2 py-1 border border-slate-300 rounded disabled:opacity-40"
            disabled={page >= (result.pagination.totalPages || 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
