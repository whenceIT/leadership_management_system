Managerial Remuneration System — Features and Processing Requirements
Based on the Whence Financial Services Managerial Remuneration Guide Summary, the system should calculate how much each manager qualifies to earn, how much they will receive after deductions, and the total cost to the company. 
MANAGERIAL REMUNERATION final SUMMARY.docx
The system should use the approved remuneration structure, management role, performance results, revenue targets, allowances, statutory deductions, and applicable bonus rules to produce a monthly salary calculation.
1. Core features required
1. Manager Profile and Role Management
•	Register or select the manager from existing staff records.
•	Identify the managerial position: Branch Manager, District Manager, Provincial Manager, Department Head, or Coordinator.
•	Assign the manager's province, district, branches, or department.
•	Record appointment date, acting status, and effective remuneration period.
•	Link the manager to the correct tier and salary structure.
2. Remuneration Tier and Salary Configuration
•	Configure Tier 1 (Most Senior), Tier 2 (Senior), Tier 3 (Mid-Level), and Tier 4 (Junior/Entry).
•	Store the gross salary, expected net cash pay, housing limits, travel and fuel allowances, pension contributions, and applicable benefits for each tier.
•	Configure separate criteria for each managerial role.
•	Maintain effective dates and approved changes to salary bands.
3. Performance and Revenue Assessment
•	Retrieve the manager's actual monthly revenue or relevant performance results.
•	Compare actual results with the targets defined for their role.
•	Calculate achievement percentages and determine the qualifying tier.
•	Support non-revenue measures, including efficiency, PDUA, recoveries, value preservation, IT system performance, or recruitment outcomes where applicable.
•	Retain monthly results for audit and future reviews.
4. Salary Calculation Engine
•	Determine the salary associated with the manager's qualifying tier.
•	Calculate gross pay, PAYE, NAPSA, NHIMA, and other approved employee deductions.
•	Calculate net cash pay.
•	Calculate housing and other applicable benefits.
•	Calculate employer contributions and total monthly cost to company.
5. Allowances and Annual Bonuses
•	Apply eligible housing, travel, fuel, pension, and medical benefits.
•	Check the Provincial Manager annual bonus conditions.
•	Check the District Manager annual performance allowance conditions.
•	Preserve existing allowances that remain valid under approved management resolutions.
•	Prevent duplicate or ineligible payments.
6. Approval, Payroll and Reporting
•	Generate a monthly remuneration statement for each manager.
•	Allow HR or the responsible administrator to review and verify calculations.
•	Require authorized approval before the salary is finalized.
•	Send approved figures to payroll or export them for payroll processing.
•	Keep calculation history, changes, approvals, and audit records.
2. Processing required to determine a manager's pay
The system should process each manager in the following sequence.
01
Select manager
Retrieve role, branch or department, and employment details.
02
Load remuneration rules
Identify the approved salary bands, tier criteria, and eligible benefits.
03
Retrieve performance data
Collect revenue, efficiency, recovery, or other role-specific results.
04
Determine qualifying tier
Compare verified results against the relevant thresholds and conditions.
05
Calculate salary and benefits
Apply the approved gross salary, allowances, and deductions.
06
Validate and approve
Flag missing data, verify eligibility, and obtain authorized approval.
07
Produce final pay statement
Show net cash pay, benefits, deductions, bonuses, and company cost.
3. The calculations the system must perform
The remuneration guide distinguishes gross salary, net cash pay, housing benefits, and total monthly cost to the company. These must be displayed separately. 
MANAGERIAL REMUNERATION final SUMMARY.docx
Calculation	Processing rule
Tier qualification	Compare verified performance with the applicable role-specific thresholds.
Gross pay	Load the approved gross salary for the applicable tier and pay period.
Employee deductions	Calculate PAYE, NAPSA, NHIMA, and other authorized deductions using the applicable rules.
Net cash pay	Gross pay − employee deductions + eligible cash additions not already included in gross pay.
Housing benefit	Apply the eligible tier's housing limit and approved landlord payment.
Annual bonus	Check role, annual performance criteria, and approval status.
Total monthly company cost	Gross pay + employer statutory contributions + employer pension contributions + housing payment + other included employer-paid benefits.
Important: Avoid adding an allowance twice if it is already included in gross pay. The system must also distinguish employee deductions from employer contributions.
4. Role-specific performance rules
The guide defines different performance measures for different managerial roles. The system must not use one common revenue formula for everyone. 
MANAGERIAL REMUNERATION final SUMMARY.docx
Managerial role	Information needed to determine remuneration
Branch Manager	Monthly bank deposits and applicable tier threshold.
District Manager	Monthly revenue target and qualifying branch responsibility.
Provincial Manager	Monthly revenue and relevant branch responsibility or equity criteria.
Management Accountant	Strategic scope and applicable managerial tier.
Manager Administration	Annual value preserved or enabled.
Payroll Loans Manager	Monthly revenue benchmark and applicable tier.
Motor Vehicle Manager	Applicable revenue benchmark and managerial tier.
Policy Manager	Annual value protected or enabled.
Performance Manager	Annual value protected or optimized.
Personnel / Recruitment Manager	Recruitment impact, vacancy impact, operational efficiency, and applicable tier.
Recoveries Coordinator	Monthly net recovery income and funding criteria.
IT Coordinator	System performance, uptime, outsourcing criteria, and role tier.
Head of Creative Arts	Monthly net income and applicable funding criteria.
Risk Manager	Applicable revenue benchmark and managerial tier.
For each role, the administrator should configure the measurement period, data source, thresholds, and evidence required. Where the guide does not explicitly define a formula or a measurement method, it must be confirmed with management rather than assumed.
5. Additional system features and controls
These features are needed to make the calculation reliable and suitable for actual payroll processing.
•	Performance data integration: Retrieve revenue, deposits, recoveries, branch efficiency, and other results from the relevant existing system modules wherever possible.
•	Monthly calculation history: Save each month's performance results, qualifying tier, salary calculation, deductions, benefits, and approval status.
•	Acting manager processing: Apply the appropriate acting or junior-tier rules where specified in the guide.
•	Tier changes: Recalculate remuneration when a manager qualifies for a higher or lower tier, using approved effective dates.
•	Increment review workflow: Monitor underperformance, corrective plans, monthly progress reports, and any approved suspension or revocation of increments.
•	Data validation: Flag missing performance data, incomplete employee records, conflicting salary rules, and unapproved allowances.
•	Access control: Restrict salary configuration, approvals, and individual remuneration details to authorized users.
•	Audit trail: Record who changed a salary rule, who verified performance, who approved the calculation, and when each action occurred.
•	Reports and exports: Generate individual statements, a consolidated monthly management payroll report, a company cost summary, and payroll-ready exports.
6. What the final manager remuneration statement should show
Sample Monthly Remuneration Statement
Illustrative example based on the guide's Branch Manager, Tier 1 sample. Amounts are in Zambian kwacha (ZMW).
Position / tier
Branch Manager / Tier 1
Monthly bank deposits
K20,000+
Gross salary
K19,948
Employee deductions
− K6,947
Net cash pay
K13,001
Housing paid to landlord
K2,500
Total direct value
K15,501
Employer statutory and pension costs
K3,285
Total monthly cost to company
K25,733
Source: remuneration guide, pages 2–5. The figures are an example from the document, not a verified current payroll calculation.
7. Decisions management must confirm before development
The guide provides the proposed remuneration framework, but the following details should be agreed before the calculation engine is implemented.
Requirements confirmation checklist
0 of 7
 
