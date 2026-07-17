# ACME Salary Management — Requirements

## Goal
ACME's HR team currently tracks salaries for 10,000 employees across
multiple countries in spreadsheets. That makes it slow to answer basic
questions ("what's our average payroll cost in Germany?", "who got a
raise last quarter?") and error-prone to update salaries at scale. This
tool replaces the spreadsheet with a web app the HR Manager can use to
manage employee salary records and get quick answers about how the org
pays people.

## Primary user
HR Manager — non-technical, comfortable with Excel, needs to search,
filter, update, and understand salary data quickly without writing
queries.

## In scope (v1)
- **Employee directory**: list, search, filter (department, country,
  designation, status), paginated for 10k+ rows.
- **Employee profile**: view/edit personal + job details, current
  salary (base + bonus, in local currency).
- **Salary updates**: change an employee's salary with a reason and
  effective date; every change is kept as history, not overwritten.
- **Org-level insights (the "answer questions" part)**: headcount and
  average/median salary by department and by country, total payroll
  cost, salary band distribution, top/bottom paid roles. This is the
  part that replaces "digging through the spreadsheet."
- **Seed data**: script to generate 10,000 realistic employee records
  across ~6 countries and ~8 departments, so the app can be evaluated
  at real scale.
- **Tests**: core salary logic, filtering, and analytics calculations
  are unit/integration tested.

## Deliberately out of scope (v1) — and why
- **Multi-currency FX conversion / live exchange rates**: analytics are
  computed per-currency instead of a blended "total in USD" number.
  Real FX conversion needs a rates provider and a decision about
  which date's rate to use — that's a real feature, not a detail, and
  it would distract from the core CRUD + insights problem for this
  exercise.
- **Payroll processing / tax / statutory compliance**: this is a
  *salary record & insight* tool, not a payroll run engine. Running
  actual payroll (tax withholding, country-specific compliance) is a
  much bigger, jurisdiction-specific problem.
- **Role-based access control / multi-tenant orgs**: v1 assumes a
  single trusted HR Manager persona (matches the brief). A real
  product would need RBAC (HR admin vs. manager vs. employee
  self-service) and SSO, which is a meaningful chunk of work on its
  own.
- **Approval workflows** for salary changes (e.g. manager sign-off):
  changes are applied directly with an audit trail, but there's no
  multi-step approval chain.
- **Bulk import/export (CSV upload)**: the seed script covers "getting
  10k employees in," but ongoing bulk edits via CSV upload aren't
  built — the HR Manager edits through the UI.
- **Employee self-service portal**: only the HR Manager persona is
  built; employees don't log in to see their own payslip.

These were cut so the time available goes into the parts the brief
actually asks to be judged on: data model, salary-history correctness,
answering aggregate questions at 10k-row scale, and clean full-stack
engineering — rather than spreading thin across every adjacent HR
feature.
