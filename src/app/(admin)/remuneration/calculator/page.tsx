'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
import { currentPeriod, formatMonth, formatZMW, initialsOf, periodList, tierTone } from '@/lib/remuneration/format';
import type { ManagerProfile, RemunerationComputation } from '@/lib/remuneration/types';
import {
  calculateRemuneration,
  fetchManagers,
  fetchPerformanceCriteria,
  loadStatutoryOverrides,
  saveStatement,
  type PerformanceCriteriaParams,
  type PerformancePayload,
} from '@/services/RemunerationService';

const POSITION_API_OVERRIDES: Record<string, string> = {
  provincial_manager: 'province_manager',
};

function derivePositionApiString(jobPosition: string | null, roleId: string): string | null {
  if (!jobPosition) {
    const fallback = POSITION_API_OVERRIDES[roleId];
    if (!fallback) return null;
    return fallback;
  }
  const candidate = jobPosition.toLowerCase().replace(/[\s/]+/g, '_').replace(/['']/g, '');
  return POSITION_API_OVERRIDES[roleId] ?? candidate;
}

function periodDates(period: string): { start: string; end: string } {
  const [year, month] = period.split('-').map(Number);
  const startDay = 24;
  const start = new Date(Date.UTC(year, month - 1, startDay));
  const end = new Date(Date.UTC(year, month, 0));
  end.setUTCDate(24);
  const fmt = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  return { start: fmt(start), end: fmt(end) };
}

interface ComputationRow {
  manager: ManagerProfile;
  computation: RemunerationComputation | null;
  measuredRevenue: number | null;
  loading: boolean;
  error: string | null;
  saved: boolean;
}

