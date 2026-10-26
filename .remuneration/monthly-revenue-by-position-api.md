# Performance Criteria API

Base path: `GET /api/remuneration/performance-creteria`

Calculates total collected amounts (month's revenue) for remuneration based on the employee's job position. The collection logic mirrors `api/performance/index.js`.

## Request

```
GET /api/remuneration/performance-creteria?job_position=branch_manager&office_id=5
```

### Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_position` | string | **Yes** | Position type: `branch_manager`, `province_manager`, `district_manager`, `payroll_manager`, `motor_loans` |
| `user_id` | string | No | Required for `payroll_manager` and `motor_loans` |
| `office_id` | string | No | Required for `branch_manager`, `province_manager`, `district_manager` |
| `start_date` | string | No | Circle start date (`YYYY-MM-DD`). Defaults to 24th of previous month |
| `end_date` | string | No | Circle end date (`YYYY-MM-DD`). Defaults to 24th of current month |

### Circle period default

When `start_date` and `end_date` are omitted, the circle period defaults to:
- **Start:** 24th of the previous month
- **End:** 24th of the current month

---

## Position scopes

### branch_manager
Requires `office_id`. Returns total collected for all active consultants in that office.

```
GET /api/remuneration/performance-creteria?job_position=branch_manager&office_id=5
```

### province_manager
Requires `office_id`. Uses the office's `province_id` to find all offices in the province, then sums `baseTotalOfficeCollected` across each office.

```
GET /api/remuneration/performance-creteria?job_position=province_manager&office_id=5
```

### district_manager
Requires `office_id`. Uses the office's `district_id` to find all offices in the district, then sums `baseTotalOfficeCollected` across each office.

```
GET /api/remuneration/performance-creteria?job_position=district_manager&office_id=5
```

### payroll_manager
Requires `user_id`. Returns total collected for loans where `loan_product_id = 1` AND `staff_id = user_id`.

```
GET /api/remuneration/performance-creteria?job_position=payroll_manager&user_id=42
```

### motor_loans
Requires `user_id`. Returns total collected for loans where `loan_product_id = 0` AND `staff_id = user_id`.

```
GET /api/remuneration/performance-creteria?job_position=motor_loans&user_id=42
```

---

## Example response

```json
{
  "success": true,
  "data": {
    "job_position": "branch_manager",
    "user_id": null,
    "office_id": "5",
    "period": {
      "start_date": "2026-09-24",
      "end_date": "2026-10-24"
    },
    "total_collected": 12450.00,
    "detail": {
      "scope": "office",
      "office_id": "5"
    }
  }
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `job_position` | string | The position type requested |
| `user_id` | string\|null | The user_id passed (for payroll/motor positions) |
| `office_id` | string\|null | The office_id passed (for office/province/district positions) |
| `period.start_date` | string | Circle start date used |
| `period.end_date` | string | Circle end date used |
| `total_collected` | number | Total collected amount (2 decimals) |
| `detail` | object | Scope details used for the calculation |

---
