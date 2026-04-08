SMART LEADERSHIP MANAGEMENT SYSTEM FIVE HEADLINE INSTITUTIONAL PARAMETERS PRESENTATION

Composite Index Definitions for SLMS Development
The five (05) parameters are supposed to each be presented in a hierarchical composite index approach. This is where each headline parameter rolls up into a single, consolidated number (likely a score or percentage), and that number can be decomposed to understand what's driving it. This is usually perfect for executive dashboards where there is need for a quick health check, and then drill-down capability.
General Architecture for All Parameters
For each headline parameter, the system will:
1)	Calculate a normalized score (0-100%) for each constituent metric
2)	Apply a strategic weight to each constituent
3)	Sum the weighted scores to produce ONE headline number
4)	Enable decomposition to show each constituent's contribution to the total
Display Format:
HEADLINE PARAMETER: [Name] → 76.4% (↑2.3% from last month)
├─ Constituent A: 82% (Weight: 30%) → Contributing 24.6pp
├─ Constituent B: 71% (Weight: 40%) → Contributing 28.4pp
└─ Constituent C: 65% (Weight: 30%) → Contributing 19.5pp
Please NOTE: pp stands for Percentage Points (pp).
This is a crucial distinction from the percent symbol (%). Here's why it matters:
Percentage vs. Percentage Points
Concept	Definition	Example
% (Percent)	A proportion of a whole	25% of the portfolio is delinquent
pp (Percentage Points)	The arithmetic difference between two percentages	Interest rate increased from 30% to 35% = +5 pp
In Our SLMS Context:
When we say a constituent is "Contributing 24.6pp," it means:
	The maximum possible contribution from that constituent is its weight (e.g., 30pp if weight = 30%)
	The actual contribution is the weighted score (e.g., Constituent Score 82% × Weight 30% = 24.6pp)
	The remaining (30% - 24.6pp = 5.4pp) represents what was lost due to underperformance
Visual Example:
LOAN CONSULTANT PERFORMANCE INDEX: 68.2%
├─ Volume Achievement: 140% (Weight 25%) → Contributing 35.0pp of 25pp max
├─ Portfolio Quality Score: 40% (Weight 35%) → Contributing 14.0pp of 35pp max
├─ Collection Efficiency: 60% (Weight 30%) → Contributing 18.0pp of 30pp max
└─ Vetting Compliance: 95% (Weight 10%) → Contributing 9.5pp of 10pp max
Interpretation:
	Volume Achievement over-performed (gave 35pp where only 25pp was possible) - this shows as 35.0pp
	Portfolio Quality under-performed (only gave 14pp of the possible 35pp)
	The 21pp gap (35pp possible - 14pp actual) is what dragged the overall index down
Why This Matters for Leadership :
When you see "Risk Management Index: 38% (↓↓ CRITICAL)" and then "Month-1 Default Performance: Contributing 20.0pp of 40pp max", you immediately know:
	20pp is what you actually got
	40pp was what was possible if performance was perfect
	20pp shortfall = This constituent is responsible for half the potential value being lost
This allows leadership to instantly prioritize: "Fix Month-1 Default Performance because it's leaving 20pp on the table."
So in short:
	% = Your score
	pp = How much of the final index score that constituent actually contributed
