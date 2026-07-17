// Generates 10,000 employees across a handful of countries and
// departments so the app can actually be evaluated at the scale the
// brief asks for. Re-running this wipes and rebuilds the table -
// it's a seed script, not a migration.

const { randomUUID } = require("crypto");
const { faker } = require("@faker-js/faker");
const { createDb } = require("../src/db");

const COUNTRIES = [
  { country: "India", currency: "INR", salaryRange: [400000, 6000000] },
  { country: "United States", currency: "USD", salaryRange: [60000, 350000] },
  { country: "United Kingdom", currency: "GBP", salaryRange: [30000, 200000] },
  { country: "Germany", currency: "EUR", salaryRange: [40000, 180000] },
  { country: "Singapore", currency: "SGD", salaryRange: [45000, 220000] },
  { country: "Canada", currency: "CAD", salaryRange: [50000, 220000] },
];

const DEPARTMENTS = {
  Engineering: ["Software Engineer", "Senior Software Engineer", "Engineering Manager", "Staff Engineer", "QA Engineer"],
  Sales: ["Sales Executive", "Account Manager", "Sales Director", "Business Development Rep"],
  Marketing: ["Marketing Associate", "Marketing Manager", "Content Strategist", "SEO Specialist"],
  "Human Resources": ["HR Executive", "HR Business Partner", "Recruiter", "HR Manager"],
  Finance: ["Financial Analyst", "Accountant", "Finance Manager", "Controller"],
  Operations: ["Operations Analyst", "Operations Manager", "Logistics Coordinator"],
  "Customer Support": ["Support Associate", "Support Team Lead", "Customer Success Manager"],
  Product: ["Product Manager", "Product Analyst", "Product Designer"],
};

const TOTAL_EMPLOYEES = parseInt(process.env.SEED_COUNT || "10000", 10);

function randomBetween(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

function seed() {
  const db = createDb();

  console.log(`Wiping existing data and seeding ${TOTAL_EMPLOYEES} employees...`);
  db.exec("DELETE FROM salary_history; DELETE FROM employees;");

  const insertEmployee = db.prepare(`
    INSERT INTO employees
      (id, first_name, last_name, email, department, designation, country, currency, status, join_date, manager_id, base_salary, bonus)
    VALUES
      (@id, @firstName, @lastName, @email, @department, @designation, @country, @currency, @status, @joinDate, @managerId, @baseSalary, @bonus)
  `);

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insertEmployee.run(row);
  });

  const batch = [];
  const usedEmails = new Set();

  for (let i = 0; i < TOTAL_EMPLOYEES; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    let email = faker.internet.email({ firstName, lastName, provider: "acme-corp.example" }).toLowerCase();
    while (usedEmails.has(email)) {
      email = `${firstName}.${lastName}.${randomBetween(1, 9999)}@acme-corp.example`.toLowerCase();
    }
    usedEmails.add(email);

    const departmentNames = Object.keys(DEPARTMENTS);
    const department = faker.helpers.arrayElement(departmentNames);
    const designation = faker.helpers.arrayElement(DEPARTMENTS[department]);
    const locationInfo = faker.helpers.arrayElement(COUNTRIES);
    const [min, max] = locationInfo.salaryRange;
    const baseSalary = randomBetween(min, max);
    const bonus = Math.round(baseSalary * (Math.random() * 0.15));
    const status = Math.random() < 0.05 ? "inactive" : "active";

    batch.push({
      id: randomUUID(),
      firstName,
      lastName,
      email,
      department,
      designation,
      country: locationInfo.country,
      currency: locationInfo.currency,
      status,
      joinDate: faker.date.between({ from: "2015-01-01", to: "2026-06-01" }).toISOString().slice(0, 10),
      managerId: null,
      baseSalary,
      bonus,
    });
  }

  insertMany(batch);
  console.log(`Done. Seeded ${TOTAL_EMPLOYEES} employees into salary.sqlite`);
}

seed();
