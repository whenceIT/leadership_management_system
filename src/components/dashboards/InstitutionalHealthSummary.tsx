'use client';

import React, { useState } from 'react';

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
  staffAdequacyData?: any, productivityAchievementData?: any, vacancyImpactData?: any, loanPortfolioLoadData?: any): InstitutionalSummaryData {
  // Calculate aggregated Branch Structure & Staffing Index values
  const branchStructureAggregated = aggregateBranchStructureKPIs(staffAdequacyData, productivityAchievementData, vacancyImpactData, loanPortfolioLoadData);

  // Base data that can be adjusted based on user level
  const baseParameters: ParameterSummary[] = [
    {
      name: 'Branch Structure & Staffing Index',
      shortName: 'Staffing & Structure',
      institutionalAvg: branchStructureAggregated.institutionalAvg || '92%',
      userLevelAvg: branchStructureAggregated.userLevelAvg || (userLevel === 'branch' ? '88%' : userLevel === 'district' ? '90%' : userLevel === 'province' ? '91%' : '92%'),
      target: branchStructureAggregated.target || '≥95%',
      variance: branchStructureAggregated.variance || (userLevel === 'branch' ? '-7%' : userLevel === 'district' ? '-5%' : userLevel === 'province' ? '-4%' : '0%'),
      varianceAbs: branchStructureAggregated.varianceAbs || (userLevel === 'branch' ? '7pp' : userLevel === 'district' ? '5pp' : userLevel === 'province' ? '4pp' : '0pp'),
      trend: branchStructureAggregated.trend || (userLevel === 'branch' ? '↓' : userLevel === 'district' ? '→' : userLevel === 'province' ? '↑' : '→'),
      status: branchStructureAggregated.status || (userLevel === 'branch' ? 'warning' : userLevel === 'district' ? 'warning' : userLevel === 'province' ? 'good' : 'good')
    },
    {
      name: 'Loan Consultant Performance Index',
      shortName: 'LC Performance',
      institutionalAvg: '85%',
      userLevelAvg: userLevel === 'branch' ? '82%' : userLevel === 'district' ? '84%' : userLevel === 'province' ? '86%' : '85%',
      target: '≥90%',
      variance: userLevel === 'branch' ? '-8%' : userLevel === 'district' ? '-6%' : userLevel === 'province' ? '+1%' : '0%',
      varianceAbs: userLevel === 'branch' ? '8pp' : userLevel === 'district' ? '6pp' : userLevel === 'province' ? '1pp' : '0pp',
      trend: userLevel === 'branch' ? '↓' : userLevel === 'district' ? '→' : userLevel === 'province' ? '↑' : '→',
      status: userLevel === 'branch' ? 'warning' : userLevel === 'district' ? 'warning' : userLevel === 'province' ? 'good' : 'good'
    },
    {
      name: 'Loan Products & Interest Rates Index',
      shortName: 'Products & Rates',
      institutionalAvg: '88%',
      userLevelAvg: userLevel === 'branch' ? '86%' : userLevel === 'district' ? '87%' : userLevel === 'province' ? '89%' : '88%',
      target: '≥92%',
      variance: userLevel === 'branch' ? '-6%' : userLevel === 'district' ? '-5%' : userLevel === 'province' ? '-3%' : '0%',
      varianceAbs: userLevel === 'branch' ? '6pp' : userLevel === 'district' ? '5pp' : userLevel === 'province' ? '3pp' : '0pp',
      trend: userLevel === 'branch' ? '→' : userLevel === 'district' ? '→' : userLevel === 'province' ? '→' : '→',
      status: userLevel === 'branch' ? 'warning' : userLevel === 'district' ? 'warning' : userLevel === 'province' ? 'warning' : 'good'
    },
    {
      name: 'Risk Management & Defaults Index',
      shortName: 'Risk & Defaults',
      institutionalAvg: '75%',
      userLevelAvg: userLevel === 'branch' ? '72%' : userLevel === 'district' ? '74%' : userLevel === 'province' ? '76%' : '75%',
      target: '≥80%',
      variance: userLevel === 'branch' ? '-8%' : userLevel === 'district' ? '-6%' : userLevel === 'province' ? '-4%' : '0%',
      varianceAbs: userLevel === 'branch' ? '8pp' : userLevel === 'district' ? '6pp' : userLevel === 'province' ? '4pp' : '0pp',
      trend: userLevel === 'branch' ? '↓' : userLevel === 'district' ? '↓' : userLevel === 'province' ? '→' : '→',
      status: userLevel === 'branch' ? 'critical' : userLevel === 'district' ? 'warning' : userLevel === 'province' ? 'warning' : 'warning'
    },
    {
      name: 'Revenue & Performance Metrics Index',
      shortName: 'Revenue & Performance',
      institutionalAvg: '80%',
      userLevelAvg: userLevel === 'branch' ? '78%' : userLevel === 'district' ? '82%' : userLevel === 'province' ? '85%' : '80%',
      target: '≥85%',
      variance: userLevel === 'branch' ? '-7%' : userLevel === 'district' ? '-3%' : userLevel === 'province' ? '+0%' : '0%',
      varianceAbs: userLevel === 'branch' ? '7pp' : userLevel === 'district' ? '3pp' : userLevel === 'province' ? '0pp' : '0pp',
      trend: userLevel === 'branch' ? '→' : userLevel === 'district' ? '↑' : userLevel === 'province' ? '→' : '→',
      status: userLevel === 'branch' ? 'warning' : userLevel === 'district' ? 'warning' : userLevel === 'province' ? 'good' : 'good'
    }
  ];

  const baseKeyMetrics: KeyMetric[] = [
    {
      parameter: 'Staff Adequacy Score',
      institutionalAvg: '92%',
      currentPeriod: userLevel === 'branch' ? '88%' : userLevel === 'district' ? '90%' : userLevel === 'province' ? '91%' : '92%',
      target: '100%',
      variance: userLevel === 'branch' ? '-12%' : userLevel === 'district' ? '-10%' : userLevel === 'province' ? '-9%' : '0%',
      trend: userLevel === 'branch' ? '↓' : userLevel === 'district' ? '→' : userLevel === 'province' ? '↑' : '→',
      provAvg: '90%',
      contribution: userLevel === 'branch' ? '22/25pp ▼' : userLevel === 'district' ? '23/25pp →' : userLevel === 'province' ? '24/25pp ↑' : '25/25pp →'
    },
    {
      parameter: 'Productivity Achievement',
      institutionalAvg: '95%',
      currentPeriod: userLevel === 'branch' ? '87%' : userLevel === 'district' ? '92%' : userLevel === 'province' ? '94%' : '95%',
      target: '≥100%',
      variance: userLevel === 'branch' ? '-8%' : userLevel === 'district' ? '-3%' : userLevel === 'province' ? '-1%' : '0%',
      trend: userLevel === 'branch' ? '↓' : userLevel === 'district' ? '↑' : userLevel === 'province' ? '→' : '→',
      provAvg: '93%',
      contribution: '21/25pp ▼'
    },
    {
      parameter: 'Month-1 Default Rate',
      institutionalAvg: '27%',
      currentPeriod: userLevel === 'branch' ? '30%' : userLevel === 'district' ? '28%' : userLevel === 'province' ? '26%' : '27%',
      target: '≤25%',
      variance: userLevel === 'branch' ? '+5%' : userLevel === 'district' ? '+3%' : userLevel === 'province' ? '+1%' : '0%',
      trend: userLevel === 'branch' ? '↑' : userLevel === 'district' ? '→' : userLevel === 'province' ? '↓' : '→',
      provAvg: '26%',
      contribution: '18/40pp ▼'
    },
    {
      parameter: '3-Month Recovery Rate',
      institutionalAvg: '60%',
      currentPeriod: userLevel === 'branch' ? '51%' : userLevel === 'district' ? '56%' : userLevel === 'province' ? '59%' : '60%',
      target: '≥60%',
      variance: userLevel === 'branch' ? '-9%' : userLevel === 'district' ? '-4%' : userLevel === 'province' ? '-1%' : '0%',
      trend: userLevel === 'branch' ? '↓' : userLevel === 'district' ? '→' : userLevel === 'province' ? '↑' : '→',
      provAvg: '58%',
      contribution: '12.9/30pp ▼'
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

  const overallScore = userLevel === 'branch' ? 65 : userLevel === 'district' ? 72 : userLevel === 'province' ? 78 : 82;

  return {
    parameters: baseParameters,
    keyMetrics: baseKeyMetrics,
    recentActivities: baseRecentActivities,
    overallScore,
    overallInstAvg: 82,
    overallTarget: 90
  };
}

interface InstitutionalHealthSummaryProps {
  userLevel: 'institution' | 'province' | 'district' | 'branch' | 'consultant';
  userLevelLabel: string;
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
    const target = 95;
    const variance = overallScore - target;
    const varianceStr = variance >= 0 ? `+${variance}%` : `${variance}%`;
    const varianceAbs = `${Math.abs(variance)}pp`;
    
    const trend = overallScore >= target ? '↑' : '↓';
    const status: 'good' | 'warning' | 'critical' = overallScore >= 90 ? 'good' : overallScore >= 70 ? 'warning' : 'critical';

    return {
      institutionalAvg: '--',
      userLevelAvg: `${overallScore}%`,
      target: '≥95%',
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

  if (kpis.length === 0) {
    return {
      institutionalAvg: '--',
      userLevelAvg: '--',
      target: '--',
      variance: '--',
      varianceAbs: '--',
      trend: '→',
      status: 'warning'
    };
  }

  const weightedScore = kpis.reduce((sum, kpi) => sum + (kpi.getScore(kpi.data) * kpi.weight), 0);
  const overallScore = Math.round(weightedScore);
  
  const target = 95;
  const variance = overallScore - target;
  const varianceStr = variance >= 0 ? `+${variance}%` : `${variance}%`;
  const varianceAbs = `${Math.abs(variance)}pp`;
  
  const trend = overallScore >= target ? '↑' : '↓';
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
    target: '≥95%',
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
  yieldAchievementsData?: any): KPI[] {
  // Helper function to get score from data (handles both branch and provincial formats)
  const getScore = (data: any, field1: string, field2?: string): number => {
    const value = data?.[field1] || data?.[field2];
    return typeof value === 'string' ? parseFloat(value) : (typeof value === 'number' ? value : 0);
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
        variance: productivityAchievementData ? `${(getScore(productivityAchievementData, 'normalized_score', 'average_normalized_score') - productivityAchievementData.target).toFixed(2)}%` : '--',
        trend: productivityAchievementData ? (getScore(productivityAchievementData, 'normalized_score', 'average_normalized_score') >= productivityAchievementData.target ? '↑' : '↓') : '↓',
        status: productivityAchievementData ? (getScore(productivityAchievementData, 'normalized_score', 'average_normalized_score') >= 90 ? 'good' : getScore(productivityAchievementData, 'normalized_score', 'average_normalized_score') >= 70 ? 'warning' : 'critical') : 'warning'
      },
      {
        name: 'Vacancy Impact',
        institutionalAvg: vacancyImpactData ? '--' : '--',
        currentPeriod: vacancyImpactData ? `${(getScore(vacancyImpactData, 'normalized_score', 'average_normalized_score') * 100).toFixed(2)}` : '--',
        target: vacancyImpactData ? 0 : 0,
        variance: vacancyImpactData ? `${((getScore(vacancyImpactData, 'normalized_score', 'average_normalized_score') * 100) - vacancyImpactData.target).toFixed(2)}` : '--',
        trend: vacancyImpactData ? ((getScore(vacancyImpactData, 'normalized_score', 'average_normalized_score') * 100) >= vacancyImpactData.target ? '↑' : '↓') : '↑',
        status: vacancyImpactData ? ((getScore(vacancyImpactData, 'normalized_score', 'average_normalized_score') * 100) >= 90 ? 'good' : (getScore(vacancyImpactData, 'normalized_score', 'average_normalized_score') * 100) >= 70 ? 'warning' : 'critical') : 'warning'
      },
      {
        name: 'Portfolio Load Balance',
        institutionalAvg: loanPortfolioLoadData ? '--' : '--',
        currentPeriod: loanPortfolioLoadData ? `${getScore(loanPortfolioLoadData, 'score', 'average_score').toFixed(2)}` : '--',
        target: 100,
        variance: loanPortfolioLoadData ? `${(getScore(loanPortfolioLoadData, 'score', 'average_score') - loanPortfolioLoadData.target).toFixed(2)}%` : '--',
        trend: loanPortfolioLoadData ? (getScore(loanPortfolioLoadData, 'score', 'average_score') >= loanPortfolioLoadData.target ? '↑' : '↓') : '↓',
        status: loanPortfolioLoadData ? (getScore(loanPortfolioLoadData, 'score', 'average_score') >= 90 ? 'good' : getScore(loanPortfolioLoadData, 'score', 'average_score') >= 70 ? 'warning' : 'critical') : 'warning'
      }
    ],
    'Loan Consultant Performance Index': [
      {
        name: 'Volume Achievement',
        institutionalAvg: volumeAchievementData ? '--' : '--',
        currentPeriod: volumeAchievementData ? `${getScore(volumeAchievementData, 'normalized_score', 'average_normalized_score').toFixed(2)}` : '--',
        target: volumeAchievementData ? `≥${parseFloat(volumeAchievementData.branch_target || '0').toLocaleString()}` : '≥420000',
        variance: volumeAchievementData ? `${parseFloat(volumeAchievementData.total_disbursement || '0') >= parseFloat(volumeAchievementData.branch_target || '0') ? '+' : ''}${(parseFloat(volumeAchievementData.total_disbursement || '0') - parseFloat(volumeAchievementData.branch_target || '0')).toLocaleString()}` : '--',
        trend: volumeAchievementData ? (parseFloat(volumeAchievementData.total_disbursement || '0') >= parseFloat(volumeAchievementData.branch_target || '0') ? '↑' : '↓') : '↓',
        status: volumeAchievementData ? (getScore(volumeAchievementData, 'normalized_score', 'average_normalized_score') >= 90 ? 'good' : getScore(volumeAchievementData, 'normalized_score', 'average_normalized_score') >= 70 ? 'warning' : 'critical') : 'warning'
      },
      {
        name: 'Loan disbursement volume',
        institutionalAvg: '--',
        currentPeriod: volumeAchievementData ? `${parseFloat(volumeAchievementData.total_disbursement || '0').toLocaleString()}` : '--',
        target: volumeAchievementData ? `≥${parseFloat(volumeAchievementData.branch_target || '0').toLocaleString()}` : '≥420000',
        variance: volumeAchievementData ? `${parseFloat(volumeAchievementData.total_disbursement || '0') >= parseFloat(volumeAchievementData.branch_target || '0') ? '+' : ''}${(parseFloat(volumeAchievementData.total_disbursement || '0') - parseFloat(volumeAchievementData.branch_target || '0')).toLocaleString()}` : '--',
        trend: volumeAchievementData ? (parseFloat(volumeAchievementData.total_disbursement || '0') >= parseFloat(volumeAchievementData.branch_target || '0') ? '↑' : '↓') : '↓',
        status: volumeAchievementData ? (parseFloat(volumeAchievementData.total_disbursement || '0') >= parseFloat(volumeAchievementData.branch_target || '0') ? 'good' : parseFloat(volumeAchievementData.total_disbursement || '0') >= parseFloat(volumeAchievementData.branch_target || '0') * 0.8 ? 'warning' : 'critical') : 'critical'
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
        currentPeriod: month1DefaultPerformanceData ? `${parseFloat(month1DefaultPerformanceData.month_1_default_rate).toFixed(2)}` : '--',
        target: '≤15%',
        variance: month1DefaultPerformanceData ? `${(parseFloat(month1DefaultPerformanceData.month_1_default_rate) - 15).toFixed(2)}` : '--',
        trend: month1DefaultPerformanceData ? (parseFloat(month1DefaultPerformanceData.month_1_default_rate) <= 15 ? '↑' : '↓') : '↑',
        status: month1DefaultPerformanceData ? (parseFloat(month1DefaultPerformanceData.month_1_default_rate) <= 15 ? 'good' : parseFloat(month1DefaultPerformanceData.month_1_default_rate) <= 20 ? 'warning' : 'critical') : 'critical'
      },
      {
        name: 'Default aging analysis',
        institutionalAvg: '--',
        currentPeriod: longTermDelinquencyData ? `${parseFloat(longTermDelinquencyData.long_term_default_rate).toFixed(2)}` : '--',
        target: longTermDelinquencyData ? longTermDelinquencyData.target : '≤43.95%',
        variance: longTermDelinquencyData ? `${(parseFloat(longTermDelinquencyData.long_term_default_rate) - parseFloat(longTermDelinquencyData.target)).toFixed(2)}%` : '--',
        trend: longTermDelinquencyData ? (parseFloat(longTermDelinquencyData.long_term_default_rate) <= parseFloat(longTermDelinquencyData.target) ? '↑' : '↓') : '↑',
        status: longTermDelinquencyData ? (parseFloat(longTermDelinquencyData.long_term_default_rate) <= parseFloat(longTermDelinquencyData.target) ? 'good' : parseFloat(longTermDelinquencyData.long_term_default_rate) <= parseFloat(longTermDelinquencyData.target) * 1.1 ? 'warning' : 'critical') : 'critical'
      },
      {
        name: 'Recovery rate within 1 month',
        institutionalAvg: '--',
        currentPeriod: month3RecoveryAchievementsData ? `${parseFloat(month3RecoveryAchievementsData.recovery_rate_3_months).toFixed(2)}` : '--',
        target: '≥70%',
        variance: month3RecoveryAchievementsData ? `${(parseFloat(month3RecoveryAchievementsData.recovery_rate_3_months) - 70).toFixed(2)}` : '--',
        trend: month3RecoveryAchievementsData ? (parseFloat(month3RecoveryAchievementsData.recovery_rate_3_months) >= 70 ? '↑' : '↓') : '↓',
        status: month3RecoveryAchievementsData ? (parseFloat(month3RecoveryAchievementsData.recovery_rate_3_months) >= 70 ? 'good' : parseFloat(month3RecoveryAchievementsData.recovery_rate_3_months) >= 60 ? 'warning' : 'critical') : 'critical'
      },
      {
        name: 'Recovery rate within 3 months',
        institutionalAvg: '--',
        currentPeriod: month3RecoveryAchievementsData ? `${parseFloat(month3RecoveryAchievementsData.recovery_rate_3_months).toFixed(2)}` : '--',
        target: '≥100%',
        variance: month3RecoveryAchievementsData ? `${(parseFloat(month3RecoveryAchievementsData.recovery_rate_3_months) - 100).toFixed(2)}` : '--',
        trend: month3RecoveryAchievementsData ? (parseFloat(month3RecoveryAchievementsData.recovery_rate_3_months) >= 100 ? '↑' : '↓') : '↓',
        status: month3RecoveryAchievementsData ? (parseFloat(month3RecoveryAchievementsData.recovery_rate_3_months) >= 100 ? 'good' : parseFloat(month3RecoveryAchievementsData.recovery_rate_3_months) >= 90 ? 'warning' : 'critical') : 'critical'
      },
      {
        name: 'Risk migration trends',
        institutionalAvg: '--',
        currentPeriod: rollRateControlData ? `${parseFloat(rollRateControlData.score).toFixed(2)}` : '--',
        target: '≤20%',
        variance: rollRateControlData ? `${(parseFloat(rollRateControlData.score) - 20).toFixed(2)}` : '--',
        trend: rollRateControlData ? (parseFloat(rollRateControlData.score) <= 20 ? '↑' : '↓') : '↑',
        status: rollRateControlData ? (parseFloat(rollRateControlData.score) <= 20 ? 'good' : parseFloat(rollRateControlData.score) <= 30 ? 'warning' : 'critical') : 'warning'
      }
    ],
    'Revenue & Performance Metrics Index': [
      {
        name: 'Branch revenue',
        institutionalAvg: '--',
        currentPeriod: growthTrajectoryData ? `K${growthTrajectoryData.current_month_revenue.toLocaleString()}` : '--',
        target: '≥2.5% MoM growth',
        variance: growthTrajectoryData ? `${(growthTrajectoryData.mom_revenue * 100).toFixed(2)}` : '--',
        trend: growthTrajectoryData ? (growthTrajectoryData.mom_revenue >= 0.025 ? '↑' : '↓') : '→',
        status: growthTrajectoryData ? (growthTrajectoryData.mom_revenue >= 0.025 ? 'good' : growthTrajectoryData.mom_revenue >= 0 ? 'warning' : 'critical') : 'warning'
      },
      {
        name: 'Cost-to-income ratios',
        institutionalAvg: '--',
        currentPeriod: efficiencyRatioData ? `${parseFloat(efficiencyRatioData.CIR).toFixed(2)}` : '--',
        target: efficiencyRatioData ? efficiencyRatioData.target : '≤55%',
        variance: efficiencyRatioData ? `${(parseFloat(efficiencyRatioData.CIR) - parseFloat(efficiencyRatioData.target)).toFixed(2)}` : '--',
        trend: efficiencyRatioData ? (parseFloat(efficiencyRatioData.CIR) <= parseFloat(efficiencyRatioData.target) ? '↑' : '↓') : '↑',
        status: efficiencyRatioData ? (parseFloat(efficiencyRatioData.CIR) <= parseFloat(efficiencyRatioData.target) ? 'good' : parseFloat(efficiencyRatioData.CIR) <= parseFloat(efficiencyRatioData.target) * 1.1 ? 'warning' : 'critical') : 'critical'
      },
      {
        name: 'Institutional average performance',
        institutionalAvg: '--',
        currentPeriod: productivityAchievementData ? `${parseFloat(productivityAchievementData.normalized_score).toFixed(2)}%` : '--',
        target: '≥100%',
        variance: productivityAchievementData ? `${(parseFloat(productivityAchievementData.normalized_score) - 100).toFixed(2)}` : '--',
        trend: productivityAchievementData ? (parseFloat(productivityAchievementData.normalized_score) >= 100 ? '↑' : '↓') : '↓',
        status: productivityAchievementData ? (parseFloat(productivityAchievementData.normalized_score) >= 100 ? 'good' : parseFloat(productivityAchievementData.normalized_score) >= 90 ? 'warning' : 'critical') : 'critical'
      },
      {
        name: 'Growth trajectory alignment',
        institutionalAvg: '--',
        currentPeriod: growthTrajectoryData ? `${(growthTrajectoryData.mom_revenue * 100).toFixed(2)}` : '--',
        target: '≥2.5%',
        variance: growthTrajectoryData ? `${(growthTrajectoryData.mom_revenue * 100 - 2.5).toFixed(2)}` : '--',
        trend: growthTrajectoryData ? (growthTrajectoryData.mom_revenue >= 0.025 ? '↑' : '↓') : '↓',
        status: growthTrajectoryData ? (growthTrajectoryData.mom_revenue >= 0.025 ? 'good' : growthTrajectoryData.mom_revenue >= 0 ? 'warning' : 'critical') : 'warning'
      }
    ]
  };
  
  return kpis[paramName] || [];
}

export function InstitutionalHealthSummary({
  userLevel,
  userLevelLabel,
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
  yieldAchievementsData
}: InstitutionalHealthSummaryProps & { 
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
}) {
  const [expandedParam, setExpandedParam] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'composite' | 'metrics'>('metrics');
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const [drillLevel, setDrillLevel] = useState<'province' | 'branch' | 'consultant' | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);

  const levelLabel = {
    institution: 'Institutional',
    province: 'Provincial',
    district: 'District',
    branch: 'Branch',
    consultant: 'Personal'
  }[userLevel];

  return (
    <div className="space-y-4">
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
                <p className="text-gray-400 text-xs">Current</p>
                <p className="text-white font-bold">{overallScore}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Inst. Avg</p>
                <p className={`font-bold ${overallScore >= overallInstAvg ? 'text-green-400' : 'text-red-400'}`}>{overallInstAvg}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Target</p>
                <p className="text-gray-300 font-bold">{overallTarget}%</p>
              </div>
            </div>
          )}
        </div>
      )}
      


      {/* Five Headline Parameters View */}
      {(
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Five Headline Parameters — {levelLabel} Level
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">{userLevelLabel}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              {/* Overview stats */}
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Parameter</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inst. Avg</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{levelLabel} Avg</th>
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
                    yieldAchievementsData);
                  const isExpanded = expandedParam === param.name;
                  
                  // Calculate progress percentage
                  const userLevelScore = parseFloat(param.userLevelAvg.replace('%', ''));
                  const targetScore = parseFloat(param.target.toString().replace('%', '').replace('≥', '').replace('≤', ''));
                  const progress = Math.min(Math.max((userLevelScore / targetScore) * 100, 0), 100);

                  return (
                    <React.Fragment key={index}>
                      <tr 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        onClick={() => setExpandedParam(isExpanded ? null : param.name)}
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
                        <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">{param.institutionalAvg}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{param.userLevelAvg}</span>
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
                                    param.status === 'good' ? 'bg-green-500' :
                                    param.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 min-w-[40px] text-center">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {`${Math.round(100 - progress)}% to target`}
                            </div>
                          </div>
                        </td>
                      </tr>
                       {isExpanded && (
                        <tr>
                          <td colSpan={7} className="px-4 py-3 bg-blue-50 dark:bg-blue-900/10">
                            <div className="space-y-4">
                              {/* Key Performance Indicators */}
                              <div>
                                <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">📊 KEY PERFORMANCE INDICATORS:</h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full">
                                    <thead className="bg-blue-100 dark:bg-blue-900/30">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Metric</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Inst. Avg</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{levelLabel} Avg</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Target</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Variance</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Contribution</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Trend</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-blue-200 dark:divide-blue-900/20">
                                      {kpis.map((kpi, kpiIndex) => (
                                        <tr 
                                          key={kpiIndex} 
                                          className="hover:bg-blue-100 dark:hover:bg-blue-900/20 cursor-pointer"
                                          onClick={() => {
                                            setSelectedKPI(kpi.name);
                                            setDrillLevel('province');
                                            setSelectedProvince(null);
                                            setSelectedBranch(null);
                                          }}
                                        >
                                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{kpi.name}</td>
                                          <td className="px-4 py-2 text-left text-sm text-gray-600 dark:text-gray-300">{kpi.institutionalAvg}</td>
                                          <td className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">{parseFloat(kpi.currentPeriod)}%</td>
                                          <td className="px-4 py-2 text-left text-sm text-gray-500 dark:text-gray-400">{kpi.target}</td>
                                          <td className="px-4 py-2 text-left">
                                            <span className={`text-sm ${getVarianceColor(kpi.variance)}`}>{kpi.variance}</span>
                                          </td>
                                          <td className="px-4 py-2 text-left text-sm">
                                            {kpi.name === 'Staff Adequacy Score' && staffAdequacyData ? `${parseFloat(staffAdequacyData.percentage_point).toFixed(2)} of ${staffAdequacyData.weight.replace('%','')}pp` : 
                                             kpi.name === 'Productivity Achievement' && productivityAchievementData ? `${parseFloat(productivityAchievementData.percentage_point).toFixed(2)} of ${productivityAchievementData.weight.replace('%','')}pp` : 
                                             kpi.name === 'Vacancy Impact' && vacancyImpactData ? `${parseFloat(vacancyImpactData.percentage_point).toFixed(2)} of ${vacancyImpactData.weight.replace('%','')}pp` : 
                                             kpi.name === 'Volume Achievement' && volumeAchievementData ? `${parseFloat(volumeAchievementData.percentage_point).toFixed(2)} of ${volumeAchievementData.weight.replace('%','')}pp` : 
                                             kpi.name === 'Portfolio Load Balance' && loanPortfolioLoadData ? `${parseFloat(loanPortfolioLoadData.percentage_point).toFixed(2)} of ${loanPortfolioLoadData.weight.replace('%','')}pp` : 
                                             kpi.name === 'Loan disbursement volume' && volumeAchievementData ? `${parseFloat(volumeAchievementData.percentage_point).toFixed(2)} of ${volumeAchievementData.weight.replace('%','')}pp` : 
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
                                             kpi.name === 'Recovery rate within 1 month' && month3RecoveryAchievementsData ? `${parseFloat(month3RecoveryAchievementsData.percentage_point).toFixed(2)} of ${month3RecoveryAchievementsData.weight.replace('%','')}pp` : 
                                             kpi.name === 'Recovery rate within 3 months' && month3RecoveryAchievementsData ? `${parseFloat(month3RecoveryAchievementsData.percentage_point).toFixed(2)} of ${month3RecoveryAchievementsData.weight.replace('%','')}pp` : 
                                             kpi.name === 'Risk migration trends' && rollRateControlData ? `${parseFloat(rollRateControlData.percentage_point).toFixed(2)} of ${rollRateControlData.weight.replace('%','')}pp` : 
                                             kpi.name === 'Branch revenue' && growthTrajectoryData ? `${parseFloat(growthTrajectoryData.PP).toFixed(2)} of 10pp` : 
                                             kpi.name === 'Cost-to-income ratios' && efficiencyRatioData ? `${parseFloat(efficiencyRatioData.percentage_point).toFixed(2)} of ${efficiencyRatioData.weight.replace('%','')}pp` : 
                                             kpi.name === 'Institutional average performance' && productivityAchievementData ? `${parseFloat(productivityAchievementData.percentage_point).toFixed(2)} of ${productivityAchievementData.weight.replace('%','')}pp` : 
                                             kpi.name === 'Growth trajectory alignment' && growthTrajectoryData ? `${parseFloat(growthTrajectoryData.PP).toFixed(2)} of 10pp` : 
                                             '-'}
                                          </td>
                                          <td className="px-4 py-2 text-left">
                                            <span className={getTrendBadge(kpi.trend)}>{kpi.trend}</span>
                                          </td>
                                          <td className="px-4 py-2 text-left">
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

                              {/* Grid layout for analysis sections */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Trend Analysis */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-200 dark:border-blue-800">
                                  <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">📉 TREND ANALYSIS (vs last month):</h4>
                                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                    <p>• Overall Score: ▼ 8.3% (from 68.5%)</p>
                                    <p>• Primary Declines: Risk Management (▼12%), LC Performance (▼9%)</p>
                                    <p>• Geographic Origin: 42% of decline from Eastern Province</p>
                                    <p>• Branch-Level: Branch X (Eastern) ▼31%, Branch Y (Eastern) ▼18%</p>
                                  </div>
                                </div>

                                {/* Root Cause Analysis */}
                                {(userLevel === 'branch' || userLevel === 'province' || userLevel === 'district') && (
                                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-200 dark:border-blue-800">
                                    <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">🔍 ROOT CAUSE ANALYSIS:</h4>
                                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                      <p>• Primary Driver: Month-1 Default (20.0/40pp) - 20pp shortfall</p>
                                      <p>• Secondary: 3-Month Recovery (12.9/30pp) - 17.1pp shortfall</p>
                                      <p>• Geographic Concentration:</p>
                                      <p className="ml-4"> - Eastern Province: 22% (vs 38% inst) - contributing 42% of problem</p>
                                      <p className="ml-4"> - Branch X (Eastern): 15% - contributing 60% of provincial problem</p>
                                      <p className="ml-4"> - LC Mukuka (Branch X): 8% - PAR 45%, Recovery 12%</p>
                                      <p className="ml-4"> - LC Banda (Branch X): 12% - PAR 38%, Recovery 18%</p>
                                    </div>
                                  </div>
                                )}

                                {/* Alerts */}
                                {userLevel === 'institution' && (
                                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-200 dark:border-blue-800">
                                    <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">⚠️ ALERTS:</h4>
                                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                      <p>🔴 CRITICAL: Risk Management (38%) - 37pp below target</p>
                                      <p>🟠 WARNING: LC Performance (47%) - 33pp below target</p>
                                      <p>🟢 GOOD: Branch Structure (82%) - Near target</p>
                                    </div>
                                  </div>
                                )}

                                {/* Recommended Actions */}
                                {(userLevel === 'branch' || userLevel === 'province') && (
                                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-200 dark:border-blue-800">
                                    <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">✅ RECOMMENDED ACTIONS:</h4>
                                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                      <p>• Immediate: Portfolio reassignment for LC Mukuka and LC Banda (per Section 11)</p>
                                      <p>• Within 7 days: Branch Manager intervention on 30-60 day delinquent accounts</p>
                                      <p>• Within 30 days: District Manager review of collection practices at Branch X</p>
                                    </div>
                                  </div>
                                )}

                                {/* Timeline Tracking */}
                                {(userLevel === 'branch' || userLevel === 'province') && (
                                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-200 dark:border-blue-800 md:col-span-2">
                                    <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">⏰ TIMELINE TRACKING:</h4>
                                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                      <p>• Performance Manager notified: 2024-07-15 09:34</p>
                                      <p>• Branch Manager acknowledged: 2024-07-15 14:20</p>
                                      <p>• Follow-up review scheduled: 2024-07-22</p>
                                    </div>
                                  </div>
                                )}
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
      )}

      {/* Recent Activity
      {recentActivities.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Recent Activity Causing Change</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentActivities.map((activity, index) => (
              <div key={index} className="px-5 py-3 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  activity.impact === 'positive' ? 'bg-green-500' :
                  activity.impact === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{activity.time}</span>
                    <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">{activity.parameter}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}
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
              {/* Province Level View */}
              {drillLevel === 'province' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Province Level Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Province</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Inst. Avg</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Provincial Avg</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {Array.from({ length: 10 }, (_, i) => ({
                          id: i + 1,
                          name: `Province ${i + 1}`,
                          institutionalAvg: '12 loans/month',
                          currentPeriod: (10 + Math.random() * 5).toFixed(1) + ' loans/month',
                          target: '≥15 loans/month',
                          variance: `-${(5 - Math.random() * 3).toFixed(1)} loans/month`,
                          trend: ['↑', '↓', '→'][Math.floor(Math.random() * 3)] as '↑' | '↓' | '→',
                          status: ['good', 'warning', 'critical'][Math.floor(Math.random() * 3)] as 'good' | 'warning' | 'critical'
                        }))
                        .sort((a, b) => parseFloat(b.currentPeriod) - parseFloat(a.currentPeriod))
                        .map((province, index) => (
                          <tr 
                            key={province.id} 
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => {
                              setSelectedProvince(province.id);
                              setDrillLevel('branch');
                            }}
                          >
                            <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{province.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{province.institutionalAvg}</td>
                            <td className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">{province.currentPeriod}</td>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{province.target}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`${getVarianceColor(province.variance)}`}>{province.variance}</span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={getTrendBadge(province.trend)}>{province.trend}</span>
                            </td>
                            <td className="px-4 py-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusBadge(province.status)}`}>
                                {province.status === 'good' ? 'GOOD' : province.status === 'warning' ? 'WARNING' : 'CRITICAL'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Branch Level View */}
              {drillLevel === 'branch' && selectedProvince && (
                <div>
                  <div className="flex items-center mb-4">
                    <button 
                      onClick={() => setDrillLevel('province')}
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Provinces
                    </button>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Branches in Province {selectedProvince}</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Inst. Avg</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Branch Avg</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {Array.from({ length: 5 }, (_, i) => ({
                          id: i + 1,
                          name: `Branch ${i + 1}`,
                          institutionalAvg: '12 loans/month',
                          currentPeriod: (10 + Math.random() * 5).toFixed(1) + ' loans/month',
                          target: '≥15 loans/month',
                          variance: `-${(5 - Math.random() * 3).toFixed(1)} loans/month`,
                          trend: ['↑', '↓', '→'][Math.floor(Math.random() * 3)] as '↑' | '↓' | '→',
                          status: ['good', 'warning', 'critical'][Math.floor(Math.random() * 3)] as 'good' | 'warning' | 'critical'
                        }))
                        .sort((a, b) => parseFloat(b.currentPeriod) - parseFloat(a.currentPeriod))
                        .map((branch, index) => (
                          <tr 
                            key={branch.id} 
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => {
                              setSelectedBranch(branch.id);
                              setDrillLevel('consultant');
                            }}
                          >
                            <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{branch.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{branch.institutionalAvg}</td>
                            <td className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">{branch.currentPeriod}</td>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{branch.target}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`${getVarianceColor(branch.variance)}`}>{branch.variance}</span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={getTrendBadge(branch.trend)}>{branch.trend}</span>
                            </td>
                            <td className="px-4 py-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusBadge(branch.status)}`}>
                                {branch.status === 'good' ? 'GOOD' : branch.status === 'warning' ? 'WARNING' : 'CRITICAL'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
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