Performance measurement
Confirm whether each threshold uses actual revenue, net revenue, deposits, collections, or another measure, and which system is the official source.
 
Tier qualification
Define how overlapping bands, multiple criteria, missed targets, and managers responsible for several branches are handled.
 
Salary effective dates
Confirm when a new tier takes effect, whether changes are prospective or retrospective, and how partial months are handled.
 
Statutory deductions
Confirm the approved payroll tax and contribution rules for the applicable pay period rather than hard-coding sample deduction amounts.
 
Housing and benefits
Confirm eligibility, actual landlord payments, caps, and the salary adjustment rules when a manager drops to a lower tier.
 
Bonuses and increments
Define the annual assessment period, evidence, approval workflow, payment date, and treatment of managers who only partially meet conditions.
 
Approval and payroll
Identify who verifies performance, who approves remuneration, and how finalized amounts are transferred into payroll.
Copy checklist
8. Recommended development modules
For implementation, organize the work into these modules:
1.	Remuneration Configuration — roles, tiers, salary bands, performance thresholds, allowances, deductions, and effective dates.
2.	Manager Performance Assessment — data retrieval, target comparison, qualification rules, and evidence verification.
3.	Salary Calculation Engine — gross pay, net pay, employer contributions, benefits, and total company cost.
4.	Bonus and Increment Management — annual bonuses, performance reviews, and approved salary changes.
5.	Remuneration Approval Workflow — verification, approval, rejection, and finalization.
6.	Manager Payroll Dashboard — individual earnings, monthly statements, tier history, and consolidated reporting.
7.	Audit and Payroll Integration — access control, change history, payroll exports, and reconciliation.
Recommended starting point: Build the remuneration configuration and performance qualification rules first. Once those are confirmed, the calculation engine can reliably answer the central question: How much is this manager entitled to earn for this month, why do they qualify for that amount, and what will it cost the company?

