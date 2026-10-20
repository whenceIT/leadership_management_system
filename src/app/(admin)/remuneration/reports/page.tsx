'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  PageHeader,
  SectionCard,
  StatusBadge,
  TierBadge,
} from '@/components/remuneration/ui';
import { formatCompactZMW, formatMonth, formatZMW } from '@/lib/remuneration/format';
import { fetchSummary, summaryExportUrl, type SummaryResponse } from '@/services/RemunerationService';

export default function RemunerationReportsPage() {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [period, setPeriod] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (activePeriod: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchSummary(activePeriod || undefined);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load the remuneration report.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(period);
  }, [load, period]);

  const totals = data?.totals;
  const byTier = useMemo(
    () => (data?.byTier ?? []).filter((row) => row.key !== 'none'),
    [data]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Managerial remuneration"
        title="Remuneration reports"
        description="Payroll totals, role and tier breakdowns and a per-manager statement register. Export the register as CSV for the payroll run."
        actions={
          <>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="">All periods</option>
              {(data?.periods ?? []).map((item) => (
                <option key={item} value={item}>
                  {formatMonth(item)}
                </option>
              ))}
            </select>
            <a
              href={summaryExportUrl(period || undefined)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            >
              Export CSV
            </a>
          </>
        }
      />

      {error ? <ErrorState message={error} onRetry={() => load(period)} /> : null}

      {loading ? (
        <LoadingState label="Compiling the remuneration report…" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Gross pay"
              value={formatZMW(totals?.grossPay)}
              hint={`${totals?.statements ?? 0} statement(s) · ${totals?.managers ?? 0} manager(s)`}
              tone="brand"
            />
            <MetricCard
              label="Employee deductions"
              value={formatZMW(totals?.employeeDeductions)}
              hint="PAYE, NAPSA, NHIMA and pension"
            />
            <MetricCard
              label="Net cash pay"
              value={formatZMW(totals?.netCashPay)}
              tone="positive"
              hint="Payroll disbursement"
            />
            <MetricCard
              label="Total company cost"
              value={formatZMW(totals?.totalCompanyCost)}
              hint="Net pay plus employer statutory costs"
            />
            <MetricCard
              label="Benefits in kind"
              value={formatZMW(totals?.benefits)}
              hint="Housing, travel, fuel and insurance"
            />
            <MetricCard
              label="Housing allowance"
              value={formatZMW(totals?.housing)}
              hint="Managerial Housing Policy"
            />
            <MetricCard
              label="Bonus provision"
              value={formatZMW(totals?.bonus)}
              hint="Earned, subject to verification"
            />
            <MetricCard
              label="Employer statutory cost"
              value={formatZMW(totals?.employerCosts)}
              hint="Employer NAPSA, NHIMA and pension"
            />
            <MetricCard
              label="Total direct value"
              value={formatZMW(totals?.totalDirectValue)}
              hint="Gross pay plus benefits"
            />
            <MetricCard
              label="Average net per manager"
              value={
                totals && totals.managers > 0
                  ? formatZMW(Math.round(totals.netCashPay / totals.managers))
                  : '—'
              }
              hint="Across the selected period"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard
              title="Breakdown by managerial position"
              description="Where the remuneration budget is concentrated."
            >
              {(data?.byRole ?? []).length === 0 ? (
                <EmptyState
                  title="No data"
                  description="No statements have been calculated for the selected period."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700">
                        <th className="pb-3 pr-4 font-semibold">Position</th>
                        <th className="pb-3 pr-4 text-right font-semibold">Managers</th>
                        <th className="pb-3 pr-4 text-right font-semibold">Gross</th>
                        <th className="pb-3 pr-4 text-right font-semibold">Net</th>
                        <th className="pb-3 text-right font-semibold">Company cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {(data?.byRole ?? []).map((row) => (
                        <tr key={row.key}>
                          <td className="py-3 pr-4 font-medium text-gray-800 dark:text-gray-100">
                            {row.label}
                          </td>
                          <td className="py-3 pr-4 text-right tabular-nums text-gray-600 dark:text-gray-300">
                            {row.count}
                          </td>
                          <td className="py-3 pr-4 text-right tabular-nums text-gray-600 dark:text-gray-300">
                            {formatCompactZMW(row.grossPay)}
                          </td>
                          <td className="py-3 pr-4 text-right tabular-nums text-gray-600 dark:text-gray-300">
                            {formatCompactZMW(row.netCashPay)}
                          </td>
                          <td className="py-3 text-right tabular-nums font-semibold text-gray-900 dark:text-white">
                            {formatCompactZMW(row.totalCompanyCost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Breakdown by tier"
              description="Tiered managers against managers who did not qualify for a tier."
            >
              {byTier.length === 0 && (data?.byTier ?? []).length === 0 ? (
                <EmptyState
                  title="No data"
                  description="No statements have been calculated for the selected period."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700">
                        <th className="pb-3 pr-4 font-semibold">Tier</th>
                        <th className="pb-3 pr-4 text-right font-semibold">Managers</th>
                        <th className="pb-3 pr-4 text-right font-semibold">Gross</th>
                        <th className="pb-3 pr-4 text-right font-semibold">Net</th>
                        <th className="pb-3 text-right font-semibold">Company cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {(data?.byTier ?? []).map((row) => (
                        <tr key={row.key}>
                          <td className="py-3 pr-4">
                            <TierBadge
                              tier={row.key === 'none' ? null : Number(row.key)}
                              label={row.label}
                            />
                          </td>
                          <td className="py-3 pr-4 text-right tabular-nums text-gray-600 dark:text-gray-300">
                            {row.count}
                          </td>
                          <td className="py-3 pr-4 text-right tabular-nums text-gray-600 dark:text-gray-300">
                            {formatCompactZMW(row.grossPay)}
                          </td>
                          <td className="py-3 pr-4 text-right tabular-nums text-gray-600 dark:text-gray-300">
                            {formatCompactZMW(row.netCashPay)}
                          </td>
                          <td className="py-3 text-right tabular-nums font-semibold text-gray-900 dark:text-white">
                            {formatCompactZMW(row.totalCompanyCost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </div>

          <SectionCard
            title="Statement register"
            description={`${data?.statements.length ?? 0} statement(s)${
              period ? ` for ${formatMonth(period)}` : ' across all periods'
            }.`}
          >
            {(data?.statements ?? []).length === 0 ? (
              <EmptyState
                title="No statements"
                description="Run the calculator to produce statements for the period."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700">
                      <th className="pb-3 pr-4 font-semibold">Manager</th>
                      <th className="pb-3 pr-4 font-semibold">Position</th>
                      <th className="pb-3 pr-4 font-semibold">Tier</th>
                      <th className="pb-3 pr-4 font-semibold">Status</th>
                      <th className="pb-3 pr-4 text-right font-semibold">Gross</th>
                      <th className="pb-3 pr-4 text-right font-semibold">Deductions</th>
                      <th className="pb-3 pr-4 text-right font-semibold">Net</th>
                      <th className="pb-3 text-right font-semibold">Company cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {(data?.statements ?? []).map((statement) => (
                      <tr key={statement.id}>
                        <td className="py-3 pr-4">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {statement.managerName}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {statement.scopeLabel} · {formatMonth(statement.period)}
                          </p>
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">
                          {statement.roleName}
                        </td>
                        <td className="py-3 pr-4">
                          <TierBadge
                            tier={statement.qualification.tier}
                            label={statement.qualification.label}
                            proposed={statement.qualification.status === 'proposed'}
                          />
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={statement.status} />
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums text-gray-600 dark:text-gray-300">
                          {formatZMW(statement.grossPay)}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums text-red-600 dark:text-red-400">
                          {formatZMW(statement.deductions.total)}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums font-semibold text-gray-900 dark:text-white">
                          {formatZMW(statement.netCashPay)}
                        </td>
                        <td className="py-3 text-right tabular-nums text-gray-600 dark:text-gray-300">
                          {formatZMW(statement.totalCompanyCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
