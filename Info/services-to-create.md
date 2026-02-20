# Next.js Services Prompt Requirements

## Overview

Create Services that perform the following calculations based on the existing database schema and API patterns

---

## Database Connection Context

The existing backend uses a MySQL connection pool. The Next.js services should:

1. Use a similar MySQL connection pattern (mysql2/promise with connection pool)
2. Follow the same query patterns using parameterized queries
3. Handle errors consistently with try-catch blocks
4. Return JSON responses with `success` boolean and `data`/`error` fields

### Database Tables Available

Key tables for calculations:

| Table | Purpose |
|-------|---------|
| `loans` | Loan records with status, principal, interest, dates, officer_id |
| `loan_transactions` | Repayment transactions with principal, interest, fees, penalties |
| `loan_repayment_schedules` | Installment schedules with due dates and payment status |
| `users` | Staff/user information with office_id, job_position |
| `offices` | Branch information with province_id |
| `clients` | Client records with status, office_id |
| `smart_kpis` | KPI definitions with role, target, scoring, weight |
| `smart_kpi_score` | KPI scores for users |
| `user_tiers` | User tier assignments with portfolio values |
| `tier_definitions` | Tier definitions with minimum portfolio values |
| `target_tracker` | Target tracking with given_out, brought_f, target |
| `cycle_dates` | Loan officer cycle dates |

---

## Service 1: KPI Calculator

### Purpose
Calculate and aggregate KPI scores for staff members based on defined KPIs and their actual performance.

### Required Calculations

```typescript
interface KPICalculationResult {
  user_id: number;
  position_id: number;
  total_score: number;
  max_possible_score: number;
  percentage_score: number;
  weighted_score: number;
  kpi_breakdown: {
    kpi_id: number;
    kpi_name: string;
    category: string;
    target: number;
    actual: number;
    score: number;
    weight: number;
    weighted_contribution: number;
  }[];
  calculated_at: Date;
}
```

### Data Sources

1. **smart_kpis** - Get KPI definitions by role/position
2. **smart_kpi_score** - Get actual scores for each KPI
3. **users** - Get user position information

### Calculation Logic

```
For each KPI:
  1. Get target value from smart_kpis.target
  2. Get actual score from smart_kpi_score.score
  3. Calculate percentage: (actual / target) * 100
  4. Apply scoring type:
     - 'percentage': Use percentage directly
     - 'numeric': Compare actual vs target
     - 'yes_no': 100 if yes, 0 if no
     - 'score_1_5': Map to percentage (score * 20)
  5. Apply weight: score * (weight / 100)

Total Weighted Score = Sum of all weighted contributions
```

### API Endpoint

```
GET https://smartbackend.whencefinancesystem.com/kpi-calculator/:user_id
Query Parameters:
  - position_id: Filter KPIs by position
  - category: Filter by KPI category
  - date_from: Start date for score period
  - date_to: End date for score period
```

---

## Service 2: Collection Waterflow Compliance Calculator

### Purpose
Calculate the collection compliance rate based on expected vs actual collections following the waterflow (cascading) payment allocation method.

### Required Calculations

```typescript
interface CollectionWaterflowResult {
  user_id: number;
  office_id: number;
  period_start: Date;
  period_end: Date;
  total_expected_collection: number;
  total_actual_collection: number;
  compliance_rate: number;
  waterflow_breakdown: {
    penalties_expected: number;
    penalties_collected: number;
    fees_expected: number;
    fees_collected: number;
    interest_expected: number;
    interest_collected: number;
    principal_expected: number;
    principal_collected: number;
  };
  loans_analyzed: number;
  fully_compliant_loans: number;
  partially_compliant_loans: number;
  non_compliant_loans: number;
}
```

### Data Sources

1. **loan_repayment_schedules** - Expected payments (principal, interest, fees, penalty)
2. **loan_transactions** - Actual collections with allocation breakdown
3. **loans** - Loan status and officer assignment

### Calculation Logic

```
Waterflow Payment Order (per loan_transaction_strategy):
  Default: 'penalty_fees_interest_principal'
  1. Penalties first
  2. Fees second
  3. Interest third
  4. Principal last

For each loan in period:
  1. Get all repayment schedules due in period
  2. Sum expected: principal + interest + fees + penalty
  3. Get all transactions in period
  4. Sum collected: principal_derived + interest_derived + fees_derived + penalty_derived
  5. Calculate compliance per category

Overall Compliance = (Total Collected / Total Expected) * 100
```

### API Endpoint

```
GET https://smartbackend.whencefinancesystem.com/collection-waterflow-compliance
Query Parameters:
  - user_id: Loan officer ID
  - office_id: Branch filter
  - start_date: Period start
  - end_date: Period end
  - loan_product_id: Filter by product
```

---

## Service 3: Staff Productivity Metrics Calculator

### Purpose
Calculate comprehensive productivity metrics for staff members including loan processing efficiency, client management, and portfolio performance.

