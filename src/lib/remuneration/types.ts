/**
 * Managerial Remuneration — domain types
 *
 * These types describe the approved remuneration framework captured in the
 * Whence Financial Services Managerial Remuneration Guide and the processing
 * requirements in `.remuneration/technical-client-end-implementation.md`.
 */

/** Approved by management vs. derived from the shared pay ladder and awaiting confirmation. */
export type TierStatus = 'approved' | 'proposed';

/** How a manager's performance is measured for tier qualification. */
export type MeasureKind =
  | 'monthly_revenue'
  | 'monthly_deposits'
  | 'monthly_net_income'
  | 'monthly_net_recovery'
  | 'annual_value'
  | 'system_performance'
  | 'role_scope';

/** Where an allowance sits in the pay calculation. Prevents double counting. */
export type AllowanceTreatment =
  /** Already inside gross pay (cash allowance) — never added again. */
  | 'included_in_gross'
  /** A benefit in kind paid by the company, not part of gross or net cash. */
  | 'employer_paid_benefit'
  /** Paid straight to the landlord, non-taxable, excluded from gross pay. */
  | 'paid_to_landlord';

export type AllowanceCode =
  | 'travel'
  | 'fuel'
  | 'life_insurance'
  | 'medical'
  | 'housing'
  | 'other';

export interface AllowanceComponent {
  code: AllowanceCode;
  label: string;
  amount: number;
  treatment: AllowanceTreatment;
  taxable: boolean;
  note?: string;
}

export interface DeductionBreakdown {
  napsa: number;
  nhima: number;
  paye: number;
  pension: number;
  total: number;
}

/** A pay block is a reusable gross pay / allowance package from the guide. */
export interface PayBlock {
  code: string;
  grossPay: number;
  /** Net cash pay as printed in the guide (illustrative, for reconciliation only). */
  referenceNetPay: number | null;
  referenceDeductions: DeductionBreakdown | null;
  referenceEmployerCosts: DeductionBreakdown | null;
  referenceTotalCompanyCost: number | null;
  /** Housing printed against the tier row in the guide (the policy band governs). */
  referenceHousing: number | null;
  /** Travel, fuel and insurance lines carried by the block (memo lines). */
  allowances: AllowanceComponent[];
}

export interface TierBand {
  tier: number;
  label: string;
  seniority: string;
  /** Human readable criterion, verbatim from the guide. */
  criterion: string;
  measureKind: MeasureKind;
  /** Lower bound of the qualifying range (null = catch-all). */
  threshold: number | null;
  /** Upper bound of the qualifying range (null = open ended). */
  upperThreshold: number | null;
  /** Minimum number of branches/offices in scope, when the guide states one. */
  minScopeCount: number | null;
  scopeNote: string | null;
  payBlock: PayBlock;
  /** Housing allowance for the tier, from the Managerial Housing Policy. */
  housing: number;
  status: TierStatus;
  sourceNote: string;
  /** Overrides the pay block reference net pay for this tier only. */
  referenceNetPay?: number | null;
}

export type HousingBandKey =
  | 'branch_manager'
  | 'district_manager'
  | 'provincial_manager'
  | 'director';

export interface HousingBand {
  key: HousingBandKey;
  label: string;
  /** Indexed by tier: 1 = most senior … 4 = junior / entry. */
  byTier: Record<number, number>;
  notes: string[];
}

export interface BonusCondition {
  code: string;
  label: string;
  threshold: number;
  /** Where the number comes from, e.g. `efficiency-ratio/province/{id}`. */
  source: string;
}

export interface BonusRule {
  code: string;
  label: string;
  amount: number;
  period: 'annual';
  appliesToRoleIds: string[];
  conditions: BonusCondition[];
  payableOn: string;
  sourceNote: string;
}

export interface RoleDefinition {
  id: string;
  name: string;
  category:
    | 'branch'
    | 'district'
    | 'province'
    | 'department_head'
    | 'coordinator';
  /** Leadership position ids that map to this remuneration role. */
  positionIds: number[];
  positionNames: string[];
  measure: {
    kind: MeasureKind;
    label: string;
    unit: string;
    period: 'monthly' | 'annual';
    direction: 'higher_is_better';
    autoSource: 'revenue_achievement' | 'manual';
  };
  housingBand: HousingBandKey;
  tiers: TierBand[];
  bonusRuleCode: string | null;
  sourceNote: string;
}

/** Statutory and scheme rules applied on top of the approved salary bands. */
export interface StatutoryRules {
  napsa: {
    label: string;
    employeeRate: number;
    employerRate: number;
    employeeCap: number | null;
  };
  nhima: {
    label: string;
    employeeRate: number;
    employerRate: number;
  };
  pension: {
    label: string;
    enabled: boolean;
    employeeRate: number;
    employerRate: number;
  };
  paye: {
    label: string;
    /** Ordered bands, `upTo` is inclusive; the last band has `upTo: null`. */
    bands: { upTo: number | null; rate: number }[];
    /** Monthly relief applied after banding. */
    relief: number;
  };
  medical: {
    label: string;
    enabled: boolean;
    monthlyPremium: number;
  };
}

export interface ManagerScope {
  officeId: number | null;
  officeName: string | null;
  districtId: number | null;
  districtName: string | null;
  provinceId: number | null;
  provinceName: string | null;
  department: string | null;
  /** Number of branches in scope. */
  branchCount: number;
}

