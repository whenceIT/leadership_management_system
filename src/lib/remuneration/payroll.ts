/**
 * Bridge to the remuneration service.
 *
 * The remuneration service owns the payroll side of the framework: which
 * employee is assigned to which salary package, what that package contains and
 * what it costs the company. This module reads that configuration, runs the
 * service calculation and reconciles the result against the calculation
 * engine, so the statement shows one figure for the assessment and the figure
 * the service will actually pay.
 */

import {
  calculateBackendRemuneration,
  fetchBackendAssignments,
  fetchBackendComponentValues,
  fetchBackendComponents,
  fetchBackendConfigs,
  fetchBackendCriteria,
  fetchBackendHousingBands,
  fetchBackendBonusRules,
  fetchBackendTiers,
  type BackendAssignment,
  type BackendBonusRule,
  type BackendComponent,
  type BackendComponentValue,
  type BackendConfig,
  type BackendCriterion,
  type BackendHousingBand,
  type BackendTier,
} from './backend';
import type {
  ManagerProfile,
  PayrollComponent,
  PayrollFigure,
  PayrollVariance,
  RemunerationComputation,
} from './types';

const round = (value: number) => Math.round(value * 100) / 100;

const formatAmount = (value: number) =>
  `K${value.toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* -------------------------------------------------------------------------- */
/* Service structure                                                            */
/* -------------------------------------------------------------------------- */

export interface ServiceStructure {
  connected: boolean;
  error: string | null;
  tiers: BackendTier[];
  configs: BackendConfig[];
  components: BackendComponent[];
  componentValues: BackendComponentValue[];
  criteria: BackendCriterion[];
  housingBands: BackendHousingBand[];
  bonusRules: BackendBonusRule[];
  counts: {
    tiers: number;
    configs: number;
    activeConfigs: number;
    components: number;
    componentValues: number;
    criteria: number;
    housingBands: number;
    bonusRules: number;
  };
}

const EMPTY_STRUCTURE: ServiceStructure = {
  connected: false,
  error: null,
  tiers: [],
  configs: [],
  components: [],
  componentValues: [],
  criteria: [],
  housingBands: [],
  bonusRules: [],
  counts: {
    tiers: 0,
    configs: 0,
    activeConfigs: 0,
    components: 0,
    componentValues: 0,
    criteria: 0,
    housingBands: 0,
    bonusRules: 0,
  },
};

/** Reads the whole remuneration configuration from the service. */
export async function loadServiceStructure(): Promise<ServiceStructure> {
  const [tiers, configs, components, values, criteria, bands, bonuses] =
    await Promise.all([
      fetchBackendTiers(),
      fetchBackendConfigs(),
      fetchBackendComponents(),
      fetchBackendComponentValues(),
      fetchBackendCriteria(),
      fetchBackendHousingBands(),
      fetchBackendBonusRules(),
    ]);

  const connected = tiers.ok;
  const structure: ServiceStructure = {
    connected,
    error: tiers.error,
    tiers: tiers.data ?? [],
    configs: configs.data ?? [],
    components: components.data ?? [],
    componentValues: values.data ?? [],
    criteria: criteria.data ?? [],
    housingBands: bands.data ?? [],
    bonusRules: bonuses.data ?? [],
    counts: {
      tiers: (tiers.data ?? []).length,
      configs: (configs.data ?? []).length,
      activeConfigs: (configs.data ?? []).filter(
        (config) => config.status === 'active'
      ).length,
      components: (components.data ?? []).length,
      componentValues: (values.data ?? []).length,
      criteria: (criteria.data ?? []).length,
      housingBands: (bands.data ?? []).length,
      bonusRules: (bonuses.data ?? []).length,
    },
  };

  return structure;
}

/* -------------------------------------------------------------------------- */
/* Assignments                                                                  */
/* -------------------------------------------------------------------------- */

export interface ServiceAssignment {
  assignment: BackendAssignment;
  config: BackendConfig | null;
  tier: BackendTier | null;
}

/** Every assignment held by the remuneration service, keyed by the employee. */
export async function loadServiceAssignments(
  structure?: ServiceStructure
): Promise<Map<number, ServiceAssignment>> {
  const map = new Map<number, ServiceAssignment>();
  const response = await fetchBackendAssignments();
  if (!response.ok || !response.data) return map;

  const configs = structure?.configs ?? (await fetchBackendConfigs()).data ?? [];
  const tiers = structure?.tiers ?? (await fetchBackendTiers()).data ?? [];

  response.data.forEach((assignment) => {
    const config = configs.find(
      (entry) => entry.id === assignment.remuneration_config_id
    ) ?? null;
    const tier = config
      ? tiers.find((entry) => entry.id === config.remuneration_tier_id) ?? null
      : null;
    map.set(assignment.user_id, { assignment, config, tier });
  });

  return map;
}

/** The service assignment for a manager, when the manager has one. */
export async function findServiceAssignment(
  manager: ManagerProfile,
  assignments?: Map<number, ServiceAssignment>
): Promise<ServiceAssignment | null> {
  if (manager.userId === null) return null;
  const map = assignments ?? (await loadServiceAssignments());
  return map.get(manager.userId) ?? null;
}

/**
 * The configuration a manager is paid from: the package for the position at
 * the given tier, falling back to the entry band of the position.
 */
export function resolveServiceConfig(
  structure: ServiceStructure,
  positionId: number,
  tierNumber?: number | null
): BackendConfig | null {
  const forPosition = structure.configs.filter(
    (config) =>
      config.job_position_id === positionId && config.status === 'active'
  );
  if (forPosition.length === 0) return null;

  if (tierNumber) {
    const exact = forPosition.find((config) => {
      const tier = structure.tiers.find(
        (entry) => entry.id === config.remuneration_tier_id
      );
      return tier?.tier_number === tierNumber;
    });
    if (exact) return exact;
  }

  const tierNumberOf = (config: BackendConfig) =>
    structure.tiers.find((entry) => entry.id === config.remuneration_tier_id)
      ?.tier_number ?? 0;

  return [...forPosition].sort((a, b) => tierNumberOf(b) - tierNumberOf(a))[0];
}

/* -------------------------------------------------------------------------- */
/* Calculation                                                                  */
/* -------------------------------------------------------------------------- */

/** Runs the remuneration service calculation for a manager and period. */
export async function runServiceCalculation(
  manager: ManagerProfile,
  period: string,
  assignments?: Map<number, ServiceAssignment>
): Promise<PayrollFigure | null> {
  const entry = await findServiceAssignment(manager, assignments);
  if (!entry) return null;

  const response = await calculateBackendRemuneration(
    entry.assignment.id,
    period
  );
  if (!response.ok || !response.data) return null;

  const result = response.data;
  const components: PayrollComponent[] = result.components.map((component) => ({
    code: component.code,
    name: component.name,
    componentType: component.component_type,
    paidBy: component.paid_by,
    calculationType: component.calculation_type,
    amount: round(component.amount),
    includedInGross: component.is_included_in_gross === 1,
    includedInCompanyCost: component.is_included_in_company_cost === 1,
  }));

  return {
    source: 'remuneration-service',
    assignmentId: entry.assignment.id,
    assignmentStatus: entry.assignment.approval_status,
    packageTier: entry.tier?.tier_number ?? result.tier_number ?? null,
    packageLabel: entry.tier?.name ?? result.tier ?? null,
    positionLabel: result.position ?? entry.assignment.position_name,
    grossPay: round(result.gross_pay),
    employeeDeductions: round(result.employee_deductions),
    netCashPay: round(result.net_cash_pay),
    housing: round(result.housing_allowance),
    totalDirectValue: round(result.total_direct_value),
    employerContributions: round(result.employer_contributions),
    totalCompanyCost: round(result.total_monthly_cost_to_company),
    components,
    period,
    note: null,
  };
}

/** Reconciles the engine figure against the remuneration service figure. */
export function reconcilePayroll(
  computation: RemunerationComputation,
  payroll: PayrollFigure | null
): PayrollVariance | null {
  if (!payroll) return null;

  const grossPay = round(payroll.grossPay - computation.grossPay);
  const netCashPay = round(payroll.netCashPay - computation.netCashPay);
  const totalCompanyCost = round(
    payroll.totalCompanyCost - computation.totalCompanyCost
  );
  const netCashPayPct =
    computation.netCashPay > 0
      ? round((netCashPay / computation.netCashPay) * 100)
      : null;
  const totalCompanyCostPct =
    computation.totalCompanyCost > 0
      ? round((totalCompanyCost / computation.totalCompanyCost) * 100)
      : null;

  const qualifiedTier = computation.qualification.tier;
  /* An unqualified assessment does not match any package: the service package
   * is still on its own tier, which is not what the engine confirmed. */
  const packageMatchesTier =
    qualifiedTier !== null &&
    payroll.packageTier !== null &&
    payroll.packageTier === qualifiedTier;

  const notes: string[] = [];
  if (qualifiedTier === null) {
    notes.push(
      'The assessment did not qualify a tier, so the engine figure is nil and cannot be reconciled with the remuneration service package.'
    );
  } else if (!packageMatchesTier) {
    notes.push(
      `The remuneration service assignment still points at the ${payroll.packageLabel ?? 'assigned'} package while the assessment qualified the manager at Tier ${qualifiedTier}.`
    );
  }
  if (netCashPayPct !== null && Math.abs(netCashPayPct) > 5) {
    notes.push(
      `Net cash pay differs from the engine figure by ${netCashPayPct > 0 ? '+' : ''}${netCashPayPct}%.`
    );
  }
  if (payroll.assignmentStatus && payroll.assignmentStatus !== 'approved') {
    notes.push(
      `The remuneration service assignment is ${payroll.assignmentStatus} and has not been approved for payroll.`
    );
  }

  /* The service counts the housing allowance inside the employer contributions
   * and again on the housing line, so its company cost carries the housing
   * twice. The engine counts it once — the difference is called out so the two
   * figures reconcile. */
  const housingInEmployerContributions = round(
    payroll.components
      .filter(
        (component) =>
          component.paidBy === 'employer' &&
          (component.code === 'housing' ||
            component.name.toLowerCase().includes('housing'))
      )
      .reduce((total, component) => total + component.amount, 0)
  );

  if (
    housingInEmployerContributions > 0 &&
    Math.abs(totalCompanyCost - housingInEmployerContributions) < 1
  ) {
    notes.push(
      `The remuneration service includes the housing allowance in both the employer contributions and the housing line, so its total company cost is ${formatAmount(
        housingInEmployerContributions
      )} higher than the engine figure, which counts the housing once.`
    );
  }

  return {
    grossPay,
    netCashPay,
    totalCompanyCost,
    netCashPayPct,
    totalCompanyCostPct,
    packageMatchesTier,
    note: notes.join(' '),
  };
}