### Required Calculations

```typescript
interface StaffProductivityMetrics {
  user_id: number;
  user_name: string;
  office_id: number;
  office_name: string;
  period: {
    start: Date;
    end: Date;
  };
  loan_metrics: {
    total_loans_processed: number;
    loans_disbursed: number;
    loans_pending: number;
    loans_declined: number;
    average_processing_time_days: number;
    disbursement_amount_total: number;
    average_loan_size: number;
  };
  collection_metrics: {
    total_collections: number;
    collection_rate: number;
    arrears_cases: number;
    arrears_amount: number;
    recovery_rate: number;
  };
  client_metrics: {
    total_clients_assigned: number;
    active_clients: number;
    new_clients_period: number;
    client_retention_rate: number;
  };
  productivity_score: number;
  productivity_grade: string;
}
```

### Data Sources

1. **loans** - Loan processing metrics
2. **loan_transactions** - Collection data
3. **clients** - Client assignments and status
4. **users** - Staff information
5. **target_tracker** - Target vs actual performance

### Calculation Logic

```
Loan Processing Efficiency:
  - Processing Time = AVG(disbursed_date - created_date) for disbursed loans
  - Approval Rate = (disbursed + approved) / total_loans * 100

Collection Performance:
  - Collection Rate = total_collected / total_expected * 100
  - Recovery Rate = recovered_amount / written_off_amount * 100

Client Management:
  - Retention Rate = (active_clients - new_clients) / starting_clients * 100

Productivity Score (weighted):
  - Loan Processing: 30%
  - Collection Performance: 40%
  - Client Management: 30%

Grade Assignment:
  - 90-100%: A (Excellent)
  - 80-89%: B (Good)
  - 70-79%: C (Satisfactory)
  - 60-69%: D (Needs Improvement)
  - Below 60%: F (Unsatisfactory)
```

### API Endpoint

```
GET https://smartbackend.whencefinancesystem.com/staff-productivity/:user_id
Query Parameters:
  - start_date: Period start
  - end_date: Period end
  - office_id: Compare with branch average
```

---

## Service 4: Month-1 Default Rate Calculator

### Purpose
Calculate the first-month default rate for loans, identifying loans that default within the first 30 days after disbursement.

### Required Calculations

```typescript
interface Month1DefaultRateResult {
  office_id: number;
  period: {
    month: number;
    year: number;
  };
  total_loans_disbursed: number;
  total_disbursement_amount: number;
  month_1_defaults: number;
  default_amount: number;
  default_rate: number;
  default_rate_percentage: string;
  comparison: {
    previous_month_rate: number;
    same_month_last_year: number;
    branch_average: number;
  };
  risk_assessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
  };
  default_breakdown: {
    by_loan_product: {
      product_id: number;
      product_name: string;
      defaults: number;
      default_rate: number;
    }[];
    by_loan_officer: {
      user_id: number;
      officer_name: string;
      defaults: number;
      default_rate: number;
    }[];
  };
}
```

### Data Sources

1. **loans** - Disbursed loans with dates and status
2. **loan_repayment_schedules** - First installment status
3. **loan_transactions** - First month payment records
4. **loan_products** - Product categorization

### Calculation Logic

```
Definition of Month-1 Default:
  A loan is considered Month-1 Default if:
  - First installment due date has passed
  - No payment received within 30 days of first due date
  - OR loan status = 'written_off' within 30 days of disbursement

Calculation:
  1. Get all loans disbursed in the specified month
  2. For each loan:
     a. Get first repayment schedule (installment = 1)
     b. Check if first installment was paid
     c. Check payment date vs due date
  3. Count loans where first payment missed > 30 days

Default Rate = (Month-1 Defaults / Total Disbursed) * 100

Risk Level Thresholds:
  - Low: < 2%
  - Medium: 2-5%
  - High: 5-10%
  - Critical: > 10%
```

### API Endpoint

```
GET https://smartbackend.whencefinancesystem.com/month-1-default-rate
Query Parameters:
  - office_id: Branch filter (required)
  - month: Month number (1-12)
  - year: Year
  - loan_product_id: Filter by product
  - loan_officer_id: Filter by officer
```

---

## Service 5: Cross-Branch Default Reduction Calculator

### Purpose
Calculate and compare default reduction performance across branches, identifying best practices and areas needing improvement.

### Required Calculations

```typescript
interface CrossBranchDefaultReductionResult {
  period: {
    start_date: Date;
    end_date: Date;
  };
  branches: {
    office_id: number;
    office_name: string;
    province: string;
    metrics: {
      starting_npl_count: number;
      starting_npl_amount: number;
      current_npl_count: number;
      current_npl_amount: number;
      recovered_count: number;
      recovered_amount: number;
      reduction_rate: number;
      new_defaults_count: number;
      new_defaults_amount: number;
    };
    ranking: {
      overall: number;
      by_reduction: number;
      by_recovery: number;
    };
    trend: 'improving' | 'stable' | 'declining';
  }[];
  summary: {
    total_npl_reduction: number;
    average_reduction_rate: number;
    best_performing_branch: string;
    needs_attention: string[];
  };
  recommendations: {
    branch_id: number;
    branch_name: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}
```

