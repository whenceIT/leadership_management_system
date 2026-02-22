
---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews/schedule` | Schedule a new review |
| GET | `/api/reviews/schedule` | Get all scheduled reviews |
| GET | `/api/reviews/schedule/:id` | Get a single review by ID |
| PUT | `/api/reviews/schedule/:id` | Update a scheduled review |
| DELETE | `/api/reviews/schedule/:id` | Cancel/delete a review |
| PATCH | `/api/reviews/schedule/:id/status` | Update review status only |

---

## POST /api/reviews/schedule

Schedule a new performance review.

### Request Body

```json
{
    "position": "branch_manager",
    "reviewType": "monthly",
    "title": "Q1 Performance Review",
    "description": "Monthly performance review for branch staff",
    "scheduledDate": "2026-03-15",
    "scheduledTime": "09:00",
    "assignee": "John Doe",
    "priority": "high",
    "sendReminder": true,
    "reminderDaysBefore": 3,
    "user_id": 123,
    "office_id": 5
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| position | string | Position ID or name |
| reviewType | string | Type of review (monthly, quarterly, annual) |
| title | string | Review title (min 3 characters) |
| scheduledDate | string | Date in YYYY-MM-DD format |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| description | string | null | Detailed description |
| scheduledTime | string | "09:00" | Time in HH:MM format |
| assignee | string | position | Person assigned to review |
| priority | string | "medium" | low, medium, or high |
| sendReminder | boolean | true | Send reminder notifications |
| reminderDaysBefore | number | 1 | Days before to remind (1-30) |
| user_id | number | null | Associated user ID |
| office_id | number | null | Associated office ID |

### Response (201 Created)

```json
{
    "success": true,
    "message": "Review scheduled successfully",
    "data": {
        "id": 1,
        "position": "branch_manager",
        "reviewType": "monthly",
        "title": "Q1 Performance Review",
        "description": "Monthly performance review for branch staff",
        "scheduledDateTime": "2026-03-15T09:00:00.000Z",
        "assignee": "John Doe",
        "priority": "high",
        "status": "scheduled",
        "sendReminder": true,
        "reminderDaysBefore": 3,
        "createdAt": "2026-02-22T14:30:00.000Z"
    }
}
```

---

## GET /api/reviews/schedule

Get all scheduled reviews with optional filtering.

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| position | string | Filter by position |
| status | string | Filter by status (scheduled, in-progress, completed, cancelled) |
| upcoming | string | Set to "true" for only upcoming reviews |
| user_id | number | Filter by user ID |
| office_id | number | Filter by office ID |
| start_date | string | Filter from date (YYYY-MM-DD) |
| end_date | string | Filter to date (YYYY-MM-DD) |
| limit | number | Max results (default: 50) |

### Example Request

```
GET /api/reviews/schedule?position=branch_manager&upcoming=true&limit=10
```

### Response

```json
{
    "success": true,
    "count": 2,
    "data": [
        {
            "id": 1,
            "position": "branch_manager",
            "reviewType": "monthly",
            "title": "Q1 Performance Review",
            "description": "Monthly performance review",
            "scheduledDateTime": "2026-03-15T09:00:00.000Z",
            "assignee": "John Doe",
            "priority": "high",
            "status": "scheduled",
            "sendReminder": true,
            "reminderDaysBefore": 3,
            "createdBy": 123,
            "createdAt": "2026-02-22T14:30:00.000Z",
            "updatedAt": "2026-02-22T14:30:00.000Z"
        }
    ]
}
```

---

## GET /api/reviews/schedule/:id

Get a single scheduled review by ID.

### Response

```json
{
    "success": true,
    "data": {
        "id": 1,
        "position": "branch_manager",
        "reviewType": "monthly",
        "title": "Q1 Performance Review",
        "description": "Monthly performance review",
        "scheduledDateTime": "2026-03-15T09:00:00.000Z",
        "assignee": "John Doe",
        "priority": "high",
        "status": "scheduled",
        "sendReminder": true,
        "reminderDaysBefore": 3,
        "createdBy": 123,
        "user_id": 123,
        "office_id": 5,
        "createdAt": "2026-02-22T14:30:00.000Z",
        "updatedAt": "2026-02-22T14:30:00.000Z"
    }
}
```

---

## PUT /api/reviews/schedule/:id

Update a scheduled review.

### Request Body (all fields optional)

```json
{
    "title": "Updated Review Title",
    "scheduledDate": "2026-03-20",
    "scheduledTime": "14:00",
    "priority": "low",
    "status": "in-progress"
}
```

### Response

```json
{
    "success": true,
    "message": "Review updated successfully",
    "data": {
        "id": 1,
        "title": "Updated Review Title",
        "status": "in-progress",
        "scheduledDateTime": "2026-03-20T14:00:00.000Z"
    }
}
```

---

## DELETE /api/reviews/schedule/:id

Cancel/delete a scheduled review.

### Response

```json
{
    "success": true,
    "message": "Scheduled review cancelled successfully"
}
```

---

## PATCH /api/reviews/schedule/:id/status

Update only the status of a scheduled review.

### Request Body

```json
{
    "status": "completed"
}
```

### Valid Status Values

- `scheduled` - Review is scheduled
- `in-progress` - Review is currently being conducted
- `completed` - Review has been completed
- `cancelled` - Review was cancelled

### Response

```json
{
    "success": true,
    "message": "Review status updated successfully",
    "data": {
        "id": 1,
        "previousStatus": "in-progress",
        "newStatus": "completed"
    }
}
```

---

## Frontend Integration Example

```javascript
// Schedule a new review
const scheduleReview = async (reviewData) => {
    const response = await fetch('/api/reviews/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            position: reviewData.position,
            reviewType: reviewData.reviewType,
            title: reviewData.title,
            description: reviewData.description,
            scheduledDate: reviewData.scheduledDate,
            scheduledTime: reviewData.scheduledTime,
            assignee: reviewData.assignee,
            priority: reviewData.priority,
            sendReminder: reviewData.sendReminder,
            reminderDaysBefore: reviewData.reminderDaysBefore,
        }),
    });
    return response.json();
};

// Get upcoming reviews
const getUpcomingReviews = async (position) => {
    const response = await fetch(
        `/api/reviews/schedule?position=${position}&upcoming=true`
    );
    return response.json();
};

// Update review status
const updateReviewStatus = async (id, status) => {
    const response = await fetch(`/api/reviews/schedule/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    return response.json();
};

