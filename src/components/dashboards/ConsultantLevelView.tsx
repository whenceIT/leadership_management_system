'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { fetchOfficeUsers, OfficeUser, Loan } from '@/services/OfficeUserService';
import { useOffice } from '@/hooks/useOffice';
import { LoanConsultantMetricsService, LoanConsultantMetrics } from '@/services/LoanConsultantMetricsService';
import { fetchVacancyImpact } from '@/services/VacancyImpactService';
import { fetchLoanPortfolioLoad } from '@/services/LoanPortfolioLoadService';

interface ConsultantLevelViewProps {
  officeId: number | string;
  selectedKPI: string;
  onBack: () => void;
}

export function ConsultantLevelView({ officeId, selectedKPI, onBack }: ConsultantLevelViewProps) {
  interface EnrichedUser extends OfficeUser {
    totalDisbursed: number;
    defaultRate: number;
    defaultedLoans: number;
    totalLoans: number;
    previousCycleUncollected: number;
    metTarget40k: boolean;
    metUncollectedTarget: boolean;
    metBothTargets: boolean;
    metBonus50k: boolean;
    metBonus80k: boolean;
    metBonus120k: boolean;
    performance: number;
    target_achievement: number;
    productivityAchievement: number;
    pdua?: any;
    target_history: any[];
    total_collected?: number;
    total_uncollected?: number;
    still_uncollected?: number;
    carry_over?: number;
  }

  const [users, setUsers] = useState<EnrichedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); // 0 = current, 1 = last month, etc.
  const [managerCount, setManagerCount] = useState(0);
  const [vacancyImpactData, setVacancyImpactData] = useState<any>(null);
  const [portfolioLoadData, setPortfolioLoadData] = useState<any>(null);

  const LC_TARGET = 40000; // Benchmark from Operational Guidelines (K40,000)

  const { getOffice } = useOffice();
  const office = getOffice(officeId);
  const officeName = office?.name;

  // Branch Capacity & Staffing Adequacy
  const branchCapacity = office?.branchCapacity ? Number(office.branchCapacity) : null;
  const actualLCs = users.length;
  const staffingAdequacy = branchCapacity && branchCapacity > 0
    ? Math.round((actualLCs / branchCapacity) * 100)
    : null;
  const staffingStatus: 'good' | 'warning' | 'critical' =
    staffingAdequacy === null ? 'warning'
    : staffingAdequacy >= 90 ? 'good'
    : staffingAdequacy >= 70 ? 'warning'
    : 'critical';

  // Branch Age from created_at
  const branchAge = useMemo(() => {
    const raw = office?.createdAt;
    if (!raw) return null;
    const created = new Date(raw);
    if (isNaN(created.getTime())) return null;
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    if (years > 0) return `${years}y ${months}m`;
    if (months > 0) return `${months} month${months !== 1 ? 's' : ''}`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  }, [office]);

  const performancePeriod = useMemo(() => {
    const today = new Date();
    const baseMonth = today.getMonth() - selectedMonthOffset;
    const baseYear = today.getFullYear();

    // Adjust year if month goes negative
    const adjustedYear = baseMonth < 0 ? baseYear - 1 : baseYear;
    const adjustedMonth = ((baseMonth % 12) + 12) % 12;

    // Start: 24th of last month relative to selected
    const start = new Date(adjustedYear, adjustedMonth - 1, 24);
    // End: 24th of this month relative to selected
    const end = new Date(adjustedYear, adjustedMonth, 24);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return {
      start,
      end,
      label: `${formatDate(start)} - ${formatDate(end)}`
    };
  }, [selectedMonthOffset]);

  // Previous cycle period for checking uncollected
  const previousCyclePeriod = useMemo(() => {
    const today = new Date();
    const baseMonth = today.getMonth() - selectedMonthOffset;
    const baseYear = today.getFullYear();

    // Adjust year if month goes negative
    const adjustedYear = baseMonth < 0 ? baseYear - 1 : baseYear;
    const adjustedMonth = ((baseMonth % 12) + 12) % 12;

    // Previous cycle: 24th of 2 months ago to 24th of last month relative to selected
    const start = new Date(adjustedYear, adjustedMonth - 2, 24);
    const end = new Date(adjustedYear, adjustedMonth - 1, 24);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return {
      start,
      end,
      label: `${formatDate(start)} - ${formatDate(end)}`
    };
  }, [selectedMonthOffset]);

  const metricsService = useMemo(() => LoanConsultantMetricsService.getInstance(), []);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);

        // Format dates for API
        const formatISODate = (date: Date) => date.toISOString().split('T')[0];

        // Fetch metrics for current and previous periods
        const [currentMetrics, previousMetrics] = await Promise.all([
          metricsService.fetchConsultantsPerformanceByOffice(Number(officeId), formatISODate(performancePeriod.start), formatISODate(performancePeriod.end)),
          metricsService.fetchConsultantsPerformanceByOffice(Number(officeId), formatISODate(previousCyclePeriod.start), formatISODate(previousCyclePeriod.end))
        ]);

        // Create maps for quick lookup
        const currentMetricsMap = new Map(currentMetrics.map(m => [m.user_id, m]));
        const previousMetricsMap = new Map(previousMetrics.map(m => [m.user_id, m]));

        // Fetch users
        const officeUsersData = await fetchOfficeUsers(officeId);
        setManagerCount(officeUsersData.manager_users?.length || 0);

        // Fetch vacancy impact and portfolio load data for score calculation
        const [vacancyImpact, portfolioLoad] = await Promise.all([
          fetchVacancyImpact(Number(officeId)),
          fetchLoanPortfolioLoad(Number(officeId))
        ]);
        setVacancyImpactData(vacancyImpact);
        setPortfolioLoadData(portfolioLoad);

        // Enrich data with performance metrics
        const enriched = await Promise.all(officeUsersData.users.map(async user => {
          const currentMetric = currentMetricsMap.get(user.id);
          const previousMetric = previousMetricsMap.get(user.id);

          // Use API data where available, fallback to calculations
          const totalDisbursed = currentMetric ? parseFloat(currentMetric.given_out || '0') : (user.loans || []).reduce((sum, loan) => {
            const disbursementDate = loan.disbursed_date ? new Date(loan.disbursed_date) : null;
            if (disbursementDate && disbursementDate >= performancePeriod.start && disbursementDate <= performancePeriod.end) {
              return sum + (typeof loan.principal === 'number' ? loan.principal : parseFloat(loan.principal.toString() || '0'));
            }
            return sum;
          }, 0);

          // Calculate default rate from loans (API doesn't provide this)
          const now = new Date();
          const loansWithDefaults = (user.loans || []).filter(loan => {
            if (!loan.first_repayment_date) return false;
            const firstRepaymentDate = new Date(loan.first_repayment_date);
            const totalPaid = typeof loan.total_paid === 'number' ? loan.total_paid : parseFloat(loan.total_paid?.toString() || '0');
            return firstRepaymentDate < now && totalPaid === 0;
          });
          const totalLoans = (user.loans || []).filter(loan => loan.first_repayment_date).length;
          const defaultRate = totalLoans > 0 ? (loansWithDefaults.length / totalLoans) * 100 : 0;

          // Use API data for uncollected
          const previousCycleUncollected = previousMetric ? parseFloat(previousMetric.still_uncollected || '0') : 0;

          // Use API target_met_current if available, else calculate
          const metTarget40k = currentMetric ? currentMetric.target_met_current === 1 : totalDisbursed >= LC_TARGET;
          const metUncollectedTarget = previousCycleUncollected < 5000;
          const metBothTargets = metTarget40k && metUncollectedTarget;
          const metBonus50k = totalDisbursed >= 50000;
          const metBonus80k = totalDisbursed >= 80000;
          const metBonus120k = totalDisbursed >= 120000;

          const performance = (totalDisbursed / LC_TARGET) * 100;
          const productivityAchievement = Math.min(performance, 150);

          return {
            ...user,
            totalDisbursed,
            defaultRate,
            defaultedLoans: loansWithDefaults.length,
            totalLoans,
            previousCycleUncollected,
            metTarget40k,
            metUncollectedTarget,
            metBothTargets,
            metBonus50k,
            metBonus80k,
            metBonus120k,
            performance,
            target_achievement: totalDisbursed,
            productivityAchievement,
            // Add API fields
            pdua: currentMetric?.pdua,
            target_history: currentMetric?.target_history || [],
            total_collected: currentMetric?.total_collected !== undefined ? parseFloat(currentMetric.total_collected) : undefined,
            total_uncollected: currentMetric?.total_uncollected !== undefined ? parseFloat(currentMetric.total_uncollected) : undefined,
            still_uncollected: currentMetric?.still_uncollected !== undefined ? parseFloat(currentMetric.still_uncollected) : undefined,
            carry_over: currentMetric?.carry_over
          };
        }));

        // Sort by performance (highest first)
        enriched.sort((a: any, b: any) => b.performance - a.performance);

        setUsers(enriched);
      } catch (err) {
        console.error("Error loading office users:", err);
        setError(err instanceof Error ? err.message : 'Failed to load consultants');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [officeId, performancePeriod, previousCyclePeriod, metricsService]);

  // Tier badge: color + label driven off performance, single source of truth
  const getTier = (performance: number) => {
    if (performance >= 100) return { label: 'Elite', dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-900/30', ring: 'ring-emerald-600/20 dark:ring-emerald-400/20' };
    if (performance >= 80) return { label: 'High', dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-900/30', ring: 'ring-amber-600/20 dark:ring-amber-400/20' };
    return { label: 'Low', dot: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-900/30', ring: 'ring-rose-600/20 dark:ring-rose-400/20' };
  };

  const branchProductivity = useMemo(() => {
    if (users.length === 0) return null;
    const totalDisbursedSum = users.reduce((sum, user) => sum + user.totalDisbursed, 0);
    const avgDisbursedPerLC = totalDisbursedSum / users.length;
    const achievement = (avgDisbursedPerLC / LC_TARGET) * 100;
    return {
      avgDisbursedPerLC,
      achievement: Math.min(achievement, 150),
      meetsTarget: achievement >= 100
    };
  }, [users, LC_TARGET]);

  const isRiskDefaultsKPI = ['Default rate (branch, province, institutional)', 'Default aging analysis', 'Recovery rate within 1 month', 'Recovery rate within 3 months', 'Risk migration trends'].includes(selectedKPI);
  const isVacancyImpactKPI = selectedKPI === 'Vacancy Impact';
  const isPortfolioLoadBalanceKPI = selectedKPI === 'Portfolio Load Balance';

  const branchScore = useMemo(() => {
    if (users.length === 0) return null;
    if (selectedKPI.includes('Productivity Achievement') || selectedKPI === 'Productivity Achievement Score') {
      return branchProductivity?.achievement ?? null;
    }
    if (isVacancyImpactKPI && vacancyImpactData) {
      const authorizedPositions = vacancyImpactData.authorized_positions || 1;
      const vacancies = vacancyImpactData.vacancies || 0;
      const vacancyRatio = vacancies / authorizedPositions;
      return 100 * (1 - vacancyRatio);
    }
    if (isPortfolioLoadBalanceKPI && portfolioLoadData) {
      const portfolioPerLC = parseFloat(portfolioLoadData.portfolio_per_lc || '0');
      const optimalMid = (300000 + 380000) / 2;
      if (portfolioPerLC >= 300000 && portfolioPerLC <= 380000) {
        return 100;
      }
      const deviation = Math.abs(portfolioPerLC - optimalMid) / optimalMid * 100;
      return Math.max(0, 100 - deviation * 0.5);
    }
    const avgPerformance = users.reduce((sum, user) => sum + user.performance, 0) / users.length;
    return Math.min(avgPerformance, 100);
  }, [users, selectedKPI, branchProductivity, vacancyImpactData, portfolioLoadData, isVacancyImpactKPI, isPortfolioLoadBalanceKPI]);

  const avatarPalette = [
    'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    'bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    'bg-violet-50 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    'bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300',
  ];

  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-2">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-800 pb-5 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            title="Back"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Consultant Performance
            </p>
            <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
              {officeName || 'Branch'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:pl-12">
          <select
            value={selectedMonthOffset}
            onChange={(e) => setSelectedMonthOffset(parseInt(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600"
          >
            <option value={0}>Current Month</option>
            <option value={1}>Last Month</option>
            <option value={2}>2 Months Ago</option>
            <option value={3}>3 Months Ago</option>
            <option value={4}>4 Months Ago</option>
            <option value={5}>5 Months Ago</option>
          </select>
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-right dark:border-indigo-900 dark:bg-indigo-900/20">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">Monthly Target</div>
            <div className="font-mono text-sm font-bold tabular-nums text-indigo-900 dark:text-indigo-200">K{LC_TARGET.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Branch Info Strip */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Loan Consultants */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Loan Consultants</span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold tabular-nums text-gray-900 dark:text-white">{actualLCs}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">active</span>
          </div>
          <span className="mt-1 inline-block text-xs font-medium text-gray-500 dark:text-gray-400">
            {actualLCs >= 10 ? 'Optimal headcount' : actualLCs >= 8 ? 'Adequate headcount' : 'Understaffed'}
          </span>
        </div>

        {/* Branch Capacity + staffing bar */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Branch Capacity</span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
              {branchCapacity !== null ? branchCapacity : '—'}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">workspaces</span>
          </div>
          {staffingAdequacy !== null && (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className={`h-full rounded-full transition-all ${
                    staffingStatus === 'good' ? 'bg-emerald-500'
                    : staffingStatus === 'warning' ? 'bg-amber-500'
                    : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(staffingAdequacy, 100)}%` }}
                />
              </div>
              <span className={`font-mono text-xs font-bold tabular-nums ${
                staffingStatus === 'good' ? 'text-emerald-600 dark:text-emerald-400'
                : staffingStatus === 'warning' ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
              }`}>{Math.min(staffingAdequacy, 100)}%</span>
            </div>
          )}
        </div>

        {/* Performance Period */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Performance Period</span>
          <div className="mt-1.5 text-sm font-semibold leading-snug text-gray-900 dark:text-white">{performancePeriod.label}</div>
          <span className="mt-1 inline-block text-xs font-medium text-gray-500 dark:text-gray-400">24th–24th monthly cycle</span>
        </div>

        {/* Branch Age */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Branch Age</span>
          <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-gray-900 dark:text-white">{branchAge ?? '—'}</div>
          {office?.createdAt && (
            <span className="mt-1 inline-block text-xs font-medium text-gray-500 dark:text-gray-400">
              Est. {new Date(office.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* Managers */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Managers</span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold tabular-nums text-gray-900 dark:text-white">{managerCount}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">assigned</span>
          </div>
        </div>

        {/* Score */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Score</span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
              {branchScore !== null ? `${branchScore.toFixed(1)}%` : '—'}
            </span>
          </div>
          <span className="mt-1 inline-block text-xs text-gray-500 dark:text-gray-400">
            {selectedKPI.includes('Productivity Achievement') || selectedKPI === 'Productivity Achievement Score'
              ? 'Productivity Achievement'
              : 'Avg. Target Achievement'}
          </span>
        </div>
      </div>

      {/* Verdict Strip */}
      {branchCapacity !== null && selectedKPI === 'Staff Adequacy Score' && (
        <div className={`mb-3 flex items-center gap-3 rounded-xl p-2 ${
          branchCapacity >= actualLCs
            ? 'border-l-emerald-500 bg-emerald-50/60 dark:bg-emerald-900/10'
            : 'border-l-rose-500 bg-rose-50/60 dark:bg-rose-900/10'
        }`}>
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            branchCapacity >= actualLCs ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-rose-100 dark:bg-rose-900/40'
          }`}>
            {branchCapacity >= actualLCs ? (
              <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <div className="text-sm">
            <span className={`font-bold ${branchCapacity >= actualLCs ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'}`}>
              {branchCapacity >= actualLCs ? 'Adequate workspaces' : 'Insufficient workspaces'}
            </span>
            <span className="ml-1.5 text-gray-600 dark:text-gray-400">
              {branchCapacity >= actualLCs
                ? `Branch capacity (${branchCapacity}) accommodates all ${actualLCs} LCs, with ${branchCapacity - actualLCs} workspace${branchCapacity - actualLCs !== 1 ? 's' : ''} to spare.`
                : `Branch capacity (${branchCapacity}) falls short for ${actualLCs} LCs — ${actualLCs - branchCapacity} LC${actualLCs - branchCapacity !== 1 ? 's' : ''} lack${actualLCs - branchCapacity === 1 ? 's' : ''} a proper workspace.`}
            </span>
          </div>
        </div>
       )}
 
       {branchProductivity && (
         <div className={`mb-3 flex items-center gap-3 rounded-xl p-2 ${
           branchProductivity.meetsTarget
             ? 'border-l-emerald-500 bg-emerald-50/60 dark:bg-emerald-900/10'
             : 'border-l-amber-500 bg-amber-50/60 dark:bg-amber-900/10'
         }`}>
           <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
             branchProductivity.meetsTarget ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-amber-100 dark:bg-amber-900/40'
           }`}>
             {branchProductivity.meetsTarget ? (
               <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 0 0118 0z" />
               </svg>
             ) : (
               <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
             )}
           </div>
            <div className="text-sm">
              <span className={`font-bold ${branchProductivity.meetsTarget ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}`}>
                {branchProductivity.meetsTarget ? 'Productivity target achieved' : 'Below productivity target'}
              </span>
              <span className="ml-1.5 text-gray-600 dark:text-gray-400">
                Average disbursement per LC is K{Math.round(branchProductivity.avgDisbursedPerLC).toLocaleString()} ({branchProductivity.achievement.toFixed(1)}% of K40,000 target).
              </span>
            </div>
          </div>
        )}

         {(selectedKPI === 'Productivity Achievement' || selectedKPI === 'Productivity Achievement Score') && (
           <div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-900 dark:bg-blue-900/20">
             <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <p className="text-xs text-blue-700 dark:text-blue-300">
               The Avg Disbursement per LC is calculated from the total amount disbursed by all Loan Consultants (LCs), divided by the number of LCs.
             </p>
           </div>
         )}

         {isVacancyImpactKPI && branchScore !== null && (
           <>
             <div className={`mt-3 flex items-center gap-3 rounded-xl p-2 ${
               branchScore >= 90
                 ? 'border-l-emerald-500 bg-emerald-50/60 dark:bg-emerald-900/10'
                 : branchScore >= 75
                   ? 'border-l-amber-500 bg-amber-50/60 dark:bg-amber-900/10'
                   : 'border-l-rose-500 bg-rose-50/60 dark:bg-rose-900/10'
             }`}>
               <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                 branchScore >= 90 ? 'bg-emerald-100 dark:bg-emerald-900/40' : branchScore >= 75 ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-rose-100 dark:bg-rose-900/40'
               }`}>
                 {branchScore >= 90 ? (
                   <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                 ) : branchScore >= 75 ? (
                   <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                   </svg>
                 ) : (
                   <svg className="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                   </svg>
                 )}
               </div>
               <div className="text-sm">
                 <span className={`font-bold ${branchScore >= 90 ? 'text-emerald-800 dark:text-emerald-300' : branchScore >= 75 ? 'text-amber-800 dark:text-amber-300' : 'text-rose-800 dark:text-rose-300'}`}>
                   {branchScore >= 90 ? 'No vacancies' : branchScore >= 75 ? 'Low vacancies' : 'High vacancies'}
                 </span>
                 <span className="ml-1.5 text-gray-600 dark:text-gray-400">
                   Vacancy Impact score is {branchScore.toFixed(1)}% (1 - Vacancies / Authorized Positions). Target: 0 vacancies.
                 </span>
               </div>
             </div>
             <div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-900 dark:bg-blue-900/20">
               <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <p className="text-xs text-blue-700 dark:text-blue-300">
                 Vacancy Impact: 1 - (Vacancies / Authorized Positions). 0 vacancies.
               </p>
             </div>
           </>
         )}

         {isPortfolioLoadBalanceKPI && branchScore !== null && (
           <>
             <div className={`mt-3 flex items-center gap-3 rounded-xl p-2 ${
               branchScore >= 100
                 ? 'border-l-emerald-500 bg-emerald-50/60 dark:bg-emerald-900/10'
                 : branchScore >= 70
                   ? 'border-l-amber-500 bg-amber-50/60 dark:bg-amber-900/10'
                   : 'border-l-rose-500 bg-rose-50/60 dark:bg-rose-900/10'
             }`}>
               <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                 branchScore >= 100 ? 'bg-emerald-100 dark:bg-emerald-900/40' : branchScore >= 70 ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-rose-100 dark:bg-rose-900/40'
               }`}>
                 {branchScore >= 100 ? (
                   <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                 ) : branchScore >= 70 ? (
                   <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                   </svg>
                 ) : (
                   <svg className="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                   </svg>
                 )}
               </div>
               <div className="text-sm">
                 <span className={`font-bold ${branchScore >= 100 ? 'text-emerald-800 dark:text-emerald-300' : branchScore >= 70 ? 'text-amber-800 dark:text-amber-300' : 'text-rose-800 dark:text-rose-300'}`}>
                   {branchScore >= 100 ? 'Within optimal range' : branchScore >= 70 ? 'Near optimal range' : 'Outside optimal range'}
                 </span>
                 <span className="ml-1.5 text-gray-600 dark:text-gray-400">
                   Portfolio Load Balance score is {branchScore.toFixed(1)}%. Optimal Range: K300k-K380k per LC.
                 </span>
               </div>
             </div>
             <div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-900 dark:bg-blue-900/20">
               <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <p className="text-xs text-blue-700 dark:text-blue-300">
                 Portfolio Load Balance: Optimal Range K300k-K380k per LC. Score based on deviation from optimal midpoint. Within range: 100%. If outside: 100% - (deviation%/optimal)×50.
               </p>
             </div>
           </>
         )}
  
        {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600 dark:border-gray-800 dark:border-t-indigo-400"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Analyzing consultant performance…</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center dark:border-rose-900 dark:bg-rose-900/20">
          <p className="font-semibold text-rose-700 dark:text-rose-400">{error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No loan consultants found for this branch and period.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900/60">
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Consultant</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Clients</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Disbursed</th>
                  {selectedKPI === 'Productivity Achievement' ? (
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Productivity Achievement Score</th>
                  ) : (
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Target Achievement</th>
                  )}
                  {isRiskDefaultsKPI && (
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Default Rate</th>
                  )}
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Targets Met</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {users.map((user: any, idx: number) => {
                  const tier = getTier(user.performance);
                  const avatarClasses = avatarPalette[idx % avatarPalette.length];
                  return (
                    <tr key={user.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarClasses}`}>
                            {user.first_name[0]}{user.last_name[0]}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-sm tabular-nums text-gray-600 dark:text-gray-300">
                        {user.clients?.length || 0}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
                        K{user.totalDisbursed.toLocaleString()}
                      </td>
                  {(selectedKPI === 'Productivity Achievement' || selectedKPI === 'Productivity Achievement Score') ? (
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                              <div
                                className={`h-full rounded-full ${user.productivityAchievement >= 100 ? 'bg-emerald-500' : user.productivityAchievement >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                style={{ width: `${Math.min((user.productivityAchievement / 150) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="font-mono text-xs font-semibold tabular-nums text-gray-600 dark:text-gray-300">
                              {user.productivityAchievement.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      ) : (
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                              <div
                                className={`h-full rounded-full ${user.performance >= 70 ? 'bg-emerald-500' : user.performance >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                style={{ width: `${Math.min(user.performance, 100)}%` }}
                              ></div>
                            </div>
                            <span className="font-mono text-xs font-semibold tabular-nums text-gray-600 dark:text-gray-300">
                              {Math.min(user.performance, 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      )}
                      {isRiskDefaultsKPI && (
                        <td className="whitespace-nowrap px-5 py-4">
                          {user.totalLoans > 0 ? (
                           <div className="flex flex-col">
                             <span className={`font-mono text-sm font-bold tabular-nums ${
                               user.defaultRate <= 10 ? 'text-emerald-600 dark:text-emerald-400'
                               : user.defaultRate <= 28 ? 'text-amber-600 dark:text-amber-400'
                               : 'text-rose-600 dark:text-rose-400'
                             }`}>
                               {user.defaultRate.toFixed(1)}%
                             </span>
                             <span className="text-xs text-gray-400 dark:text-gray-500">
                               {user.defaultedLoans}/{user.totalLoans} loans
                             </span>
                           </div>
                         ) : (
                           <span className="text-sm text-gray-300 dark:text-gray-600">—</span>
                         )}
                        </td>
                      )}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ${
                            user.metTarget40k
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {user.metTarget40k ? '✓' : '·'} K40k
                          </span>
                          {user.metBonus50k && (
                            <span className="inline-flex items-center rounded-md bg-violet-50 px-1.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                              ★ K50k
                            </span>
                          )}
                          {user.metBonus80k && (
                            <span className="inline-flex items-center rounded-md bg-violet-50 px-1.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                              ★★ K80k
                            </span>
                          )}
                          {user.metBonus120k && (
                            <span className="inline-flex items-center rounded-md bg-violet-50 px-1.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                              ★★★ K120k
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${tier.bg} ${tier.text} ${tier.ring}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${tier.dot}`}></span>
                          {tier.label.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}