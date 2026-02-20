GET https://smartbackend.whencefinancesystem.com/loan-consultant-stats

Query Parameters (all optional):

start_date - Filter loans from this date
end_date - Filter loans until this date
office_id - Filter by office
province_id - Filter by province (joins with offices table)
user_id - Filter by loan officer (loan_officer_id)


Response:

{
  "success": true,
  "data": {
    "new_applications": 15,      // status = 'pending'
    "under_review": 3,           // status = 'under_review' AND created_at > 3 days
    "approved": 8,               // status = 'approved'
    "disbursed": 25,             // status = 'disbursed'
    "total_loans": 60,           // all loans
    "pending_loans": 20,         // status IN ('pending', 'new', 'under_review')
    "declined": 5                // status IN ('declined', 'rejected')
  }
}
Example Usage:

GET /loan-consultant-stats?start_date=2026-01-01&end_date=2026-02-19&office_id=3&user_id=12

