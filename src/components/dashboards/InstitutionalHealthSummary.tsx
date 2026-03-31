'use client';

import React, { useState, useEffect } from 'react';
import ApiLoader from '@/components/ApiLoader/ApiLoader';
import HealthAnalysisSections from './HealthAnalysisSections';
import { ProvinceLevelView } from './ProvinceLevelView';
import { BranchLevelView } from './BranchLevelView';
import { ParametersTableView } from './ParametersTableView';
import { ParametersCardsView } from './ParametersCardsView';

interface KPI { 
  name: string;
  institutionalAvg: string;
  currentPeriod: string;
  target: string;
  variance: string;
  trend: '↑' | '↓' | '→';
  status: 'good' | 'warning' | 'critical';
}

interface ParameterKPIs {
  [key: string]: KPI[];
}

interface DrillDownData {
  parameter: string;
  metrics: {
    name: string;
    institutionalAvg: string;
    currentPeriod: string;
    target: string;
    variance: string;
    trend: '↑' | '↓' | '→';
    status: 'good' | 'warning' | 'critical';
  }[];
  trendAnalysis: {
    overallScore: string;
    primaryDeclines: { parameter: string; variance: string }[];
    geographicOrigin: string;
    branchLevel: { branch: string; variance: string }[];
  };
  alerts: {
    level: 'critical' | 'warning' | 'good';
    parameter: string;
    value: string;
    variance: string;
  }[];
}

