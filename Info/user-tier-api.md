1. GET https://smart.whencefinancesystem.com/user-tiers/:userId 

Returns user's current tier, next tier, portfolio summary, benefits, and historical tiers
Auto-assigns base tier if user has no tier assigned.


Response:

{
  "success": true,
  "data": {
    "user_id": 123,
    "current_tier": {
      "id": 2,
      "name": "K50K+",
      "description": "Intermediate tier for consistently performing consultants",
      "tier_range": "K50K+",
      "minimum_portfolio_value": 50000,
      "badge_color": "blue",
      "text_color": "white"
    },
    "next_tier": {
      "id": 3,
      "name": "K80K+",
      "minimum_portfolio_value": 80000
    },
    "portfolio_summary": {
      "current_value": 2300000,
      "current_formatted": "K2.3M",
      "required_for_next_tier": 2500000,
      "required_formatted": "K2.5M",
      "progress_percentage": 92
    },
    "benefits": [...],
    "historical_tiers": [...]
  }
}



2. PUT /user-tiers/:userId/portfolio 

Updates user's portfolio value
Automatically handles tier upgrades when threshold is reached
Request:

{
  "portfolio_value": 2450000
}
Response:

{
  "success": true,
  "message": "Portfolio value updated successfully",
  "data": {
    "user_id": 123,
    "old_portfolio_value": 2300000,
    "new_portfolio_value": 2450000,
    "tier_upgraded": false,
    "current_tier": {
      "id": 2,
      "name": "K50K+",
      "progress_percentage": 98
    },
    "next_tier": {
      "id": 3,
      "name": "K80K+",
      "remaining_to_next_tier": 50000
    }
  }
}