```bash
# Basic call (defaults to current cycle dates)
curl "http://localhost:3000/api/performance/consultants-performance-by-user?user_id=42"

# With custom date range
curl "https://smartbackend.whencefinancesystem.com//api/performance/consultants-performance-by-user?user_id=42&start_date=2026-10-01&end_date=2026-10-31"
```

**Query parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | **Yes** | Consultant user ID |
| `start_date` | string | No | Cycle start date (`YYYY-MM-DD`). Defaults to consultant's cycle-derived range. |
| `end_date` | string | No | Cycle end date (`YYYY-MM-DD`). Defaults to consultant's cycle-derived range. |

The endpoint is mounted at `/api/performance` in `index.js:355`, so no additional registration is needed. Response returns a single consultant object (not an array) under `data`, including the new fields `active_loans_count`, `closed_loans_count`, and `clients_with_active_loans`.