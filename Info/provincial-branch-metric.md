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
            "id": 4,
            "name": "CENTRAL"
        },
        "period": {
            "start_date": "2026-02-01",
            "end_date": "2026-02-31"
        },
        "province_summary": {
            "total_branches": 2,
            "active_branches": 2,
            "total_staff": 35,
            "total_net_contribution": 0,
            "formatted_net_contribution": "K0",
            "total_portfolio": 0,
            "formatted_portfolio": "K0",
            "total_active_loans": 1398,
            "total_active_clients": 2151,
            "average_par_rate": 0,
            "average_collection_rate": 0
        },
        "branches": [
            {
                "rank": 1,
                "branch_id": 10,
                "branch_name": "WHENCE KABWE BRANCH",
                "manager_name": null,
                "net_contribution": "K0",
                "net_contribution_value": 0,
                "portfolio": {
                    "active_loans": 914,
                    "active_clients": 1408,
                    "total_portfolio": 0,
                    "formatted_portfolio": "K0"
                },
                "disbursements": {
                    "count": 0,
                    "total": 0,
                    "formatted": "K0"
                },
                "par": {
                    "rate": 0,
                    "par_balance": 0
                },
                "collections": {
                    "rate": 0,
                    "collected": 0,
                    "expected": 0
                },
                "staff_count": 21
            },
            {
                "rank": 2,
                "branch_id": 39,
                "branch_name": "WHENCE KAPIRI BRANCH",
                "manager_name": null,
                "net_contribution": "K0",
                "net_contribution_value": 0,
                "portfolio": {
                    "active_loans": 484,
                    "active_clients": 743,
                    "total_portfolio": 0,
                    "formatted_portfolio": "K0"
                },
                "disbursements": {
                    "count": 0,
                    "total": 0,
                    "formatted": "K0"
                },
                "par": {
                    "rate": 0,
                    "par_balance": 0
                },
                "collections": {
                    "rate": 0,
                    "collected": 0,
                    "expected": 0
                },
                "staff_count": 14
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

