/**
 * Managerial remuneration calculation engine.
 *
 * Rules applied (technical requirements §3):
 *  - Tier qualification compares verified performance with the role thresholds.
 *  - Gross pay loads the approved gross salary for the tier and pay period.
 *  - Employee deductions are PAYE, NAPSA, NHIMA and the pension contribution.
 *  - Net cash pay = gross pay − employee deductions (+ eligible cash additions).
 *  - Housing benefit applies the tier housing limit and the approved landlord payment.
 *  - Total monthly company cost = gross pay + employer statutory contributions
 *    + employer pension contributions + housing payment + employer paid benefits.
 *
 * Allowances that the guide already includes in gross pay are never added twice.
 */

import type {
  BonusAssessment,
  DeductionBreakdown,
  HousingAssessment,
  ManagerProfile,
  PerformanceInput,
  QualificationBasis,
  RemunerationComputation,
  RoleDefinition,
  StatutoryRules,
  TierBand,
  TierQualification,
  ValidationFlag,
} from './types';
import { BONUS_RULES_BY_CODE } from './structure';

export interface CalculationInput {
  manager: ManagerProfile;
  role: RoleDefinition;
  performance: PerformanceInput;
  statutory: StatutoryRules;
  period: string;
  /** Tier earned in the previous pay period, used for the housing continuity rule. */
  previousTier?: number | null;
  actor?: string;
}

const round = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

/* -------------------------------------------------------------------------- */
/* Statutory calculations                                                      */
/* -------------------------------------------------------------------------- */

export function computePaye(grossPay: number, rules: StatutoryRules): number {
  if (grossPay <= 0) return 0;
  let tax = 0;
  let lower = 0;
  for (const band of rules.paye.bands) {
    if (band.upTo === null) {
      tax += (grossPay - lower) * band.rate;
      break;
    }
    if (grossPay <= band.upTo) {
      tax += (grossPay - lower) * band.rate;
      lower = band.upTo;
      break;
    }
    tax += (band.upTo - lower) * band.rate;
    lower = band.upTo;
  }
  return round(Math.max(0, tax - rules.paye.relief));
}

