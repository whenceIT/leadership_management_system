# Cash Health API Documentation

This document describes the API endpoints and response structures for the Cash Health module.

## Table of Contents

- [Routes](#routes)
- [Page Views](#page-views)
  - [Show (Branch) - `/cash-health/show/{id}`](#show-branch---cash-healthshowid)
  - [District - `/cash-health/district/{district}`](#district---cash-healthdistrictdistrict)
  - [Province - `/cash-health/province/{province}`](#province---cash-healthprovinceprovince)
  - [National - `/cash-health/national`](#national---cash-healthnational)
  - [Item (Legacy) - `/cash-health/item`](#item---cash-healthitem)
- [JavaScript API Endpoints](#javascript-api-endpoints)

---

## Routes

All routes are defined in `routes/web.php` under the `cash_health` prefix.

| Method | Route | Controller Method | Route Name |
|--------|-------|-------------------|------------|
| GET | `/cash_health/show/{id}` | `CashHealthController@show` | `cash_health.show` |
| GET | `/cash_health/district/{district}` | `CashHealthController@district` | `cash_health.district` |
| GET | `/cash_health/province/{province}` | `CashHealthController@province` | `cash_health.province` |
| GET | `/cash_health/national` | `CashHealthController@national` | `cash_health.national` |
| GET | `/cash_health/contribution/{id}` | `CashHealthController@contributionHistory` | `cash_health.contribution` |
| GET | `/cash_health/national/balances` | `CashHealthController@nationalBalances` | `cash_health.national.balances` |
| GET | `/cash_health/national/balance/{officeId}` | `CashHealthController@nationalOfficeBalance` | `cash_health.national.office.balance` |

---

## Page Views

### Show (Branch) - `/cash-health/show/{id}`

**Route Name**: `cash_health.show`

**Purpose**: Displays cash health details for a specific branch/office.

**Query Parameters**:
- `cycle_start` (optional): Date in `Y-m-d` format. Must be the 25th of a month. Defaults to current cycle.

**Response Data Structure**:

```php
[
    'office' => [
        'office_id' => int,
        'name' => string
    ],
    'cycle' => [
        'start' => 'Y-m-d',
        'end' => 'Y-m-d'
    ],
    'scores' => [
        'overall' => float,
        'disbursement' => float,
        'collection' => float,
        'residual_cash' => float,
        'status' => string('GREEN' | 'AMBER' | 'RED'),
        'months_of_cover' => float,
        'full_payment_ratio' => float
    ],
    'financials' => [
        'minimum_loan_target' => float,
        'maximum_expected_repayment' => float,
        'mandatory_fixed_cost' => float,
        'salaries' => float,
        'defaults' => float,
        'irregular_cost_reserve' => float,
        'salary_advance_reserve' => float,
        'net_cash_position' => float,
        'residual_cash' => float
    ],
    'loans' => [
        'number_of_loans' => int,
        'total_collected' => float
    ],
    'reason' => string,
    'disbursed' => float,
    'collected' => float,
    'availableCycles' => array,
    'cycleStart' => string,
    'cycleEnd' => string
]
```

---

### District - `/cash-health/district/{district}`

**Route Name**: `cash_health.district`

**Purpose**: Displays cash health overview for all branches in a district with expandable office details.

**Query Parameters**:
- `cycle_start` (optional): Date in `Y-m-d` format. Must be the 25th of a month. Defaults to current cycle.

**Response Data Structure**:

```php
[
    'districtHealth' => [
        'district_id' => int,
        'district_name' => string,
        'office_count' => int,
        'scores' => [
            'overall' => float,
            'status' => string('GREEN' | 'AMBER' | 'RED'),
            'disbursement' => float,
            'collection' => float,
            'residual_cash' => float
        ],
        'financials' => [
            'residual_cash' => float,
            'net_cash_position' => float
        ],
        'reason' => string,
        'offices' => [
            [
                'office_id' => int,
                'name' => string,
                'scores' => [...],
                'financials' => [...],
                'reason' => string
            ]
        ]
    ],
    'availableCycles' => array,
    'cycleStart' => string,
    'cycleEnd' => string,
    'offices' => Collection<Office>
]
```

---

### Province - `/cash-health/province/{province}`

**Route Name**: `cash_health.province`

**Purpose**: Displays cash health for all districts within a province, with expandable district and branch details.

**Query Parameters**:
- `cycle_start` (optional): Date in `Y-m-d` format. Must be the 25th of a month. Defaults to current cycle.

**Response Data Structure**:

```php
[
    'provinceHealth' => [
        'province_id' => int,
        'province_name' => string,
        'office_count' => int,
        'scores' => [
            'overall' => float,
            'status' => string('GREEN' | 'AMBER' | 'RED'),
            'disbursement' => float,
            'collection' => float,
            'residual_cash' => float
        ],
        'financials' => [
            'residual_cash' => float,
            'net_cash_position' => float
        ],
        'reason' => string,
        'districts' => [
            [
                'district_id' => int,
                'district_name' => string,
                'office_count' => int,
                'scores' => [...],
                'financials' => [...],
                'reason' => string,
                'offices' => [...]
            ]
        ]
    ],
    'availableCycles' => array,
    'cycleStart' => string,
    'cycleEnd' => string,
    'districts' => array,
    'totalOffices' => int
]
```

---

### National - `/cash-health/national`

**Route Name**: `cash_health.national`

**Purpose**: Displays institution-wide cash health overview with province and office drill-down.

**Query Parameters**:
- `cycle_start` (optional): Date in `Y-m-d` format. Must be the 25th of a month. Defaults to current cycle.

**Response Data Structure**:

```php
[
    'nationalHealth' => [
        'office_count' => int,
        'scores' => [
            'overall' => float,
            'status' => string,
            'disbursement' => float,
            'collection' => float,
            'residual_cash' => float
        ],
        'financials' => [
            'minimum_loan_target' => float,
            'maximum_expected_repayment' => float,
            'mandatory_fixed_cost' => float,
            'salaries' => float,
            'defaults' => float,
            'irregular_cost_reserve' => float,
            'salary_advance_reserve' => float,
            'net_cash_position' => float,
            'residual_cash' => float
        ],
        'reserve_breakdown' => [
            'irregular_cost_reserve' => float,
            'salary_advance_reserve' => float,
            'defaults' => float
        ],
        'provinces' => [
            [
                'province_id' => int,
                'province_name' => string,
                'office_count' => int,
                'scores' => [...],
                'financials' => [...],
                'reason' => string,
                'districts' => [...]
            ]
        ],
        'offices' => [
            [
                'office_id' => int,
                'name' => string,
                'scores' => [...],
                'financials' => [...],
                'reason' => string
            ]
        ]
    ],
    'availableCycles' => array,
    'cycleStart' => string,
    'cycleEnd' => string,
    'totalBalance' => float,
    'offices' => Collection<Office>
]
```

---

### Item (Legacy) - `/cash-health/item`

**Route Name**: None (legacy view)

**Purpose**: Legacy view with additional features including reserve breakdown and contribution charts.

**Query Parameters**:
- `cycle_start` (optional): Date in `Y-m-d` format. Defaults to current cycle.

**Response Data Structure**:

```php
[
    'financials' => [...],
    'scores' => [...],
    'status' => string('HEALTHY' | 'NEEDS ATTENTION' | 'AT RISK'),
    'statusConfig' => [
        'label' => string,
        'bg' => string,
        'border' => string,
        'color' => string,
        'iconBg' => string,
        'icon' => string,
        'description' => string
    ],
    'office' => [...],
    'availableCycles' => array,
    'cycleStart' => string,
    'cycleEnd' => string,
    'id' => int,
    'officeName' => string,
    'contributionEndpoint' => string
]
```

---

## JavaScript API Endpoints

### Contribution History - `GET /cash_health/contribution/{id}`

**Route Name**: `cash_health.contribution`

**Purpose**: Fetches contribution history data for rendering the contribution chart.

**Parameters**:
- `id` (path parameter): Office ID

**Response Structure**:

```json
{
    "cycles": [
        {
            "cycle": {
                "start_date": "YYYY-MM-DD",
                "end_date": "YYYY-MM-DD"
            },
            "contribution": float,
            "cumulative_contribution": float
        }
    ],
    "total_contribution": float
}
```

### National Balances - `GET /cash_health/national/balances`

**Route Name**: `cash_health.national.balances`

**Purpose**: Returns all offices with their province/district hierarchy for national views.

**Response Structure**:

```json
{
    "success": true,
    "offices": [
        {
            "office_id": int,
            "office_name": string,
            "province_id": int,
            "district_id": int,
            "province_name": string,
            "district_name": string,
            "wallet_id": string
        }
    ]
}
```

### National Office Balance - `GET /cash_health/national/balance/{officeId}`

**Route Name**: `cash_health.national.office.balance`

**Purpose**: Fetches real-time cash balance for a specific office.

**Parameters**:
- `officeId` (path parameter): Office ID

**Response Structure**:

```json
{
    "success": true,
    "office_id": int,
    "province_id": int,
    "district_id": int,
    "balance": float
}
```

**Error Response**:

```json
{
    "success": false,
    "message": "Office not found."
}
```

Or when wallet is not configured:

```json
{
    "success": false,
    "office_id": int,
    "balance": null,
    "message": "Please verify withinhere wallet."
}
```

---

## Status Color Mapping

### Score Status

| Status | Label | Background Color | Text Color |
|--------|-------|------------------|------------|
| GREEN | Healthy | `#dcfce7` | `#15803d` |
| AMBER | Needs Attention | `#fef3c7` | `#b45309` |
| RED | At Risk | `#fee2e2` | `#dc2626` |

### Balance Status

| Condition | Color |
|-----------|-------|
| Balance >= 0 | `#202633` (dark green) |
| Balance < 0 | `#dc2626` (dark red) |

### National Status

| Status | Label | Background Color | Text Color |
|--------|-------|------------------|------------|
| green | Healthy | `#ecfdf5` | `#087443` |
| amber | Needs Attention | `#fff8e8` | `#9a6500` |
| red | At Risk | `#fff0f0` | `#a72828` |

---

## Cycle Selector Format

All pages include a cycle selector with the following format:

**Date Format**: `d M Y` (e.g., `25 Jul 2024 → 24 Aug 2024`)

**API Request Parameter**: `cycle_start` (YYYY-MM-DD format)

**Cycle Definition**: Cash cycles run from the 25th of one month to the 24th of the next month.

---

## Error Handling

### Invalid Cycle Date

Returns HTTP 400 with message: `Invalid cycle start date.`

### Invalid Cycle Start Day

Returns HTTP 400 with message: `Cash cycle must start on the 25th.`

### API Unavailability

When external API calls fail:
- Returns HTTP status from API error
- Message: `Unable to retrieve [District/National/Provincial] Cash Health data.`

---

## Notes

- All monetary values are in local currency (K)
- Scores are calculated on a 0-100 scale
- Overall score is a composite of disbursement, collection quality, and residual cash scores
- Higher residual cash scores indicate better cash coverage
- The `status` field in scores determines the health indicator color