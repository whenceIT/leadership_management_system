'use client';

import React from 'react';
import { ProvinceLevelView } from './ProvinceLevelView';
import { DistrictLevelView } from './DistrictLevelView';
import { BranchLevelView } from './BranchLevelView';

interface KPI {
  name: string;
  institutionalAvg: string;
  currentPeriod: string;
  target: string | number | { min: number; max: number };
  variance: string;
  trend: '↑' | '↓' | '→';
  status: 'good' | 'warning' | 'critical';
  contribution?: string;
}

interface ParameterSummary {
  name: string;
  shortName: string;
  institutionalAvg: string;
  userLevelAvg: string;
  target: string | number;
  variance: string;
  varianceAbs: string;
  trend: '↑' | '↓' | '→';
  status: 'good' | 'warning' | 'critical';
  contribution?: string;
}

interface ParametersTableViewProps {
  parameters: ParameterSummary[];
  userLevel: 'institution' | 'province' | 'district' | 'branch' | 'consultant';
  userLevelLabel: string;
  expandedParam: string | null;
  onToggleExpand: (paramName: string) => void;
  getParameterKPIs: (paramName: string,
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
  getStatusBadge: (status: 'good' | 'warning' | 'critical') => string;
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
  setDrillDownKPI
}: ParametersTableViewProps) {
  const levelLabel = {
    institution: 'Institutional',
    province: 'Provincial',
    district: 'District',
    branch: 'Branch',
    consultant: 'Personal'
  }[userLevel];

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
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current {levelLabel} Avg</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Institution Avg (Benchmark)</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Variance</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trend</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status & Distance to Target</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {parameters.map((param, index) => {
              const kpis = getParameterKPIs(param.name,
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

              // Calculate progress percentage
              const userLevelScore = parseFloat(param.userLevelAvg.replace('%', ''));
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
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{param.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{param.shortName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="border px-4 py-3 text-center bg-black/5 dark:bg-white/10">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {param.userLevelAvg}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                          {param.name === 'Branch Structure & Staffing' ? '78%' :
                              param.name === 'Loan Consultant Performance' ? '62%' :
                                param.name === 'Loan Products & Interest Rates' ? '74%' :
                                  param.name === 'Risk Management & Defaults' ? '52%' :
                                    param.name === 'Revenue & Performance' ? '65%' :
                                      param.name === 'Cash & Liquidity Management' ? '70%' :
                                        '--'}
                        </span>
                        {param.userLevelAvg !== '--' && param.userLevelAvg !== '--%' && param.institutionalAvg !== '--' && (
                          <span className={`text-xs font-medium ${parseFloat(param.userLevelAvg) >= parseFloat(param.institutionalAvg.replace('%', '')) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {parseFloat(param.userLevelAvg) >= parseFloat(param.institutionalAvg.replace('%', '')) ? '▲' : '▼'}
                            {Math.abs(parseFloat(param.userLevelAvg) - parseFloat(param.institutionalAvg.replace('%', ''))).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">{param.target}</td>
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
                                         <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Current {levelLabel} Avg</th>
                                         <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Inst Avg</th>
                                         {param.name === 'Cash & Liquidity Management' && (
                                           <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Cash Balance</th>
                                         )}
                                         <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Target</th>
                                         <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Variance</th>
                                         <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Contribution</th>
                                         <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Status</th>
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
                                          <td className="px-4 py-2 text-center text-sm font-semibold text-gray-900 dark:text-white">{parseFloat(kpi.currentPeriod)}%</td>
                                            <td className="px-4 py-2 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                                 {kpi.name === 'Cash & Liquidity Management' ? '70%' :
                                                   kpi.name === 'Cash Position Score' ? '75%' :
                                                   kpi.name === 'Staff Adequacy Score' ? '85%' :
                                                      kpi.name === 'Productivity Achievement' ? '75%' :
                                                        kpi.name === 'Vacancy Impact' ? '1.2' :
                                                          kpi.name === 'Portfolio Load Balance' ? '85%' :
                                                            kpi.name === 'Volume Achievement' ? '90%' :
                                                            kpi.name === 'Portfolio quality' ? '71.64%' :
                                                              kpi.name === 'Default contribution' ? '28.36%' :
                                                                    kpi.name === 'Collections efficiency' ? '58%' :
                                                                      kpi.name === 'Vetting compliance' ? '88%' :
                                                                        kpi.name === 'Product distribution mix' ? '0.38%' :
                                                                          kpi.name === 'Revenue yield per product' ? '36.5%' :
                                                                           kpi.name === 'Product risk contribution' ? '28.36%' :
                                                                              kpi.name === 'Margin alignment with strategy' ? '67%' :
                                                                               kpi.name === 'Default rate (branch, province, institutional)' ? '28.36%' :
                                                                                 kpi.name === 'Default aging analysis' ? '43.95%' :
                                                                                   kpi.name === 'Recovery rate within 3 months' ? '56.05%' :
                                                                                          kpi.name === 'Risk migration trends' ? '20%' :
                                                                                            kpi.name === 'Branch revenue' ? '1.8%' :
                                                                                                kpi.name === 'Cost-to-income ratios' ? '55%' :
                                                                                                   kpi.name === 'Efficiency Ratio (CIR)' ? '67%' :
                                                                                                     kpi.name === 'Institutional average performance' ? '75%' :
                                                                                                       kpi.name === 'Growth trajectory alignment' ? '1.8%' :
                                                                                         kpi.name === 'Revenue achievement' ? '65%' :
                                                                                           kpi.name === 'Profitability contribution' ? '65%' :
                                                                                            'N/A'}
                                           </td>
                                            {param.name === 'Cash & Liquidity Management' && (
                                              <td className="px-4 py-2 text-center text-sm font-semibold text-green-600 dark:text-green-400">
                                                 {kpi.name === 'Cash Position Score' && cashPositionData ? `K${cashPositionData.totalCashBalance?.toLocaleString() || '--'}` : '--'}
                                              </td>
                                            )}
                                            <td className="px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                                               {kpi.name === 'Cash Position Score' && typeof kpi.target === 'object' ? `K${kpi.target.min.toLocaleString()} to K${kpi.target.max.toLocaleString()}` :
                                                 typeof kpi.target === 'object' ? '--' : kpi.target}
                                            </td>
                                          <td className="px-4 py-2 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                              <span className={getTrendBadge(kpi.trend)}>{kpi.trend}</span>
                                              <span className={`text-sm ${getVarianceColor(kpi.variance)}`}>{kpi.variance}</span>
                                            </div>
                                          </td>
                                           <td className="px-4 py-2 text-center text-sm">
                                             {kpi.contribution || '--'}
                                           </td>
                                          <td className="px-4 py-2 text-center">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusBadge(kpi.status)}`}>
                                              {kpi.status === 'good' ? 'GOOD' : kpi.status === 'warning' ? 'WARNING' : 'CRITICAL'}
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
