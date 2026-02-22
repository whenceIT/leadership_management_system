API Endpoint: GET /collections-rate
Query Parameters
Parameter	Required	Description
office_id	Yes	Branch office ID
period_start	No	Start date (YYYY-MM-DD), defaults to current month start
period_end	No	End date (YYYY-MM-DD), defaults to current month end
target_rate	No	Target collections rate (default: 93.0)
Example Request
GET /collections-rate?office_id=1&period_start=2026-01-01&period_end=2026-01-31&target_rate=93
Response Structure
{
  "success": true,
  "data": {
    "metric": "Collections Rate",
    "office_id": 1,
    "period": { "start_date": "2026-01-01", "end_date": "2026-01-31" },
    "current_period": {
      "total_collected": 850000,
      "total_expected": 900000,
      "collection_rate": 94.5,
      "formatted_rate": "94.50%",
      "loans_with_payments": 180,
      "loans_with_due": 200
    },
    "previous_period": {
      "collection_rate": 92.0,
      "formatted_rate": "92.00%"
    },
    "breakdown": {
      "principal": { "collected": 700000, "expected": 750000 },
      "interest": { "collected": 120000, "expected": 120000 },
      "fees": { "collected": 20000, "expected": 20000 },
      "penalty": { "collected": 10000, "expected": 10000 }
    },
    "trend": {
      "change_from_last_month": 2.5,
      "change_from_target": 1.5,
      "formatted_change": "+1.5% from target",
      "direction": "improving"
    },
    "target": {
      "rate": 93.0,
      "status": "exceeding_target",
      "variance": 1.5
    },
    "daily_trend": [...],
    "officer_performance": [...]
  }
}
Data Sources Used
loans - id, office_id, principal, interest_rate, status
loan_transactions - loan_id, transaction_type, amount, principal, interest, fee, penalty, date, reversed, status
loan_repayment_schedules - loan_id, due_date, total_due, principal_paid, interest_paid, fees_paid, penalty_paid
Key Features
Calculates collection rate using (Collected / Expected) × 100
Compares against configurable target rate (default 93%)
Provides breakdown by component (principal, interest, fees, penalty)
Includes daily collection trends
Shows top performing loan officers