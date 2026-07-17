const request = require("supertest");
const { buildTestApp } = require("./helpers");

async function seedThree(app) {
  await request(app).post("/api/employees").send({
    firstName: "A", lastName: "One", email: "a@acme-corp.example",
    department: "Engineering", designation: "Software Engineer",
    country: "India", currency: "INR", baseSalary: 1000000, joinDate: "2022-01-01",
  });
  await request(app).post("/api/employees").send({
    firstName: "B", lastName: "Two", email: "b@acme-corp.example",
    department: "Engineering", designation: "Senior Software Engineer",
    country: "India", currency: "INR", baseSalary: 2000000, joinDate: "2021-01-01",
  });
  await request(app).post("/api/employees").send({
    firstName: "C", lastName: "Three", email: "c@acme-corp.example",
    department: "Sales", designation: "Sales Executive",
    country: "United States", currency: "USD", baseSalary: 80000, joinDate: "2023-01-01",
  });
}

describe("Analytics", () => {
  let app;

  beforeEach(async () => {
    ({ app } = buildTestApp());
    await seedThree(app);
  });

  test("summary reports correct headcount and total payroll", async () => {
    const res = await request(app).get("/api/analytics/summary");
    expect(res.body.headcount).toBe(3);
    expect(res.body.totalPayroll).toBe(1000000 + 2000000 + 80000);
  });

  test("by-department groups and averages correctly", async () => {
    const res = await request(app).get("/api/analytics/by-department");
    const eng = res.body.find((d) => d.department === "Engineering");
    const sales = res.body.find((d) => d.department === "Sales");
    expect(eng.headcount).toBe(2);
    expect(eng.avgCompensation).toBe(1500000); // (1,000,000 + 2,000,000) / 2
    expect(sales.headcount).toBe(1);
  });

  test("by-country splits payroll per currency", async () => {
    const res = await request(app).get("/api/analytics/by-country");
    const india = res.body.find((c) => c.country === "India");
    expect(india.headcount).toBe(2);
    expect(india.currency).toBe("INR");
  });

  test("top-paid returns highest earners first", async () => {
    const res = await request(app).get("/api/analytics/top-paid?limit=2");
    expect(res.body.length).toBe(2);
    expect(res.body[0].totalCompensation).toBe(2000000);
    expect(res.body[1].totalCompensation).toBe(1000000);
  });

  test("salary-bands buckets employees correctly", async () => {
    const res = await request(app).get("/api/analytics/salary-bands");
    const band10to20 = res.body.find((b) => b.label === "10L - 20L");
    // employee A at 10,00,000 falls in the 10L-20L bucket
    expect(band10to20.count).toBeGreaterThanOrEqual(1);
  });
});
