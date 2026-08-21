'use client';

import React, { useState, useEffect } from 'react';
import { useProvincialData } from '@/hooks/useProvincialData';
import { calculateCashPositionScore, kpiConfigs, calculateProvinceInstitutionAvg } from './ProvinceInstitutionAvg';
import { KpiSummaryHeader } from './KpiSummaryHeader';
import { getActualLCs } from '@/lib/staffing';

interface ProvinceLevelViewProps {
  selectedKPI: string | null;
  onProvinceClick: (provinceId: number) => void;
  onInstitutionAvgChange?: (avg: string) => void;
}

function getBranchKPIValue(branchData: any, kpi: string): number {
  if (!branchData) return 0;
  const val = branchData.normalized_score ?? branchData.score ?? branchData.PAR ?? branchData.month_1_default_rate ?? branchData.benchmark ?? branchData.defaulted_rate ?? branchData.HHI ?? branchData.effective_interest_rate ?? branchData.CIR ?? branchData.long_term_default_rate ?? branchData.recovery_rate_3_months ?? branchData.current_month_revenue ?? branchData.average_score ?? branchData.average_normalized_score ?? '0';
  const num = parseFloat(String(val));
  return isNaN(num) ? 0 : num;
}

function calculateBranchSum(data: any, kpi: string): number {
  if (!data) return 0;
  let branchArray: any[] = [];
  if (Array.isArray(data)) {
    branchArray = data;
  } else if (data.branches) {
    branchArray = data.branches;
  }
  if (branchArray.length === 0) return 0;
  return branchArray.reduce((sum: number, branch: any) => {
    if (kpi === 'Cash Position Score') {
      return sum + calculateCashPositionScore(parseFloat(branch.totalCashBalance || branch.cashBalance || '0'), 'branch');
    }
    if (kpi === 'Vacancy Impact') {
      return sum + (parseFloat(String(branch.normalized_score || '0')) * 100);
    }
    const raw = getBranchKPIValue(branch, kpi);
    return sum + raw;
  }, 0);
}

