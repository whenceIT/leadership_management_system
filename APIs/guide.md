This is where each headline parameter rolls up into a single, consolidated number (likely a score or percentage), and that number can be decomposed to understand what's driving it. This is usually perfect for executive dashboards where there is need for a quick health check, and then drill-down capability.
General Architecture for All Parameters
For each headline parameter, the system will:
1)	Calculate a normalized score (0-100%) for each constituent metric
2)	Apply a strategic weight to each constituent
3)	Sum the weighted scores to produce ONE headline number
4)	Enable decomposition to show each constituent's contribution to the total
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

Why This Matters for Leadership:
When you see "Risk Management Index: 38% (↓↓ CRITICAL)" and then "Month-1 Default Performance: Contributing 20.0pp of 40pp max", you immediately know:
	20pp is what you actually got
	40pp was what was possible if performance was perfect
	20pp shortfall = This constituent is responsible for half the potential value being lost

This allows leadership to instantly prioritize: "Fix Month-1 Default Performance because it's leaving 20pp on the table."
So in short:
	% = Your score
	pp = How much of the final index score that constituent actually contributed

Example for @ConstituentDetailView
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
║                                                                                             

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




<!-- display this some where -->
<!--Total Institution Average Score %-->
<!-- e.g Total percentage point for the consituent here (25pp) -->
<!--pp scored, put it on contribution and calculate remaining contribution and prev month trend comparision-->