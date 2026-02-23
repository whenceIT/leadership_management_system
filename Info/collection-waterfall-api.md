API Endpoint
URL: GET /branch-collection-waterfall

Parameters:

Parameter	Type	Required	Default	Description
office_id	integer	Yes	-	Branch office ID
start_date	date	No	2023-02-01	Period start date (YYYY-MM-DD)
end_date	date	No	Current date	Period end date (YYYY-MM-DD)
Response Structure
{
  "success": true,
  "data": {
    "metric": "Collections Waterfall",
    "office_id": 1,
    "office_name": "Branch Name",
    "period": {
      "start_date": "2023-02-01",
      "end_date": "2026-02-23"
    },
    "currency": "ZMW",
    "summary": {
      "due": {
        "total": 125000,
        "formatted": "ZMW 125,000.00",
        "breakdown": { "principal", "interest", "fees", "penalty" },
        "loans_count": 150,
        "installments_count": 450
      },
      "collected": {
        "total": 118125,
        "formatted": "ZMW 118,125.00",
        ...
      },
      "partial": {
        "total": 4500,
        "formatted": "ZMW 4,500.00",
        ...
      },
      "overdue": {
        "total": 2375,
        "formatted": "ZMW 2,375.00",
        ...
      },
      "compliance": {
        "rate": 94.5,
        "formatted": "94.5%",
        "status": "excellent"
      }
    },
    "analysis": {
      "total_collections": 122625,
      "overall_collection_rate": 98.1,
      "collection_gap": 6875,
      "uncollected_amount": 2375
    },
    "officer_breakdown": [...],
    "monthly_trend": [...],
    "expected_monthly": [...]
  }
}



Formulas Used
Metric	Formula	Data Source
Due	SUM(loan_repayment_schedules.total_due)	Schedules with due_date in period
Collected	SUM(loan_transactions.credit)	Repayments with payment_apply_to IN ('full_payment', 'regular')
Partial	SUM(loan_transactions.credit)	Repayments with payment_apply_to = 'part_payment'
Overdue	SUM(total_due - paid_amounts)	Schedules past due date with paid = 0
Compliance	(Collected / Due) × 100	Percentage of due amount collected
Compliance Status Thresholds
Rate	Status
≥ 95%	excellent
80-94%	good
70-79%	average
< 70%	needs_attention
Example Usage
GET /branch-collection-waterfall?office_id=1
GET /branch-collection-waterfall?office_id=1&start_date=2024-01-01&end_date=2024-12-31