export function computeStatutory(
  grossPay: number,
  rules: StatutoryRules
): { employee: DeductionBreakdown; employer: DeductionBreakdown } {
  const paye = computePaye(grossPay, rules);
  const napsaRaw = grossPay * rules.napsa.employeeRate;
  const napsa =
    rules.napsa.employeeCap !== null
      ? Math.min(napsaRaw, rules.napsa.employeeCap)
      : napsaRaw;
  const nhima = grossPay * rules.nhima.employeeRate;
  const pension = rules.pension.enabled ? grossPay * rules.pension.employeeRate : 0;

  const employerNapsa = grossPay * rules.napsa.employerRate;
  const employerNhima = grossPay * rules.nhima.employerRate;
  const employerPension = rules.pension.enabled ? grossPay * rules.pension.employerRate : 0;

  return {
    employee: {
      napsa: round(napsa),
      nhima: round(nhima),
      paye,
      pension: round(pension),
      total: round(napsa + nhima + paye + pension),
    },
    employer: {
      napsa: round(employerNapsa),
      nhima: round(employerNhima),
      paye: 0,
      pension: round(employerPension),
      total: round(employerNapsa + employerNhima + employerPension),
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Tier qualification                                                          */
/* -------------------------------------------------------------------------- */

function tierByNumber(role: RoleDefinition, tier: number): TierBand | null {
  return role.tiers.find((t) => t.tier === tier) ?? null;
}

export function qualifyTier(
  role: RoleDefinition,
  performance: PerformanceInput,
  previousTier: number | null | undefined,
  flags: ValidationFlag[] = []
): TierQualification {
  const evaluated: TierQualification['evaluatedTiers'] = [];

  /* ---------------------------- Manual override ---------------------------- */
  if (performance.manualTier !== null && performance.manualTier !== undefined) {
    const tier = tierByNumber(role, performance.manualTier);
    if (!tier) {
      flags.push({
        code: 'invalid_manual_tier',
        severity: 'error',
        message: `The selected tier (Tier ${performance.manualTier}) does not exist for the ${role.name} role.`,
      });
      return {
        tier: null,
        label: '—',
        seniority: '—',
        criterion: '—',
        basis: 'unqualified',
        reason: 'The selected override tier is not part of the approved structure.',
        achievementPct: null,
        status: 'proposed',
        nextTier: null,
        evaluatedTiers: [],
      };
    }
    return {
      tier: tier.tier,
      label: tier.label,
      seniority: tier.seniority,
      criterion: tier.criterion,
      basis: 'manual_override',
      reason:
        performance.overrideReason?.trim() ||
        'Tier assigned manually by the administrator against the approved criteria.',
      achievementPct: null,
      status: tier.status,
      nextTier: null,
      evaluatedTiers: evaluated,
    };
  }

  /* --------------------------- Threshold matching -------------------------- */
  const value = performance.value;
  const branchCount = performance.branchCount;

  if (value === null || value === undefined || Number.isNaN(value)) {
    flags.push({
      code: 'performance_missing',
      severity: 'error',
      message:
        'No performance result was supplied, so the qualifying tier could not be determined automatically.',
    });
    const scoped = role.tiers.find((t) => t.minScopeCount === null && t.threshold === null);
    return {
      tier: null,
      label: '—',
      seniority: '—',
      criterion: scoped?.criterion ?? role.measure.label,
      basis: 'scope',
      reason:
        'Awaiting a verified performance result. The administrator must confirm the tier against the approved criteria.',
      achievementPct: null,
      status: 'proposed',
      nextTier: null,
      evaluatedTiers: role.tiers.map((t) => ({
        tier: t.tier,
        label: t.label,
        criterion: t.criterion,
        matched: false,
        reason: 'Not evaluated — no performance result supplied.',
      })),
    };
  }

  let matched: TierBand | null = null;
  let matchReason = '';
  let achievementPct: number | null = null;

  for (const tier of role.tiers) {
    const base = {
      tier: tier.tier,
      label: tier.label,
      criterion: tier.criterion,
    };

    if (tier.measureKind !== role.measure.kind) {
      evaluated.push({
        ...base,
        matched: false,
        reason: 'This band is measured on a different basis and must be verified manually.',
      });
      continue;
    }

    if (tier.threshold === null && tier.upperThreshold === null) {
      evaluated.push({
        ...base,
        matched: false,
        reason:
          tier.status === 'proposed'
            ? 'Band not yet defined by management.'
            : 'Band is assessed on scope and evidence rather than a numeric threshold.',
      });
      continue;
    }

    const aboveLower = tier.threshold === null ? true : value >= tier.threshold;
    const belowUpper =
      tier.upperThreshold === null ? true : value < tier.upperThreshold;

    if (!aboveLower || !belowUpper) {
      const shortfall =
        tier.threshold !== null && value < tier.threshold
          ? tier.threshold - value
          : null;
      evaluated.push({
        ...base,
        matched: false,
        reason:
          shortfall !== null
            ? `Result is K${round(shortfall).toLocaleString('en-ZM')} short of this band.`
            : `Result is above this band (it qualifies for a higher tier).`,
      });
      continue;
    }

    if (tier.minScopeCount !== null && branchCount !== null && branchCount !== undefined) {
      if (branchCount < tier.minScopeCount) {
        evaluated.push({
          ...base,
          matched: false,
          reason: `Requires ${tier.minScopeCount}+ branches in scope; ${branchCount} in scope.`,
        });
        continue;
      }
    }

    matched = tier;
    matchReason =
      tier.threshold !== null
        ? `Result of K${round(value).toLocaleString('en-ZM')} meets ${tier.criterion}.`
        : `Result of K${round(value).toLocaleString('en-ZM')} falls within ${tier.criterion}.`;
    achievementPct =
      tier.threshold && tier.threshold > 0 ? round((value / tier.threshold) * 100) : null;
    evaluated.push({ ...base, matched: true, reason: matchReason });
    break;
  }

  if (!matched) {
    const nextUp = role.tiers.find(
      (t) => t.threshold !== null && value < t.threshold && t.measureKind === role.measure.kind
    );
    flags.push({
      code: 'tier_unqualified',
      severity: 'error',
      message: nextUp
        ? `The result does not reach ${nextUp.criterion}. Escalate to management before paying.`
        : 'The result does not match any approved band. Escalate to management before paying.',
    });
    return {
      tier: null,
      label: '—',
      seniority: '—',
      criterion: nextUp?.criterion ?? role.measure.label,
      basis: 'unqualified',
      reason: 'No approved band matches the verified result.',
      achievementPct: null,
      status: 'proposed',
      nextTier: nextUp
        ? {
            tier: nextUp.tier,
            label: nextUp.label,
            criterion: nextUp.criterion,
            shortfall: round(nextUp.threshold! - value),
          }
        : null,
      evaluatedTiers: evaluated,
    };
  }

  const basis: QualificationBasis = 'threshold';

  if (matched.status === 'proposed') {
    flags.push({
      code: 'tier_proposed',
      severity: 'warning',
      message: `${matched.label} is a proposed band pending management confirmation.`,
    });
  }

  if (previousTier !== null && previousTier !== undefined && previousTier < matched.tier) {
    flags.push({
      code: 'tier_drop',
      severity: 'info',
      message: `The manager previously qualified at ${tierByNumber(role, previousTier)?.label ?? `Tier ${previousTier}`}. The housing continuity rule applies.`,
    });
  }

  return {
    tier: matched.tier,
    label: matched.label,
    seniority: matched.seniority,
    criterion: matched.criterion,
    basis,
    reason: matchReason,
    achievementPct,
    status: matched.status,
    nextTier: null,
    evaluatedTiers: evaluated,
  };
}

/* -------------------------------------------------------------------------- */
/* Housing                                                                      */
/* -------------------------------------------------------------------------- */

export function assessHousing(
  role: RoleDefinition,
  tier: TierBand | null,
  previousTier: number | null | undefined
): HousingAssessment {
  const bandKey = role.housingBand;
  const bandLabel = role.name;
  if (!tier) {
    return {
      band: bandKey,
      bandLabel,
      tierHousing: 0,
      paidHousing: 0,
      continuityAdjustment: 0,
      continuityApplied: false,
      note: 'No housing allowance applies until a tier is confirmed.',
    };
  }

  const tierHousing = tier.housing;
  let paidHousing = tierHousing;
  let continuityAdjustment = 0;
  let continuityApplied = false;
  let note = `Housing paid directly to the landlord at the ${tier.label} limit of K${tierHousing.toLocaleString('en-ZM')}.`;

  if (previousTier !== null && previousTier !== undefined && previousTier < tier.tier) {
    const previousTierBand = tierByNumber(role, previousTier);
    const previousHousing = previousTierBand?.housing ?? 0;
    if (previousHousing > tierHousing) {
      paidHousing = previousHousing;
      continuityAdjustment = round(previousHousing - tierHousing);
      continuityApplied = true;
      note = `Housing retained at the higher tier limit of K${previousHousing.toLocaleString('en-ZM')}; the K${continuityAdjustment.toLocaleString('en-ZM')} difference is deducted from salary.`;
    }
  }

  return {
    band: bandKey,
    bandLabel,
    tierHousing,
    paidHousing,
    continuityAdjustment,
    continuityApplied,
    note,
  };
}

/* -------------------------------------------------------------------------- */
/* Bonus and allowances                                                         */
/* -------------------------------------------------------------------------- */

export function assessBonus(
  role: RoleDefinition,
  performance: PerformanceInput
): BonusAssessment {
  const rule = role.bonusRuleCode ? BONUS_RULES_BY_CODE[role.bonusRuleCode] : null;
  if (!rule) {
    return {
      ruleCode: null,
      label: null,
      amount: 0,
      eligible: false,
      reason: 'No annual bonus rule applies to this role.',
      conditions: [],
      payableOn: null,
    };
  }

  const conditions: BonusAssessment['conditions'] = rule.conditions.map((condition) => {
    const value =
      condition.code.endsWith('efficiency')
        ? performance.efficiencyScore
        : performance.pduaScore;
    return {
      code: condition.code,
      label: condition.label,
      value: value ?? null,
      threshold: condition.threshold,
      met: value !== null && value !== undefined && value >= condition.threshold,
    };
  });

  if (rule.code === 'provincial_year_end_bonus') {
    const branchCount = performance.branchCount;
    conditions.push({
      code: 'branch_scope',
      label: 'Manages three or more branches',
      value: branchCount ?? null,
      threshold: 3,
      met: branchCount !== null && branchCount !== undefined && branchCount >= 3,
    });
  }

  const allMet = conditions.every((c) => c.met);
  const reason = allMet
    ? `All bonus conditions are met. ${rule.amount.toLocaleString('en-ZM')} is accrued as an annual award.`
    : `Not yet eligible — ${conditions
        .filter((c) => !c.met)
        .map((c) => c.label)
        .join(', ')} outstanding.`;

  return {
    ruleCode: rule.code,
    label: rule.label,
    amount: allMet ? rule.amount : 0,
    eligible: allMet,
    reason,
    conditions,
    payableOn: rule.payableOn,
  };
}

/* -------------------------------------------------------------------------- */
/* Full computation                                                             */
/* -------------------------------------------------------------------------- */

export function calculateRemuneration(input: CalculationInput): RemunerationComputation {
  const { manager, role, performance, statutory, period } = input;
  const previousTier = input.previousTier ?? manager.previousTier ?? null;
  const flags: ValidationFlag[] = [];

  const qualification = qualifyTier(role, performance, previousTier, flags);

  const tier = qualification.tier !== null ? tierByNumber(role, qualification.tier) : null;

  const housing = assessHousing(role, tier, previousTier);

  const approvedGross = tier?.payBlock.grossPay ?? 0;
  const adjustedGross = round(Math.max(0, approvedGross - housing.continuityAdjustment));

  const statutoryResult = computeStatutory(adjustedGross, statutory);

  const netCashPay = round(adjustedGross - statutoryResult.employee.total);

  const memoAllowances = tier?.payBlock.allowances ?? [];
  const travel = memoAllowances
    .filter((a) => a.code === 'travel')
    .reduce((sum, a) => sum + a.amount, 0);
  const fuel = memoAllowances
    .filter((a) => a.code === 'fuel')
    .reduce((sum, a) => sum + a.amount, 0);
  const lifeInsurance = memoAllowances
    .filter((a) => a.code === 'life_insurance')
    .reduce((sum, a) => sum + a.amount, 0);
  const medical = statutory.medical.enabled ? statutory.medical.monthlyPremium : 0;

  const benefitsTotal = round(housing.paidHousing + lifeInsurance + medical);
  const includedInGross = round(travel + fuel);

  const totalDirectValue = round(netCashPay + housing.paidHousing);

  const totalCompanyCost = round(
    adjustedGross +
      statutoryResult.employer.total +
      housing.paidHousing +
      lifeInsurance +
      medical
  );

  const bonus = assessBonus(role, performance);

  /* ------------------------------- Validation ------------------------------ */
  if (performance.value === null && performance.manualTier === null) {
    flags.push({
      code: 'performance_missing',
      severity: 'error',
      message: 'Performance data is missing — the calculation cannot be finalised.',
    });
  }
  if (manager.acting) {
    flags.push({
      code: 'acting_manager',
      severity: 'info',
      message: 'The manager is acting. Apply the acting or junior-tier rules from the guide.',
    });
  }
  if (housing.continuityApplied) {
    flags.push({
      code: 'housing_continuity',
      severity: 'info',
      message: housing.note,
    });
  }
  if (bonus.ruleCode) {
    flags.push({
      code: bonus.eligible ? 'bonus_eligible' : 'bonus_pending',
      severity: bonus.eligible ? 'info' : 'warning',
      message: bonus.reason,
    });
  }
  if (performance.source === 'manual' && performance.value !== null) {
    flags.push({
      code: 'manual_measure',
      severity: 'warning',
      message:
        'The performance result was entered manually. Internal audit must verify it before payroll.',
    });
  }

  const referenceNetPay = tier?.referenceNetPay ?? tier?.payBlock.referenceNetPay ?? null;
  const referenceTotalCost = tier?.payBlock.referenceTotalCompanyCost ?? null;
  const netVariance = referenceNetPay !== null ? round(netCashPay - referenceNetPay) : null;
  const netVariancePct =
    referenceNetPay !== null && referenceNetPay > 0
      ? round((netVariance! / referenceNetPay) * 100)
      : null;
  const costVariance =
    referenceTotalCost !== null ? round(totalCompanyCost - referenceTotalCost) : null;
  const costVariancePct =
    referenceTotalCost !== null && referenceTotalCost > 0
      ? round((costVariance! / referenceTotalCost) * 100)
      : null;

  if (netVariancePct !== null && Math.abs(netVariancePct) > 5) {
    flags.push({
      code: 'reference_variance_net',
      severity: 'info',
      message: `Net cash pay is ${netVariancePct > 0 ? 'above' : 'below'} the guide's illustrative figure by ${Math.abs(netVariancePct)}% because statutory rules are applied rather than the sample amounts.`,
    });
  }
  if (costVariancePct !== null && Math.abs(costVariancePct) > 5) {
    flags.push({
      code: 'reference_variance_cost',
      severity: 'info',
      message: `Total company cost differs from the guide's illustrative figure by ${costVariancePct > 0 ? '+' : ''}${costVariancePct}%.`,
    });
  }

  return {
    managerId: manager.id,
    managerName: manager.fullName,
    roleId: role.id,
    roleName: role.name,
    period,
    qualification,
    grossPay: adjustedGross,
    approvedGrossPay: approvedGross,
    deductions: statutoryResult.employee,
    netCashPay,
    benefits: {
      housing: housing.paidHousing,
      travel,
      fuel,
      lifeInsurance,
      medical,
      total: benefitsTotal,
      includedInGross,
    },
    totalDirectValue,
    employerCosts: statutoryResult.employer,
    totalCompanyCost,
    bonus,
    housing,
    reference: {
      netPay: referenceNetPay,
      totalCompanyCost: referenceTotalCost,
      netVariance,
      netVariancePct,
      costVariance,
      costVariancePct,
    },
    flags,
    generatedAt: new Date().toISOString(),
  };
}
