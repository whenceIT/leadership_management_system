SLMS Context-Aware Manager Guidance — Complete Frontend Implementation Tasks
1. Create the Manager Guidance Engine
Build a centralized Manager Guidance / Recommendation Engine in Next.js/TypeScript.
Process guidance entirely on the frontend using the KPI and organizational data already available.
Do not build this as a generic notification or pending-task system.
The primary purpose is to identify KPI performance weaknesses and recommend management focus areas.
2. Connect to Existing SLMS KPI Data
Reuse the existing KPI calculations and data structures.
Do not duplicate existing KPI calculation logic.
Evaluate each KPI using:
Current performance
Target
Institutional benchmark/average
Variance
Historical/trend data
Performance direction.
3. Create Centralized KPI Guidance Rules
Create a centralized configuration/service for guidance rules.
Define for each KPI:
KPI name/code
Target
Warning threshold
Critical threshold
Higher/lower-is-better direction
Severity rules
Recommended management action
Applicable management roles
Relevant dashboard/module route.
Keep KPI guidance rules separate from UI components.
4. Implement KPI Weakness Detection
Automatically identify KPIs that require management attention.
Compare current KPI performance against the configured target.
Compare performance against the institutional benchmark.
Calculate the variance.
Determine whether the KPI is:
Healthy
Needs Attention
High Risk
Critical.
5. Implement Organizational Performance Hierarchy

The guidance engine must analyze performance through:

Institution
    ↓
Province
    ↓
District
    ↓
Office
    ↓
Loan Consultant
Support KPI analysis at each level.
Determine where the performance weakness originates.
Identify the level that is most responsible for the KPI gap.
6. Implement Intelligent Performance Drill-Down
When a KPI is weak at a higher level, drill down to identify the source.
Example:
Institution KPI is weak
        ↓
Find weakest Province
        ↓
Find weakest District
        ↓
Find weakest Office
        ↓
Find affected Consultants
Do not automatically drill all the way to consultants.
Stop drilling when the weakness is sufficiently explained.
Avoid unnecessary detailed recommendations.
7. Implement Manager Context
Detect the logged-in manager's:
Role
Province
District
Office.
Determine the manager's performance scope.
Only generate guidance relevant to the manager's organizational scope.
8. Support Manager-Level Context
Branch Manager
Focus on:
Own office
Own consultants
Office KPI performance.
District Manager
Focus on:
Own district
Offices within the district
Consultant performance where necessary.
Provincial Manager
Focus on:
Own province
Districts
Offices
Consultant performance where necessary.
Institutional/Executive Manager
Focus on:
Institution
Provinces
Districts
Offices
Consultants where necessary.
9. Implement "What Needs My Attention?"

Every recommendation must clearly identify:

KPI requiring attention.
Current KPI performance.
Target.
Benchmark.
Variance.
Affected level.
Province.
District.
Office.
Consultant(s), only where relevant.

Example:

Recovery Performance Requires Attention
Copperbelt → District C → Office C
Current: 34% | Target: 90%

10. Implement "Why Does It Need Attention?"

Automatically generate a plain-language explanation using the actual KPI data.

Example:

Recovery performance is currently 34%, which is 56 percentage points below the 90% target and significantly below the institutional average of 63%.

The explanation must be dynamically generated rather than hard-coded.

11. Implement "What Should I Do?"

For every KPI weakness, provide a recommended management action.

Example:

Recommended Action:
Review recovery performance in the affected office and identify the main contributors to the performance gap.

Recommendations should focus on:

Performance improvement
Management intervention
Investigation
Monitoring
Corrective action.

Do not turn the system into a list of individual pending workflow tasks such as pending collateral approvals.

12. Implement Recommendation Priority

Create a priority calculation based on:

Gap from target.
Gap from benchmark.
KPI severity.
Trend deterioration.
Organizational impact.
Number/percentage of affected lower-level entities.

Support:

Critical
High
Medium
Low
13. Implement Trend Awareness

Analyze KPI movement over time.

Identify:

Improving
Stable
Declining
Rapidly Declining.

Example:

Current: 68%
Previous: 74%
Previous Period: 81%

The engine should recognize the declining trend and increase the recommendation priority where appropriate.

14. Implement Recommendation Ranking
Rank all detected KPI weaknesses.
Identify the most important management issues.
Prioritize recommendations based on severity and impact.
Do not simply sort by KPI percentage.
A smaller gap with significant organizational impact may be more important than a larger gap affecting a very small area.
15. Prevent Recommendation Overload
Show only the Top 3–5 priority recommendations initially.
Group similar recommendations.
Remove duplicate recommendations.
Provide View All Guidance for additional issues.
16. Create the Manager Guidance Data Layer

Create a reusable TypeScript service/hook, for example:

src/services/managerGuidanceService.ts
src/hooks/useManagerGuidance.ts
src/types/managerGuidance.ts
src/config/kpiGuidanceRules.ts

Centralize:

KPI analysis.
Weakness detection.
Organizational drill-down.
Priority calculation.
Recommendation generation.
Recommendation state.

Do not place complex guidance logic directly inside React components.

17. Define Recommendation Data Structure

Each recommendation should contain information similar to:

