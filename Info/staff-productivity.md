API Endpoint: GET /staff-productivity
Query Parameters
Parameter	Required	Description
office_id	Yes	Branch office ID
period_start	No	Start date (YYYY-MM-DD), defaults to current month
period_end	No	End date (YYYY-MM-DD), defaults to end of current month
include_officers	No	Include individual officer breakdown (default: true)
Example Request
GET /staff-productivity?office_id=1
Response Structure
{
  "success": true,
  "data": {
    "metric": "Staff Productivity",
    "office_id": 1,
    "office_name": "Lusaka Branch",
    "period": {
      "start_date": "2026-02-01",
      "end_date": "2026-02-28"
    },
    "current_period": {
      "productivity_score": 87.5,
      "formatted_score": "87.5%",
      "total_officers": 12,
      "improvement": 5.2,
      "formatted_improvement": "+5.2% improvement",
      "trend_direction": "improving"
    },
    "previous_period": {
      "start_date": "2026-01-01",
      "end_date": "2026-01-31",
      "productivity_score": 82.3,
      "formatted_score": "82.3%"
    },
    "kpi_weights": {
      "disbursement_target": { "weight": "40%", "description": "Disbursement Target Achievement" },
      "collections_rate": { "weight": "30%", "description": "Collections Rate Performance" },
      "portfolio_quality": { "weight": "20%", "description": "Portfolio Quality (Low PAR)" },
      "client_acquisition": { "weight": "10%", "description": "New Client Acquisition" }
    },
    "performance_summary": {
      "average_disbursement_rate": 92.5,
      "average_collection_rate": 88.3,
      "average_par_rate": 4.2,
      "total_new_clients": 45
    },
    "performance_categories": {
      "excellent": 3,
      "good": 5,
      "average": 3,
      "needs_improvement": 1
    },
    "benchmark": {
      "target_score": 80,
      "status": "on_target",
      "variance_from_target": 7.5
    },
    "officer_breakdown": [
      {
        "officer_id": 15,
        "officer_name": "John Smith",
        "scores": {
          "disbursement": { "achievement_rate": 105.2, "weighted_score": 42.0, "weight": "40%" },
          "collections": { "rate": 95.3, "weighted_score": 28.6, "weight": "30%" },
          "portfolio_quality": { "par_30_rate": 2.1, "weighted_score": 19.6, "weight": "20%" },
          "client_acquisition": { "new_clients": 8, "target": 10, "weighted_score": 8.0, "weight": "10%" }
        },
        "total_score": 98.2,
        "previous_score": 92.1,
        "change": 6.1,
        "rating": "Excellent"
      }
    ],
    "top_performers": [...],
    "needs_attention": [...]
  }
}
Data Sources Used
users - officer details, office assignment
loans - portfolio per officer
loan_transactions - collections data
loan_repayment_schedules - PAR calculation
target_tracker - disbursement targets
clients - client acquisition
KPI Calculation Formula
Staff Productivity = (Disbursement Score × 0.40) + (Collections Score × 0.30) + (Quality Score × 0.20) + (Acquisition Score × 0.10)

Where:
- Disbursement Score = (Actual Disbursement / Target Disbursement) × 100
- Collections Score = (Collected Amount / Expected Amount) × 100
- Quality Score = (100 - PAR_30_Rate)
- Acquisition Score = (New Clients / Client Target) × 100
Performance Ratings
Score Range	Rating
90-100%	Excellent
80-89%	Good
70-79%	Average
Below 70%	Needs Improvement