# Branch Stats API

## Endpoint

`GET https://smartbackend.whencefinancesystem.com/branch-stats?office_id={office_id}`

## Query Parameters

- `office_id` (number, required): Branch office identifier.

## Example Request

`GET https://smartbackend.whencefinancesystem.com/branch-stats?office_id=3`

## Response Shape

```json
{
  "success": true,
  "data": {
    "office_id": 2,
    "total_staff": 27,
    "staff_on_leave": 9,
    "pending_loans": 1,
    "disbursed_loans": 358,
    "active_clients": 1419,
    "pending_advances": 0,
    "approved_advances": 3,
    "pending_expenses": 0,
    "open_tickets": 111,
    "loan_portfolio": "792322.2000",
    "pending_transactions": 11493
  }
}
```

## Field Notes

- `loan_portfolio` is returned as a string numeric value and should be formatted for UI display.
- `pending_transactions` can be large and should be displayed with thousand separators.
- This endpoint maps directly to the [`BranchStatsData`](src/services/BranchDataService.ts:195) interface and is consumed by:
  - [`BranchDataService.fetchBranchStats()`](src/services/BranchDataService.ts:401)
  - [`useBranchManagerMetrics()`](src/hooks/useBranchManagerMetrics.ts:20)
