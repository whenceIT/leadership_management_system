'use client';

import React from 'react';

interface KPI {
  name: string;
  institutionalAvg: string;
  currentPeriod: string;
  target: string;
  variance: string;
  trend: '↑' | '↓' | '→';
  status: 'good' | 'warning' | 'critical';
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
    cashPositionData?: any,
    aboveThresholdRiskData?: any,
    belowThresholdRiskData?: any,
    approvedExceptionRatioData?: any) => KPI[];
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
  aboveThresholdRiskData?: any;
  belowThresholdRiskData?: any;
  approvedExceptionRatioData?: any;
  onKpiClick?: (kpiName: string) => void;
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
  aboveThresholdRiskData,
  belowThresholdRiskData,
  approvedExceptionRatioData,
  onKpiClick
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
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Institution Avg</th>
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
                cashPositionData,
                aboveThresholdRiskData,
                belowThresholdRiskData,
                approvedExceptionRatioData);
              const isExpanded = expandedParam === param.name;
              
              // Calculate progress percentage
              const userLevelScore = parseFloat(param.userLevelAvg.replace('%', ''));
              let targetScore = parseFloat(param.target.toString().replace('%', '').replace('≥', '').replace('≤', ''));
              
              if (isNaN(targetScore)) {
                targetScore = 100;
              }
              
              const progress = Math.min(Math.max((userLevelScore / targetScore) * 100, 0), 100);

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
                          {param.name === 'Branch Structure & Staffing' ? '87%' :
                           param.name === 'Loan Consultant Performance' ? '45%' :
                           param.name === 'Loan Products & Interest Rates' ? '58%' :
                           param.name === 'Risk Management & Defaults Index' ? '45%' :
                           param.name === 'Revenue & Performance Metrics Index' ? '39%' :
                           param.name === 'Cash & Liquidity Management Index' ? '50%' :
                           '--'}
                        </span>
                        {param.name !== 'Cash & Liquidity Management Index' && param.userLevelAvg !== '--' && param.userLevelAvg !== '--%' && (
                          <span className={`text-xs font-medium ${parseFloat(param.userLevelAvg) >= parseFloat(param.name === 'Branch Structure & Staffing' ? '87' : param.name === 'Loan Consultant Performance' ? '45' : param.name === 'Loan Products & Interest Rates' ? '58' : param.name === 'Risk Management & Defaults Index' ? '45' : param.name === 'Revenue & Performance Metrics Index' ? '39' : param.name === 'Cash & Liquidity Management Index' ? '50' : '0') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {parseFloat(param.userLevelAvg) >= parseFloat(param.name === 'Branch Structure & Staffing' ? '87' : param.name === 'Loan Consultant Performance' ? '45' : param.name === 'Loan Products & Interest Rates' ? '58' : param.name === 'Risk Management & Defaults Index' ? '45' : param.name === 'Revenue & Performance Metrics Index' ? '39' : param.name === 'Cash & Liquidity Management Index' ? '50' : '0') ? '▲' : '▼'}
                          {Math.abs(parseFloat(param.userLevelAvg) - parseFloat(param.name === 'Branch Structure & Staffing' ? '87' : param.name === 'Loan Consultant Performance' ? '45' : param.name === 'Loan Products & Interest Rates' ? '58' : param.name === 'Risk Management & Defaults Index' ? '45' : param.name === 'Revenue & Performance Metrics Index' ? '39' : param.name === 'Cash & Liquidity Management Index' ? '50' : '0')).toFixed(0)}%
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
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusBadge(param.status)} mb-2 inline-block`}>
                          {param.status === 'good' ? 'GOOD' : param.status === 'warning' ? 'WARNING' : 'CRITICAL'}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                param.status === 'critical' ? 'bg-red-500' :
                                param.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
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
                        <div className="space-y-4 rounded-lg">
                          <div className="rounded-lg">
                            <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">📊 KEY PERFORMANCE INDICATORS:</h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full">
                                <thead className="bg-blue-100 dark:bg-blue-900/30">
                                  <tr>
                                    <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Metric</th>
                                    <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Current {levelLabel} Avg</th>
                                    <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Inst Avg</th>
                                    <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Target</th>
                                    <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Variance</th>
                                    <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Contribution</th>
                                    <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Trend</th>
                                    <th className="px-4 py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-200 dark:divide-blue-900/20">
                                  {kpis.map((kpi, kpiIndex) => (
                                    <tr 
                                      key={kpiIndex} 
                                      className="hover:bg-blue-100 dark:hover:bg-blue-900/20 cursor-pointer"
                                      onClick={() => onKpiClick?.(kpi.name)}
                                    >
                                      <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-white">{kpi.name}</td>
                                      <td className="px-4 py-2 text-center text-sm font-semibold text-gray-900 dark:text-white">{parseFloat(kpi.currentPeriod)}%</td>
                                      <td className="px-4 py-2 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                        {kpi.name === 'Staff Adequacy Score' ? '87%' : 
                                         kpi.name === 'Productivity Achievement' ? '75-100%' : 
                                         kpi.name === 'Vacancy Impact' ? '46.7%' : 
                                         kpi.name === 'Portfolio Load Balance' ? '50%' : 
                                         kpi.name === 'Volume Achievement' ? '13%' : 
                                         kpi.name === 'Portfolio quality' ? '71.64%' : 
                                         kpi.name === 'Default contribution' ? '28.36%' : 
                                         kpi.name === 'Collections efficiency' ? '71.64%' : 
                                         kpi.name === 'Vetting compliance' ? '100%' : 
                                         kpi.name === 'Product distribution mix' ? '87.31%' : 
                                         kpi.name === 'Revenue yield per product' ? '38.17%' : 
                                         kpi.name === 'Product risk contribution' ? '28.36%' : 
                                         kpi.name === 'Margin alignment with strategy' ? '55%' : 
                                         kpi.name === 'Default rate (branch, province, institutional)' ? '28.36%' : 
                                         kpi.name === 'Default aging analysis' ? '43.95%' : 
                                         kpi.name === 'Recovery rate within 3 months' ? '56.05%' : 
                                         kpi.name === 'Risk migration trends' ? '20%' : 
                                         kpi.name === 'Branch revenue' ? '2.5%' : 
                                         kpi.name === 'Cost-to-income ratios' ? '55%' : 
                                         kpi.name === 'Institutional average performance' ? '75-100%' : 
                                         kpi.name === 'Growth trajectory alignment' ? '2.5%' : 
                                         kpi.name === 'Revenue achievement' ? '27.9%' : 
                                         kpi.name === 'Profitability contribution' ? '27.9%' : 
                                         kpi.name === 'Cash Position Score' ? '50%' : 
                                         kpi.name === 'Above-Threshold Risk' ? '0%' : 
                                         kpi.name === 'Below-Threshold Risk' ? '0%' : 
                                         kpi.name === 'Approved Exception Ratio' ? '100%' :
                                            '--'}
                                      </td>
                                      <td className="px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400">{kpi.target}</td>
                                      <td className="px-4 py-2 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                          <span className={getTrendBadge(kpi.trend)}>{kpi.trend}</span>
                                          <span className={`text-sm ${getVarianceColor(kpi.variance)}`}>{kpi.variance}</span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 text-center text-sm">
                                        {kpi.name === 'Staff Adequacy Score' && staffAdequacyData ? `${parseFloat(staffAdequacyData.percentage_point).toFixed(2)} of ${staffAdequacyData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Productivity Achievement' && productivityAchievementData ? `${parseFloat(productivityAchievementData.percentage_point).toFixed(2)} of ${productivityAchievementData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Vacancy Impact' && vacancyImpactData ? `${parseFloat(vacancyImpactData.percentage_point).toFixed(2)} of ${vacancyImpactData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Volume Achievement' && volumeAchievementData ? `${parseFloat(volumeAchievementData.percentage_point).toFixed(2)} of ${volumeAchievementData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Portfolio Load Balance' && loanPortfolioLoadData ? `${parseFloat(loanPortfolioLoadData.percentage_point).toFixed(2)} of ${loanPortfolioLoadData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Portfolio quality' && portfolioQualityData ? `${parseFloat(portfolioQualityData.percentage_point).toFixed(2)} of ${portfolioQualityData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Default contribution' && month1DefaultPerformanceData ? `${parseFloat(month1DefaultPerformanceData.percentage_point).toFixed(2)} of ${month1DefaultPerformanceData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Collections efficiency' && collectionEfficiencyData ? `${parseFloat(collectionEfficiencyData.percentage_point).toFixed(2)} of ${collectionEfficiencyData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Vetting compliance' && productRiskScoreData ? `${parseFloat(productRiskScoreData.percentage_point).toFixed(2)} of ${productRiskScoreData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Product distribution mix' && productDiversificationData ? `${parseFloat(productDiversificationData.percentage_point).toFixed(2)} of ${productDiversificationData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Revenue yield per product' && yieldAchievementsData ? `${parseFloat(yieldAchievementsData.percentage_point).toFixed(2)} of ${yieldAchievementsData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Product risk contribution' && productRiskScoreData ? `${parseFloat(productRiskScoreData.percentage_point).toFixed(2)} of ${productRiskScoreData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Margin alignment with strategy' && efficiencyRatioData ? `${parseFloat(efficiencyRatioData.percentage_point).toFixed(2)} of ${efficiencyRatioData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Default rate (branch, province, institutional)' && month1DefaultPerformanceData ? `${parseFloat(month1DefaultPerformanceData.percentage_point).toFixed(2)} of ${month1DefaultPerformanceData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Default aging analysis' && longTermDelinquencyData ? `${parseFloat(longTermDelinquencyData.percentage_point).toFixed(2)} of ${longTermDelinquencyData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Recovery rate within 3 months' && month3RecoveryAchievementsData ? `${parseFloat(month3RecoveryAchievementsData.percentage_point).toFixed(2)} of ${month3RecoveryAchievementsData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Risk migration trends' && rollRateControlData ? `${parseFloat(rollRateControlData.percentage_point).toFixed(2)} of ${rollRateControlData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Branch revenue' && growthTrajectoryData ? `${parseFloat(growthTrajectoryData.PP).toFixed(2)} of 10pp` : 
                                         kpi.name === 'Cost-to-income ratios' && efficiencyRatioData ? `${parseFloat(efficiencyRatioData.percentage_point).toFixed(2)} of ${efficiencyRatioData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Institutional average performance' && productivityAchievementData ? `${parseFloat(productivityAchievementData.percentage_point).toFixed(2)} of ${productivityAchievementData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Growth trajectory alignment' && growthTrajectoryData ? `${parseFloat(growthTrajectoryData.PP).toFixed(2)} of 10pp` : 
                                         kpi.name === 'Revenue achievement' && revenueAchievementsData ? `${parseFloat(revenueAchievementsData.percentage_point).toFixed(2)} of ${revenueAchievementsData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Profitability contribution' && profitabilityContributionData ? `${parseFloat(profitabilityContributionData.percentage_point).toFixed(2)} of ${profitabilityContributionData.weight.replace('%','')}pp` : 
                                         kpi.name === 'Cash Position Score' && cashPositionData ? `${parseFloat(cashPositionData.percentage_points || cashPositionData.percentage_point || '0').toFixed(2)} of 40pp` : 
                                         kpi.name === 'Above-Threshold Risk' && aboveThresholdRiskData ? `${parseFloat(aboveThresholdRiskData.percentage_points || aboveThresholdRiskData.percentage_point || '0').toFixed(2)} of 30pp` : 
                                         kpi.name === 'Below-Threshold Risk' && belowThresholdRiskData ? `${parseFloat(belowThresholdRiskData.percentage_points || belowThresholdRiskData.percentage_point || '0').toFixed(2)} of 20pp` : 
                                            '0'}
                                      </td>
                                      <td className="px-4 py-2 text-center">
                                        {/* Trend already shown in Variance column */}
                                        <span className={`text-xs ${kpi.trend === '↑' ? 'text-green-600' : kpi.trend === '↓' ? 'text-red-600' : 'text-gray-500'}`}>{kpi.trend}</span>
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