// Cancel a review
const cancelReview = async (id) => {
    const response = await fetch(`/api/reviews/schedule/${id}`, {
        method: 'DELETE',
    });
    return response.json();
};
```

---

## Testing with cURL

### Create a scheduled review

```bash
curl -X POST http://localhost:5000/api/reviews/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "position": "branch_manager",
    "reviewType": "monthly",
    "title": "Q1 Performance Review",
    "scheduledDate": "2026-03-15",
    "scheduledTime": "09:00",
    "priority": "high"
  }'
```

### Get all scheduled reviews

```bash
curl "http://localhost:5000/api/reviews/schedule"
```

### Get upcoming reviews

```bash
curl "http://localhost:5000/api/reviews/schedule?upcoming=true"
```

### Update a review

```bash
curl -X PUT http://localhost:5000/api/reviews/schedule/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "in-progress"}'
```

### Delete a review

```bash
curl -X DELETE http://localhost:5000/api/reviews/schedule/1
```

---

## Error Responses

### 400 Bad Request

```json
{
    "success": false,
    "error": "Missing required fields: position, reviewType, title, and scheduledDate are required."
}
```

### 404 Not Found

```json
{
    "success": false,
    "error": "Scheduled review not found"
}
```

### 500 Internal Server Error

```json
{
    "success": false,
    "error": "Failed to schedule review"
}
```
