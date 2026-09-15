'use client';

import React, { useMemo } from 'react';
import { CashHealthBranchData, getCurrentCycleStart, getCurrentCycleEnd } from '@/services/CashPositionService';
import { getOfficeNameById, useOffice } from '@/hooks/useOffice';

function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null || isNaN(Number(value))) return '—';
  return new Intl.NumberFormat('en-ZM', {
    style: 'currency', currency: 'ZMW', maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatNumber(value: number | undefined): string {
  if (value === undefined || value === null || isNaN(Number(value))) return '—';
  return Number(value).toLocaleString();
}

interface BranchCashHealthViewProps {
  data: CashHealthBranchData;
}

// Central status → color mapping, reused across badge, border accent, and bars
function statusTone(status?: string) {
  switch (status) {
    case 'GREEN':
      return {
        dot: 'bg-emerald-500',
        text: 'text-emerald-700 dark:text-emerald-400',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-500/10',
        badgeBorder: 'border-emerald-200 dark:border-emerald-500/30',
        stripe: 'bg-emerald-500',
        bar: 'bg-emerald-500',
      };
    case 'AMBER':
    case 'YELLOW':
      return {
        dot: 'bg-amber-500',
        text: 'text-amber-700 dark:text-amber-400',
        badgeBg: 'bg-amber-50 dark:bg-amber-500/10',
        badgeBorder: 'border-amber-200 dark:border-amber-500/30',
        stripe: 'bg-amber-500',
        bar: 'bg-amber-500',
      };
    case 'RED':
      return {
        dot: 'bg-red-500',
        text: 'text-red-700 dark:text-red-400',
        badgeBg: 'bg-red-50 dark:bg-red-500/10',
        badgeBorder: 'border-red-200 dark:border-red-500/30',
        stripe: 'bg-red-500',
        bar: 'bg-red-500',
      };
    default:
      return {
        dot: 'bg-slate-400',
        text: 'text-slate-600 dark:text-slate-400',
        badgeBg: 'bg-slate-50 dark:bg-slate-500/10',
        badgeBorder: 'border-slate-200 dark:border-slate-500/30',
        stripe: 'bg-slate-400',
        bar: 'bg-slate-400',
      };
  }
}

function StatusBadge({ status }: { status?: string }) {
  const tone = statusTone(status);
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-semibold border ${tone.badgeBg} ${tone.badgeBorder} ${tone.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {status || 'UNKNOWN'}
    </span>
  );
}

// Flat, thin gauge — score bands drive color independently of overall status
function ScoreBar({ label, score, weight }: { label: string; score?: number; weight?: string }) {
  const pct = Math.min(100, Math.max(0, score ?? 0));
  const barColor = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="flex-1 min-w-[140px]">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {label}{weight ? <span className="text-slate-400 dark:text-slate-500"> · {weight}</span> : null}
        </span>
        <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">{score ?? '—'}</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Compact label/value row for the financial ledger — replaces boxed stat cards
function Row({ label, value, tone }: { label: string; value: string; tone?: 'pos' | 'neg' | 'neutral' }) {
  const valueColor =
    tone === 'pos' ? 'text-emerald-600 dark:text-emerald-400'
    : tone === 'neg' ? 'text-red-600 dark:text-red-400'
    : 'text-slate-900 dark:text-white';
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-[13px] text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`text-[13px] font-semibold tabular-nums ${valueColor}`}>{value}</span>
    </div>
  );
}

export default function BranchCashHealthView({ data }: BranchCashHealthViewProps) {
  const financials = data.financials || {};
  const scores = data.scores || {};
  const cycle = data.cycle;
  const details = data.details as any;
  const reserveBreakdown = data.reserve_breakdown as Record<string, number> | undefined;

  const overallScore = scores.overall;
  const status = scores.status;
  const tone = statusTone(status || undefined);

  const resolvedOfficeName = useMemo(() => {
    if (data.office_name && data.office_name !== `Office ${data.office_id}`) {
      return data.office_name;
    }
    if (data.office_id) {
      const resolved = getOfficeNameById(data.office_id);
      if (resolved) return resolved;
    }
    return data.office_name || '-';
  }, [data.office_name, data.office_id]);

  return (
    <div className="space-y-3 text-sm">
      {/* Header */}
      <div className={`relative bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 pl-4 pr-4 py-3 overflow-hidden`}>
        <span className={`absolute left-0 top-0 h-full w-1 ${tone.stripe}`} />
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
             <h2 className="text-base font-semibold text-slate-900 dark:text-white leading-tight">
                {resolvedOfficeName}
             </h2>
              <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                live
              </span>
            </div>
             <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">
               {getCurrentCycleStart()} → {getCurrentCycleEnd()}
             </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums leading-none">
                {overallScore != null ? overallScore : '—'}
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">/100</span>
              </div>
            </div>
            <StatusBadge status={status || undefined} />
          </div>
        </div>

        {data.reason && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[12px] text-slate-500 dark:text-slate-400">{data.reason}</p>
          </div>
        )}
      </div>

      {/* Sub-scores — single strip, not three duplicate cards */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-3 flex flex-wrap gap-4">
        <ScoreBar label="Disbursement" weight="35%" score={scores.disbursement} />
        <ScoreBar label="Collection quality" weight="35%" score={scores.collection} />
        <ScoreBar label="Residual cash" weight="30%" score={scores.residual_cash} />
      </div>

      {/* Cash position ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-3">
        <h3 className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Cash position</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <div>
            <Row label="Residual cash" value={formatCurrency(financials.residual_cash)} tone={Number(financials.residual_cash) >= 0 ? 'pos' : 'neg'} />
            <Row label="Net cash position" value={formatCurrency(financials.net_cash_position)} tone={Number(financials.net_cash_position) >= 0 ? 'pos' : 'neg'} />
            <Row label="Minimum loan target" value={formatCurrency(financials.minimum_loan_target)} />
          </div>
          <div>
            <Row label="Maximum expected repayment" value={formatCurrency(financials.maximum_expected_repayment)} />
            <Row label="Defaults" value={formatCurrency(financials.defaults)} tone="neg" />
            <Row label="Irregular cost reserve" value={formatCurrency(financials.irregular_cost_reserve)} />
          </div>
        </div>
      </div>

      {/* Activity & reserve breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-3">
          <h3 className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Activity</h3>
          <Row label="Total disbursed" value={formatCurrency(data.disbursed)} />
          <Row label="Total collected" value={formatCurrency(data.collected)} />
          <Row label="Salary advance reserve" value={formatCurrency(financials.salary_advance_reserve)} />
        </div>

        {reserveBreakdown && Object.keys(reserveBreakdown).length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-3">
            <h3 className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Reserve breakdown</h3>
            {Object.entries(reserveBreakdown).map(([key, value]) => (
              <Row key={key} label={key.replace(/_/g, ' ')} value={formatCurrency(value as number)} />
            ))}
          </div>
        )}
      </div>

      {/* Salary planning */}
      {details?.salaries && (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-3">
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">Salary planning</h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              cycle {details.salaries.cycle_start || cycle?.start_date || '—'}
            </span>
          </div>

          <div className="overflow-x-auto -mx-1">
            <table className="min-w-full text-[12px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-1 py-1.5 text-left font-medium text-slate-400 dark:text-slate-500">Consultant</th>
                  <th className="px-1 py-1.5 text-center font-medium text-slate-400 dark:text-slate-500">Target level</th>
                  <th className="px-1 py-1.5 text-center font-medium text-slate-400 dark:text-slate-500">Reached K40k / 3mo</th>
                  <th className="px-1 py-1.5 text-right font-medium text-slate-400 dark:text-slate-500">Predicted salary</th>
                </tr>
              </thead>
              <tbody>
                {(details.salaries.consultants || []).map((c: any) => (
                  <tr key={c.user_id} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                    <td className="px-1 py-1.5 font-medium text-slate-800 dark:text-slate-200">{c.name || '—'}</td>
                    <td className="px-1 py-1.5 text-center text-slate-500 dark:text-slate-400 tabular-nums">{c.current_target_level ?? '—'}</td>
                    <td className="px-1 py-1.5 text-center">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        c.reached_40000_last_3_months
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${c.reached_40000_last_3_months ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        {c.reached_40000_last_3_months ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-1 py-1.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">{formatCurrency(c.predicted_salary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {details.salaries.total_salary != null && (
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Total salary</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{formatCurrency(details.salaries.total_salary)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}