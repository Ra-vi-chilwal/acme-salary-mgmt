const request = require("supertest");
const { buildTestApp } = require("./helpers");

async function createEmployee(app) {
  const res = await request(app).post("/api/employees").send({
    firstName: "Rahul",
    lastName: "Nair",
    email: "rahul.nair@acme-corp.example",
    department: "Finance",
    designation: "Financial Analyst",
    country: "India",
    currency: "INR",
    baseSalary: 900000,
    joinDate: "2021-06-15",
  });
  return res.body;
}

describe("Salary updates + history", () => {
  let app;

  beforeEach(() => {
    ({ app } = buildTestApp());
  });

  test("updating salary creates a history entry and updates current salary", async () => {
    const employee = await createEmployee(app);

    const res = await request(app)
      .post(`/api/employees/${employee.id}/salary`)
      .send({ baseSalary: 1050000, reason: "Annual increment", effectiveDate: "2024-04-01" });

    expect(res.status).toBe(201);
    expect(res.body.length).toBe(1);
    expect(res.body[0].oldBaseSalary).toBe(900000);
    expect(res.body[0].newBaseSalary).toBe(1050000);
    expect(res.body[0].reason).toBe("Annual increment");

    const updatedEmployee = await request(app).get(`/api/employees/${employee.id}`);
    expect(updatedEmployee.body.baseSalary).toBe(1050000);
  });

  test("salary history keeps every change, not just the latest", async () => {
    const employee = await createEmployee(app);
    await request(app).post(`/api/employees/${employee.id}/salary`).send({ baseSalary: 950000 });
    await request(app).post(`/api/employees/${employee.id}/salary`).send({ baseSalary: 1000000 });

    const res = await request(app).get(`/api/employees/${employee.id}/salary-history`);
    expect(res.body.length).toBe(2);
    // most recent change first
    expect(res.body[0].newBaseSalary).toBe(1000000);
    expect(res.body[1].newBaseSalary).toBe(950000);
  });

  test("rejects a negative salary", async () => {
    const employee = await createEmployee(app);
    const res = await request(app)
      .post(`/api/employees/${employee.id}/salary`)
      .send({ baseSalary: -100 });
    expect(res.status).toBe(400);
  });

  test("returns 404 when updating salary for an unknown employee", async () => {
    const res = await request(app).post("/api/employees/unknown-id/salary").send({ baseSalary: 100000 });
    expect(res.status).toBe(404);
  });

  test("bonus carries over unchanged if not provided in the update", async () => {
    const employee = await createEmployee(app);
    await request(app)
      .post(`/api/employees/${employee.id}/salary`)
      .send({ baseSalary: 950000, bonus: 50000 });

    await request(app).post(`/api/employees/${employee.id}/salary`).send({ baseSalary: 970000 });

    const updated = await request(app).get(`/api/employees/${employee.id}`);
    expect(updated.body.bonus).toBe(50000);
  });
});
