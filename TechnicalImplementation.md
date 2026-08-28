Manager Guidance / Task Recommendation system should be KPI-driven and performance-focused, rather than becoming a general workflow/task notification system.

The system should identify where performance is weak, determine the organizational level affected, explain why it matters, and recommend what management should focus on.

Proposed SLMS Guidance Model

The guidance engine should evaluate performance across:

KPI → Province → District → Office → Loan Consultant

Then produce:

What needs my attention?
Why does it need attention?
What should I do about it?

Example

Suppose the KPI is Loan Portfolio Recovery Index (LPRI).

The system finds:

Institutional average: 62%
Target: 90%
Province A: 71%
District B: 58%
Office C: 43%
Consultant X: 31%

The Manager Guidance should not say:

"You have pending recovery tasks."

Instead:

🔴 Recovery Performance Requires Attention

What needs my attention?
Loan Portfolio Recovery Index (LPRI)

Where?
Office C — District B — Province A

Why does it need attention?
The office is performing at 43%, which is 47 percentage points below the 90% target and is significantly below the institutional average.

What should I do?
Review recovery performance at Office C, identify the lowest-performing Loan Consultants, and focus management intervention on the affected portfolio.

→ Review LPRI Performance

The Guidance Hierarchy

I recommend structuring the engine around this hierarchy:

                 KPI
                  │
        ┌─────────┴─────────┐
        │                   │
   Performance          Target/Benchmark
        │
        ▼
     Province
        │
        ▼
     District
        │
        ▼
      Office
        │
        ▼
 Loan Consultant

The engine should drill down only as far as necessary to explain the weakness.

For example:

Case 1 — Province problem

If an entire province is underperforming:

🔴 KPI Performance Requires Attention

KPI: Staff Adequacy Score
Level: Province
Province: Southern Province

Why: Southern Province is performing at 61%, compared with the 90% target.

Recommended Action: Review staffing adequacy across the province and identify districts contributing most to the gap.

No need to mention individual offices unless they are relevant.

Case 2 — District problem

If the province is healthy but one district is weak:

🟠 District Performance Requires Attention

KPI: Portfolio Load Balance
District: Lusaka East

Why: The district is performing at 54%, significantly below the institutional benchmark.

Recommended Action: Review workload distribution across offices and identify offices contributing to the performance gap.

Case 3 — Office problem

If the district is performing reasonably but one office is dragging it down:

🔴 Office Performance Requires Attention

KPI: Recovery Performance
Office: Chelstone Branch

Why: The office is performing at 42%, compared with the district average of 68%.

Recommended Action: Review the office's recovery performance and identify the main contributors to the shortfall.

Case 4 — Consultant problem

If the office is generally performing well but specific consultants are weak:

🟠 Consultant Performance Requires Attention

KPI: Productivity Achievement
Office: Chelstone Branch
Consultants: 3 consultants below target

Why: Overall office performance is healthy, but three consultants are significantly below the expected productivity level.

Recommended Action: Review individual consultant performance and workload distribution.

This is the Important Logic

The engine should not simply find every KPI below target.

It should determine:

1. Which KPI?

For example:

Cash Position Score
Above-Threshold Risk
Below-Threshold Risk
Approved Exception Ratio
Revenue & Performance
Staff Adequacy
Productivity Achievement
Vacancy Impact
Portfolio Load Balance
Recovery Performance
etc.
2. How serious is the weakness?

For example:

Target:              90%
Institutional Avg:   63%
Province:             71%
District:             58%
Office:               42%
Consultant:           35%

The system determines the largest meaningful performance gap.

3. Where is the problem?
Institution
   ↓
Province
   ↓
District
   ↓
Office
   ↓
Consultant
4. What is causing the institutional weakness?

This is where the guidance engine becomes valuable.

For example:

Institutional LPRI = 63%

The engine investigates:

Institution
      ↓
Provinces
      ↓
Districts
      ↓
Offices
      ↓
Consultants

It may discover:

Southern Province = 78%
Lusaka Province = 74%
Central Province = 69%
Eastern Province = 61%
Copperbelt Province = 43%

Therefore:

Primary area requiring management attention: Copperbelt Province

Then it drills down:

Copperbelt
      ↓
District A = 71%
District B = 64%
District C = 39%

So:

Primary area: District C

Then:

District C
      ↓
Office A = 71%
Office B = 68%
Office C = 34%
Office D = 31%

Then:

Primary area: Office C and Office D

And finally:

Office C
      ↓
Consultant 1 = 71%
Consultant 2 = 66%
Consultant 3 = 29%
Consultant 4 = 25%

Now the system can say:

The institutional weakness is primarily being driven by low LPRI performance in Copperbelt Province, particularly District C and Offices C/D, with several consultants significantly below target.

That is much more useful than a generic KPI alert.

Recommended Guidance Output

I would standardize every recommendation around this structure:

🔴 What needs my attention?

KPI: Loan Portfolio Recovery Index
Area: Copperbelt Province → District C → Office C

Why does it need attention?

Performance is 34%, compared with:

Target: 90%
Institutional Average: 63%
District Average: 51%

This represents a significant performance gap.

What should I do?

Prioritize recovery performance in Office C, review the underlying consultant performance, and implement corrective management action.

[Review KPI Performance →]

Manager-Specific Guidance

This is also where your existing RBAC becomes very important.

A Branch Manager shouldn't see:

"Copperbelt Province is underperforming."

They should see:

Your Office — Recovery Performance: 42%

A District Manager should see:

District C — Recovery Performance: 51%
Office C is the largest contributor to the district's weakness.

A Provincial Manager should see:

Copperbelt Province — Recovery Performance: 43%
District C is the primary contributor.

And the Executive/Chairperson should see:

Recovery Performance is below target institutionally.
Copperbelt Province is the largest contributor to the institutional gap.

So the same underlying KPI, but different guidance depending on the user's management scope.

In short

I would define the SLMS mechanism as:

KPI → Detect Weakness → Identify Level → Identify Source → Explain Gap → Recommend Management Action

Not:

KPI → Create Task → Notify User

The system should behave like an intelligent management advisor, answering three questions every time:

WHAT?
Which KPI requires attention?

WHERE?
Which Province → District → Office → Consultant is driving the weakness?

WHY?
How far below target/benchmark are they, and how does that affect the higher-level performance?

WHAT NEXT?
What management intervention should be prioritized?

That approach would make the guidance engine directly connected to your existing SLMS KPI framework and institutional → province → district → office → consultant performance hierarchy, rather than turning it into another notifications or pending-work system.