PARAMETER 1: BRANCH STRUCTURE & STAFFING INDEX (BSSI)
The One Number: Branch Health Score (0-100%)
Measures how well a branch is structured and staffed for optimal performance.
Constituent Metric	Formula	Target	Weight	Normalization Logic
Staff Adequacy Score	Current LCs / Optimal LCs (capped at 100%)	100% (10-12 LCs)	25%	If Current ≥ Optimal: 100%
If Current < Optimal: (Current/Optimal)×100
Productivity Achievement	Avg Disbursement per LC / K40,000 target	≥100%	30%	(Actual/Target)×100, capped at 150%
Vacancy Impact	1 - (Vacancies / Authorized Positions)	0 vacancies	20%	100% × (1 - Vacancy Ratio)
Portfolio Load Balance	Optimal Range: K300k-K380k per LC
Score based on deviation from optimal midpoint	Within range	25%	If within range: 100%
If outside: 100% - (deviation%/optimal)×50
Example Display:
BRANCH STRUCTURE & STAFFING INDEX: 76.4% (↓)
├─ Staff Adequacy: 80% (8/10 LCs) → Contributing 20.0pp of 25pp max
├─ Productivity Achievement: 112% (K45k/K40k) → Contributing 33.6pp of 30pp max*
├─ Vacancy Impact: 80% (2 vacancies) → Contributing 16.0pp of 20pp max
└─ Portfolio Load Balance: 27% (K350k vs target) → Contributing 6.8pp of 25pp max

NOTE: Productivity overachievement partially offsets other deficiencies

PARAMETER 2: LOAN CONSULTANT PERFORMANCE INDEX (LCPI)
The One Number: LC Quality Score (0-100%)
Measures the combined effect of LC activity - both volume and quality.
Constituent Metric	Formula	Target	Weight	Normalization Logic
Volume Achievement	Total Disbursement / Branch Target (K420k)	≥100%	25%	(Actual/Target)×100, capped at 150%
Portfolio Quality Score	1 - (Portfolio at Risk >30d / Total Portfolio)	≥92% (≤8% PAR)	35%	(Actual PAR% / Target PAR%) inverted:
If PAR ≤8%: 100%
If PAR >8%: 100% - [(PAR-8%)×5]
Collection Efficiency	Month-1 Collection Rate	≥71.64%	30%	(Actual/71.64%)×100, capped at 100%
Vetting Compliance Rate	% loans with complete documentation	100%	10%	Actual % (if <80%, score = 0)

Example Display:
LOAN CONSULTANT PERFORMANCE INDEX: 68.2% (↓↓)
├─ Volume Achievement: 140% (K588k/K420k) → Contributing 35.0pp of 25pp max*
├─ Portfolio Quality Score: 40% (PAR 20%) → Contributing 14.0pp of 35pp max
├─ Collection Efficiency: 60% (vs 71.64%) → Contributing 25.1pp of 30pp max
└─ Vetting Compliance Rate: 95% → Contributing 9.5pp of 10pp max

