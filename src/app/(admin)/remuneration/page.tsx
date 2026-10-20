'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { PageHeader, MetricCard, SectionCard, LoadingState, ErrorState, TierBadge, EmptyState } from '@/components/remuneration/ui';
import { formatMonth, formatZMW, periodList } from '@/lib/remuneration/format';
import {
  fetchStructure,
  fetchSummary,
  summaryExportUrl,
  type StructureResponse,
  type SummaryResponse,
} from '@/services/RemunerationService';

export default function RemunerationOverviewPage() {
  const [period, setPeriod] = useState<string>('');
  const [periods, setPeriods] = useState<string[]>([]);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [structure, setStructure] = useState<StructureResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (selectedPeriod: string) => {
    setLoading(true);
    setError(null);
    try {
      const [summaryResponse, structureResponse] = await Promise.all([
        fetchSummary(selectedPeriod || undefined),
        fetchStructure(),
      ]);
      setSummary(summaryResponse);
      setStructure(structureResponse);
      setPeriods(summaryResponse.periods.length ? summaryResponse.periods : periodList());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load remuneration data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load('');
  }, [load]);

  const totals = summary?.totals;
  const confirmed = useMemo(
    () => structure?.confirmationChecklist.filter((item) => item.status === 'confirmed').length ?? 0,
    [structure]
  );
  const checklistTotal = structure?.confirmationChecklist.length ?? 7;

  const composition = useMemo(() => {
    if (!totals) return [];
    return [
      { label: 'Gross pay to managers', value: totals.grossPay, color: 'bg-brand-500' },
      {
        label: 'Employer statutory & pension costs',
        value: totals.employerCosts,
        color: 'bg-violet-500',
      },
      { label: 'Housing paid to landlords', value: totals.housing, color: 'bg-emerald-500' },
      {
        label: 'Other employer paid benefits',
        value: Math.max(0, totals.benefits - totals.housing),
        color: 'bg-amber-500',
      },
    ];
  }, [totals]);

  const compositionTotal = composition.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Managerial remuneration"
        title="Remuneration command centre"
        description="Calculate what each manager qualifies to earn, what they receive after deductions, and what the arrangement costs the company — with every step auditable."
        actions={
          <>
            <select
              value={period}
              onChange={(event) => {
                setPeriod(event.target.value);
                load(event.target.value);
              }}
              className="rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="">All periods</option>
              {periods.map((item) => (
                <option key={item} value={item}>
                  {formatMonth(item)}
                </option>
              ))}
            </select>
            <Link
              href="/remuneration/calculator"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
            >
              Calculate a statement
            </Link>
          </>
        }
      />

      {loading ? (
        <LoadingState label="Loading remuneration overview…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load(period)} />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total company cost"
              value={formatZMW(totals?.totalCompanyCost ?? 0)}
              hint={period ? formatMonth(period) : 'Across every calculated period'}
              tone="brand"
            />
            <MetricCard
              label="Gross pay"
              value={formatZMW(totals?.grossPay ?? 0)}
              hint="Cash salary before statutory deductions"
            />
            <MetricCard
              label="Net cash pay"
              value={formatZMW(totals?.netCashPay ?? 0)}
              hint="Paid into managers' bank accounts"
              tone="positive"
            />
            <MetricCard
              label="Managers calculated"
              value={String(totals?.managers ?? 0)}
              hint={`${totals?.statements ?? 0} statement${totals?.statements === 1 ? '' : 's'} in the history`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                href: '/remuneration/managers',
                step: '01',
                title: 'Select the manager',
                description: 'Link the person to a managerial position, a scope and an effective period.',
              },
              {
                href: '/remuneration/calculator',
                step: '02',
                title: 'Assess and calculate',
                description: 'Pull the performance result, confirm the qualifying tier and run the engine.',
              },
              {
                href: '/remuneration/approvals',
                step: '03',
                title: 'Verify and approve',
                description: 'Review the statement, record the audit trail and authorise the figures.',
              },
              {
                href: '/remuneration/reports',
                step: '04',
                title: 'Report to payroll',
                description: 'Consolidate the cost and export the payroll ready file.',
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-500/50"
              >
                <span className="text-xs font-bold tracking-[0.14em] text-brand-500">
                  {item.step}
                </span>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <SectionCard
              className="xl:col-span-2"
              title="Where the money goes"
              description="The full cash outflow of the remuneration framework."
            >
              {compositionTotal === 0 ? (
                <EmptyState
                  title="No calculated remuneration yet"
                  description="Run a calculation to see how the monthly cost of the framework is made up."
                  action={
                    <Link
                      href="/remuneration/calculator"
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      Calculate a statement
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-5">
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    {composition.map((item) => (
                      <div
                        key={item.label}
                        className={item.color}
                        style={{ width: `${(item.value / compositionTotal) * 100}%` }}
                        title={`${item.label}: ${formatZMW(item.value)}`}
                      />
                    ))}
                  </div>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {composition.map((item) => (
                      <li
                        key={item.label}
                        className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-700"
                      >
                        <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                          {item.label}
                        </span>
                        <span className="text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
                          {formatZMW(item.value)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Framework readiness"
              description="Decisions management must confirm before the engine is final."
            >
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {confirmed}
                  <span className="text-lg font-medium text-gray-400"> of {checklistTotal}</span>
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  requirements confirmed with management
                </p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${checklistTotal ? (confirmed / checklistTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {(structure?.confirmationChecklist ?? []).map((item) => (
                  <li key={item.key} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <span
                      className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        item.status === 'confirmed' ? 'bg-emerald-500' : 'bg-amber-400'
                      }`}
                    />
                    <span>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">
                        {item.title}
                      </span>
                      <br />
                      <span className="text-gray-400">{item.question}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/remuneration/structure"
                className="mt-4 inline-block text-xs font-semibold text-brand-500 hover:text-brand-600"
              >
                Open the structure and rules →
              </Link>
            </SectionCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard
              title="Cost by managerial role"
              description="Where the monthly cost is concentrated."
              actions={
                <Link
                  href="/remuneration/reports"
                  className="text-xs font-semibold text-brand-500 hover:text-brand-600"
                >
                  Full report →
                </Link>
              }
            >
              {!summary?.byRole.length ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No calculations recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700">
                        <th className="pb-2 font-semibold">Role</th>
                        <th className="pb-2 text-right font-semibold">Managers</th>
                        <th className="pb-2 text-right font-semibold">Net cash pay</th>
                        <th className="pb-2 text-right font-semibold">Company cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {summary.byRole.map((row) => (
                        <tr key={row.key}>
                          <td className="py-2.5 font-medium text-gray-800 dark:text-gray-100">
                            {row.label}
                          </td>
                          <td className="py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">
                            {row.count}
                          </td>
                          <td className="py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">
                            {formatZMW(row.netCashPay)}
                          </td>
                          <td className="py-2.5 text-right tabular-nums font-semibold text-gray-900 dark:text-white">
                            {formatZMW(row.totalCompanyCost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Tier distribution"
              description="How many managers qualified at each tier."
            >
              {!summary?.byTier.length ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No calculations recorded yet.</p>
              ) : (
                <ul className="space-y-3">
                  {summary.byTier.map((row) => {
                    const tierNumber = Number(row.key.split('-')[1]);
                    const max = Math.max(...summary.byTier.map((item) => item.count), 1);
                    return (
                      <li key={row.key} className="flex items-center gap-4">
                        <TierBadge tier={tierNumber || null} label={row.label} />
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                          <div
                            className="h-full rounded-full bg-brand-500"
                            style={{ width: `${(row.count / max) * 100}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
                          {row.count}
                        </span>
                        <span className="w-28 text-right text-xs tabular-nums text-gray-500 dark:text-gray-400">
                          {formatZMW(row.totalCompanyCost)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </SectionCard>
          </div>

          <SectionCard
            title="Payroll export"
            description="A payroll ready file of every calculated statement, with gross pay, deductions, benefits and employer cost separated."
            actions={
              <a
                href={summaryExportUrl(period || undefined)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Download CSV
              </a>
            }
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              The export separates employee deductions from employer contributions and marks
              every allowance as either inside gross pay or employer paid, so payroll and
              finance can reconcile without double counting.
            </p>
          </SectionCard>
        </>
      )}
    </div>
  );
}
