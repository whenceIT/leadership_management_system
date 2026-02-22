API Endpoint: GET /monthly-disbursement

Query Parameters:

user_id (optional): User ID (branch manager) - will auto-detect office_id
office_id (required if no user_id): Branch office ID
period_start (optional): Start date (YYYY-MM-DD), defaults to current month start
period_end (optional): End date (YYYY-MM-DD), defaults to current month end
target (optional): Target amount, defaults to K450,000
Example Usage:

GET /monthly-disbursement?user_id=123
GET /monthly-disbursement?office_id=5
GET /monthly-disbursement?office_id=5&period_start=2026-02-01&period_end=2026-02-28&target=500000
Response includes:

Current period disbursement total and count
Previous period comparison for trend analysis
Target achievement percentage with status indicator (✓ On Track / ⚠ At Risk / ✗ Below Target)
Projection data (days remaining, required daily rate)
Breakdown by loan product and loan officer
Daily disbursement trend


Status Indicators:

Status	Condition
✓ On Track	≥ 100% of target
⚠ At Risk	70-99% of target
✗ Below Target	< 70% of target
