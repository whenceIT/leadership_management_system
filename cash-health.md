Documents
1
CASH_HEALTH_DOCUMENTATION.md
Cash Health Module — Documentation
Module: app/Http/Controllers/CashHealthController.php Views: resources/views/cash-health/ Routes: routes/web.php (lines 248–289)

1. Overview
The Cash Health module provides a cash-position dashboard for the lending institution. It pulls financial data from an external backend API (https://lms2backend.whencefinancesystem.com) and presents it at four hierarchical levels: Branch → District → Province → National.

Each level displays:

A Cash Health Score (0–100) with three component sub-scores
Financial figures (disbursements, collections, residual cash, operating costs, etc.)
A cycle selector for the monthly cash cycle (25th → 24th)
In the National view: an interactive contribution history chart and live cash balances
2. Controller — CashHealthController.php
2.1 Architecture
Concern	Detail
Namespace	App\Http\Controllers
Dependencies	Illuminate\Http\Request, Illuminate\Support\Facades\Http, Carbon\Carbon, App\Models\Office
API Base URL	https://lms2backend.whencefinancesystem.com
Default timeouts	120s (show/national), 60s (district/province/contribution), 15s (province API call)
2.2 Cash Cycle Logic
All methods share an identical cycle calculation:

If today >= 25:
  cycle_start = month's 25th
Else:
  cycle_start = previous month's 25th
cycle_end = cycle_start + 1 month - 1 day
Example: On Aug 20, the current cycle is Jul 25 → Aug 24. On Aug 26, it's Aug 25 → Sep 24.

A dropdown of 12 available cycles (current + previous 11) is generated and passed to the view.

2.3 show(Request $request, $id) — Branch Cash Health
Route: GET /cash_health/show/{id} → cash_health.show

Purpose: Displays a single branch office's complete cash health dashboard.

Flow:

Looks up office name from the offices table via Office::where('id', $id)->value('name').
Calculates the current cash cycle start date.
Reads cycle_start from query params (falls back to current cycle).
Validates the date format; aborts 400 if invalid.
Validates the day is the 25th; aborts 400 otherwise.
Calculates cycle end = cycle_start + 1 month - 1 day.
Calls external API: GET https://lms2backend.whencefinancesystem.com/cash-health/{id}?cycle_start=...
Aborts with the API's status code if the request fails.
Generates 12 available cycles for the dropdown.
Returns view cash-health.show with:
$cashHealth — full API response
$cycleStart — selected cycle start
$cycleEnd — calculated cycle end
$availableCycles — 12-cycle options
$id — office ID
$officeName — office name
Data structure expected from API:

$cashHealth['office']       // Office details
$cashHealth['cycle']        // Cycle metadata
$cashHealth['scores']       // overall, disbursement, collection, residual_cash, months_of_cover, full_payment_ratio, status
$cashHealth['financials']   // minimum_loan_target, residual_cash, defaults, net_cash_position, expected_cash_requirement, etc.
$cashHealth['loans']        // Loan-level data
$cashHealth['reason']       // Human-readable score explanation
$cashHealth['disbursed']    // Total amount disbursed
$cashHealth['collected']    // Total amount collected
2.4 contributionHistory($id) — AJAX Contribution Data
Route: GET /cash_health/contribution/{id} → cash_health.contribution

Purpose: Returns JSON data for the contribution history chart.

Flow:

Calls external API: GET https://lms2backend.whencefinancesystem.com/cash-health/{id}/contributions/
On API failure: logs the error and returns {error, status} JSON.
On exception: logs the error and returns {error, message} JSON with 500.
On success: returns $response->json() directly.
2.5 district(Request $request, $district) — District Cash Health
Route: GET /cash_health/district/{district} → cash_health.district

Purpose: Shows aggregate data for all offices within a district.

Flow (mirrors show()):

Gets all offices, keyed by ID: Office::get()->keyBy('id').
Calculates current cash cycle.
Reads/selects cycle_start from query params.
Validates date format and 25th-day rule.
Calculates cycle end.
Calls external API: GET https://lms2backend.whencefinancesystem.com/cash-health/district/{district}?cycle_start=...
Returns view cash-health.district with:
$districtHealth — full API response (includes district_name, district_id, scores, financials, reason, offices)
$cycleStart, $cycleEnd, $availableCycles, $offices
2.6 province(Request $request, $province) — Provincial Cash Health
Route: GET /cash_health/province/{province} → cash_health.province

Purpose: Shows aggregate data for all districts within a province.

Flow (mirrors show() and district()):

Gets all offices, keyed by ID: Office::get()->keyBy('id').
Calculates current cash cycle.
Reads/selects cycle_start from query params.
Validates date format and 25th-day rule.
Calculates cycle end.
Calls external API: GET https://lms2backend.whencefinancesystem.com/cash-health/province/{province}?cycle_start=... — note this uses a 60s timeout (the API call) and a 15s timeout for the actual HTTP request (line 467).
Aborts with API status on failure.
Returns view cash-health.province with:
$provinceHealth — API response (includes province_name, province_id, scores, financials, reason, districts[])
$cycleStart, $cycleEnd, $availableCycles, $offices
Notable difference: Unlike show() and district(), this method does not wrap the API call in a try-catch. If the API throws an exception, it will propagate as a 500 error.

2.7 national(Request $request) — National Cash Health
Route: GET /cash_health/national → cash_health.national

Purpose: Top-level dashboard showing the institution's overall cash health across all provinces, districts, and offices.

Flow:

Gets all offices: Office::get()->keyBy('id').
Calculates current cash cycle (25th-based).
Reads/selects cycle_start from query params.
Validates date format and 25th-day rule.
Calculates cycle end.
Calls external API: GET https://lms2backend.whencefinancesystem.com/cash-health/national?cycle_start=...
Calls a second external API for institution cash balance:
GET https://withinheremobileapi.com/api/v1/business-dashboard/company/CMP-35230338/summary
Uses Http::withHeaders(['x-user-email' => 'chikwetihenry@gmail.com'])
Extracts data.summary.total_balance → $totalBalance
Adds $nationalHealth['provinces'] = $nationalHealth['provinces'] ?? [] (defaults to empty array).
Generates 12 available cycles.
Returns view cash-health.national with:
$nationalHealth — API response (includes scores, financials, reason, office_count, provinces[])
$cycleStart, $cycleEnd, $availableCycles, $offices, $totalBalance
Additional API call: The totalBalance is fetched from a completely separate external service (WithinHere Mobile API) using a hardcoded company ID and email header.

2.8 nationalBalances() — AJAX Office List
Route: GET /cash_health/national/balances → cash_health.national.balances

Purpose: Returns JSON list of all offices with their IDs and wallet IDs for the national cash balance loader.

Flow:

Queries Office::select('id', 'name', 'province_id', 'district_id', 'withinhere_wallet_id')->get().
Maps each office to a simplified array.
Returns JSON: {success: true, offices: [...]}
Note: withinhere_wallet_id is not in the Office model's $fillable array, so it must be set directly in the database or via a raw query elsewhere.

2.9 nationalOfficeBalance($officeId) — AJAX Single Office Balance
Route: GET /cash_health/national/balance/{officeId} → cash_health.national.office.balance

Purpose: Fetches cash balance for a single office from the WithinHere backend.

Flow:

Finds office by ID.
Returns 404 if not found.
Returns {success: false, message: 'Please verify withinhere wallet'} if withinhere_wallet_id is missing.
Calls external API: POST https://withinheremobileapi.com/api/v1/lmsuser/branch_ledger
Headers: none explicitly set (relies on default)
Body: {wallet_id, start_date: '2026-01-01', end_date: today}
Timeout: 180s, connect timeout: 30s, 2 retries with 100ms delay
On success: extracts data.user.cash_balance.
Returns JSON: {success: true, office_id, province_id, district_id, balance}
3. Routes
All routes are in routes/web.php (lines 248–289), grouped under prefix => 'cash_health':

Method	URI	Controller Method	Route Name
GET	/cash_health/show/{id}	show	cash_health.show
GET	/cash_health/district/{district}	district	cash_health.district
GET	/cash_health/province/{province}	province	cash_health.province
GET	/cash_health/national	national	cash_health.national
GET	/cash_health/contribution/{id}	contributionHistory	cash_health.contribution
GET	/cash_health/national/balances	nationalBalances	cash_health.national.balances
GET	/cash_health/national/balance/{officeId}	nationalOfficeBalance	cash_health.national.office.balance
Note: There is an additional route at line 1624:

Route::get('/hello/{office}', [CashHealthController::class, 'show'])
    ->name('cash-health.show');
This is a legacy/alternate route using the same controller method.

4. Views
4.1 show.blade.php — Branch Cash Health Dashboard
Extends: layouts.master

Purpose: Detailed single-branch cash health report.

Structure:

Page Header — "Branch Cash Health" title with office name
Cycle Selector — Dropdown (12 cycles) that submits the form via GET on change
Overall Health Card — Large status card with:
Status badge (Green = Healthy / Amber = Needs attention / Red = At risk)
Overall score (0–100) with color-coded icon
Reason text ($reason)
Score Cards (3-column grid):
Disbursement (35% weight) — Score + actual disbursed amount vs. minimum loan target
Collection Quality (35% weight) — Score + collections amount
Residual Cash (30% weight) — Score + residual cash amount
Cash Position (4-column grid):
Given Out (actual disbursed vs. previous cycle)
Expected Repayment (maximum expected)
Cash Requirement (commented out)
Residual Cash (color-coded green/red)
Value-Added Contribution — Bar chart (Chart.js) showing contribution by cash cycle, with a total contribution figure updated via AJAX.
Key variables: $cashHealth, $cycleStart, $cycleEnd, $availableCycles, $id, $officeName, $overallScore, $disbursementScore, $collectionScore, $residualCashScore, $actualDisbursed, $collections

JavaScript: Fetches contribution data from cash_health.contribution endpoint, renders a Chart.js bar chart.

4.2 district.blade.php — District Cash Health Dashboard
Extends: layouts.master

Purpose: Aggregate view for all branches within a district.

Structure:

Page Header — "District Cash Health" title with district name
Cycle Selector — Same dropdown pattern as show.blade.php
Summary Cards (4-column grid):
District Cash Health Score (0–100) with status badge
Residual Cash (formatted as K)
Net Cash Position (formatted as K)
Branches count
District Score Panel — Vertical progress bars for 3 sub-scores (Disbursement, Collection Quality, Residual Cash) with a "Why this score?" explanation
Branch Table — Expandable table with columns: (expand), Branch, Cash Health Score, Residual Cash, Status. Clicking a row expands to show branch financial details and an individual "View" link to the branch detail page.
Key variables: $districtHealth, $cycleStart, $cycleEnd, $availableCycles, $scores, $financials

JavaScript: toggleBranch(id) — toggles row expansion and rotates arrow icon.

4.3 province.blade.php — Provincial Cash Health Dashboard
Extends: layouts.master

Purpose: Aggregate view for all districts within a province.

Structure:

Page Header — "Provincial Cash Health" title with province name
Cycle Selector — Same dropdown pattern
Summary Cards (4-column grid):
Cash Health Score (0–100) with status badge
Residual Cash (color-coded)
Net Cash Position (color-coded)
Offices count
Provincial Score Panel — Progress bars for 3 sub-scores with explanation
Office Table — Expandable table with columns: (expand), District/Office, Cash Health Score, Residual Cash, Status. Clicking a district row expands to show offices with their individual metrics and "View" links.
Key variables: $provinceHealth, $cycleStart, $cycleEnd, $availableCycles, $offices

JavaScript: toggleProvinceOffice(id) — handles expansion/collapse of both district and office rows (supports both <tr> and <div> elements).

Note: Contains commented-out sections for "Cash Position" and "Reserve Breakdown" (lines 441–1013, 1020–1090).

4.4 national.blade.php — National Cash Health Dashboard
Extends: layouts.master

Purpose: Institution-wide dashboard with live cash balance loading.

Structure:

Page Header — "National Cash Health" with:
Office count
Cash Health Guide button (opens a side drawer with explanatory content)
Cycle selector (uses route('cash_health.national'))
Institution Cash Balance — Live balance fetched from WithinHere API, displayed with K symbol
Quick Guide — CSS Grid guide showing score weights (35% Disbursement / 35% Collection / 30% Residual) and status bands (Green/Amber/Red)
Summary Cards (3-column grid):
Institution Cash Health Score (0–100) with status badge
Residual Cash (color-coded)
Net Cash Position (color-coded)
National Score — Progress bars for 3 sub-scores with detailed descriptions and calculations
National Financial Position (commented out) — Grid of 9 financial metrics
Reserve Breakdown (commented out)
Office List Table — Hierarchical expandable table:
Province rows (expandable) → District sub-rows (expandable) → Office rows
Columns: (expand), Province/District/Office, Cash Balance (spinner → loaded via AJAX), Cash Health Score, Residual Cash, Status, Reason/Details
Province and district rows have "View" links to drill down
Cash Health Guide Drawer — Slide-in overlay with detailed explanations of scores, calculation methods, cash cycle info, and important reminders
National Contribution History — Line chart (Chart.js) showing contribution performance across 13 cash cycles, with a level selector (Provinces/Districts/Branches)
Key variables: $nationalHealth, $cycleStart, $cycleEnd, $availableCycles, $offices, $totalBalance, $scores, $financials, $status, $statusColor, $statusBackground

JavaScript:

toggleNationalOffice(id) — toggles expansion of provinces/districts/offices
openCashHealthGuide() / closeCashHealthGuide(event) — slide-in guide drawer with ESC key support
loadOfficeBalance() — sequentially fetches balances for all offices via AJAX, updates province/district/national totals in real-time
loadNationalContribution() — fetches contribution graph data from external API, renders Chart.js line chart
updateContributionGraph() — updates the chart based on the selected grouping level
Note: This is the most complex view at ~4700 lines. The file contains extensive inline CSS and JavaScript.

4.5 item.blade.php — National Cash Health (Component-Based)
Extends: layouts.master

Purpose: An alternative national view that appears to be a refactored/template version. Uses a component-based approach for office metrics with descriptions.

Structure:

Header — "National Cash Health" with cycle selector
Summary Cards (4-column grid): Overall Score, Residual Cash, Net Cash, Offices count
National Score — Progress bars for 3 sub-scores with explanations
National Cash Position — 3-column grid of financial metrics (Minimum Loan Target, Maximum Expected Repayment, etc.) with color-coded values
Reserve Breakdown — 3-column grid of reserve components
Office List — Expandable table with province → district → office hierarchy, similar to national.blade.php but uses a structured $officeMetrics array with label and description fields.
Key difference from national.blade.php: Each financial metric in item.blade.php includes a description field, providing tooltip-style explanations. Uses a cleaner component-based data structure.

JavaScript: toggleNationalOffice(id) — same toggle function as in national.blade.php.

5. Cash Health Scoring System
5.1 Score Components
The overall score (0–100) is a composite of three sub-scores:

Component	Weight	Metric
Disbursement	35%	How much was disbursed vs. minimum loan target
Collection Quality	35%	Quality of loan collections (defaults, full-payment ratio)
Residual Cash	30%	Whether there's enough residual cash to cover obligations
5.2 Score Status Bands
Range	Status	Color
80–100	Healthy / Green	#15803d / #dcfce7
60–79	Needs attention / Amber	#b45309 / #fef3c7
0–59	At risk / Red	#dc2626 / #fee2e2
5.3 Financial Metrics
Common financial fields across API responses:

Field	Description
minimum_loan_target	Minimum amount expected to be disbursed
maximum_expected_repayment	Expected maximum amount to be collected
mandatory_fixed_cost	Essential operating costs
salaries	Salary costs for the period
defaults	Money that is overdue or uncollected
irregular_cost_reserve	Money set aside for irregular costs
salary_advance_reserve	Money advanced to staff
net_cash_position	Collections minus disbursements and operating costs
residual_cash	Cash remaining after obligations (key metric)
actual_disbursed	Total amount actually disbursed
collected	Total amount collected
averageMonthlyIrregularCostReserve	Average monthly irregular cost reserve
6. External API Endpoints
6.1 LMS2 Backend API
Base URL: https://lms2backend.whencefinancesystem.com

Endpoint	Method	Purpose
/cash-health/{officeId}	GET	Branch-level cash health data
/cash-health/district/{district}	GET	District-level aggregate data
/cash-health/province/{province}	GET	Province-level aggregate data
/cash-health/national	GET	National-level aggregate data
/cash-health/{officeId}/contributions/	GET	Individual office contribution history
/cash-health/national/contributions	GET	National contribution graph data (called client-side)
6.2 WithinHere Mobile API
Base URL: https://withinheremobileapi.com/api/v1

Endpoint	Method	Headers	Purpose
/business-dashboard/company/CMP-35230338/summary	GET	x-user-email: chikwetihenry@gmail.com	Institution cash balance
/lmsuser/branch_ledger	POST	(none)	Single office cash balance
POST Body for branch_ledger:

{
  "wallet_id": "office.withinhere_wallet_id",
  "start_date": "2026-01-01",
  "end_date": "YYYY-MM-DD"
}
7. Office Model Relationship
The Office model (app/Models/Office.php) is used extensively:

Table: offices
Key relationships:
province() → Province (hasOne)
district() → District (hasOne)
districtRegional() → DistrictRegional (hasOne)
manager() → User (belongsTo)
Fields used by CashHealthController:
id, name — for office identification
province_id, district_id — for hierarchical grouping
withinhere_wallet_id — for cash balance API calls (not in $fillable)