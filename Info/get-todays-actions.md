Sample requests:

# Get today's priority actions (default)
GET http://localhost:5000/smart-priority-actions

# Get with date range
GET http://localhost:5000/smart-priority-actions?start_date=2026-02-01&end_date=2026-02-28

# Get by user_id
GET http://localhost:5000/smart-priority-actions?user_id=12

# Get by office_id and status
GET http://localhost:5000/smart-priority-actions?office_id=3&status=0
Response format:

{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "actions": "Complete quarterly report",
      "due": "string on words",
      "urgent": 1,
      "status": 0,
      "position_id": 5,
      "user_id": 12,
      "office_id": 3,
      "created_date": "2026-02-17T12:00:00.000Z",
      "updated_at": "2026-02-17T12:00:00.000Z"
    }
  ]
}