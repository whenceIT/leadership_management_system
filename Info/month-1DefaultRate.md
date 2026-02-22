API Endpoint: GET /month1-default-rate
Query Parameters
Parameter	Required	Description
office_id	Yes	Branch office ID
period_start	No	Start date (YYYY-MM-DD), defaults to current month start
period_end	No	End date (YYYY-MM-DD), defaults to current month end
Example Request
GET /month1-default-rate?office_id=1&period_start=2026-01-01&period_end=2026-01-31
Response Structure
{
  "success": true,
  "data": {
    "metric": "Month-1 Default Rate",
    "office_id": 1,
    "period": { "start_date": "2026-01-01", "end_date": "2026-01-31" },
    "current_period": {
      "total_disbursed": 150,
      "defaulted_in_month1": 3,
      "default_rate": 2.0,
      "formatted_rate": "2.00%"
    },
    "previous_period": {
      "default_rate": 2.5,
      "formatted_rate": "2.50%"
    },
    "trend": {
      "change_from_last_month": -0.5,
      "direction": "decrease",
      "formatted_change": "-0.5% from last month",
      "improvement": true
    },
    "benchmark": {
      "target_rate": 3.0,
      "status": "on_target",
      "variance_from_target": -1.0
    },
    "defaulted_loans": [...]
  }
}
Calculation Logic
The endpoint identifies Month-1 defaults as loans where:

Status is written_off AND written off within 30 days of disbursement, OR
Status is disbursed AND has arrears ≥ 30 days (from loan_repayment_schedules)
Data Sources Used
loans - id, office_id, status, disbursement_date, written_off_date
loan_repayment_schedules - loan_id, due_date, paid status
clients - client details for defaulted loans


