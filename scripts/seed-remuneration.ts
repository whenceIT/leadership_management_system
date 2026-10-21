/**
 * Seeds the remuneration service with the approved remuneration structure.
 *
 * The remuneration service (`smart-backend`) is the system of record for the
 * remuneration configuration. This script publishes the structure transcribed
 * from the Whence Managerial Remuneration Guide into it, so that the module
 * reads, displays and edits the configuration through the service API.
 *
 * Usage:
 *   npx tsx scripts/seed-remuneration.ts              # only creates what is missing
 *   npx tsx scripts/seed-remuneration.ts --reset      # clears the service data first
 *
 * Environment:
 *   REMUNERATION_API_URL  default http://localhost:5000/api/remuneration
 */

import {
  BONUS_RULES_BY_CODE,
  HOUSING_BANDS,
  ROLES,
  STATUTORY_DEFAULTS,
} from '../src/lib/remuneration/structure';
import { computePaye } from '../src/lib/remuneration/calculator';
import {
  createBackendAssignment,
  createBackendBonusRule,
  upsertBackendComponentValue,
} from '../src/lib/remuneration/backend';

void createBackendBonusRule;
void upsertBackendComponentValue;

/* -------------------------------------------------------------------------- */
/* Direct API calls (the adapter in src/lib covers the rest)                   */
/* -------------------------------------------------------------------------- */

const BASE =
  process.env.REMUNERATION_API_URL || 'http://localhost:5000/api/remuneration';

const reset = process.argv.includes('--reset');

async function api<T>(
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; data: T | null; error: string | null }> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    return {
      ok: false,
      data: null,
      error: payload?.error ?? payload?.message ?? `HTTP ${response.status}`,
    };
  }
  return { ok: true, data: (payload?.data ?? null) as T | null, error: null };
}

const post = <T>(path: string, body: unknown) =>
  api<T>(path, { method: 'POST', body: JSON.stringify(body) });

const put = <T>(path: string, body: unknown) =>
  api<T>(path, { method: 'PUT', body: JSON.stringify(body) });

/* -------------------------------------------------------------------------- */
/* Tiers                                                                        */
/* -------------------------------------------------------------------------- */

const TIER_LABELS: Record<number, { name: string; description: string }> = {
  1: { name: 'Most Senior', description: 'Highest revenue responsibility' },
  2: { name: 'Senior', description: 'High revenue responsibility' },
  3: { name: 'Mid-Level', description: 'Medium revenue responsibility' },
  4: { name: 'Junior / Entry', description: 'Entry managerial responsibility, acting capacity or coordinator' },
  5: { name: 'Entry', description: 'Entry level managerial band' },
  6: { name: 'Base', description: 'Base band with bonus, no tiered allowance' },
};

async function seedTiers(): Promise<Map<number, number>> {
  const existing = await api<{ id: number; tier_number: number }[]>('/tiers');
  const map = new Map<number, number>();
  (existing.data ?? []).forEach((tier) => map.set(tier.tier_number, tier.id));

  for (const [number, meta] of Object.entries(TIER_LABELS)) {
    const tierNumber = Number(number);
    if (map.has(tierNumber)) continue;
    const created = await post<{ id: number }>('/tiers', {
      tier_number: tierNumber,
      name: meta.name,
      description: meta.description,
      is_active: true,
    });
    if (created.ok && created.data) {
      map.set(tierNumber, created.data.id);
      console.log(`  tier ${tierNumber} — ${meta.name} (id ${created.data.id})`);
    } else {
      console.error(`  tier ${tierNumber} FAILED: ${created.error}`);
    }
  }
  return map;
}

/* -------------------------------------------------------------------------- */
/* Components                                                                   */
/* -------------------------------------------------------------------------- */

interface ComponentSpec {
  name: string;
  code: string;
  component_type: 'allowance' | 'deduction' | 'employer contribution' | 'benefit';
  payment_method: string | null;
  tax_treatment: string | null;
  paid_by: 'employee' | 'employer';
  calculation_type: 'fixed' | 'percentage';
  description: string;
}

