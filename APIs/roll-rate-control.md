https://smartbackend.whencefinancesystem.com/roll-rate-control/3

{
  "office_id": "3",
  "total_loans": 544,
  "buckets": {<!-- display these some where -->
    "1-30_days": 38,
    "31-60_days": 11,
    "61-90_days": 13,
    "90+_days": 351
  },
  "roll_rates": {<!-- display these some where -->
    "1-30_days": "6.99%",
    "31-60_days": "2.02%",
    "61-90_days": "2.39%",
    "90+_days": "64.52%"
  },
  "score": "18.98%",<!--Total Branch Average Score %-->
  "weight": "20%",<!-- e.g Total percentage point for the consituent here (25pp) -->
  "percentage_point": "3.80"<!--pp scored, put it on contribution and calculate remaining contribution and prev month trend comparision-->
}

Weighted avg of roll-rates vs targets (30→60d, 60→90d, 90+ to Recoveries)

Target: ≤ targets