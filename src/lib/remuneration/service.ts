/**
 * Application service for the remuneration module.
 *
 * Shared orchestration used by the API routes so that the calculation always
 * runs on the server, against the live registry and the approved structure.
 */

import { calculateRemuneration } from './calculator';
import { currentPeriod } from './format';
import { resolvePerformance } from './performance';
import { buildRegistry, scopeLabel } from './registry';
import { getAdapter } from './store';
import { ROLES_BY_ID, STATUTORY_DEFAULTS } from './structure';
import type {
  ManagerProfile,
  PerformanceMeasure,
  RemunerationComputation,
  StatutoryRules,
} from './types';

export interface PerformanceSubmission {
  value?: number | null;
  manualTier?: number | null;
  overrideReason?: string | null;
  efficiencyScore?: number | null;
  pduaScore?: number | null;
  branchCount?: number | null;
  source?: string;
  measures?: PerformanceMeasure[];
}

export interface ComputationResult {
  computation: RemunerationComputation;
  manager: ManagerProfile;
  scopeLabel: string;
}

export class RemunerationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'RemunerationError';
    this.status = status;
  }
}

function clampRate(value: unknown, fallback: number): number {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num) || num < 0 || num > 1) return fallback;
  return num;
}

/** Applies administrator overrides to the default statutory rules, within safe bounds. */
export function mergeStatutory(override?: Partial<StatutoryRules>): StatutoryRules {
  if (!override) return STATUTORY_DEFAULTS;
  return {
    napsa: {
      ...STATUTORY_DEFAULTS.napsa,
      employeeRate: clampRate(
        override.napsa?.employeeRate,
        STATUTORY_DEFAULTS.napsa.employeeRate
      ),
      employerRate: clampRate(
        override.napsa?.employerRate,
        STATUTORY_DEFAULTS.napsa.employerRate
      ),
    },
    nhima: {
      ...STATUTORY_DEFAULTS.nhima,
      employeeRate: clampRate(
        override.nhima?.employeeRate,
        STATUTORY_DEFAULTS.nhima.employeeRate
      ),
      employerRate: clampRate(
        override.nhima?.employerRate,
        STATUTORY_DEFAULTS.nhima.employerRate
      ),
    },
    pension: {
      ...STATUTORY_DEFAULTS.pension,
      enabled: override.pension?.enabled ?? STATUTORY_DEFAULTS.pension.enabled,
      employeeRate: clampRate(
        override.pension?.employeeRate,
        STATUTORY_DEFAULTS.pension.employeeRate
      ),
      employerRate: clampRate(
        override.pension?.employerRate,
        STATUTORY_DEFAULTS.pension.employerRate
      ),
    },
    paye: {
      ...STATUTORY_DEFAULTS.paye,
      relief:
        typeof override.paye?.relief === 'number' && override.paye.relief >= 0
          ? override.paye.relief
          : STATUTORY_DEFAULTS.paye.relief,
    },
    medical: {
      ...STATUTORY_DEFAULTS.medical,
      enabled: override.medical?.enabled ?? STATUTORY_DEFAULTS.medical.enabled,
      monthlyPremium:
        typeof override.medical?.monthlyPremium === 'number' &&
        override.medical.monthlyPremium >= 0
          ? override.medical.monthlyPremium
          : STATUTORY_DEFAULTS.medical.monthlyPremium,
    },
  };
}

function numericOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

/**
 * Resolves the manager, retrieves the performance results and runs the
 * calculation engine.
 */
export async function computeForManager(options: {
  managerId: string;
  period?: string;
  performance?: PerformanceSubmission;
  statutory?: Partial<StatutoryRules>;
  previousTier?: number | null;
}): Promise<ComputationResult> {
  const period = options.period || currentPeriod();
  const adapter = await getAdapter();
  const registered = await adapter.listProfiles();
  const snapshot = await buildRegistry(registered);
  const manager = snapshot.profiles.find((profile) => profile.id === options.managerId);

  if (!manager) {
    throw new RemunerationError('Manager not found in the registry.', 404);
  }

  const role = ROLES_BY_ID[manager.roleId];
  if (!role) {
    throw new RemunerationError('No remuneration role is linked to this manager.');
  }

  const resolved = await resolvePerformance(manager, role, snapshot.offices, period);
  const submission = options.performance ?? {};

  const performance = {
    ...resolved.input,
    value:
      submission.value === undefined
        ? resolved.input.value
        : numericOrNull(submission.value),
    manualTier:
      submission.manualTier === undefined
        ? resolved.input.manualTier
        : numericOrNull(submission.manualTier),
    overrideReason: submission.overrideReason ?? null,
    efficiencyScore:
      submission.efficiencyScore === undefined
        ? resolved.input.efficiencyScore
        : numericOrNull(submission.efficiencyScore),
    pduaScore:
      submission.pduaScore === undefined
        ? resolved.input.pduaScore
        : numericOrNull(submission.pduaScore),
    branchCount:
      submission.branchCount === undefined
        ? resolved.input.branchCount
        : numericOrNull(submission.branchCount),
    source: submission.source ?? resolved.input.source,
    measures: submission.measures ?? resolved.input.measures,
  };

  const computation = calculateRemuneration({
    manager,
    role,
    performance,
    statutory: mergeStatutory(options.statutory),
    period,
    previousTier:
      options.previousTier === undefined ? manager.previousTier : options.previousTier,
    actor: 'Administrator',
  });

  return { computation, manager, scopeLabel: scopeLabel(manager.scope) };
}
