# Managerial Remuneration — API Usage

API contract for the Managerial Remuneration module (`/remuneration`).

The module answers three questions for every manager and every pay period:

1. **How much is this manager entitled to earn for this month?**
2. **Why do they qualify for that amount?**
3. **What will it cost the company?**

Every calculation is performed on the server by the approved calculation
engine (`src/lib/remuneration/calculator.ts`) against the approved structure
(`src/lib/remuneration/structure.ts`). The browser never submits an amount —
it submits a manager, a performance result and a period, and receives the
statement back.

The module also talks to the **remuneration service** (`smart-backend`, the
Express + MySQL service at `http://localhost:5000/api/remuneration`). The
service owns the payroll side of the framework: the tiers, the position salary
packages, the allowance and deduction components, the qualifying criteria, the
housing bands, the bonus rules, the employee assignments, the monthly
assessments and the payroll calculation. See
[Remuneration service integration](#remuneration-service-integration).

---

## Table of contents

- [Base URL and conventions](#base-url-and-conventions)
- [Endpoints](#endpoints)
  - [GET /api/remuneration/structure](#get-apiremunerationstructure)
  - [GET /api/remuneration/managers](#get-apiremunerationmanagers)
  - [POST /api/remuneration/managers](#post-apiremunerationmanagers)
  - [PATCH /api/remuneration/managers/[id]](#patch-apiremunerationmanagersid)
  - [GET /api/remuneration/performance](#get-apiremunerationperformance)
  - [POST /api/remuneration/calculate](#post-apiremunerationcalculate)
  - [GET /api/remuneration/statements](#get-apiremunerationstatements)
  - [POST /api/remuneration/statements](#post-apiremunerationstatements)
  - [GET /api/remuneration/statements/[id]](#get-apiremunerationstatementsid)
  - [PATCH /api/remuneration/statements/[id]#patch-apiremunerationstatementsid)
  - [GET /api/remuneration/summary](#get-apiremunerationsummary)
- [Upstream data sources](#upstream-data-sources)
- [Remuneration service integration](#remuneration-service-integration)
- [Calculation rules](#calculation-rules)
- [Persistence](#persistence)
- [Error handling](#error-handling)

---

## Base URL and conventions

All routes are Next.js route handlers mounted under `/api/remuneration`.

| Convention | Value |
|------------|-------|
| Response envelope | `{ "success": boolean, "data": object \| array, "message"?: string }` |
| Period format | `YYYY-MM` (pay month) |
| Money format | Zambian kwacha (ZMW), stored as a number, no rounding at the API boundary |
| Dates | ISO `YYYY-MM-DD` |
| Auth | The module inherits the session cookie used by the rest of the application. Amount-bearing endpoints are restricted to authorised administrators. |

---

## Endpoints

### GET /api/remuneration/structure

Returns the approved remuneration structure that every calculation is built
from.

**Query parameters:** none.

**Response `data`:**

```jsonc
{
  "roles": [
    {
      "id": "branch_manager",
      "name": "Branch Manager",
      "category": "branch",
      "positionIds": [5],
      "positionNames": ["Branch Manager"],
      "measure": {
        "kind": "monthly_revenue",
        "label": "Monthly bank deposits",
        "unit": "ZMW",
        "period": "monthly",
        "direction": "higher_is_better",
        "autoSource": "revenue_achievement"
      },
      "housingBand": "branch_manager",
      "bonusRuleCode": null,
      "sourceNote": "Whence Managerial Remuneration Guide §2.1 Branch Managers.",
      "tiers": [
        {
          "tier": 1,
          "label": "Tier 1",
          "seniority": "Most Senior",
          "criterion": "K20,000+ monthly bank deposits",
          "measureKind": "monthly_revenue",
          "threshold": 20000,
          "upperThreshold": null,
          "minScopeCount": 1,
          "scopeNote": "Own branch",
          "housing": 3000,
          "status": "approved",
          "sourceNote": "…",
          "payBlock": {
            "code": "branch",
    "grossPay": 19948,
    "approvedGrossPay": 19948,
            "referenceNetPay": 13000,
            "referenceDeductions": { "napsa": 932, "nhima": 186, "paye": 4524, "pension": 1305, "total": 5647 },
            "referenceEmployerCosts": { "…": 0 },
            "referenceTotalCompanyCost": 23733,
            "referenceHousing": 2500,
            "allowances": [
              { "code": "travel", "label": "Travel allowance", "amount": 167, "treatment": "included_in_gross", "taxable": true }
            ]
          }
        }
      ]
    }
  ],
  "payBlocks": { "branch": { /* … */ } },
  "housingBands": {
    "branch_manager": {
      "key": "branch_manager",
      "label": "Branch Manager",
      "byTier": { "1": 3000, "2": 2500, "3": 2000, "4": 1500 },
      "notes": ["Paid directly to the landlord — non-taxable benefit in kind.", "…"]
    }
  },
  "housingPolicy": {
    "heading": "Managerial housing policy",
    "maximumQuarterlyCost": 321000,
    "coverage": "Covers 1 Director, 9 Provincial / Department Heads, 20 District / Department Managers and 1 Branch Manager.",
    "rules": ["…"]
  },
  "bonusRules": [
    {
      "code": "provincial_year_end_bonus",
      "label": "Provincial Manager annual bonus",
      "amount": 10000,
      "period": "annual",
      "appliesToRoleIds": ["provincial_manager"],
      "conditions": [
        { "code": "provincial_efficiency", "label": "Provincial Efficiency ≥ 80%", "threshold": 80, "source": "efficiency-ratio/province/{province_id}" },
        { "code": "provincial_pdua", "label": "PDUA ≥ 80%", "threshold": 80, "source": "portfolio-quality/province/{province_id}" }
      ],
      "payableOn": "End of the financial year, on approval of the annual assessment.",
      "sourceNote": "…"
    }
  ],
  "statutory": {
    "napsa":  { "label": "NAPSA", "employeeRate": 0.05, "employerRate": 0.1, "employeeCap": 1342 },
    "nhima":  { "label": "NHIMA", "employeeRate": 0.01, "employerRate": 0.01 },
    "pension":{ "label": "Saturnia pension", "enabled": true, "employeeRate": 0.05, "employerRate": 0.07 },
    "paye":   { "label": "PAYE", "bands": [ { "upTo": 3000, "rate": 0 }, "…" ], "relief": 0 },
    "medical":{ "label": "OneLife medical scheme", "enabled": false, "monthlyPremium": 658 }
  },
  "incrementPolicy": { "heading": "Key rules on increments", "principles": [], "escalation": [], "monitoring": "…" },
  "allowancePolicy": { "heading": "Allowances", "rule": "…", "scheme": { "pension": "…", "medical": "…" } },
  "confirmationChecklist": [
    { "key": "performance_measurement", "title": "Performance measurement", "question": "…", "status": "open" }
  ],
  "persistence": "mysql" | "in-process",
  "service": {
    "connected": true,
    "error": null,
    "counts": { "tiers": 6, "configs": 66, "activeConfigs": 60, "components": 12, "componentValues": 726, "criteria": 66, "housingBands": 63, "bonusRules": 3 },
    "tiers": [ { "id": 1, "tier_number": 1, "name": "Most Senior", "description": "…", "is_active": 1 } ],
    "configs": [ { "id": 1, "job_position_id": 5, "remuneration_tier_id": 1, "gross_pay": 19948, "target_net_pay": 13000, "threshold_type": "monthly_revenue", "threshold_amount": 20000, "threshold_operator": ">=", "min_branches": 1, "effective_from": "2026-01-01", "status": "active", "position_name": "Branch Manager", "tier_name": "Most Senior", "tier_number": 1 } ],
    "components": [ { "id": 1, "name": "Housing Allowance", "code": "housing", "component_type": "allowance", "paid_by": "employer", "calculation_type": "fixed", "tax_treatment": "non-taxable" } ],
    "componentValues": [ { "remuneration_config_id": 1, "remuneration_component_id": 1, "amount": 3000, "percentage": null, "is_included_in_gross": 0, "is_included_in_company_cost": 1 } ],
    "criteria": [ { "remuneration_config_id": 1, "criterion_name": "K20,000+ monthly bank deposits", "criterion_code": "monthly_revenue_threshold", "measurement_type": "amount", "operator": ">=", "target_value": 20000, "measurement_period": "monthly", "is_mandatory": 1 } ],
    "housingBands": [ { "job_position_id": 5, "remuneration_tier_id": 1, "monthly_limit": 3000, "status": "active" } ],
    "bonusRules": [ { "job_position_id": 2, "bonus_name": "Provincial Manager annual bonus", "bonus_type": "fixed", "amount": 20000, "period": "annual", "status": "active" } ]
  }
}
```

**Notes**

- `status: "approved"` marks a band that the guide states. `status: "proposed"`
  marks a band that the guide does not define; the calculator flags these for
  management confirmation.
- `reference*` fields hold the illustrative figures printed in the guide. They
  are never used as the payable amount — they exist for reconciliation only.
- `persistence` reports which store the server is writing to.
- `service` holds the remuneration configuration read from the remuneration
  service. When `service.connected` is `false` the module falls back to the
  approved structure above.

---

### GET /api/remuneration/managers

Returns the manager registry: staff records from the source system merged
with the assignments recorded by the administrator.

**Query parameters**

| Name | Type | Description |
|------|------|-------------|
| `role` | string | Filter by remuneration role id (`branch_manager`, `district_manager`, …) |
| `search` | string | Filter on name, email, office, district or province |
| `scope` | string | `registered` returns only administrator maintained assignments |

**Response `data`:**

```jsonc
{
  "managers": [
    {
      "id": "office-2163",
      "userId": 2163,
      "fullName": "Takazo Siyunda",
      "email": "siyundatakazo@gmail.com",
      "roleId": "branch_manager",
      "roleName": "Branch Manager",
      "scope": {
        "officeId": 1,
        "officeName": "ZIMCO HOUSE LUSAKA",
        "districtId": null,
        "districtName": null,
        "provinceId": 1,
        "provinceName": "Lusaka",
        "department": "ZIMCO HOUSE LUSAKA",
        "branchCount": 1
      },
      "appointmentDate": null,
      "acting": false,
      "effectiveFrom": null,
      "effectiveTo": null,
      "status": "active",
      "source": "office_appointment",
      "registeredId": null,
      "previousTier": null,
      "createdAt": "2026-10-20T08:00:00.000Z",
      "updatedAt": "2026-10-20T08:00:00.000Z"
    }
  ],
  "offices": [ { "id": 1, "name": "ZIMCO HOUSE LUSAKA", "province_id": 1, "district_id": null } ],
  "districts": [ { "id": 53, "name": "Lusaka District", "provinceId": 1 } ],
  "service": {
    "connected": true,
    "error": null,
    "assignments": [
      {
        "userId": 2163,
        "assignmentId": 6,
        "approvalStatus": "approved",
        "actingCapacity": false,
        "effectiveFrom": "2026-01-01",
        "effectiveTo": null,
        "positionId": 5,
        "positionName": "Branch Manager",
        "configId": 1,
        "tier": 1,
        "tierName": "Most Senior",
        "grossPay": 19948,
        "notes": "Takazo Siyunda — branch manager appointed to ZIMCO HOUSE LUSAKA."
      }
    ],
    "counts": { "total": 85, "approved": 85, "pending": 0 }
  },
  "counts": { "total": 92, "registered": 0, "acting": 0 }
}
```

**Sources**

- `source: "staff_record"` — the person holds a managerial position in the staff records.
- `source: "office_appointment"` — the person is appointed to a branch office.
- `source: "registered"` — the administrator recorded the assignment, or an
  administrator assignment overrides the staff record for the same person.

**Notes**

- `id` is always the id of the underlying record (`staff-42`, `office-2163`), so
  the same person keeps one row in the registry.
- `registeredId` is the id of the administrator maintained assignment behind the
  row, or `null` when the person only exists in the staff records. Use it to
  update an assignment: `PATCH /api/remuneration/managers/{registeredId}`.
- A registered assignment that overrides a staff record keeps the staff scope
  fields it does not replace (`branchCount` falls back to the staff record).
- `service.assignments` holds the payroll assignment of each manager as held by
  the remuneration service, matched on the employee id. It carries the package,
  the tier, the gross pay and the approval status used by the payroll run.

---

### POST /api/remuneration/managers

Registers or updates a managerial assignment: the manager, the managerial
position, the province / district / branch scope, the appointment date, the
acting status and the effective remuneration period.

**Request body**

```jsonc
{
  "id": "mgr_abc123",            // optional — omit to create a new assignment
  "userId": 2163,                // optional — links the assignment to a staff record
  "fullName": "Takazo Siyunda",
  "email": "siyundatakazo@gmail.com",
  "roleId": "district_manager",
  "scope": {
    "officeId": null,
    "officeName": null,
    "districtId": 53,
    "districtName": "Lusaka District",
    "provinceId": 1,
    "provinceName": "Lusaka",
    "branchCount": 3
  },
  "appointmentDate": "2026-01-15",
  "acting": false,
  "effectiveFrom": "2026-01-01",
  "effectiveTo": null,
  "status": "active",
  "previousTier": 2
}
```

**Response `data`:** the saved `ManagerProfile`, with `serviceAssignmentId` when
the remuneration service holds an assignment for the manager.

**Validation**

- `fullName` is required.
- `roleId` must exist in the approved structure.
- The assignment is written to the audit trail (`manager.registered` /
  `manager.updated`).

**Notes**

- Sending `userId` for a person who already has an assignment updates that
  assignment instead of creating a second one.
- Fields that are omitted keep their current value — a request without `scope`
  does not clear the recorded scope.
- When the manager has a staff record and no service assignment yet, the
  assignment is also created in the remuneration service against the salary
  package of the managerial position, with the approval status `pending`. The
  service assignment id is returned and written to the audit trail as
  `manager.service_assigned`.

---

### PATCH /api/remuneration/managers/[id]

Updates an existing assignment. Accepts any subset of the fields accepted by
`POST /api/remuneration/managers`.

```jsonc
{ "acting": true, "previousTier": 3, "effectiveFrom": "2026-10-01" }
```

**Extra field**

| Name | Type | Description |
|------|------|-------------|
| `approveServiceAssignment` | boolean | Approves the manager's assignment in the remuneration service so the payroll run picks it up. |

**Response `data`:** the updated `ManagerProfile`, with `serviceApproved`.

**Notes**

- `[id]` may be the administrator assignment id (`mgr_abc123`) or the registry
  row id (`staff-42`). A registry id is resolved to the administrator
  assignment for the same person; if there is none, the request returns `404`.

---

### GET /api/remuneration/performance

Returns the measured results used for tier qualification plus the supporting
evidence for the measures management verifies manually.

**Query parameters**

| Name | Required | Description |
|------|----------|-------------|
| `managerId` | yes | The manager profile id |
| `period` | no | Pay period (`YYYY-MM`), defaults to the current month |

**Response `data`:**

```jsonc
{
  "manager": { /* ManagerProfile */ },
  "role": { /* RoleDefinition */ },
  "performance": {
    "value": 273392.28,
    "period": "2026-10",
    "source": "revenue-achievement/5",
    "measures": [
      {
        "code": "revenue",
        "label": "Monthly bank deposits",
        "unit": "ZMW",
        "value": 273392.28,
        "target": 418600,
        "period": "2026-10-01 to 2026-10-31",
        "source": "revenue-achievement/5",
        "verified": true,
        "note": ""
      }
    ],
    "manualTier": null,
    "overrideReason": null,
    "efficiencyScore": null,
    "pduaScore": null,
    "branchCount": 3
  },
  "evidence": {
    "revenue": { "value": 273392.28, "target": 418600, "score": 65.31, "period": "2026-10-01 to 2026-10-31", "source": "revenue-achievement/5", "available": true, "message": "" },
    "efficiency": { "value": 0.55, "target": 55, "source": "efficiency-ratio/5", "available": true, "message": "" },
    "portfolioQuality": { "value": 0, "target": null, "source": "portfolio-quality/5", "available": true, "message": "" }
  },
  "officesInScope": 3
}
```

**Notes**

- `value` is `null` when the measure cannot be automated. The administrator then
  enters the result manually and the system records `source: "manual"` and
  raises a validation flag.
- `evidence.efficiency` and `evidence.portfolioQuality` are supporting evidence
  only. They are never used to satisfy a bonus condition automatically — the
  verified percentage is entered by the administrator.

---

### POST /api/remuneration/calculate

Runs the calculation engine for one manager and period.

**Request body**

```jsonc
{
  "managerId": "office-2163",
  "period": "2026-10",
  "performance": {
    "value": 273392.28,          // null to clear an auto-fetched value
    "manualTier": null,          // set a tier explicitly for non-numeric criteria
    "overrideReason": "Board-level advisorship confirmed by the Board minute.",
    "efficiencyScore": 82,       // verified percentage for the bonus condition
    "pduaScore": 85,
    "branchCount": 3,
    "source": "manual"
  },
  "previousTier": 2,             // tier earned last period (drives the housing rule)
  "statutory": {                // optional rule overrides
    "napsa": { "employeeRate": 0.05, "employerRate": 0.1 },
    "nhima": { "employeeRate": 0.01, "employerRate": 0.01 },
    "pension": { "enabled": true, "employeeRate": 0.05, "employerRate": 0.07 },
    "paye": { "relief": 0 },
    "medical": { "enabled": false, "monthlyPremium": 658 }
  }
}
```

**Response `data`:**

```jsonc
{
  "computation": {
    "managerId": "office-2163",
    "managerName": "Takazo Siyunda",
    "roleId": "branch_manager",
    "roleName": "Branch Manager",
    "period": "2026-10",

    "qualification": {
      "tier": 1,
      "label": "Tier 1",
      "seniority": "Most Senior",
      "criterion": "K20,000+ monthly bank deposits",
      "basis": "threshold",
      "reason": "Result of K273,392 meets K20,000+ monthly bank deposits.",
      "achievementPct": 1366.96,
      "status": "approved",
      "nextTier": null,
      "evaluatedTiers": [
        { "tier": 1, "label": "Tier 1", "criterion": "…", "matched": true, "reason": "…" }
      ]
    },

    "grossPay": 19948,

    "deductions": { "napsa": 932, "nhima": 199, "paye": 4406, "pension": 997, "total": 6534 },

    "netCashPay": 13414,

    "benefits": {
      "housing": 3000,
      "travel": 167,
      "fuel": 0,
      "lifeInsurance": 0,
      "medical": 0,
      "total": 3000,
      "includedInGross": 167
    },

    "totalDirectValue": 16414,

    "employerCosts": { "napsa": 1995, "nhima": 199, "paye": 0, "pension": 1396, "total": 3590 },

    "totalCompanyCost": 26538,

    "bonus": {
      "ruleCode": null,
      "label": null,
      "amount": 0,
      "eligible": false,
      "reason": "No annual bonus rule applies to this role.",
      "conditions": [],
      "payableOn": null
    },

    "housing": {
      "band": "branch_manager",
      "bandLabel": "Branch Manager",
      "tierHousing": 3000,
      "paidHousing": 3000,
      "continuityAdjustment": 0,
      "continuityApplied": false,
      "note": "Housing paid directly to the landlord at the Tier 1 limit of K3,000."
    },

    "reference": {
      "netPay": 13000,
      "totalCompanyCost": 23733,
      "netVariance": 414,
      "netVariancePct": 3.18,
      "costVariance": 2805,
      "costVariancePct": 11.82
    },

    "flags": [
      { "code": "reference_variance_cost", "severity": "info", "message": "Total company cost differs from the guide's illustrative figure by +11.82%." }
    ],

    "payroll": {
      "source": "remuneration-service",
      "assignmentId": 6,
      "assignmentStatus": "approved",
      "packageTier": 1,
      "packageLabel": "Most Senior",
      "positionLabel": "Branch Manager",
      "grossPay": 19948,
      "employeeDeductions": 6534,
      "netCashPay": 13414,
      "housing": 3000,
      "totalDirectValue": 16414,
      "employerContributions": 3590,
      "totalCompanyCost": 26538,
      "components": [
        { "code": "housing", "name": "Housing Allowance", "componentType": "allowance", "paidBy": "employer", "calculationType": "fixed", "amount": 3000, "includedInGross": false, "includedInCompanyCost": true }
      ],
      "period": "2026-10",
      "note": null
    },

    "payrollVariance": {
      "grossPay": 0,
      "netCashPay": 0,
      "totalCompanyCost": 0,
      "netCashPayPct": 0,
      "totalCompanyCostPct": 0,
      "packageMatchesTier": true,
      "note": "The engine and the remuneration service agree on the net pay and the company cost."
    },

    "generatedAt": "2026-10-20T08:12:00.000Z"
  },
  "scopeLabel": "ZIMCO HOUSE LUSAKA",
  "manager": { /* ManagerProfile */ },
  "performance": { /* the performance actually used */ }
}
```

**Notes**

- `qualification.basis` is one of `threshold`, `manual_override`, `scope` or
  `unqualified`.
- `qualification.nextTier` is populated when the result does not reach a band,
  with the shortfall against the next band.
- `flags` carry the validation issues that must be cleared before payroll:
  `error`, `warning` or `info`.
- `approvedGrossPay` is the gross attached to the tier in the approved
  structure. `grossPay` is the gross actually payable: the two differ when the
  housing continuity rule applies, because the housing difference is deducted
  from salary before the statutory deductions are computed.
- `payroll` is the figure the remuneration service will pay, read from the
  manager's assignment. It is `null` when the manager has no service assignment
  or the service is unreachable.
- `payrollVariance` is the difference between the two figures, and says so
  plainly when they disagree. When the assessment did not qualify a tier the
  engine figure is nil, so the two cannot be reconciled and the variance says
  exactly that instead of reporting a match.

---

### GET /api/remuneration/statements

Returns the calculation history.

**Query parameters**

| Name | Description |
|------|-------------|
| `period` | Filter by pay period (`YYYY-MM`) |
| `status` | Filter by `draft`, `pending_approval`, `approved`, `rejected` or `finalised` |

**Response `data`:**

```jsonc
{
  "statements": [ { /* RemunerationStatement */ } ],
  "counts": { "total": 12, "pendingApproval": 3, "approved": 5, "rejected": 1, "finalised": 3 }
}
```

A `RemunerationStatement` is a `RemunerationComputation` plus:

```jsonc
{
  "id": "stmt_l8x2k4",
  "status": "pending_approval",
  "scopeLabel": "ZIMCO HOUSE LUSAKA",
  "createdBy": "Administrator",
  "createdAt": "2026-10-20T08:12:00.000Z",
  "updatedAt": "2026-10-20T08:12:00.000Z",
  "approvedBy": null,
  "approvedAt": null,
  "rejectionReason": null
}
```

---

### POST /api/remuneration/statements

Saves a calculated statement. The calculation is **re-run on the server**, so a
statement can never be stored with an amount that the engine did not produce.

**Request body:** the same shape as `POST /api/remuneration/calculate`, plus:

```jsonc
{ "status": "pending_approval", "createdBy": "Administrator" }
```

Saving the same manager for the same period replaces the earlier statement and
keeps the original id and creation time.

**Response `data`:** the saved `RemunerationStatement`.

---

### GET /api/remuneration/statements/[id]

Returns one statement with its audit trail.

**Response `data`:** `{ "statement": { … }, "audit": [ { "id": "aud_…", "action": "statement.approved", "actor": "…", "detail": "…", "at": "…" } ], "assessments": [ { "id": 1, "employee_id": 4, "assessment_month": "2026-10", "gross_pay": 19948, "net_pay": 13414, "total_company_cost": 26538, "status": "approved" } ] }`

`assessments` holds the monthly assessments recorded in the remuneration
service for this statement.

---

### PATCH /api/remuneration/statements/[id]

Moves a statement through the approval workflow.

**Request body**

```jsonc
{ "status": "approved", "actor": "Payroll Administrator" }
```

**Allowed transitions**

| From | To |
|------|----|
| `draft` | `pending_approval`, `rejected` |
| `pending_approval` | `approved`, `rejected`, `draft` |
| `approved` | `finalised`, `rejected` |
| `rejected` | `pending_approval`, `draft` |
| `finalised` | — (a finalised statement cannot be changed) |

Rejections must carry a `reason`, which is stored on the statement and written
to the audit trail.

**Validation**

A statement that still carries an `error` flag cannot be approved or
finalised. The transition is refused with `409 Conflict` and the offending
flags are returned, so a statement with an unqualified tier, a missing
performance result or an invalid manual tier never reaches payroll:

```jsonc
{
  "success": false,
  "message": "This statement cannot be approved while a validation error stands. …",
  "errors": [ { "code": "tier_unqualified", "message": "The result does not reach …" } ]
}
```

Warnings — a manually entered result, a manual tier override, a bonus that is
not yet eligible — do not block the approval, but they are shown to the
approver and recorded in the audit trail.

**Service synchronisation**

Moving a statement to `approved` or `finalised` also updates the remuneration
service: the manager's assignment is approved for payroll and the monthly
assessment is recorded there. The service result is written to the audit trail
as `statement.service_sync`. When the service cannot be reached the statement
is still approved and the failure is recorded as `statement.service_error`, so
a statement is never blocked by a service outage.

**Response `data`:** the updated `RemunerationStatement`.

---

### GET /api/remuneration/summary

Returns the consolidated management payroll report for the institution.

**Query parameters**

| Name | Description |
|------|-------------|
| `period` | Filter by pay period; omit for every period |
| `format` | `csv` returns the payroll ready export |

**Response `data`**

```jsonc
{
  "period": "2026-10",
  "totals": {
    "statements": 12,
    "managers": 12,
    "grossPay": 482913,
    "employeeDeductions": 96320,
    "netCashPay": 386593,
    "housing": 45000,
    "benefits": 58200,
    "bonus": 0,
    "employerCosts": 64120,
    "totalCompanyCost": 605233,
    "totalDirectValue": 431593
  },
  "byRole": [ { "key": "branch_manager", "label": "Branch Manager", "count": 9, "grossPay": 179532, "netCashPay": 143000, "totalCompanyCost": 231000 } ],
  "byTier": [ { "key": "tier-1", "label": "Tier 1", "count": 4, "grossPay": 180000, "netCashPay": 140000, "totalCompanyCost": 230000 } ],
  "byStatus": [ { "status": "approved", "count": 5 } ],
  "periods": ["2026-10", "2026-09"],
  "statements": [ { /* RemunerationStatement */ } ],
  "service": {
    "connected": true,
    "error": null,
    "overview": { "tiers": 6, "active_configs": 60, "active_components": 12, "approved_assignments": 85 },
    "totals": { "statements": 12, "unqualified": 1, "grossPay": 482913, "netCashPay": 386593, "housing": 45000, "employerContributions": 64120, "totalCompanyCost": 605233 }
  }
}
```

`service` holds the remuneration service view of the same period: the service
overview (its tiers, its active packages, its components and its approved
assignments) and the service payroll totals of the statements in the report,
so the engine figures and the service figures sit side by side. A statement
that did not qualify a tier carries a nil engine figure, so it is counted in
`unqualified` and left out of the service totals — the two columns always
cover the same set of managers.

**CSV export**

`GET /api/remuneration/summary?period=2026-10&format=csv` returns a
`text/csv` attachment with one row per manager and the columns:

```
Period, Manager, Role, Scope, Tier, Approved tier gross, Housing continuity,
Gross pay, PAYE, NAPSA, NHIMA, Pension, Employee deductions, Net cash pay,
Housing, Travel, Fuel, Life insurance, Total direct value, Employer
contributions, Bonus, Total company cost, Status, Approved by, Service gross
pay, Service net cash pay, Service company cost
```

---

## Upstream data sources

The module reads performance results from the live backend
(`https://smartbackend.whencefinancesystem.com`, overridable with
`BACKEND_API_URL`).

| Source | Used for |
|--------|----------|
| `GET /offices` | Branch hierarchy, province and district mapping |
| `GET /staff` | Staff records holding a managerial position |
| `GET /office-users/{officeId}` | Managers appointed to each office |
| `GET /districts` | District names |
| `GET /revenue-achievement/{officeId}` | Monthly revenue for a branch |
| `GET /efficiency-ratio/{scope}` | Efficiency evidence (bonus conditions) |
| `GET /portfolio-quality/{scope}` | Portfolio quality / PDUA evidence |

Every call is cached for five minutes and degrades gracefully: when an
endpoint is unavailable the measure is reported as unavailable and the
administrator enters the result manually.

---

## Remuneration service integration

The remuneration service (`smart-backend`) is the system of record for the
payroll side of the framework. The module reaches it from the server side
only — the browser never calls the service directly.

| Setting | Value |
|---------|-------|
| Base URL | `REMUNERATION_API_URL`, default `http://localhost:5000/api/remuneration` |
| Adapter | `src/lib/remuneration/backend.ts` |
| Bridge | `src/lib/remuneration/payroll.ts` |

### Which service endpoint backs which area of the module

| Module area | Service endpoints used | How it is used |
|-------------|------------------------|----------------|
| Structure | `GET /tiers`, `GET /configs`, `GET /components`, `GET /component-values`, `GET /criteria`, `GET /housing-bands`, `GET /bonus-rules` | The Structure page displays the salary packages, components, criteria, housing bands and bonus rules the service actually pays from. The approved guide structure remains the fallback when the service is unreachable. |
| Managers | `GET /assignments`, `POST /assignments`, `PUT /assignments/{id}/approve` | The registry shows each manager's payroll package, tier and approval status. Registering an assignment creates the service assignment; the Approve action approves it for payroll. |
| Calculator | `GET /calculate/{assignment_id}?period=YYYY-MM-DD` | The service figure is read alongside the engine figure and both are shown on the statement with a reconciliation. |
| Approvals | `POST /assessments`, `GET /assessments` | Approving or finalising a statement approves the service assignment and records the monthly assessment there. The service assessment trail is displayed with the audit trail. |
| Reports | `GET /` (overview) | The reports page shows the service overview and the service payroll totals next to the engine totals. |

### Seeding the service

The service ships empty. The approved structure is published into it with:

```bash
npm run seed:remuneration
```

The script creates the six tiers, the twelve components, the position salary
packages with their component values and criteria, the housing bands, the bonus
rules and an assignment for every manager in the registry. It is additive and
safe to re-run.

### Two figures, one statement

The statement carries both figures and explains the difference:

- **Engine figure** — the assessment result: tier qualification, performance
  evidence, housing continuity, bonus eligibility and the validation flags.
- **Service figure** — the payroll result: the gross, deductions, net pay,
  housing, employer contributions and company cost the service calculates from
  the employee's assignment, its configuration and the configured component
  values.

`payrollVariance` holds the difference. It also flags an assignment that still
points at a different package than the tier the manager qualified for, and an
assignment that is not approved for payroll.

> **Known service behaviour:** the service includes the housing allowance in
> both the employer contributions and the housing line, so its total company
> cost carries the housing twice. The engine counts it once. The variance note
> calls this out on every statement so the two figures reconcile.

---

## Calculation rules

Implemented in `src/lib/remuneration/calculator.ts`.

| Calculation | Rule |
|-------------|------|
| Tier qualification | Compare the verified result with the role thresholds. The most senior matching band wins. A band whose measure kind differs from the role measure, or whose scope requirement is not met, is not matched automatically. |
| Gross pay | The approved gross salary for the qualifying tier and pay period, less any housing continuity adjustment (reported separately as `approvedGrossPay`). |
| Employee deductions | PAYE (progressive bands), NAPSA (employee rate, capped), NHIMA (employee rate) and the pension contribution. |
| Net cash pay | Gross pay − employee deductions. A housing continuity adjustment is deducted from gross pay before tax. |
| Housing benefit | The tier housing limit from the Managerial Housing Policy, paid directly to the landlord. |
| Housing continuity | A manager who drops to a lower tier keeps the higher tier housing, and the difference is deducted from their salary before the statutory deductions are computed. |
| Annual bonus | The role's bonus rule and its conditions (efficiency, PDUA, branch scope) must all be met. |
| Total monthly company cost | Gross pay + employer statutory contributions + employer pension contribution + housing payment + employer paid benefits. |
| Double counting | Travel and fuel allowances are inside gross pay and are never added again. Life insurance and medical are employer paid benefits outside gross pay. |
| Manual tier | The administrator may assign a tier by hand for a role whose measure cannot be read from the source system. The override needs a reason, is recorded on the statement and raises a `manual_tier_override` warning. |
| Unqualified result | A result that reaches no band leaves the engine figure nil and raises a `tier_unqualified` error. The statement can be recorded and rejected, but it cannot be approved until the underlying result is corrected and the statement recalculated. |

---

## Persistence

Statements, manager assignments and the audit trail are written to MySQL when
the schema is available and to an in-process store when it is not. The active
store is reported by `GET /api/remuneration/structure` → `data.persistence`.

The remuneration configuration itself is not persisted by the module: it lives
in the remuneration service (see
[Remuneration service integration](#remuneration-service-integration)).

Schema (created automatically):

```sql
CREATE TABLE IF NOT EXISTS remuneration_manager_profiles (
  id VARCHAR(64) PRIMARY KEY,
  user_id INT NULL,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(160) NULL,
  role_id VARCHAR(64) NOT NULL,
  role_name VARCHAR(120) NOT NULL,
  scope JSON NULL,
  appointment_date DATE NULL,
  acting TINYINT(1) NOT NULL DEFAULT 0,
  effective_from DATE NULL,
  effective_to DATE NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  previous_tier INT NULL,
  payload JSON NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS remuneration_statements (
  id VARCHAR(64) PRIMARY KEY,
  period VARCHAR(10) NOT NULL,
  manager_id VARCHAR(64) NOT NULL,
  manager_name VARCHAR(160) NOT NULL,
  role_id VARCHAR(64) NOT NULL,
  role_name VARCHAR(120) NOT NULL,
  scope_label VARCHAR(255) NULL,
  tier INT NULL,
  tier_label VARCHAR(40) NULL,
  gross_pay DECIMAL(14,2) NOT NULL DEFAULT 0,
  employee_deductions DECIMAL(14,2) NOT NULL DEFAULT 0,
  net_cash_pay DECIMAL(14,2) NOT NULL DEFAULT 0,
  housing DECIMAL(14,2) NOT NULL DEFAULT 0,
  benefits DECIMAL(14,2) NOT NULL DEFAULT 0,
  bonus DECIMAL(14,2) NOT NULL DEFAULT 0,
  employer_costs DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_company_cost DECIMAL(14,2) NOT NULL DEFAULT 0,
  status VARCHAR(24) NOT NULL DEFAULT 'draft',
  payload JSON NULL,
  created_by VARCHAR(160) NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS remuneration_audit_log (
  id VARCHAR(64) PRIMARY KEY,
  statement_id VARCHAR(64) NULL,
  manager_id VARCHAR(64) NULL,
  action VARCHAR(80) NOT NULL,
  actor VARCHAR(160) NOT NULL,
  detail TEXT NULL,
  created_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Database credentials are read from `DB_HOST`, `DB_PORT`, `DB_DATABASE`,
`DB_USERNAME` and `DB_PASSWORD`.

---

## Error handling

| Status | When |
|--------|------|
| `400` | Missing or invalid parameters (unknown role id, invalid transition) |
| `404` | Manager or statement not found |
| `409` | The statement carries an unresolved validation error, so it cannot be approved or finalised |
| `500` | Unexpected server error |

Error body:

```json
{ "success": false, "message": "Manager not found in the registry." }
```

A `409` adds the offending validation flags:

```json
{
  "success": false,
  "message": "This statement cannot be approved while a validation error stands. …",
  "errors": [ { "code": "tier_unqualified", "message": "The result does not reach …" } ]
}
```

A failed upstream performance call never fails the request — the measure is
returned as unavailable so the administrator can enter the result manually.
