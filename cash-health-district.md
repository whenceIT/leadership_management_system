https://lms2backend.whencefinancesystem.com/cash-health/district/3?cycle_start=2026-08-24

(https://lms2backend.whencefinancesystem.com/cash-health/district/:district_id?cycle_start=2026-08-24
)
Note: cycle_start date should be the 24th of the previous month.

//Sample Response:
{
  "district_id": 3,
  "district_name": "Chitambo District",
  "offices": [],
  "office_count": 0,
  "cycle": {
    "start_date": null,
    "end_date": null
  },
  "disbursed": 0,
  "collected": 0,
  "financials": {
    "minimum_loan_target": 0,
    "maximum_expected_repayment": 0,
    "mandatory_fixed_cost": 0,
    "salaries": 0,
    "defaults": 0,
    "irregular_cost_reserve": 0,
    "averageMonthlyIrregularCostReserve": 0,
    "salary_advance_reserve": 0,
    "net_cash_position": 0,
    "residual_cash": 0
  },
  "reserve_breakdown": {
    "rent": 0,
    "vehicle_repairs": 0,
    "consumables_petty_cash": 0,
    "field_collateral_transport": 0,
    "staff_welfare_funeral": 0,
    "salary_advances": 0
  },
  "scores": {
    "disbursement": 0,
    "collection": 0,
    "residual_cash": 0,
    "overall": 0,
    "status": "RED"
  },
  "reason": "No offices are assigned to this district."
}