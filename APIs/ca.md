https://smartbackend.whencefinancesystem.com/api/kpi-scores/summary
{
  "success": true,
  "data": {
    "totalCashBalance": 8158990.04790001,
    "totalIncome": 0,
    "totalAdvances": 451900,
    "totalAdvancesPaid": 121883.29,
    "totalExpenses": 62556162.43,
    "totalFullPayments": 137316181.2232,
    "totalReloanedAmount": 26138144.4337,
    "totalPartPayment": 25938103.5211,
    "totalNewLoans": 124105497.8001,
    "startDate": "2025-01-04",
    "endDate": "2026-04-18"
  }
}

Examples:

Institution, default dates: GET /api/kpi-scores/summary
Specific office: GET /api/kpi-scores/summary?office_id=1
Province filter: GET /api/kpi-scores/summary?province_id=2
District filter: GET /api/kpi-scores/summary?district_id=2
Custom dates: GET /api/kpi-scores/summary?start_date=2025-01-01&end_date=2025-12-31
Office with custom dates: GET /api/kpi-scores/summary?office_id=1&start_date=2025-01-01&end_date=2025-12-31
Response format: { "success": true, "data": { "totalCashBalance": 12345.67, "totalIncome": 1000.00, "totalAdvances": 500.00, // ... other totals "startDate": "2025-01-01", "endDate": "2025-12-31" } }