NOTE: Volume overachievement cannot compensate for quality failures
PARAMETER 3: LOAN PRODUCTS & INTEREST RATES INDEX (LPIRI)
The One Number: Product Health Score (0-100%)
Measures the quality and profitability of the product mix.
Constituent Metric	Formula	Target	Weight	Normalization Logic
Yield Achievement	Actual Effective Interest Rate / Target (38.2%)	100%	35%	(Actual/38.2%)×100, range 80-120%
Product Diversification	Herfindahl index of concentration (lower = better)	HHI <0.3	25%	If HHI ≤0.3: 100%
If HHI >0.3: 100% - [(HHI-0.3)×200]
Product Risk Score	1 - (Default Rate for Product / Institutional Avg Default Rate)	≤1.0	30%	If product default rate ≤ avg: 100%
If > avg: 100% - [(excess)×100]
Strategic Alignment	% of portfolio in strategic priority products	≥15% in Motor Vehicle	10%	(Actual%/15%)×100, capped at 100%
Example Display:
text
LOAN PRODUCTS & INTEREST RATES INDEX: 82.5% (↑)
├─ Yield Achievement: 100% (38.2%/38.2%) → Contributing 35.0pp of 35pp max
├─ Product Diversification: 70% (HHI 0.45) → Contributing 17.5pp of 25pp max
├─ Product Risk Score: 100% (Defaults below avg) → Contributing 30.0pp of 30pp max
└─ Strategic Alignment: 0% (No Motor Vehicle loans) → Contributing 0.0pp of 10pp max
PLEASE NOTE 
Herfindahl-Hirschman Index (HHI) - Brief Explanation
What It Is:
The Herfindahl index is a measure of market concentration. In simple terms, it tells you how spread-out, diversified or concentrated something is.
Formula: HHI = Sum of (each part's percentage squared)
The Herfindahl-Hirschman Index (HHI) works perfectly for measuring client sector diversification within a branch, district/region, province, institution or just any portfolio without the need for market-wide data. In this case, it’s measuring internal portfolio concentration risk, not market share.
Client Sector Diversification using HHI
What We're Measuring:
How concentrated our loan portfolio is across different client employment sectors. This tells us: "If one sector experiences disruption (e.g., mining layoffs, government salary delays), what percentage of our portfolio is at risk?"
Client Sector Categories (Based on Your Examples):
Sector Code	Description	Examples
GOV	Government	Civil servants, teachers, police
QGV	Quasi-Government	ZESCO, ZRA, NAPSA, WSC
MIN	Mining	North Western or Copperbelt mines, contractors
AGR	Agriculture	Farmers, agri-business
PRI	Private Sector (Formal)	Banks, retailers, manufacturers
INF	Informal Employment	Market traders, informal businesses
OTH	Other	Students, retirees, etc.
How HHI Works in This Context:
Formula: HHI = Sum of (each sector's percentage squared)
Example Scenarios:
Scenario A: Highly Concentrated (Risky)
Portfolio by Sector:
	Government: 70% → 70² = 4,900
	Private Formal: 15% → 15² = 225
	Informal: 10% → 10² = 100
	Quasi-Gov: 5% → 5² = 25

HHI = 4,900 + 225 + 100 + 25 = 5,250
Interpretation: 70% exposure to Government. If government salaries are delayed, 70% of portfolio is at risk. High risk.
Scenario B: Well-Diversified (Healthy)
Portfolio by Sector:
	Government: 25% → 25² = 625
	Private Formal: 25% → 25² = 625
	Informal: 20% → 20² = 400
	Quasi-Gov: 15% → 15² = 225
	Mining: 10% → 10² = 100
	Agriculture: 5% → 5² = 25

HHI = 625+625+400+225+100+25 = 2,000
Interpretation: Well spread across sectors. A shock to one sector affects only 10-25% of portfolio. Low risk.
Revised HHI Scale for Client Sector Diversification:
HHI Range	Risk Level	Interpretation
Below 2,000	Low Risk	Well-diversified across sectors
2,000 - 3,000	Moderate Risk	Some concentration, monitor
3,000 - 4,000	High Risk	Overly concentrated
Above 4,000	Critical Risk	Dangerous single-sector dependency
Integration into Product Health Score:
LOAN PRODUCTS & INTEREST RATES INDEX: 76%
├─ Yield Achievement: 100% → Contributing 35pp of 35pp max
├─ CLIENT SECTOR DIVERSIFICATION: 60% (HHI 3,500) → Contributing 15pp of 25pp max
├─ Product Risk Score: 100% → Contributing 30pp of 30pp max
└─ Strategic Alignment: 0% → Contributing 0pp of 10pp max
Drill-Down View:
CLIENT SECTOR DIVERSIFICATION: 60% (HHI 3,500 - HIGH RISK)
├─ Government: 55% (↑15% from last quarter)
├─ Private Formal: 20%
├─ Informal: 10%
├─ Quasi-Government: 8%
├─ Mining: 5%
└─ Agriculture: 2%

RISK ANALYSIS: Government sector concentration at 55% exceeds recommended 30% max
RECOMMENDATION: Target private sector and informal sector growth to diversify
Strategic Benefits of This Approach:
1)	Early Warning System: If HHI increases over time (becoming more concentrated), leadership is alerted before a sector shock hits
2)	Branch-Level Comparison:
	Branch A (Copperbelt): HHI 4,500 (80% Mining) → CRITICAL
	Branch B (Lusaka): HHI 2,200 (well diversified) → HEALTHY