export interface ManagerProfile {
  id: string;
  userId: number | null;
  fullName: string;
  email: string | null;
  roleId: string;
  roleName: string;
  scope: ManagerScope;
  appointmentDate: string | null;
  acting: boolean;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  status: 'active' | 'inactive';
  source: 'staff_record' | 'office_appointment' | 'registered';
  /** Id of the administrator maintained assignment behind this profile, when any. */
  registeredId?: string | null;
  previousTier: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceMeasure {
  code: string;
  label: string;
  unit: string;
  value: number | null;
  target: number | null;
  period: string;
  source: string;
  verified: boolean;
  note: string;
}

export interface PerformanceInput {
  /** Primary measured value used for tier qualification. */
  value: number | null;
  period: string;
  source: string;
  measures: PerformanceMeasure[];
  /** Administrator override for non-numeric criteria. */
  manualTier: number | null;
  overrideReason: string | null;
  efficiencyScore: number | null;
  pduaScore: number | null;
  branchCount: number | null;
}

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationFlag {
  code: string;
  severity: ValidationSeverity;
  message: string;
}

export type QualificationBasis =
  | 'threshold'
  | 'manual_override'
  | 'scope'
  | 'unqualified';

export interface TierQualification {
  tier: number | null;
  label: string;
  seniority: string;
  criterion: string;
  basis: QualificationBasis;
  reason: string;
  achievementPct: number | null;
  status: TierStatus;
  nextTier: { tier: number; label: string; criterion: string; shortfall: number } | null;
  evaluatedTiers: {
    tier: number;
    label: string;
    criterion: string;
    matched: boolean;
    reason: string;
  }[];
}

export interface BonusAssessment {
  ruleCode: string | null;
  label: string | null;
  amount: number;
  eligible: boolean;
  reason: string;
  conditions: {
    code: string;
    label: string;
    value: number | null;
    threshold: number;
    met: boolean;
  }[];
  payableOn: string | null;
}

export interface HousingAssessment {
  band: HousingBandKey;
  bandLabel: string;
  tierHousing: number;
  paidHousing: number;
  /** Reduction applied to cash pay when a higher tier housing allowance is retained. */
  continuityAdjustment: number;
  continuityApplied: boolean;
  note: string;
}

/* -------------------------------------------------------------------------- */
/* Remuneration service                                                         */
/* -------------------------------------------------------------------------- */

/** A component as configured in the remuneration service. */
export interface PayrollComponent {
  code: string;
  name: string;
  componentType: string;
  paidBy: string;
  calculationType: string;
  amount: number;
  includedInGross: boolean;
  includedInCompanyCost: boolean;
}

/**
 * The payroll figure produced by the remuneration service from the employee's
 * remuneration assignment, its configuration and the configured component
 * values. It is the figure the service will pay, and it is reconciled against
 * the engine figure before the statement is approved.
 */
export interface PayrollFigure {
  source: 'remuneration-service' | 'engine';
  assignmentId: number | null;
  assignmentStatus: string | null;
  packageTier: number | null;
  packageLabel: string | null;
  positionLabel: string | null;
  grossPay: number;
  employeeDeductions: number;
  netCashPay: number;
  housing: number;
  totalDirectValue: number;
  employerContributions: number;
  totalCompanyCost: number;
  components: PayrollComponent[];
  period: string;
  note: string | null;
}

/** The difference between the engine figure and the remuneration service figure. */
export interface PayrollVariance {
  grossPay: number;
  netCashPay: number;
  totalCompanyCost: number;
  netCashPayPct: number | null;
  totalCompanyCostPct: number | null;
  packageMatchesTier: boolean;
  note: string;
}

export interface RemunerationComputation {
  managerId: string;
  managerName: string;
  roleId: string;
  roleName: string;
  period: string;
  qualification: TierQualification;
  /** Gross pay actually payable, after any housing continuity adjustment. */
  grossPay: number;
  /** Approved tier gross before the housing continuity adjustment. */
  approvedGrossPay?: number;
  deductions: DeductionBreakdown;
  netCashPay: number;
  benefits: {
    housing: number;
    travel: number;
    fuel: number;
    lifeInsurance: number;
    medical: number;
    total: number;
    /** Cash allowances that the guide already includes in gross pay. */
    includedInGross: number;
  };
  totalDirectValue: number;
  employerCosts: DeductionBreakdown;
  totalCompanyCost: number;
  bonus: BonusAssessment;
  housing: HousingAssessment;
  reference: {
    netPay: number | null;
    totalCompanyCost: number | null;
    netVariance: number | null;
    netVariancePct: number | null;
    costVariance: number | null;
    costVariancePct: number | null;
  };
  flags: ValidationFlag[];
  /** The payroll figure produced by the remuneration service, when the manager has an assignment. */
  payroll?: PayrollFigure | null;
  /** The difference between the engine figure and the remuneration service figure. */
  payrollVariance?: PayrollVariance | null;
  generatedAt: string;
}

export type StatementStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'finalised';

export interface RemunerationStatement extends RemunerationComputation {
  id: string;
  status: StatementStatus;
  scopeLabel: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
}

export interface AuditEntry {
  id: string;
  statementId: string | null;
  managerId: string | null;
  action: string;
  actor: string;
  detail: string;
  at: string;
}
