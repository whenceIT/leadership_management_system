/**
 * Approved managerial remuneration structure.
 *
 * Everything in this file is transcribed from the Whence Financial Services
 * Managerial Remuneration Guide (`.remuneration/goal.md`). Nothing here is
 * invented: where the guide is silent a tier is either left undefined or
 * marked `proposed` with a note explaining what management still has to
 * confirm (see `.remuneration/technical-client-end-implementation.md` §7).
 */

import type {
  BonusRule,
  HousingBand,
  PayBlock,
  RoleDefinition,
  StatutoryRules,
  TierBand,
  TierStatus,
} from './types';

/* -------------------------------------------------------------------------- */
/* Pay blocks                                                                  */
/* -------------------------------------------------------------------------- */

function deductions(napsa: number, nhima: number, paye: number, pension: number) {
  return { napsa, nhima, paye, pension, total: napsa + nhima + paye + pension };
}

/**
 * Reusable gross pay packages from the guide. Travel and fuel are cash
 * allowances that the guide states are already inside gross pay
 * (Guiding Assumption 1), so they are memo lines only.
 */
export const PAY_BLOCKS: Record<string, PayBlock> = {
  base: {
    code: 'base',
    grossPay: 15135,
    referenceNetPay: 11000,
    referenceDeductions: deductions(757, 151, 3226, 1305),
    referenceEmployerCosts: deductions(757, 151, 0, 1305),
    referenceTotalCompanyCost: 18710,
    referenceHousing: null,
    allowances: [
      {
        code: 'travel',
        label: 'Travel allowance',
        amount: 167,
        treatment: 'included_in_gross',
        taxable: true,
      },
    ],
  },
  branch: {
    code: 'branch',
    grossPay: 19948,
    referenceNetPay: 13000,
    referenceDeductions: deductions(932, 186, 4524, 1305),
    referenceEmployerCosts: deductions(932, 186, 0, 1305),
    referenceTotalCompanyCost: 23733,
    referenceHousing: 2500,
    allowances: [
      {
        code: 'travel',
        label: 'Travel allowance',
        amount: 167,
        treatment: 'included_in_gross',
        taxable: true,
      },
    ],
  },
  districtSenior: {
    code: 'districtSenior',
    grossPay: 23702,
    referenceNetPay: 15000,
    referenceDeductions: deductions(1108, 222, 5822, 1551),
    referenceEmployerCosts: deductions(1108, 222, 0, 1551),
    referenceTotalCompanyCost: 28197,
    referenceHousing: 3000,
    allowances: [
      {
        code: 'travel',
        label: 'Travel allowance',
        amount: 167,
        treatment: 'included_in_gross',
        taxable: true,
      },
    ],
  },
  district: {
    code: 'district',
    grossPay: 26518,
    referenceNetPay: 16500,
    referenceDeductions: deductions(1239, 248, 6796, 1735),
    referenceEmployerCosts: deductions(1239, 248, 0, 1735),
    referenceTotalCompanyCost: 31213,
    referenceHousing: 3000,
    allowances: [
      {
        code: 'travel',
        label: 'Travel allowance',
        amount: 209,
        treatment: 'included_in_gross',
        taxable: true,
      },
    ],
  },
  districtTop: {
    code: 'districtTop',
    grossPay: 30147,
    referenceNetPay: 18500,
    referenceDeductions: deductions(1342, 282, 8051, 1972),
    referenceEmployerCosts: deductions(1342, 282, 0, 1972),
    referenceTotalCompanyCost: 34938,
    referenceHousing: 3000,
    allowances: [
      {
        code: 'travel',
        label: 'Travel allowance',
        amount: 250,
        treatment: 'included_in_gross',
        taxable: true,
      },
    ],
  },
  midManagement: {
    code: 'midManagement',
    grossPay: 32736,
    referenceNetPay: 20000,
    referenceDeductions: deductions(1342, 306, 8946, 2142),
    referenceEmployerCosts: deductions(1342, 306, 0, 2142),
    referenceTotalCompanyCost: 41134,
    referenceHousing: 4500,
    allowances: [
      {
        code: 'travel',
        label: 'Travel allowance',
        amount: 292,
        treatment: 'included_in_gross',
        taxable: true,
      },
    ],
  },
  seniorManagement: {
    code: 'seniorManagement',
    grossPay: 41365,
    referenceNetPay: 25001,
    referenceDeductions: deductions(1342, 467, 11930, 2706),
    referenceEmployerCosts: deductions(1342, 467, 0, 2706),
    referenceTotalCompanyCost: 49844,
    referenceHousing: 4500,
    allowances: [
      {
        code: 'travel',
        label: 'Travel allowance',
        amount: 334,
        treatment: 'included_in_gross',
        taxable: true,
      },
      {
        code: 'fuel',
        label: 'Fuel allowance',
        amount: 2500,
        treatment: 'included_in_gross',
        taxable: true,
      },
      {
        code: 'life_insurance',
        label: 'OneLife life insurance (spouse & child)',
        amount: 1157,
        treatment: 'employer_paid_benefit',
        taxable: false,
      },
    ],
  },
  executive: {
    code: 'executive',
    grossPay: 58560,
    referenceNetPay: 30005,
    referenceDeductions: deductions(1342, 467, 11930, 3271),
    referenceEmployerCosts: deductions(1342, 467, 0, 3271),
    referenceTotalCompanyCost: 54958,
    referenceHousing: 4500,
    allowances: [
      {
        code: 'travel',
        label: 'Travel allowance',
        amount: 375,
        treatment: 'included_in_gross',
        taxable: true,
      },
      {
        code: 'fuel',
        label: 'Fuel allowance',
        amount: 3000,
        treatment: 'included_in_gross',
        taxable: true,
      },
      {
        code: 'life_insurance',
        label: 'OneLife life insurance (spouse, child & parent)',
        amount: 1483,
        treatment: 'employer_paid_benefit',
        taxable: false,
      },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* Managerial housing policy                                                   */
/* -------------------------------------------------------------------------- */

export const HOUSING_BANDS: Record<string, HousingBand> = {
  branch_manager: {
    key: 'branch_manager',
    label: 'Branch Manager',
    byTier: { 1: 3000, 2: 2500, 3: 2000, 4: 1500 },
    notes: [
      'Paid directly to the landlord — non-taxable benefit in kind.',
      'Performance link: the band follows the tier earned through revenue generation.',
      'No cash payout: a cheaper tenancy forfeits the saving.',
    ],
  },
  district_manager: {
    key: 'district_manager',
    label: 'District Manager',
    byTier: { 1: 4500, 2: 4000, 3: 3500, 4: 3000 },
    notes: [
      'Paid directly to the landlord — non-taxable benefit in kind.',
      'Performance link: the band follows the tier earned through revenue generation.',
    ],
  },
  provincial_manager: {
    key: 'provincial_manager',
    label: 'Provincial Manager',
    byTier: { 1: 6000, 2: 5500, 3: 5000, 4: 4500 },
    notes: [
      'Paid directly to the landlord — non-taxable benefit in kind.',
      'Performance link: the band follows the tier earned through revenue generation.',
    ],
  },
  director: {
    key: 'director',
    label: 'Director / Head of Department',
    byTier: { 1: 6500, 2: 6000, 3: 5500, 4: 5000 },
    notes: [
      'Paid directly to the landlord — non-taxable benefit in kind.',
      'Departmental eligibility requires the department to generate sufficient income to cover the cost.',
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* Bonuses and allowances                                                      */
/* -------------------------------------------------------------------------- */

export const BONUS_RULES: BonusRule[] = [
  {
    code: 'provincial_year_end_bonus',
    label: 'Provincial Manager annual bonus',
    amount: 10000,
    period: 'annual',
    appliesToRoleIds: ['provincial_manager'],
    conditions: [
      {
        code: 'provincial_efficiency',
        label: 'Provincial Efficiency ≥ 80%',
        threshold: 80,
        source: 'efficiency-ratio/province/{province_id}',
      },
      {
        code: 'provincial_pdua',
        label: 'PDUA ≥ 80%',
        threshold: 80,
        source: 'portfolio-quality/province/{province_id}',
      },
    ],
    payableOn: 'End of the financial year, on approval of the annual assessment.',
    sourceNote:
      'Provincial Managers managing three or more branches earn an end of year bonus of K10,000 on attaining at least 80% Provincial Efficiency and PDUA.',
  },
  {
    code: 'district_performance_allowance',
    label: 'District Manager performance allowance',
    amount: 8000,
    period: 'annual',
    appliesToRoleIds: ['district_manager'],
    conditions: [
      {
        code: 'branch_efficiency',
        label: 'Branch Efficiency ≥ 80%',
        threshold: 80,
        source: 'efficiency-ratio/district/{district_id}',
      },
      {
        code: 'branch_pdua',
        label: 'PDUA ≥ 80%',
        threshold: 80,
        source: 'portfolio-quality/district/{district_id}',
      },
    ],
    payableOn: 'On approval of the annual assessment for that year.',
    sourceNote:
      'District Managers earn a performance allowance of K8,000 on attaining 80% Branch Efficiency and PDUA for that particular year.',
  },
];

/* -------------------------------------------------------------------------- */
/* Statutory and scheme rules                                                  */
/* -------------------------------------------------------------------------- */

export const STATUTORY_DEFAULTS: StatutoryRules = {
  napsa: {
    label: 'NAPSA',
    employeeRate: 0.05,
    employerRate: 0.1,
    employeeCap: 1342,
  },
  nhima: {
    label: 'NHIMA',
    employeeRate: 0.01,
    employerRate: 0.01,
  },
  pension: {
    label: 'Saturnia pension',
    enabled: true,
    employeeRate: 0.05,
    employerRate: 0.07,
  },
  paye: {
    label: 'PAYE',
    bands: [
      { upTo: 3000, rate: 0 },
      { upTo: 5600, rate: 0.15 },
      { upTo: 8400, rate: 0.2 },
      { upTo: 12000, rate: 0.25 },
      { upTo: 17500, rate: 0.3 },
      { upTo: null, rate: 0.37 },
    ],
    relief: 0,
  },
  medical: {
    label: 'OneLife medical scheme',
    enabled: false,
    monthlyPremium: 658,
  },
};

/* -------------------------------------------------------------------------- */
/* Tier helpers                                                                */
/* -------------------------------------------------------------------------- */

interface TierInput {
  tier: number;
  criterion: string;
  measureKind: TierBand['measureKind'];
  threshold?: number | null;
  upperThreshold?: number | null;
  minScopeCount?: number | null;
  scopeNote?: string | null;
  payBlock: PayBlock;
  housing: number;
  status?: TierStatus;
  sourceNote: string;
  referenceNetPay?: number | null;
}

function makeTier(input: TierInput): TierBand {
  const tier = input.tier;
  return {
    tier,
    label: `Tier ${tier}`,
    seniority:
      tier === 1
        ? 'Most Senior'
        : tier === 2
        ? 'Senior'
        : tier === 3
        ? 'Mid-Level'
        : tier === 4
        ? 'Junior / Entry'
        : tier === 5
        ? 'Entry'
        : 'Base',
    criterion: input.criterion,
    measureKind: input.measureKind,
    threshold: input.threshold ?? null,
    upperThreshold: input.upperThreshold ?? null,
    minScopeCount: input.minScopeCount ?? null,
    scopeNote: input.scopeNote ?? null,
    payBlock: input.payBlock,
    housing: input.housing,
    status: input.status ?? 'approved',
    sourceNote: input.sourceNote,
    referenceNetPay: input.referenceNetPay,
  };
}

/** Housing for the tier from the policy band; tiers 5 and 6 fall back to the printed row. */
function housingFor(bandKey: keyof typeof HOUSING_BANDS, tier: number, payBlock: PayBlock): number {
  const band = HOUSING_BANDS[bandKey];
  if (tier <= 4) return band.byTier[tier] ?? 0;
  return payBlock.referenceHousing ?? 0;
}

const GUIDE = 'Whence Managerial Remuneration Guide';

/* -------------------------------------------------------------------------- */
/* Roles                                                                       */
/* -------------------------------------------------------------------------- */

export const ROLES: RoleDefinition[] = [
  /* ---------------------------- Branch Manager ---------------------------- */
  {
    id: 'branch_manager',
    name: 'Branch Manager',
    category: 'branch',
    positionIds: [5],
    positionNames: ['Branch Manager'],
    measure: {
      kind: 'monthly_revenue',
      label: 'Monthly bank deposits',
      unit: 'ZMW',
      period: 'monthly',
      direction: 'higher_is_better',
      autoSource: 'revenue_achievement',
    },
    housingBand: 'branch_manager',
    bonusRuleCode: null,
    sourceNote: `${GUIDE} §2.1 Branch Managers.`,
    tiers: [
      makeTier({
        tier: 1,
        criterion: 'K20,000+ monthly bank deposits',
        measureKind: 'monthly_revenue',
        threshold: 20000,
        upperThreshold: null,
        minScopeCount: 1,
        scopeNote: 'Own branch',
        payBlock: PAY_BLOCKS.branch,
        housing: housingFor('branch_manager', 1, PAY_BLOCKS.branch),
        sourceNote: `${GUIDE} §2.1 — the only approved Branch Manager band.`,
      }),
      makeTier({
        tier: 2,
        criterion: 'Pending management confirmation',
        measureKind: 'monthly_revenue',
        threshold: null,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.branch,
        housing: housingFor('branch_manager', 2, PAY_BLOCKS.branch),
        status: 'proposed',
        sourceNote:
          'The guide approves a single Branch Manager band. Lower bands must be confirmed by management before they can be applied.',
      }),
      makeTier({
        tier: 3,
        criterion: 'Pending management confirmation',
        measureKind: 'monthly_revenue',
        threshold: null,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.branch,
        housing: housingFor('branch_manager', 3, PAY_BLOCKS.branch),
        status: 'proposed',
        sourceNote:
          'The guide approves a single Branch Manager band. Lower bands must be confirmed by management before they can be applied.',
      }),
      makeTier({
        tier: 4,
        criterion: 'Pending management confirmation',
        measureKind: 'monthly_revenue',
        threshold: null,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.branch,
        housing: housingFor('branch_manager', 4, PAY_BLOCKS.branch),
        status: 'proposed',
        sourceNote:
          'The guide approves a single Branch Manager band. Lower bands must be confirmed by management before they can be applied.',
      }),
    ],
  },

  /* --------------------------- District Manager --------------------------- */
  {
    id: 'district_manager',
    name: 'District Manager',
    category: 'district',
    positionIds: [3, 4],
    positionNames: ['District Regional Manager', 'District Manager'],
    measure: {
      kind: 'monthly_revenue',
      label: 'Monthly revenue target',
      unit: 'ZMW',
      period: 'monthly',
      direction: 'higher_is_better',
      autoSource: 'revenue_achievement',
    },
    housingBand: 'district_manager',
    bonusRuleCode: 'district_performance_allowance',
    sourceNote: `${GUIDE} §2.2 District Managers.`,
    tiers: [
      makeTier({
        tier: 1,
        criterion: '≥ K1,740,942 (3+ branches)',
        measureKind: 'monthly_revenue',
        threshold: 1740942,
        upperThreshold: null,
        minScopeCount: 3,
        scopeNote: '3+ branches',
        payBlock: PAY_BLOCKS.districtTop,
        housing: housingFor('district_manager', 1, PAY_BLOCKS.districtTop),
        sourceNote: `${GUIDE} §2.2 District Manager Tier 1.`,
      }),
      makeTier({
        tier: 2,
        criterion: '≥ K1,160,628 (2 branches)',
        measureKind: 'monthly_revenue',
        threshold: 1160628,
        upperThreshold: 1740942,
        minScopeCount: 2,
        scopeNote: '2 branches',
        payBlock: PAY_BLOCKS.district,
        housing: housingFor('district_manager', 2, PAY_BLOCKS.district),
        sourceNote: `${GUIDE} §2.2 District Manager Tier 2.`,
      }),
      makeTier({
        tier: 3,
        criterion: '≥ K580,314 (1 branch)',
        measureKind: 'monthly_revenue',
        threshold: 580314,
        upperThreshold: 1160628,
        minScopeCount: 1,
        scopeNote: '1 branch',
        payBlock: PAY_BLOCKS.districtSenior,
        housing: housingFor('district_manager', 3, PAY_BLOCKS.districtSenior),
        sourceNote: `${GUIDE} §2.2 District Manager Tier 3.`,
      }),
      makeTier({
        tier: 4,
        criterion: '< K580,314 or acting capacity',
        measureKind: 'monthly_revenue',
        threshold: null,
        upperThreshold: 580314,
        minScopeCount: null,
        scopeNote: 'Entry / acting',
        payBlock: PAY_BLOCKS.base,
        housing: housingFor('district_manager', 4, PAY_BLOCKS.base),
        status: 'proposed',
        sourceNote:
          'The guide sets Tier 4 as entry / acting for every managerial role at the base pay block; the District Manager table stops at Tier 3.',
      }),
    ],
  },

  /* -------------------------- Provincial Manager -------------------------- */
  {
    id: 'provincial_manager',
    name: 'Provincial Manager',
    category: 'province',
    positionIds: [2],
    positionNames: ['Provincial Manager'],
    measure: {
      kind: 'monthly_revenue',
      label: 'Monthly revenue (branch equity)',
      unit: 'ZMW',
      period: 'monthly',
      direction: 'higher_is_better',
      autoSource: 'revenue_achievement',
    },
    housingBand: 'provincial_manager',
    bonusRuleCode: 'provincial_year_end_bonus',
    sourceNote: `${GUIDE} §2.3 Provincial Managers.`,
    tiers: [
      makeTier({
        tier: 1,
        criterion: '≥ K8,704,710 (15+ branches equity)',
        measureKind: 'monthly_revenue',
        threshold: 8704710,
        upperThreshold: null,
        minScopeCount: 15,
        scopeNote: '15+ branches',
        payBlock: PAY_BLOCKS.executive,
        housing: housingFor('provincial_manager', 1, PAY_BLOCKS.executive),
        sourceNote: `${GUIDE} §2.3 Provincial Manager Tier 1.`,
      }),
      makeTier({
        tier: 2,
        criterion: '≥ K5,803,140 (10+ branches equity)',
        measureKind: 'monthly_revenue',
        threshold: 5803140,
        upperThreshold: 8704710,
        minScopeCount: 10,
        scopeNote: '10+ branches',
        payBlock: PAY_BLOCKS.seniorManagement,
        housing: housingFor('provincial_manager', 2, PAY_BLOCKS.seniorManagement),
        sourceNote: `${GUIDE} §2.3 Provincial Manager Tier 2.`,
      }),
      makeTier({
        tier: 3,
        criterion: '≥ K2,901,570 (5+ branches equity)',
        measureKind: 'monthly_revenue',
        threshold: 2901570,
        upperThreshold: 5803140,
        minScopeCount: 5,
        scopeNote: '5+ branches',
        payBlock: PAY_BLOCKS.midManagement,
        housing: housingFor('provincial_manager', 3, PAY_BLOCKS.midManagement),
        sourceNote: `${GUIDE} §2.3 Provincial Manager Tier 3.`,
      }),
      makeTier({
        tier: 4,
        criterion: '< K2,901,570 or acting capacity',
        measureKind: 'monthly_revenue',
        threshold: null,
        upperThreshold: 2901570,
        minScopeCount: null,
        scopeNote: 'Entry / acting',
        payBlock: PAY_BLOCKS.district,
        housing: housingFor('provincial_manager', 4, PAY_BLOCKS.district),
        sourceNote: `${GUIDE} §2.3 Provincial Manager Tier 4.`,
      }),
    ],
  },

  /* ------------------------ Management Accountant ------------------------- */
  {
    id: 'management_accountant',
    name: 'Management Accountant',
    category: 'department_head',
    positionIds: [8],
    positionNames: ['Management Accountant'],
    measure: {
      kind: 'role_scope',
      label: 'Strategic scope',
      unit: 'scope',
      period: 'annual',
      direction: 'higher_is_better',
      autoSource: 'manual',
    },
    housingBand: 'director',
    bonusRuleCode: null,
    sourceNote: `${GUIDE} §2.1 Management Accountant.`,
    tiers: [
      makeTier({
        tier: 1,
        criterion: 'Director of Finance (enterprise leadership)',
        measureKind: 'role_scope',
        threshold: null,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.executive,
        housing: housingFor('director', 1, PAY_BLOCKS.executive),
        status: 'proposed',
        referenceNetPay: 35000,
        sourceNote:
          'The guide prints no gross pay for the Director of Finance tier. Proposed at the executive pay block pending confirmation.',
      }),
      makeTier({
        tier: 2,
        criterion: 'Chief Accountant (optimization & partnership)',
        measureKind: 'role_scope',
        threshold: null,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.executive,
        housing: housingFor('director', 2, PAY_BLOCKS.executive),
        sourceNote: `${GUIDE} §2.1 Management Accountant Tier 2.`,
      }),
      makeTier({
        tier: 3,
        criterion: 'Management Accountant (foundation & systems)',
        measureKind: 'role_scope',
        threshold: null,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.seniorManagement,
        housing: housingFor('director', 3, PAY_BLOCKS.seniorManagement),
        sourceNote: `${GUIDE} §2.1 Management Accountant Tier 3.`,
      }),
      makeTier({
        tier: 4,
        criterion: 'Assistant / acting capacity',
        measureKind: 'role_scope',
        threshold: null,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.midManagement,
        housing: housingFor('director', 4, PAY_BLOCKS.midManagement),
        sourceNote: `${GUIDE} §2.1 Management Accountant Tier 4.`,
      }),
    ],
  },

  /* ------------------------- Manager Administration ----------------------- */
  {
    id: 'manager_administration',
    name: 'Manager Administration',
    category: 'department_head',
    positionIds: [12],
    positionNames: ['Manager Administration'],
    measure: {
      kind: 'annual_value',
      label: 'Annual value preserved or enabled',
      unit: 'ZMW',
      period: 'annual',
      direction: 'higher_is_better',
      autoSource: 'manual',
    },
    housingBand: 'provincial_manager',
    bonusRuleCode: null,
    sourceNote: `${GUIDE} §2.5 Manager Administration.`,
    tiers: [
      makeTier({
        tier: 1,
        criterion: '≥ K15,000,000 preserved / enabled',
        measureKind: 'annual_value',
        threshold: 15000000,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.executive,
        housing: housingFor('provincial_manager', 1, PAY_BLOCKS.executive),
        sourceNote: `${GUIDE} §2.5 Manager Administration Tier 1.`,
      }),
      makeTier({
        tier: 2,
        criterion: '≥ K7,000,000 preserved / enabled',
        measureKind: 'annual_value',
        threshold: 7000000,
        upperThreshold: 15000000,
        payBlock: PAY_BLOCKS.seniorManagement,
        housing: housingFor('provincial_manager', 2, PAY_BLOCKS.seniorManagement),
        sourceNote: `${GUIDE} §2.5 Manager Administration Tier 2.`,
      }),
      makeTier({
        tier: 3,
        criterion: '≥ K3,000,000 preserved / enabled',
        measureKind: 'annual_value',
        threshold: 3000000,
        upperThreshold: 7000000,
        payBlock: PAY_BLOCKS.midManagement,
        housing: housingFor('provincial_manager', 3, PAY_BLOCKS.midManagement),
        sourceNote: `${GUIDE} §2.5 Manager Administration Tier 3.`,
      }),
      makeTier({
        tier: 4,
        criterion: '< K3,000,000 or acting capacity',
        measureKind: 'annual_value',
        threshold: null,
        upperThreshold: 3000000,
        payBlock: PAY_BLOCKS.district,
        housing: housingFor('provincial_manager', 4, PAY_BLOCKS.district),
        sourceNote: `${GUIDE} §2.5 Manager Administration Tier 4.`,
      }),
    ],
  },

  /* ------------------------- Payroll Loans Manager ------------------------ */
  {
    id: 'payroll_loans_manager',
    name: 'Payroll Loans Manager',
    category: 'coordinator',
    positionIds: [10],
    positionNames: ['Payroll Loans Manager'],
    measure: {
      kind: 'monthly_revenue',
      label: 'Monthly revenue benchmark',
      unit: 'ZMW',
      period: 'monthly',
      direction: 'higher_is_better',
      autoSource: 'revenue_achievement',
    },
    housingBand: 'district_manager',
    bonusRuleCode: null,
    sourceNote: `${GUIDE} §3.1 Payroll Loans Manager.`,
    tiers: [
      makeTier({
        tier: 1,
        criterion: '≥ K8,704,710 (Provincial Manager Tier 1 comparable)',
        measureKind: 'monthly_revenue',
        threshold: 8704710,
        upperThreshold: null,
        minScopeCount: 15,
        scopeNote: '15+ branches',
        payBlock: PAY_BLOCKS.executive,
        housing: housingFor('district_manager', 1, PAY_BLOCKS.executive),
        sourceNote: `${GUIDE} §3.1 Tier 1.`,
      }),
      makeTier({
        tier: 2,
        criterion: '≥ K5,803,140 (Provincial Manager Tier 2 comparable)',
        measureKind: 'monthly_revenue',
        threshold: 5803140,
        upperThreshold: 8704710,
        minScopeCount: 10,
        scopeNote: '10+ branches',
        payBlock: PAY_BLOCKS.seniorManagement,
        housing: housingFor('district_manager', 2, PAY_BLOCKS.seniorManagement),
        sourceNote: `${GUIDE} §3.1 Tier 2.`,
      }),
      makeTier({
        tier: 3,
        criterion: '≥ K2,901,570 (Provincial Manager Tier 3 comparable)',
        measureKind: 'monthly_revenue',
        threshold: 2901570,
        upperThreshold: 5803140,
        minScopeCount: 5,
        scopeNote: '5+ branches',
        payBlock: PAY_BLOCKS.midManagement,
        housing: housingFor('district_manager', 3, PAY_BLOCKS.midManagement),
        sourceNote: `${GUIDE} §3.1 Tier 3.`,
      }),
      makeTier({
        tier: 4,
        criterion: '≥ K1,160,628 (District Manager Tier 2 comparable)',
        measureKind: 'monthly_revenue',
        threshold: 1160628,
        upperThreshold: 2901570,
        minScopeCount: 2,
        scopeNote: '2 branches',
        payBlock: PAY_BLOCKS.districtTop,
        housing: housingFor('district_manager', 4, PAY_BLOCKS.districtTop),
        sourceNote: `${GUIDE} §3.1 Tier 4.`,
      }),
      makeTier({
        tier: 5,
        criterion: '≥ K580,314 (Branch Manager Tier 1 comparable)',
        measureKind: 'monthly_revenue',
        threshold: 580314,
        upperThreshold: 1160628,
        minScopeCount: 1,
        scopeNote: '1 branch',
        payBlock: PAY_BLOCKS.branch,
        housing: PAY_BLOCKS.branch.referenceHousing ?? 0,
        sourceNote: `${GUIDE} §3.1 Tier 5.`,
      }),
      makeTier({
        tier: 6,
        criterion: '≥ K40,000 net income (base + bonus)',
        measureKind: 'monthly_net_income',
        threshold: 40000,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.base,
        housing: 0,
        sourceNote: `${GUIDE} §3.1 Tier 6 — measured on net income, not revenue.`,
      }),
    ],
  },

  /* ------------------------- Motor Vehicle Manager ------------------------ */
  {
    id: 'motor_vehicle_manager',
    name: 'Motor Vehicle Manager',
    category: 'coordinator',
    positionIds: [9],
    positionNames: ['Motor Vehicles Manager'],
    measure: {
      kind: 'monthly_revenue',
      label: 'Monthly revenue benchmark',
      unit: 'ZMW',
      period: 'monthly',
      direction: 'higher_is_better',
      autoSource: 'revenue_achievement',
    },
    housingBand: 'district_manager',
    bonusRuleCode: null,
    sourceNote: `${GUIDE} §3.2 Motor Vehicle Manager.`,
    tiers: [
      makeTier({
        tier: 1,
        criterion: '≥ K8,704,710 (Provincial Manager Tier 1 comparable)',
        measureKind: 'monthly_revenue',
        threshold: 8704710,
        upperThreshold: null,
        minScopeCount: 15,
        scopeNote: '15+ branches',
        payBlock: PAY_BLOCKS.executive,
        housing: housingFor('district_manager', 1, PAY_BLOCKS.executive),
        sourceNote: `${GUIDE} §3.2 Tier 1.`,
      }),
      makeTier({
        tier: 2,
        criterion: '≥ K5,803,140 (Provincial Manager Tier 2 comparable)',
        measureKind: 'monthly_revenue',
        threshold: 5803140,
        upperThreshold: 8704710,
        minScopeCount: 10,
        scopeNote: '10+ branches',
        payBlock: PAY_BLOCKS.seniorManagement,
        housing: housingFor('district_manager', 2, PAY_BLOCKS.seniorManagement),
        sourceNote: `${GUIDE} §3.2 Tier 2.`,
      }),
      makeTier({
        tier: 3,
        criterion: '≥ K2,901,570 (Provincial Manager Tier 3 comparable)',
        measureKind: 'monthly_revenue',
        threshold: 2901570,
        upperThreshold: 5803140,
        minScopeCount: 5,
        scopeNote: '5+ branches',
        payBlock: PAY_BLOCKS.midManagement,
        housing: housingFor('district_manager', 3, PAY_BLOCKS.midManagement),
        sourceNote: `${GUIDE} §3.2 Tier 3.`,
      }),
      makeTier({
        tier: 4,
        criterion: '≥ K1,160,628 (District Manager Tier 2 comparable)',
        measureKind: 'monthly_revenue',
        threshold: 1160628,
        upperThreshold: 2901570,
        minScopeCount: 2,
        scopeNote: '2 branches',
        payBlock: PAY_BLOCKS.districtTop,
        housing: housingFor('district_manager', 4, PAY_BLOCKS.districtTop),
        sourceNote: `${GUIDE} §3.2 Tier 4.`,
      }),
      makeTier({
        tier: 5,
        criterion: '≥ K580,314 (Branch Manager Tier 1 comparable)',
        measureKind: 'monthly_revenue',
        threshold: 580314,
        upperThreshold: 1160628,
        minScopeCount: 1,
        scopeNote: '1 branch',
        payBlock: PAY_BLOCKS.branch,
        housing: PAY_BLOCKS.branch.referenceHousing ?? 0,
        sourceNote: `${GUIDE} §3.2 Tier 5.`,
      }),
      makeTier({
        tier: 6,
        criterion: '≥ K40,000 net income (base + bonus)',
        measureKind: 'monthly_net_income',
        threshold: 40000,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.base,
        housing: 0,
        sourceNote: `${GUIDE} §3.2 Tier 6 — measured on net income, not revenue.`,
      }),
    ],
  },

  /* ------------------------------ Risk Manager ---------------------------- */
  {
    id: 'risk_manager',
    name: 'Risk Manager',
    category: 'coordinator',
    positionIds: [7],
    positionNames: ['Risk Manager'],
    measure: {
      kind: 'monthly_revenue',
      label: 'Monthly revenue benchmark',
      unit: 'ZMW',
      period: 'monthly',
      direction: 'higher_is_better',
      autoSource: 'revenue_achievement',
    },
    housingBand: 'district_manager',
    bonusRuleCode: null,
    sourceNote: `${GUIDE} §3.9 Risk Manager.`,
    tiers: [
      makeTier({
        tier: 1,
        criterion: '≥ K8,704,710 (Provincial Manager Tier 1 comparable)',
        measureKind: 'monthly_revenue',
        threshold: 8704710,
        upperThreshold: null,
        minScopeCount: 15,
        scopeNote: '15+ branches',
        payBlock: PAY_BLOCKS.executive,
        housing: housingFor('district_manager', 1, PAY_BLOCKS.executive),
        sourceNote: `${GUIDE} §3.9 Tier 1.`,
      }),
      makeTier({
        tier: 2,
        criterion: '≥ K5,803,140 (Provincial Manager Tier 2 comparable)',
        measureKind: 'monthly_revenue',
        threshold: 5803140,
        upperThreshold: 8704710,
        minScopeCount: 10,
        scopeNote: '10+ branches',
        payBlock: PAY_BLOCKS.seniorManagement,
        housing: housingFor('district_manager', 2, PAY_BLOCKS.seniorManagement),
        sourceNote: `${GUIDE} §3.9 Tier 2.`,
      }),
      makeTier({
        tier: 3,
        criterion: '≥ K2,901,570 (Provincial Manager Tier 3 comparable)',
        measureKind: 'monthly_revenue',
        threshold: 2901570,
        upperThreshold: 5803140,
        minScopeCount: 5,
        scopeNote: '5+ branches',
        payBlock: PAY_BLOCKS.midManagement,
        housing: housingFor('district_manager', 3, PAY_BLOCKS.midManagement),
        sourceNote: `${GUIDE} §3.9 Tier 3.`,
      }),
      makeTier({
        tier: 4,
        criterion: '≥ K1,160,628 (District Manager Tier 2 comparable)',
        measureKind: 'monthly_revenue',
        threshold: 1160628,
        upperThreshold: 2901570,
        minScopeCount: 2,
        scopeNote: '2 branches',
        payBlock: PAY_BLOCKS.districtTop,
        housing: housingFor('district_manager', 4, PAY_BLOCKS.districtTop),
        sourceNote: `${GUIDE} §3.9 Tier 4.`,
      }),
      makeTier({
        tier: 5,
        criterion: '≥ K580,314 (Branch Manager Tier 1 comparable)',
        measureKind: 'monthly_revenue',
        threshold: 580314,
        upperThreshold: 1160628,
        minScopeCount: 1,
        scopeNote: '1 branch',
        payBlock: PAY_BLOCKS.branch,
        housing: PAY_BLOCKS.branch.referenceHousing ?? 0,
        sourceNote: `${GUIDE} §3.9 Tier 5.`,
      }),
      makeTier({
        tier: 6,
        criterion: '≥ K40,000 net income (base + bonus)',
        measureKind: 'monthly_net_income',
        threshold: 40000,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.base,
        housing: 0,
        sourceNote: `${GUIDE} §3.9 Tier 6 — measured on net income, not revenue.`,
      }),
    ],
  },

  /* ----------------------------- Policy Manager --------------------------- */
  {
    id: 'policy_manager',
    name: 'Policy Manager',
    category: 'coordinator',
    positionIds: [11],
    positionNames: ['Policy & Training Manager'],
    measure: {
      kind: 'annual_value',
      label: 'Value protected or enabled (annual)',
      unit: 'ZMW',
      period: 'annual',
      direction: 'higher_is_better',
      autoSource: 'manual',
    },
    housingBand: 'district_manager',
    bonusRuleCode: null,
    sourceNote: `${GUIDE} §3.3 Policy Manager.`,
    tiers: [
      makeTier({
        tier: 1,
        criterion: '≥ K4,000,000 value protected / enabled',
        measureKind: 'annual_value',
        threshold: 4000000,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.districtTop,
        housing: housingFor('district_manager', 1, PAY_BLOCKS.districtTop),
        sourceNote: `${GUIDE} §3.3 Tier 1.`,
      }),
      makeTier({
        tier: 2,
        criterion: '≥ K1,800,000 value protected / enabled',
        measureKind: 'annual_value',
        threshold: 1800000,
        upperThreshold: 4000000,
        payBlock: PAY_BLOCKS.districtSenior,
        housing: housingFor('district_manager', 2, PAY_BLOCKS.districtSenior),
        sourceNote: `${GUIDE} §3.3 Tier 2.`,
      }),
      makeTier({
        tier: 3,
        criterion: '≥ K750,000 value protected / enabled',
        measureKind: 'annual_value',
        threshold: 750000,
        upperThreshold: 1800000,
        payBlock: PAY_BLOCKS.branch,
        housing: housingFor('district_manager', 3, PAY_BLOCKS.branch),
        sourceNote: `${GUIDE} §3.3 Tier 3.`,
      }),
      makeTier({
        tier: 4,
        criterion: '< K750,000 or acting',
        measureKind: 'annual_value',
        threshold: null,
        upperThreshold: 750000,
        payBlock: PAY_BLOCKS.base,
        housing: housingFor('district_manager', 4, PAY_BLOCKS.base),
        sourceNote: `${GUIDE} §3.3 Tier 4.`,
      }),
    ],
  },

  /* -------------------------- Performance Manager ------------------------- */
  {
    id: 'performance_manager',
    name: 'Performance Manager',
    category: 'coordinator',
    positionIds: [17],
    positionNames: ['Performance Operations Administrator (POA)'],
    measure: {
      kind: 'annual_value',
      label: 'Value protected or optimised (annual)',
      unit: 'ZMW',
      period: 'annual',
      direction: 'higher_is_better',
      autoSource: 'manual',
    },
    housingBand: 'district_manager',
    bonusRuleCode: null,
    sourceNote: `${GUIDE} §3.4 Performance Manager.`,
    tiers: [
      makeTier({
        tier: 1,
        criterion: '≥ K2,500,000 value protected / optimised',
        measureKind: 'annual_value',
        threshold: 2500000,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.districtTop,
        housing: housingFor('district_manager', 1, PAY_BLOCKS.districtTop),
        sourceNote: `${GUIDE} §3.4 Tier 1.`,
      }),
      makeTier({
        tier: 2,
        criterion: '≥ K1,200,000 value protected / optimised',
        measureKind: 'annual_value',
        threshold: 1200000,
        upperThreshold: 2500000,
        payBlock: PAY_BLOCKS.district,
        housing: housingFor('district_manager', 2, PAY_BLOCKS.district),
        sourceNote: `${GUIDE} §3.4 Tier 2.`,
      }),
      makeTier({
        tier: 3,
        criterion: '≥ K500,000 value protected / optimised',
        measureKind: 'annual_value',
        threshold: 500000,
        upperThreshold: 1200000,
        payBlock: PAY_BLOCKS.branch,
        housing: housingFor('district_manager', 3, PAY_BLOCKS.branch),
        sourceNote: `${GUIDE} §3.4 Tier 3.`,
      }),
      makeTier({
        tier: 4,
        criterion: '< K500,000 or acting',
        measureKind: 'annual_value',
        threshold: null,
        upperThreshold: 500000,
        payBlock: PAY_BLOCKS.base,
        housing: housingFor('district_manager', 4, PAY_BLOCKS.base),
        sourceNote: `${GUIDE} §3.4 Tier 4.`,
      }),
    ],
  },

  /* --------------------- Personnel / Recruitment Manager ------------------ */
  {
    id: 'personnel_manager',
    name: 'Personnel / Recruitment Manager',
    category: 'coordinator',
    positionIds: [16],
    positionNames: ['General Operations Administrator (GOA)'],
    measure: {
      kind: 'role_scope',
      label: 'Recruitment impact, vacancy impact & operational efficiency',
      unit: 'scope',
      period: 'annual',
      direction: 'higher_is_better',
      autoSource: 'manual',
    },
    housingBand: 'district_manager',
    bonusRuleCode: null,
    sourceNote: `${GUIDE} §3.5 Personnel / Recruitment Manager (GOA).`,
    tiers: [
      makeTier({
        tier: 1,
        criterion: 'Executive leadership, scalability design',
        measureKind: 'role_scope',
        threshold: null,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.districtTop,
        housing: housingFor('district_manager', 1, PAY_BLOCKS.districtTop),
        sourceNote: `${GUIDE} §3.5 Tier 1 — verified by the administrator against evidence.`,
      }),
      makeTier({
        tier: 2,
        criterion: 'Strategic recruitment, vacancy impact',
        measureKind: 'role_scope',
        threshold: null,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.district,
        housing: housingFor('district_manager', 2, PAY_BLOCKS.district),
        sourceNote: `${GUIDE} §3.5 Tier 2 — verified by the administrator against evidence.`,
      }),
      makeTier({
        tier: 3,
        criterion: 'Operational efficiency',
        measureKind: 'role_scope',
        threshold: null,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.branch,
        housing: housingFor('district_manager', 3, PAY_BLOCKS.branch),
        sourceNote: `${GUIDE} §3.5 Tier 3 — verified by the administrator against evidence.`,
      }),
      makeTier({
        tier: 4,
        criterion: 'Entry-level / acting',
        measureKind: 'role_scope',
        threshold: null,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.base,
        housing: housingFor('district_manager', 4, PAY_BLOCKS.base),
        sourceNote: `${GUIDE} §3.5 Tier 4 — verified by the administrator against evidence.`,
      }),
    ],
  },

  /* ------------------------- Recoveries Coordinator ----------------------- */
  {
    id: 'recoveries_coordinator',
    name: 'Recoveries Coordinator',
    category: 'coordinator',
    positionIds: [14],
    positionNames: ['Recoveries Coordinator'],
    measure: {
      kind: 'monthly_net_recovery',
      label: 'Monthly net recovery income',
      unit: 'ZMW',
      period: 'monthly',
      direction: 'higher_is_better',
      autoSource: 'manual',
    },
    housingBand: 'district_manager',
    bonusRuleCode: null,
    sourceNote: `${GUIDE} §3.6 Recoveries Coordinator.`,
    tiers: [
      makeTier({
        tier: 1,
        criterion: 'K580,314+ net recovery (fully self-funded)',
        measureKind: 'monthly_net_recovery',
        threshold: 580314,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.midManagement,
        housing: housingFor('district_manager', 1, PAY_BLOCKS.midManagement),
        sourceNote: `${GUIDE} §3.6 Tier 1.`,
      }),
      makeTier({
        tier: 2,
        criterion: 'K100,000 – K580,314 (fully self-funded)',
        measureKind: 'monthly_net_recovery',
        threshold: 100000,
        upperThreshold: 580314,
        payBlock: PAY_BLOCKS.districtTop,
        housing: housingFor('district_manager', 2, PAY_BLOCKS.districtTop),
        sourceNote: `${GUIDE} §3.6 Tier 2.`,
      }),
      makeTier({
        tier: 3,
        criterion: 'K50,000 – K100,000 (partially funded)',
        measureKind: 'monthly_net_recovery',
        threshold: 50000,
        upperThreshold: 100000,
        payBlock: PAY_BLOCKS.branch,
        housing: housingFor('district_manager', 3, PAY_BLOCKS.branch),
        sourceNote: `${GUIDE} §3.6 Tier 3.`,
      }),
      makeTier({
        tier: 4,
        criterion: '< K50,000 (cost centre)',
        measureKind: 'monthly_net_recovery',
        threshold: null,
        upperThreshold: 50000,
        payBlock: PAY_BLOCKS.base,
        housing: housingFor('district_manager', 4, PAY_BLOCKS.base),
        sourceNote: `${GUIDE} §3.6 Tier 4.`,
      }),
    ],
  },

  /* ----------------------------- IT Coordinator --------------------------- */
  {
    id: 'it_coordinator',
    name: 'IT Coordinator',
    category: 'coordinator',
    positionIds: [15],
    positionNames: ['IT Coordinator'],
    measure: {
      kind: 'system_performance',
      label: 'System performance, uptime & outsourcing criteria',
      unit: 'criteria',
      period: 'monthly',
      direction: 'higher_is_better',
      autoSource: 'manual',
    },
    housingBand: 'district_manager',
    bonusRuleCode: null,
    sourceNote: `${GUIDE} §3.7 IT Coordinator.`,
    tiers: [
      makeTier({
        tier: 1,
        criterion: 'Board-level advisorship, outsourcing ≤ 30%',
        measureKind: 'system_performance',
        threshold: null,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.midManagement,
        housing: housingFor('district_manager', 1, PAY_BLOCKS.midManagement),
        sourceNote: `${GUIDE} §3.7 Tier 1 — verified by the administrator against evidence.`,
      }),
      makeTier({
        tier: 2,
        criterion: 'Uptime ≥ 99.5%, outsourcing ≤ 50%',
        measureKind: 'system_performance',
        threshold: null,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.districtTop,
        housing: housingFor('district_manager', 2, PAY_BLOCKS.districtTop),
        sourceNote: `${GUIDE} §3.7 Tier 2 — verified by the administrator against evidence.`,
      }),
      makeTier({
        tier: 3,
        criterion: 'Uptime ≥ 99%, outsourcing reduced',
        measureKind: 'system_performance',
        threshold: null,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.branch,
        housing: housingFor('district_manager', 3, PAY_BLOCKS.branch),
        sourceNote: `${GUIDE} §3.7 Tier 3 — verified by the administrator against evidence.`,
      }),
      makeTier({
        tier: 4,
        criterion: 'Support / acting capacity',
        measureKind: 'system_performance',
        threshold: null,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.base,
        housing: housingFor('district_manager', 4, PAY_BLOCKS.base),
        sourceNote: `${GUIDE} §3.7 Tier 4 — verified by the administrator against evidence.`,
      }),
    ],
  },

  /* -------------------------- Head of Creative Arts ----------------------- */
  {
    id: 'creative_arts_head',
    name: 'Head of Creative Arts',
    category: 'department_head',
    positionIds: [18],
    positionNames: ['Creative Artwork & Marketing Representative Manager'],
    measure: {
      kind: 'monthly_net_income',
      label: 'Monthly net income',
      unit: 'ZMW',
      period: 'monthly',
      direction: 'higher_is_better',
      autoSource: 'manual',
    },
    housingBand: 'director',
    bonusRuleCode: null,
    sourceNote: `${GUIDE} §3.8 Head of Creative Arts.`,
    tiers: [
      makeTier({
        tier: 1,
        criterion: 'K73,000+ net income (fully self-funded)',
        measureKind: 'monthly_net_income',
        threshold: 73000,
        upperThreshold: null,
        payBlock: PAY_BLOCKS.midManagement,
        housing: housingFor('director', 1, PAY_BLOCKS.midManagement),
        sourceNote: `${GUIDE} §3.8 Tier 1.`,
      }),
      makeTier({
        tier: 2,
        criterion: 'K50,000 – K73,000 (fully self-funded)',
        measureKind: 'monthly_net_income',
        threshold: 50000,
        upperThreshold: 73000,
        payBlock: PAY_BLOCKS.districtTop,
        housing: housingFor('director', 2, PAY_BLOCKS.districtTop),
        sourceNote: `${GUIDE} §3.8 Tier 2.`,
      }),
      makeTier({
        tier: 3,
        criterion: 'K30,000 – K50,000 (progressing)',
        measureKind: 'monthly_net_income',
        threshold: 30000,
        upperThreshold: 50000,
        payBlock: PAY_BLOCKS.branch,
        housing: housingFor('director', 3, PAY_BLOCKS.branch),
        sourceNote: `${GUIDE} §3.8 Tier 3.`,
      }),
      makeTier({
        tier: 4,
        criterion: '< K30,000 (cost centre)',
        measureKind: 'monthly_net_income',
        threshold: null,
        upperThreshold: 30000,
        payBlock: PAY_BLOCKS.base,
        housing: housingFor('director', 4, PAY_BLOCKS.base),
        sourceNote: `${GUIDE} §3.8 Tier 4.`,
      }),
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Policy and process                                                          */
/* -------------------------------------------------------------------------- */

export const INCREMENT_POLICY = {
  heading: 'Key rules on increments',
  principles: [
    'Salary increments are not automatic. They are tied to achieving the KPIs above.',
    'Prior increment policy terms approved by management for the roles in this framework become null and void once the framework is approved.',
  ],
  escalation: [
    {
      stage: 'Month 1',
      rule: 'The manager must admit failure and submit a corrective plan.',
    },
    {
      stage: 'Months 2 & 3',
      rule: 'Monthly progress reports are required while performance is still below threshold.',
    },
    {
      stage: 'Post month 3',
      rule: 'If there is no improvement, the Administration Department can suspend, adjust or revoke the increment.',
    },
  ],
  monitoring:
    'Performance is reviewed monthly and must be verified by internal audit before an increment is confirmed.',
};

export const ALLOWANCE_POLICY = {
  heading: 'Allowances',
  rule:
    'All previously approved allowances granted outside the increment policy framework — including travel, funeral, housing and settlement allowances — remain valid, accessible and enforceable under the same approved terms unless expressly revised or withdrawn through a formal management resolution.',
  scheme: {
    pension: 'Saturnia is a voluntary additional pension scheme. Employee contributes 5%, employer contributes 7%.',
    medical:
      'The OneLife medical scheme is proposed for top management initially, with a minimum premium of K658 per month for the principal member.',
  },
};

export const HOUSING_POLICY = {
  heading: 'Managerial housing policy',
  maximumQuarterlyCost: 321000,
  coverage:
    'Covers 1 Director, 9 Provincial / Department Heads, 20 District / Department Managers and 1 Branch Manager.',
  rules: [
    'The housing band follows the tier earned through revenue generation or value creation.',
    'No cash payout: if cheaper accommodation is chosen, the saving is forfeited.',
    'Departmental eligibility requires the department to generate sufficient income to cover the cost.',
    'A manager who drops to a lower tier keeps the higher tier housing allowance, and the difference between the tier housing amounts is deducted from their salary.',
  ],
};

/**
 * The seven decisions management must confirm before the calculation engine is
 * treated as final (technical requirements §7).
 */
export const CONFIRMATION_CHECKLIST = [
  {
    key: 'performance_measurement',
    title: 'Performance measurement',
    question:
      'Confirm whether each threshold uses actual revenue, net revenue, deposits, collections or another measure, and which system is the official source.',
    status: 'open' as const,
  },
  {
    key: 'tier_qualification',
    title: 'Tier qualification',
    question:
      'Define how overlapping bands, multiple criteria, missed targets and managers responsible for several branches are handled.',
    status: 'open' as const,
  },
  {
    key: 'salary_effective_dates',
    title: 'Salary effective dates',
    question:
      'Confirm when a new tier takes effect, whether changes are prospective or retrospective, and how partial months are handled.',
    status: 'open' as const,
  },
  {
    key: 'statutory_deductions',
    title: 'Statutory deductions',
    question:
      'Confirm the approved payroll tax and contribution rules for the applicable pay period rather than hard-coding sample deduction amounts.',
    status: 'open' as const,
  },
  {
    key: 'housing_and_benefits',
    title: 'Housing and benefits',
    question:
      'Confirm eligibility, actual landlord payments, caps and the salary adjustment rules when a manager drops to a lower tier.',
    status: 'open' as const,
  },
  {
    key: 'bonuses_and_increments',
    title: 'Bonuses and increments',
    question:
      'Define the annual assessment period, evidence, approval workflow, payment date and treatment of managers who only partially meet conditions.',
    status: 'open' as const,
  },
  {
    key: 'approval_and_payroll',
    title: 'Approval and payroll',
    question:
      'Identify who verifies performance, who approves remuneration, and how finalised amounts are transferred into payroll.',
    status: 'open' as const,
  },
];

/* -------------------------------------------------------------------------- */
/* Lookups                                                                     */
/* -------------------------------------------------------------------------- */

export const ROLES_BY_ID: Record<string, RoleDefinition> = ROLES.reduce(
  (acc, role) => {
    acc[role.id] = role;
    return acc;
  },
  {} as Record<string, RoleDefinition>
);

export const BONUS_RULES_BY_CODE: Record<string, BonusRule> = BONUS_RULES.reduce(
  (acc, rule) => {
    acc[rule.code] = rule;
    return acc;
  },
  {} as Record<string, BonusRule>
);

export function getRole(roleId: string): RoleDefinition | null {
  return ROLES_BY_ID[roleId] ?? null;
}

export function getRoleForPosition(positionId: number): RoleDefinition | null {
  return ROLES.find((role) => role.positionIds.includes(positionId)) ?? null;
}

export const POSITION_ROLE_LABELS: Record<number, string> = ROLES.reduce(
  (acc, role) => {
    role.positionIds.forEach((id) => {
      acc[id] = role.name;
    });
    return acc;
  },
  {} as Record<number, string>
);