3)	Strategic Targeting: If strategic goal is to reduce government dependency, track HHI excluding government:
	"Non-Government HHI" measures diversification across private/informal/mining/etc.
4)	Sector-Specific Alerts: "Government sector has grown from 40% to 55% in 3 months - review branch lending practices"
Technical Implementation Note:
The system should calculate:
•	Overall HHI (all sectors)
•	Top-3 Sector Concentration (sum of largest 3 sectors)
•	Sector Drift (month-over-month change in each sector's share)
This gives a complete picture of portfolio diversification risk without needing any external market data but the LMS.

PARAMETER 4: RISK MANAGEMENT & DEFAULTS INDEX (RMDI)
The One Number: Risk Health Score (0-100%)
Measures the effectiveness of risk management and collections. This is the most critical parameter for early warning.
Constituent Metric	Formula	Target	Weight	Normalization Logic
Month-1 Default Performance	28.36% - Actual Default Rate (positive = better)	≤25%	40%	If Actual ≤25%: 100%
If >25%: 100% - [(Actual-25%)×5]
3-Month Recovery Achievement	Actual Recovery Rate / Target (56.05%)	≥100%	30%	(Actual/56.05%)×100, capped at 100%
Roll-Rate Control	Weighted avg of roll-rates vs targets (30→60d, 60→90d, 90+ to Recoveries)	≤ targets	20%	Composite of 3 roll-rates, each normalized to target
Long-Term Delinquency Risk	% of Month-1 defaults going to Recoveries vs target (43.95%)	≤43.95%	10%	If Actual ≤43.95%: 100%
If >43.95%: 100% - [(excess%)×2]

Example Display:
RISK MANAGEMENT & DEFAULTS INDEX: 47.8% (↓↓ CRITICAL)
├─ Month-1 Default Performance: 50% (30% actual) → Contributing 20.0pp of 40pp max
├─ 3-Month Recovery Achievement: 43% (24%/56%) → Contributing 12.9pp of 30pp max
├─ Roll-Rate Control: 30% (all rates above target) → Contributing 6.0pp of 20pp max
└─ LTD Risk: 89% (41%/46% - better than target) → Contributing 8.9pp of 10pp max

ALERT: 60% of index decline from Poor Month-1 and Recovery performance
Drill-down: Branch X contributing 40% of default spike

PARAMETER 5: REVENUE & PERFORMANCE METRICS INDEX (RPMI)
The One Number: Financial Health Score (0-100%)
Measures the branch's contribution to institutional profitability and growth.
Constituent Metric	Formula	Target	Weight	Normalization Logic
Revenue Achievement	Actual Revenue / Expected Revenue (K418,600)	≥100%	40%	(Actual/Expected)×100, capped at 150%
Efficiency Ratio	Target CIR (55%) / Actual CIR	≤55%	30%	If Actual ≤55%: 100%
If >55%: (55%/Actual)×100
Profitability Contribution	Branch Net Contribution / Total Institutional Net Contribution (per LC basis)	≥ institutional avg	20%	(Branch Contribution per LC / Inst Avg per LC)×100, capped at 150%
Growth Trajectory	MoM Revenue Growth vs Target (2.5%)	≥2.5%	10%	(Actual/2.5%)×100, capped at 100%
Example Display:
text
REVENUE & PERFORMANCE METRICS INDEX: 71.3% (→)
├─ Revenue Achievement: 85% (K355k/K418k) → Contributing 34.0pp of 40pp max
├─ Efficiency Ratio: 73% (75%/55% inverted) → Contributing 21.9pp of 30pp max
├─ Profitability Contribution: 80% (below avg) → Contributing 16.0pp of 20pp max
└─ Growth Trajectory: 0% (0% MoM growth) → Contributing 0.0pp of 10pp max
PLEASE NOTE
CIR = Cost-to-Income Ratio
Definition:
CIR is a fundamental efficiency metric that shows how much it costs to generate each unit of income.
Formula:
CIR = (Total Operating Costs) / (Total Operating Income)
Simple Example:
Branch Monthly:
	Operating Costs: K30,000 (salaries, rent, etc.)
	Operating Income: K50,000 (interest earned, fees)

CIR = K30,000 / K50,000 = 0.60 or 60%
Interpretation: It costs K0.60 to generate every K1.00 of income.
What's a Good CIR?
CIR Range	Interpretation
Below 50%	Excellent efficiency
50% - 60%	Good efficiency
60% - 70%	Average / Needs monitoring
Above 70%	Poor efficiency / Red flag
In Our SLMS Context:
From the Revenue & Performance:
Efficiency Ratio Score = Target CIR (55%) / Actual CIR
Example Scenarios:
1)	If Actual CIR = 50% (better than target):
	Score = 55%/50% = 110% → Capped at 100%
