const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error || `Request failed: ${res.status}`);
  }
  return body;
}

export const api = {
  listEmployees: (params) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))
    ).toString();
    return request(`/employees?${qs}`);
  },
  getEmployee: (id) => request(`/employees/${id}`),
  createEmployee: (data) => request("/employees", { method: "POST", body: JSON.stringify(data) }),
  updateEmployee: (id, data) => request(`/employees/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  getSalaryHistory: (id) => request(`/employees/${id}/salary-history`),
  updateSalary: (id, data) => request(`/employees/${id}/salary`, { method: "POST", body: JSON.stringify(data) }),

  summary: () => request("/analytics/summary"),
  byDepartment: () => request("/analytics/by-department"),
  byCountry: () => request("/analytics/by-country"),
  salaryBands: () => request("/analytics/salary-bands"),
  topPaid: (limit = 10) => request(`/analytics/top-paid?limit=${limit}`),
};