const COMPONENTS: ComponentSpec[] = [
  {
    name: 'Housing Allowance',
    code: 'housing',
    component_type: 'allowance',
    payment_method: 'landlord payment',
    tax_treatment: 'non-taxable',
    paid_by: 'employer',
    calculation_type: 'fixed',
    description: 'Housing benefit paid directly to the landlord, outside gross pay.',
  },
  {
    name: 'Travel Allowance',
    code: 'travel',
    component_type: 'allowance',
    payment_method: 'cash in gross',
    tax_treatment: 'taxable',
    paid_by: 'employee',
    calculation_type: 'fixed',
    description: 'Cash allowance already included in gross pay — never added again.',
  },
  {
    name: 'Fuel Allowance',
    code: 'fuel',
    component_type: 'allowance',
    payment_method: 'cash in gross',
    tax_treatment: 'taxable',
    paid_by: 'employee',
    calculation_type: 'fixed',
    description: 'Cash allowance already included in gross pay — never added again.',
  },
  {
    name: 'Life Insurance',
    code: 'life_insurance',
    component_type: 'benefit',
    payment_method: 'employer paid',
    tax_treatment: 'non-taxable',
    paid_by: 'employer',
    calculation_type: 'fixed',
    description: 'OneLife life assurance, employer paid benefit outside gross pay.',
  },
  {
    name: 'Medical Scheme',
    code: 'medical',
    component_type: 'benefit',
    payment_method: 'employer paid',
    tax_treatment: 'non-taxable',
    paid_by: 'employer',
    calculation_type: 'fixed',
    description: 'OneLife medical scheme, employer paid benefit outside gross pay.',
  },
  {
    name: 'PAYE',
    code: 'paye',
    component_type: 'deduction',
    payment_method: 'statutory',
    tax_treatment: 'taxable',
    paid_by: 'employee',
    calculation_type: 'fixed',
    description: 'Pay As You Earn tax withheld from gross pay.',
  },
  {
    name: 'NAPSA (employee)',
    code: 'napsa_employee',
    component_type: 'deduction',
    payment_method: 'statutory',
    tax_treatment: 'taxable',
    paid_by: 'employee',
    calculation_type: 'percentage',
    description: 'National Pension Scheme Authority employee contribution.',
  },
  {
    name: 'NHIMA (employee)',
    code: 'nhima_employee',
    component_type: 'deduction',
    payment_method: 'statutory',
    tax_treatment: 'taxable',
    paid_by: 'employee',
    calculation_type: 'percentage',
    description: 'National Health Insurance Management Authority employee contribution.',
  },
  {
    name: 'Saturnia Pension (employee)',
    code: 'pension_employee',
    component_type: 'deduction',
    payment_method: 'voluntary scheme',
    tax_treatment: 'taxable',
    paid_by: 'employee',
    calculation_type: 'percentage',
    description: 'Voluntary private pension scheme employee contribution.',
  },
  {
    name: 'NAPSA (employer)',
    code: 'napsa_employer',
    component_type: 'employer contribution',
    payment_method: 'statutory',
    tax_treatment: 'non-taxable',
    paid_by: 'employer',
    calculation_type: 'percentage',
    description: 'National Pension Scheme Authority employer contribution.',
  },
  {
    name: 'NHIMA (employer)',
    code: 'nhima_employer',
    component_type: 'employer contribution',
    payment_method: 'statutory',
    tax_treatment: 'non-taxable',
    paid_by: 'employer',
    calculation_type: 'percentage',
    description: 'National Health Insurance Management Authority employer contribution.',
  },
  {
    name: 'Saturnia Pension (employer)',
    code: 'pension_employer',
    component_type: 'employer contribution',
    payment_method: 'voluntary scheme',
    tax_treatment: 'non-taxable',
    paid_by: 'employer',
    calculation_type: 'percentage',
    description: 'Voluntary private pension scheme employer contribution.',
  },
];

