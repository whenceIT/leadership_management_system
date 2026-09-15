https://lms2backend.whencefinancesystem.com/cash-health/province/3?cycle_start=2026-08-24

(https://lms2backend.whencefinancesystem.com/cash-health/province/:province_id?cycle_start=2026-08-24)

Note: cycle_start date should be the 24th of the previous month.


//Reponse Sample:
{
  "province_id": 3,
  "province_name": "EASTERN",
  "office_count": 7,
  "cycle": {
    "start_date": "2026-01-01",
    "end_date": "2026-01-31"
  },
  "financials": {
    "minimum_loan_target": 2760000,
    "maximum_expected_repayment": 1937628,
    "mandatory_fixed_cost": 297500,
    "salaries": 320000,
    "defaults": 497987.63,
    "irregular_cost_reserve": 181311.02,
    "averageMonthlyIrregularCostReserve": 355519.71,
    "salary_advance_reserve": 21233.34,
    "net_cash_position": 822140.37,
    "residual_cash": 640829.35
  },
  "reserve_breakdown": {
    "rent": 7666.67,
    "vehicle_repairs": 110949.58,
    "consumables_petty_cash": 9428.33,
    "field_collateral_transport": 491.41,
    "staff_welfare_funeral": 31541.69,
    "salary_advances": 21233.34
  },
  "scores": {
    "disbursement": 50,
    "collection": 100,
    "residual_cash": 90,
    "overall": 80,
    "status": "GREEN"
  },
  "reason": "disbursement is K1,375,980.00 below the minimum loan target, reducing the Disbursement Score to 50.",
  "districts": [
    {
      "district_id": 22,
      "district_name": "Chadiza District",
      "office_count": 1,
      "disbursed": 0,
      "collected": 0,
      "financials": {
        "minimum_loan_target": 400000,
        "maximum_expected_repayment": 0,
        "mandatory_fixed_cost": 42500,
        "salaries": 5000,
        "defaults": 0,
        "irregular_cost_reserve": 21991.61,
        "averageMonthlyIrregularCostReserve": 0,
        "salary_advance_reserve": 0,
        "net_cash_position": -47500,
        "residual_cash": -69491.61
      },
      "reserve_breakdown": {
        "rent": 0,
        "vehicle_repairs": 15849.94,
        "consumables_petty_cash": 0,
        "field_collateral_transport": 0,
        "staff_welfare_funeral": 6141.67,
        "salary_advances": 0
      },
      "scores": {
        "disbursement": 0,
        "collection": 100,
        "residual_cash": 0,
        "overall": 35,
        "status": "RED"
      },
      "reason": "disbursement is K400,000.00 below the minimum loan target, reducing the Disbursement Score to 0.",
      "offices": [
        {
          "office_id": 93,
          "cycle": {
            "start_date": "2026-01-01",
            "end_date": "2026-01-31"
          },
          "disbursed": 0,
          "collected": 0,
          "financials": {
            "minimum_loan_target": 400000,
            "maximum_expected_repayment": 0,
            "mandatory_fixed_cost": 42500,
            "salaries": 5000,
            "defaults": 0,
            "irregular_cost_reserve": 21991.61,
            "averageMonthlyIrregularCostReserve": 0,
            "salary_advance_reserve": 0,
            "net_cash_position": -47500,
            "residual_cash": -69491.61
          },
          "reserve_breakdown": {
            "rent": 0,
            "vehicle_repairs": 15849.94,
            "consumables_petty_cash": 0,
            "field_collateral_transport": 0,
            "staff_welfare_funeral": 6141.67,
            "salary_advances": 0
          },
          "scores": {
            "disbursement": 0,
            "collection": 100,
            "residual_cash": 0,
            "overall": 35,
            "status": "RED"
          },
          "reason": "disbursement is K400,000.00 below the minimum loan target, reducing the Disbursement Score to 0.",
          "details": {
            "salaries": {
              "cycle_start": "2026-01-01",
              "consultants": [
                {
                  "user_id": 829,
                  "name": "Charity Banda",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                }
              ],
              "total_salary": 5000
            },
            "defaults": {
              "start_date": "2026-01-01",
              "end_date": "2026-01-31",
              "still_uncollected": 0
            },
            "salary_advances": {
              "salary_advances": 0,
              "advance_count": 0,
              "advances": []
            },
            "irregular_costs": {
              "irregular_cost_reserve": 21991.61,
              "average_monthly_irregular_cost_reserve": 0,
              "breakdown": {
                "rent": 0,
                "vehicle_repairs": 15849.94,
                "consumables_petty_cash": 0,
                "field_collateral_transport": 0,
                "staff_welfare_funeral": 6141.67
              }
            }
          },
          "office_name": "Chadiza Branch",
          "province_id": 3,
          "district_id": 22,
          "district_name": "Chadiza District"
        }
      ]
    },
    {
      "district_id": 26,
      "district_name": "Chipata District",
      "office_count": 1,
      "disbursed": 180000,
      "collected": 267995.97,
      "financials": {
        "minimum_loan_target": 400000,
        "maximum_expected_repayment": 252000,
        "mandatory_fixed_cost": 42500,
        "salaries": 45000,
        "defaults": 0,
        "irregular_cost_reserve": 20433.28,
        "averageMonthlyIrregularCostReserve": 55503.5,
        "salary_advance_reserve": 1333.34,
        "net_cash_position": 164500,
        "residual_cash": 144066.72
      },
      "reserve_breakdown": {
        "rent": 1000,
        "vehicle_repairs": 15849.94,
        "consumables_petty_cash": 1833.33,
        "field_collateral_transport": 0,
        "staff_welfare_funeral": 416.67,
        "salary_advances": 1333.34
      },
      "scores": {
        "disbursement": 45,
        "collection": 100,
        "residual_cash": 100,
        "overall": 81,
        "status": "GREEN"
      },
      "reason": "disbursement is K220,000.00 below the minimum loan target, reducing the Disbursement Score to 45.",
      "offices": [
        {
          "office_id": 6,
          "cycle": {
            "start_date": "2026-01-01",
            "end_date": "2026-01-31"
          },
          "disbursed": 180000,
          "collected": 267995.97,
          "financials": {
            "minimum_loan_target": 400000,
            "maximum_expected_repayment": 252000,
            "mandatory_fixed_cost": 42500,
            "salaries": 45000,
            "defaults": 0,
            "irregular_cost_reserve": 20433.28,
            "averageMonthlyIrregularCostReserve": 55503.5,
            "salary_advance_reserve": 1333.34,
            "net_cash_position": 164500,
            "residual_cash": 144066.72
          },
          "reserve_breakdown": {
            "rent": 1000,
            "vehicle_repairs": 15849.94,
            "consumables_petty_cash": 1833.33,
            "field_collateral_transport": 0,
            "staff_welfare_funeral": 416.67,
            "salary_advances": 1333.34
          },
          "scores": {
            "disbursement": 45,
            "collection": 100,
            "residual_cash": 100,
            "overall": 81,
            "status": "GREEN"
          },
          "reason": "disbursement is K220,000.00 below the minimum loan target, reducing the Disbursement Score to 45.",
          "details": {
            "salaries": {
              "cycle_start": "2026-01-01",
              "consultants": [
                {
                  "user_id": 826,
                  "name": "Francis Phiri",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 827,
                  "name": "Rebecca Mwaanga",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 830,
                  "name": "Yadah Phiri",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2010,
                  "name": "Candy Mahangano",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 25,
                  "name": "Carol Kawisha",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2052,
                  "name": "Jane Phiri",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 937,
                  "name": "Mwangala Mubiana",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2705,
                  "name": "Taonga Banda",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 3014,
                  "name": "Joseph Nkhoma",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                }
              ],
              "total_salary": 45000
            },
            "defaults": {
              "start_date": "2026-01-01",
              "end_date": "2026-01-31",
              "still_uncollected": 0
            },
            "salary_advances": {
              "salary_advances": 1333.34,
              "advance_count": 1,
              "advances": [
                {
                  "user_id": 937,
                  "full_name": "Mwangala Mubiana",
                  "original_amount": 4000,
                  "amount_paid": 2666.66,
                  "remaining_amount": 1333.34,
                  "installment_amount": 1333.33,
                  "status": "approved",
                  "purpose": "General Finance",
                  "date_requested": "2026-06-09T00:00:00.000Z",
                  "date_approved": "2026-06-10T00:00:00.000Z",
                  "expected_repayment_dates": "2026-10-01T00:00:00.000Z"
                }
              ]
            },
            "irregular_costs": {
              "irregular_cost_reserve": 19099.94,
              "average_monthly_irregular_cost_reserve": 55503.5,
              "breakdown": {
                "rent": 1000,
                "vehicle_repairs": 15849.94,
                "consumables_petty_cash": 1833.33,
                "field_collateral_transport": 0,
                "staff_welfare_funeral": 416.67
              }
            }
          },
          "office_name": "PROVIDENT HOUSE CHIPATA",
          "province_id": 3,
          "district_id": 26,
          "district_name": "Chipata District"
        }
      ]
    },
    {
      "district_id": 28,
      "district_name": "Katete District",
      "office_count": 1,
      "disbursed": 512040,
      "collected": 643045,
      "financials": {
        "minimum_loan_target": 520000,
        "maximum_expected_repayment": 716856,
        "mandatory_fixed_cost": 42500,
        "salaries": 60000,
        "defaults": 0,
        "irregular_cost_reserve": 20567.19,
        "averageMonthlyIrregularCostReserve": 134340.1,
        "salary_advance_reserve": 0,
        "net_cash_position": 614356,
        "residual_cash": 593788.81
      },
      "reserve_breakdown": {
        "rent": 1666.67,
        "vehicle_repairs": 15849.94,
        "consumables_petty_cash": 2333.33,
        "field_collateral_transport": 300.58,
        "staff_welfare_funeral": 416.67,
        "salary_advances": 0
      },
      "scores": {
        "disbursement": 98,
        "collection": 100,
        "residual_cash": 100,
        "overall": 99,
        "status": "GREEN"
      },
      "reason": "disbursement is K7,960.00 below the minimum loan target, reducing the Disbursement Score to 98.",
      "offices": [
        {
          "office_id": 43,
          "cycle": {
            "start_date": "2026-01-01",
            "end_date": "2026-01-31"
          },
          "disbursed": 512040,
          "collected": 643045,
          "financials": {
            "minimum_loan_target": 520000,
            "maximum_expected_repayment": 716856,
            "mandatory_fixed_cost": 42500,
            "salaries": 60000,
            "defaults": 0,
            "irregular_cost_reserve": 20567.19,
            "averageMonthlyIrregularCostReserve": 134340.1,
            "salary_advance_reserve": 0,
            "net_cash_position": 614356,
            "residual_cash": 593788.81
          },
          "reserve_breakdown": {
            "rent": 1666.67,
            "vehicle_repairs": 15849.94,
            "consumables_petty_cash": 2333.33,
            "field_collateral_transport": 300.58,
            "staff_welfare_funeral": 416.67,
            "salary_advances": 0
          },
          "scores": {
            "disbursement": 98,
            "collection": 100,
            "residual_cash": 100,
            "overall": 99,
            "status": "GREEN"
          },
          "reason": "disbursement is K7,960.00 below the minimum loan target, reducing the Disbursement Score to 98.",
          "details": {
            "salaries": {
              "cycle_start": "2026-01-01",
              "consultants": [
                {
                  "user_id": 1992,
                  "name": "Clement Daka",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2446,
                  "name": "Maxwell Wazzy Wantakisha",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2467,
                  "name": "Natasha Nkholoma",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2468,
                  "name": "Grace Mushili",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2480,
                  "name": "Evita Mwanza",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2484,
                  "name": "Gift Banda",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2485,
                  "name": "Rodgers Phiri",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2487,
                  "name": "Bornface Chirwa",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2486,
                  "name": "Solomon Sakala",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2488,
                  "name": "Janet Sakala",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2494,
                  "name": "Rhonah Mudenda",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2694,
                  "name": "Majory Nachimata",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                }
              ],
              "total_salary": 60000
            },
            "defaults": {
              "start_date": "2026-01-01",
              "end_date": "2026-01-31",
              "still_uncollected": 0
            },
            "salary_advances": {
              "salary_advances": 0,
              "advance_count": 0,
              "advances": []
            },
            "irregular_costs": {
              "irregular_cost_reserve": 20567.19,
              "average_monthly_irregular_cost_reserve": 134340.1,
              "breakdown": {
                "rent": 1666.67,
                "vehicle_repairs": 15849.94,
                "consumables_petty_cash": 2333.33,
                "field_collateral_transport": 300.58,
                "staff_welfare_funeral": 416.67
              }
            }
          },
          "office_name": "KATETE BRANCH",
          "province_id": 3,
          "district_id": 28,
          "district_name": "Katete District"
        }
      ]
    },
    {
      "district_id": 30,
      "district_name": "Lundazi District",
      "office_count": 1,
      "disbursed": 0,
      "collected": 0,
      "financials": {
        "minimum_loan_target": 440000,
        "maximum_expected_repayment": 0,
        "mandatory_fixed_cost": 42500,
        "salaries": 5000,
        "defaults": 0,
        "irregular_cost_reserve": 21991.61,
        "averageMonthlyIrregularCostReserve": 0,
        "salary_advance_reserve": 0,
        "net_cash_position": -47500,
        "residual_cash": -69491.61
      },
      "reserve_breakdown": {
        "rent": 0,
        "vehicle_repairs": 15849.94,
        "consumables_petty_cash": 0,
        "field_collateral_transport": 0,
        "staff_welfare_funeral": 6141.67,
        "salary_advances": 0
      },
      "scores": {
        "disbursement": 0,
        "collection": 100,
        "residual_cash": 0,
        "overall": 35,
        "status": "RED"
      },
      "reason": "disbursement is K440,000.00 below the minimum loan target, reducing the Disbursement Score to 0.",
      "offices": [
        {
          "office_id": 92,
          "cycle": {
            "start_date": "2026-01-01",
            "end_date": "2026-01-31"
          },
          "disbursed": 0,
          "collected": 0,
          "financials": {
            "minimum_loan_target": 440000,
            "maximum_expected_repayment": 0,
            "mandatory_fixed_cost": 42500,
            "salaries": 5000,
            "defaults": 0,
            "irregular_cost_reserve": 21991.61,
            "averageMonthlyIrregularCostReserve": 0,
            "salary_advance_reserve": 0,
            "net_cash_position": -47500,
            "residual_cash": -69491.61
          },
          "reserve_breakdown": {
            "rent": 0,
            "vehicle_repairs": 15849.94,
            "consumables_petty_cash": 0,
            "field_collateral_transport": 0,
            "staff_welfare_funeral": 6141.67,
            "salary_advances": 0
          },
          "scores": {
            "disbursement": 0,
            "collection": 100,
            "residual_cash": 0,
            "overall": 35,
            "status": "RED"
          },
          "reason": "disbursement is K440,000.00 below the minimum loan target, reducing the Disbursement Score to 0.",
          "details": {
            "salaries": {
              "cycle_start": "2026-01-01",
              "consultants": [
                {
                  "user_id": 2447,
                  "name": "Mathews Phiri",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                }
              ],
              "total_salary": 5000
            },
            "defaults": {
              "start_date": "2026-01-01",
              "end_date": "2026-01-31",
              "still_uncollected": 0
            },
            "salary_advances": {
              "salary_advances": 0,
              "advance_count": 0,
              "advances": []
            },
            "irregular_costs": {
              "irregular_cost_reserve": 21991.61,
              "average_monthly_irregular_cost_reserve": 0,
              "breakdown": {
                "rent": 0,
                "vehicle_repairs": 15849.94,
                "consumables_petty_cash": 0,
                "field_collateral_transport": 0,
                "staff_welfare_funeral": 6141.67
              }
            }
          },
          "office_name": "Lundazi Branch",
          "province_id": 3,
          "district_id": 30,
          "district_name": "Lundazi District"
        }
      ]
    },
    {
      "district_id": 33,
      "district_name": "Nyimba District",
      "office_count": 1,
      "disbursed": 384300,
      "collected": 371254,
      "financials": {
        "minimum_loan_target": 560000,
        "maximum_expected_repayment": 538020,
        "mandatory_fixed_cost": 42500,
        "salaries": 65000,
        "defaults": 42798,
        "irregular_cost_reserve": 30391.61,
        "averageMonthlyIrregularCostReserve": 22760,
        "salary_advance_reserve": 4400,
        "net_cash_position": 387722,
        "residual_cash": 357330.39
      },
      "reserve_breakdown": {
        "rent": 3000,
        "vehicle_repairs": 15849.94,
        "consumables_petty_cash": 1000,
        "field_collateral_transport": 0,
        "staff_welfare_funeral": 6141.67,
        "salary_advances": 4400
      },
      "scores": {
        "disbursement": 69,
        "collection": 100,
        "residual_cash": 100,
        "overall": 89,
        "status": "GREEN"
      },
      "reason": "disbursement is K175,700.00 below the minimum loan target, reducing the Disbursement Score to 69.",
      "offices": [
        {
          "office_id": 55,
          "cycle": {
            "start_date": "2026-01-01",
            "end_date": "2026-01-31"
          },
          "disbursed": 384300,
          "collected": 371254,
          "financials": {
            "minimum_loan_target": 560000,
            "maximum_expected_repayment": 538020,
            "mandatory_fixed_cost": 42500,
            "salaries": 65000,
            "defaults": 42798,
            "irregular_cost_reserve": 30391.61,
            "averageMonthlyIrregularCostReserve": 22760,
            "salary_advance_reserve": 4400,
            "net_cash_position": 387722,
            "residual_cash": 357330.39
          },
          "reserve_breakdown": {
            "rent": 3000,
            "vehicle_repairs": 15849.94,
            "consumables_petty_cash": 1000,
            "field_collateral_transport": 0,
            "staff_welfare_funeral": 6141.67,
            "salary_advances": 4400
          },
          "scores": {
            "disbursement": 69,
            "collection": 100,
            "residual_cash": 100,
            "overall": 89,
            "status": "GREEN"
          },
          "reason": "disbursement is K175,700.00 below the minimum loan target, reducing the Disbursement Score to 69.",
          "details": {
            "salaries": {
              "cycle_start": "2026-01-01",
              "consultants": [
                {
                  "user_id": 1948,
                  "name": "Ruth Gloria Phiri",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2726,
                  "name": "Mary Given Tembo",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2727,
                  "name": "Suzyo Nyirenda",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2740,
                  "name": "Miyoba Munkombwe",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2742,
                  "name": "Mudenda Samboko",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2743,
                  "name": "Emeldah Bwalya",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2745,
                  "name": "Jane Banda",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2746,
                  "name": "Fanny Ngulube",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2760,
                  "name": "Angela Katebe",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2761,
                  "name": "Lucas Mwale",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2763,
                  "name": "Benard Banda",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 3065,
                  "name": "Sara Daka",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 3069,
                  "name": "Fridah Zulu",
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
              "still_uncollected": 42798
            },
            "salary_advances": {
              "salary_advances": 4400,
              "advance_count": 3,
              "advances": [
                {
                  "user_id": 2740,
                  "full_name": "Miyoba Munkombwe",
                  "original_amount": 2000,
                  "amount_paid": 0,
                  "remaining_amount": 2000,
                  "installment_amount": 2000,
                  "status": "approved",
                  "purpose": "General Finance",
                  "date_requested": "2026-09-07T00:00:00.000Z",
                  "date_approved": "2026-09-07T00:00:00.000Z",
                  "expected_repayment_dates": "2026-10-01T00:00:00.000Z"
                },
                {
                  "user_id": 2726,
                  "full_name": "Mary Given Tembo",
                  "original_amount": 1400,
                  "amount_paid": 0,
                  "remaining_amount": 1400,
                  "installment_amount": 1400,
                  "status": "approved",
                  "purpose": "General Finance",
                  "date_requested": "2026-09-11T00:00:00.000Z",
                  "date_approved": "2026-09-11T00:00:00.000Z",
                  "expected_repayment_dates": "2026-10-01T00:00:00.000Z"
                },
                {
                  "user_id": 2743,
                  "full_name": "Emeldah Bwalya",
                  "original_amount": 1000,
                  "amount_paid": 0,
                  "remaining_amount": 1000,
                  "installment_amount": 1000,
                  "status": "approved",
                  "purpose": "General Finance",
                  "date_requested": "2026-09-04T00:00:00.000Z",
                  "date_approved": "2026-09-04T00:00:00.000Z",
                  "expected_repayment_dates": "2026-10-01T00:00:00.000Z"
                }
              ]
            },
            "irregular_costs": {
              "irregular_cost_reserve": 25991.61,
              "average_monthly_irregular_cost_reserve": 22760,
              "breakdown": {
                "rent": 3000,
                "vehicle_repairs": 15849.94,
                "consumables_petty_cash": 1000,
                "field_collateral_transport": 0,
                "staff_welfare_funeral": 6141.67
              }
            }
          },
          "office_name": "Nyimba Branch",
          "province_id": 3,
          "district_id": 33,
          "district_name": "Nyimba District"
        }
      ]
    },
    {
      "district_id": 34,
      "district_name": "Petauke District",
      "office_count": 1,
      "disbursed": 307680,
      "collected": 463155.53,
      "financials": {
        "minimum_loan_target": 0,
        "maximum_expected_repayment": 430752,
        "mandatory_fixed_cost": 42500,
        "salaries": 85000,
        "defaults": 455189.63,
        "irregular_cost_reserve": 43944.11,
        "averageMonthlyIrregularCostReserve": 128522.36,
        "salary_advance_reserve": 15500,
        "net_cash_position": -151937.63,
        "residual_cash": -195881.74
      },
      "reserve_breakdown": {
        "rent": 2000,
        "vehicle_repairs": 15849.94,
        "consumables_petty_cash": 4261.67,
        "field_collateral_transport": 190.83,
        "staff_welfare_funeral": 6141.67,
        "salary_advances": 15500
      },
      "scores": {
        "disbursement": 0,
        "collection": 100,
        "residual_cash": 0,
        "overall": 35,
        "status": "RED"
      },
      "reason": "residual cash is negative by K195,881.74, indicating that expected obligations exceed available cash.",
      "offices": [
        {
          "office_id": 33,
          "cycle": {
            "start_date": "2026-01-01",
            "end_date": "2026-01-31"
          },
          "disbursed": 307680,
          "collected": 463155.53,
          "financials": {
            "minimum_loan_target": 0,
            "maximum_expected_repayment": 430752,
            "mandatory_fixed_cost": 42500,
            "salaries": 85000,
            "defaults": 455189.63,
            "irregular_cost_reserve": 43944.11,
            "averageMonthlyIrregularCostReserve": 128522.36,
            "salary_advance_reserve": 15500,
            "net_cash_position": -151937.63,
            "residual_cash": -195881.74
          },
          "reserve_breakdown": {
            "rent": 2000,
            "vehicle_repairs": 15849.94,
            "consumables_petty_cash": 4261.67,
            "field_collateral_transport": 190.83,
            "staff_welfare_funeral": 6141.67,
            "salary_advances": 15500
          },
          "scores": {
            "disbursement": 0,
            "collection": 100,
            "residual_cash": 0,
            "overall": 35,
            "status": "RED"
          },
          "reason": "residual cash is negative by K195,881.74, indicating that expected obligations exceed available cash.",
          "details": {
            "salaries": {
              "cycle_start": "2026-01-01",
              "consultants": [
                {
                  "user_id": 1938,
                  "name": "Annie Mweemba",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 1961,
                  "name": "Lister Banda",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 1918,
                  "name": "Precious Mbewe",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 1922,
                  "name": "Sydney Ngoma",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2094,
                  "name": "Haggai Tembo",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2696,
                  "name": "Zaina Kashinda",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2900,
                  "name": "Kondwani Nyirenda",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2897,
                  "name": "Misozi Mwanza",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2901,
                  "name": "Deborah NKhoma",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2902,
                  "name": "Martha Sibayuni",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2903,
                  "name": "MOSES SAKALA",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2911,
                  "name": "Brian Simamba",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2898,
                  "name": "Kumbuso Phiri",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2896,
                  "name": "Mainala Mwanza",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2904,
                  "name": "Tonda Mvula",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 2915,
                  "name": "Glenda Kaimbo",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 1904,
                  "name": "Malindila Chiyakamba",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                }
              ],
              "total_salary": 85000
            },
            "defaults": {
              "start_date": "2026-01-01",
              "end_date": "2026-01-31",
              "still_uncollected": 455189.63
            },
            "salary_advances": {
              "salary_advances": 15500,
              "advance_count": 7,
              "advances": [
                {
                  "user_id": 1922,
                  "full_name": "Sydney Ngoma",
                  "original_amount": 5000,
                  "amount_paid": 1000,
                  "remaining_amount": 4000,
                  "installment_amount": 1000,
                  "status": "approved",
                  "purpose": "General Finance",
                  "date_requested": "2026-07-13T00:00:00.000Z",
                  "date_approved": "2026-07-13T00:00:00.000Z",
                  "expected_repayment_dates": "2026-10-01T00:00:00.000Z"
                },
                {
                  "user_id": 2696,
                  "full_name": "Zaina Kashinda",
                  "original_amount": 4500,
                  "amount_paid": 1000,
                  "remaining_amount": 3500,
                  "installment_amount": 1000,
                  "status": "approved",
                  "purpose": "Other",
                  "date_requested": "2026-08-10T00:00:00.000Z",
                  "date_approved": "2026-08-10T00:00:00.000Z",
                  "expected_repayment_dates": "2026-10-01T00:00:00.000Z"
                },
                {
                  "user_id": 1961,
                  "full_name": "Lister Banda",
                  "original_amount": 3000,
                  "amount_paid": 0,
                  "remaining_amount": 3000,
                  "installment_amount": 1500,
                  "status": "approved",
                  "purpose": "Other",
                  "date_requested": "2026-09-02T00:00:00.000Z",
                  "date_approved": "2026-09-02T00:00:00.000Z",
                  "expected_repayment_dates": "2026-10-01T00:00:00.000Z"
                },
                {
                  "user_id": 2911,
                  "full_name": "Brian Simamba",
                  "original_amount": 2000,
                  "amount_paid": 0,
                  "remaining_amount": 2000,
                  "installment_amount": 2000,
                  "status": "approved",
                  "purpose": "General Finance",
                  "date_requested": "2026-09-08T00:00:00.000Z",
                  "date_approved": "2026-09-08T00:00:00.000Z",
                  "expected_repayment_dates": "2026-10-01T00:00:00.000Z"
                },
                {
                  "user_id": 2915,
                  "full_name": "Glenda Kaimbo",
                  "original_amount": 2000,
                  "amount_paid": 0,
                  "remaining_amount": 2000,
                  "installment_amount": 2000,
                  "status": "approved",
                  "purpose": "General Finance",
                  "date_requested": "2026-09-08T00:00:00.000Z",
                  "date_approved": "2026-09-08T00:00:00.000Z",
                  "expected_repayment_dates": "2026-10-01T00:00:00.000Z"
                },
                {
                  "user_id": 2094,
                  "full_name": "Haggai Tembo",
                  "original_amount": 500,
                  "amount_paid": 0,
                  "remaining_amount": 500,
                  "installment_amount": 500,
                  "status": "approved",
                  "purpose": "Other",
                  "date_requested": "2026-09-08T00:00:00.000Z",
                  "date_approved": "2026-09-08T00:00:00.000Z",
                  "expected_repayment_dates": "2026-10-01T00:00:00.000Z"
                },
                {
                  "user_id": 2902,
                  "full_name": "Martha Sibayuni",
                  "original_amount": 500,
                  "amount_paid": 0,
                  "remaining_amount": 500,
                  "installment_amount": 500,
                  "status": "approved",
                  "purpose": "General Finance",
                  "date_requested": "2026-09-09T00:00:00.000Z",
                  "date_approved": "2026-09-09T00:00:00.000Z",
                  "expected_repayment_dates": "2026-10-01T00:00:00.000Z"
                }
              ]
            },
            "irregular_costs": {
              "irregular_cost_reserve": 28444.11,
              "average_monthly_irregular_cost_reserve": 128522.36,
              "breakdown": {
                "rent": 2000,
                "vehicle_repairs": 15849.94,
                "consumables_petty_cash": 4261.67,
                "field_collateral_transport": 190.83,
                "staff_welfare_funeral": 6141.67
              }
            }
          },
          "office_name": "PETAUKE BRANCH",
          "province_id": 3,
          "district_id": 34,
          "district_name": "Petauke District"
        }
      ]
    },
    {
      "district_id": 35,
      "district_name": "Sinda District",
      "office_count": 1,
      "disbursed": 0,
      "collected": 0,
      "financials": {
        "minimum_loan_target": 440000,
        "maximum_expected_repayment": 0,
        "mandatory_fixed_cost": 42500,
        "salaries": 55000,
        "defaults": 0,
        "irregular_cost_reserve": 21991.61,
        "averageMonthlyIrregularCostReserve": 14393.75,
        "salary_advance_reserve": 0,
        "net_cash_position": -97500,
        "residual_cash": -119491.61
      },
      "reserve_breakdown": {
        "rent": 0,
        "vehicle_repairs": 15849.94,
        "consumables_petty_cash": 0,
        "field_collateral_transport": 0,
        "staff_welfare_funeral": 6141.67,
        "salary_advances": 0
      },
      "scores": {
        "disbursement": 0,
        "collection": 100,
        "residual_cash": 0,
        "overall": 35,
        "status": "RED"
      },
      "reason": "disbursement is K440,000.00 below the minimum loan target, reducing the Disbursement Score to 0.",
      "offices": [
        {
          "office_id": 81,
          "cycle": {
            "start_date": "2026-01-01",
            "end_date": "2026-01-31"
          },
          "disbursed": 0,
          "collected": 0,
          "financials": {
            "minimum_loan_target": 440000,
            "maximum_expected_repayment": 0,
            "mandatory_fixed_cost": 42500,
            "salaries": 55000,
            "defaults": 0,
            "irregular_cost_reserve": 21991.61,
            "averageMonthlyIrregularCostReserve": 14393.75,
            "salary_advance_reserve": 0,
            "net_cash_position": -97500,
            "residual_cash": -119491.61
          },
          "reserve_breakdown": {
            "rent": 0,
            "vehicle_repairs": 15849.94,
            "consumables_petty_cash": 0,
            "field_collateral_transport": 0,
            "staff_welfare_funeral": 6141.67,
            "salary_advances": 0
          },
          "scores": {
            "disbursement": 0,
            "collection": 100,
            "residual_cash": 0,
            "overall": 35,
            "status": "RED"
          },
          "reason": "disbursement is K440,000.00 below the minimum loan target, reducing the Disbursement Score to 0.",
          "details": {
            "salaries": {
              "cycle_start": "2026-01-01",
              "consultants": [
                {
                  "user_id": 2689,
                  "name": "Esnart Phiri",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 3029,
                  "name": "Ruth Mwanza",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 3030,
                  "name": "Racheal Banda",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 3031,
                  "name": "Mervis Banda",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 3032,
                  "name": "Elijah Ziwa",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 3033,
                  "name": "Oscar Tembo",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 3034,
                  "name": "Japhet Tembo",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 3035,
                  "name": "Reuben Sakala",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 3038,
                  "name": "Chisomo Mbewe",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 3039,
                  "name": "Bernard Phiri",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                },
                {
                  "user_id": 3040,
                  "name": "Hope Chibaye",
                  "current_target_level": 0,
                  "previous_3_targets": [],
                  "reached_40000_last_3_months": false,
                  "predicted_salary": 5000
                }
              ],
              "total_salary": 55000
            },
            "defaults": {
              "start_date": "2026-01-01",
              "end_date": "2026-01-31",
              "still_uncollected": 0
            },
            "salary_advances": {
              "salary_advances": 0,
              "advance_count": 0,
              "advances": []
            },
            "irregular_costs": {
              "irregular_cost_reserve": 21991.61,
              "average_monthly_irregular_cost_reserve": 14393.75,
              "breakdown": {
                "rent": 0,
                "vehicle_repairs": 15849.94,
                "consumables_petty_cash": 0,
                "field_collateral_transport": 0,
                "staff_welfare_funeral": 6141.67
              }
            }
          },
          "office_name": "SINDA BRANCH",
          "province_id": 3,
          "district_id": 35,
          "district_name": "Sinda District"
        }
      ]
    }
  ]
}