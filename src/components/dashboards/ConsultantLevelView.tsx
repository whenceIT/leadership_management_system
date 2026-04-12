'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { fetchOfficeUsers, OfficeUser, Loan } from '@/services/OfficeUserService';
import { useOffice } from '@/hooks/useOffice';
import { LoanConsultantMetricsService, LoanConsultantMetrics } from '@/services/LoanConsultantMetricsService';

interface ConsultantLevelViewProps {
  officeId: number | string;
  selectedKPI: string;
  onBack: () => void;
}

export function ConsultantLevelView({ officeId, selectedKPI, onBack }: ConsultantLevelViewProps) {
  const [users, setUsers] = useState<OfficeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); // 0 = current, 1 = last month, etc.

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
        const data = await fetchOfficeUsers(officeId);

        // Enrich data with performance metrics
        const enriched = await Promise.all(data.map(async user => {
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
            // Add API fields
            pdua: currentMetric?.pdua,
            target_history: currentMetric?.target_history || [],
            total_collected: currentMetric?.total_collected,
            total_uncollected: currentMetric?.total_uncollected,
            still_uncollected: currentMetric?.still_uncollected,
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

  const getStatusColor = (performance: number) => {
    if (performance >= 100) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (performance >= 80) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  return (
    <div className="bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mr-4 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 transform hover:scale-105"
            title="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Loan Consultant Performance {officeName && <span className="text-blue-600 dark:text-blue-400">| {officeName}</span>}
            </h2>
            <div className="flex items-center mt-1 gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Performance Period: {performancePeriod.label}
              </span>
              <select
                value={selectedMonthOffset}
                onChange={(e) => setSelectedMonthOffset(parseInt(e.target.value))}
                className="text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
              >
                <option value={0}>Current Month</option>
                <option value={1}>Last Month</option>
                <option value={2}>2 Months Ago</option>
                <option value={3}>3 Months Ago</option>
                <option value={4}>4 Months Ago</option>
                <option value={5}>5 Months Ago</option>
              </select>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Monthly Target: <span className="font-semibold text-gray-900 dark:text-white">K{LC_TARGET.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Branch Info Strip */}
      <div className="grid grid-cols-4 gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-700">
        {/* Actual LCs */}
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Loan Consultants</span>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-white">
              {actualLCs}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">LCs</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {actualLCs >= 10 ? 'Optimal' : actualLCs >= 8 ? 'Adequate' : 'Understaffed'}
          </span>
        </div>

        {/* Branch Capacity */}
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Branch Capacity</span>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-white">
              {branchCapacity !== null ? branchCapacity : '--'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">workspaces</span>
          </div>
          {staffingAdequacy !== null && (
            <>
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Staff Adequacy</span>
              <div className="flex items-center mt-1 gap-1.5">
            </>)
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${
                    staffingStatus === 'good' ? 'bg-green-500'
                    : staffingStatus === 'warning' ? 'bg-yellow-500'
                    : 'bg-red-500'
                  }`}
                style={{ width: `${Math.min(staffingAdequacy, 100)}%` }}
              />
            </div>
              <span className={`text-xs font-bold ${
                staffingStatus === 'good' ? 'text-green-600 dark:text-green-400'
                : staffingStatus === 'warning' ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
              }`}>{Math.min(staffingAdequacy, 100)}%</span>
              </div>
            </>
          )}
        </div>

        {/* Performance Period */}
        <div className="flex flex-col border-x border-gray-200 dark:border-gray-700 px-3">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Performance Period</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{performancePeriod.label}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">24th–24th Monthly Cycle</span>
        </div>

        {/* Branch Age */}
        <div className="flex flex-col pl-1">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Branch Age</span>
          <span className="text-2xl font-black text-gray-900 dark:text-white">{branchAge ?? '--'}</span>
          {office?.createdAt && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Est. {new Date(office.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* Verdict Strip */}
      {branchCapacity !== null && (
        <div className={`mb-6 p-4 rounded-xl border ${
          branchCapacity >= actualLCs 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-3">
            {branchCapacity >= actualLCs ? (
              <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <div className="text-sm">
              <span className={`font-bold ${
                branchCapacity >= actualLCs 
                  ? 'text-green-800 dark:text-green-300' 
                  : 'text-red-800 dark:text-red-300'
              }`}>
                VERDICT: {branchCapacity >= actualLCs ? 'ADEQUATE WORKSPACES' : 'INSUFFICIENT WORKSPACES'}
              </span>
              <span className={`ml-2 ${
                branchCapacity >= actualLCs 
                  ? 'text-green-700 dark:text-green-400' 
                  : 'text-red-700 dark:text-red-400'
              }`}>
                {branchCapacity >= actualLCs 
                  ? `Branch capacity (${branchCapacity}) accommodates all ${actualLCs} LCs with ${branchCapacity - actualLCs} workspace${branchCapacity - actualLCs !== 1 ? 's' : ''} available.`
                  : `Branch capacity (${branchCapacity}) is insufficient for ${actualLCs} LCs. ${actualLCs - branchCapacity} LC${actualLCs - branchCapacity !== 1 ? 's' : ''} lack${actualLCs - branchCapacity === 1 ? 's' : ''} proper workspace/station.`}
              </span>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Analyzing consultant performance...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
          <p className="font-semibold text-center">{error}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Consultant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clients</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Disbursed</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target Achievement</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Default Rate</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">No. Targets Met</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                        {user.first_name[0]}{user.last_name[0]}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {user.clients?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                    K{user.totalDisbursed.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 max-w-[100px]">
                      <div 
                        className={`h-2.5 rounded-full ${user.performance >= 70 ? 'bg-green-500' : user.performance >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                        style={{ width: `${Math.min(user.performance, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium ml-2 text-gray-700 dark:text-gray-300">
                      {Math.min(user.performance, 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.totalLoans > 0 ? (
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${
                          user.defaultRate <= 10 ? 'text-green-600 dark:text-green-400'
                          : user.defaultRate <= 28 ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                        }`}>
                          {user.defaultRate.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {user.defaultedLoans}/{user.totalLoans} loans
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">--</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs font-medium ${user.metTarget40k ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {user.metTarget40k ? '✓' : '✗'} K40k Disbursed
                      </span>
                      {/* <span className={`text-xs font-medium ${user.metUncollectedTarget ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {user.metUncollectedTarget ? '✓' : '✗'} &lt;K5k Uncollected
                      </span> */}
                      {user.metBonus50k && (
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                          ★ K50k+ Bonus
                        </span>
                      )}
                      {user.metBonus80k && (
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                          ★★ K80k+ Bonus
                        </span>
                      )}
                      {user.metBonus120k && (
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                          ★★★ K120k+ Bonus
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(user.performance)}`}>
                      {user.performance >= 100 ? 'ELITE' : user.performance >= 80 ? 'HIGH' : 'LOW'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