async function seedComponents(): Promise<Map<string, number>> {
  const existing = await api<{ id: number; code: string }[]>('/components');
  const map = new Map<string, number>();
  (existing.data ?? []).forEach((component) => map.set(component.code, component.id));

  for (const spec of COMPONENTS) {
    if (map.has(spec.code)) continue;
    const created = await post<{ id: number }>('/components', {
      ...spec,
      is_active: true,
    });
    if (created.ok && created.data) {
      map.set(spec.code, created.data.id);
      console.log(`  component ${spec.code} (id ${created.data.id})`);
    } else {
      console.error(`  component ${spec.code} FAILED: ${created.error}`);
    }
  }
  return map;
}

/* -------------------------------------------------------------------------- */
/* Configs, component values, criteria, housing bands, bonus rules              */
/* -------------------------------------------------------------------------- */

const EFFECTIVE_FROM = '2026-01-01';

function thresholdOperator(threshold: number | null, upper: number | null) {
  if (threshold !== null) return '>=';
  if (upper !== null) return '<';
  return '>=';
}

async function seedStructure(
  tierIds: Map<number, number>,
  componentIds: Map<string, number>
) {
  const existingConfigs = await api<
    { id: number; job_position_id: number; remuneration_tier_id: number }[]
  >('/configs');
  const existingKeys = new Set(
    (existingConfigs.data ?? []).map(
      (config) => `${config.job_position_id}:${config.remuneration_tier_id}`
    )
  );

  const existingValues = await api<
    { remuneration_config_id: number; remuneration_component_id: number }[]
  >('/component-values');
  const valueKeys = new Set(
    (existingValues.data ?? []).map(
      (value) => `${value.remuneration_config_id}:${value.remuneration_component_id}`
    )
  );

  const existingCriteria = await api<
    { remuneration_config_id: number; criterion_code: string }[]
  >('/criteria');
  const criteriaKeys = new Set(
    (existingCriteria.data ?? []).map(
      (criterion) => `${criterion.remuneration_config_id}:${criterion.criterion_code}`
    )
  );

  const existingBands = await api<
    { job_position_id: number; remuneration_tier_id: number }[]
  >('/housing-bands');
  const bandKeys = new Set(
    (existingBands.data ?? []).map(
      (band) => `${band.job_position_id}:${band.remuneration_tier_id}`
    )
  );

  const existingBonuses = await api<{ job_position_id: number }[]>('/bonus-rules');
  const bonusPositionIds = new Set(
    (existingBonuses.data ?? []).map((rule) => rule.job_position_id)
  );

  let configCount = 0;
  let valueCount = 0;
  let criteriaCount = 0;
  let bandCount = 0;
  let bonusCount = 0;

  for (const role of ROLES) {
    const housingBand = HOUSING_BANDS[role.housingBand];

    for (const positionId of role.positionIds) {
      for (const tier of role.tiers) {
        const tierId = tierIds.get(tier.tier);
        if (!tierId) continue;

        const key = `${positionId}:${tierId}`;
        let configId = (existingConfigs.data ?? []).find(
          (config) =>
            config.job_position_id === positionId &&
            config.remuneration_tier_id === tierId
        )?.id;

        if (!configId) {
          const created = await post<{ id: number }>('/configs', {
            job_position_id: positionId,
            remuneration_tier_id: tierId,
            gross_pay: tier.payBlock.grossPay,
            target_net_pay: tier.payBlock.referenceNetPay,
            currency: 'ZMW',
            threshold_type: role.measure.kind,
            threshold_amount: tier.threshold,
            threshold_operator: thresholdOperator(tier.threshold, tier.upperThreshold),
            threshold_upper_amount: tier.upperThreshold,
            threshold_period: role.measure.period,
            min_branches: tier.minScopeCount,
            max_branches: null,
            effective_from: EFFECTIVE_FROM,
            effective_to: null,
            status: tier.status === 'approved' ? 'active' : 'draft',
          });
          if (!created.ok || !created.data) {
            console.error(
              `  config ${role.name} T${tier.tier} (position ${positionId}) FAILED: ${created.error}`
            );
            continue;
          }
          configId = created.data.id;
          configCount += 1;
        }

        const housingLimit = housingBand?.byTier[tier.tier] ?? tier.housing ?? 0;
        const paye = computePaye(tier.payBlock.grossPay, STATUTORY_DEFAULTS);

        const values: {
          code: string;
          amount?: number;
          percentage?: number;
          base?: string | null;
          inGross: boolean;
          inCost: boolean;
          notes: string;
        }[] = [
          {
            code: 'housing',
            amount: housingLimit,
            base: null,
            inGross: false,
            inCost: true,
            notes: `Managerial Housing Policy — ${housingBand?.label ?? role.name} tier ${tier.tier}.`,
          },
          {
            code: 'travel',
            amount:
              tier.payBlock.allowances.find((a) => a.code === 'travel')?.amount ?? 0,
            base: 'gross_pay',
            inGross: true,
            inCost: false,
            notes: 'Cash allowance already included in gross pay.',
          },
          {
            code: 'fuel',
            amount:
              tier.payBlock.allowances.find((a) => a.code === 'fuel')?.amount ?? 0,
            base: 'gross_pay',
            inGross: true,
            inCost: false,
            notes: 'Cash allowance already included in gross pay.',
          },
          {
            code: 'life_insurance',
            amount:
              tier.payBlock.allowances.find((a) => a.code === 'life_insurance')
                ?.amount ?? 0,
            base: null,
            inGross: false,
            inCost: true,
            notes: 'Employer paid benefit, outside gross pay.',
          },
          {
            code: 'paye',
            amount: paye,
            base: null,
            inGross: false,
            inCost: false,
            notes: 'Computed from the approved PAYE bands for this gross pay.',
          },
          {
            code: 'napsa_employee',
            percentage: STATUTORY_DEFAULTS.napsa.employeeRate * 100,
            base: 'gross_pay',
            inGross: false,
            inCost: false,
            notes: `${STATUTORY_DEFAULTS.napsa.employeeRate * 100}% of gross pay.`,
          },
          {
            code: 'nhima_employee',
            percentage: STATUTORY_DEFAULTS.nhima.employeeRate * 100,
            base: 'gross_pay',
            inGross: false,
            inCost: false,
            notes: `${STATUTORY_DEFAULTS.nhima.employeeRate * 100}% of gross pay.`,
          },
          {
            code: 'pension_employee',
            percentage: STATUTORY_DEFAULTS.pension.employeeRate * 100,
            base: 'gross_pay',
            inGross: false,
            inCost: false,
            notes: `${STATUTORY_DEFAULTS.pension.employeeRate * 100}% of gross pay.`,
          },
          {
            code: 'napsa_employer',
            percentage: STATUTORY_DEFAULTS.napsa.employerRate * 100,
            base: 'gross_pay',
            inGross: false,
            inCost: true,
            notes: `${STATUTORY_DEFAULTS.napsa.employerRate * 100}% employer contribution.`,
          },
          {
            code: 'nhima_employer',
            percentage: STATUTORY_DEFAULTS.nhima.employerRate * 100,
            base: 'gross_pay',
            inGross: false,
            inCost: true,
            notes: `${STATUTORY_DEFAULTS.nhima.employerRate * 100}% employer contribution.`,
          },
          {
            code: 'pension_employer',
            percentage: STATUTORY_DEFAULTS.pension.employerRate * 100,
            base: 'gross_pay',
            inGross: false,
            inCost: true,
            notes: `${STATUTORY_DEFAULTS.pension.employerRate * 100}% employer contribution.`,
          },
        ];

        for (const value of values) {
          const componentId = componentIds.get(value.code);
          if (!componentId) continue;
          const valueKey = `${configId}:${componentId}`;
          if (valueKeys.has(valueKey)) continue;

          const created = await post<{ id: number }>('/component-values', {
            remuneration_config_id: configId,
            remuneration_component_id: componentId,
            amount: value.amount ?? null,
            percentage: value.percentage ?? null,
            calculation_base: value.base ?? null,
            is_included_in_gross: value.inGross,
            is_included_in_company_cost: value.inCost,
            notes: value.notes,
          });
          if (created.ok) {
            valueKeys.add(valueKey);
            valueCount += 1;
          } else {
            console.error(
              `  component value ${value.code} for config ${configId} FAILED: ${created.error}`
            );
          }
        }

        const criterionCode = `${role.measure.kind}_threshold`;
        const criterionKey = `${configId}:${criterionCode}`;
        if (!criteriaKeys.has(criterionKey)) {
          const created = await post<{ id: number }>('/criteria', {
            remuneration_config_id: configId,
            criterion_name: tier.criterion,
            criterion_code: criterionCode,
            measurement_type:
              role.measure.kind === 'role_scope' ? 'scope' : 'amount',
            operator: thresholdOperator(tier.threshold, tier.upperThreshold),
            target_value: tier.threshold ?? tier.upperThreshold,
            measurement_period: role.measure.period,
            is_mandatory: tier.status === 'approved',
            verification_source:
              tier.scopeNote ?? 'Internal audit verification of the monthly result',
          });
          if (created.ok) {
            criteriaKeys.add(criterionKey);
            criteriaCount += 1;
          } else {
            console.error(`  criterion for config ${configId} FAILED: ${created.error}`);
          }
        }

        const bandKey = `${positionId}:${tierId}`;
        if (housingLimit > 0 && !bandKeys.has(bandKey)) {
          const created = await post<{ id: number }>('/housing-bands', {
            job_position_id: positionId,
            remuneration_tier_id: tierId,
            monthly_limit: housingLimit,
            effective_from: EFFECTIVE_FROM,
            effective_to: null,
            status: tier.status === 'approved' ? 'active' : 'draft',
          });
          if (created.ok) {
            bandKeys.add(bandKey);
            bandCount += 1;
          } else {
            console.error(`  housing band for ${bandKey} FAILED: ${created.error}`);
          }
        }
      }

      if (role.bonusRuleCode && !bonusPositionIds.has(positionId)) {
        const rule = BONUS_RULES_BY_CODE[role.bonusRuleCode];
        if (rule) {
          const created = await post<{ id: number }>('/bonus-rules', {
            job_position_id: positionId,
            bonus_name: rule.label,
            bonus_type: 'fixed',
            amount: rule.amount,
            percentage: null,
            performance_metric: rule.conditions.map((c) => c.label).join(' and '),
            minimum_target: rule.conditions[0]?.threshold ?? null,
            period: rule.period,
            effective_from: EFFECTIVE_FROM,
            effective_to: null,
            status: 'active',
          });
          if (created.ok) {
            bonusPositionIds.add(positionId);
            bonusCount += 1;
          } else {
            console.error(`  bonus rule for position ${positionId} FAILED: ${created.error}`);
          }
        }
      }
    }
  }

  console.log(
    `\n  configs: ${configCount} · component values: ${valueCount} · criteria: ${criteriaCount} · housing bands: ${bandCount} · bonus rules: ${bonusCount}`
  );
}