id
kpi
kpiCode
severity
level
province
district
office
consultants
currentValue
target
benchmark
variance
trend
whatNeedsAttention
whyAttentionIsNeeded
recommendedAction
route
createdAt
status
18. Create the Manager Guidance Bottom-Left Sheet
Do not place Manager Guidance as a permanent dashboard section.
Implement it as a bottom-left slide-up sheet/modal.
It should function as a persistent management assistant.
19. Create the Collapsed Guidance Trigger

When the sheet is minimized/closed:

┌──────────────────┐
│ 💡 Guidance  3   │
└──────────────────┘
Position at the bottom-left.
Display the number of active recommendations.
Clearly indicate when a Critical/High priority recommendation exists.
Clicking the trigger opens the guidance sheet.
20. Implement Bottom Sheet Behaviour
Slide the guidance panel upward when opened.
Slide it down when closed.
Use smooth animation.
Keep it unobtrusive.
Do not block the main dashboard unnecessarily.
Support:
Open
Minimize
Close
Reopen.
21. Automatically Open for Critical Issues
Automatically open the guidance sheet when a new Critical or High priority KPI weakness is detected.
Do not repeatedly auto-open for the same unresolved recommendation.
Update the indicator when new recommendations are generated.
22. Design the Guidance Sheet Content

Each recommendation should display:

Manager Guidance

3 areas require your attention

🔴 Recovery Performance

Copperbelt → District C → Office C

Current: 34%
Target: 90%

Why?
Performance is significantly below target.

Recommended Action
Review recovery performance and identify
the main contributors to the gap.

[Review Performance →]
23. Add "Why Am I Seeing This?"
Add an expandable section to each recommendation.
Show the KPI information behind the recommendation.
Display:
Current value
Target
Benchmark
Variance
Trend
Organizational level
Contributing area.
24. Add Deep Linking

Each recommendation should have a relevant destination.

Examples:

Cash Position
→ Cash Management

Recovery Performance
→ Recoveries

Staff Adequacy
→ Staffing

Productivity Achievement
→ Productivity

Portfolio Load Balance
→ Portfolio

Other KPI
→ Relevant KPI Dashboard
Navigate directly to the relevant screen.
Preserve Province/District/Office filters where possible.
25. Implement Recommendation State

Manage recommendation states on the frontend:

Generated
Viewed
Action Started
Resolved
Dismissed
Snoozed
Store state using appropriate frontend state/local persistence where required.
Do not allow dismissed recommendations to immediately reappear unless the underlying KPI condition changes or a new recommendation is generated.
26. Implement Automatic Recommendation Resolution
Recalculate guidance when KPI data changes.
If the KPI weakness disappears, mark the recommendation as resolved.
Remove resolved recommendations from active guidance.
Automatically surface newly detected weaknesses.
27. Implement Frontend Performance Optimization
Avoid recalculating guidance on every React render.
Use appropriate memoization.
Reuse existing KPI and organizational datasets.
Cache guidance calculations/results where appropriate.
Prevent unnecessary API/data requests caused by the guidance component.
Ensure the guidance engine does not slow down the main dashboard.
28. Integrate With Existing SLMS Dashboard
Identify the existing dashboard layout and authenticated user context.
Integrate the guidance engine without disrupting existing KPI components.
Reuse existing:
KPI services
KPI hooks
Province averages
District averages
Office statistics
Consultant statistics
User context/RBAC data.
29. Add Empty/Healthy State

If no KPI requires attention:

🟢 All Good

No significant KPI performance issues currently require your attention.

The guidance trigger should still remain available for the manager to open and review.

30. Add Loading State

While KPI data is being analyzed:

Analyzing your performance...

Use a lightweight loading state rather than showing incomplete recommendations.

31. Add Error Handling

If required KPI data cannot be loaded:

Manager Guidance temporarily unavailable

Do not show misleading recommendations based on incomplete data.

33. Final Manager Experience

The completed system should work like this:

(userLevel) Manager Logs In
       ↓
Load Existing KPI Data
       ↓
Identify Manager Context and position
       ↓
Analyze Relevant KPIs
       ↓
Detect KPI Weaknesses
       ↓
Identify Where Weakness Exists
       ↓
Province (Province Manager Dashboard and province level drill)
   ↓
District (District Manager Dashboard and District level drill)
   ↓
Office  (Branch Manager Dashboard and Branch level drill)
   ↓
Consultant (Branch Manager Dashboard and Consultant level drill)
       ↓
Determine Severity & Impact
       ↓
Rank Priority
       ↓
Generate Guidance
       ↓
Bottom-Left Guidance Sheet
       ↓
┌──────────────────────────────────────┐
│ WHAT NEEDS MY ATTENTION?              │
│ Recovery Performance                  │
│ Office C                              │
│                                      │
│ WHY?                                  │
│ 34% vs 90% target                     │
│                                      │
│ WHAT SHOULD I DO?                    │
│ Review recovery performance and      │
│ identify the main contributors.      │
│                                      │
│ [Review Performance →]               │
└──────────────────────────────────────┘
Core Implementation Principle

The SLMS Context-Aware Manager Guidance should function as a KPI-driven management assistant:

KPI Weakness → Where is the weakness? → Why is it important? → What management action should be taken? → Direct manager to the relevant performance area.

It should not become a generic notification centre or a list of pending workflow activities.