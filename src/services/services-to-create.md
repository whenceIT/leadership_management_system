# Services to Create

## Service 1: KPI Calculator

**Endpoint**: `/api/kpi/calculate`

**Method**: POST

**Payload**:
```
{
  user_id: number
}
```

**Calculation Logic**:
- **KPI Score**: 75
- **Target Achievement**: 70%
- **Compliance Score**: 85
- **Performance Trend**: Up
- **Areas for Improvement**: Sales Techniques, Customer Service

**Return Type**: `KPICalculatorResult`

---

## Service 2: Collection Waterflow Compliance Calculator

**Endpoint**: `/api/collections/compliance`

**Method**: POST

**Payload**:
```
{
  office_id: number,
  start_date: string,
  end_date: string
}
```

**Calculation Logic**:
- **Branch Performance**: Lusaka: 95%, Copperbelt: 85%, Western: 80%, Central: 75%, Eastern: 70%
- **Compliance Score**: 83
- **Compliance Status**: High Risk
- **Trend**: Declining
- **Improvement Suggestions**: Increase training, Improve communication

**Return Type**: `CollectionWaterflowComplianceResult`

---

## Service 3: Staff Productivity Metrics Calculator

**Endpoint**: `/api/staff/productivity`

**Method**: POST

**Payload**:
```
{
  office_id: number,
  start_date: string,
  end_date: string
}
```

**Calculation Logic**:
- **Productivity Score**: 78
- **Performance Trend**: Up
- **High Performers**: 15
- **Low Performers**: 5
- **Average Performance Score**: 80
- **Recommendations**: Provide feedback, Adjust goals, Offer training

**Return Type**: `StaffProductivityMetricsResult`

---

## Service 4: Month-1 Default Rate Calculator

**Endpoint**: `/api/loans/month1-default`

**Method**: POST

**Payload**:
```
{
  office_id: number,
  start_date: string,
  end_date: string
}
```

**Calculation Logic**:
- **Month-1 Default Rate**: 2.5%
- **Trend**: Declining
- **Risk Level**: Low
- **Improvement Suggestions**: Improve risk assessment, Increase collateral requirements, Adjust loan terms

**Return Type**: `Month1DefaultRateResult`

---

## Service 5: Cross-Branch Default Reduction Calculator

**Endpoint**: `/api/loans/cross-branch-default-reduction`

**Method**: POST

**Payload**:
```
{
  province_id: number,
  start_date: string,
  end_date: string
}
```

**Calculation Logic**:
- **Province Default Rate**: 3.0%
- **Branch Performance**: ZIMCO HOUSE LUSAKA: 2.0%, WHENCE KITWE BRANCH: 2.5%, SOLWEZI HQ BRANCH: 3.5%, KAFUE TOWN BRANCH: 4.0%, KABWE TOWN BRANCH: 3.5%, NDOLA CITY BRANCH: 2.0%, CHINGOLA TOWN BRANCH: 2.5%, MUZOROFA BRANCH: 3.0%, LIVINGSTONE TOWN BRANCH: 3.5%, KASAMA TOWN BRANCH: 4.0%, MBALA TOWN BRANCH: 3.5%, MONGU TOWN BRANCH: 4.0%, SENANGA TOWN BRANCH: 3.5%, LUSAKA WEST BRANCH: 2.5%, CHILILABOMBA TOWN BRANCH: 3.0%, CHIPATA TOWN BRANCH: 3.5%, PETAUKE TOWN BRANCH: 4.0%, KITWE SOUTH BRANCH: 2.5%, LUSAKA CITY BRANCH: 2.0%, CHONGWE TOWN BRANCH: 3.0%
- **Reduction Rate**: 15%
- **Trend**: Declining
- **Risk Level**: Low

**Return Type**: `CrossBranchDefaultReductionResult`

---

## Service 6: Talent Pipeline Strength Calculator

**Endpoint**: `/api/staff/talent-pipeline`

**Method**: POST

**Payload**:
```
{
  office_id: number,
  start_date: string,
  end_date: string
}
```

**Calculation Logic**:
- **Pipeline Strength Score**: 78
- **Pipeline Health**: Strong
- **Total Staff**: 100
- **High Performers**: 30
- **Average Performers**: 50
- **Low Performers**: 20
- **Average KPI Score**: 75
- **New Hires**: 10
- **Departures**: 5
- **Retention Rate**: 95%
- **Average Tenure Months**: 24
- **Tier Distribution**: Base: 40%, K50K+: 30%, K80K+: 20%, K120K+: 10%
- **Development Needs**: Sales Techniques: High, Customer Service: Medium, Product Knowledge: Low
- **Succession Readiness**: Branch Manager: 2 ready now, 5 ready in 1-2 years, 8 ready in 3-5 years; Loan Consultant: 5 ready now, 10 ready in 1-2 years, 15 ready in 3-5 years

**Return Type**: `TalentPipelineStrengthResult`

---

## Service 7: Loan Calculator

**Endpoint**: `/api/loans/calculate`

**Method**: POST

**Payload**:
```
{
  loan_amount: number,
  interest_rate: number,
  loan_term: number,
  monthly_income: number,
  monthly_expenses: number
}
```

**Calculation Logic**:
- **Monthly Payment**: Calculated using amortization formula
- **Total Payment**: Monthly payment * loan term
- **Total Interest**: Total payment - loan amount
- **Amortization Schedule**: Monthly breakdown of principal and interest
- **Eligibility**: Based on 40% of disposable income rule
- **Affordability Score**: Calculated using debt-to-income ratio, loan-to-income ratio, and disposable income
- **Risk Assessment**: Risk score and level based on various factors

**Return Type**: `LoanCalculatorResult`

---

## Service 8: Loan Consultant Metrics

**Endpoint**: `/my-performance-new`

**Method**: GET

**Query Parameters**:
```
user_id: number,
start_date: string,
end_date: string
```

**Return Data**:
```
{
  "user_id": 1907,
  "name": "Syria Mungalu",
  "office": "KAMBENDEKELA HOUSE LUSAKA",
  "total_uncollected": "39735.60",
  "total_collected": "49784.00",
  "still_uncollected": "-10048.40",
  "given_out": "39384.00",
  "carry_over": 0
}
```

**Return Type**: `LoanConsultantMetrics`
