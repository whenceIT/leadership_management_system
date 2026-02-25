GET https://smartbackend.whencefinancesystem.com/smart-kpi-scores/1905/5
Which is GET https://smartbackend.whencefinancesystem.com/smart-kpi-scores/{user_id}/{position_id}
Content-Type : application/json

response sample:
[

    //display all these KPIs
    {
        "score_id": null, //means kpi has not started yet scoring
        "kpi_id": 9,
        "user_id": null,
        "score": null, 
        "name": "Monthly Disbursement",
        "description": "Total loan amount disbursed within the month",
        "scoring": "numeric",
        "target": "K450,000+",
        "role": 5,
        "position_id": 5,
        "category": "Financial",
        "weight": "20"
    },
    {
        "score_id": 4,
        "kpi_id": 10,
        "user_id": 1905,
        "score": "18", //calculate score with target kpicalculor
        "name": "Month-1 Default Rate",
        "description": "Percentage of loans defaulting within first 30 days",
        "scoring": "percentage",
        "target": "≤25%",
        "role": 5,
        "position_id": 5,
        "category": "Risk",
        "weight": "25"
    },
    {
        "score_id": null,
        "kpi_id": 11,
        "user_id": null,
        "score": null,
        "name": "Recovery Rate (Month-4)",
        "description": "Collection rate after 4 months from disbursement",
        "scoring": "percentage",
        "target": "≥65%",
        "role": 5,
        "position_id": 5,
        "category": "Financial",
        "weight": "25"
    },
    {
        "score_id": null,
        "kpi_id": 12,
        "user_id": null,
        "score": null,
        "name": "LCs at K50K+ Tier",
        "description": "Percentage of Loan Consultants at K50K+ portfolio tier",
        "scoring": "percentage",
        "target": "≥40%",
        "role": 5,
        "position_id": 5,
        "category": "Team & Development",
        "weight": "15"
    },
    {
        "score_id": null,
        "kpi_id": 13,
        "user_id": null,
        "score": null,
        "name": "Net Contribution",
        "description": "Branch net financial contribution (income minus expenses)",
        "scoring": "numeric",
        "target": "K324,000+",
        "role": 5,
        "position_id": 5,
        "category": "Financial",
        "weight": "15"
    }
]