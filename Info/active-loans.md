API Endpoint: GET /active-loans
Query Parameters
Parameter	Required	Description
office_id	Yes	Branch office ID
include_details	No	Include detailed loan list (default: false)
loan_officer_id	No	Filter by specific loan officer
Example Request
GET /active-loans?office_id=1&include_details=true
Response Structure
{
  "success": true,
  "data": {
    "metric": "Active Loans",
    "office_id": 1,
    "office_name": "Lusaka Branch",
    "current_period": {
      "active_loans_count": 1247,
      "formatted_count": "1,247",
      "weekly_change": 23,
      "formatted_weekly_change": "+23 this week",
      "trend_direction": "growth"
    },
    "outstanding_balance": {
      "total_outstanding": 15000000,
      "principal_outstanding": 12000000,
      "interest_outstanding": 2500000,
      "fees_outstanding": 300000,
      "penalty_outstanding": 200000,
      "formatted_outstanding": "K15.0M"
    },
    "capacity": {
      "branch_capacity": 1500,
      "utilization_percentage": 83.1,
      "remaining_capacity": 253,
      "status": "available"
    },
    "status_breakdown": [
      { "status": "disbursed", "count": 1247, "total_principal": 15000000 },
      { "status": "pending", "count": 45, "total_principal": 500000 }
    ],
    "product_breakdown": [...],
    "officer_breakdown": [...],
    "loan_details": [...]  // Only if include_details=true
  }
}
Data Sources Used
loans - id, office_id, status, disbursement_date, closed_date, written_off_date, principal_derived
clients - id, office_id, status
loan_repayment_schedules - For outstanding balance calculation
offices - branch_capacity for capacity planning
Key Features
Counts loans with status = 'disbursed'
Calculates weekly change (new disbursements - closed loans)
Shows outstanding balance breakdown (principal, interest, fees, penalty)
Branch capacity utilization tracking
Breakdown by loan status, product, and loan officer
Optional detailed loan list with arrears status