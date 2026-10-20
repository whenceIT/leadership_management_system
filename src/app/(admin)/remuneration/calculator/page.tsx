'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { StatementPanel } from '@/components/remuneration/StatementPanel';
import {
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  PrimaryButton,
  SecondaryButton,
  SectionCard,
  TierBadge,
  inputClass,
} from '@/components/remuneration/ui';
import { currentPeriod, formatMonth, formatZMW, initialsOf, periodList } from '@/lib/remuneration/format';
import type { ManagerProfile, RemunerationComputation } from '@/lib/remuneration/types';
import {
  calculateRemuneration,
  fetchManagers,
  fetchPerformance,
  loadStatutoryOverrides,
  saveStatement,
  type PerformancePayload,
} from '@/services/RemunerationService';

const STEPS = [
  { id: 1, title: 'Select manager', description: 'Who are we calculating for?' },
  { id: 2, title: 'Performance & tier', description: 'Verify the result and the qualifying band.' },
  { id: 3, title: 'Statement', description: 'Review, validate and submit for approval.' },
];

export default function RemunerationCalculatorPage() {
  const [step, setStep] = useState(1);
  const [period, setPeriod] = useState(currentPeriod());
  const [managers, setManagers] = useState<ManagerProfile[]>([]);
  const [managersLoading, setManagersLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [performance, setPerformance] = useState<PerformancePayload | null>(null);
  const [previousTier, setPreviousTier] = useState<number | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [computation, setComputation] = useState<RemunerationComputation | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    setManagersLoading(true);
    fetchManagers()
      .then((response) => {
        if (active) setManagers(response.managers);
      })
      .catch((err) => {
        if (active)
          setError(err instanceof Error ? err.message : 'Unable to load the manager registry.');
      })
      .finally(() => {
        if (active) setManagersLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const roles = useMemo(() => {
    const map = new Map<string, string>();
    managers.forEach((manager) => map.set(manager.roleId, manager.roleName));
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [managers]);

  const filteredManagers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return managers
      .filter((manager) => (roleFilter === 'all' ? true : manager.roleId === roleFilter))
      .filter((manager) => {
        if (!term) return true;
        return [
          manager.fullName,
          manager.email ?? '',
          manager.roleName,
          manager.scope.officeName ?? '',
          manager.scope.districtName ?? '',
          manager.scope.provinceName ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(term);
      })
      .slice(0, 120);
  }, [managers, roleFilter, search]);

  const selected = useMemo(
    () => managers.find((manager) => manager.id === selectedId) ?? null,
    [managers, selectedId]
  );

  const loadPerformance = useCallback(
    async (managerId: string, activePeriod: string) => {
      setPerformanceLoading(true);
      setError(null);
      try {
        const response = await fetchPerformance(managerId, activePeriod);
        setPerformance(response.performance);
        return response;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load the performance result.');
        setPerformance(null);
        return null;
      } finally {
        setPerformanceLoading(false);
      }
    },
    []
  );

  const selectManager = useCallback(
    async (managerId: string) => {
      setSelectedId(managerId);
      setComputation(null);
      setNotice(null);
      setPreviousTier(managers.find((manager) => manager.id === managerId)?.previousTier ?? null);
      await loadPerformance(managerId, period);
      setStep(2);
    },
    [loadPerformance, managers, period]
  );

  useEffect(() => {
    if (selectedId) loadPerformance(selectedId, period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const runCalculation = useCallback(async () => {
    if (!selectedId) return;
    setCalculating(true);
    setError(null);
    try {
      const response = await calculateRemuneration({
        managerId: selectedId,
        period,
        performance: performance ?? undefined,
        previousTier,
        statutory: loadStatutoryOverrides() ?? undefined,
      });
      setComputation(response.computation);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The calculation could not be completed.');
    } finally {
      setCalculating(false);
    }
  }, [selectedId, period, performance, previousTier]);

  const submit = useCallback(
    async (status: 'draft' | 'pending_approval') => {
      if (!selectedId) return;
      setSaving(true);
      setError(null);
      try {
        await saveStatement({
          managerId: selectedId,
          period,
          performance: performance ?? undefined,
          previousTier,
          statutory: loadStatutoryOverrides() ?? undefined,
          status,
        });
        setNotice(
          status === 'pending_approval'
            ? 'Statement submitted for approval. It now appears in the approval queue.'
            : 'Statement saved as a draft.'
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'The statement could not be saved.');
      } finally {
        setSaving(false);
      }
    },
    [selectedId, period, performance, previousTier]
  );

  const updatePerformance = (patch: Partial<PerformancePayload>) => {
    setPerformance((previous) =>
      previous ? { ...previous, ...patch, source: 'manual' } : previous
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-500">
              Managerial remuneration
            </p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Remuneration calculator
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Build a manager&apos;s monthly statement in three steps: select the manager,
              verify the performance result that sets the tier, then review the pay, the
              deductions and the cost to the company.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Pay period
            </label>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            >
              {periodList(18).map((item) => (
                <option key={item} value={item}>
                  {formatMonth(item)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {notice ? (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="font-semibold">
            Dismiss
          </button>
        </div>
      ) : null}

      {error ? <ErrorState message={error} onRetry={() => setError(null)} /> : null}

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* ------------------------------ Step rail ----------------------------- */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <ol className="space-y-1">
              {STEPS.map((item) => {
                const active = step === item.id;
                const done = step > item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (item.id === 1 || (selectedId && item.id === 2) || computation) {
                          setStep(item.id);
                        }
                      }}
                      disabled={item.id !== 1 && !selectedId && !computation}
                      className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
                        active
                          ? 'bg-brand-50 dark:bg-brand-500/10'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      } ${item.id !== 1 && !selectedId && !computation ? 'opacity-50' : ''}`}
                    >
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          done
                            ? 'bg-emerald-500 text-white'
                            : active
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {done ? '✓' : item.id}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block text-sm font-semibold ${
                            active ? 'text-brand-600 dark:text-brand-300' : 'text-gray-800 dark:text-gray-100'
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          {item.description}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {selected ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Selected manager
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                  {initialsOf(selected.fullName)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {selected.fullName}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {selected.roleName}
                  </p>
                </div>
              </div>
              <dl className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-500 dark:text-gray-400">Scope</dt>
                  <dd className="text-right font-medium text-gray-800 dark:text-gray-100">
                    {selected.scope.officeName ??
                      selected.scope.districtName ??
                      selected.scope.provinceName ??
                      'Not assigned'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-500 dark:text-gray-400">Branches in scope</dt>
                  <dd className="text-right font-medium text-gray-800 dark:text-gray-100">
                    {selected.scope.branchCount || '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-500 dark:text-gray-400">Appointment</dt>
                  <dd className="text-right font-medium text-gray-800 dark:text-gray-100">
                    {selected.appointmentDate ?? 'Not recorded'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-500 dark:text-gray-400">Status</dt>
                  <dd className="text-right font-medium text-gray-800 dark:text-gray-100">
                    {selected.acting ? 'Acting' : 'Substantive'}
                  </dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(null);
                  setPerformance(null);
                  setComputation(null);
                  setPreviousTier(null);
                  setStep(1);
                }}
                className="mt-4 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Choose a different manager
              </button>
            </div>
          ) : null}
        </aside>

        {/* ------------------------------- Content ------------------------------ */}
        <div className="min-w-0 space-y-6">
          {step === 1 ? (
            <SectionCard
              title="Select a manager"
              description="Search the staff registry and the office appointments. Managers can also be registered on the Managers page."
            >
              {managersLoading ? (
                <LoadingState label="Loading the manager registry…" />
              ) : (
                <>
                  <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by name, office, district or province…"
                      className={inputClass}
                    />
                    <select
                      value={roleFilter}
                      onChange={(event) => setRoleFilter(event.target.value)}
                      className={inputClass}
                    >
                      <option value="all">All managerial roles</option>
                      {roles.map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {filteredManagers.length === 0 ? (
                    <EmptyState
                      title="No managers match"
                      description="Adjust the search or register a managerial assignment on the Managers page."
                    />
                  ) : (
                    <div ref={listRef} className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                      {filteredManagers.map((manager) => (
                        <button
                          key={manager.id}
                          type="button"
                          onClick={() => selectManager(manager.id)}
                          className="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-left transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-gray-700 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                            {initialsOf(manager.fullName)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">
                              {manager.fullName}
                            </span>
                            <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                              {manager.scope.officeName ??
                                manager.scope.districtName ??
                                manager.scope.provinceName ??
                                'No scope'}
                              {manager.scope.branchCount ? ` · ${manager.scope.branchCount} branch(es)` : ''}
                            </span>
                          </span>
                          <span className="shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">
                            {manager.roleName}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </SectionCard>
          ) : null}

          {step === 2 && selected ? (
            performanceLoading ? (
              <LoadingState label="Retrieving performance results…" />
            ) : (
              <SectionCard
                title="Performance result and qualifying tier"
                description="Confirm the measured result before the tier is applied."
                actions={
                  <SecondaryButton onClick={() => setStep(1)}>Change manager</SecondaryButton>
                }
              >
                {performance ? (
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label={`${performance.measures[0]?.label ?? 'Measured result'} (${performance.measures[0]?.unit ?? 'ZMW'})`}
                        hint={
                          performance.source === 'manual'
                            ? 'Entered manually — internal audit must verify it.'
                            : `Source: ${performance.source}`
                        }
                      >
                        <input
                          type="number"
                          value={performance.value ?? ''}
                          onChange={(event) =>
                            updatePerformance({
                              value:
                                event.target.value === '' ? null : Number(event.target.value),
                            })
                          }
                          className={inputClass}
                          placeholder="e.g. 580314"
                        />
                      </Field>
                      <Field
                        label="Branches in scope"
                        hint="Used for the branch-count condition attached to a band."
                      >
                        <input
                          type="number"
                          value={performance.branchCount ?? ''}
                          onChange={(event) =>
                            updatePerformance({
                              branchCount:
                                event.target.value === '' ? null : Number(event.target.value),
                            })
                          }
                          className={inputClass}
                        />
                      </Field>
                      <Field
                        label="Tier earned last period"
                        hint="Applies the housing continuity rule when the tier drops."
                      >
                        <select
                          value={previousTier ?? ''}
                          onChange={(event) =>
                            setPreviousTier(
                              event.target.value === '' ? null : Number(event.target.value)
                            )
                          }
                          className={inputClass}
                        >
                          <option value="">Not recorded</option>
                          {[1, 2, 3, 4, 5, 6].map((tier) => (
                            <option key={tier} value={tier}>
                              Tier {tier}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    {performance.measures.length ? (
                      <div className="rounded-xl border border-gray-200 dark:border-gray-700">
                        <p className="border-b border-gray-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
                          Source evidence
                        </p>
                        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                          {performance.measures.map((measure) => (
                            <li
                              key={measure.code}
                              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                            >
                              <div>
                                <p className="font-medium text-gray-800 dark:text-gray-100">
                                  {measure.label}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  {measure.source}
                                  {measure.period ? ` · ${measure.period}` : ''}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold tabular-nums text-gray-900 dark:text-white">
                                  {measure.value === null ? '—' : formatZMW(measure.value)}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  {measure.target !== null
                                    ? `target ${formatZMW(measure.target)}`
                                    : 'no target'}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Verified efficiency score (%)"
                        hint="Supports the annual bonus conditions."
                      >
                        <input
                          type="number"
                          value={performance.efficiencyScore ?? ''}
                          onChange={(event) =>
                            updatePerformance({
                              efficiencyScore:
                                event.target.value === '' ? null : Number(event.target.value),
                            })
                          }
                          className={inputClass}
                          placeholder="e.g. 82"
                        />
                      </Field>
                      <Field
                        label="Verified PDUA score (%)"
                        hint="Supports the annual bonus conditions."
                      >
                        <input
                          type="number"
                          value={performance.pduaScore ?? ''}
                          onChange={(event) =>
                            updatePerformance({
                              pduaScore:
                                event.target.value === '' ? null : Number(event.target.value),
                            })
                          }
                          className={inputClass}
                          placeholder="e.g. 85"
                        />
                      </Field>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-500/30 dark:bg-amber-500/5">
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                        Assign a tier manually
                      </p>
                      <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
                        Some bands are assessed on scope and evidence rather than a number. Select
                        the qualifying band and record the reason so the decision is auditable.
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                        <select
                          value={performance.manualTier ?? ''}
                          onChange={(event) =>
                            updatePerformance({
                              manualTier:
                                event.target.value === '' ? null : Number(event.target.value),
                            })
                          }
                          className={inputClass}
                        >
                          <option value="">Automatic</option>
                          {(computation?.qualification.evaluatedTiers.length
                            ? computation.qualification.evaluatedTiers
                            : []
                          ).map((tier) => (
                            <option key={tier.tier} value={tier.tier}>
                              Tier {tier.tier}
                            </option>
                          ))}
                          {[1, 2, 3, 4, 5, 6].map((tier) => (
                            <option key={tier} value={tier}>
                              Tier {tier}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={performance.overrideReason ?? ''}
                          onChange={(event) =>
                            updatePerformance({ overrideReason: event.target.value })
                          }
                          placeholder="Reason for the manual assignment"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <PrimaryButton onClick={runCalculation} disabled={calculating}>
                        {calculating ? 'Calculating…' : 'Calculate statement'}
                      </PrimaryButton>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    title="No performance result available"
                    description="The source system did not return a result for this scope. Enter the measured value manually — the system records it as a manual entry for audit."
                  />
                )}
              </SectionCard>
            )
          ) : null}

          {step === 3 && computation ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SecondaryButton onClick={() => setStep(2)}>Back to performance</SecondaryButton>
                <div className="flex flex-wrap gap-3">
                  <SecondaryButton onClick={() => submit('draft')} disabled={saving}>
                    Save draft
                  </SecondaryButton>
                  <PrimaryButton onClick={() => submit('pending_approval')} disabled={saving}>
                    {saving ? 'Saving…' : 'Submit for approval'}
                  </PrimaryButton>
                </div>
              </div>
              <StatementPanel computation={computation} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
