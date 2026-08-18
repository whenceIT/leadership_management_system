'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { KPIStatus, KPITrend, ParameterSummary, KPI } from '@/types/dashboard';
import HealthAnalysisSections from './HealthAnalysisSections';
import { ProvinceLevelView } from './ProvinceLevelView';
import { BranchLevelView } from './BranchLevelView';
import { DistrictLevelView } from './DistrictLevelView';
import { ConsultantLevelView } from './ConsultantLevelView';
import { ParametersTableView } from './ParametersTableView';
import { useKPISuggestions } from '@/hooks/useKPISuggestions';

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
status: 'good' | 'warning' | 'critical' | 'bad' | 'moderate' | 'excellent';
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
  previousScore: number;
  prevMonthScores: { label: string; score: number }[];
  overallInstAvg: number;
  overallTarget: number;
}

function getAggregateScore(data: any, paramName: string, kpiName: string): number {
  if (!data) return 0;

  switch (paramName) {
    case 'Branch Structure & Staffing':
      switch (kpiName) {
        case 'Staff Adequacy Score':
        case 'Productivity Achievement':
          return parseFloat(data.normalized_score || data.average_normalized_score || '0');
        case 'Vacancy Impact':
          return parseFloat(data.normalized_score || data.average_normalized_score || '0') * 100;
        case 'Portfolio Load Balance':
          return parseFloat(data.score || data.average_score || '0');
      }
      break;
    case 'Loan Consultant Performance':
      switch (kpiName) {
        case 'Volume Achievement':
          return parseFloat(data.average_normalized_score || '0');
        case 'Portfolio quality':
        case 'Default contribution':
        case 'Collections efficiency':
          return parseFloat(data.average_score || '0');
        case 'Vetting compliance':
          return parseFloat(data.average_score || '0') * 100;
      }
      break;
    case 'Loan Products & Interest Rates':
      switch (kpiName) {
        case 'Product distribution mix':
          return (1 - parseFloat(data.average_HHI || '0')) * 100;
        case 'Revenue yield per product':
          return parseFloat(data.average_score || '0');
        case 'Product risk contribution':
          return (1 - parseFloat(data.average_score || '0')) * 100;
        case 'Margin alignment with strategy':
          return parseFloat(data.average_score || '0');
      }
      break;
    case 'Risk Management & Defaults':
      switch (kpiName) {
        case 'Default rate (branch, province, institutional)':
        case 'Default aging analysis':
        case 'Recovery rate within 3 months':
        case 'Risk migration trends':
          return parseFloat(data.average_score || '0');
      }
      break;
    case 'Revenue & Performance':
      switch (kpiName) {
        case 'Efficiency Ratio (CIR)':
          // CIR is an inverse metric (lower is better)
          // Normalize to 0-100 scale where 100 = perfect (CIR=0), 0 = at/beyond target
          {
            const cir = parseFloat(data.CIR || data.score || data.average_score || '0');
            const cirPct = cir * 100;
            const target = parseFloat(data.target || '55');
            if (target > 0) {
              return Math.max(0, Math.min(100, 100 - (cirPct / target) * 100));
            }
            return Math.max(0, Math.min(100, 100 - cirPct));
          }
        case 'Growth trajectory alignment':
          return (parseFloat(data.mom_revenue || data.average_score || '0')) * 100;
        case 'Revenue achievement':
          return parseFloat(data.average_score || data.normalized_score || '0');
        case 'Profitability contribution':
          return parseFloat((data.score || data.average_score || '0').replace('%', ''));
      }
      break;
    case 'Cash & Liquidity Management':
      switch (kpiName) {
        case 'Cash Position Score':
          return parseFloat(String(data.cash_position_score ?? data.average_score ?? 0));
      }
      break;
  }
  return 0;
}

function getAggregateWeight(data: any, paramName: string, kpiName: string): number {
  if (!data) return 0;
  const raw = data.weight;
  if (raw !== undefined && raw !== null) {
    const weight = typeof raw === 'string' ? parseFloat(raw) : raw;
    if (isFinite(weight) && weight > 0) return weight / 100;
  }
  return 0;
}

function formatAvg(value: any, suffix = '%'): string {
  if (value === undefined || value === null || value === '--') return '--';
  const str = String(value);
  if (str.includes('K') || str.includes('HHI') || str.includes('avg') || str.includes('MoM')) return str;
  const num = typeof value === 'number' ? value : parseFloat(str.replace(/,/g, '').replace(/[^0-9.\-]/g, ''));
  if (isNaN(num) || !isFinite(num)) return '--';
  const capped = Math.min(Math.max(num, 0), 100);
  return `${capped.toFixed(2)}${suffix}`;
}

function getKpiInstitutionalAvg(data: any, kpiName: string, suffix = '%'): string {
  const raw = data?.instAvg || data?.average_normalized_score || data?.average_score;
  const formatted = formatAvg(raw, suffix);
  return formatted !== '--' ? formatted : getFixedKpiInstitutionalAvg(kpiName);
}

function getFixedKpiInstitutionalAvg(kpiName: string): string {
  const defaults: Record<string, string> = {
    'Cash Position Score': '75%',
    'Staff Adequacy Score': '85%',
    'Productivity Achievement': '75%',
    'Vacancy Impact': '1.2',
    'Portfolio Load Balance': '85%',
    'Volume Achievement': '90%',
    'Portfolio quality': '71.64%',
    'Default contribution': '28.36%',
    'Collections efficiency': '58%',
    'Vetting compliance': '88%',
    'Product distribution mix': '0.38%',
    'Revenue yield per product': '36.5%',
    'Product risk contribution': '28.36%',
    'Margin alignment with strategy': '67%',
    'Default rate (branch, province, institutional)': '28.36%',
    'Default aging analysis': '43.95%',
    'Recovery rate within 3 months': '56.05%',
    'Risk migration trends': '20%',
    'Branch revenue': '1.8%',
    'Cost-to-income ratios': '55%',
    'Efficiency Ratio (CIR)': '67%',
    'Institutional average performance': '75%',
    'Growth trajectory alignment': '1.8%',
    'Revenue achievement': '65%',
    'Profitability contribution': '65%'
  };
  return defaults[kpiName] || '--';
}

export function calculateCashPositionScore(cashBalance: number, userLevel: string): number {
  if (!cashBalance || cashBalance <= 0) return 0;

  let maxBalance: number;
  switch (userLevel) {
    case 'institution':
      maxBalance = 50000000;
      break;
    case 'province':
      maxBalance = 500000;
      break;
    case 'branch':
      maxBalance = 100000;
      break;
    default:
      maxBalance = 0;
  }

  const score = (cashBalance / maxBalance) * 100;
  return Math.round(Math.min(Math.max(score, 0), 100));
}

function parseInstitutionalAvg(value: string | undefined): number | null {
  if (!value || value === '--') return null;
  const cleaned = value.replace(/,/g, '');
  const match = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  return isNaN(num) ? null : num;
}

function calculateSimpleAverage(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length === 0) return null;
  return valid.reduce((sum, v) => sum + v, 0) / valid.length;
}

function calculateHeadlineCurrentAverage(parameters: ParameterSummary[]): number {
  const values = parameters.map(param => {
    const raw = param.institutionalAvg || '--';
    if (raw === '--') return null;
    const num = parseFloat(raw.replace('%', ''));
    if (isNaN(num)) return null;
    return Math.min(100, Math.max(0, num));
  }).filter((v): v is number => v !== null);
  const avg = calculateSimpleAverage(values);
  return avg !== null ? Number(avg.toFixed(2)) : 0;
}

function calculateHeadlineInstitutionalAverage(parameters: ParameterSummary[]): number {
  const values = parameters.map(param => {
    const raw = param.userLevelAvg || '--';
    if (raw === '--') return null;
    const num = parseFloat(raw.replace('%', ''));
    if (isNaN(num)) return null;
    return Math.min(100, Math.max(0, num));
  }).filter((v): v is number => v !== null);
  const avg = calculateSimpleAverage(values);
  return avg !== null ? Number(avg.toFixed(2)) : 0;
}

