import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-semibold text-slate-900 mt-1">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [byDept, setByDept] = useState([]);
  const [byCountry, setByCountry] = useState([]);
  const [bands, setBands] = useState([]);
  const [topPaid, setTopPaid] = useState([]);

  useEffect(() => {
    api.summary().then(setSummary);
    api.byDepartment().then(setByDept);
    api.byCountry().then(setByCountry);
    api.salaryBands().then(setBands);
    api.topPaid(5).then(setTopPaid);
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-4">Org pay overview</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Active headcount" value={summary ? summary.headcount.toLocaleString() : "..."} />
        <StatCard
          label="Avg. compensation (all currencies)"
          value={summary ? Math.round(summary.avgCompensation).toLocaleString() : "..."}
        />
        <StatCard
          label="Total payroll (all currencies)"
          value={summary ? Math.round(summary.totalPayroll).toLocaleString() : "..."}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h2 className="font-medium text-slate-900 mb-3">Avg. compensation by department</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byDept} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="department" width={110} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => v.toLocaleString()} />
              <Bar dataKey="avgCompensation" fill="#0f172a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h2 className="font-medium text-slate-900 mb-3">Headcount by country</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byCountry}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="country" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="headcount" fill="#334155" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h2 className="font-medium text-slate-900 mb-3">Salary band distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bands}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#64748b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-2">Bands are in INR; mixed-currency records are bucketed by raw numeric value (see requirements doc re: FX scope).</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h2 className="font-medium text-slate-900 mb-3">Top paid employees</h2>
          <ul className="text-sm divide-y divide-slate-100">
            {topPaid.map((e) => (
              <li key={e.id} className="py-2 flex justify-between">
                <Link to={`/employees/${e.id}`} className="hover:underline">
                  {e.firstName} {e.lastName} <span className="text-slate-400">· {e.designation}</span>
                </Link>
                <span className="font-medium">{e.totalCompensation.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
