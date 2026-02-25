# KPI Scores API Documentation

This documentation provides detailed information about each individual KPI score API endpoint.

## Branch Manager KPIs (position_id = 5)

### 1. Monthly Disbursement KPI

**Endpoint:** `/api/kpi-scores/monthly-disbursement`

**Method:** POST

**Description:** Records Monthly Disbursement KPI score for a user. This KPI measures the total loan amount disbursed within the month.

**Scoring Type:** Numeric

**Weight:** 20%

**Target:** K450,000+

**Request Body:**
```json
{
  "user_id": 123,
  "score": 480000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Monthly Disbursement KPI score recorded successfully",
  "data": {
    "kpi_id": 1,
    "user_id": 123,
    "score": 480000,
    "kpi_name": "Monthly Disbursement",
    "weight": 20
  }
}
```

### 2. Month-1 Default Rate KPI

**Endpoint:** `/api/kpi-scores/month1-default-rate`

**Method:** POST

**Description:** Records Month-1 Default Rate KPI score for a user. This KPI measures the percentage of loans defaulting within the first 30 days.

**Scoring Type:** Percentage

**Weight:** 25%

**Target:** ≤25%

**Request Body:**
```json
{
  "user_id": 123,
  "score": 22
}
```

**Response:**
```json
{
  "success": true,
  "message": "Month-1 Default Rate KPI score recorded successfully",
  "data": {
    "kpi_id": 2,
    "user_id": 123,
    "score": 22,
    "kpi_name": "Month-1 Default Rate",
    "weight": 25
  }
}
```

### 3. LCs at K50K+ Tier KPI

**Endpoint:** `/api/kpi-scores/lcs-at-k50k-tier`

**Method:** POST

**Description:** Records LCs at K50K+ Tier KPI score for a user. This KPI measures the percentage of Loan Consultants at K50K+ portfolio tier.

**Scoring Type:** Percentage

**Weight:** 15%

**Target:** ≥40%

**Request Body:**
```json
{
  "user_id": 123,
  "score": 45
}
```

**Response:**
```json
{
  "success": true,
  "message": "LCs at K50K+ Tier KPI score recorded successfully",
  "data": {
    "kpi_id": 3,
    "user_id": 123,
    "score": 45,
    "kpi_name": "LCs at K50K+ Tier",
    "weight": 15
  }
}
```

### 4. Branch Net Contribution KPI

**Endpoint:** `/api/kpi-scores/branch-net-contribution`

**Method:** POST

**Description:** Records Branch Net Contribution KPI score for a user. This KPI measures the branch net financial contribution (income minus expenses).

**Scoring Type:** Numeric

**Weight:** 15%

**Target:** K324,000+

**Request Body:**
```json
{
  "user_id": 123,
  "score": 350000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Branch Net Contribution KPI score recorded successfully",
  "data": {
    "kpi_id": 4,
    "user_id": 123,
    "score": 350000,
    "kpi_name": "Net Contribution",
    "weight": 15
  }
}
```

### 5. Branch Recovery Rate (Month-4) KPI

**Endpoint:** `/api/kpi-scores/branch-recovery-rate-month4`

**Method:** POST

**Description:** Records Branch Recovery Rate (Month-4) KPI score for a user. This KPI measures the collection rate after 4 months from disbursement.

**Scoring Type:** Percentage

**Weight:** 25%

**Target:** ≥65%

**Request Body:**
```json
{
  "user_id": 123,
  "score": 70
}
```

**Response:**
```json
{
  "success": true,
  "message": "Branch Recovery Rate (Month-4) KPI score recorded successfully",
  "data": {
    "kpi_id": 5,
    "user_id": 123,
    "score": 70,
    "kpi_name": "Recovery Rate (Month-4)",
    "weight": 25
  }
}
```

## Get KPI Scores for Specific KPI

**Endpoint:** `/api/kpi-scores/:kpi_name/:user_id`

**Method:** GET

**Description:** Retrieves the KPI score for a specific KPI and user.

**Parameters:**
- `kpi_name`: Name of the KPI (should match exactly with the name in the database)
- `user_id`: ID of the user

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "kpi_id": 1,
    "user_id": 123,
    "score": 480000,
    "created_date": "2026-02-24T19:54:28.000Z",
    "name": "Monthly Disbursement",
    "description": "Total loan amount disbursed within the month",
    "scoring": "numeric",
    "target": "K450,000+",
    "role": 5,
    "position_id": 5,
    "category": "Financial",
    "weight": 20
  }
}
```

## Error Handling

All APIs include comprehensive error handling. Common errors include:

1. **400 Bad Request**: Missing or invalid parameters
2. **404 Not Found**: KPI not found
3. **500 Internal Server Error**: Database errors

**Error Response Example:**
```json
{
  "success": false,
  "error": "Failed to record Monthly Disbursement KPI score",
  "message": "Database connection failed"
}
```

## Database Structure

### smart_kpis Table
Stores information about each KPI including:
- `id`: Unique identifier
- `name`: KPI name (used to find the correct KPI)
- `position_id`: Position ID (5 for Branch Manager)
- `scoring`: Scoring type ('numeric' or 'percentage')
- `weight`: Weight of the KPI (1-100)
- `target`: Target value for the KPI

### smart_kpi_score Table
Stores user's KPI scores:
- `id`: Unique identifier
- `kpi_id`: ID of the KPI
- `user_id`: ID of the user
- `score`: User's score
- `created_date`: Date the score was recorded
