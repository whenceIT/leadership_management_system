'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SectionCard,
  TierBadge,
  inputClass,
} from '@/components/remuneration/ui';
import { formatZMW } from '@/lib/remuneration/format';
import type { StatutoryRules } from '@/lib/remuneration/types';
import {
  clearStatutoryOverrides,
  fetchStructure,
  loadStatutoryOverrides,
  saveStatutoryOverrides,
  type StructureResponse,
} from '@/services/RemunerationService';

const TIER_ORDER = [1, 2, 3, 4, 5, 6];

export default function RemunerationStructurePage() {
  const [structure, setStructure] = useState<StructureResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleId, setRoleId] = useState<string>('branch_manager');
  const [rules, setRules] = useState<StatutoryRules | null>(null);
  const [rulesSaved, setRulesSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchStructure();
      setStructure(response);
      const overrides = loadStatutoryOverrides();
      setRules({
        ...response.statutory,
        ...(overrides?.napsa ? { napsa: { ...response.statutory.napsa, ...overrides.napsa } } : {}),
        ...(overrides?.nhima ? { nhima: { ...response.statutory.nhima, ...overrides.nhima } } : {}),
        ...(overrides?.pension
          ? { pension: { ...response.statutory.pension, ...overrides.pension } }
          : {}),
        ...(overrides?.paye ? { paye: { ...response.statutory.paye, ...overrides.paye } } : {}),
        ...(overrides?.medical
          ? { medical: { ...response.statutory.medical, ...overrides.medical } }
          : {}),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load the structure.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const role = useMemo(
    () => structure?.roles.find((entry) => entry.id === roleId) ?? null,
    [structure, roleId]
  );

  const updateRule = (patch: Partial<StatutoryRules>) => {
    setRules((previous) => (previous ? { ...previous, ...patch } : previous));
    setRulesSaved(false);
  };

  const persistRules = () => {
    if (!rules || !structure) return;
    saveStatutoryOverrides({
      napsa: rules.napsa,
      nhima: rules.nhima,
      pension: rules.pension,
      paye: { ...rules.paye, relief: rules.paye.relief },
      medical: rules.medical,
    });
    setRulesSaved(true);
  };

  const resetRules = () => {
    clearStatutoryOverrides();
    setRules(structure?.statutory ?? null);
    setRulesSaved(false);
  };

  if (loading) return <LoadingState label="Loading the approved structure…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!structure || !rules) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Managerial remuneration"
        title="Tier and salary structure"
        description="The approved remuneration framework: managerial roles, qualifying bands, pay blocks, the housing policy, the annual bonus rules and the statutory rules the engine applies."
        actions={
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
            Stored in {structure.persistence === 'mysql' ? 'MySQL' : 'the in-process store'}
          </span>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Managerial roles
            </p>
            <ul className="space-y-1">
              {structure.roles.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => setRoleId(entry.id)}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                      roleId === entry.id
                        ? 'bg-brand-50 font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {entry.name}
                    <span className="ml-1 text-xs text-gray-400">
                      ({entry.tiers.length} band{entry.tiers.length === 1 ? '' : 's'})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          {role ? (
            <SectionCard
              title={`${role.name} — qualifying bands`}
              description={`Measure: ${role.measure.label} (${role.measure.unit}, ${role.measure.period}). ${role.sourceNote}`}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700">
                      <th className="pb-3 pr-4 font-semibold">Tier</th>
                      <th className="pb-3 pr-4 font-semibold">Qualifying criterion</th>
                      <th className="pb-3 pr-4 font-semibold">Scope</th>
                      <th className="pb-3 pr-4 text-right font-semibold">Gross pay</th>
                      <th className="pb-3 pr-4 text-right font-semibold">Net (guide)</th>
                      <th className="pb-3 pr-4 text-right font-semibold">Housing</th>
                      <th className="pb-3 text-right font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {[...role.tiers]
                      .sort((a, b) => a.tier - b.tier)
                      .map((tier) => (
                        <tr key={tier.tier} className="align-top">
                          <td className="py-3 pr-4">
                            <TierBadge
                              tier={tier.tier}
                              label={tier.label}
                              proposed={tier.status === 'proposed'}
                            />
                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                              {tier.seniority}
                            </p>
                          </td>
                          <td className="py-3 pr-4">
                            <p className="font-medium text-gray-800 dark:text-gray-100">
                              {tier.criterion}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                              {tier.sourceNote}
                            </p>
                          </td>
                          <td className="py-3 pr-4 text-xs text-gray-600 dark:text-gray-300">
                            {tier.scopeNote ?? '—'}
                          </td>
                          <td className="py-3 pr-4 text-right font-semibold tabular-nums text-gray-900 dark:text-white">
                            {formatZMW(tier.payBlock.grossPay)}
                          </td>
                          <td className="py-3 pr-4 text-right tabular-nums text-gray-500 dark:text-gray-400">
                            {formatZMW(tier.payBlock.referenceNetPay)}
                          </td>
                          <td className="py-3 pr-4 text-right tabular-nums text-gray-600 dark:text-gray-300">
                            {formatZMW(tier.housing)}
                          </td>
                          <td className="py-3 text-right">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                tier.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                              }`}
                            >
                              {tier.status === 'approved' ? 'Approved' : 'Proposed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600 dark:bg-gray-900/60 dark:text-gray-300">
                <p className="font-semibold text-gray-700 dark:text-gray-200">
                  Allowances carried by this role
                </p>
                <ul className="mt-1 space-y-0.5">
                  {role.tiers
                    .flatMap((tier) => tier.payBlock.allowances)
                    .filter(
                      (allowance, index, list) =>
                        list.findIndex((entry) => entry.code === allowance.code) === index
                    )
                    .map((allowance) => (
                      <li key={allowance.code} className="flex justify-between gap-4">
                        <span>{allowance.label}</span>
                        <span className="tabular-nums">
                          {formatZMW(allowance.amount)} ·{' '}
                          {allowance.treatment === 'included_in_gross'
                            ? 'inside gross pay'
                            : 'employer paid benefit'}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </SectionCard>
          ) : null}

          <SectionCard
            title="Managerial housing policy"
            description={`${structure.housingPolicy.coverage} Maximum quarterly cost ${formatZMW(
              structure.housingPolicy.maximumQuarterlyCost
            )}.`}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700">
                    <th className="pb-3 pr-4 font-semibold">Position</th>
                    {TIER_ORDER.map((tier) => (
                      <th key={tier} className="pb-3 pr-4 text-right font-semibold">
                        Tier {tier}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {Object.values(structure.housingBands).map((band) => (
                    <tr key={band.key}>
                      <td className="py-3 pr-4 font-medium text-gray-800 dark:text-gray-100">
                        {band.label}
                      </td>
                      {TIER_ORDER.map((tier) => (
                        <td
                          key={tier}
                          className="py-3 pr-4 text-right tabular-nums text-gray-600 dark:text-gray-300"
                        >
                          {band.byTier[tier] !== undefined ? formatZMW(band.byTier[tier]) : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="mt-4 space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
              {structure.housingPolicy.rules.map((rule) => (
                <li key={rule} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                  {rule}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title="Annual bonuses and performance allowances"
            description="Applied once the role conditions and the annual assessment are met."
          >
            <div className="grid gap-4 md:grid-cols-2">
              {structure.bonusRules.map((rule) => (
                <div
                  key={rule.code}
                  className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {rule.label}
                    </p>
                    <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                      {formatZMW(rule.amount)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{rule.sourceNote}</p>
                  <ul className="mt-3 space-y-1 text-xs text-gray-700 dark:text-gray-200">
                    {rule.conditions.map((condition) => (
                      <li key={condition.code} className="flex justify-between gap-3">
                        <span>{condition.label}</span>
                        <span className="text-gray-400">from {condition.source}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 border-t border-gray-100 pt-2 text-xs text-gray-400 dark:border-gray-700 dark:text-gray-500">
                    {rule.payableOn}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Statutory and scheme rules"
            description="The engine applies these rules instead of the sample amounts printed in the guide. Adjust them here once management confirms the approved rates for the pay period."
            actions={
              <div className="flex gap-2">
                <SecondaryButton onClick={resetRules}>Reset to approved defaults</SecondaryButton>
                <PrimaryButton onClick={persistRules}>Save rules</PrimaryButton>
              </div>
            }
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">NAPSA</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Field label="Employee %">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={(rules.napsa.employeeRate * 100).toFixed(2)}
                      onChange={(event) =>
                        updateRule({
                          napsa: {
                            ...rules.napsa,
                            employeeRate: Number(event.target.value) / 100,
                          },
                        })
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Employer %">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={(rules.napsa.employerRate * 100).toFixed(2)}
                      onChange={(event) =>
                        updateRule({
                          napsa: {
                            ...rules.napsa,
                            employerRate: Number(event.target.value) / 100,
                          },
                        })
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">NHIMA</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Field label="Employee %">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={(rules.nhima.employeeRate * 100).toFixed(2)}
                      onChange={(event) =>
                        updateRule({
                          nhima: {
                            ...rules.nhima,
                            employeeRate: Number(event.target.value) / 100,
                          },
                        })
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Employer %">
                    <input
                      type="number"
                      step="0.1"
                        min="0"
                      max="100"
                      value={(rules.nhima.employerRate * 100).toFixed(2)}
                      onChange={(event) =>
                        updateRule({
                          nhima: {
                            ...rules.nhima,
                            employerRate: Number(event.target.value) / 100,
                          },
                        })
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {rules.pension.label}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Field label="Employee %">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={(rules.pension.employeeRate * 100).toFixed(2)}
                      onChange={(event) =>
                        updateRule({
                          pension: {
                            ...rules.pension,
                            employeeRate: Number(event.target.value) / 100,
                          },
                        })
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Employer %">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={(rules.pension.employerRate * 100).toFixed(2)}
                      onChange={(event) =>
                        updateRule({
                          pension: {
                            ...rules.pension,
                            employerRate: Number(event.target.value) / 100,
                          },
                        })
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>
                <label className="mt-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={rules.pension.enabled}
                    onChange={(event) =>
                      updateRule({ pension: { ...rules.pension, enabled: event.target.checked } })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                  />
                  Apply the pension contribution
                </label>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {rules.paye.label} bands
                </p>
                <ul className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-300">
                  {rules.paye.bands.map((band, index) => (
                    <li key={index} className="flex justify-between gap-3">
                      <span>
                        {band.upTo === null
                          ? 'Above the last band'
                          : `Up to ${formatZMW(band.upTo)}`}
                      </span>
                      <span className="font-medium tabular-nums">
                        {(band.rate * 100).toFixed(0)}%
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3">
                  <Field label="Monthly relief">
                    <input
                      type="number"
                      min="0"
                      value={rules.paye.relief}
                      onChange={(event) =>
                        updateRule({ paye: { ...rules.paye, relief: Number(event.target.value) } })
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700 md:col-span-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {rules.medical.label}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {structure.allowancePolicy.scheme.medical}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-[180px_180px_1fr] sm:items-end">
                  <Field label="Monthly premium">
                    <input
                      type="number"
                      min="0"
                      value={rules.medical.monthlyPremium}
                      onChange={(event) =>
                        updateRule({
                          medical: {
                            ...rules.medical,
                            monthlyPremium: Number(event.target.value),
                          },
                        })
                      }
                      className={inputClass}
                    />
                  </Field>
                  <label className="flex items-center gap-2 pb-2.5 text-xs text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={rules.medical.enabled}
                      onChange={(event) =>
                        updateRule({
                          medical: { ...rules.medical, enabled: event.target.checked },
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                    />
                    Include in company cost
                  </label>
                  <p className="pb-2.5 text-xs text-gray-400 dark:text-gray-500">
                    {structure.allowancePolicy.scheme.pension}
                  </p>
                </div>
              </div>
            </div>

            {rulesSaved ? (
              <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                Rules saved. Every new calculation uses these values.
              </p>
            ) : null}
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard
              title={structure.incrementPolicy.heading}
              description={structure.incrementPolicy.monitoring}
            >
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {structure.incrementPolicy.principles.map((principle) => (
                  <li key={principle} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                    {principle}
                  </li>
                ))}
              </ul>
              <ol className="mt-4 space-y-3">
                {structure.incrementPolicy.escalation.map((stage, index) => (
                  <li key={stage.stage} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {stage.stage}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{stage.rule}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </SectionCard>

            <SectionCard
              title={structure.allowancePolicy.heading}
              description="Approved allowances that sit outside the increment framework."
            >
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {structure.allowancePolicy.rule}
              </p>
            </SectionCard>
          </div>

          <SectionCard
            title="Decisions management must confirm"
            description="These remain open until management records a decision. The engine flags anything that depends on them."
          >
            {structure.confirmationChecklist.every((item) => item.status === 'confirmed') ? (
              <EmptyState
                title="All requirements confirmed"
                description="The calculation engine can be treated as final for the approved pay period."
              />
            ) : (
              <ul className="space-y-3">
                {structure.confirmationChecklist.map((item) => (
                  <li
                    key={item.key}
                    className="flex items-start gap-3 rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-700"
                  >
                    <span
                      className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                        item.status === 'confirmed' ? 'bg-emerald-500' : 'bg-amber-400'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {item.question}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