export function getInstitutionalSummaryData(userLevel: 'institution' | 'province' | 'district' | 'branch' | 'consultant', userLevelLabel: string,
  staffAdequacyData?: any, productivityAchievementData?: any, vacancyImpactData?: any, loanPortfolioLoadData?: any,
  volumeAchievementData?: any, collectionEfficiencyData?: any, efficiencyRatioData?: any, growthTrajectoryData?: any,
  longTermDelinquencyData?: any, month1DefaultPerformanceData?: any, month3RecoveryAchievementsData?: any,
  portfolioQualityData?: any, productDiversificationData?: any, productRiskScoreData?: any, rollRateControlData?: any,
  yieldAchievementsData?: any, revenueAchievementsData?: any, profitabilityContributionData?: any,
  cashPositionData?: any): InstitutionalSummaryData {
  const branchStructureAggregated = aggregateBranchStructureKPIs(staffAdequacyData, productivityAchievementData, vacancyImpactData, loanPortfolioLoadData);
  const lcPerformanceAggregated = aggregateLoanConsultantPerformanceKPIs(volumeAchievementData, collectionEfficiencyData, portfolioQualityData, month1DefaultPerformanceData, productRiskScoreData);
  const loanProductsAggregated = aggregateLoanProductsKPIs(productDiversificationData, yieldAchievementsData, productRiskScoreData, efficiencyRatioData);
  const riskManagementAggregated = aggregateRiskManagementKPIs(month1DefaultPerformanceData, longTermDelinquencyData, month3RecoveryAchievementsData, rollRateControlData);
  const revenuePerformanceAggregated = aggregateRevenuePerformanceKPIs(growthTrajectoryData, efficiencyRatioData, productivityAchievementData, revenueAchievementsData, profitabilityContributionData);
  const cashLiquidityAggregated = aggregateCashLiquidityManagementKPIs(cashPositionData, userLevel);

  // Base data that can be adjusted based on user level
  const baseParameters: ParameterSummary[] = [
    {
      name: 'Branch Structure & Staffing',
      shortName: 'Staffing & Structure',
      institutionalAvg: branchStructureAggregated.institutionalAvg || '--',
      userLevelAvg: branchStructureAggregated.userLevelAvg || '--',
      target: branchStructureAggregated.target || '--',
      variance: branchStructureAggregated.variance || '--',
      varianceAbs: branchStructureAggregated.varianceAbs || '--',
      trend: branchStructureAggregated.trend || '→',
      status: branchStructureAggregated.status || 'warning',
      contribution: branchStructureAggregated.contribution || '--'
    },
    {
      name: 'Loan Consultant Performance',
      shortName: 'LC Performance',
      institutionalAvg: lcPerformanceAggregated.institutionalAvg || '--',
      userLevelAvg: lcPerformanceAggregated.userLevelAvg || '--',
      target: lcPerformanceAggregated.target || '--',
      variance: lcPerformanceAggregated.variance || '--',
      varianceAbs: lcPerformanceAggregated.varianceAbs || '--',
      trend: lcPerformanceAggregated.trend || '→',
      status: lcPerformanceAggregated.status || 'warning',
      contribution: lcPerformanceAggregated.contribution || '--'
    },
    {
      name: 'Loan Products & Interest Rates',
      shortName: 'Products & Rates',
      institutionalAvg: loanProductsAggregated.institutionalAvg || '--',
      userLevelAvg: loanProductsAggregated.userLevelAvg || '--',
      target: loanProductsAggregated.target || '--',
      variance: loanProductsAggregated.variance || '--',
      varianceAbs: loanProductsAggregated.varianceAbs || '--',
      trend: loanProductsAggregated.trend || '→',
      status: loanProductsAggregated.status || 'warning',
      contribution: loanProductsAggregated.contribution || '--'
    },
    {
      name: 'Risk Management & Defaults',
      shortName: 'Risk & Defaults',
      institutionalAvg: riskManagementAggregated.institutionalAvg || '--',
      userLevelAvg: riskManagementAggregated.userLevelAvg || '--',
      target: riskManagementAggregated.target || '--',
      variance: riskManagementAggregated.variance || '--',
      varianceAbs: riskManagementAggregated.varianceAbs || '--',
      trend: riskManagementAggregated.trend || '→',
      status: riskManagementAggregated.status || 'warning',
      contribution: riskManagementAggregated.contribution || '--'
    },
    {
      name: 'Revenue & Performance',
      shortName: 'Revenue & Performance',
      institutionalAvg: revenuePerformanceAggregated.institutionalAvg || '--',
      userLevelAvg: revenuePerformanceAggregated.userLevelAvg || '--',
      target: revenuePerformanceAggregated.target || '--',
      variance: revenuePerformanceAggregated.variance || '--',
      varianceAbs: revenuePerformanceAggregated.varianceAbs || '--',
      trend: revenuePerformanceAggregated.trend || '→',
      status: revenuePerformanceAggregated.status || 'warning',
      contribution: revenuePerformanceAggregated.contribution || '--'
    },
    {
      name: 'Cash & Liquidity Management',
      shortName: 'Cash & Liquidity (Liquidity Risk Focus)',
      institutionalAvg: cashLiquidityAggregated.institutionalAvg || '--',
      userLevelAvg: cashLiquidityAggregated.userLevelAvg || '--',
      target: cashLiquidityAggregated.target || '--',
      variance: cashLiquidityAggregated.variance || '--',
      varianceAbs: cashLiquidityAggregated.varianceAbs || '--',
      trend: cashLiquidityAggregated.trend || '→',
      status: cashLiquidityAggregated.status || 'warning',
      contribution: cashLiquidityAggregated.contribution || '--'
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
      parameter: 'Branch Structure & Staffing'
    },
    {
      time: '2024-07-13 11:05',
      description: 'Risk Management team identified increasing defaults',
      impact: 'negative',
      parameter: 'Risk Management & Defaults'
    },
    {
      time: '2024-07-12 08:45',
      description: 'District Manager reviewed branch performance',
      impact: 'positive',
      parameter: 'Loan Consultant Performance'
    }
  ];

  const overallScore = calculateHeadlineCurrentAverage(baseParameters);
  const overallInstAvg = calculateHeadlineInstitutionalAverage(baseParameters);

  // Calculate overall target (assuming target is ≥90% for all parameters)
  const overallTarget = 90;

  // Mocked previous 3 months scores (fixed snapshots)
  const prevMonth1 = 0;
  const prevMonth2 = 0;
  const prevMonth3 = 0;
  const previousScore = Math.round((prevMonth1 + prevMonth2 + prevMonth3) / 3);

  const getMonthName = (date: Date) => date.toLocaleString('default', { month: 'long' });

  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);

  const prevMonthScores = [
    { label: getMonthName(threeMonthsAgo), score: prevMonth3 },
    { label: getMonthName(twoMonthsAgo), score: prevMonth2 },
    { label: getMonthName(lastMonth), score: prevMonth1 }
  ];

  return {
    parameters: baseParameters,
    keyMetrics: baseKeyMetrics,
    recentActivities: baseRecentActivities,
    overallScore,
    previousScore,
    prevMonthScores,
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
  previousScore?: number;
  prevMonthScores?: { label: string; score: number }[];
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
  isLoading?: boolean;
  provincialAverages?: Record<string, string>;
}

function getTrendColor(trend: '↑' | '↓' | '→', status: 'good' | 'warning' | 'critical' | 'bad' | 'moderate') {
  if (status === 'critical' || status === 'bad') return 'text-red-600 dark:text-red-400';
  if (status === 'warning' || status === 'moderate') return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
}

function getAlertColor(level: 'critical' | 'warning' | 'good' | 'bad' | 'moderate') {
  switch (level) {
    case 'critical': return 'text-red-600 dark:text-red-400';
    case 'bad': return 'text-red-600 dark:text-red-400';
    case 'warning': return 'text-yellow-600 dark:text-yellow-400';
    case 'moderate': return 'text-orange-600 dark:text-orange-400';
    case 'good': return 'text-green-600 dark:text-green-400';
  }
}

function getAlertBadge(level: 'critical' | 'warning' | 'good' | 'bad' | 'moderate') {
  switch (level) {
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'bad': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'moderate': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'good': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  }
}

function getTrendBadge(trend: '↑' | '↓' | '→') {
  if (trend === '↑') return 'text-green-600 dark:text-gray-600 text-lg font-bold';
  if (trend === '↓') return 'text-red-600 dark:text-gray-600 text-lg font-bold';
  return 'text-orange-500 dark:text-gray-600 text-lg font-bold';
}

function getStatusBadge(status: KPIStatus) {
  switch (status) {
    case 'good': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'moderate': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'bad': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'excellent': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  }
}

function getVarianceColor(variance: string) {
  if (variance.startsWith('+')) return 'text-red-600 dark:text-red-400 font-semibold';
  if (variance.startsWith('-')) return 'text-green-600 dark:text-green-400 font-semibold';
  return 'text-gray-600 dark:text-gray-400';
}

function getCashPositionStatus(score: number): 'good' | 'moderate' | 'bad' | 'critical' | 'excellent' {
  if (score >= 70) return 'excellent';
  if (score >= 50) return 'good';
  if (score >= 30) return 'moderate';
  if (score >= 20) return 'bad';
  return 'critical';
}

function getCashPositionTrend(score: number): '↑' | '↓' | '→' {
  if (score >= 70) return '↑';
  if (score >= 50) return '→';
  return '↓';
}