2)	If Actual CIR = 65% (worse than target):
	Score = 55%/65% = 84.6%
3)	If Actual CIR = 80% (critical):
	Score = 55%/80% = 68.8%
Why It Matters:
	Low CIR (<50%): Branch is efficient, keeping costs low relative to income
	High CIR (>70%): Branch is inefficient - costs are eating into profits
	Rising CIR: Costs growing faster than income (warning sign)
	Falling CIR: Improving efficiency (good sign)
Practical Example from Whence:
Branch X Monthly:
	Income: K418,600 (expected collections)
	Costs: K280,000 (salaries K200k + rent K50k + other K30k)

CIR = K280,000 / K418,600 = 67%

Score = 55%/67% = 82% contribution to Revenue Index
This tells leadership: "Branch X is moderately efficient but has room to improve by either increasing income or reducing costs." 
EXECUTIVE DASHBOARD - THE FIVE NUMBERS
EXECUTIVE DASHBOARD
With Full Comparative Context
╔════════════════════════════════════════════════════════════════════════════════════════════╗
║                             INSTITUTIONAL HEALTH DASHBOARD                                 ║
║                                   As at 26 February, 2026                                  ║
╠════════════════════════════════════════════════════════════════════════════════════════════ ╣
║                                                                                             ║
║ HEADLINE PARAMETER              CURRENT    INST AVG    PROV AVG    TARGET     STATUS        ║
║ ─────────────────────────────────────────────────────────────────────────────────────────── ║
║ BRANCH STRUCTURE & STAFFING        82%        78%         76%        85%      ████████░░    ║
║                                                                          (↓3 vs target)     ║
║                                                                                             ║
║ LOAN CONSULTANT PERFORMANCE         47%        62%         58%        80%      ████░░░░░░   ║
║                                                                          (↓33 vs target)    ║
║                                                                                             ║
║ LOAN PRODUCTS & INTEREST RATES      76%        74%         71%        80%      ███████░░░   ║
║                                                                          (↓4 vs target)     ║
║                                                                                             ║
║ RISK MANAGEMENT & DEFAULTS          38%        52%         48%        75%      ███░░░░░░░   ║
║                                                                          (↓37 vs target)    ║
║                                                                                             ║
║ REVENUE & PERFORMANCE METRICS       58%        65%         61%        75%      █████░░░░░   ║
║                                                                          (↓17 vs target)    ║
║                                                                                             ║
║ ═══════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                             ║
║ OVERALL INSTITUTIONAL HEALTH:      60.2%       66.2%       62.8%       79%      ██████░░░░  ║
║                                                                                             ║
║ 📉 TREND ANALYSIS (vs last month):                                                          ║
║    • Overall Score: ▼ 8.3% (from 68.5%)                                                     ║
║    • Primary Declines: Risk Management (▼12%), LC Performance (▼9%)                         ║
║    • Geographic Origin: 42% of decline from Eastern Province                                ║
║    • Branch-Level: Branch X (Eastern) ▼31%, Branch Y (Eastern) ▼18%                         ║
║                                                                                             ║
║ ⚠️  ALERTS:                                                                                  ║
║    • 🔴 CRITICAL: Risk Management (38%) - 37pp below target                                  ║
║    • 🟠 WARNING: LC Performance (47%) - 33pp below target                                    ║
║    • 🟢 GOOD: Branch Structure (82%) - Near target                                           ║
║                                                                                             ║
║ >> CLICK ANY PARAMETER TO DRILL DOWN TO CONSTITUENTS <<                                     ║
║ >> CLICK GEOGRAPHY TO DRILL: Province → District → Branch → LC <<                           ║
║                                                                                             ║
╚════════════════════════════════════════════════════════════════════════════════════════════╝

