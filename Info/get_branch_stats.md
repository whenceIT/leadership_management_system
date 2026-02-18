Sample request:

GET http://localhost:5000/branch-stats?office_id=3
Sample response:

{
  "success": true,
  "data": {
    "office_id": 3,
    "total_staff": 15,
    "staff_on_leave": 2,
    "pending_loans": 45,
    "disbursed_loans": 230,
    "active_clients": 180,
    "pending_advances": 5,
    "approved_advances": 12,
    "pending_expenses": 8,
    "open_tickets": 3,
    "loan_portfolio": 1500000.00,
    "pending_transactions": 25
  }
}