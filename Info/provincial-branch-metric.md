API Endpoint: GET /province-branches-performance
Query Parameters
Parameter	Required	Description
province_id	Yes	Province ID to filter branches
period_start	No	Start date (YYYY-MM-DD), defaults to current month
period_end	No	End date (YYYY-MM-DD), defaults to end of current month
include_details	No	Include detailed breakdown (default: false)


Example Request
GET /province-branches-performance?province_id=1
Response Structure
{
  "success": true,
  "data": {
    "metric": "Branch Performance Overview",
    "province": {
      "id": 1,
      "name": "Lusaka Province"
    },
    "period": {
      "start_date": "2026-02-01",
      "end_date": "2026-02-28"
    },
    "province_summary": {
      "total_branches": 5,
      "active_branches": 5,
      "total_staff": 45,
      "total_net_contribution": 3600000,
      "formatted_net_contribution": "K3.6M",
      "total_portfolio": 45000000,
      "formatted_portfolio": "K45.0M",
      "total_active_loans": 6235,
      "total_active_clients": 5890,
      "average_par_rate": 4.2,
      "average_collection_rate": 92.5
    },
    "branches": [
      {
        "rank": 1,
        "branch_id": 3,
        "branch_name": "Branch A",
        "manager_name": "John Doe",
        "net_contribution": "K850K",
        "net_contribution_value": 850000,
        "portfolio": {
          "active_loans": 1247,
          "active_clients": 1180,
          "total_portfolio": 15000000,
          "formatted_portfolio": "K15.0M"
        },
        "disbursements": {
          "count": 45,
          "total": 2500000,
          "formatted": "K2.5M"
        },
        "par": { "rate": 2.3, "par_balance": 345000 },
        "collections": { "rate": 94.5, "collected": 1200000, "expected": 1270000 },
        "staff_count": 9
      },
      {
        "rank": 2,
        "branch_name": "Branch B",
        "net_contribution": "K760K",
        ...
      },
      {
        "rank": 3,
        "branch_name": "Branch E",
        "net_contribution": "K720K",
        ...
      },
      {
        "rank": 4,
        "branch_name": "Branch D",
        "net_contribution": "K690K",
        ...
      },
      {
        "rank": 5,
        "branch_name": "Branch C",
        "net_contribution": "K580K",
        ...
      }
    ]
  }
}
Data Sources Used
offices - branch info, province_id, manager_id
province - province name
users - manager names, staff count
loans - active loans, portfolio, disbursements
loan_transactions - income (interest, fees, penalties)
loan_repayment_schedules - PAR calculation
expenses - branch expenses
other_income - additional income
ledger_income - ledger income
clients - active clients count
Net Contribution Formula
Net Contribution = Total Income - Total Expenses

Where:
- Total Income = Interest Income + Fee Income + Penalty Income + Other Income + Ledger Income
- Total Expenses = Sum of approved expenses for the period
Features
Branches sorted by net contribution (highest first)
Province-level summary with totals and averages
Per-branch metrics: portfolio, disbursements, PAR, collections
Staff count per branch
Period-based filtering for trend analysis