DRILL-DOWN EXAMPLE: Click on "RISK MANAGEMENT & DEFAULTS (38%)"

╔════════════════════════════════════════════════════════════════════════════════════════════╗
║                       RISK MANAGEMENT & DEFAULTS INDEX                                     ║
║                              Drill-Down View                                               ║
╠════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                             ║
║ CONSTITUENT METRICS          CURRENT    INST AVG    PROV AVG    TARGET     CONTRIBUTION     ║
║ ─────────────────────────────────────────────────────────────────────────────────────────── ║
║ Month-1 Default Rate           30.0%      26.5%       28.0%       ≤25%                      ║
║   (Score)                        50%        65%         55%        100%    20.0/40pp ▼      ║
║                                                                                             ║
║ 3-Month Recovery Rate           24.0%      42.0%       35.0%      ≥56.05%                   ║
║   (Score)                        43%        75%         62%        100%    12.9/30pp ▼      ║
║                                                                                             ║
║ Roll-Rate Control (30→60d)       45%        35%         40%       ≤36.74%                   ║
║   (Score)                        30%        82%         65%        100%     6.0/20pp ▼      ║
║                                                                                             ║
║ Long-Term Delinquency Risk      41.0%      44.0%       45.0%      ≤43.95%                   ║
║   (Score)                        89%        82%         80%        100%     8.9/10pp ▲      ║
║                                                                                             ║
║ ═══════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                             ║
║ OVERALL INDEX:                 38%         58%         53%         75%      ███░░░░░░░      ║
║                                                                                             ║
║ 🔍 ROOT CAUSE ANALYSIS:                                                                     ║
║    • Primary Driver: Month-1 Default (20.0/40pp) - 20pp shortfall                           ║
║    • Secondary: 3-Month Recovery (12.9/30pp) - 17.1pp shortfall                             ║
║    • Geographic Concentration:                                                              ║
║        - Eastern Province: 22% (vs 38% inst) - contributing 42% of problem                  ║
║        - Branch X (Eastern): 15% - contributing 60% of provincial problem                   ║
║        - LC Mukuka (Branch X): 8% - PAR 45%, Recovery 12%                                   ║
║        - LC Banda (Branch X): 12% - PAR 38%, Recovery 18%                                   ║
║                                                                                             ║
║ ✅ RECOMMENDED ACTIONS:                                                                      ║
║    • Immediate: Portfolio reassignment for LC Mukuka and LC Banda (per Section 11)          ║
║    • Within 7 days: Branch Manager intervention on 30-60 day delinquent accounts            ║
║    • Within 30 days: District Manager review of collection practices at Branch X            ║
║                                                                                             ║
║ ⏰ TIMELINE TRACKING:                                                                        ║
║    • Performance Manager notified: 2024-07-15 09:34                                         ║
║    • Branch Manager acknowledged: 2024-07-15 14:20                                          ║
║    • Follow-up review scheduled: 2024-07-22                                                 ║
║                                                                                             ║
╚════════════════════════════════════════════════════════════════════════════════════════════╝

