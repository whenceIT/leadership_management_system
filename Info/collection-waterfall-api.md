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
        "office_name": "ZIMCO HOUSE LUSAKA",
        "period": {
            "start_date": "2023-02-01",
            "end_date": "2026-02-23"
        },
        "currency": "ZMW",
        "summary": {
            "due": {
                "total": 0,
                "formatted": "ZMW 0.00",
                "breakdown": {
                    "principal": 4725880,
                    "interest": 3455533.2672,
                    "fees": 220090,
                    "penalty": 0
                },
                "loans_count": 2127,
                "installments_count": 3864
            },
            "collected": {
                "total": 0,
                "formatted": "ZMW 0.00",
                "breakdown": {
                    "principal": 0,
                    "interest": 0,
                    "fees": 0,
                    "penalty": 0
                },
                "loans_count": 0,
                "payments_count": 0
            },
            "partial": {
                "total": 0,
                "formatted": "ZMW 0.00",
                "breakdown": {
                    "principal": 0,
                    "interest": 0,
                    "fees": 0,
                    "penalty": 0
                },
                "loans_count": 0,
                "payments_count": 0
            },
            "overdue": {
                "total": 0,
                "formatted": "ZMW 0.00",
                "breakdown": {
                    "principal": 377411.9,
                    "interest": 355837.86,
                    "fees": 13483,
                    "penalty": 0
                },
                "loans_count": 324,
                "installments_count": 870
            },
            "compliance": {
                "rate": 0,
                "formatted": "0%",
                "status": "needs_attention"
            }
        },
        "analysis": {
            "total_collections": 0,
            "total_collections_formatted": "ZMW 0.00",
            "overall_collection_rate": 0,
            "collection_gap": 0,
            "collection_gap_formatted": "ZMW 0.00",
            "uncollected_amount": 0,
            "uncollected_formatted": "ZMW 0.00"
        },
        "officer_breakdown": [],
        "monthly_trend": [],
        "expected_monthly": [
            {
                "month": "2026-02",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2026-01",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2025-12",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2025-11",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2025-10",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2025-09",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2025-08",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2025-07",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2025-06",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2025-05",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2025-04",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2025-03",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2025-02",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2025-01",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2024-12",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2024-11",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2024-10",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2024-09",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2024-08",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2024-07",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2024-06",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2024-05",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2024-04",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2024-03",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2024-02",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2024-01",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2023-12",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2023-11",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2023-10",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2023-09",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2023-08",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2023-07",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2023-06",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2023-05",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2023-04",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2023-03",
                "expected": 0,
                "formatted": "ZMW 0.00"
            },
            {
                "month": "2023-02",
                "expected": 0,
                "formatted": "ZMW 0.00"
            }
        ]
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