export default function RemunerationCalculatorPage() {
  const [period, setPeriod] = useState(currentPeriod());
  const [managers, setManagers] = useState<ManagerProfile[]>([]);
  const [managersLoading, setManagersLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [rows, setRows] = useState<ComputationRow[]>([]);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submittedCount, setSubmittedCount] = useState(0);

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
  }, [managers, roleFilter, search]);

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

  const fetchPerformanceForManager = useCallback(
    async (manager: ManagerProfile, periodValue: string): Promise<PerformancePayload | null> => {
      const position = derivePositionApiString(manager.jobPosition, manager.roleId);
      if (!position) return null;

      const params: PerformanceCriteriaParams = { job_position: position };
      const officeId = manager.scope.officeId;
      if (officeId && officeId > 0) params.office_id = String(officeId);

      const { start, end } = periodDates(periodValue);
      params.start_date = start;
      params.end_date = end;

      try {
        const result = await fetchPerformanceCriteria(params);
        return {
          value: result.total_collected ?? null,
          source: 'revenue_achievement',
          measures: [],
          manualTier: null,
          overrideReason: null,
          efficiencyScore: null,
          pduaScore: null,
          branchCount: manager.scope.branchCount ?? null,
        };
      } catch (err) {
        return null;
      }
    },
    []
  );

  const runCalculation = useCallback(
    async (manager: ManagerProfile, performance: PerformancePayload | null, previousTier: number | null) => {
      const response = await calculateRemuneration({
        managerId: manager.id,
        period,
        performance: performance ?? undefined,
        previousTier,
        statutory: loadStatutoryOverrides() ?? undefined,
      });
      return response.computation;
    },
    [period]
  );

  const calculateAll = useCallback(async () => {
    setCalculating(true);
    setError(null);
    setNotice(null);

    const nextRows: ComputationRow[] = filteredManagers.map((manager) => ({
      manager,
      computation: null,
      measuredRevenue: null,
      loading: true,
      error: null,
      saved: false,
    }));
    setRows(nextRows);

    const { start, end } = periodDates(period);

    try {
      for (const manager of filteredManagers) {
        const rowIndex = nextRows.findIndex((r) => r.manager.id === manager.id);
        if (rowIndex === -1) continue;

        let performance: PerformancePayload | null = null;
        try {
          const position = derivePositionApiString(manager.jobPosition, manager.roleId);
          if (position) {
            const params: PerformanceCriteriaParams = { job_position: position };
            const officeId = manager.scope.officeId;
            if (officeId && officeId > 0) params.office_id = String(officeId);
            params.start_date = start;
            params.end_date = end;

            const result = await fetchPerformanceCriteria(params);
            performance = {
              value: result.total_collected ?? null,
              source: 'revenue_achievement',
              measures: [],
              manualTier: null,
              overrideReason: null,
              efficiencyScore: null,
              pduaScore: null,
              branchCount: manager.scope.branchCount ?? null,
            };
          }
        } catch (err) {
          performance = null;
        }

        let computation: RemunerationComputation | null = null;
        let errMsg: string | null = null;
        try {
          const response = await calculateRemuneration({
            managerId: manager.id,
            period,
            performance: performance ?? undefined,
            previousTier: manager.previousTier,
            statutory: loadStatutoryOverrides() ?? undefined,
          });
          computation = response.computation;
        } catch (err) {
          errMsg = err instanceof Error ? err.message : 'Calculation failed.';
        }

        setRows((prev) =>
          prev.map((r) =>
            r.manager.id === manager.id
              ? { ...r, computation, measuredRevenue: performance?.value ?? null, loading: false, error: errMsg }
              : r
          )
        );
      }

      const failed = nextRows.filter((r) => r.error).length;
      const succeeded = nextRows.length - failed;
      setNotice(
        `Calculated ${succeeded} of ${nextRows.length} manager${nextRows.length !== 1 ? 's' : ''}${
          failed ? ` (${failed} failed)` : ''
        }.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk calculation failed.');
    } finally {
      setCalculating(false);
    }
  }, [filteredManagers, period]);

  const submitAll = useCallback(async () => {
    setSaving(true);
    setError(null);

    const unsaved = rows.filter((r) => r.computation && !r.saved);
    let success = 0;
    let failed = 0;

    for (const row of unsaved) {
      if (!row.computation) continue;
      try {
        await saveStatement({
          managerId: row.manager.id,
          period,
          performance: row.computation.qualification
            ? {
                value: row.computation.qualification.achievementPct ?? null,
                source: 'revenue_achievement',
                measures: [],
                manualTier: null,
                overrideReason: null,
                efficiencyScore: null,
                pduaScore: null,
                branchCount: row.manager.scope.branchCount ?? null,
              }
            : undefined,
          previousTier: row.manager.previousTier,
          statutory: loadStatutoryOverrides() ?? undefined,
          status: 'pending_approval',
        });
        setRows((prev) =>
          prev.map((r) => (r.manager.id === row.manager.id ? { ...r, saved: true } : r))
        );
        success += 1;
      } catch (err) {
        failed += 1;
      }
    }

    setSubmittedCount(success);
    setNotice(
      `Submitted ${success} statement${success !== 1 ? 's' : ''} for approval.${failed ? ` ${failed} failed.` : ''}`
    );
    setSaving(false);
  }, [rows, period]);

  const qualifiedCount = useMemo(() => rows.filter((r) => r.computation?.qualification.tier).length, [rows]);
  const totalCompanyCost = useMemo(
    () => rows.reduce((sum, r) => sum + (r.computation?.totalCompanyCost ?? 0), 0),
    [rows]
  );
  const totalGrossPay = useMemo(
    () => rows.reduce((sum, r) => sum + (r.computation?.grossPay ?? 0), 0),
    [rows]
  );
  const totalNetPay = useMemo(
    () => rows.reduce((sum, r) => sum + (r.computation?.netCashPay ?? 0), 0),
    [rows]
  );

  const allCalculated = rows.length > 0 && rows.every((r) => !r.loading);
  const allSaved = rows.length > 0 && rows.every((r) => r.saved);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-500">
              Managerial remuneration
            </p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bulk remuneration calculator
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Calculate monthly remuneration statements for every manager at once. Each
              manager&rsquo;s tier is assigned automatically from their measured monthly
              revenue against the approved pay bands in the remuneration guide.
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
        {/* ------------------------------ Manager list ----------------------------- */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Managers in scope
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
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

            {managersLoading ? (
              <LoadingState label="Loading the manager registry…" />
            ) : filteredManagers.length === 0 ? (
              <EmptyState
                title="No managers match"
                description="Adjust the search or register a managerial assignment on the Managers page."
              />
            ) : (
              <div className="mt-3 max-h-[400px] space-y-2 overflow-y-auto pr-1">
                {filteredManagers.map((manager) => (
                  <div
                    key={manager.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-left transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-gray-700 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5"
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
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Bulk actions
            </p>
            <div className="mt-3 space-y-2">
              <PrimaryButton
                onClick={calculateAll}
                disabled={calculating || filteredManagers.length === 0}
              >
                {calculating ? 'Calculating all…' : 'Calculate all statements'}
              </PrimaryButton>
              <SecondaryButton
                onClick={submitAll}
                disabled={saving || !allCalculated || allSaved || rows.length === 0}
              >
                {saving ? 'Submitting…' : 'Submit all for approval'}
              </SecondaryButton>
              {submittedCount > 0 && (
                <SecondaryButton onClick={() => setSubmittedCount(0)}>
                  Dismiss notice
                </SecondaryButton>
              )}
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              {filteredManagers.length} manager{filteredManagers.length !== 1 ? 's' : ''} in current filter.
            </p>
          </div>
        </aside>

        {/* ------------------------------- Results table ------------------------------ */}
        <div className="min-w-0 space-y-6">
          {rows.length === 0 ? (
            <SectionCard
              title="No calculations yet"
              description="Select a pay period and click Calculate all statements to generate remuneration statements for every manager."
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Each manager&rsquo;s tier is determined automatically from their measured
                monthly revenue against the approved bands in the remuneration guide.
              </p>
            </SectionCard>
          ) : (
            <>
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700 sm:flex sm:items-center sm:justify-between">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Calculation results
                  </h2>
                  <div className="mt-2 sm:mt-0 flex flex-wrap gap-2 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      qualifiedCount === rows.length && rows.length > 0
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {qualifiedCount} of {rows.length} qualified
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Manager
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Scope
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Measured revenue
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Tier
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Gross pay
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Net cash pay
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Cost to company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {rows.map((row) => (
                        <tr key={row.manager.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                {initialsOf(row.manager.fullName)}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {row.manager.fullName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {row.manager.email ?? 'No email'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {row.manager.roleName}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 truncate">
                            {row.manager.scope.officeName ??
                              row.manager.scope.districtName ??
                              row.manager.scope.provinceName ??
                              'No scope'}
                          </td>
                          <td className="px-6 py-3 text-right text-sm tabular-nums text-gray-700 dark:text-gray-300">
                            {(() => {
                              const rev = row.measuredRevenue;
                              if (rev === null) return row.loading ? '—' : '—';
                              return formatZMW(rev);
                            })()}
                          </td>
                          <td className="px-6 py-3 text-right">
                            {row.loading ? (
                              <span className="text-xs text-gray-400">—</span>
                            ) : row.computation?.qualification.tier ? (
                              <TierBadge
                                tier={row.computation.qualification.tier}
                                label={row.computation.qualification.label}
                                proposed={row.computation.qualification.status === 'proposed'}
                              />
                            ) : (
                              <span className="text-xs text-red-500 dark:text-red-400">Not qualified</span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-right text-sm tabular-nums text-gray-700 dark:text-gray-300">
                            {row.computation ? formatZMW(row.computation.grossPay) : '—'}
                          </td>
                          <td className="px-6 py-3 text-right text-sm tabular-nums text-emerald-600 dark:text-emerald-400 font-medium">
                            {row.computation ? formatZMW(row.computation.netCashPay) : '—'}
                          </td>
                          <td className="px-6 py-3 text-right text-sm tabular-nums text-gray-700 dark:text-gray-300">
                            {row.computation ? formatZMW(row.computation.totalCompanyCost) : '—'}
                          </td>
                          <td className="px-6 py-3 text-left">
                            {row.error ? (
                              <span className="text-xs text-red-500 dark:text-red-400">Error</span>
                            ) : row.loading ? (
                              <span className="text-xs text-gray-400 animate-pulse">Calculating…</span>
                            ) : row.saved ? (
                              <span className="text-xs text-emerald-600 dark:text-emerald-400">Submitted</span>
                            ) : (
                              <span className="text-xs text-gray-500 dark:text-gray-400">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                  Totals
                </h3>
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Managers calculated
                    </p>
                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                      {rows.length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Qualified for a tier
                    </p>
                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                      {qualifiedCount}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Total gross pay
                    </p>
                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                      {formatZMW(totalGrossPay)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Total cost to company
                    </p>
                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                      {formatZMW(totalCompanyCost)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <SecondaryButton onClick={() => setRows([])}>Clear results</SecondaryButton>
                <PrimaryButton
                  onClick={submitAll}
                  disabled={saving || !allCalculated || allSaved || rows.length === 0}
                >
                  {saving ? 'Submitting…' : 'Submit all for approval'}
                </PrimaryButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
