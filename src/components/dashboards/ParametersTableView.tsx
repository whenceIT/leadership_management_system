'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { ProvinceLevelView } from './ProvinceLevelView';
import { DistrictLevelView } from './DistrictLevelView';
import { BranchLevelView } from './BranchLevelView';
import { KPI, KPIStatus, KPITrend, ParameterSummary } from '@/types/dashboard';

interface TooltipHeaderProps {
  children: React.ReactNode;
  tooltip: string;
}

function TooltipHeader({ children, tooltip }: TooltipHeaderProps) {
  return (
    <span className="inline-flex items-center gap-1">
      {children}
      <span className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help text-xs" title={tooltip}>ⓘ</span>
    </span>
  );
}

const PARAMETER_DESCRIPTIONS: Record<string, { title: string; description: string; example: string }> = {
  'Branch Structure & Staffing': {
    title: 'BRANCH STRUCTURE & STAFFING',
    description: 'Measures whether the branch has enough staff and a balanced workload to perform well.',
    example: 'Example: Mary has 8 Loan Consultants, but the branch needs 10. The team is working hard, but they are stretched.'
  },
  'Loan Consultant Performance': {
    title: 'LOAN CONSULTANT PERFORMANCE',
    description: 'Measures how well Loan Consultants perform in terms of loan volume, quality, collections, and compliance.',
    example: 'Example: John disbursed many loans this month, but Sarah\'s clients are paying better. LCPI looks at both results and quality.'
  },
  'Loan Products & Interest Rates': {
    title: 'LOAN PRODUCTS & INTEREST RATES',
    description: 'Measures whether the branch has a healthy, profitable, and well-balanced mix of loan products.',
    example: 'Example: Peter\'s branch gives mostly one type of loan. It is doing well, but relying too much on one product can create risk.'
  },
  'Risk Management & Defaults': {
    title: 'RISK MANAGEMENT & DEFAULTS',
    description: 'Measures how well the branch prevents defaults, manages overdue loans, and recovers outstanding money.',
    example: 'Example: Grace notices that several clients are starting to miss payments. Her team follows up early to prevent the problem from growing.'
  },
  'Revenue & Performance': {
    title: 'REVENUE & PERFORMANCE METRICS INDEX (RPMI)',
    description: 'Measures how well the branch generates income, manages costs, contributes to profit, and grows.',
    example: 'Example: David\'s branch made good revenue this month while keeping its costs under control. This means the branch is performing efficiently.'
  },
  'Cash & Liquidity Management': {
    title: 'CASH & LIQUIDITY MANAGEMENT',
    description: 'Measures whether the branch is generating enough cash to cover defaults, mandatory costs, salaries, and other operating needs while maintaining a healthy cash position.',
    example: 'Example: Peter\'s branch met its loan target and collected well, but after paying salaries and other costs, only K13,500 remained. The branch is healthy, but the small surplus means Peter needs to manage cash carefully.'
  }
};

interface ParameterTooltipProps {
  paramName: string;
  children: React.ReactNode;
}

function ParameterTooltip({ paramName, children }: ParameterTooltipProps) {
  const info = PARAMETER_DESCRIPTIONS[paramName];
  if (!info) return <>{children}</>;

  return (
    <span className="group relative inline-flex items-center gap-1 cursor-help">
      {children}
      <span className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 text-xs transition-colors">ⓘ</span>
      <span className="invisible group-hover:visible absolute z-[9999] bottom-full left-0 mb-2 w-80 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 text-left transform transition-all duration-200">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">{info.title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{info.description}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">{info.example}</p>
        <div className="absolute bottom-0 left-4 w-3 h-3 bg-white dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 transform rotate-45 translate-y-1/2"></div>
      </span>
    </span>
  );
}