export function ProvinceLevelView({ selectedKPI, onProvinceClick, onInstitutionAvgChange }: ProvinceLevelViewProps) {
  const { provincialData, provinces, loading, error } = useProvincialData(selectedKPI);

  function getTrendBadge(trend: '↑' | '↓' | '→') {
    if (trend === '↑') return 'text-green-600 dark:text-gray-600 text-lg font-bold';
    if (trend === '↓') return 'text-red-600 dark:text-gray-600 text-lg font-bold';
    return 'text-orange-500 dark:text-gray-600 text-lg font-bold';
  }

  function getStatusBadge(status: 'good' | 'warning' | 'critical') {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
  }

  function getVarianceColor(variance: string) {
    if (variance.startsWith('+')) return 'text-red-600 dark:text-red-400 font-semibold';
    if (variance.startsWith('-')) return 'text-green-600 dark:text-green-400 font-semibold';
    return 'text-gray-600 dark:text-gray-400';
  }

  // Function to get current period value for sorting
  const getCurrentPeriodValue = (province: any) => {
    const config = kpiConfigs[selectedKPI || ''];
    if (!config) return 0;

    const data = provincialData[province.id];
    if (!data) return 0;

    const value = config.getValue(data);
    const cleanValue = isNaN(value) ? 0 : value;

    return config.isLowerBetter ? 100 - cleanValue : cleanValue;
  };

  // Sort provinces by current period value in descending order
  const sortedProvinces = [...provinces].sort((a, b) => {
    if (selectedKPI === 'Cash Position Score') {
      return (b.totalCashBalance || 0) - (a.totalCashBalance || 0);
    }
    const valueA = getCurrentPeriodValue(a);
    const valueB = getCurrentPeriodValue(b);
    return valueB - valueA;
  });

  const calculatedInstitutionAvg = calculateProvinceInstitutionAvg(selectedKPI, provincialData, provinces);

  useEffect(() => {
    if (onInstitutionAvgChange && calculatedInstitutionAvg && calculatedInstitutionAvg !== '--') {
      onInstitutionAvgChange(calculatedInstitutionAvg);
    }
  }, [calculatedInstitutionAvg, onInstitutionAvgChange]);

  const [showKpiInfo, setShowKpiInfo] = useState<boolean>(false);

  return (
    <div>
      <div className="flex items-center mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Executive Institution Overview - Country Wide Zambia</h3>
          <KpiSummaryHeader kpi={selectedKPI} onInfoClick={() => setShowKpiInfo(!showKpiInfo)} showInfo={showKpiInfo} />
        </div>
                 {showKpiInfo && (
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 mt-2 w-80 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-[100] transform transition-all duration-200">
            <div className="flex items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">{selectedKPI || 'Selected KPI'}</h4>
                {selectedKPI === 'Staff Adequacy Score' ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <p><strong>Parameter:</strong> Branch Structure & Staffing</p>
                    <p><strong>Formula:</strong> Current LCs / Optimal LCs (capped at 100%)</p>
                    <p><strong>Target:</strong> 100% (10-12 LCs)</p>
                    <p><strong>Weight:</strong> 25% (22pp Contribution)</p>
                    <p><strong>How the score works:</strong></p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                      <li>If Current &ge; Optimal: 100%</li>
                      <li>If Current &lt; Optimal: (Current / Optimal) &times; 100</li>
                    </ul>
                    <p><strong>Drill Context:</strong> Provincial aggregated view of branch staffing adequacy across the province.</p>
                  </div>
                ) : selectedKPI === 'Cash Position Score' ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <p><strong>Target Cash Balance:</strong> K100,000 per branch</p>
                    <p><strong>Formula:</strong> Score = 100 - (shortfall ÷ 10,000) × 50 for balances K10,000-K20,000</p>
                    <p><strong>Thresholds:</strong> 
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                        <li>Below K10,000: Critical</li>
                        <li>K10,000-K20,000: Bad </li>
                        <li>K20,000-K30,000: Good</li>
                        <li>K30,000-K50,000: Excellent </li>
                        <li>Above K50,000: Risky</li>
                      </ul>
                    </p>
                    <p><strong>Sorting:</strong> Sorted by total cash balance descending (highest cash first)</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">KPI information not available for this metric.</p>
                )}
              </div>
              <button
                onClick={() => setShowKpiInfo(false)}
                className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                title="Close"
              >
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Institution Average as at Today: <span className="font-semibold text-blue-600 dark:text-blue-400">{calculatedInstitutionAvg}</span>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-800"></div>
            <div className="absolute top-0 left-0 animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-500 border-r-blue-500" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <span className="mt-4 text-gray-600 dark:text-gray-300 animate-pulse">Loading provinces...</span>
        </div>
      ) : error ? (
        <div className="text-red-600 dark:text-red-400 py-8 text-center">
          Error: {error}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Province</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Offices Count</th>
                {selectedKPI !== 'Productivity Achievement' && selectedKPI !== 'Productivity Achievement Score' && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Staff</th>
                )}
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedProvinces.map((province, index) => {
                const data = provincialData[province.id];
                
                 let institutionalAvg = '0';
                 let currentPeriod = '0';
                 let target = '100%';
                 let variance = '0';
                 let trend: '↑' | '↓' | '→' = '→';
                 let status: 'good' | 'warning' | 'critical' = 'warning';
                 let officesCount = 0;
                 let actualLcs = 0;

                 if (data) {
                    officesCount = data.offices_count || 0;
                    // Actual Loan Consultants (filled positions) — same source for every KPI,
                    // so Staff Adequacy Score and Vacancy Impact show an identical count.
                    actualLcs = getActualLCs(data);
                  }

                      if (data) {
                        const config = kpiConfigs[selectedKPI || ''];
                        if (config) {
                          const rawValue = config.getValue(data);
                          if (!isNaN(rawValue)) {
                            const targetValue = config.getTarget(data);
                            currentPeriod = config.formatValue(rawValue);
                            variance = config.formatVariance(rawValue - targetValue);
                            trend = config.getTrend(rawValue, targetValue);
                            status = config.getStatus(rawValue, targetValue);
                          }
                          target = config.displayTarget(data);
                        } else {
                          currentPeriod = '0';
                          target = '100%';
                          variance = '0';
                          trend = '→';
                          status = 'warning';
                        }
                      }

                  // Determine background color based on threshold bands for Cash Position Score or ranking for others
                  let bgColor = '';
                  if (selectedKPI === 'Cash Position Score') {
                    const cashBalance = province.totalCashBalance || 0;
                    if (cashBalance >= 146406.24) {
                      bgColor = 'bg-green-50 dark:bg-green-900/20';
                    } else if (cashBalance >= 109804.68) {
                      bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
                    } else if (cashBalance >= 73203.12) {
                      bgColor = 'bg-orange-50 dark:bg-orange-900/20';
                    } else {
                      bgColor = 'bg-red-50 dark:bg-red-900/20';
                    }
                  } else {
                    if (index < 3) {
                      // Top 3 performers
                      bgColor = 'bg-green-50 dark:bg-green-900/20';
                    } else if (index < 7) {
                      // Next 4 performers (positions 4-7)
                      bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
                    }
                  }

                   const provincialAvgSum = currentPeriod;

                  return (
                    <tr
                      key={province.id}
                      className={`${bgColor} hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer`}
                      onClick={() => onProvinceClick(province.id)}
                    >

                       <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{province.name}</td>
                       <td className="px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400">{officesCount}</td>
                       {selectedKPI !== 'Productivity Achievement' && selectedKPI !== 'Productivity Achievement Score' && (
                         <td className="px-4 py-2 text-sm font-semibold text-green-600 dark:text-green-400">{actualLcs}</td>
                       )}
                       <td className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">{provincialAvgSum}</td>
                       <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{target}</td>
                       <td className="px-4 py-2 text-sm">
                         <span className={`${getVarianceColor(variance)}`}>{variance}</span>
                       </td>
                       <td className="px-4 py-2 text-sm">
                         <span className={getTrendBadge(trend)}>{trend}</span>
                       </td>
                       <td className="px-4 py-2">
                         <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusBadge(status)}`}>
                           {status === 'good' ? 'GOOD' : status === 'warning' ? 'WARNING' : 'CRITICAL'}
                         </span>
                       </td>
                    </tr>
                  );
               })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
