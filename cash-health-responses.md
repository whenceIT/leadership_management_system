Example Response Structures:

Executive Institution Dashboard
1. https://lms2backend.whencefinancesystem.com/cash-health/national
{
  "level": "national",
  "office_count": 63,
  "cycle": {
    "start_date": "2026-09-11",
    "end_date": "2026-10-10"
  },
  "financials": {
    "minimum_loan_target": 20800000,
    "maximum_expected_repayment": 19266058,
    "mandatory_fixed_cost": 2677500,
    "salaries": 3353000,
    "defaults": 32928378.04,
    "irregular_cost_reserve": 1708534.57,
    "averageMonthlyIrregularCostReserve": 3253589.81,
    "salary_advance_reserve": 145132.67,
    "net_cash_position": -19692820.04,
    "residual_cash": -21401354.61
  },
  "reserve_breakdown": {
    "rent": 95807.4,
    "vehicle_repairs": 998546.22,
    "consumables_petty_cash": 121091.69,
    "field_collateral_transport": 7093.86,
    "staff_welfare_funeral": 340862.69,
    "salary_advances": 145132.67
  },
  "scores": {
    "disbursement": 66,
    "collection": 0,
    "residual_cash": 0,
    "overall": 23,
    "status": "RED"
  },
  "reason": "disbursement is K7,038,530.00 below the minimum loan target, reducing the Disbursement Score to 66.",
  "provinces": [
    {
      "province_id": 4,
      "province_name": "CENTRAL",
      "office_count": 5,
      "financials": {
        "minimum_loan_target": 920000,
        "maximum_expected_repayment": 1204238,
        "mandatory_fixed_cost": 212500,
        "salaries": 203000,
        "defaults": 2165523.01,
        "irregular_cost_reserve": 123084.72,
        "averageMonthlyIrregularCostReserve": 167482.19,
        "salary_advance_reserve": 0,
        "net_cash_position": -1376785.01,
        "residual_cash": -1499869.73
      },
      "reserve_breakdown": {
        "rent": 11200,
        "vehicle_repairs": 79249.7,
        "consumables_petty_cash": 1833.34,
        "field_collateral_transport": 93.33,
        "staff_welfare_funeral": 30708.35,
        "salary_advances": 0
      },
      "scores": {
        "disbursement": 93,
        "collection": 0,
        "residual_cash": 0,
        "overall": 33,
        "status": "RED"
      },
      "reason": "disbursement is K59,830.00 below the minimum loan target, reducing the Disbursement Score to 93.",
      "districts": [
        {
          "district_id": 4,
          "district_name": "Kabwe District",
          "office_count": 1,
          "financials": {
            "minimum_loan_target": 0,
            "maximum_expected_repayment": 316400,
            "mandatory_fixed_cost": 42500,
            "salaries": 70000,
            "defaults": 858211.19,
            "irregular_cost_reserve": 26084.94,
            "averageMonthlyIrregularCostReserve": 87016.81,
            "salary_advance_reserve": 0,
            "net_cash_position": -654311.19,
            "residual_cash": -680396.13
          },
          "reserve_breakdown": {
            "rent": 4000,
            "vehicle_repairs": 15849.94,
            "consumables_petty_cash": 0,
            "field_collateral_transport": 93.33,
            "staff_welfare_funeral": 6141.67,
            "salary_advances": 0
          },
          "scores": {
            "disbursement": 0,
            "collection": 1,
            "residual_cash": 0,
            "overall": 0,
            "status": "RED"
          },
          "reason": "residual cash is negative by K680,396.13, indicating that expected obligations exceed available cash.",
          "offices": [
            {
              "office_id": 10,
              "cycle": {
                "start_date": "2026-09-11",
                "end_date": "2026-10-10"
              },
              "disbursed": 226000,
              "collected": 4940,
              "financials": {
                "minimum_loan_target": 0,
                "maximum_expected_repayment": 316400,
                "mandatory_fixed_cost": 42500,
                "salaries": 70000,
                "defaults": 858211.19,
                "irregular_cost_reserve": 26084.94,
                "averageMonthlyIrregularCostReserve": 87016.81,
                "salary_advance_reserve": 0,
                "net_cash_position": -654311.19,
                "residual_cash": -680396.13
              },
              "reserve_breakdown": {
                "rent": 4000,
                "vehicle_repairs": 15849.94,
                "consumables_petty_cash": 0,
                "field_collateral_transport": 93.33,
                "staff_welfare_funeral": 6141.67,
                "salary_advances": 0
              },
              "scores": {
                "disbursement": 0,
                "collection": 1,
                "residual_cash": 0,
                "overall": 0,
                "status": "RED"
              },
              "reason": "residual cash is negative by K680,396.13, indicating that expected obligations exceed available cash.",
              "details": {
                "salaries": {
                  "cycle_start": "2026-09-11",
                  "consultants": [
                    {
                      "user_id": 1927,
                      "name": "Weston Shanabuchinga",
                      "current_target_level": 0,
                      "previous_3_targets": [],
                      "reached_40000_last_3_months": false,
                      "predicted_salary": 5000
                    },
                    {
                      "user_id": 1979,
                      "name": "Maureen Mwansa",
                      "current_target_level": 0,
                      "previous_3_targets": [
                        {
                          "cycle_start": "2026-07-25T00:00:00.000Z",
                          "target_level": 40000
                        },
                        {
                          "cycle_start": "2026-04-25T00:00:00.000Z",
                          "target_level": 40000
                        }
                      ],
                      "reached_40000_last_3_months": false,
                      "predicted_salary": 5000
                    },
                    {
                      "user_id": 28,
                      "name": "Namaambo Moonga",
                      "current_target_level": 0,
                      "previous_3_targets": [],
                      "reached_40000_last_3_months": false,
                      "predicted_salary": 5000
                    },
                    {
                      "user_id": 2183,
                      "name": "Edah Mulenga Saulombo",
                      "current_target_level": 0,
                      "previous_3_targets": [
                        {
                          "cycle_start": "2026-07-25T00:00:00.000Z",
                          "target_level": 40000
                        },
                        {
                          "cycle_start": "2026-07-25T00:00:00.000Z",
                          "target_level": 50000
                        },
                        {
                          "cycle_start": "2026-06-25T00:00:00.000Z",
                          "target_level": 50000
                        }
                      ],
                      "reached_40000_last_3_months": true,
                      "predicted_salary": 7000
                    },
........