interface ParametersTableViewProps {
  parameters: ParameterSummary[];
  userLevel: 'institution' | 'province' | 'district' | 'branch' | 'consultant';
  userLevelLabel: string;
  expandedParam: string | null;
  onToggleExpand: (paramName: string) => void;
  getParameterKPIs: (userLevel: string, paramName: string,
    staffAdequacyData?: any,
    productivityAchievementData?: any,
    vacancyImpactData?: any,
    volumeAchievementData?: any,
    loanPortfolioLoadData?: any,
    collectionEfficiencyData?: any,
    efficiencyRatioData?: any,
    growthTrajectoryData?: any,
    longTermDelinquencyData?: any,
    month1DefaultPerformanceData?: any,
    month3RecoveryAchievementsData?: any,
    portfolioQualityData?: any,
    productDiversificationData?: any,
    productRiskScoreData?: any,
    rollRateControlData?: any,
    yieldAchievementsData?: any,
    revenueAchievementsData?: any,
    profitabilityContributionData?: any,
    cashPositionData?: any) => KPI[];
  getVarianceColor: (variance: string) => string;
  getTrendBadge: (trend: '↑' | '↓' | '→') => string;
  getStatusBadge: (status: KPIStatus) => string;
  staffAdequacyData?: any;
  productivityAchievementData?: any;
  vacancyImpactData?: any;
  volumeAchievementData?: any;
  loanPortfolioLoadData?: any;
  collectionEfficiencyData?: any;
  efficiencyRatioData?: any;
  growthTrajectoryData?: any;
  longTermDelinquencyData?: any;
  month1DefaultPerformanceData?: any;
  month3RecoveryAchievementsData?: any;
  portfolioQualityData?: any;
  productDiversificationData?: any;
  productRiskScoreData?: any;
  rollRateControlData?: any;
  yieldAchievementsData?: any;
  revenueAchievementsData?: any;
  profitabilityContributionData?: any;
  cashPositionData?: any;
  onKpiClick?: (kpiName: string) => void;
  selectedKPI: string | null;
  drillLevel: 'province' | 'district' | 'branch' | 'consultant' | null;
  selectedProvince: number | null;
  selectedDistrict: number | null;
  selectedBranch: number | null;
  setSelectedKPI: (kpi: string | null) => void;
  setDrillLevel: (level: 'province' | 'district' | 'branch' | 'consultant' | null) => void;
  setSelectedProvince: (id: number | null) => void;
  setSelectedDistrict: (id: number | null) => void;
  setSelectedBranch: (id: number | null) => void;
  userProvinceId?: number;
  drillDownKPI?: string | null;
  setDrillDownKPI?: (kpi: string | null) => void;
  provincialAverages?: Record<string, string>;
  onInstitutionAvgChange?: (avg: string) => void;
}