### Data Sources

1. **loans** - NPL status tracking (status = 'written_off', 'defaulted')
2. **loan_transactions** - Recovery transactions
3. **offices** - Branch information
4. **province** - Regional grouping

### Calculation Logic

```
NPL (Non-Performing Loan) Definition:
  - Loans with status 'written_off'
  - OR loans with arrears > 90 days
  - OR loans flagged as 'defaulted' in the `defaulted` field

Period Analysis:
  1. Get NPL count/amount at period start
  2. Get NPL count/amount at period end
  3. Calculate recoveries (transactions with type 'write_off_recovery')
  4. Calculate new defaults in period

Reduction Rate = (Recovered Amount / Starting NPL Amount) * 100

Trend Analysis:
  - Compare last 3 months reduction rates
  - Improving: Each month better than previous
  - Stable: Variation < 5%
  - Declining: Each month worse than previous

Ranking:
  - Sort by reduction_rate descending
  - Secondary sort by recovered_amount
```

### API Endpoint

```
GET https://smartbackend.whencefinancesystem.com/cross-branch-default-reduction
Query Parameters:
  - start_date: Period start
  - end_date: Period end
  - province_id: Filter by province
  - include_ranking: boolean (default: true)
```

---

## Service 6: Talent Pipeline Strength Calculator

### Purpose
Calculate the strength of the talent pipeline based on staff performance, tier progression, and development metrics.

### Required Calculations

```typescript
interface TalentPipelineStrengthResult {
  office_id: number | null; // null for organization-wide
  period: {
    start_date: Date;
    end_date: Date;
  };
  pipeline_metrics: {
    total_staff: number;
    by_tier: {
      tier_id: number;
      tier_name: string;
      count: number;
      percentage: number;
    }[];
    tier_progression: {
      user_id: number;
      user_name: string;
      previous_tier: string;
      current_tier: string;
      progression_date: Date;
      time_to_progress: number; // days
    }[];
  };
  performance_metrics: {
    high_performers: number; // KPI score > 80%
    average_performers: number; // KPI score 50-80%
    low_performers: number; // KPI score < 50%
    average_kpi_score: number;
  };
  retention_metrics: {
    new_hires: number;
    departures: number;
    retention_rate: number;
    average_tenure_months: number;
  };
  pipeline_strength_score: number;
  pipeline_health: 'strong' | 'moderate' | 'weak';
  development_needs: {
    area: string;
    staff_count: number;
    priority: 'high' | 'medium' | 'low';
  }[];
  succession_readiness: {
    position: string;
    ready_now: number;
    ready_1_2_years: number;
    ready_3_5_years: number;
  }[];
}
```

### Data Sources

1. **users** - Staff information with hire dates
2. **user_tiers** - Tier assignments and progression
3. **tier_definitions** - Tier hierarchy
4. **smart_kpi_score** - Performance scores
5. **smart_kpis** - KPI definitions
6. **job_positions** - Position hierarchy
7. **employees** - Employee details

### Calculation Logic

```
Tier Distribution:
  - Count staff by current tier
  - Calculate percentage distribution

Tier Progression Analysis:
  - Get historical tier changes from user_tiers
  - Calculate time between tier promotions
  - Identify fast-trackers (progression < average time)

Performance Classification:
  - Calculate weighted KPI score per user
  - Classify: High (>80%), Average (50-80%), Low (<50%)

Retention Calculation:
  - Retention Rate = (Staff at end - New hires) / Staff at start * 100
  - Average Tenure = AVG(current_date - date_of_joining) in months

Pipeline Strength Score (0-100):
  - Tier Distribution Balance: 20%
  - Performance Distribution: 30%
  - Retention Rate: 25%
  - Progression Rate: 25%

Health Classification:
  - Strong: Score >= 75
  - Moderate: Score 50-74
  - Weak: Score < 50

Succession Readiness:
  - Ready Now: High performers in same position tier
  - Ready 1-2 Years: Average performers showing improvement
  - Ready 3-5 Years: New hires or low performers with potential
```



### 3. Error Handling Pattern

```typescript
try {
  // Database operations
  const [result] = await pool.query('SELECT ...');
  
  return NextResponse.json({
    success: true,
    data: result
  });
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json({
    success: false,
    message: 'Error description',
    error: error instanceof Error ? error.message : 'Unknown error'
  }, { status: 500 });
}
```

### 4. Response Format

All endpoints should return:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  metadata?: {
    timestamp: Date;
    query_parameters: Record<string, string | number>;
    record_count?: number;
  };
}
```




