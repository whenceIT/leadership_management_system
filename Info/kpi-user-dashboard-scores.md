GET https://smartbackend.whencefinancesystem.com/smart-kpi-scores/2706
Content-Type : application/json

response sample:
[
    {
        "score_id": 2,
        "kpi_id": 2,
        "user_id": 2706,
        "score": "20000",
        "name": "Monthly Revenue Target",
        "description": "Achieve minimum monthly revenue of $50,000",
        "scoring": "percentage",
        "target": "50000",
        "role": 1,
        "position_id": 0,
        "category": "financial",
        "weight": "20"
    },
    {
        "score_id": 4,
        "kpi_id": 4,
        "user_id": 2706,
        "score": "1000",
        "name": "Given out 1000",
        "description": "Give out 4000",
        "scoring": "percentage",
        "target": "4000",
        "role": 1,
        "position_id": 4,
        "category": "operational",
        "weight": "10"
    }
]