/* -------------------------------------------------------------------------- */
/* Assignments for the managers who already hold a managerial position          */
/* -------------------------------------------------------------------------- */

async function seedAssignments(tierIds: Map<number, number>) {
  const assignments = await api<{ id: number; user_id: number }[]>('/assignments');
  const existing = (assignments.data ?? []).map((a) => a.user_id);
  const seeded = new Set(existing);

  const configs = await api<
    {
      id: number;
      job_position_id: number;
      remuneration_tier_id: number;
      status: string;
    }[]
  >('/configs');
  const tiers = await api<{ id: number; tier_number: number }[]>('/tiers');
  const tierNumberOf = new Map(
    (tiers.data ?? []).map((tier) => [tier.id, tier.tier_number])
  );

  /**
   * The default package for a position is its entry band: a manager earns a
   * higher tier through performance, so the assignment starts on the band that
   * applies before the monthly assessment.
   */
  const configFor = (positionId: number) =>
    (configs.data ?? [])
      .filter(
        (entry) =>
          entry.job_position_id === positionId && entry.status === 'active'
      )
      .sort(
        (a, b) =>
          (tierNumberOf.get(b.remuneration_tier_id) ?? 0) -
          (tierNumberOf.get(a.remuneration_tier_id) ?? 0)
      )[0];

  const staffRes = await fetch(
    'https://smartbackend.whencefinancesystem.com/staff'
  );
  const staff = (await staffRes.json()) as {
    id: number;
    first_name: string;
    last_name: string;
    job_position?: number | null;
    position_id?: number | null;
  }[];

  // Managers appointed to a branch office — the branch manager appointments
  // the remuneration registry also reads.
  const officesRes = await fetch(
    'https://smartbackend.whencefinancesystem.com/offices'
  );
  const offices = (await officesRes.json()) as {
    id: number;
    name: string;
    active: number;
  }[];

  const branchAppointees = new Map<number, { name: string; office: string }>();
  for (const office of offices.filter((o) => o.active === 1)) {
    try {
      const usersRes = await fetch(
        `https://smartbackend.whencefinancesystem.com/office-users/${office.id}`
      );
      const payload = (await usersRes.json()) as {
        manager_users?: { id: number; first_name: string; last_name: string }[];
      };
      (payload.manager_users ?? []).forEach((manager) => {
        if (!branchAppointees.has(manager.id)) {
          branchAppointees.set(manager.id, {
            name: `${manager.first_name} ${manager.last_name}`,
            office: office.name,
          });
        }
      });
    } catch {
      // an unreachable office is skipped; the registry degrades the same way
    }
  }

  let created = 0;
  let failed = 0;

  const create = async (
    userId: number,
    positionId: number,
    note: string
  ) => {
    if (seeded.has(userId)) return;
    const config = configFor(positionId);
    if (!config) return;
    const result = await createBackendAssignment({
      user_id: userId,
      job_position_id: positionId,
      remuneration_config_id: config.id,
      acting_capacity: false,
      effective_from: EFFECTIVE_FROM,
      approval_status: 'approved',
      notes: note,
    });
    if (result.ok) {
      seeded.add(userId);
      created += 1;
    } else {
      failed += 1;
      console.error(`  assignment for user ${userId} FAILED: ${result.error}`);
    }
  };

  for (const person of staff) {
    const positionId = person.job_position ?? person.position_id ?? null;
    if (!positionId) continue;
    await create(
      person.id,
      positionId,
      `${person.first_name} ${person.last_name} — seeded from the staff record.`
    );
  }

  for (const [userId, info] of branchAppointees) {
    await create(userId, 5, `${info.name} — branch manager appointed to ${info.office}.`);
  }

  console.log(`  assignments created: ${created}${failed ? ` (${failed} failed)` : ''}`);
  void tierIds;
}

/* -------------------------------------------------------------------------- */
/* Entry point                                                                  */
/* -------------------------------------------------------------------------- */

(async () => {
  console.log(`Remuneration service: ${BASE}\n`);

  const health = await api<{ overview: Record<string, number> }>('/');
  if (!health.ok) {
    console.error(
      `The remuneration service is unreachable (${health.error}). Start smart-backend and re-run.`
    );
    process.exit(1);
  }
  console.log(`Service overview: ${JSON.stringify(health.data?.overview)}\n`);

  if (reset) {
    console.log(
      'The remuneration service exposes no delete routes — the seed is additive only.'
    );
  }

  console.log('Seeding tiers…');
  const tierIds = await seedTiers();

  console.log('Seeding components…');
  const componentIds = await seedComponents();

  console.log('Seeding configurations…');
  await seedStructure(tierIds, componentIds);

  console.log('Seeding assignments…');
  await seedAssignments(tierIds);

  const final = await api<{ overview: Record<string, number> }>('/');
  console.log(`\nDone. Service overview: ${JSON.stringify(final.data?.overview)}`);
  process.exit(0);
})();
