const request = require("supertest");
const { buildTestApp } = require("./helpers");

function sampleEmployee(overrides = {}) {
  return {
    firstName: "Asha",
    lastName: "Verma",
    email: "asha.verma@acme-corp.example",
    department: "Engineering",
    designation: "Software Engineer",
    country: "India",
    currency: "INR",
    baseSalary: 1200000,
    joinDate: "2022-03-01",
    ...overrides,
  };
}

describe("Employee CRUD", () => {
  let app;

  beforeEach(() => {
    ({ app } = buildTestApp());
  });

  test("creates an employee with valid data", async () => {
    const res = await request(app).post("/api/employees").send(sampleEmployee());
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.firstName).toBe("Asha");
    expect(res.body.totalCompensation).toBe(1200000); // bonus defaults to 0
  });

  test("rejects employee creation when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/employees")
      .send({ firstName: "Asha" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Missing required fields/);
  });

  test("fetches a single employee by id", async () => {
    const created = await request(app).post("/api/employees").send(sampleEmployee());
    const res = await request(app).get(`/api/employees/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("asha.verma@acme-corp.example");
  });

  test("returns 404 for an unknown employee id", async () => {
    const res = await request(app).get("/api/employees/does-not-exist");
    expect(res.status).toBe(404);
  });

  test("updates employee details without touching salary", async () => {
    const created = await request(app).post("/api/employees").send(sampleEmployee());
    const res = await request(app)
      .patch(`/api/employees/${created.body.id}`)
      .send({ designation: "Senior Software Engineer" });
    expect(res.status).toBe(200);
    expect(res.body.designation).toBe("Senior Software Engineer");
    expect(res.body.baseSalary).toBe(1200000); // unchanged
  });

  test("lists employees with pagination", async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/api/employees")
        .send(sampleEmployee({ email: `person${i}@acme-corp.example`, lastName: `Person${i}` }));
    }
    const res = await request(app).get("/api/employees?page=1&pageSize=2");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.total).toBe(5);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  test("filters employees by department", async () => {
    await request(app).post("/api/employees").send(sampleEmployee({ email: "eng@acme-corp.example" }));
    await request(app)
      .post("/api/employees")
      .send(sampleEmployee({ email: "sales@acme-corp.example", department: "Sales", designation: "Sales Executive" }));

    const res = await request(app).get("/api/employees?department=Sales");
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].department).toBe("Sales");
  });

  test("searches employees by name", async () => {
    await request(app).post("/api/employees").send(sampleEmployee());
    const res = await request(app).get("/api/employees?search=Asha");
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].firstName).toBe("Asha");
  });
});