export function ParametersTableView({
  parameters,
  userLevel,
  userLevelLabel,
  expandedParam,
  onToggleExpand,
  getParameterKPIs,
  getVarianceColor,
  getTrendBadge,
  getStatusBadge,
  staffAdequacyData,
  productivityAchievementData,
  vacancyImpactData,
  volumeAchievementData,
  loanPortfolioLoadData,
  collectionEfficiencyData,
  efficiencyRatioData,
  growthTrajectoryData,
  longTermDelinquencyData,
  month1DefaultPerformanceData,
  month3RecoveryAchievementsData,
  portfolioQualityData,
  productDiversificationData,
  productRiskScoreData,
  rollRateControlData,
  yieldAchievementsData,
  revenueAchievementsData,
  profitabilityContributionData,
  cashPositionData,
  onKpiClick,
  selectedKPI,
  drillLevel,
  selectedProvince,
  selectedDistrict,
  selectedBranch,
  setSelectedKPI,
  setDrillLevel,
  setSelectedProvince,
  setSelectedDistrict,
  setSelectedBranch,
  userProvinceId,
  drillDownKPI,
  setDrillDownKPI,
  onInstitutionAvgChange,
  provincialAverages
}: ParametersTableViewProps) {
  const levelLabel = {
    institution: 'Institutional',
    province: 'Provincial',
    district: 'District',
    branch: 'Branch',
    consultant: 'Personal'
  }[userLevel];

  const [drillDownInstitutionAvg, setDrillDownInstitutionAvg] = useState<string | null>(null);

  // Use pre-fetched provincial average for the selected KPI
  const selectedKpiProvincialAvg = useMemo(() => {
    if (!selectedKPI || !provincialAverages) return null;
    return provincialAverages[selectedKPI] || null;
  }, [selectedKPI, provincialAverages]);

  // Helper to get provincial average for any KPI
  const getProvincialAvgForKpi = (kpiName: string): string | null => {
    if (!provincialAverages) return null;
    return provincialAverages[kpiName] || null;
  };

  const DEFAULT_INSTITUTIONAL_AVGS: Record<string, string> = {
    'Branch Structure & Staffing': '85%',
    'Loan Consultant Performance': '75%',
    'Loan Products & Interest Rates': '74%',
    'Risk Management & Defaults': '52%',
    'Revenue & Performance': '65%',
    'Cash & Liquidity Management': '70%'
  };

  function getHeadlineUserLevelAvg(param: ParameterSummary): string {
    if (!provincialAverages) return param.userLevelAvg || '--';
    
    const kpis = getParameterKPIs(
      userLevel,
      param.name,
      staffAdequacyData,
      productivityAchievementData,
      vacancyImpactData,
      volumeAchievementData,
      loanPortfolioLoadData,
      collectionEfficiencyData,
      efficiencyRatioData,
      growthTrajectoryData,
      longTermDelinquencyData,
      month1DefaultPerformanceData,
      month3RecoveryAchievementsData,
      portfolioQualityData,
      productDiversificationData,
      productRiskScoreData,
      rollRateControlData,
      yieldAchievementsData,
      revenueAchievementsData,
      profitabilityContributionData,
      cashPositionData
    );
    
    if (!kpis || kpis.length === 0) return param.userLevelAvg || '--';
    
    // For Revenue & Performance, use simple arithmetic average of KPI province averages
    if (param.name === 'Revenue & Performance') {
      let total = 0;
      let count = 0;
      
      kpis.forEach(kpi => {
        const provincialAvg = provincialAverages[kpi.name];
        if (provincialAvg) {
          const num = parseFloat(provincialAvg.replace('%', '').replace(',', ''));
          if (!isNaN(num)) {
            total += num;
            count++;
          }
        }
      });
      
      if (count === 0) return param.userLevelAvg || '--';
      
      const avg = total / count;
      const capped = Math.min(100, Math.max(0, avg));
      return `${capped.toFixed(2)}%`;
    }
    
    // For other parameters, use existing logic
    let total = 0;
    let count = 0;
    
    kpis.forEach(kpi => {
      const provincialAvg = provincialAverages[kpi.name];
      if (provincialAvg) {
        const num = parseFloat(provincialAvg.replace('%', '').replace(',', ''));
        if (!isNaN(num)) {
          total += num;
          count++;
        }
      }
    });
    
    if (count === 0) return param.userLevelAvg || '--';
    
    const avg = total / count;
    const capped = Math.min(100, Math.max(0, avg));
    return `${capped.toFixed(2)}%`;
  }

  function getHeadlineInstitutionalAvg(param: ParameterSummary): string {
    const raw = DEFAULT_INSTITUTIONAL_AVGS[param.name] || param.institutionalAvg || '--';
    if (raw === '--') return raw;
    const num = parseFloat(raw.replace('%', ''));
    if (isNaN(num)) return raw;
    const capped = Math.min(100, Math.max(0, num));
    return `${capped.toFixed(2)}%`;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
          Six Headline Parameters — {levelLabel} Level
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">{userLevelLabel}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          {/* Overview stats */}
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Parameter</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <TooltipHeader tooltip="Average performance score across all branches/units for this parameter">Current {levelLabel} Avg (L1)</TooltipHeader>
              </th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <TooltipHeader tooltip="Institutional benchmark/target average for comparison">Institution Avg (Benchmark)</TooltipHeader>
              </th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <TooltipHeader tooltip="The goal or target value to achieve for this parameter">Target</TooltipHeader>
              </th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <TooltipHeader tooltip="Gap or distance from target (positive = above target, negative = below target)">Variance</TooltipHeader>
              </th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <TooltipHeader tooltip="Direction of change compared to previous period">Trend</TooltipHeader>
              </th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <TooltipHeader tooltip="Overall status assessment and percentage distance to target">Status & Distance to Target</TooltipHeader>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {parameters.map((param, index) => {
              const kpis = getParameterKPIs(userLevel, param.name,
                staffAdequacyData,
                productivityAchievementData,
                vacancyImpactData,
                volumeAchievementData,
                loanPortfolioLoadData,
                collectionEfficiencyData,
                efficiencyRatioData,
                growthTrajectoryData,
                longTermDelinquencyData,
                month1DefaultPerformanceData,
                month3RecoveryAchievementsData,
                portfolioQualityData,
                productDiversificationData,
                productRiskScoreData,
                rollRateControlData,
                yieldAchievementsData,
                revenueAchievementsData,
                profitabilityContributionData,
                  cashPositionData);
              const isExpanded = expandedParam === param.name;

              const headlineUserLevelAvg = getHeadlineUserLevelAvg(param);
              const headlineInstitutionalAvg = getHeadlineInstitutionalAvg(param);

              // Calculate progress percentage
              const userLevelScore = headlineUserLevelAvg !== '--' ? parseFloat(headlineUserLevelAvg.replace('%', '')) : 0;
              let progress = 0;

              if (typeof param.target === 'object' && param.target && 'min' in param.target) {
                // Range target (e.g., Cash Position Score) - score is already percentage
                progress = Math.min(Math.max(userLevelScore, 0), 100);
              } else if (typeof param.target === 'number') {
                // Numeric target
                progress = Math.min(Math.max((userLevelScore / param.target) * 100, 0), 100);
              } else {
                // String target
                let targetScore = parseFloat(param.target.toString().replace('%', '').replace('≥', '').replace('≤', ''));
                if (isNaN(targetScore)) {
                  targetScore = 100;
                }
                progress = Math.min(Math.max((userLevelScore / targetScore) * 100, 0), 100);
              }

              return (
                <React.Fragment key={index}>
                  <tr
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-200 border dark:bg-blue-900/20' : ''}`}
                    onClick={() => onToggleExpand(param.name)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className={`mr-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                          ▶
                        </span>
                         <div>
                           <ParameterTooltip paramName={param.name}>
                             <p className="text-sm font-semibold text-gray-900 dark:text-white">{param.name}</p>
                           </ParameterTooltip>
                           <p className="text-xs text-gray-500 dark:text-gray-400">{param.shortName}</p>
                         </div>
                      </div>
                    </td>
                    <td className="border px-4 py-3 text-center bg-black/5 dark:bg-white/10">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {getHeadlineUserLevelAvg(param)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                          {getHeadlineInstitutionalAvg(param)}
                        </span>
                        {getHeadlineUserLevelAvg(param) !== '--' && getHeadlineInstitutionalAvg(param) !== '--' && (() => {
                          const userVal = parseFloat(getHeadlineUserLevelAvg(param).replace('%', ''));
                          const instVal = parseFloat(getHeadlineInstitutionalAvg(param).replace('%', ''));
                          return (
                            <span className={`text-xs font-medium ${userVal >= instVal ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {userVal >= instVal ? '▲' : '▼'}
                              {Math.abs(userVal - instVal).toFixed(0)}%
                            </span>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                      {typeof param.target === 'number' ? (
                        param.name === 'Cash Position Score'
                          ? new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW', maximumFractionDigits: 0 }).format(param.target)
                          : `K${param.target.toLocaleString()}`
                      ) : param.target}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm ${getVarianceColor(param.variance)}`}>
                        {param.variance}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">({param.varianceAbs})</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={getTrendBadge(param.trend)}>{param.trend}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${userLevelScore >= 76 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          userLevelScore >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'} mb-2 inline-block`}>
                          {userLevelScore >= 76 ? 'GOOD' : userLevelScore >= 60 ? 'WARNING' : 'CRITICAL'}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${userLevelScore >= 76 ? 'bg-green-500' :
                                userLevelScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 min-w-[40px] text-center">
                            {userLevelScore}%
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {`${Math.round(100 - progress)}% to target`}
                        </div>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-blue-300">
                        <td colSpan={7} className="px-4 py-3">
                          <div className="space-y-4 rounded-lg transition-all duration-500 ease-in-out opacity-100 transform translate-y-0">
                            {!drillDownKPI ? (
                              <div className="rounded-lg">
                                <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">📊 KEY PERFORMANCE INDICATORS:</h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full">
                                      <thead className="bg-blue-100 dark:bg-blue-900/30">
                                        <tr>
                                          <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Metric</th>
                                          <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                            <TooltipHeader tooltip="Current average score for this metric">Current {levelLabel} Avg</TooltipHeader>
                                          </th>
                                          <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                            <TooltipHeader tooltip="Institutional benchmark average for this metric">Inst Avg</TooltipHeader>
                                          </th>
                                          {param.name === 'Cash & Liquidity Management' && (
                                            <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Cash Balance</th>
                                          )}
                                          <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                            <TooltipHeader tooltip="Target value for this metric">Target</TooltipHeader>
                                          </th>
                                          <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                            <TooltipHeader tooltip="Gap or distance from target for this metric">Variance</TooltipHeader>
                                          </th>
                                            <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                              <TooltipHeader tooltip="Performance status based on target achievement">Status</TooltipHeader>
                                            </th>
                                        </tr>
                                      </thead>
                                    <tbody className="divide-y divide-blue-200 dark:divide-blue-900/20">
                                      {kpis.map((kpi, kpiIndex) => (
                                        <tr
                                          key={kpiIndex}
                                          className="hover:bg-blue-100 dark:hover:bg-blue-900/20 cursor-pointer"
                                          onClick={() => {
                                            setDrillDownKPI?.(kpi.name);
                                            onKpiClick?.(kpi.name);
                                          }}
                                        >
                                           <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-white">{kpi.name}</td>
                                            <td className="px-4 py-2 text-center text-sm font-semibold text-gray-900 dark:text-white">{(() => {
                                              const raw = getProvincialAvgForKpi(kpi.name) || kpi.currentPeriod;
                                              const num = parseFloat(String(raw));
                                              if (isNaN(num)) return raw;
                                              return Math.min(100, Math.max(0, num));
                                            })()}%</td>
                                              <td className="px-4 py-2 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                                   {kpi.institutionalAvg}
                                             </td>
                                            {param.name === 'Cash & Liquidity Management' && (
                                              <td className="px-4 py-2 text-center text-sm font-semibold text-green-600 dark:text-green-400">
                                                 {kpi.name === 'Cash Position Score' && cashPositionData ? `K${cashPositionData.totalCashBalance?.toLocaleString() || '--'}` : '--'}
                                              </td>
                                            )}
                                              <td className="px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                                                 {kpi.name === 'Cash Position Score' && (typeof kpi.target === 'number' || /^\d+$/.test(String(kpi.target)))
                                                   ? new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW', maximumFractionDigits: 0 }).format(typeof kpi.target === 'number' ? kpi.target : parseInt(String(kpi.target)))
                                                   : kpi.name === 'Cash Position Score' && typeof kpi.target === 'object'
                                                     ? `K${kpi.target.min.toLocaleString()} to K${kpi.target.max.toLocaleString()}`
                                                     : typeof kpi.target === 'object'
                                                       ? '--'
                                                       : kpi.target}
                                              </td>
                                          <td className="px-4 py-2 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                              <span className={getTrendBadge(kpi.trend)}>{kpi.trend}</span>
                                              <span className={`text-sm ${getVarianceColor(kpi.variance)}`}>{kpi.variance}</span>
                                            </div>
                                          </td>
                                            <td className="px-4 py-2 text-center">
                                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusBadge(kpi.status)}`}>
                                                {kpi.status === 'good' ? 'GOOD' : kpi.status === 'warning' ? 'WARNING' : kpi.status === 'excellent' ? 'EXCELLENT' : kpi.status === 'moderate' ? 'MODERATE' : kpi.status === 'bad' ? 'BAD' : 'CRITICAL'}
                                              </span>
                                            </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : (
                              /* Drill-down view for selected KPI */
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                   <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-4 p-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                                     <span className="text-2xl">📊</span>
                                     <span>{drillDownKPI}</span>
                                   </h2>
                                   <button
                                     onClick={() => {
                                       setDrillDownKPI?.(null);
                                       setSelectedKPI(null);
                                       setDrillLevel(null);
                                     }}
                                     className="text-xs px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-all duration-200 flex items-center gap-1"
                                   >
                                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                     </svg>
                                     Close
                                   </button>
                                </div>

                                {drillLevel === 'province' && userLevel === 'institution' && (
                                  <ProvinceLevelView
                                    selectedKPI={selectedKPI}
                                    onProvinceClick={(provinceId) => {
                                      setSelectedProvince(provinceId);
                                      setDrillLevel('district');
                                    }}
                                    onInstitutionAvgChange={(avg) => {
                                      setDrillDownInstitutionAvg(avg);
                                    }}
                                  />
                                )}

                                {drillLevel === 'district' && selectedKPI && (
                                  <DistrictLevelView
                                    selectedKPI={selectedKPI}
                                    selectedProvince={userLevel === 'province' ? (userProvinceId || 1) : selectedProvince!}
                                    onDistrictClick={(districtId: number) => {
                                      setSelectedDistrict(districtId);
                                      setDrillLevel('branch');
                                    }}
                                    onBack={() => {
                                      if (userLevel === 'province') {
                                        setSelectedKPI(null);
                                        setDrillLevel(null);
                                      } else {
                                        setSelectedProvince(null);
                                        setDrillLevel('province');
                                      }
                                    }}
                                  />
                                )}

                                {drillLevel === 'branch' && selectedKPI && (
                                  <BranchLevelView
                                    selectedKPI={selectedKPI}
                                    selectedProvince={userLevel === 'province' ? (userProvinceId || 1) : selectedProvince!}
                                    selectedDistrict={selectedDistrict}
                                    onBranchClick={(branchId: number) => {
                                      setSelectedBranch(branchId);
                                    }}
                                    onBack={() => {
                                      if (userLevel === 'district') {
                                        setSelectedKPI(null);
                                        setDrillLevel(null);
                                      } else {
                                        setSelectedDistrict(null);
                                        setDrillLevel('district');
                                      }
                                    }}
                                    userLevel={userLevel}
                                  />
                                )}
                              </div>
                            )}
                         </div>
                       </td>
                     </tr>
                   )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