ALTERNATIVE: Condensed Version (if screen space is limited)
╔════════════════════════════════════════════════════════════════════════════════╗
║                         INSTITUTIONAL HEALTH DASHBOARD                         ║
╠════════════════════════════════════════════════════════════════════════════════╣
║                                                                                 ║
║ PARAMETER                  CURRENT    vs INST    vs TARGET    STATUS           ║
║ ─────────────────────────────────────────────────────────────────────────────── ║
║ Branch Structure              82%      ▲4%        ▼3%        ████████░░  82%   ║
║ LC Performance                 47%      ▼15%       ▼33%       ████░░░░░░  47%  ║
║ Loan Products                  76%      ▲2%        ▼4%        ███████░░░  76%  ║
║ Risk Management                38%      ▼14%       ▼37%       ███░░░░░░░  38%  ║
║ Revenue & Performance          58%      ▼7%        ▼17%       █████░░░░░  58%  ║
║                                                                                 ║
║ OVERALL HEALTH:               60.2%     ▼6%        ▼19%       ██████░░░░  60%   ║
║                                                                                 ║
║ 📉 DECLINE ORIGIN: Eastern Province (42%) → Branch X (60% of prov)              ║
║ ⚠️  CRITICAL: Risk Mgt (38%) | WARNING: LC Perf (47%)                           ║
║                                                                                 ║
║ >> CLICK TO DRILL <<                                                            ║
╚════════════════════════════════════════════════════════════════════════════════╝
Key Principles Applied:
Principle	How It's Displayed
Context at glance	Current vs Inst Avg vs Provincial Avg vs Target
Visual severity	Progress bars (████░░) show distance to target
Gap quantification	"(↓37 vs target)" - immediate sense of magnitude
Trend direction	▲▼ arrows show movement
Root cause tracing	Geographic drill-down to province/branch/LC
Action orientation	Recommended actions with timelines
Accountability	Who was notified and when
This design ensures leadership instantly sees:
1)	What's wrong (Risk Management at 38%)
2)	How wrong (37pp below target, 14pp below institutional avg)
3)	Where (Eastern Province contributing 42%)
4)	Who (Branch X, LCs Mukanda and Banda)
5)	What to do (Portfolio reassignment)
TECHNICAL IMPLEMENTATION NOTES FOR IT
1. Weighting Logic
	Weights should be configurable by system administrators (But you can use these in this document as they are already tailored to the strategic document). 
	Different weight sets can be created for different review cycles (monthly, quarterly, annual)
	Strategic shifts can be reflected by adjusting weights
2. Normalization Functions
	Each constituent needs a normalization function (linear, threshold, or piecewise)
	Store these as configurable parameters in a reference table
	Example functions provided above; refine with historical data
3. Contribution Analysis
	For each headline number, system must calculate:
	Percentage Point (pp) Contribution = (Constituent Score × Weight)
	Percentage of Total Variance = (Constituent pp Change / Total pp Change)
	This enables the "60% of decline from Risk Management" insight
4. Alert Thresholds
	Red Alert: Any headline parameter < 50%
	Amber Alert: Any headline parameter 50-65%
	Green: All parameters > 65%
	Cascading alerts at constituent level (e.g., Month-1 Default < 30% triggers branch manager alert)
5. Historical Tracking
	Store all headline numbers and constituent contributions monthly
	Enable trend analysis: "Risk Management Index has declined for 4 consecutive months"
	Calculate velocity of change for predictive alerts
6. Data Validation
	If any constituent cannot be calculated (missing data), the headline number should flag as "Incomplete"
	Minimum data requirements: At least 3 constituents with valid data to calculate headline
This structure gives:
1)	One number per headline parameter for quick scanning
2)	Constituent breakdown for understanding drivers
3)	Weighted contribution analysis for prioritization
4)	Drill-down to individual LC level for root cause
5)	Action triggers built into the logic
If the headline dashboards are presented as above, the SLMS now becomes a true "strategic nervous system” as then it would not just show data, it shall tell leadership where to focus and why.
Prepared by: Dr. Henry Lukama Chikweti, PhD – 26th February,2026

