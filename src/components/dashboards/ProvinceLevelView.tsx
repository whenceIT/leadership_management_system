'use client';

import React, { useState } from 'react';
import { useProvincialData } from '@/hooks/useProvincialData';
import { calculateCashPositionScore } from './InstitutionalHealthSummary';

interface ProvinceLevelViewProps {
  selectedKPI: string | null;
  onProvinceClick: (provinceId: number) => void;
}

interface KPIConfig {
  getValue: (data: any) => number;
  getTarget: (data: any) => number;
  formatValue: (value: number) => string;
  formatVariance: (variance: number) => string;
  formatInstitutionAvg: (value: number) => string;
  isLowerBetter: boolean;
  getTrend: (value: number, target: number) => '↑' | '↓' | '→';
  getStatus: (value: number, target: number) => 'good' | 'warning' | 'critical';
  displayTarget: (data: any) => string;
}

const kpiConfigs: Record<string, KPIConfig> = {
  'Staff Adequacy Score': {
    getValue: (data) => parseFloat(data.average_normalized_score || '0'),
    getTarget: (data) => data.target || 90,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= t * 0.8 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= t * 0.8 ? 'warning' : 'critical',
    displayTarget: () => '90%'
  },
  'Productivity Achievement': {
    getValue: (data) => parseFloat(data.average_normalized_score || '0'),
    getTarget: (data) => data.target || 90,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= t * 0.8 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= t * 0.8 ? 'warning' : 'critical',
    displayTarget: () => '90%'
  },
  'Vacancy Impact': {
    getValue: (data) => parseFloat(data.average_normalized_score || '0'),
    getTarget: (data) => data.target || 10,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: true,
    getTrend: (v, t) => v <= t ? '↑' : v <= t * 1.2 ? '→' : '↓',
    getStatus: (v, t) => v <= t ? 'good' : v <= t * 1.2 ? 'warning' : 'critical',
    displayTarget: () => '0%'
  },
  'Portfolio Load Balance': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: (data) => data.target || 100,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t * 0.9 ? '↑' : v >= t * 0.7 ? '→' : '↓',
    getStatus: (v, t) => v >= t * 0.9 ? 'good' : v >= t * 0.7 ? 'warning' : 'critical',
    displayTarget: () => '100%'
  },
  'Volume Achievement': {
    getValue: (data) => parseFloat(data.average_normalized_score || '0'),
    getTarget: () => 100,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t * 0.9 ? '↑' : v >= t * 0.7 ? '→' : '↓',
    getStatus: (v, t) => v >= t * 0.9 ? 'good' : v >= t * 0.7 ? 'warning' : 'critical',
    displayTarget: () => '100%'
  },
  'Portfolio quality': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 5,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: true,
    getTrend: (v, t) => v <= t ? '↑' : v <= t * 2 ? '→' : '↓',
    getStatus: (v, t) => v <= t ? 'good' : v <= t * 2 ? 'warning' : 'critical',
    displayTarget: () => '≤5%'
  },
  'Default contribution': {
    getValue: (data) => parseFloat(data.average_month_1_default_rate || '0'),
    getTarget: () => 15,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: true,
    getTrend: (v, t) => v <= t ? '↑' : v <= t * 1.33 ? '→' : '↓',
    getStatus: (v, t) => v <= t ? 'good' : v <= t * 1.33 ? 'warning' : 'critical',
    displayTarget: () => '≤15%'
  },
  'Default rate (branch, province, institutional)': {
    getValue: (data) => parseFloat(data.average_month_1_default_rate || '0'),
    getTarget: () => 15,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: true,
    getTrend: (v, t) => v <= t ? '↑' : v <= t * 1.33 ? '→' : '↓',
    getStatus: (v, t) => v <= t ? 'good' : v <= t * 1.33 ? 'warning' : 'critical',
    displayTarget: () => '≤15%'
  },
  'Collections efficiency': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 75,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= t * 0.87 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= t * 0.87 ? 'warning' : 'critical',
    displayTarget: () => '≥75%'
  },
  'Vetting compliance': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 1.0,
    formatValue: (v) => `${v.toFixed(2)}`,
    formatVariance: (v) => `${v.toFixed(2)}`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}`,
    isLowerBetter: true,
    getTrend: (v, t) => v <= t ? '↑' : v <= t * 1.5 ? '→' : '↓',
    getStatus: (v, t) => v <= t ? 'good' : v <= t * 1.5 ? 'warning' : 'critical',
    displayTarget: () => '≤1.0'
  },
  'Product risk contribution': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 1.0,
    formatValue: (v) => `${v.toFixed(2)}`,
    formatVariance: (v) => `${v.toFixed(2)}`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}`,
    isLowerBetter: true,
    getTrend: (v, t) => v <= t ? '↑' : v <= t * 1.5 ? '→' : '↓',
    getStatus: (v, t) => v <= t ? 'good' : v <= t * 1.5 ? 'warning' : 'critical',
    displayTarget: () => '≤1.0'
  },
  'Product distribution mix': {
    getValue: (data) => parseFloat(data.average_HHI || '0'),
    getTarget: () => 0.3,
    formatValue: (v) => `${v.toFixed(3)}`,
    formatVariance: (v) => `${v.toFixed(3)}`,
    formatInstitutionAvg: (v) => `${v.toFixed(3)}`,
    isLowerBetter: true,
    getTrend: (v, t) => v < t ? '↑' : v < t * 1.33 ? '→' : '↓',
    getStatus: (v, t) => v < t ? 'good' : v < t * 1.33 ? 'warning' : 'critical',
    displayTarget: () => 'HHI < 0.3'
  },
  'Revenue yield per product': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: (data) => parseFloat(data.target) || 38.2,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= t * 0.9 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= t * 0.9 ? 'warning' : 'critical',
    displayTarget: (data) => data.target ? `≥${data.target}%` : '≥38.2%'
  },
  'Margin alignment with strategy': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: (data) => parseFloat(data.target) || 55,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: true,
    getTrend: (v, t) => v <= t ? '↑' : v <= t * 1.1 ? '→' : '↓',
    getStatus: (v, t) => v <= t ? 'good' : v <= t * 1.1 ? 'warning' : 'critical',
    displayTarget: (data) => data.target ? `≤${data.target}%` : '≤55%'
  },
  'Cost-to-income ratios': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: (data) => parseFloat(data.target) || 55,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: true,
    getTrend: (v, t) => v <= t ? '↑' : v <= t * 1.1 ? '→' : '↓',
    getStatus: (v, t) => v <= t ? 'good' : v <= t * 1.1 ? 'warning' : 'critical',
    displayTarget: (data) => data.target ? `≤${data.target}%` : '≤55%'
  },
  'Default aging analysis': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: (data) => parseFloat(data.target) || 43.95,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: true,
    getTrend: (v, t) => v <= t ? '↑' : v <= t * 1.1 ? '→' : '↓',
    getStatus: (v, t) => v <= t ? 'good' : v <= t * 1.1 ? 'warning' : 'critical',
    displayTarget: (data) => data.target ? `≤${data.target}%` : '≤43.95%'
  },
  'Recovery rate within 1 month': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 100,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= t * 0.9 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= t * 0.9 ? 'warning' : 'critical',
    displayTarget: () => '≥100%'
  },
  'Recovery rate within 3 months': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 100,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= t * 0.9 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= t * 0.9 ? 'warning' : 'critical',
    displayTarget: () => '≥100%'
  },
  'Risk migration trends': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 20,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: true,
    getTrend: (v, t) => v <= t ? '↑' : v <= t * 1.5 ? '→' : '↓',
    getStatus: (v, t) => v <= t ? 'good' : v <= t * 1.5 ? 'warning' : 'critical',
    displayTarget: () => '≤20%'
  },
  'Branch revenue': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 2.5,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `K${v.toLocaleString()}`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= 0 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= 0 ? 'warning' : 'critical',
    displayTarget: () => '≥2.5%'
  },
  'Growth trajectory alignment': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 2.5,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= 0 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= 0 ? 'warning' : 'critical',
    displayTarget: () => '≥2.5%'
  },
  'Institutional average performance': {
    getValue: (data) => parseFloat(data.average_normalized_score || '0'),
    getTarget: () => 100,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= t * 0.9 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= t * 0.9 ? 'warning' : 'critical',
    displayTarget: () => '≥100%'
  },
  'Revenue achievement': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 100,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= t * 0.9 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= t * 0.9 ? 'warning' : 'critical',
    displayTarget: () => '≥100%'
  },
  'Profitability contribution': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 100,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= 90 ? '↑' : v >= 70 ? '→' : '↓',
    getStatus: (v, t) => v >= 90 ? 'good' : v >= 70 ? 'warning' : 'critical',
    displayTarget: () => '≥ institutional avg'
  },
  'Cash Position Score': {
    getValue: (data) => calculateCashPositionScore(parseFloat(data.totalCashBalance || data.average_score || '0'), 'province'),
    getTarget: () => 100,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= t * 0.9 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= t * 0.7 ? 'warning' : 'critical',
    displayTarget: () => 'K500,000'
  },
};

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

