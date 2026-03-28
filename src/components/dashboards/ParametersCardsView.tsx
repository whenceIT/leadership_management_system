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

interface ParametersCardsViewProps {
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

export function ParametersCardsView({
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
}: ParametersCardsViewProps) {
  const levelLabel = {
    institution: 'Institutional',
    province: 'Provincial',
    district: 'District',
    branch: 'Branch',
    consultant: 'Personal'
  }[userLevel];

  // Helper to get status color
  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
    }
  };

  // Helper to get progress percentage
  const getProgress = (param: ParameterSummary) => {
    const userLevelScore = parseFloat(param.userLevelAvg.replace('%', ''));
    let targetScore = parseFloat(param.target.toString().replace('%', '').replace('≥', '').replace('≤', ''));
    if (isNaN(targetScore)) {
      targetScore = 100;
    }
    return Math.min(Math.max((userLevelScore / targetScore) * 100, 0), 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        const progress = getProgress(param);

        return (
          <div 
            key={index}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all ${isExpanded ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''}`}
          >
            {/* Card Header */}
            <div 
              className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30"
              onClick={() => onToggleExpand(param.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`mr-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                    ▶
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{param.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{param.shortName}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusBadge(param.status)}`}>
                  {param.status === 'good' ? 'GOOD' : param.status === 'warning' ? 'WARNING' : 'CRITICAL'}
                </span>
              </div>
            </div>

            {/* Card Stats Row */}
            <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Current</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{param.userLevelAvg}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Target</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{param.target}</p>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Progress</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(param.status)}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <span className={getTrendBadge(param.trend)}>{param.trend}</span>
                  <span className={`text-xs ml-1 ${getVarianceColor(param.variance)}`}>
                    {param.variance}
                  </span>
                </div>
                <span className="text-xs text-gray-400">({param.varianceAbs})</span>
              </div>
            </div>

            {/* Expanded KPI List */}
            {isExpanded && (
              <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-blue-50 dark:bg-blue-900/20">
                <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3">📊 KEY PERFORMANCE INDICATORS</h4>
                <div className="space-y-2">
                  {kpis.map((kpi, kpiIndex) => (
                    <div 
                      key={kpiIndex}
                      className="bg-white dark:bg-gray-800 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onKpiClick?.(kpi.name)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{kpi.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusBadge(kpi.status)}`}>
                          {kpi.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Current</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{kpi.currentPeriod}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Target</p>
                          <p className="font-semibold text-gray-700 dark:text-gray-300">{kpi.target}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Variance</p>
                          <p className={`font-semibold ${getVarianceColor(kpi.variance)}`}>{kpi.variance}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