function aggregateBranchStructureKPIs(staffAdequacyData?: any, productivityAchievementData?: any, vacancyImpactData?: any, loanPortfolioLoadData?: any): Partial<ParameterSummary> {
  const DEFAULT_INST_AVG = '85%';

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
      institutionalAvg: `${overallScore}%`,
      userLevelAvg: `${overallScore}%`,
      target: '100%',
      variance: varianceStr,
      varianceAbs,
      trend,
      status,
      contribution: `${overallScore.toFixed(2)} of 100pp`
    };
  }

  // For branch-level data, compute headline averages from KPI values
  const kpiDataList = [
    { data: staffAdequacyData, scoreField: 'normalized_score', avgField: 'instAvg' },
    { data: productivityAchievementData, scoreField: 'normalized_score', avgField: 'instAvg' },
    { data: vacancyImpactData, scoreField: 'normalized_score', avgField: 'instAvg', multiplier: 100 },
    { data: loanPortfolioLoadData, scoreField: 'score', avgField: 'instAvg' }
  ].filter(item => item.data);

  if (kpiDataList.length === 0) {
    return {
      institutionalAvg: DEFAULT_INST_AVG,
      userLevelAvg: '--',
      target: '100%',
      variance: '--',
      varianceAbs: '--',
      trend: '→',
      status: 'warning',
      contribution: '--'
    };
  }

  const userLevelValues = kpiDataList.map(item => {
    const raw = item.data[item.scoreField] ?? item.data.average_normalized_score ?? item.data.average_score ?? '0';
    let num = parseFloat(String(raw));
    if (item.multiplier) num = num * item.multiplier;
    return isNaN(num) ? 0 : num;
  });

  const instAvgValues = kpiDataList.map(item => {
    const raw = item.data[item.avgField] || item.data.average_normalized_score || item.data.average_score;
    if (!raw || raw === '--') return null;
    const str = String(raw);
    if (str.includes('K') || str.includes('HHI') || str.includes('avg') || str.includes('MoM')) return null;
    const cleaned = str.replace(/,/g, '').replace(/[^0-9.\-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }).filter((v): v is number => v !== null);

  const overallUserScore = Math.min(100, Math.max(0, userLevelValues.length > 0 ? Math.round(userLevelValues.reduce((a, b) => a + b, 0) / userLevelValues.length) : 0));
  const overallInstScore = instAvgValues.length > 0 ? Math.round(instAvgValues.reduce((a, b) => a + b, 0) / instAvgValues.length) : parseInt(DEFAULT_INST_AVG);
  const finalInstScore = Math.min(100, Math.max(0, overallInstScore === 0 ? parseInt(DEFAULT_INST_AVG) : overallInstScore));

  const target = 100;
  const variance = overallUserScore - target;
  const varianceStr = variance >= 0 ? `+${variance}%` : `${variance}%`;
  const varianceAbs = `${Math.abs(variance)}pp`;

  const trend = overallUserScore >= 90 ? '↑' : overallUserScore >= 70 ? '→' : '↓';
  const status: 'good' | 'warning' | 'critical' = overallUserScore >= 90 ? 'good' : overallUserScore >= 70 ? 'warning' : 'critical';

  return {
    institutionalAvg: `${finalInstScore}%`,
    userLevelAvg: `${overallUserScore}%`,
    target: '100%',
    variance: varianceStr,
    varianceAbs,
    trend,
    status,
    contribution: `${overallUserScore.toFixed(2)} of 100pp`
  };
}

function aggregateLoanConsultantPerformanceKPIs(
  volumeAchievementData?: any,
  collectionEfficiencyData?: any,
  portfolioQualityData?: any,
  month1DefaultPerformanceData?: any,
  productRiskScoreData?: any
): Partial<ParameterSummary> {
  const DEFAULT_INST_AVG = '75%';
  const kpiDataList = [
    { data: volumeAchievementData, scoreField: 'normalized_score', avgField: 'instAvg' },
    { data: collectionEfficiencyData, scoreField: 'benchmark', avgField: 'instAvg' },
    { data: portfolioQualityData, scoreField: 'PAR', avgField: 'instAvg' },
    { data: month1DefaultPerformanceData, scoreField: 'month_1_default_rate', avgField: 'instAvg' },
    { data: productRiskScoreData, scoreField: 'defaulted_rate', avgField: 'instAvg' }
  ].filter(item => item.data);

  if (kpiDataList.length === 0) {
    return {
      institutionalAvg: DEFAULT_INST_AVG,
      userLevelAvg: '--',
      target: '80%',
      variance: '--',
      varianceAbs: '--',
      trend: '→',
      status: 'warning',
      contribution: '--'
    };
  }

  const userLevelValues = kpiDataList.map(item => {
    const raw = item.data[item.scoreField] ?? item.data.average_normalized_score ?? item.data.average_score ?? '0';
    return parseFloat(String(raw));
  }).filter(v => !isNaN(v));

  const instAvgValues = kpiDataList.map(item => {
    const raw = item.data[item.avgField] || item.data.average_normalized_score || item.data.average_score;
    if (!raw || raw === '--') return null;
    const str = String(raw);
    if (str.includes('K') || str.includes('HHI') || str.includes('avg') || str.includes('MoM')) return null;
    const cleaned = str.replace(/,/g, '').replace(/[^0-9.\-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }).filter((v): v is number => v !== null);

  const overallUserScore = Math.min(100, Math.max(0, userLevelValues.length > 0 ? Math.round(userLevelValues.reduce((a, b) => a + b, 0) / userLevelValues.length) : 0));
  const overallInstScore = instAvgValues.length > 0 ? Math.round(instAvgValues.reduce((a, b) => a + b, 0) / instAvgValues.length) : parseInt(DEFAULT_INST_AVG);
  const finalInstScore = Math.min(100, Math.max(0, overallInstScore === 0 ? parseInt(DEFAULT_INST_AVG) : overallInstScore));

  const target = 80;
  const variance = overallUserScore - target;
  const varianceStr = variance >= 0 ? `+${variance}%` : `${variance}%`;
  const varianceAbs = `${Math.abs(variance)}pp`;

  const trend = overallUserScore >= 90 ? '↑' : overallUserScore >= 70 ? '→' : '↓';
  const status: 'good' | 'warning' | 'critical' = overallUserScore >= 90 ? 'good' : overallUserScore >= 70 ? 'warning' : 'critical';

  return {
    institutionalAvg: `${finalInstScore}%`,
    userLevelAvg: `${overallUserScore}%`,
    target: '80%',
    variance: varianceStr,
    varianceAbs,
    trend,
    status,
    contribution: `${overallUserScore.toFixed(2)} of 80pp`
  };
}

function aggregateLoanProductsKPIs(
  productDiversificationData?: any,
  yieldAchievementsData?: any,
  productRiskScoreData?: any,
  efficiencyRatioData?: any
): Partial<ParameterSummary> {
  const DEFAULT_INST_AVG = '74%';
  const kpiDataList = [
    { data: productDiversificationData, scoreField: 'HHI', avgField: 'instAvg', isPercentage: false },
    { data: yieldAchievementsData, scoreField: 'effective_interest_rate', avgField: 'instAvg' },
    { data: productRiskScoreData, scoreField: 'defaulted_rate', avgField: 'instAvg' },
    { data: efficiencyRatioData, scoreField: 'CIR', avgField: 'instAvg', multiplier: 100 }
  ].filter(item => item.data);

  if (kpiDataList.length === 0) {
    return {
      institutionalAvg: DEFAULT_INST_AVG,
      userLevelAvg: '--',
      target: '80%',
      variance: '--',
      varianceAbs: '--',
      trend: '→',
      status: 'warning',
      contribution: '--'
    };
  }

  const userLevelValues = kpiDataList.map(item => {
    const raw = item.data[item.scoreField] ?? item.data.average_score ?? '0';
    let num = parseFloat(String(raw));
    if (item.multiplier) num = num * item.multiplier;
    return isNaN(num) ? 0 : num;
  });

  const instAvgValues = kpiDataList.map(item => {
    if (!item.isPercentage) return null;
    const raw = item.data[item.avgField] || item.data.average_normalized_score || item.data.average_score;
    if (!raw || raw === '--') return null;
    const str = String(raw);
    if (str.includes('K') || str.includes('HHI') || str.includes('avg') || str.includes('MoM')) return null;
    const cleaned = str.replace(/,/g, '').replace(/[^0-9.\-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }).filter((v): v is number => v !== null);

  const overallUserScore = Math.min(100, Math.max(0, userLevelValues.length > 0 ? Math.round(userLevelValues.reduce((a, b) => a + b, 0) / userLevelValues.length) : 0));
  const overallInstScore = instAvgValues.length > 0 ? Math.round(instAvgValues.reduce((a, b) => a + b, 0) / instAvgValues.length) : parseInt(DEFAULT_INST_AVG);
  const finalInstScore = Math.min(100, Math.max(0, overallInstScore === 0 ? parseInt(DEFAULT_INST_AVG) : overallInstScore));

  const target = 80;
  const variance = overallUserScore - target;
  const varianceStr = variance >= 0 ? `+${variance}%` : `${variance}%`;
  const varianceAbs = `${Math.abs(variance)}pp`;

  const trend = overallUserScore >= 90 ? '↑' : overallUserScore >= 70 ? '→' : '↓';
  const status: 'good' | 'warning' | 'critical' = overallUserScore >= 90 ? 'good' : overallUserScore >= 70 ? 'warning' : 'critical';

  return {
    institutionalAvg: `${finalInstScore}%`,
    userLevelAvg: `${overallUserScore}%`,
    target: '80%',
    variance: varianceStr,
    varianceAbs,
    trend,
    status,
    contribution: `${overallUserScore.toFixed(2)} of 80pp`
  };
}

function aggregateRiskManagementKPIs(
  month1DefaultPerformanceData?: any,
  longTermDelinquencyData?: any,
  month3RecoveryAchievementsData?: any,
  rollRateControlData?: any
): Partial<ParameterSummary> {
  const DEFAULT_INST_AVG = '52%';
  const kpiDataList = [
    { data: month1DefaultPerformanceData, scoreField: 'average_score', avgField: 'instAvg' },
    { data: longTermDelinquencyData, scoreField: 'average_score', avgField: 'instAvg' },
    { data: month3RecoveryAchievementsData, scoreField: 'average_score', avgField: 'instAvg' },
    { data: rollRateControlData, scoreField: 'average_score', avgField: 'instAvg' }
  ].filter(item => item.data);

  if (kpiDataList.length === 0) {
    return {
      institutionalAvg: DEFAULT_INST_AVG,
      userLevelAvg: '--',
      target: '75%',
      variance: '--',
      varianceAbs: '--',
      trend: '→',
      status: 'warning',
      contribution: '--'
    };
  }

  const userLevelValues = kpiDataList.map(item => {
    const raw = item.data[item.scoreField] ?? item.data.average_normalized_score ?? '0';
    return parseFloat(String(raw));
  }).filter(v => !isNaN(v));

  const instAvgValues = kpiDataList.map(item => {
    const raw = item.data[item.avgField] || item.data.average_normalized_score || item.data.average_score;
    if (!raw || raw === '--') return null;
    const str = String(raw);
    if (str.includes('K') || str.includes('HHI') || str.includes('avg') || str.includes('MoM')) return null;
    const cleaned = str.replace(/,/g, '').replace(/[^0-9.\-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }).filter((v): v is number => v !== null);

  const overallUserScore = Math.min(100, Math.max(0, userLevelValues.length > 0 ? Math.round(userLevelValues.reduce((a, b) => a + b, 0) / userLevelValues.length) : 0));
  const overallInstScore = instAvgValues.length > 0 ? Math.round(instAvgValues.reduce((a, b) => a + b, 0) / instAvgValues.length) : parseInt(DEFAULT_INST_AVG);
  const finalInstScore = Math.min(100, Math.max(0, overallInstScore === 0 ? parseInt(DEFAULT_INST_AVG) : overallInstScore));

  const target = 75;
  const variance = overallUserScore - target;
  const varianceStr = variance >= 0 ? `+${variance}%` : `${variance}%`;
  const varianceAbs = `${Math.abs(variance)}pp`;

  const trend = overallUserScore >= 90 ? '↑' : overallUserScore >= 70 ? '→' : '↓';
  const status: 'good' | 'warning' | 'critical' = overallUserScore >= 90 ? 'good' : overallUserScore >= 70 ? 'warning' : 'critical';

  return {
    institutionalAvg: `${finalInstScore}%`,
    userLevelAvg: `${overallUserScore}%`,
    target: '75%',
    variance: varianceStr,
    varianceAbs,
    trend,
    status,
    contribution: `${overallUserScore.toFixed(2)} of 75pp`
  };
}

function aggregateCashLiquidityManagementKPIs(
  cashPositionData?: any,
  userLevel: string = 'institution'
): Partial<ParameterSummary> {
  const DEFAULT_INST_AVG = '70%';
  if (!cashPositionData) {
    return {
      institutionalAvg: DEFAULT_INST_AVG,
      userLevelAvg: '--',
      target: '--',
      variance: '--',
      varianceAbs: '--',
      trend: '→',
      status: 'warning',
      contribution: '--'
    };
  }

  const cashBalance = parseFloat(String(cashPositionData.totalCashBalance || cashPositionData.cashBalance || 0));
  const score = calculateCashPositionScore(cashBalance, userLevel);

  const target = 100;
  const variance = score - target;
  const varianceStr = variance >= 0 ? `+${variance}%` : `${variance}%`;
  const varianceAbs = `${Math.abs(variance)}pp`;

  const trend = userLevel === 'institution' ? getCashPositionTrend(score) : (score >= 90 ? '↑' : score >= 70 ? '→' : '↓');
  const status: 'good' | 'warning' | 'critical' | 'bad' | 'moderate' | 'excellent' = userLevel === 'institution' ? getCashPositionStatus(score) : (score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical');

  return {
    institutionalAvg: cashPositionData?.instAvg || `${score}%`,
    userLevelAvg: `${score}%`,
    target: userLevel === 'branch' ? 'K100,000' : userLevel === 'province' ? 'K500,000' : 'K50,000,000',
    variance: varianceStr,
    varianceAbs,
    trend,
    status,
    contribution: `${score.toFixed(2)} of 100pp`
  };
}

function aggregateRevenuePerformanceKPIs(
  growthTrajectoryData?: any,
  efficiencyRatioData?: any,
  productivityAchievementData?: any,
  revenueAchievementsData?: any,
  profitabilityContributionData?: any
): Partial<ParameterSummary> {
  const DEFAULT_INST_AVG = '65%';
  const kpiDataList = [
    { data: growthTrajectoryData, scoreField: 'mom_revenue', avgField: 'instAvg', multiplier: 100 },
    { data: efficiencyRatioData, scoreField: 'CIR', avgField: 'instAvg', multiplier: 100 },
    { data: productivityAchievementData, scoreField: 'normalized_score', avgField: 'instAvg' },
    { data: revenueAchievementsData, scoreField: 'average_score', avgField: 'instAvg' },
    { data: profitabilityContributionData, scoreField: 'score', avgField: 'instAvg', fallbackField: 'average_score' }
  ].filter(item => item.data);

  if (kpiDataList.length === 0) {
    return {
      institutionalAvg: DEFAULT_INST_AVG,
      userLevelAvg: '--',
      target: '75%',
      variance: '--',
      varianceAbs: '--',
      trend: '→',
      status: 'warning',
      contribution: '--'
    };
  }

  const userLevelValues = kpiDataList.map(item => {
    const raw = item.data[item.scoreField] ?? item.data[item.fallbackField || ''] ?? item.data.average_normalized_score ?? item.data.average_score ?? '0';
    let num = parseFloat(String(raw));
    if (item.multiplier) num = num * item.multiplier;
    return isNaN(num) ? 0 : num;
  });

  const instAvgValues = kpiDataList.map(item => {
    const raw = item.data[item.avgField] || item.data.average_normalized_score || item.data.average_score;
    if (!raw || raw === '--') return null;
    const str = String(raw);
    if (str.includes('K') || str.includes('HHI') || str.includes('avg') || str.includes('MoM')) return null;
    const cleaned = str.replace(/,/g, '').replace(/[^0-9.\-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }).filter((v): v is number => v !== null);

  const overallUserScore = Math.min(100, Math.max(0, userLevelValues.length > 0 ? Math.round(userLevelValues.reduce((a, b) => a + b, 0) / userLevelValues.length) : 0));
  const overallInstScore = instAvgValues.length > 0 ? Math.round(instAvgValues.reduce((a, b) => a + b, 0) / instAvgValues.length) : parseInt(DEFAULT_INST_AVG);
  const finalInstScore = Math.min(100, Math.max(0, overallInstScore === 0 ? parseInt(DEFAULT_INST_AVG) : overallInstScore));

  const target = 75;
  const variance = overallUserScore - target;
  const varianceStr = variance >= 0 ? `+${variance}%` : `${variance}%`;
  const varianceAbs = `${Math.abs(variance)}pp`;

  const trend = overallUserScore >= 90 ? '↑' : overallUserScore >= 70 ? '→' : '↓';
  const status: 'good' | 'warning' | 'critical' = overallUserScore >= 90 ? 'good' : overallUserScore >= 70 ? 'warning' : 'critical';

  return {
    institutionalAvg: `${finalInstScore}%`,
    userLevelAvg: `${overallUserScore}%`,
    target: '75%',
    variance: varianceStr,
    varianceAbs,
    trend,
    status,
    contribution: `${overallUserScore.toFixed(2)} of 75pp`
  };
}

function getParameterKPIs(userLevel: string, paramName: string,
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
   cashPositionData?: any): KPI[] {
  // Helper function to get score from data (handles both branch and institutional formats)
  const getScore = (data: any, field1: string, field2?: string): number => {
    if (!data) return 0;
    // First check field1, then fall back to field2
    let value = data[field1];
    if ((value === undefined || value === null || isNaN(value)) && field2) {
      value = data[field2];
    }
    if (value === undefined || value === null || isNaN(value)) return 0;
    const num = typeof value === 'string' ? parseFloat(value) : (typeof value === 'number' ? value : 0);
    return isNaN(num) || !isFinite(num) ? 0 : num;
  };

  const kpis: ParameterKPIs = {
    'Branch Structure & Staffing': [
      {
        name: 'Staff Adequacy Score',
        institutionalAvg: formatAvg(staffAdequacyData?.instAvg || staffAdequacyData?.average_normalized_score) || getFixedKpiInstitutionalAvg('Staff Adequacy Score'),
        currentPeriod: staffAdequacyData ? `${getScore(staffAdequacyData, 'normalized_score', 'average_normalized_score').toFixed(2)}` : '--',
        target: staffAdequacyData ? `${(staffAdequacyData.target || 100)}%` : '100%',
        variance: staffAdequacyData ? `${(getScore(staffAdequacyData, 'normalized_score', 'average_normalized_score') - (staffAdequacyData.target || 100)).toFixed(2)}%` : '--',
        trend: getScore(staffAdequacyData, 'normalized_score', 'average_normalized_score') >= (staffAdequacyData?.target || 100) ? '↑' : '↓',
        status: getScore(staffAdequacyData, 'normalized_score', 'average_normalized_score') >= 90 ? 'good' : getScore(staffAdequacyData, 'normalized_score', 'average_normalized_score') >= 70 ? 'warning' : 'critical',
        contribution: staffAdequacyData ? `${(getAggregateScore(staffAdequacyData, 'Branch Structure & Staffing', 'Staff Adequacy Score') * getAggregateWeight(staffAdequacyData, 'Branch Structure & Staffing', 'Staff Adequacy Score')).toFixed(2)} of ${(getAggregateWeight(staffAdequacyData, 'Branch Structure & Staffing', 'Staff Adequacy Score') * 100).toFixed(0)}pp` : '--'
      },
      {
        name: 'Productivity Achievement',
        institutionalAvg: getKpiInstitutionalAvg(productivityAchievementData, 'Productivity Achievement'),
        currentPeriod: productivityAchievementData ? `${getScore(productivityAchievementData, 'normalized_score', 'average_normalized_score').toFixed(2)}` : '0',
        target: productivityAchievementData ? '100%' : '--',
        variance: productivityAchievementData ? `${((score) => {
          const s = score ?? 0;
          const t = productivityAchievementData?.target ?? 100;
          const v = s - t;
          return isNaN(v) ? '--' : `${v.toFixed(2)}%`;
        })(getScore(productivityAchievementData, 'normalized_score', 'average_normalized_score'))}` : '--',
        trend: productivityAchievementData ? (getScore(productivityAchievementData, 'normalized_score', 'average_normalized_score') >= productivityAchievementData.target ? '↑' : '↓') : '↓',
        status: productivityAchievementData ? (getScore(productivityAchievementData, 'normalized_score', 'average_normalized_score') >= 90 ? 'good' : getScore(productivityAchievementData, 'normalized_score', 'average_normalized_score') >= 70 ? 'warning' : 'critical') : 'warning',
        contribution: productivityAchievementData ? `${(getAggregateScore(productivityAchievementData, 'Branch Structure & Staffing', 'Productivity Achievement') * getAggregateWeight(productivityAchievementData, 'Branch Structure & Staffing', 'Productivity Achievement')).toFixed(2)} of ${(getAggregateWeight(productivityAchievementData, 'Branch Structure & Staffing', 'Productivity Achievement') * 100).toFixed(0)}pp` : '--'
      },
      {
        name: 'Vacancy Impact',
        institutionalAvg: getKpiInstitutionalAvg(vacancyImpactData, 'Vacancy Impact'),
        currentPeriod: vacancyImpactData ? `${(getScore(vacancyImpactData, 'normalized_score', 'average_normalized_score') * 100).toFixed(2)}%` : '--',
        target: vacancyImpactData ? `${(vacancyImpactData.target ?? 20)}%` : '20%',
        variance: vacancyImpactData ? `${((score) => {
          const s = score ?? 0;
          const t = vacancyImpactData?.target ?? 20;
          const v = (s * 100) - t;
          return isNaN(v) ? '--' : `${v.toFixed(2)}%`;
        })(getScore(vacancyImpactData, 'normalized_score', 'average_normalized_score'))}` : '--',
        trend: vacancyImpactData ? ((getScore(vacancyImpactData, 'normalized_score', 'average_normalized_score') * 100) >= vacancyImpactData.target ? '↑' : '↓') : '↑',
        status: vacancyImpactData ? ((getScore(vacancyImpactData, 'normalized_score', 'average_normalized_score') * 100) >= 90 ? 'good' : (getScore(vacancyImpactData, 'normalized_score', 'average_normalized_score') * 100) >= 70 ? 'warning' : 'critical') : 'warning',
        contribution: vacancyImpactData ? `${(getAggregateScore(vacancyImpactData, 'Branch Structure & Staffing', 'Vacancy Impact') * getAggregateWeight(vacancyImpactData, 'Branch Structure & Staffing', 'Vacancy Impact')).toFixed(2)} of ${(getAggregateWeight(vacancyImpactData, 'Branch Structure & Staffing', 'Vacancy Impact') * 100).toFixed(0)}pp` : '--'
      },
      {
        name: 'Portfolio Load Balance',
        institutionalAvg: getKpiInstitutionalAvg(loanPortfolioLoadData, 'Portfolio Load Balance'),
        currentPeriod: loanPortfolioLoadData ? `${getScore(loanPortfolioLoadData, 'score', 'average_score').toFixed(2)}` : '--',
        target: loanPortfolioLoadData ? '100%' : '100%',
        variance: loanPortfolioLoadData ? `${((score) => {
          const s = score ?? 0;
          const t = loanPortfolioLoadData?.target ?? 100;
          const v = s - t;
          return isNaN(v) ? '--' : `${v.toFixed(2)}%`;
        })(getScore(loanPortfolioLoadData, 'score', 'average_score'))}` : '--',
        trend: loanPortfolioLoadData ? (getScore(loanPortfolioLoadData, 'score', 'average_score') >= loanPortfolioLoadData.target ? '↑' : '↓') : '↓',
        status: loanPortfolioLoadData ? (getScore(loanPortfolioLoadData, 'score', 'average_score') >= 90 ? 'good' : getScore(loanPortfolioLoadData, 'score', 'average_score') >= 70 ? 'warning' : 'critical') : 'warning',
        contribution: loanPortfolioLoadData ? `${(getAggregateScore(loanPortfolioLoadData, 'Branch Structure & Staffing', 'Portfolio Load Balance') * getAggregateWeight(loanPortfolioLoadData, 'Branch Structure & Staffing', 'Portfolio Load Balance')).toFixed(2)} of ${(getAggregateWeight(loanPortfolioLoadData, 'Branch Structure & Staffing', 'Portfolio Load Balance') * 100).toFixed(0)}pp` : '--'
      }
    ],
    'Loan Consultant Performance': [
      {
        name: 'Volume Achievement',
        institutionalAvg: getKpiInstitutionalAvg(volumeAchievementData, 'Volume Achievement'),
        currentPeriod: volumeAchievementData ? `${getScore(volumeAchievementData, 'normalized_score', 'average_normalized_score').toFixed(2)}` : '--',
        target: volumeAchievementData ? `≥${parseFloat(volumeAchievementData.branch_target || '0').toLocaleString()}` : '100',
        variance: volumeAchievementData ? `${parseFloat(volumeAchievementData.total_disbursement || '0') >= parseFloat(volumeAchievementData.branch_target || '0') ? '+' : ''}${(parseFloat(volumeAchievementData.total_disbursement || '0') - parseFloat(volumeAchievementData.branch_target || '0')).toLocaleString()}` : '--',
        trend: volumeAchievementData ? (parseFloat(volumeAchievementData.total_disbursement || '0') >= parseFloat(volumeAchievementData.branch_target || '0') ? '↑' : '↓') : '↓',
        status: volumeAchievementData ? (getScore(volumeAchievementData, 'normalized_score', 'average_normalized_score') >= 90 ? 'good' : getScore(volumeAchievementData, 'normalized_score', 'average_normalized_score') >= 70 ? 'warning' : 'critical') : 'warning',
        contribution: volumeAchievementData ? `${(getAggregateScore(volumeAchievementData, 'Loan Consultant Performance', 'Volume Achievement') * getAggregateWeight(volumeAchievementData, 'Loan Consultant Performance', 'Volume Achievement')).toFixed(2)} of ${(getAggregateWeight(volumeAchievementData, 'Loan Consultant Performance', 'Volume Achievement') * 100).toFixed(0)}pp` : '--'
      },
      {
        name: 'Portfolio quality',
        institutionalAvg: getKpiInstitutionalAvg(portfolioQualityData, 'Portfolio quality'),
        currentPeriod: portfolioQualityData ? `${getScore(portfolioQualityData, 'PAR', 'average_score').toFixed(2)}` : '--',
        target: '≤5%',
        variance: portfolioQualityData ? `${(getScore(portfolioQualityData, 'PAR', 'average_score') - 5).toFixed(2)}` : '--',
        trend: portfolioQualityData ? (getScore(portfolioQualityData, 'PAR', 'average_score') <= 5 ? '↑' : '↓') : '↓',
        status: portfolioQualityData ? (getScore(portfolioQualityData, 'PAR', 'average_score') <= 5 ? 'good' : getScore(portfolioQualityData, 'PAR', 'average_score') <= 10 ? 'warning' : 'critical') : 'warning',
        contribution: portfolioQualityData ? `${(getAggregateScore(portfolioQualityData, 'Loan Consultant Performance', 'Portfolio quality') * getAggregateWeight(portfolioQualityData, 'Loan Consultant Performance', 'Portfolio quality')).toFixed(2)} of ${(getAggregateWeight(portfolioQualityData, 'Loan Consultant Performance', 'Portfolio quality') * 100).toFixed(0)}pp` : '--'
      },
      {
        name: 'Default contribution',
        institutionalAvg: getKpiInstitutionalAvg(month1DefaultPerformanceData, 'Default contribution'),
        currentPeriod: month1DefaultPerformanceData ? `${parseFloat(month1DefaultPerformanceData.month_1_default_rate || '0').toFixed(2)}` : '--',
        target: '≤15%',
        variance: month1DefaultPerformanceData ? `${(parseFloat(month1DefaultPerformanceData.month_1_default_rate || '0') - 15).toFixed(2)}` : '--',
        trend: month1DefaultPerformanceData ? (parseFloat(month1DefaultPerformanceData.month_1_default_rate || '0') <= 15 ? '↑' : '↓') : '↑',
        status: month1DefaultPerformanceData ? (parseFloat(month1DefaultPerformanceData.month_1_default_rate || '0') <= 15 ? 'good' : parseFloat(month1DefaultPerformanceData.month_1_default_rate || '0') <= 20 ? 'warning' : 'critical') : 'critical',
        contribution: month1DefaultPerformanceData ? `${(getAggregateScore(month1DefaultPerformanceData, 'Loan Consultant Performance', 'Default contribution') * getAggregateWeight(month1DefaultPerformanceData, 'Loan Consultant Performance', 'Default contribution')).toFixed(2)} of ${(getAggregateWeight(month1DefaultPerformanceData, 'Loan Consultant Performance', 'Default contribution') * 100).toFixed(0)}pp` : '--'
      },
      {
        name: 'Collections efficiency',
        institutionalAvg: getKpiInstitutionalAvg(collectionEfficiencyData, 'Collections efficiency'),
        currentPeriod: collectionEfficiencyData ? `${getScore(collectionEfficiencyData, 'benchmark', 'average_score').toFixed(2)}` : '--',
        target: '≥75%',
        variance: collectionEfficiencyData ? `${(getScore(collectionEfficiencyData, 'benchmark', 'average_score') - 75).toFixed(2)}` : '--',
        trend: collectionEfficiencyData ? (getScore(collectionEfficiencyData, 'benchmark', 'average_score') >= 75 ? '↑' : '↓') : '↓',
        status: collectionEfficiencyData ? (getScore(collectionEfficiencyData, 'benchmark', 'average_score') >= 75 ? 'good' : getScore(collectionEfficiencyData, 'benchmark', 'average_score') >= 65 ? 'warning' : 'critical') : 'warning',
        contribution: collectionEfficiencyData ? `${(getAggregateScore(collectionEfficiencyData, 'Loan Consultant Performance', 'Collections efficiency') * getAggregateWeight(collectionEfficiencyData, 'Loan Consultant Performance', 'Collections efficiency')).toFixed(2)} of ${(getAggregateWeight(collectionEfficiencyData, 'Loan Consultant Performance', 'Collections efficiency') * 100).toFixed(0)}pp` : '--'
      },
      {
        name: 'Vetting compliance',
        institutionalAvg: getKpiInstitutionalAvg(productRiskScoreData, 'Vetting compliance', ''),
        currentPeriod: productRiskScoreData ? `${getScore(productRiskScoreData, 'defaulted_rate', 'average_score').toFixed(2)}` : '--',
        target: '≤1.0',
        variance: productRiskScoreData ? `${(getScore(productRiskScoreData, 'defaulted_rate', 'average_score') - 1.0).toFixed(2)}` : '--',
        trend: productRiskScoreData ? (getScore(productRiskScoreData, 'defaulted_rate', 'average_score') <= 1.0 ? '↑' : '↓') : '↓',
        status: productRiskScoreData ? (getScore(productRiskScoreData, 'defaulted_rate', 'average_score') <= 1.0 ? 'good' : getScore(productRiskScoreData, 'defaulted_rate', 'average_score') <= 1.5 ? 'warning' : 'critical') : 'critical',
        contribution: productRiskScoreData ? `${(getAggregateScore(productRiskScoreData, 'Loan Consultant Performance', 'Vetting compliance') * getAggregateWeight(productRiskScoreData, 'Loan Consultant Performance', 'Vetting compliance')).toFixed(2)} of ${(getAggregateWeight(productRiskScoreData, 'Loan Consultant Performance', 'Vetting compliance') * 100).toFixed(0)}pp` : '--'
      }
    ],
    'Loan Products & Interest Rates': [
      {
        name: 'Product distribution mix',
        institutionalAvg: getKpiInstitutionalAvg(productDiversificationData, 'Product distribution mix', ''),
        currentPeriod: productDiversificationData ? `${getScore(productDiversificationData, 'HHI', 'average_HHI').toFixed(3)}` : '--',
        target: 'HHI < 0.3',
        variance: productDiversificationData ? `${(getScore(productDiversificationData, 'HHI', 'average_HHI') - 0.3).toFixed(3)}` : '--',
        trend: productDiversificationData ? (getScore(productDiversificationData, 'HHI', 'average_HHI') < 0.3 ? '↑' : '↓') : '↓',
        status: productDiversificationData ? (getScore(productDiversificationData, 'HHI', 'average_HHI') < 0.3 ? 'good' : getScore(productDiversificationData, 'HHI', 'average_HHI') < 0.4 ? 'warning' : 'critical') : 'warning',
        contribution: productDiversificationData ? `${(getAggregateScore(productDiversificationData, 'Loan Products & Interest Rates', 'Product distribution mix') * getAggregateWeight(productDiversificationData, 'Loan Products & Interest Rates', 'Product distribution mix')).toFixed(2)} of ${(getAggregateWeight(productDiversificationData, 'Loan Products & Interest Rates', 'Product distribution mix') * 100).toFixed(0)}pp` : '--'
      },
      {
        name: 'Revenue yield per product',
        institutionalAvg: getKpiInstitutionalAvg(yieldAchievementsData, 'Revenue yield per product'),
        currentPeriod: yieldAchievementsData ? `${getScore(yieldAchievementsData, 'effective_interest_rate', 'average_score').toFixed(2)}` : '--',
        target: yieldAchievementsData ? yieldAchievementsData.target : '≥38.2%',
        variance: yieldAchievementsData ? `${(getScore(yieldAchievementsData, 'effective_interest_rate', 'average_score') - parseFloat(yieldAchievementsData.target || '0')).toFixed(2)}` : '--',
        trend: yieldAchievementsData ? (getScore(yieldAchievementsData, 'effective_interest_rate', 'average_score') >= parseFloat(yieldAchievementsData.target || '0') ? '↑' : '↓') : '↓',
        status: yieldAchievementsData ? (getScore(yieldAchievementsData, 'effective_interest_rate', 'average_score') >= parseFloat(yieldAchievementsData.target || '0') ? 'good' : getScore(yieldAchievementsData, 'effective_interest_rate', 'average_score') >= parseFloat(yieldAchievementsData.target || '0') * 0.9 ? 'warning' : 'critical') : 'warning',
        contribution: yieldAchievementsData ? `${(getAggregateScore(yieldAchievementsData, 'Loan Products & Interest Rates', 'Revenue yield per product') * getAggregateWeight(yieldAchievementsData, 'Loan Products & Interest Rates', 'Revenue yield per product')).toFixed(2)} of ${(getAggregateWeight(yieldAchievementsData, 'Loan Products & Interest Rates', 'Revenue yield per product') * 100).toFixed(0)}pp` : '--'
      },
      {
        name: 'Product risk contribution',
        institutionalAvg: getKpiInstitutionalAvg(productRiskScoreData, 'Product risk contribution', ''),
        currentPeriod: productRiskScoreData ? `${getScore(productRiskScoreData, 'defaulted_rate', 'average_score').toFixed(2)}` : '--',
        target: '≤1.0',
        variance: productRiskScoreData ? `${(getScore(productRiskScoreData, 'defaulted_rate', 'average_score') - 1.0).toFixed(2)}` : '--',
        trend: productRiskScoreData ? (getScore(productRiskScoreData, 'defaulted_rate', 'average_score') <= 1.0 ? '↑' : '↓') : '↑',
        status: productRiskScoreData ? (getScore(productRiskScoreData, 'defaulted_rate', 'average_score') <= 1.0 ? 'good' : getScore(productRiskScoreData, 'defaulted_rate', 'average_score') <= 1.5 ? 'warning' : 'critical') : 'critical',
        contribution: productRiskScoreData ? `${(getAggregateScore(productRiskScoreData, 'Loan Products & Interest Rates', 'Product risk contribution') * getAggregateWeight(productRiskScoreData, 'Loan Products & Interest Rates', 'Product risk contribution')).toFixed(2)} of ${(getAggregateWeight(productRiskScoreData, 'Loan Products & Interest Rates', 'Product risk contribution') * 100).toFixed(0)}pp` : '--'
      },
      {
        name: 'Margin alignment with strategy',
        institutionalAvg: getKpiInstitutionalAvg(efficiencyRatioData, 'Margin alignment with strategy'),
        currentPeriod: efficiencyRatioData ? `${parseFloat(efficiencyRatioData.CIR || '0').toFixed(2)}` : '--',
        target: efficiencyRatioData ? efficiencyRatioData.target : '≤55%',
        variance: efficiencyRatioData ? `${(parseFloat(efficiencyRatioData.CIR || '0') - parseFloat(efficiencyRatioData.target || '0')).toFixed(2)}` : '--',
        trend: efficiencyRatioData ? (parseFloat(efficiencyRatioData.CIR || '0') <= parseFloat(efficiencyRatioData.target || '0') ? '↑' : '↓') : '↓',
        status: efficiencyRatioData ? (parseFloat(efficiencyRatioData.CIR || '0') <= parseFloat(efficiencyRatioData.target || '0') ? 'good' : parseFloat(efficiencyRatioData.CIR || '0') <= parseFloat(efficiencyRatioData.target || '0') * 1.1 ? 'warning' : 'critical') : 'warning',
        contribution: efficiencyRatioData ? `${(getAggregateScore(efficiencyRatioData, 'Loan Products & Interest Rates', 'Margin alignment with strategy') * getAggregateWeight(efficiencyRatioData, 'Loan Products & Interest Rates', 'Margin alignment with strategy')).toFixed(2)} of ${(getAggregateWeight(efficiencyRatioData, 'Loan Products & Interest Rates', 'Margin alignment with strategy') * 100).toFixed(0)}pp` : '--'
      }
    ],
    'Risk Management & Defaults': [
      {
        name: 'Default rate (branch, province, institutional)',
        institutionalAvg: getKpiInstitutionalAvg(month1DefaultPerformanceData, 'Default rate (branch, province, institutional)'),
        currentPeriod: month1DefaultPerformanceData ? `${parseFloat(month1DefaultPerformanceData.average_score || '0').toFixed(2)}` : '--',
        target: '≤15%',
        variance: month1DefaultPerformanceData ? `${(parseFloat(month1DefaultPerformanceData.average_score || '0') - 15).toFixed(2)}` : '--',
        trend: month1DefaultPerformanceData ? (parseFloat(month1DefaultPerformanceData.average_score || '0') <= 15 ? '↑' : '↓') : '↑',
        status: month1DefaultPerformanceData ? (parseFloat(month1DefaultPerformanceData.average_score || '0') <= 15 ? 'good' : parseFloat(month1DefaultPerformanceData.average_score || '0') <= 20 ? 'warning' : 'critical') : 'critical',
        contribution: month1DefaultPerformanceData ? `${(getAggregateScore(month1DefaultPerformanceData, 'Risk Management & Defaults', 'Default rate (branch, province, institutional)') * getAggregateWeight(month1DefaultPerformanceData, 'Risk Management & Defaults', 'Default rate (branch, province, institutional)')).toFixed(2)} of ${(getAggregateWeight(month1DefaultPerformanceData, 'Risk Management & Defaults', 'Default rate (branch, province, institutional)') * 100).toFixed(0)}pp` : '--'
      },
      {
        name: 'Default aging analysis',
        institutionalAvg: getKpiInstitutionalAvg(longTermDelinquencyData, 'Default aging analysis'),
        currentPeriod: longTermDelinquencyData ? `${parseFloat(longTermDelinquencyData.average_score || '0').toFixed(2)}` : '--',
        target: longTermDelinquencyData ? longTermDelinquencyData.target : '≤43.95%',
        variance: longTermDelinquencyData ? `${(parseFloat(longTermDelinquencyData.average_score || '0') - parseFloat(longTermDelinquencyData.target || '0')).toFixed(2)}%` : '--',
        trend: longTermDelinquencyData ? (parseFloat(longTermDelinquencyData.average_score || '0') <= parseFloat(longTermDelinquencyData.target || '0') ? '↑' : '↓') : '↑',
        status: longTermDelinquencyData ? (parseFloat(longTermDelinquencyData.average_score || '0') <= parseFloat(longTermDelinquencyData.target || '0') ? 'good' : parseFloat(longTermDelinquencyData.average_score || '0') <= parseFloat(longTermDelinquencyData.target || '0') * 1.1 ? 'warning' : 'critical') : 'critical',
        contribution: longTermDelinquencyData ? `${(getAggregateScore(longTermDelinquencyData, 'Risk Management & Defaults', 'Default aging analysis') * getAggregateWeight(longTermDelinquencyData, 'Risk Management & Defaults', 'Default aging analysis')).toFixed(2)} of ${(getAggregateWeight(longTermDelinquencyData, 'Risk Management & Defaults', 'Default aging analysis') * 100).toFixed(0)}pp` : '--'
      },
      {
        name: 'Recovery rate within 3 months',
        institutionalAvg: getKpiInstitutionalAvg(month3RecoveryAchievementsData, 'Recovery rate within 3 months'),
        currentPeriod: month3RecoveryAchievementsData ? `${parseFloat(month3RecoveryAchievementsData.average_score || '0').toFixed(2)}` : '--',
        target: '≥100%',
        variance: month3RecoveryAchievementsData ? `${(parseFloat(month3RecoveryAchievementsData.average_score || '0') - 100).toFixed(2)}` : '--',
        trend: month3RecoveryAchievementsData ? (parseFloat(month3RecoveryAchievementsData.average_score || '0') >= 100 ? '↑' : '↓') : '↓',
        status: month3RecoveryAchievementsData ? (parseFloat(month3RecoveryAchievementsData.average_score || '0') >= 100 ? 'good' : parseFloat(month3RecoveryAchievementsData.average_score || '0') >= 90 ? 'warning' : 'critical') : 'critical',
        contribution: month3RecoveryAchievementsData ? `${(getAggregateScore(month3RecoveryAchievementsData, 'Risk Management & Defaults', 'Recovery rate within 3 months') * getAggregateWeight(month3RecoveryAchievementsData, 'Risk Management & Defaults', 'Recovery rate within 3 months')).toFixed(2)} of ${(getAggregateWeight(month3RecoveryAchievementsData, 'Risk Management & Defaults', 'Recovery rate within 3 months') * 100).toFixed(0)}pp` : '--'
      },
      {
        name: 'Risk migration trends',
        institutionalAvg: getKpiInstitutionalAvg(rollRateControlData, 'Risk migration trends'),
        currentPeriod: rollRateControlData ? `${parseFloat(rollRateControlData.average_score || '0').toFixed(2)}` : '--',
        target: '≤20%',
        variance: rollRateControlData ? `${(parseFloat(rollRateControlData.average_score || '0') - 20).toFixed(2)}` : '--',
        trend: rollRateControlData ? (parseFloat(rollRateControlData.average_score || '0') <= 20 ? '↑' : '↓') : '↑',
        status: rollRateControlData ? (parseFloat(rollRateControlData.average_score || '0') <= 20 ? 'good' : parseFloat(rollRateControlData.average_score || '0') <= 30 ? 'warning' : 'critical') : 'warning',
        contribution: rollRateControlData ? `${(getAggregateScore(rollRateControlData, 'Risk Management & Defaults', 'Risk migration trends') * getAggregateWeight(rollRateControlData, 'Risk Management & Defaults', 'Risk migration trends')).toFixed(2)} of ${(getAggregateWeight(rollRateControlData, 'Risk Management & Defaults', 'Risk migration trends') * 100).toFixed(0)}pp` : '--'
      }
    ],
    'Revenue & Performance': [
      {
        name: 'Efficiency Ratio (CIR)',
        institutionalAvg: getKpiInstitutionalAvg(efficiencyRatioData, 'Efficiency Ratio (CIR)'),
        currentPeriod: efficiencyRatioData ? `${(parseFloat(efficiencyRatioData.CIR || '0') * 100).toFixed(2)}%` : '--',
        target: efficiencyRatioData ? efficiencyRatioData.target : '≤55%',
        variance: efficiencyRatioData ? `${((parseFloat(efficiencyRatioData.CIR || '0') * 100) - parseFloat(efficiencyRatioData.target || '0')).toFixed(2)}%` : '--',
        trend: efficiencyRatioData ? (parseFloat(efficiencyRatioData.CIR || '0') * 100 <= parseFloat(efficiencyRatioData.target || '0') ? '↑' : '↓') : '↓',
        status: efficiencyRatioData ? (parseFloat(efficiencyRatioData.CIR || '0') * 100 <= parseFloat(efficiencyRatioData.target || '0') ? 'good' : parseFloat(efficiencyRatioData.CIR || '0') * 100 <= parseFloat(efficiencyRatioData.target || '0') * 1.1 ? 'warning' : 'critical') : 'warning',
        contribution: efficiencyRatioData ? `${(getAggregateScore(efficiencyRatioData, 'Revenue & Performance', 'Efficiency Ratio (CIR)') * getAggregateWeight(efficiencyRatioData, 'Revenue & Performance', 'Efficiency Ratio (CIR)')).toFixed(2)} of ${(getAggregateWeight(efficiencyRatioData, 'Revenue & Performance', 'Efficiency Ratio (CIR)') * 100).toFixed(0)}pp` : '--'
      },
      {
        name: 'Growth trajectory alignment',
        institutionalAvg: getKpiInstitutionalAvg(growthTrajectoryData, 'Growth trajectory alignment'),
        currentPeriod: growthTrajectoryData ? `${(parseFloat(growthTrajectoryData.mom_revenue || '0') * 100).toFixed(2)}%` : '--',
        target: '≥2.5%',
        variance: growthTrajectoryData ? `${((parseFloat(growthTrajectoryData.mom_revenue || '0') * 100) - 2.5).toFixed(2)}%` : '--',
        trend: growthTrajectoryData ? (parseFloat(growthTrajectoryData.mom_revenue || '0') * 100 >= 2.5 ? '↑' : '↓') : '↓',
        status: growthTrajectoryData ? (parseFloat(growthTrajectoryData.mom_revenue || '0') * 100 >= 2.5 ? 'good' : 'warning') : 'warning',
        contribution: growthTrajectoryData ? `${(getAggregateScore(growthTrajectoryData, 'Revenue & Performance', 'Growth trajectory alignment') * getAggregateWeight(growthTrajectoryData, 'Revenue & Performance', 'Growth trajectory alignment')).toFixed(2)} of ${(getAggregateWeight(growthTrajectoryData, 'Revenue & Performance', 'Growth trajectory alignment') * 100).toFixed(0)}pp` : '--'
      },
      {
        name: 'Revenue achievement',
        institutionalAvg: getKpiInstitutionalAvg(revenueAchievementsData, 'Revenue achievement'),
        currentPeriod: revenueAchievementsData ? `${parseFloat(revenueAchievementsData.average_score || '0').toFixed(2)}%` : '--',
        target: revenueAchievementsData?.target ? revenueAchievementsData.target : '≥100%',
        variance: revenueAchievementsData ? `${(parseFloat(revenueAchievementsData.average_score || '0') - parseFloat(revenueAchievementsData.target || '0')).toFixed(2)}%` : '--',
        trend: revenueAchievementsData ? (parseFloat(revenueAchievementsData.average_score || '0') >= parseFloat(revenueAchievementsData.target || '0') ? '↑' : '↓') : '↓',
        status: revenueAchievementsData ? (parseFloat(revenueAchievementsData.average_score || '0') >= 90 ? 'good' : parseFloat(revenueAchievementsData.average_score || '0') >= 70 ? 'warning' : 'critical') : 'warning',
        contribution: revenueAchievementsData ? `${(getAggregateScore(revenueAchievementsData, 'Revenue & Performance', 'Revenue achievement') * getAggregateWeight(revenueAchievementsData, 'Revenue & Performance', 'Revenue achievement')).toFixed(2)} of ${(getAggregateWeight(revenueAchievementsData, 'Revenue & Performance', 'Revenue achievement') * 100).toFixed(0)}pp` : '--'
      },
      {
        name: 'Profitability contribution',
        institutionalAvg: getKpiInstitutionalAvg(profitabilityContributionData, 'Profitability contribution'),
        currentPeriod: profitabilityContributionData ? `${parseFloat((profitabilityContributionData.score || profitabilityContributionData.average_score || '0').replace('%', '')).toFixed(2)}%` : '--',
        target: profitabilityContributionData && profitabilityContributionData.target ? `≥ ${profitabilityContributionData.target}` : '≥ institutional avg',
        variance: profitabilityContributionData ? `${(parseFloat((profitabilityContributionData.score || profitabilityContributionData.average_score || '0').replace('%', '')) - parseFloat(profitabilityContributionData.target || '0')).toFixed(2)}%` : '--',
        trend: profitabilityContributionData ? (parseFloat((profitabilityContributionData.score || profitabilityContributionData.average_score || '0').replace('%', '')) >= parseFloat(profitabilityContributionData.target || '0') ? '↑' : '↓') : '↓',
        status: profitabilityContributionData ? (parseFloat((profitabilityContributionData.score || profitabilityContributionData.average_score || '0').replace('%', '')) >= 90 ? 'good' : parseFloat((profitabilityContributionData.score || profitabilityContributionData.average_score || '0').replace('%', '')) >= 70 ? 'warning' : 'critical') : 'warning',
        contribution: profitabilityContributionData ? `${(getAggregateScore(profitabilityContributionData, 'Revenue & Performance', 'Profitability contribution') * getAggregateWeight(profitabilityContributionData, 'Revenue & Performance', 'Profitability contribution')).toFixed(2)} of ${(getAggregateWeight(profitabilityContributionData, 'Revenue & Performance', 'Profitability contribution') * 100).toFixed(0)}pp` : '--'
      }
    ],
    'Cash & Liquidity Management': [
      {
        name: 'Cash Position Score',
        institutionalAvg: (() => {
          if (!cashPositionData) return '--';
          const cashBalance = parseFloat(String(cashPositionData.totalCashBalance || cashPositionData.cashBalance || 0));
          const score = calculateCashPositionScore(cashBalance, userLevel);
          return `${score.toFixed(2)}%`;
        })(),
        currentPeriod: (() => {
          if (!cashPositionData) return '--';
          const cashBalance = parseFloat(String(cashPositionData.totalCashBalance || cashPositionData.cashBalance || 0));
          const score = calculateCashPositionScore(cashBalance, userLevel);
          return `${score.toFixed(2)}`;
        })(),
        target: (() => {
          switch (userLevel) {
            case 'province': return 'K500,000';
            case 'branch': return 'K100,000';
            default: return '50000000';
          }
        })(),
        variance: (() => {
          if (!cashPositionData) return '--';
          const cashBalance = parseFloat(String(cashPositionData.totalCashBalance || cashPositionData.cashBalance || 0));
          const score = calculateCashPositionScore(cashBalance, userLevel);
          return `${(score - 100).toFixed(2)}%`;
        })(),
        trend: (() => {
          if (!cashPositionData) return '→';
          const cashBalance = parseFloat(String(cashPositionData.totalCashBalance || cashPositionData.cashBalance || 0));
          const score = calculateCashPositionScore(cashBalance, userLevel);
          return userLevel === 'institution' ? getCashPositionTrend(score) : (score >= 90 ? '↑' : '↓');
        })(),
        status: (() => {
          if (!cashPositionData) return 'warning';
          const cashBalance = parseFloat(String(cashPositionData.totalCashBalance || cashPositionData.cashBalance || 0));
          const score = calculateCashPositionScore(cashBalance, userLevel);
          return userLevel === 'institution' ? getCashPositionStatus(score) : (score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical');
        })(),
        contribution: cashPositionData ? (() => {
          const cashBalance = parseFloat(String(cashPositionData.totalCashBalance || cashPositionData.cashBalance || 0));
          const score = calculateCashPositionScore(cashBalance, userLevel);
          return `${score.toFixed(2)} of 100pp`;
        })() : '--'
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
   previousScore,
   prevMonthScores,
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
    isLoading = false,
    provincialAverages
   }: InstitutionalHealthSummaryProps) {
    const [expandedParam, setExpandedParam] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'composite' | 'metrics'>('metrics');
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const [drillDownKPI, setDrillDownKPI] = useState<string | null>(null);
  const [drillLevel, setDrillLevel] = useState<'province' | 'district' | 'branch' | 'consultant' | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
   const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
   const [delayedOverallScore, setDelayedOverallScore] = useState<number | null>(null);
   const [delayedOverallInstAvg, setDelayedOverallInstAvg] = useState<number | null>(null);
   const calcTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

   const isCalculating = !isLoading && delayedOverallScore === null;

   useEffect(() => {
     if (calcTimerRef.current) {
       clearTimeout(calcTimerRef.current);
       calcTimerRef.current = null;
     }

     if (!isLoading) {
       calcTimerRef.current = setTimeout(() => {
         setDelayedOverallScore(calculateHeadlineCurrentAverage(parameters));
         setDelayedOverallInstAvg(calculateHeadlineInstitutionalAverage(parameters));
         calcTimerRef.current = null;
       }, 3000);
     }

     return () => {
       if (calcTimerRef.current) {
         clearTimeout(calcTimerRef.current);
         calcTimerRef.current = null;
       }
     };
   }, [isLoading, parameters]);

   const otherMetrics = useMemo(() => [
     { name: 'Volume Achievement', data: volumeAchievementData },
     { name: 'Collection Efficiency', data: collectionEfficiencyData },
     { name: 'Efficiency Ratio (CIR)', data: efficiencyRatioData },
     { name: 'Growth Trajectory', data: growthTrajectoryData },
     { name: 'Long-Term Delinquency', data: longTermDelinquencyData },
     { name: 'Month-1 Default Performance', data: month1DefaultPerformanceData },
     { name: '3-Month Recovery Achievements', data: month3RecoveryAchievementsData },
     { name: 'Portfolio Quality', data: portfolioQualityData },
     { name: 'Product Diversification', data: productDiversificationData },
     { name: 'Product Risk Score', data: productRiskScoreData },
     { name: 'Roll Rate Control', data: rollRateControlData },
     { name: 'Yield Achievements', data: yieldAchievementsData },
     { name: 'Revenue Achievements', data: revenueAchievementsData },
     { name: 'Profitability Contribution', data: profitabilityContributionData },
   ], [volumeAchievementData, collectionEfficiencyData, efficiencyRatioData, growthTrajectoryData,
       longTermDelinquencyData, month1DefaultPerformanceData, month3RecoveryAchievementsData,
       portfolioQualityData, productDiversificationData, productRiskScoreData, rollRateControlData,
       yieldAchievementsData, revenueAchievementsData, profitabilityContributionData]);

   const { suggestions } = useKPISuggestions({
      userLevel,
      userProvinceId,
      selectedProvince,
      selectedDistrict,
      selectedBranch,
      staffAdequacyData,
      productivityAchievementData,
      vacancyImpactData,
      loanPortfolioLoadData,
      volumeAchievementData,
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
      otherMetrics,
      enableDrillDown: true,
    });


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
               <div className="flex items-center justify-end gap-3 mb-1">
                 {prevMonthScores && prevMonthScores.length === 3 && (
                   <>
                     <span className="text-2xl font-bold text-gray-400 opacity-40">
                       {prevMonthScores[0].score}%
                     </span>
                     <span className="text-xs text-gray-500 opacity-40">{prevMonthScores[0].label}</span>
                     <span className="text-2xl font-bold text-gray-400 opacity-50">
                       {prevMonthScores[1].score}%
                     </span>
                     <span className="text-xs text-gray-500 opacity-50">{prevMonthScores[1].label}</span>
                     <span className="text-3xl font-bold text-gray-400 opacity-60">
                       {prevMonthScores[2].score}%
                     </span>
                     <span className="text-xs text-gray-500 opacity-60">{prevMonthScores[2].label}</span>
                   </>
                 )}
                  {isLoading || isCalculating ? (
                    <span className="text-xs font-medium text-gray-400">calc..</span>
                  ) : (
                    <span className={`text-xs font-medium ${
                      (delayedOverallScore ?? overallScore) >= (prevMonthScores?.[2]?.score ?? 0)
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      {(delayedOverallScore ?? overallScore) >= (prevMonthScores?.[2]?.score ?? 0) ? '▲' : '▼'}
                      {Math.abs((delayedOverallScore ?? overallScore) - (prevMonthScores?.[2]?.score ?? 0))}%
                    </span>
                  )}
                  {isLoading || isCalculating ? (
                    <span className="text-4xl font-black text-white animate-pulse">calc..</span>
                  ) : (
                    <span className="text-4xl font-black text-white">{delayedOverallScore ?? overallScore}%</span>
                  )}
                </div>
                <p className="text-gray-400 text-xs">{isLoading || isCalculating ? 'Calculating...' : 'Overall Health Score'}</p>
                {!isLoading && !isCalculating && prevMonthScores && prevMonthScores.length === 3 && (
                  <p className="text-xs text-gray-500 opacity-60">
                    Previous: {prevMonthScores[2].score}% ({prevMonthScores[2].label}) · Avg: {Math.round((prevMonthScores[0].score + prevMonthScores[1].score + prevMonthScores[2].score) / 3)}% (3-month)
                  </p>
                )}
            </div>
          </div>
          {overallInstAvg !== undefined && overallTarget !== undefined && (
             <div className="grid grid-cols-3 gap-4 text-center mt-3 pt-3 border-t border-gray-700">
              <div>
                <p className="text-gray-400 text-xs">Current Average</p>
                {isLoading || isCalculating ? (
                  <p className="text-white font-bold animate-pulse">calc..</p>
                ) : (
                  <>
                    <p className="text-white font-bold">{(delayedOverallScore ?? overallScore)}%</p>
                    {/* Indicator for comparison with Institutional Avg */}
                    <div className={`inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium ${(delayedOverallScore ?? overallScore) >= (delayedOverallInstAvg ?? overallInstAvg)
                      ? 'bg-green-900/50 text-green-300'
                      : 'bg-red-900/50 text-red-300'
                      }`}>
                      <span className="mr-1">{(delayedOverallScore ?? overallScore) >= (delayedOverallInstAvg ?? overallInstAvg) ? '▲' : '▼'}</span>
                      <span>
                        {(delayedOverallScore ?? overallScore) >= (delayedOverallInstAvg ?? overallInstAvg)
                          ? `+${(delayedOverallScore ?? overallScore) - (delayedOverallInstAvg ?? overallInstAvg)}%`
                          : `${(delayedOverallScore ?? overallScore) - (delayedOverallInstAvg ?? overallInstAvg)}%`}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div>
                <p className="text-gray-400 text-xs">Institutional Operating Average<br/>(Benchmark)</p>
                {isLoading || isCalculating ? (
                  <p className="text-white font-bold animate-pulse">calc..</p>
                ) : (
                  <p className={`font-bold ${(delayedOverallScore ?? overallScore) >= (delayedOverallInstAvg ?? overallInstAvg) ? 'text-green-400' : 'text-red-400'}`}>{(delayedOverallInstAvg ?? overallInstAvg)}%</p>
                )}
                {/* Show variance */}
                {!isLoading && !isCalculating && (
                  <p className="text-xs text-gray-500 mt-1">
                    {(delayedOverallScore ?? overallScore) >= (delayedOverallInstAvg ?? overallInstAvg)
                      ? `+${(delayedOverallScore ?? overallScore) - (delayedOverallInstAvg ?? overallInstAvg)}% above`
                      : `${(delayedOverallScore ?? overallScore) - (delayedOverallInstAvg ?? overallInstAvg)}% below`}
                  </p>
                )}
              </div>
              <div>
                <p className="text-gray-400 text-xs">Target</p>
                {isLoading || isCalculating ? (
                  <p className="text-white font-bold animate-pulse">calc..</p>
                ) : (
                  <p className="text-gray-300 font-bold">{overallTarget}%</p>
                )}
                {/* Indicator for comparison with Target */}
                {!isLoading && !isCalculating && (
                  <div className={`inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium ${(delayedOverallScore ?? overallScore) >= overallTarget
                    ? 'bg-green-900/50 text-green-300'
                    : 'bg-yellow-900/50 text-yellow-300'
                    }`}>
                    <span className="mr-1">{(delayedOverallScore ?? overallScore) >= overallTarget ? '▲' : '▼'}</span>
                    <span>
                      {(delayedOverallScore ?? overallScore) >= overallTarget
                        ? `+${(delayedOverallScore ?? overallScore) - overallTarget}%`
                        : `${(delayedOverallScore ?? overallScore) - overallTarget}%`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}



          <ParametersTableView
              parameters={parameters}
              userLevel={userLevel}
              userLevelLabel={userLevelLabel}
              expandedParam={expandedParam}
              onToggleExpand={(paramName) => {
                setExpandedParam(expandedParam === paramName ? null : paramName);
                if (expandedParam !== paramName) {
                  setSelectedKPI(null);
                  setDrillDownKPI(null);
                  setDrillLevel(null);
                }
              }}
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
               isLoading={isLoading}
               onKpiClick={(kpiName) => {
                if (selectedKPI === kpiName) {
                  setSelectedKPI(null);
                  setDrillDownKPI(null);
                  setDrillLevel(null);
                  setSelectedProvince(null);
                  setSelectedDistrict(null);
                  setSelectedBranch(null);
                } else {
                  setSelectedKPI(kpiName);
                  setDrillDownKPI(kpiName);
                  if (userLevel === 'institution') setDrillLevel('province');
                  else if (userLevel === 'province') setDrillLevel('district');
                  else if (userLevel === 'district') setDrillLevel('branch');
                  else if (userLevel === 'branch') setDrillLevel('branch');
                  setSelectedProvince(null);
                  setSelectedDistrict(null);
                  setSelectedBranch(null);
                }
              }}
              selectedKPI={selectedKPI}
              drillDownKPI={drillDownKPI}
              setDrillDownKPI={setDrillDownKPI}
              drillLevel={drillLevel}
              selectedProvince={selectedProvince}
              selectedDistrict={selectedDistrict}
              selectedBranch={selectedBranch}
              setSelectedKPI={setSelectedKPI}
              setDrillLevel={setDrillLevel}
              setSelectedProvince={setSelectedProvince}
               setSelectedDistrict={setSelectedDistrict}
               setSelectedBranch={setSelectedBranch}
 userProvinceId={userProvinceId}
               provincialAverages={provincialAverages}
             />

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
             suggestions={suggestions}
             isLoading={isLoading}
              />
     </div>
    
  );
}




