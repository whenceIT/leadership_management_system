GET https://smartbackend.whencefinancesystem.com/smart-kpi-scores/2706/4
GET https://smartbackend.whencefinancesystem.com/smart-kpi-scores/{user_id}/{position_id}
Content-Type : application/json

response sample:
[
    //means user has started scoring
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
        "position_id": 4,
        "category": "financial",
        "weight": "20"
    },
    //means user has started scoring
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
    },

    //means user has not score is 0 or has not scored yet
    {
        "score_id": null,
        "kpi_id": 5,
        "user_id": null,
        "score": null,
        "name": "Collect 10000",
        "description": "Collect 10000 this year",
        "scoring": "percentage",
        "target": "10000 ",
        "role": 1,
        "position_id": 4,
        "category": "operational",
        "weight": "10"
    },

    //means user has not score is 0 or has not scored yet
    {
        "score_id": null,
        "kpi_id": 6,
        "user_id": null, //means user has not score is 0 or has not scored yet
        "score": null,
        "name": "Cross-Branch Default",
        "description": "Cross-Branch Default",
        "scoring": "percentage",
        "target": "-3",
        "role": 1,
        "position_id": 4,
        "category": "operational",
        "weight": "20"
    }
]