POST  https://smartbackend.whencefinancesystem.com/kpi/:id
Content-Type : application/json

JSON request:
  {
        "role": 1,
        "position_id": 0,
        "name": "Monthly Revenue Target",
        "description": "Achieve minimum monthly revenue of $50,000",
        "scoring": "percentage",
        "target": "50000",
        "category": "financial",
        "weight": "20"
    }

Sample Response:
{
    "message": "KPI updated"
}