# Performance API

Base path: `GET /api/performance/consultants-performance-by-office`

Retrieves consultant loan-performance metrics grouped by office.

## Request

```
GET /api/performance/consultants-performance-by-office?office_id=1&start_date=2026-10-01&end_date=2026-10-31
```

### Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `office_id` | string | **Yes** | Office ID. Returns `400` if missing. |
| `start_date` | string | No | Cycle start date (`YYYY-MM-DD`). Defaults to the consultant's cycle-derived date range. |
| `end_date` | string | No | Cycle end date (`YYYY-MM-DD`). Defaults to the consultant's cycle-derived date range. |

When `start_date`/`end_date` are omitted, the cycle range is derived per consultant from `cycle_dates.cycle_end_date` (default day `24` when missing). The previous-cycle range is one month earlier than the current range.

## Response

```json
{
  "data": [
    {
      "user_id": 101,
      "office": 1,
      "province": 5,
      "district": 12,
      "name": "John Doe",
      "total_uncollected": "1200.00",
      "test_total_uncollected": "800.00",
      "test_still_uncollected": "600.00",
      "total_collected": "900.00",
      "still_uncollected": "300.00",
      "given_out": "5000.00",
      "pdua": "0.75",
      "total_reloans": 3,
      "total_part_payments": 5,
      "total_full_payments": 2,
      "total_recovery": 1,
      "carry_over": 200,
      "target_met_current": 1,
      "target_history": [1, 0, 1, 1, 0],
      "cycle_end_on": "24"
    }
  ]
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | int | Consultant user ID |
| `office` | int | Office ID (`users.office_id`) |
| `province` | int | Province ID (`offices.province_id`) |
| `district` | int | District ID (`offices.district_id`) |
| `name` | string | Full name (first + last) |
| `total_uncollected` | string | Total uncollected amount (2 decimals) |
| `test_total_uncollected` | string | Previous-cycle total uncollected (2 decimals) |
| `test_still_uncollected` | string | Previous-cycle still-uncollected from test loans (2 decimals) |
| `total_collected` | string | Total collected amount (2 decimals) |
| `still_uncollected` | string | `total_uncollected - total_collected` (2 decimals) |
| `given_out` | string | Amount given out including carry-over (2 decimals) |
| `pdua` | string | `total_collected / total_uncollected`, `0` when uncollected is `0` (2 decimals) |
| `total_reloans` | int | Count of `loan_transactions` with `payment_apply_to = 'reloan_payment'` in cycle |
| `total_part_payments` | int | Count of `loan_transactions` with `payment_apply_to = 'part_payment'` in cycle |
| `total_full_payments` | int | Count of `loan_transactions` with `payment_apply_to = 'full_payment'` in cycle |
| `total_recovery` | int | Count of `loan_transactions` where `is_recovery = 1 OR recovery = 1` in cycle |
| `carry_over` | number | Active carry-over amount for cycle start date |
| `target_met_current` | int | `1` if target met in current cycle, else `0` |
| `target_history` | int[] | Length-5 array (`1`/`0`) for the previous 5 cycles |
| `cycle_end_on` | mixed | Consultant's cycle end date from `cycle_dates` |

## Errors

| Status | Body | Meaning |
|--------|------|---------|
| 400 | `{ "error": "office_id is required" }` | `office_id` missing |
| 500 | `{ "error": "Something went wrong." }` | Server error |

## Example with curl

```bash
curl "http://localhost:3000/api/performance/consultants-performance-by-office?office_id=1&start_date=2026-10-01&end_date=2026-10-31"
```

## Registration

Mounted in `index.js`:

```js
const performanceRouter = require('./api/performance');
app.use('/api/performance', performanceRouter);
```

---

## Endpoint

```
GET https://lms2backend.whencefinancesystem.com/consultants-performance-by-office
```

### Query Parameters

| Parameter    | Type   | Required | Description                                 |
|-------------|--------|----------|---------------------------------------------|
| `office_id`  | int    | Yes      | The branch/office ID to fetch consultants for |
| `start_date` | string | Yes      | Period start date — format `YYYY-MM-DD`     |
| `end_date`   | string | Yes      | Period end date — format `YYYY-MM-DD`       |

### Example Request

```
GET https://lms2backend.whencefinancesystem.com/consultants-performance-by-office?office_id=5&start_date=2026-10-01&end_date=2026-10-31
```

---

## When It's Called

The request is fired client-side (via `fetch`) when the user clicks the yellow **expand** button on a branch row in the Provincial Performance table. Consultants are loaded lazily — only once per branch, on first expand.

---

## Response Structure

```json
{
    "data": [
        {
            "user_id": 42,
            "name": "Jane Doe",
            "total_uncollected": 15000.00,
            "total_collected": 12000.00,
            "still_uncollected": 3000.00,
            "given_out": 25000.00,
            "carry_over": 2000.00,
            "pdua": 0.12,
            "target_met_current": 1,
            "target_history": [1, 0, 1, 1, 0],
            "cycle_end_on": "2026-10-31"
        }
    ]
}
```

### Top-Level

| Field  | Type  | Description                          |
|--------|-------|--------------------------------------|
| `data` | array | Array of consultant performance objects |

### Consultant Object (`data[]`)

| Field                | Type         | Description                                                                 |
|---------------------|--------------|-----------------------------------------------------------------------------|
| `user_id`            | int          | Internal user ID — used to link to `/user/{id}/staff_info`                 |
| `name`               | string       | Consultant's full name                                                       |
| `total_uncollected`  | float        | Opening uncollected balance at cycle start                                  |
| `total_collected`    | float        | Total amount collected during the cycle                                     |
| `still_uncollected`  | float        | Remaining uncollected (`total_uncollected - total_collected`)               |
| `given_out`          | float        | Total loans given out during the cycle                                      |
| `carry_over`         | float        | Amount carried over from previous cycle                                     |
| `pdua`               | float        | Past Due Amount ratio as a decimal — multiply by 100 for percentage display |
| `target_met_current` | int          | `1` = target met for current cycle, `0` = not met                          |
| `target_history`     | array of int | Historical target results — newest first. `1` = met, `0` = missed          |
| `cycle_end_on`       | string       | Cycle end date — format `YYYY-MM-DD`                                        |

---

## How the View Uses the Response

### Banding by `given_out`

Consultants are grouped into bands based on their `given_out` value:

| Band Label    | Range                    |
|--------------|--------------------------|
| Below 10,000 | 0 – 9,999.99             |
| 10,000       | 10,000 – 19,999.99       |
| 20,000       | 20,000 – 29,999.99       |
| 30,000       | 30,000 – 39,999.99       |
| 40,000+      | 40,000 and above         |

Bands with no consultants are skipped.

### Target History Circles

Each value in `target_history` is rendered as a coloured dot:

| Value | Colour  | Meaning     |
|-------|---------|-------------|
| `1`   | Green   | Target met  |
| `0`   | Red     | Target missed |
| other | Grey    | No data     |

If the history array has fewer than 5 entries, the remaining dots are padded with grey.

### Target Met Badge

| `target_met_current` | Badge             |
|---------------------|-------------------|
| `1`                 | `Met` (green)     |
| `0`                 | `Not Met` (grey)  |

---

## Error Handling

If the request fails or the network throws an error, the consultant panel shows:

```
Failed to load consultant data.
```

The full error is logged to the browser console via `console.error`.
