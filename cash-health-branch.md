https://lms2backend.whencefinancesystem.com/3?cycle_start=2026-08-24

(https://lms2backend.whencefinancesystem.com/:office_id?cycle_start=2026-08-24)

Note: cycle_start date should be the 24th of the previous month.

//Expected Sample Reponse:
{
  "office_id": 3,
  "cycle": {
    "start_date": "2026-01-01",
    "end_date": "2026-01-31"
  },
  "disbursed": 146400,
  "collected": 275680.3,
  "financials": {
    "minimum_loan_target": 480000,
    "maximum_expected_repayment": 204960,
    "mandatory_fixed_cost": 42500,
    "salaries": 65000,
    "defaults": 308464.37,
    "irregular_cost_reserve": 40327.03,
    "averageMonthlyIrregularCostReserve": 85475.98,
    "salary_advance_reserve": 10666.67,
    "net_cash_position": -211004.37,
    "residual_cash": -251331.4
  },
  "reserve_breakdown": {
    "rent": 2175.67,
    "vehicle_repairs": 15849.94,
    "consumables_petty_cash": 4866.67,
    "field_collateral_transport": 626.42,
    "staff_welfare_funeral": 6141.67,
    "salary_advances": 10666.67
  },
  "scores": {
    "disbursement": 31,
    "collection": 99,
    "residual_cash": 0,
    "overall": 45,
    "status": "RED"
  },
  "reason": "disbursement is K333,600.00 below the minimum loan target, reducing the Disbursement Score to 31.",
  "details": {
    "salaries": {
      "cycle_start": "2026-01-01",
      "consultants": [
        {
          "user_id": 1901,
          "name": "Bibusa Chibochi",
          "current_target_level": 0,
          "previous_3_targets": [],
          "reached_40000_last_3_months": false,
          "predicted_salary": 5000
        },
        {
          "user_id": 1907,
          "name": "Syria Mungalu",
          "current_target_level": 0,
          "previous_3_targets": [],
          "reached_40000_last_3_months": false,
          "predicted_salary": 5000
        },
        {
          "user_id": 2107,
          "name": "Bessy Njobvu",
          "current_target_level": 0,
          "previous_3_targets": [],
          "reached_40000_last_3_months": false,
          "predicted_salary": 5000
        },
        {
          "user_id": 2492,
          "name": "Clara Kanshamba",
          "current_target_level": 0,
          "previous_3_targets": [],
          "reached_40000_last_3_months": false,
          "predicted_salary": 5000
        },
        {
          "user_id": 2646,
          "name": "Bruce Bwalya",
          "current_target_level": 0,
          "previous_3_targets": [],
          "reached_40000_last_3_months": false,
          "predicted_salary": 5000
        },
        {
          "user_id": 2794,
          "name": "CHILUFYA NSHIMBI",
          "current_target_level": 0,
          "previous_3_targets": [],
          "reached_40000_last_3_months": false,
          "predicted_salary": 5000
        },
        {
          "user_id": 2795,
          "name": "FAITH DAKA",
          "current_target_level": 0,
          "previous_3_targets": [],
          "reached_40000_last_3_months": false,
          "predicted_salary": 5000
        },
        {
          "user_id": 2796,
          "name": "IREEN NKWETO",
          "current_target_level": 0,
          "previous_3_targets": [],
          "reached_40000_last_3_months": false,
          "predicted_salary": 5000
        },
        {
          "user_id": 1905,
          "name": "KENNETH SIMWANZA",
          "current_target_level": 0,
          "previous_3_targets": [],
          "reached_40000_last_3_months": false,
          "predicted_salary": 5000
        },
        {
          "user_id": 4,
          "name": "Nawa Nawa",
          "current_target_level": 0,
          "previous_3_targets": [],
          "reached_40000_last_3_months": false,
          "predicted_salary": 5000
        },
        {
          "user_id": 2936,
          "name": "Sharon Banda",
          "current_target_level": 0,
          "previous_3_targets": [],
          "reached_40000_last_3_months": false,
          "predicted_salary": 5000
        },
        {
          "user_id": 2938,
          "name": "Precious Pwele",
          "current_target_level": 0,
          "previous_3_targets": [],
          "reached_40000_last_3_months": false,
          "predicted_salary": 5000
        },
        {
          "user_id": 3024,
          "name": "Josephine Katebe",
          "current_target_level": 0,
          "previous_3_targets": [],
          "reached_40000_last_3_months": false,
          "predicted_salary": 5000
        }
      ],
      "total_salary": 65000
    },
    "defaults": {
      "start_date": "2026-01-01",
      "end_date": "2026-01-31",
      "still_uncollected": 308464.37
    },
    "salary_advances": {
      "salary_advances": 10666.67,
      "advance_count": 7,
      "advances": [
        {
          "user_id": 2646,
          "full_name": "Bruce Bwalya",
          "original_amount": 4000,
          "amount_paid": 1000,
          "remaining_amount": 3000,
          "installment_amount": 1000,
          "status": "approved",
          "purpose": "General Finance",
          "date_requested": "2026-08-04T00:00:00.000Z",
          "date_approved": "2026-08-04T00:00:00.000Z",
          "expected_repayment_dates": "2026-10-01T00:00:00.000Z"
        },
        {
          "user_id": 4,
          "full_name": "Nawa Nawa",
          "original_amount": 4000,
          "amount_paid": 1333.33,
          "remaining_amount": 2666.67,
          "installment_amount": 1333.33,
          "status": "approved",
          "purpose": "General Finance",
          "date_requested": "2026-08-17T00:00:00.000Z",
          "date_approved": "2026-08-17T00:00:00.000Z",
          "expected_repayment_dates": "2026-10-01T00:00:00.000Z"
        },
        {
          "user_id": 2794,
          "full_name": "CHILUFYA NSHIMBI",
          "original_amount": 1500,
          "amount_paid": 500,
          "remaining_amount": 1000,
          "installment_amount": 500,
          "status": "approved",
          "purpose": "General Finance",
          "date_requested": "2026-08-06T00:00:00.000Z",
          "date_approved": "2026-08-06T00:00:00.000Z",
          "expected_repayment_dates": "2026-10-01T00:00:00.000Z"
        },
        {
          "user_id": 2795,
          "full_name": "FAITH DAKA",
          "original_amount": 2000,
          "amount_paid": 1000,
          "remaining_amount": 1000,
          "installment_amount": 1000,
          "status": "approved",
          "purpose": "General Finance",
          "date_requested": "2026-08-18T00:00:00.000Z",
          "date_approved": "2026-08-18T00:00:00.000Z",
          "expected_repayment_dates": "2026-10-01T00:00:00.000Z"
        },
        {
          "user_id": 3024,
          "full_name": "Josephine Katebe",
          "original_amount": 1000,
          "amount_paid": 0,
          "remaining_amount": 1000,
          "installment_amount": 1000,
          "status": "approved",
          "purpose": "General Finance",
          "date_requested": "2026-09-08T00:00:00.000Z",
          "date_approved": "2026-09-08T00:00:00.000Z",
          "expected_repayment_dates": "2026-10-01T00:00:00.000Z"
        },
        {
          "user_id": 1901,
          "full_name": "Bibusa Chibochi",
          "original_amount": 1000,
          "amount_paid": 0,
          "remaining_amount": 1000,
          "installment_amount": 500,
          "status": "approved",
          "purpose": "General Finance",
          "date_requested": "2026-09-08T00:00:00.000Z",
          "date_approved": "2026-09-08T00:00:00.000Z",
          "expected_repayment_dates": "2026-10-01T00:00:00.000Z"
        },
        {
          "user_id": 2936,
          "full_name": "Sharon Banda",
          "original_amount": 1000,
          "amount_paid": 0,
          "remaining_amount": 1000,
          "installment_amount": 1000,
          "status": "approved",
          "purpose": "General Finance",
          "date_requested": "2026-09-11T00:00:00.000Z",
          "date_approved": "2026-09-11T00:00:00.000Z",
          "expected_repayment_dates": "2026-10-01T00:00:00.000Z"
        }
      ]
    },
    "irregular_costs": {
      "irregular_cost_reserve": 29660.36,
      "average_monthly_irregular_cost_reserve": 85475.98,
      "breakdown": {
        "rent": 2175.67,
        "vehicle_repairs": 15849.94,
        "consumables_petty_cash": 4866.67,
        "field_collateral_transport": 626.42,
        "staff_welfare_funeral": 6141.67
      }
    }
  }
}