export function ProvinceLevelView({ selectedKPI, onProvinceClick }: ProvinceLevelViewProps) {
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

  // Calculate Institution Avg by summing Province Avg values
  const calculateInstitutionAvg = () => {
    const config = kpiConfigs[selectedKPI || ''];
    if (!config) return '--';

    let total = 0;
    let count = 0;

    provinces.forEach(province => {
      const data = provincialData[province.id];
      if (data) {
        const value = config.getValue(data);
        if (!isNaN(value)) {
          total += value;
          count++;
        }
      }
    });

    if (count === 0) return '--';

    const average = total / count;
    return config.formatInstitutionAvg(average);
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

  const institutionAvg = calculateInstitutionAvg();
  const [showKpiInfo, setShowKpiInfo] = useState<boolean>(false);

  return (
    <div>
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Executive Institution Overview - Country Wide Zambia</h3>
        <button
          onClick={() => setShowKpiInfo(!showKpiInfo)}
          className="ml-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 flex items-center justify-center"
          title="KPI Information"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15.5A3.5 3.5 0 0115.5 12 3.5 3.5 0 0112 8.5a3.5 3.5 0 01-3.5 3.5 3.5 3.5 0 010 7z" />
          </svg>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Key</span>
        </button>
        {showKpiInfo && (
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 mt-2 w-80 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-[100] transform transition-all duration-200">
            <div className="flex items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">{selectedKPI || 'Selected KPI'}</h4>
                {selectedKPI === 'Cash Position Score' ? (
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
        Institution Average as at Today: <span className="font-semibold text-blue-600 dark:text-blue-400">{institutionAvg}</span>
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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Cash Balance</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Provincial Avg</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Branches Below Threshold</th>
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
                let actualLcs = 0;
                let contribution = '--';
                let branchesBelowThreshold = 0;

                 if (data) {
                   // Handle both array and object data formats
                   // The provincial API returns an array of branch data
                   let branchArray: any[] = [];

                   if (Array.isArray(data)) {
                     branchArray = data;
                   } else if (data.branches) {
                     branchArray = data.branches;
                   }

                   // Count branches below K20,000 threshold
                   if (branchArray.length > 0) {
                     branchesBelowThreshold = branchArray.filter((branch: any) => {
                       const cashBal = parseFloat(branch.totalCashBalance || branch.cashBalance || '0');
                       return cashBal < 20000;
                     }).length;
                     
                       actualLcs = branchArray.reduce((sum: number, branch: any) => sum + (branch.actual_lcs || 0), 0);
                       const totalPP = branchArray.reduce((sum: number, branch: any) => sum + (branch.percentage_point || 0), 0);
                       if (totalPP > 0) {
                         contribution = `${totalPP.toFixed(2)}pp`;
                       }
                   } else if (data.total_actual_lcs) {
                     // Fallback to aggregated values if available
                     actualLcs = data.total_actual_lcs;
                     if (data.total_percentage_point) {
                       contribution = `${parseFloat(data.total_percentage_point).toFixed(2)}pp`;
                     }
                   } else if (data.actual_lcs) {
                     // Single branch data
                     actualLcs = data.actual_lcs;
                     if (data.percentage_point) {
                       contribution = `${parseFloat(data.percentage_point).toFixed(2)}pp`;
                     }
                   }

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

                  const officesCount = province.offices_count || 0;
                  const totalCashBalance = province.totalCashBalance || 0;
                  const provincialAvgSum = calculateBranchSum(data, selectedKPI || '');

                 return (
                   <tr
                     key={province.id}
                     className={`${bgColor} hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer`}
                     onClick={() => onProvinceClick(province.id)}
                   >

                     <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{province.name}</td>
                     <td className="px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400">{officesCount} </td>
                     <td className="px-4 py-2 text-sm font-semibold text-green-600 dark:text-green-400">K{totalCashBalance > 0 ? totalCashBalance.toLocaleString() : '--'}</td>
                      <td className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">{provincialAvgSum.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400">{branchesBelowThreshold}</td>
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