interface DrillDownProps {
  data: DrillDownData;
  onClose: () => void;
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

interface KeyMetric {
  parameter: string;
  institutionalAvg: string;
  currentPeriod: string;
  target: string;
  variance: string;
  trend: '↑' | '↓' | '→';
  provAvg?: string;
  contribution?: string;
}

interface RecentActivity {
  time: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  parameter: string;
}

export interface InstitutionalSummaryData {
  parameters: ParameterSummary[];
  keyMetrics: KeyMetric[];
  recentActivities: RecentActivity[];
  overallScore: number;
  overallInstAvg: number;
  overallTarget: number;
}

export function getInstitutionalSummaryData(userLevel: 'institution' | 'province' | 'district' | 'branch' | 'consultant', userLevelLabel: string, 
  staffAdequacyData?: any, productivityAchievementData?: any, vacancyImpactData?: any, loanPortfolioLoadData?: any,
  volumeAchievementData?: any, collectionEfficiencyData?: any, efficiencyRatioData?: any, growthTrajectoryData?: any,
  longTermDelinquencyData?: any, month1DefaultPerformanceData?: any, month3RecoveryAchievementsData?: any,
  portfolioQualityData?: any, productDiversificationData?: any, productRiskScoreData?: any, rollRateControlData?: any,
  yieldAchievementsData?: any, revenueAchievementsData?: any, profitabilityContributionData?: any,
  cashPositionData?: any, aboveThresholdRiskData?: any, belowThresholdRiskData?: any, approvedExceptionRatioData?: any): InstitutionalSummaryData {
  
  // Calculate aggregated scores for each parameter
  const branchStructureAggregated = aggregateBranchStructureKPIs(staffAdequacyData, productivityAchievementData, vacancyImpactData, loanPortfolioLoadData);
  const lcPerformanceAggregated = aggregateLoanConsultantPerformanceKPIs(volumeAchievementData, collectionEfficiencyData, portfolioQualityData, month1DefaultPerformanceData, productRiskScoreData);
  const loanProductsAggregated = aggregateLoanProductsKPIs(productDiversificationData, yieldAchievementsData, productRiskScoreData, efficiencyRatioData);
  const riskManagementAggregated = aggregateRiskManagementKPIs(month1DefaultPerformanceData, longTermDelinquencyData, month3RecoveryAchievementsData, rollRateControlData);
  const revenuePerformanceAggregated = aggregateRevenuePerformanceKPIs(growthTrajectoryData, efficiencyRatioData, productivityAchievementData, revenueAchievementsData, profitabilityContributionData);
  const cashLiquidityAggregated = aggregateCashLiquidityManagementKPIs(cashPositionData, aboveThresholdRiskData, belowThresholdRiskData, approvedExceptionRatioData);

  // Base data that can be adjusted based on user level
  const baseParameters: ParameterSummary[] = [
    {
      name: 'Branch Structure & Staffing Index',
      shortName: 'Staffing & Structure',
      institutionalAvg: branchStructureAggregated.institutionalAvg || '--',
      userLevelAvg: branchStructureAggregated.userLevelAvg || '--',
      target: branchStructureAggregated.target || '--',
      variance: branchStructureAggregated.variance || '--',
      varianceAbs: branchStructureAggregated.varianceAbs || '--',
      trend: branchStructureAggregated.trend || '→',
      status: branchStructureAggregated.status || 'warning'
    },
    {
      name: 'Loan Consultant Performance Index',
      shortName: 'LC Performance',
      institutionalAvg: lcPerformanceAggregated.institutionalAvg || '--',
      userLevelAvg: lcPerformanceAggregated.userLevelAvg || '--',
      target: lcPerformanceAggregated.target || '--',
      variance: lcPerformanceAggregated.variance || '--',
      varianceAbs: lcPerformanceAggregated.varianceAbs || '--',
      trend: lcPerformanceAggregated.trend || '→',
      status: lcPerformanceAggregated.status || 'warning'
    },
    {
      name: 'Loan Products & Interest Rates Index',
      shortName: 'Products & Rates',
      institutionalAvg: loanProductsAggregated.institutionalAvg || '--',
      userLevelAvg: loanProductsAggregated.userLevelAvg || '--',
      target: loanProductsAggregated.target || '--',
      variance: loanProductsAggregated.variance || '--',
      varianceAbs: loanProductsAggregated.varianceAbs || '--',
      trend: loanProductsAggregated.trend || '→',
      status: loanProductsAggregated.status || 'warning'
    },
    {
      name: 'Risk Management & Defaults Index',
      shortName: 'Risk & Defaults',
      institutionalAvg: riskManagementAggregated.institutionalAvg || '--',
      userLevelAvg: riskManagementAggregated.userLevelAvg || '--',
      target: riskManagementAggregated.target || '--',
      variance: riskManagementAggregated.variance || '--',
      varianceAbs: riskManagementAggregated.varianceAbs || '--',
      trend: riskManagementAggregated.trend || '→',
      status: riskManagementAggregated.status || 'warning'
    },
    {
      name: 'Revenue & Performance Metrics Index',
      shortName: 'Revenue & Performance',
      institutionalAvg: revenuePerformanceAggregated.institutionalAvg || '--',
      userLevelAvg: revenuePerformanceAggregated.userLevelAvg || '--',
      target: revenuePerformanceAggregated.target || '--',
      variance: revenuePerformanceAggregated.variance || '--',
      varianceAbs: revenuePerformanceAggregated.varianceAbs || '--',
      trend: revenuePerformanceAggregated.trend || '→',
      status: revenuePerformanceAggregated.status || 'warning'
    },
    {
      name: 'Cash & Liquidity Management Index',
      shortName: 'Cash & Liquidity',
      institutionalAvg: cashLiquidityAggregated.institutionalAvg || '--',
      userLevelAvg: cashLiquidityAggregated.userLevelAvg || '--',
      target: cashLiquidityAggregated.target || '--',
      variance: cashLiquidityAggregated.variance || '--',
      varianceAbs: cashLiquidityAggregated.varianceAbs || '--',
      trend: cashLiquidityAggregated.trend || '→',
      status: cashLiquidityAggregated.status || 'warning'
    }
  ];

  const baseKeyMetrics: KeyMetric[] = [
    {
      parameter: 'Staff Adequacy Score',
      institutionalAvg: '--',
      currentPeriod: '--',
      target: '--',
      variance: '--',
      trend: '→',
      provAvg: '--',
      contribution: '--'
    },
    {
      parameter: 'Productivity Achievement',
      institutionalAvg: '--',
      currentPeriod: '--',
      target: '--',
      variance: '--',
      trend: '→',
      provAvg: '--',
      contribution: '--'
    },
    {
      parameter: 'Month-1 Default Rate',
      institutionalAvg: '--',
      currentPeriod: '--',
      target: '--',
      variance: '--',
      trend: '→',
      provAvg: '--',
      contribution: '--'
    },
    {
      parameter: '3-Month Recovery Rate',
      institutionalAvg: '--',
      currentPeriod: '--',
      target: '--',
      variance: '--',
      trend: '→',
      provAvg: '--',
      contribution: '--'
    },
    {
      parameter: 'Cash Position Score',
      institutionalAvg: '--',
      currentPeriod: '--',
      target: '--',
      variance: '--',
      trend: '→',
      provAvg: '--',
      contribution: '--'
    },
    {
      parameter: 'Above-Threshold Risk',
      institutionalAvg: '--',
      currentPeriod: '--',
      target: '--',
      variance: '--',
      trend: '→',
      provAvg: '--',
      contribution: '--'
    },
    {
      parameter: 'Below-Threshold Risk',
      institutionalAvg: '--',
      currentPeriod: '--',
      target: '--',
      variance: '--',
      trend: '→',
      provAvg: '--',
      contribution: '--'
    }
  ];

  const baseRecentActivities: RecentActivity[] = [
    {
      time: '2024-07-15 09:34',
      description: 'Performance Manager updated KPIs for Q3',
      impact: 'neutral',
      parameter: 'All Parameters'
    },
    {
      time: '2024-07-14 14:20',
      description: 'Branch Manager acknowledged declining staff adequacy',
      impact: 'negative',
      parameter: 'Branch Structure & Staffing Index'
    },
    {
      time: '2024-07-13 11:05',
      description: 'Risk Management team identified increasing defaults',
      impact: 'negative',
      parameter: 'Risk Management & Defaults Index'
    },
    {
      time: '2024-07-12 08:45',
      description: 'District Manager reviewed branch performance',
      impact: 'positive',
      parameter: 'Loan Consultant Performance Index'
    }
  ];

  // Calculate overall score by averaging the five headline parameters
  const overallScore = Math.round(
    baseParameters.reduce((sum, param) => {
      const score = parseFloat(param.userLevelAvg.replace('%', ''));
      return sum + (isNaN(score) ? 0 : score);
    }, 0) / baseParameters.length
  );

  // Calculate overall institutional average by averaging the institutional averages of the five parameters
  const overallInstAvg = Math.round(
    baseParameters.reduce((sum, param) => {
      const score = parseFloat(param.institutionalAvg.replace('%', ''));
      return sum + (isNaN(score) ? 0 : score);
    }, 0) / baseParameters.length
  );

  // Calculate overall target (assuming target is ≥90% for all parameters)
  const overallTarget = 90;

  return {
    parameters: baseParameters,
    keyMetrics: baseKeyMetrics,
    recentActivities: baseRecentActivities,
    overallScore,
    overallInstAvg,
    overallTarget
  };
}

interface InstitutionalHealthSummaryProps {
  userLevel: 'institution' | 'province' | 'district' | 'branch' | 'consultant';
  userLevelLabel: string;
  userProvinceId?: number; // For provincial managers - their assigned province
  parameters: ParameterSummary[];
  keyMetrics?: KeyMetric[];
  recentActivities?: RecentActivity[];
  overallScore?: number;
  overallInstAvg?: number;
  overallTarget?: number;
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
  isLoading?: boolean;
}

function getTrendColor(trend: '↑' | '↓' | '→', status: 'good' | 'warning' | 'critical') {
  if (status === 'critical') return 'text-red-600 dark:text-red-400';
  if (status === 'warning') return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
}

function getAlertColor(level: 'critical' | 'warning' | 'good') {
  switch (level) {
    case 'critical': return 'text-red-600 dark:text-red-400';
    case 'warning': return 'text-yellow-600 dark:text-yellow-400';
    case 'good': return 'text-green-600 dark:text-green-400';
  }
}

function getAlertBadge(level: 'critical' | 'warning' | 'good') {
  switch (level) {
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'good': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  }
}

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

function aggregateBranchStructureKPIs(staffAdequacyData?: any, productivityAchievementData?: any, vacancyImpactData?: any, loanPortfolioLoadData?: any): Partial<ParameterSummary> {
  // Check if we're dealing with provincial data (has average_normalized_score instead of normalized_score)
  const isProvincialData = staffAdequacyData?.average_normalized_score !== undefined;

  if (isProvincialData && staffAdequacyData) {
    // For provincial data, we have a single aggregated score from the API
    const overallScore = Math.round(staffAdequacyData.average_normalized_score);
    const target = 100;
    const variance = overallScore - target;
    const varianceStr = variance >= 0 ? `+${variance}%` : `${variance}%`;
    const varianceAbs = `${Math.abs(variance)}pp`;
    
    const trend = overallScore >= 90 ? '↑' : overallScore >= 70 ? '→' : '↓';
    const status: 'good' | 'warning' | 'critical' = overallScore >= 90 ? 'good' : overallScore >= 70 ? 'warning' : 'critical';

    return {
      institutionalAvg: '78%', // Hardcoded from Five Parameters.md
      userLevelAvg: `${overallScore}%`,
      target: '100%',
      variance: varianceStr,
      varianceAbs,
      trend,
      status
    };
  }

  // For branch-level data, aggregate from individual metrics
  const kpis = [
    { 
      data: staffAdequacyData, 
      getScore: (d: any) => parseFloat(d?.normalized_score || '0'),
      weight: parseFloat(staffAdequacyData?.weight || '25') / 100
    },
    { 
      data: productivityAchievementData, 
      getScore: (d: any) => parseFloat(d?.normalized_score || '0'),
      weight: parseFloat(productivityAchievementData?.weight || '25') / 100
    },
    { 
      data: vacancyImpactData, 
      getScore: (d: any) => parseFloat(d?.normalized_score || '0') * 100,
      weight: parseFloat(vacancyImpactData?.weight || '25') / 100
    },
    { 
      data: loanPortfolioLoadData, 
      getScore: (d: any) => parseFloat(d?.score || '0'),
      weight: parseFloat(loanPortfolioLoadData?.weight || '25') / 100
    }
  ].filter(kpi => kpi.data);

  // If no data, return default values instead of '--'
  if (kpis.length === 0) {
    return {
      institutionalAvg: '--',
      userLevelAvg: '--',
      target:  '100%',
      variance:  '--',
      varianceAbs:  '--',
      trend: '→',
      status: 'warning'
    };
  }

  const weightedScore = kpis.reduce((sum, kpi) => sum + (kpi.getScore(kpi.data) * kpi.weight), 0);
  const overallScore = Math.round(weightedScore);
  
  const target = 100;
  const variance = overallScore - target;
  const varianceStr = variance >= 0 ? `+${variance}%` : `${variance}%`;
  const varianceAbs = `${Math.abs(variance)}pp`;
  
    const trend = overallScore >= 90 ? '↑' : overallScore >= 70 ? '→' : '↓';
    const status: 'good' | 'warning' | 'critical' = overallScore >= 90 ? 'good' : overallScore >= 70 ? 'warning' : 'critical';

  return {
    institutionalAvg: '78%', // Hardcoded from Five Parameters.md
    userLevelAvg: `${overallScore}%`,
    target: '85%',
    variance: varianceStr,
    varianceAbs,
    trend,
    status
  };
}

function aggregateLoanConsultantPerformanceKPIs(
  volumeAchievementData?: any,
  collectionEfficiencyData?: any,
  portfolioQualityData?: any,
  month1DefaultPerformanceData?: any,
  productRiskScoreData?: any
): Partial<ParameterSummary> {
  const kpis = [
    { 
      data: volumeAchievementData, 
      getScore: (d: any) => parseFloat(d?.average_normalized_score || '0'),
      weight: parseFloat(volumeAchievementData?.weight || '20') / 100
    },
    { 
      data: collectionEfficiencyData, 
      getScore: (d: any) => parseFloat(d?.average_score || '0'),
      weight: parseFloat(collectionEfficiencyData?.weight || '20') / 100
    },
    { 
      data: portfolioQualityData, 
      getScore: (d: any) => parseFloat(d?.average_score || '0'),
      weight: parseFloat(portfolioQualityData?.weight || '20') / 100
    },
    { 
      data: month1DefaultPerformanceData, 
      getScore: (d: any) => parseFloat(d?.average_score || '0'),
      weight: parseFloat(month1DefaultPerformanceData?.weight || '20') / 100
    },
    { 
      data: productRiskScoreData, 
      getScore: (d: any) => parseFloat(d?.average_score || '0') * 100,
      weight: parseFloat(productRiskScoreData?.weight || '20') / 100
    }
  ].filter(kpi => kpi.data);

  // If no data, return default values instead of '--'
  if (kpis.length === 0) {
    return {
      institutionalAvg: '62%',
      userLevelAvg: '--',
      target: '80%',
      variance: '--',
      varianceAbs: '--',
      trend: '→',
      status: 'warning'
    };
  }

  const weightedScore = kpis.reduce((sum, kpi) => sum + (kpi.getScore(kpi.data) * kpi.weight), 0);
  const overallScore = Math.round(weightedScore);
  
  const target = 80;
  const variance = overallScore - target;
  const varianceStr = variance >= 0 ? `+${variance}%` : `${variance}%`;
  const varianceAbs = `${Math.abs(variance)}pp`;
  
    const trend = overallScore >= 90 ? '↑' : overallScore >= 70 ? '→' : '↓';
    const status: 'good' | 'warning' | 'critical' = overallScore >= 90 ? 'good' : overallScore >= 70 ? 'warning' : 'critical';

  return {
    institutionalAvg: '62%',
    userLevelAvg: `${overallScore}%`,
    target: '80%',
    variance: varianceStr,
    varianceAbs,
    trend,
    status
  };
}

function aggregateLoanProductsKPIs(
  productDiversificationData?: any,
  yieldAchievementsData?: any,
  productRiskScoreData?: any,
  efficiencyRatioData?: any
): Partial<ParameterSummary> {
  const kpis = [
    { 
      data: productDiversificationData, 
      getScore: (d: any) => (1 - parseFloat(d?.average_HHI || '0')) * 100, // HHI inverse for better score
      weight: parseFloat(productDiversificationData?.weight || '25') / 100
    },
    { 
      data: yieldAchievementsData, 
      getScore: (d: any) => parseFloat(d?.average_score || '0'),
      weight: parseFloat(yieldAchievementsData?.weight || '25') / 100
    },
    { 
      data: productRiskScoreData, 
      getScore: (d: any) => (1 - parseFloat(d?.average_score || '0')) * 100, // Inverse risk score
      weight: parseFloat(productRiskScoreData?.weight || '25') / 100
    },
    { 
      data: efficiencyRatioData, 
      getScore: (d: any) => parseFloat(d?.average_score || '0'),
      weight: parseFloat(efficiencyRatioData?.weight || '25') / 100
    }
  ].filter(kpi => kpi.data);

  // If no data, return default values instead of '--'
  if (kpis.length === 0) {
    return {
      institutionalAvg: '74%',
      userLevelAvg: '--',
      target: '80%',
      variance: '--',
      varianceAbs: '--',
      trend: '→',
      status: 'warning'
    };
  }

  const weightedScore = kpis.reduce((sum, kpi) => sum + (kpi.getScore(kpi.data) * kpi.weight), 0);
  const overallScore = Math.round(weightedScore);
  
  const target = 80;
  const variance = overallScore - target;
  const varianceStr = variance >= 0 ? `+${variance}%` : `${variance}%`;
  const varianceAbs = `${Math.abs(variance)}pp`;
  
    const trend = overallScore >= 90 ? '↑' : overallScore >= 70 ? '→' : '↓';
    const status: 'good' | 'warning' | 'critical' = overallScore >= 90 ? 'good' : overallScore >= 70 ? 'warning' : 'critical';

  return {
    institutionalAvg: '74%',
    userLevelAvg: `${overallScore}%`,
    target: '80%',
    variance: varianceStr,
    varianceAbs,
    trend,
    status
  };
}

function aggregateRiskManagementKPIs(
  month1DefaultPerformanceData?: any,
  longTermDelinquencyData?: any,
  month3RecoveryAchievementsData?: any,
  rollRateControlData?: any
): Partial<ParameterSummary> {
  const kpis = [
    { 
      data: month1DefaultPerformanceData, 
      getScore: (d: any) => parseFloat(d?.average_score || '0'),
      weight: parseFloat(month1DefaultPerformanceData?.weight || '25') / 100
    },
    { 
      data: longTermDelinquencyData, 
      getScore: (d: any) => parseFloat(d?.average_score || '0'),
      weight: parseFloat(longTermDelinquencyData?.weight || '25') / 100
    },
    { 
      data: month3RecoveryAchievementsData, 
      getScore: (d: any) => parseFloat(d?.average_score || '0'),
      weight: parseFloat(month3RecoveryAchievementsData?.weight || '25') / 100
    },
    { 
      data: rollRateControlData, 
      getScore: (d: any) => parseFloat(d?.average_score || '0'),
      weight: parseFloat(rollRateControlData?.weight || '25') / 100
    }
  ].filter(kpi => kpi.data);

  // If no data, return default values instead of '--'
  if (kpis.length === 0) {
    return {
      institutionalAvg: '52%',
      userLevelAvg: '--',
      target: '75%',
      variance: '--',
      varianceAbs: '--',
      trend: '→',
      status: 'warning'
    };
  }

  const weightedScore = kpis.reduce((sum, kpi) => sum + (kpi.getScore(kpi.data) * kpi.weight), 0);
  const overallScore = Math.round(weightedScore);
  
  const target = 75;
  const variance = overallScore - target;
  const varianceStr = variance >= 0 ? `+${variance}%` : `${variance}%`;
  const varianceAbs = `${Math.abs(variance)}pp`;
  
    const trend = overallScore >= 90 ? '↑' : overallScore >= 70 ? '→' : '↓';
    const status: 'good' | 'warning' | 'critical' = overallScore >= 90 ? 'good' : overallScore >= 70 ? 'warning' : 'critical';

  return {
    institutionalAvg: '52%',
    userLevelAvg: `${overallScore}%`,
    target: '75%',
    variance: varianceStr,
    varianceAbs,
    trend,
    status
  };
}

function aggregateCashLiquidityManagementKPIs(
  cashPositionData?: any,
  aboveThresholdRiskData?: any,
  belowThresholdRiskData?: any,
  approvedExceptionRatioData?: any
): Partial<ParameterSummary> {
  // Check if we have the new cash position score data format
  if (cashPositionData && (cashPositionData.score || cashPositionData.average_score)) {
    const score = parseFloat(cashPositionData.score || cashPositionData.average_score || '0');
    const target = 100; // Since the API returns scores up to 100
    const variance = score - target;
    const varianceStr = variance >= 0 ? `+${variance}%` : `${variance}%`;
    const varianceAbs = `${Math.abs(variance)}pp`;
    
    const trend = score >= 90 ? '↑' : '↓';
    const status: 'good' | 'warning' | 'critical' = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';

    return {
      institutionalAvg: '--',
      userLevelAvg: `${score.toFixed(1)}%`,
      target: 'K20,000 to K30,000',
      variance: varianceStr,
      varianceAbs,
      trend,
      status
    };
  }

  const kpis = [
    { 
      data: cashPositionData, 
      getScore: (d: any) => parseFloat(d?.average_score || '0'),
      weight: parseFloat(cashPositionData?.weight || '40') / 100
    },
    { 
      data: aboveThresholdRiskData, 
      getScore: (d: any) => parseFloat(d?.average_score || '0'),
      weight: parseFloat(aboveThresholdRiskData?.weight || '30') / 100
    },
    { 
      data: belowThresholdRiskData, 
      getScore: (d: any) => parseFloat(d?.average_score || '0'),
      weight: parseFloat(belowThresholdRiskData?.weight || '20') / 100
    },
    { 
      data: approvedExceptionRatioData, 
      getScore: (d: any) => parseFloat(d?.average_score || '0'),
      weight: parseFloat(approvedExceptionRatioData?.weight || '10') / 100
    }
  ].filter(kpi => kpi.data);

  // If no data, return default values instead of '--'
  if (kpis.length === 0) {
    return {
      institutionalAvg: 'nil',
      userLevelAvg: '--',
      target: 'nil',
      variance: 'nil',
      varianceAbs: 'nil',
      trend: '→',
      status: 'warning'
    };
  }

  const weightedScore = kpis.reduce((sum, kpi) => sum + (kpi.getScore(kpi.data) * kpi.weight), 0);
  const overallScore = Math.round(weightedScore);
  
  const target = 100;
  const variance = overallScore - target;
  const varianceStr = variance >= 0 ? `+${variance}%` : `${variance}%`;
  const varianceAbs = `${Math.abs(variance)}pp`;
  
    const trend = overallScore >= 90 ? '↑' : overallScore >= 70 ? '→' : '↓';
    const status: 'good' | 'warning' | 'critical' = overallScore >= 90 ? 'good' : overallScore >= 70 ? 'warning' : 'critical';

  const validInstitutionalAvgs = kpis
    .map(kpi => parseFloat(kpi.data?.instAvg || '0'))
    .filter(score => !isNaN(score));
  const institutionalAvg = validInstitutionalAvgs.length > 0 
    ? `${Math.round(validInstitutionalAvgs.reduce((a, b) => a + b, 0) / validInstitutionalAvgs.length)}%`
    : '--';

  return {
    institutionalAvg,
    userLevelAvg: `${overallScore}%`,
    target: '100%',
    variance: varianceStr,
    varianceAbs,
    trend,
    status
  };
}

function aggregateRevenuePerformanceKPIs(
  growthTrajectoryData?: any,
  efficiencyRatioData?: any,
  productivityAchievementData?: any,
  revenueAchievementsData?: any,
  profitabilityContributionData?: any
): Partial<ParameterSummary> {
  const kpis = [
    { 
      data: growthTrajectoryData, 
      getScore: (d: any) => Math.max(0, Math.min(100, parseFloat(d?.average_score || '0'))),
      weight: parseFloat(growthTrajectoryData?.weight || '20') / 100
    },
    { 
      data: efficiencyRatioData, 
      getScore: (d: any) => parseFloat(d?.average_score || '0'),
      weight: parseFloat(efficiencyRatioData?.weight || '20') / 100
    },
    { 
      data: productivityAchievementData, 
      getScore: (d: any) => parseFloat(d?.average_normalized_score || '0'),
      weight: parseFloat(productivityAchievementData?.weight || '20') / 100
    },
    { 
      data: revenueAchievementsData, 
      getScore: (d: any) => parseFloat(d?.average_score || '0'),
      weight: parseFloat(revenueAchievementsData?.weight || '20') / 100
    },
    { 
      data: profitabilityContributionData, 
      getScore: (d: any) => parseFloat(d?.average_score || '0'),
      weight: parseFloat(profitabilityContributionData?.weight || '20') / 100
    }
  ].filter(kpi => kpi.data);

  // If no data, return default values instead of '--'
  if (kpis.length === 0) {
    return {
      institutionalAvg: '65%',
      userLevelAvg: '--',
      target: '75%',
      variance: '--',
      varianceAbs: '--',
      trend: '→',
      status: 'warning'
    };
  }

  const weightedScore = kpis.reduce((sum, kpi) => sum + (kpi.getScore(kpi.data) * kpi.weight), 0);
  const overallScore = Math.round(weightedScore);
  
  const target = 75;
  const variance = overallScore - target;
  const varianceStr = variance >= 0 ? `+${variance}%` : `${variance}%`;
  const varianceAbs = `${Math.abs(variance)}pp`;
  
    const trend = overallScore >= 90 ? '↑' : overallScore >= 70 ? '→' : '↓';
    const status: 'good' | 'warning' | 'critical' = overallScore >= 90 ? 'good' : overallScore >= 70 ? 'warning' : 'critical';

  return {
    institutionalAvg: '65%',
    userLevelAvg: `${overallScore}%`,
    target: '75%',
    variance: varianceStr,
    varianceAbs,
    trend,
    status
  };
}

function getParameterKPIs(paramName: string, 
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
  approvedExceptionRatioData?: any): KPI[] {
  // Helper function to get score from data (handles both branch and institutional formats)
  const getScore = (data: any, field1: string, field2?: string): number => {
    if (!data) return 0;
    // First check field1, then fall back to field2
    let value = data[field1];
    if ((value === undefined || value === null) && field2) {
      value = data[field2];
    }
    if (value === undefined || value === null) return 0;
    const num = typeof value === 'string' ? parseFloat(value) : (typeof value === 'number' ? value : 0);
    return isNaN(num) ? 0 : num;
  };

  const kpis: ParameterKPIs = {
    'Branch Structure & Staffing Index': [
      {
        name: 'Staff Adequacy Score',
        institutionalAvg: staffAdequacyData?.instAvg || '--',
        currentPeriod: staffAdequacyData ? `${getScore(staffAdequacyData, 'normalized_score', 'average_normalized_score').toFixed(2)}` : '--',
        target: staffAdequacyData?.target || 100,
        variance: staffAdequacyData ? `${(getScore(staffAdequacyData, 'normalized_score', 'average_normalized_score') - (staffAdequacyData.target || 100)).toFixed(2)}%` : '--',
        trend: getScore(staffAdequacyData, 'normalized_score', 'average_normalized_score') >= (staffAdequacyData?.target || 100) ? '↑' : '↓',
        status: getScore(staffAdequacyData, 'normalized_score', 'average_normalized_score') >= 90 ? 'good' : getScore(staffAdequacyData, 'normalized_score', 'average_normalized_score') >= 70 ? 'warning' : 'critical'
      },
      {
        name: 'Productivity Achievement',
        institutionalAvg: productivityAchievementData ? '--' : '--',
        currentPeriod: productivityAchievementData ? `${getScore(productivityAchievementData, 'normalized_score', 'average_normalized_score').toFixed(2)}` : '0',
        target: productivityAchievementData ? 100 : '--',
        variance: productivityAchievementData ? `${((score) => {
          const s = score ?? 0;
          const t = productivityAchievementData?.target ?? 100;
          const v = s - t;
          return isNaN(v) ? '--' : `${v.toFixed(2)}%`;
        })(getScore(productivityAchievementData, 'normalized_score', 'average_normalized_score'))}` : '--',
        trend: productivityAchievementData ? (getScore(productivityAchievementData, 'normalized_score', 'average_normalized_score') >= productivityAchievementData.target ? '↑' : '↓') : '↓',
        status: productivityAchievementData ? (getScore(productivityAchievementData, 'normalized_score', 'average_normalized_score') >= 90 ? 'good' : getScore(productivityAchievementData, 'normalized_score', 'average_normalized_score') >= 70 ? 'warning' : 'critical') : 'warning'
      },
      {
        name: 'Vacancy Impact',
        institutionalAvg: vacancyImpactData ? '--' : '--',
        currentPeriod: vacancyImpactData ? `${(getScore(vacancyImpactData, 'normalized_score', 'average_normalized_score') * 100).toFixed(2)}` : '--',
        target: vacancyImpactData ? 0 : 0,
        variance: vacancyImpactData ? `${((score) => {
          const s = score ?? 0;
          const t = vacancyImpactData?.target ?? 20;
          const v = (s * 100) - t;
          return isNaN(v) ? '--' : `${v.toFixed(2)}`;
        })(getScore(vacancyImpactData, 'normalized_score', 'average_normalized_score'))}` : '--',
        trend: vacancyImpactData ? ((getScore(vacancyImpactData, 'normalized_score', 'average_normalized_score') * 100) >= vacancyImpactData.target ? '↑' : '↓') : '↑',
        status: vacancyImpactData ? ((getScore(vacancyImpactData, 'normalized_score', 'average_normalized_score') * 100) >= 90 ? 'good' : (getScore(vacancyImpactData, 'normalized_score', 'average_normalized_score') * 100) >= 70 ? 'warning' : 'critical') : 'warning'
      },
      {
        name: 'Portfolio Load Balance',
        institutionalAvg: loanPortfolioLoadData ? '--' : '--',
        currentPeriod: loanPortfolioLoadData ? `${getScore(loanPortfolioLoadData, 'score', 'average_score').toFixed(2)}` : '--',
        target: 100,
        variance: loanPortfolioLoadData ? `${((score) => {
          const s = score ?? 0;
          const t = loanPortfolioLoadData?.target ?? 100;
          const v = s - t;
          return isNaN(v) ? '--' : `${v.toFixed(2)}%`;
        })(getScore(loanPortfolioLoadData, 'score', 'average_score'))}` : '--',
        trend: loanPortfolioLoadData ? (getScore(loanPortfolioLoadData, 'score', 'average_score') >= loanPortfolioLoadData.target ? '↑' : '↓') : '↓',
        status: loanPortfolioLoadData ? (getScore(loanPortfolioLoadData, 'score', 'average_score') >= 90 ? 'good' : getScore(loanPortfolioLoadData, 'score', 'average_score') >= 70 ? 'warning' : 'critical') : 'warning'
      }
    ],
    'Loan Consultant Performance Index': [
      {
        name: 'Volume Achievement',
        institutionalAvg: volumeAchievementData ? '--' : '--',
        currentPeriod: volumeAchievementData ? `${getScore(volumeAchievementData, 'normalized_score', 'average_normalized_score').toFixed(2)}` : '--',
        target: volumeAchievementData ? `≥${parseFloat(volumeAchievementData.branch_target || '0').toLocaleString()}` : 100,
        variance: volumeAchievementData ? `${parseFloat(volumeAchievementData.total_disbursement || '0') >= parseFloat(volumeAchievementData.branch_target || '0') ? '+' : ''}${(parseFloat(volumeAchievementData.total_disbursement || '0') - parseFloat(volumeAchievementData.branch_target || '0')).toLocaleString()}` : '--',
        trend: volumeAchievementData ? (parseFloat(volumeAchievementData.total_disbursement || '0') >= parseFloat(volumeAchievementData.branch_target || '0') ? '↑' : '↓') : '↓',
        status: volumeAchievementData ? (getScore(volumeAchievementData, 'normalized_score', 'average_normalized_score') >= 90 ? 'good' : getScore(volumeAchievementData, 'normalized_score', 'average_normalized_score') >= 70 ? 'warning' : 'critical') : 'warning'
      },
      {
        name: 'Portfolio quality',
        institutionalAvg: '--',
        currentPeriod: portfolioQualityData ? `${getScore(portfolioQualityData, 'PAR', 'average_score').toFixed(2)}` : '--',
        target: '≤5%',
        variance: portfolioQualityData ? `${(getScore(portfolioQualityData, 'PAR', 'average_score') - 5).toFixed(2)}` : '--',
        trend: portfolioQualityData ? (getScore(portfolioQualityData, 'PAR', 'average_score') <= 5 ? '↑' : '↓') : '↓',
        status: portfolioQualityData ? (getScore(portfolioQualityData, 'PAR', 'average_score') <= 5 ? 'good' : getScore(portfolioQualityData, 'PAR', 'average_score') <= 10 ? 'warning' : 'critical') : 'warning'
      },
      {
        name: 'Default contribution',
        institutionalAvg: '--',
        currentPeriod: month1DefaultPerformanceData ? `${parseFloat(month1DefaultPerformanceData.month_1_default_rate || '0').toFixed(2)}` : '--',
        target: '≤15%',
        variance: month1DefaultPerformanceData ? `${(parseFloat(month1DefaultPerformanceData.month_1_default_rate || '0') - 15).toFixed(2)}` : '--',
        trend: month1DefaultPerformanceData ? (parseFloat(month1DefaultPerformanceData.month_1_default_rate || '0') <= 15 ? '↑' : '↓') : '↑',
        status: month1DefaultPerformanceData ? (parseFloat(month1DefaultPerformanceData.month_1_default_rate || '0') <= 15 ? 'good' : parseFloat(month1DefaultPerformanceData.month_1_default_rate || '0') <= 20 ? 'warning' : 'critical') : 'critical'
      },
      {
        name: 'Collections efficiency',
        institutionalAvg: '--',
        currentPeriod: collectionEfficiencyData ? `${getScore(collectionEfficiencyData, 'benchmark', 'average_score').toFixed(2)}` : '--',
        target: '≥75%',
        variance: collectionEfficiencyData ? `${(getScore(collectionEfficiencyData, 'benchmark', 'average_score') - 75).toFixed(2)}` : '--',
        trend: collectionEfficiencyData ? (getScore(collectionEfficiencyData, 'benchmark', 'average_score') >= 75 ? '↑' : '↓') : '↓',
        status: collectionEfficiencyData ? (getScore(collectionEfficiencyData, 'benchmark', 'average_score') >= 75 ? 'good' : getScore(collectionEfficiencyData, 'benchmark', 'average_score') >= 65 ? 'warning' : 'critical') : 'warning'
      },
      {
        name: 'Vetting compliance',
        institutionalAvg: '--',
        currentPeriod: productRiskScoreData ? `${getScore(productRiskScoreData, 'defaulted_rate', 'average_score').toFixed(2)}` : '--',
        target: '≤1.0',
        variance: productRiskScoreData ? `${(getScore(productRiskScoreData, 'defaulted_rate', 'average_score') - 1.0).toFixed(2)}` : '--',
        trend: productRiskScoreData ? (getScore(productRiskScoreData, 'defaulted_rate', 'average_score') <= 1.0 ? '↑' : '↓') : '↓',
        status: productRiskScoreData ? (getScore(productRiskScoreData, 'defaulted_rate', 'average_score') <= 1.0 ? 'good' : getScore(productRiskScoreData, 'defaulted_rate', 'average_score') <= 1.5 ? 'warning' : 'critical') : 'critical'
      }
    ],
    'Loan Products & Interest Rates Index': [
      {
        name: 'Product distribution mix',
        institutionalAvg: '--',
        currentPeriod: productDiversificationData ? `${getScore(productDiversificationData, 'HHI', 'average_HHI').toFixed(3)}` : '--',
        target: 'HHI < 0.3',
        variance: productDiversificationData ? `${(getScore(productDiversificationData, 'HHI', 'average_HHI') - 0.3).toFixed(3)}` : '--',
        trend: productDiversificationData ? (getScore(productDiversificationData, 'HHI', 'average_HHI') < 0.3 ? '↑' : '↓') : '↓',
        status: productDiversificationData ? (getScore(productDiversificationData, 'HHI', 'average_HHI') < 0.3 ? 'good' : getScore(productDiversificationData, 'HHI', 'average_HHI') < 0.4 ? 'warning' : 'critical') : 'warning'
      },
      {
        name: 'Revenue yield per product',
        institutionalAvg: '--',
        currentPeriod: yieldAchievementsData ? `${getScore(yieldAchievementsData, 'effective_interest_rate', 'average_score').toFixed(2)}` : '--',
        target: yieldAchievementsData ? yieldAchievementsData.target : '≥38.2%',
        variance: yieldAchievementsData ? `${(getScore(yieldAchievementsData, 'effective_interest_rate', 'average_score') - parseFloat(yieldAchievementsData.target || '0')).toFixed(2)}` : '--',
        trend: yieldAchievementsData ? (getScore(yieldAchievementsData, 'effective_interest_rate', 'average_score') >= parseFloat(yieldAchievementsData.target || '0') ? '↑' : '↓') : '↓',
        status: yieldAchievementsData ? (getScore(yieldAchievementsData, 'effective_interest_rate', 'average_score') >= parseFloat(yieldAchievementsData.target || '0') ? 'good' : getScore(yieldAchievementsData, 'effective_interest_rate', 'average_score') >= parseFloat(yieldAchievementsData.target || '0') * 0.9 ? 'warning' : 'critical') : 'warning'
      },
      {
        name: 'Product risk contribution',
        institutionalAvg: '--',
        currentPeriod: productRiskScoreData ? `${getScore(productRiskScoreData, 'defaulted_rate', 'average_score').toFixed(2)}` : '--',
        target: '≤1.0',
        variance: productRiskScoreData ? `${(getScore(productRiskScoreData, 'defaulted_rate', 'average_score') - 1.0).toFixed(2)}` : '--',
        trend: productRiskScoreData ? (getScore(productRiskScoreData, 'defaulted_rate', 'average_score') <= 1.0 ? '↑' : '↓') : '↑',
        status: productRiskScoreData ? (getScore(productRiskScoreData, 'defaulted_rate', 'average_score') <= 1.0 ? 'good' : getScore(productRiskScoreData, 'defaulted_rate', 'average_score') <= 1.5 ? 'warning' : 'critical') : 'critical'
      },
      {
        name: 'Margin alignment with strategy',
        institutionalAvg: '--',
        currentPeriod: efficiencyRatioData ? `${parseFloat(efficiencyRatioData.CIR || '0').toFixed(2)}` : '--',
        target: efficiencyRatioData ? efficiencyRatioData.target : '≤55%',
        variance: efficiencyRatioData ? `${(parseFloat(efficiencyRatioData.CIR || '0') - parseFloat(efficiencyRatioData.target || '0')).toFixed(2)}` : '--',
        trend: efficiencyRatioData ? (parseFloat(efficiencyRatioData.CIR || '0') <= parseFloat(efficiencyRatioData.target || '0') ? '↑' : '↓') : '↓',
        status: efficiencyRatioData ? (parseFloat(efficiencyRatioData.CIR || '0') <= parseFloat(efficiencyRatioData.target || '0') ? 'good' : parseFloat(efficiencyRatioData.CIR || '0') <= parseFloat(efficiencyRatioData.target || '0') * 1.1 ? 'warning' : 'critical') : 'warning'
      }
    ],
    'Risk Management & Defaults Index': [
      {
        name: 'Default rate (branch, province, institutional)',
        institutionalAvg: '--',
        currentPeriod: month1DefaultPerformanceData ? `${parseFloat(month1DefaultPerformanceData.average_score || '0').toFixed(2)}` : '--',
        target: '≤15%',
        variance: month1DefaultPerformanceData ? `${(parseFloat(month1DefaultPerformanceData.average_score || '0') - 15).toFixed(2)}` : '--',
        trend: month1DefaultPerformanceData ? (parseFloat(month1DefaultPerformanceData.average_score || '0') <= 15 ? '↑' : '↓') : '↑',
        status: month1DefaultPerformanceData ? (parseFloat(month1DefaultPerformanceData.average_score || '0') <= 15 ? 'good' : parseFloat(month1DefaultPerformanceData.average_score || '0') <= 20 ? 'warning' : 'critical') : 'critical'
      },
      {
        name: 'Default aging analysis',
        institutionalAvg: '--',
        currentPeriod: longTermDelinquencyData ? `${parseFloat(longTermDelinquencyData.average_score || '0').toFixed(2)}` : '--',
        target: longTermDelinquencyData ? longTermDelinquencyData.target : '≤43.95%',
        variance: longTermDelinquencyData ? `${(parseFloat(longTermDelinquencyData.average_score || '0') - parseFloat(longTermDelinquencyData.target || '0')).toFixed(2)}%` : '--',
        trend: longTermDelinquencyData ? (parseFloat(longTermDelinquencyData.average_score || '0') <= parseFloat(longTermDelinquencyData.target || '0') ? '↑' : '↓') : '↑',
        status: longTermDelinquencyData ? (parseFloat(longTermDelinquencyData.average_score || '0') <= parseFloat(longTermDelinquencyData.target || '0') ? 'good' : parseFloat(longTermDelinquencyData.average_score || '0') <= parseFloat(longTermDelinquencyData.target || '0') * 1.1 ? 'warning' : 'critical') : 'critical'
      },
      {
        name: 'Recovery rate within 3 months',
        institutionalAvg: '--',
        currentPeriod: month3RecoveryAchievementsData ? `${parseFloat(month3RecoveryAchievementsData.average_score || '0').toFixed(2)}` : '--',
        target: '≥100%',
        variance: month3RecoveryAchievementsData ? `${(parseFloat(month3RecoveryAchievementsData.average_score || '0') - 100).toFixed(2)}` : '--',
        trend: month3RecoveryAchievementsData ? (parseFloat(month3RecoveryAchievementsData.average_score || '0') >= 100 ? '↑' : '↓') : '↓',
        status: month3RecoveryAchievementsData ? (parseFloat(month3RecoveryAchievementsData.average_score || '0') >= 100 ? 'good' : parseFloat(month3RecoveryAchievementsData.average_score || '0') >= 90 ? 'warning' : 'critical') : 'critical'
      },
      {
        name: 'Risk migration trends',
        institutionalAvg: '--',
        currentPeriod: rollRateControlData ? `${parseFloat(rollRateControlData.average_score || '0').toFixed(2)}` : '--',
        target: '≤20%',
        variance: rollRateControlData ? `${(parseFloat(rollRateControlData.average_score || '0') - 20).toFixed(2)}` : '--',
        trend: rollRateControlData ? (parseFloat(rollRateControlData.average_score || '0') <= 20 ? '↑' : '↓') : '↑',
        status: rollRateControlData ? (parseFloat(rollRateControlData.average_score || '0') <= 20 ? 'good' : parseFloat(rollRateControlData.average_score || '0') <= 30 ? 'warning' : 'critical') : 'warning'
      }
    ],
    'Revenue & Performance Metrics Index': [
      {
        name: 'Efficiency Ratio (CIR)',
        institutionalAvg: '--',
        currentPeriod: efficiencyRatioData ? `${parseFloat(efficiencyRatioData.average_score || '0').toFixed(2)}` : '--',
        target: efficiencyRatioData ? efficiencyRatioData.target : '≤55%',
        variance: efficiencyRatioData ? `${(parseFloat(efficiencyRatioData.average_score || '0') - parseFloat(efficiencyRatioData.target || '0')).toFixed(2)}` : '--',
        trend: efficiencyRatioData ? (parseFloat(efficiencyRatioData.average_score || '0') <= parseFloat(efficiencyRatioData.target || '0') ? '↑' : '↓') : '↑',
        status: efficiencyRatioData ? (parseFloat(efficiencyRatioData.average_score || '0') <= parseFloat(efficiencyRatioData.target || '0') ? 'good' : parseFloat(efficiencyRatioData.average_score || '0') <= parseFloat(efficiencyRatioData.target || '0') * 1.1 ? 'warning' : 'critical') : 'critical'
      },
      {
        name: 'Growth trajectory alignment',
        institutionalAvg: '--',
        currentPeriod: growthTrajectoryData ? `${parseFloat(growthTrajectoryData.average_score || '0').toFixed(2)}` : '--',
        target: '≥2.5%',
        variance: growthTrajectoryData ? `${(parseFloat(growthTrajectoryData.average_score || '0') * 100 - 2.5).toFixed(2)}` : '--',
        trend: growthTrajectoryData ? (growthTrajectoryData.average_score >= 0.025 ? '↑' : '↓') : '↓',
        status: growthTrajectoryData ? (growthTrajectoryData.average_score >= 0.025 ? 'good' : growthTrajectoryData.average_score >= 0 ? 'warning' : 'critical') : 'warning'
      },
      {
        name: 'Revenue achievement',
        institutionalAvg: '--',
        currentPeriod: revenueAchievementsData ? `${parseFloat(revenueAchievementsData.average_score || '0').toFixed(2)}` : '--',
        target: revenueAchievementsData?.target ? revenueAchievementsData.target : '≥100%',
        variance: revenueAchievementsData ? `${(parseFloat(revenueAchievementsData.average_score || '0') - parseFloat(revenueAchievementsData.target || '0')).toFixed(2)}%` : '--',
        trend: revenueAchievementsData ? (parseFloat(revenueAchievementsData.average_score || '0') >= parseFloat(revenueAchievementsData.target || '0') ? '↑' : '↓') : '↓',
        status: revenueAchievementsData ? (parseFloat(revenueAchievementsData.average_score || '0') >= 90 ? 'good' : parseFloat(revenueAchievementsData.average_score || '0') >= 70 ? 'warning' : 'critical') : 'warning'
      },
      {
        name: 'Profitability contribution',
        institutionalAvg: '--',
        currentPeriod: profitabilityContributionData ? `${parseFloat(profitabilityContributionData.average_score?.replace('%', '') || '0').toFixed(2)}%` : '--',
        target: profitabilityContributionData && profitabilityContributionData.target ? `≥ ${profitabilityContributionData.target}` : '≥ institutional avg',
        variance: profitabilityContributionData ? `${(parseFloat(profitabilityContributionData.average_score?.replace('%', '') || '0') - parseFloat(profitabilityContributionData.target || '0')).toFixed(2)}%` : '--',
        trend: profitabilityContributionData ? (parseFloat(profitabilityContributionData.average_score?.replace('%', '') || '0') >= parseFloat(profitabilityContributionData.target || '0') ? '↑' : '↓') : '↓',
        status: profitabilityContributionData ? (parseFloat(profitabilityContributionData.average_score?.replace('%', '') || '0') >= 90 ? 'good' : parseFloat(profitabilityContributionData.average_score?.replace('%', '') || '0') >= 70 ? 'warning' : 'critical') : 'warning'
      }
    ],
    'Cash & Liquidity Management Index': [
      {
        name: 'Cash Position Score',
        institutionalAvg: cashPositionData ? '--' : '--',
        currentPeriod: cashPositionData ? `${(parseFloat(cashPositionData.score || cashPositionData.average_score || '0')).toFixed(2)}` : '--',
        target: 'K20,000 to K30,000',
        variance: cashPositionData ? `${(parseFloat(cashPositionData.score || cashPositionData.average_score || '0') - 100).toFixed(2)}%` : '--',
        trend: cashPositionData ? (parseFloat(cashPositionData.score || cashPositionData.average_score || '0') >= 90 ? '↑' : '↓') : '→',
        status: cashPositionData ? (parseFloat(cashPositionData.score || cashPositionData.average_score || '0') >= 90 ? 'good' : parseFloat(cashPositionData.score || cashPositionData.average_score || '0') >= 70 ? 'warning' : 'critical') : 'warning'
      },
      {
        name: 'Above-Threshold Risk',
        institutionalAvg: aboveThresholdRiskData ? '--' : '--',
        currentPeriod: aboveThresholdRiskData ? `${(parseFloat(aboveThresholdRiskData.score || aboveThresholdRiskData.average_score || '0')).toFixed(2)}` : '--',
        target: '0',
        variance: aboveThresholdRiskData ? `${(parseFloat(aboveThresholdRiskData.score || aboveThresholdRiskData.average_score || '0') - 100).toFixed(2)}%` : '--',
        trend: aboveThresholdRiskData ? (parseFloat(aboveThresholdRiskData.score || aboveThresholdRiskData.average_score || '0') >= 90 ? '↑' : '↓') : '→',
        status: aboveThresholdRiskData ? (parseFloat(aboveThresholdRiskData.score || aboveThresholdRiskData.average_score || '0') >= 90 ? 'good' : parseFloat(aboveThresholdRiskData.score || aboveThresholdRiskData.average_score || '0') >= 70 ? 'warning' : 'critical') : 'warning'
      },
      {
        name: 'Below-Threshold Risk',
        institutionalAvg: belowThresholdRiskData ? '--' : '--',
        currentPeriod: belowThresholdRiskData ? `${(parseFloat(belowThresholdRiskData.score || belowThresholdRiskData.average_score || '0')).toFixed(2)}` : '--',
        target: '0',
        variance: belowThresholdRiskData ? `${(parseFloat(belowThresholdRiskData.score || belowThresholdRiskData.average_score || '0') - 100).toFixed(2)}%` : '--',
        trend: belowThresholdRiskData ? (parseFloat(belowThresholdRiskData.score || belowThresholdRiskData.average_score || '0') >= 90 ? '↑' : '↓') : '→',
        status: belowThresholdRiskData ? (parseFloat(belowThresholdRiskData.score || belowThresholdRiskData.average_score || '0') >= 90 ? 'good' : parseFloat(belowThresholdRiskData.score || belowThresholdRiskData.average_score || '0') >= 70 ? 'warning' : 'critical') : 'warning'
      },
      {
        name: 'Approved Exception Ratio',
        institutionalAvg: approvedExceptionRatioData ? '0' : '0',
        currentPeriod: approvedExceptionRatioData ? `${getScore(approvedExceptionRatioData, 'normalized_score', 'average_score').toFixed(2)}` : '0',
        target: '100% approved',
        variance: approvedExceptionRatioData ? `${(getScore(approvedExceptionRatioData, 'normalized_score', 'average_score') - 100).toFixed(2)}%` : '0',
        trend: approvedExceptionRatioData ? (getScore(approvedExceptionRatioData, 'normalized_score', 'average_score') >= 90 ? '↑' : '↓') : '→',
        status: approvedExceptionRatioData ? (getScore(approvedExceptionRatioData, 'normalized_score', 'average_score') >= 90 ? 'good' : getScore(approvedExceptionRatioData, 'normalized_score', 'average_score') >= 70 ? 'warning' : 'critical') : 'warning'
      }
    ]
  };
  
  // Log variance values for all KPIs for debugging
  Object.entries(kpis).forEach(([paramName, paramKpis]) => {
    paramKpis.forEach((kpi, idx) => {
      console.log(`[${paramName}] ${kpi.name}: variance=${kpi.variance}, target=${kpi.target}, currentPeriod=${kpi.currentPeriod}`);
    });
  });
  
  return kpis[paramName] || [];
}

export function InstitutionalHealthSummary({
  userLevel,
  userLevelLabel,
  userProvinceId,
  parameters,
  keyMetrics,
  recentActivities = [],
  overallScore,
  overallInstAvg,
  overallTarget,
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
  isLoading = false
}: InstitutionalHealthSummaryProps) {
  const [expandedParam, setExpandedParam] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'composite' | 'metrics'>('metrics');
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const [drillLevel, setDrillLevel] = useState<'province' | 'branch' | 'consultant' | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const levelLabel = {
    institution: 'Institutional',
    province: 'Provincial',
    district: 'District',
    branch: 'Branch',
    consultant: 'Personal'
  }[userLevel];

  return (
    <div className="space-y-4">
      <ApiLoader isLoading={isLoading} text="Loading institutional health data..." />
      {/* Overall Health Banner */}
      {overallScore !== undefined && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-400 text-sm uppercase tracking-wider">Institutional Health Dashboard</p>
              <p className="text-white font-semibold mt-0.5">{userLevelLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-white">{overallScore}%</p>
              <p className="text-gray-400 text-xs">Overall Health Score</p>
            </div>
          </div>
          {overallInstAvg !== undefined && overallTarget !== undefined && (
            <div className="grid grid-cols-3 gap-4 text-center mt-3 pt-3 border-t border-gray-700">
              <div>
                <p className="text-gray-400 text-xs">Current Average</p>
                <p className="text-white font-bold">{overallScore}%</p>
                {/* Indicator for comparison with Institutional Avg */}
                <div className={`inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                  overallScore >= overallInstAvg 
                    ? 'bg-green-900/50 text-green-300' 
                    : 'bg-red-900/50 text-red-300'
                }`}>
                  <span className="mr-1">{overallScore >= overallInstAvg ? '▲' : '▼'}</span>
                  <span>
                    {overallScore >= overallInstAvg 
                      ? `+${overallScore - overallInstAvg}%` 
                      : `${overallScore - overallInstAvg}%`}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Institutional Operating Average</p>
                <p className={`font-bold ${overallScore >= overallInstAvg ? 'text-green-400' : 'text-red-400'}`}>{overallInstAvg}%</p>
                {/* Show variance */}
                <p className="text-xs text-gray-500 mt-1">
                  {overallScore >= overallInstAvg 
                    ? `+${overallScore - overallInstAvg}% above` 
                    : `${overallScore - overallInstAvg}% below`}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Target</p>
                <p className="text-gray-300 font-bold">{overallTarget}%</p>
                {/* Indicator for comparison with Target */}
                <div className={`inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                  overallScore >= overallTarget 
                    ? 'bg-green-900/50 text-green-300' 
                    : 'bg-yellow-900/50 text-yellow-300'
                }`}>
                  <span className="mr-1">{overallScore >= overallTarget ? '▲' : '▼'}</span>
                  <span>
                    {overallScore >= overallTarget 
                      ? `+${overallScore - overallTarget}%` 
                      : `${overallScore - overallTarget}%`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      


      {/* Five Headline Parameters View */}
      {(
        <>
          {/* View Toggle */}
          <div className="flex items-center justify-end mb-4">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                📋 Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                🗂️ Cards
              </button>
            </div>
          </div>

          {viewMode === 'table' ? (
            <ParametersTableView
              parameters={parameters}
              userLevel={userLevel}
              userLevelLabel={userLevelLabel}
              expandedParam={expandedParam}
              onToggleExpand={(paramName) => setExpandedParam(expandedParam === paramName ? null : paramName)}
              getParameterKPIs={getParameterKPIs}
              getVarianceColor={getVarianceColor}
              getTrendBadge={getTrendBadge}
              getStatusBadge={getStatusBadge}
              staffAdequacyData={staffAdequacyData}
              productivityAchievementData={productivityAchievementData}
              vacancyImpactData={vacancyImpactData}
              volumeAchievementData={volumeAchievementData}
              loanPortfolioLoadData={loanPortfolioLoadData}
              collectionEfficiencyData={collectionEfficiencyData}
              efficiencyRatioData={efficiencyRatioData}
              growthTrajectoryData={growthTrajectoryData}
              longTermDelinquencyData={longTermDelinquencyData}
              month1DefaultPerformanceData={month1DefaultPerformanceData}
              month3RecoveryAchievementsData={month3RecoveryAchievementsData}
              portfolioQualityData={portfolioQualityData}
              productDiversificationData={productDiversificationData}
              productRiskScoreData={productRiskScoreData}
              rollRateControlData={rollRateControlData}
              yieldAchievementsData={yieldAchievementsData}
              revenueAchievementsData={revenueAchievementsData}
              profitabilityContributionData={profitabilityContributionData}
              cashPositionData={cashPositionData}
              aboveThresholdRiskData={aboveThresholdRiskData}
              belowThresholdRiskData={belowThresholdRiskData}
              approvedExceptionRatioData={approvedExceptionRatioData}
              onKpiClick={(kpiName) => {
                if (userLevel === 'institution') {
                  setSelectedKPI(kpiName);
                  setDrillLevel('province');
                  setSelectedProvince(null);
                  setSelectedBranch(null);
                } else if (userLevel === 'province') {
                  setSelectedKPI(kpiName);
                  setDrillLevel('branch');
                  setSelectedProvince(null);
                  setSelectedBranch(null);
                }
              }}
            />
          ) : (
            <ParametersCardsView
              parameters={parameters}
              userLevel={userLevel}
              userLevelLabel={userLevelLabel}
              expandedParam={expandedParam}
              onToggleExpand={(paramName) => setExpandedParam(expandedParam === paramName ? null : paramName)}
              getParameterKPIs={getParameterKPIs}
              getVarianceColor={getVarianceColor}
              getTrendBadge={getTrendBadge}
              getStatusBadge={getStatusBadge}
              staffAdequacyData={staffAdequacyData}
              productivityAchievementData={productivityAchievementData}
              vacancyImpactData={vacancyImpactData}
              volumeAchievementData={volumeAchievementData}
              loanPortfolioLoadData={loanPortfolioLoadData}
              collectionEfficiencyData={collectionEfficiencyData}
              efficiencyRatioData={efficiencyRatioData}
              growthTrajectoryData={growthTrajectoryData}
              longTermDelinquencyData={longTermDelinquencyData}
              month1DefaultPerformanceData={month1DefaultPerformanceData}
              month3RecoveryAchievementsData={month3RecoveryAchievementsData}
              portfolioQualityData={portfolioQualityData}
              productDiversificationData={productDiversificationData}
              productRiskScoreData={productRiskScoreData}
              rollRateControlData={rollRateControlData}
              yieldAchievementsData={yieldAchievementsData}
              revenueAchievementsData={revenueAchievementsData}
              profitabilityContributionData={profitabilityContributionData}
              cashPositionData={cashPositionData}
              aboveThresholdRiskData={aboveThresholdRiskData}
              belowThresholdRiskData={belowThresholdRiskData}
              approvedExceptionRatioData={approvedExceptionRatioData}
              onKpiClick={(kpiName) => {
                if (userLevel === 'institution') {
                  setSelectedKPI(kpiName);
                  setDrillLevel('province');
                  setSelectedProvince(null);
                  setSelectedBranch(null);
                } else if (userLevel === 'province') {
                  setSelectedKPI(kpiName);
                  setDrillLevel('branch');
                  setSelectedProvince(null);
                  setSelectedBranch(null);
                }
              }}
            />
          )}

          <HealthAnalysisSections
                                userLevel={userLevel}
                                parameters={parameters}
                                keyMetrics={keyMetrics}
                                recentActivities={recentActivities}
                                overallScore={overallScore}
                                overallInstAvg={overallInstAvg}
                                overallTarget={overallTarget}
                                staffAdequacyData={staffAdequacyData}
                                productivityAchievementData={productivityAchievementData}
                                vacancyImpactData={vacancyImpactData}
                                volumeAchievementData={volumeAchievementData}
                                loanPortfolioLoadData={loanPortfolioLoadData}
                                collectionEfficiencyData={collectionEfficiencyData}
                                efficiencyRatioData={efficiencyRatioData}
                                growthTrajectoryData={growthTrajectoryData}
                                longTermDelinquencyData={longTermDelinquencyData}
                                month1DefaultPerformanceData={month1DefaultPerformanceData}
                                month3RecoveryAchievementsData={month3RecoveryAchievementsData}
                                portfolioQualityData={portfolioQualityData}
                                productDiversificationData={productDiversificationData}
                                productRiskScoreData={productRiskScoreData}
                                rollRateControlData={rollRateControlData}
                                yieldAchievementsData={yieldAchievementsData}
                                revenueAchievementsData={revenueAchievementsData}
                                profitabilityContributionData={profitabilityContributionData}
                                cashPositionData={cashPositionData}
                                aboveThresholdRiskData={aboveThresholdRiskData}
                                belowThresholdRiskData={belowThresholdRiskData}
                                approvedExceptionRatioData={approvedExceptionRatioData}
                              />
        </>
      )}
      {/* KPI Drill-down Modal */}
      {selectedKPI && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedKPI}</h2>
              <button 
                onClick={() => {
                  setSelectedKPI(null);
                  setDrillLevel(null);
                  setSelectedProvince(null);
                  setSelectedBranch(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* Province Level View - Only show for institution level */}
              {drillLevel === 'province' && userLevel === 'institution' && (
                <ProvinceLevelView 
                  selectedKPI={selectedKPI}
                  onProvinceClick={(provinceId) => {
                    setSelectedProvince(provinceId);
                    setDrillLevel('branch');
                  }}
                />
              )}

              {/* Branch Level View - Show for province level (direct) or institution level (after province) */}
              {(drillLevel === 'branch' || (drillLevel === 'province' && userLevel === 'province')) && selectedKPI && (
                <BranchLevelView 
                  selectedKPI={selectedKPI}
                  selectedProvince={userLevel === 'province' ? (userProvinceId || 1) : selectedProvince!}
                  onBranchClick={(branchId: number) => {
                    setSelectedBranch(branchId);
                    setDrillLevel('consultant');
                  }}
                  onBack={() => {
                    if (userLevel === 'province') {
                      // For provincial managers, back goes to closing the modal
                      setSelectedKPI(null);
                      setDrillLevel(null);
                    } else {
                      setSelectedProvince(null);
                      setDrillLevel('province');
                    }
                  }}
                />
              )}

              {/* Consultant Level View */}
              {drillLevel === 'consultant' && selectedBranch && (
                <div>
                  <div className="flex items-center mb-4">
                    <button 
                      onClick={() => setDrillLevel('branch')}
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Branches
                    </button>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loan Consultants in Branch {selectedBranch}</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Loan Consultant</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Inst. Avg</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Individual Avg</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {Array.from({ length: 8 }, (_, i) => ({
                          id: i + 1,
                          name: `Consultant ${i + 1}`,
                          institutionalAvg: '12 loans/month',
                          currentPeriod: (10 + Math.random() * 5).toFixed(1) + ' loans/month',
                          target: '≥15 loans/month',
                          variance: `-${(5 - Math.random() * 3).toFixed(1)} loans/month`,
                          trend: ['↑', '↓', '→'][Math.floor(Math.random() * 3)] as '↑' | '↓' | '→',
                          status: ['good', 'warning', 'critical'][Math.floor(Math.random() * 3)] as 'good' | 'warning' | 'critical'
                        }))
                        .sort((a, b) => parseFloat(b.currentPeriod) - parseFloat(a.currentPeriod))
                        .map((consultant, index) => (
                          <tr key={consultant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{consultant.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{consultant.institutionalAvg}</td>
                            <td className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">{consultant.currentPeriod}</td>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{consultant.target}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`${getVarianceColor(consultant.variance)}`}>{consultant.variance}</span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={getTrendBadge(consultant.trend)}>{consultant.trend}</span>
                            </td>
                            <td className="px-4 py-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusBadge(consultant.status)}`}>
                                {consultant.status === 'good' ? 'GOOD' : consultant.status === 'warning' ? 'WARNING' : 'CRITICAL'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



