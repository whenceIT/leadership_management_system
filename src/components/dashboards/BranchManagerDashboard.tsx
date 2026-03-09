'use client';

import React, { useState, useMemo } from 'react';
import { DashboardBase, KPICard, AlertCard, CollapsibleCard } from './DashboardBase';
import { getHeadlineParameters } from '@/data/headline-parameters-mock';
import { InstitutionalHealthSummary, getInstitutionalSummaryData } from './InstitutionalHealthSummary';
import { useBranchManagerMetrics } from '@/hooks/useBranchManagerMetrics';
import { useUserKPI } from '@/hooks/useUserKPI';
import { useStaffAdequacy } from '@/hooks/useStaffAdequacy';
import { useProductivityAchievement } from '@/hooks/useProductivityAchievement';
import { useVacancyImpact } from '@/hooks/useVacancyImpact';
import { useVolumeAchievement } from '@/hooks/useVolumeAchievement';
import { useLoanPortfolioLoad } from '@/hooks/useLoanPortfolioLoad';
import { useCollectionEfficiency } from '@/hooks/useCollectionEfficiency';
import { useEfficiencyRatio } from '@/hooks/useEfficiencyRatio';
import { useGrowthTrajectory } from '@/hooks/useGrowthTrajectory';
import { useLongTermDelinquency } from '@/hooks/useLongTermDelinquency';
import { useMonth1DefaultPerformance } from '@/hooks/useMonth1DefaultPerformance';
import { useMonth3RecoveryAchievements } from '@/hooks/useMonth3RecoveryAchievements';
import { usePortfolioQuality } from '@/hooks/usePortfolioQuality';
import { useProductDiversification } from '@/hooks/useProductDiversification';
import { useProductRiskScore } from '@/hooks/useProductRiskScore';
import { useRollRateControl } from '@/hooks/useRollRateControl';
import { useYieldAchievements } from '@/hooks/useYieldAchievements';
import { useCashPosition } from '@/hooks/useCashPosition';
import { useAboveThresholdRisk } from '@/hooks/useAboveThresholdRisk';
import { useBelowThresholdRisk } from '@/hooks/useBelowThresholdRisk';
import { useApprovedExceptionRatio } from '@/hooks/useApprovedExceptionRatio';

interface BranchManagerDashboardProps {
  userTier?: string | null;
}

export default function BranchManagerDashboard({ userTier }: BranchManagerDashboardProps) {

  const {
    isLoading,
    error,
    activeLoans,
    branchStats,
    collectionRate,
    month1DefaultRate,
    collectionWaterfall,
    refreshAllMetrics
  } = useBranchManagerMetrics();

  // Get user-specific KPI data
  const { processedKPIs, isLoading: isKpiLoading, error: kpiError } = useUserKPI();

  // Build KPIs from user-specific KPI data
  const kpis = processedKPIs.length > 0 ? processedKPIs.map(kpi => ({
    name: kpi.name,
    baseline: kpi.baseline.toString(),
    target: kpi.target.toString(),
    weight: `${kpi.weight}%`
  })) : [];

  // Headline parameters using composite index approach
  const headlineParameters = getHeadlineParameters({
    onStaffRatiosDrillDown: () => setDrillView('consultants')
  });

  // Drill-down for Branch Manager: consultants -> transactions
  const [drillView, setDrillView] = useState<'consultants' | 'transactions'>('consultants');
  const [selectedConsultant, setSelectedConsultant] = useState<number | null>(null);

  // Fetch staff adequacy performance data
  const { data: staffAdequacyData, isLoading: isStaffAdequacyLoading, error: staffAdequacyError } = useStaffAdequacy(3); // Using branch id 3 as per example

  // Fetch productivity achievement data
  const { data: productivityAchievementData, isLoading: isProductivityLoading, error: productivityError } = useProductivityAchievement(3); // Using branch id 3 as per example

  // Fetch vacancy impact data
  const { data: vacancyImpactData, isLoading: isVacancyLoading, error: vacancyError } = useVacancyImpact(3); // Using branch id 3 as per example

  // Fetch volume achievement data
  const { data: volumeAchievementData, isLoading: isVolumeLoading, error: volumeError } = useVolumeAchievement(3); // Using branch id 3 as per example

  // Fetch loan portfolio load data
  const { data: loanPortfolioLoadData, isLoading: isLoanPortfolioLoading, error: loanPortfolioError } = useLoanPortfolioLoad(3); // Using branch id 3 as per example

  // Fetch collection efficiency data
  const { data: collectionEfficiencyData, isLoading: isCollectionEfficiencyLoading, error: collectionEfficiencyError } = useCollectionEfficiency(3);

  // Fetch efficiency ratio data
  const { data: efficiencyRatioData, isLoading: isEfficiencyRatioLoading, error: efficiencyRatioError } = useEfficiencyRatio(3);

  // Fetch growth trajectory data
  const { data: growthTrajectoryData, isLoading: isGrowthTrajectoryLoading, error: growthTrajectoryError } = useGrowthTrajectory(3);

  // Fetch long term delinquency data
  const { data: longTermDelinquencyData, isLoading: isLongTermDelinquencyLoading, error: longTermDelinquencyError } = useLongTermDelinquency(3);

  // Fetch month 1 default performance data
  const { data: month1DefaultPerformanceData, isLoading: isMonth1DefaultPerformanceLoading, error: month1DefaultPerformanceError } = useMonth1DefaultPerformance(3);

  // Fetch month 3 recovery achievements data
  const { data: month3RecoveryAchievementsData, isLoading: isMonth3RecoveryAchievementsLoading, error: month3RecoveryAchievementsError } = useMonth3RecoveryAchievements(3);

  // Fetch portfolio quality data
  const { data: portfolioQualityData, isLoading: isPortfolioQualityLoading, error: portfolioQualityError } = usePortfolioQuality(3);

  // Fetch product diversification data
  const { data: productDiversificationData, isLoading: isProductDiversificationLoading, error: productDiversificationError } = useProductDiversification(3);

  // Fetch product risk score data
  const { data: productRiskScoreData, isLoading: isProductRiskScoreLoading, error: productRiskScoreError } = useProductRiskScore(3);

  // Fetch roll rate control data
  const { data: rollRateControlData, isLoading: isRollRateControlLoading, error: rollRateControlError } = useRollRateControl(3);

  // Fetch yield achievements data
  const { data: yieldAchievementsData, isLoading: isYieldAchievementsLoading, error: yieldAchievementsError } = useYieldAchievements(3);

  // Fetch cash position data
  const { data: cashPositionData, isLoading: isCashPositionLoading, error: cashPositionError } = useCashPosition(3);

  // Fetch above threshold risk data
  const { data: aboveThresholdRiskData, isLoading: isAboveThresholdRiskLoading, error: aboveThresholdRiskError } = useAboveThresholdRisk(3);

  // Fetch below threshold risk data
  const { data: belowThresholdRiskData, isLoading: isBelowThresholdRiskLoading, error: belowThresholdRiskError } = useBelowThresholdRisk(3);

  // Fetch approved exception ratio data
  const { data: approvedExceptionRatioData, isLoading: isApprovedExceptionRatioLoading, error: approvedExceptionRatioError } = useApprovedExceptionRatio(3);

  // Custom summary data with dynamic aggregated Branch Structure & Staffing Index
  const summaryData = useMemo(() => {
    const baseData = getInstitutionalSummaryData('branch', 'Branch View', staffAdequacyData, productivityAchievementData, vacancyImpactData, loanPortfolioLoadData, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, cashPositionData, aboveThresholdRiskData, belowThresholdRiskData, approvedExceptionRatioData);
    let updatedData = { ...baseData };

    // Update key metrics with individual KPI data
    let keyMetrics = [...updatedData.keyMetrics];
    
    // Update Staff Adequacy Score key metric
    if (staffAdequacyData) {
      keyMetrics = keyMetrics.map(metric => {
        if (metric.parameter === 'Staff Adequacy Score') {
          return {
            ...metric,
            institutionalAvg: staffAdequacyData?.instAvg || '--',
            currentPeriod: `${staffAdequacyData?.normalized_score || 0}%`,
            target: '100%',
            variance: `${(staffAdequacyData?.normalized_score || 0) - (staffAdequacyData?.target || 100)}%`,
            trend: ((staffAdequacyData?.normalized_score || 0) >= (staffAdequacyData?.target || 100) ? '↑' : '↓') as '↑' | '↓' | '→',
            provAvg: '90%',
            contribution: `${staffAdequacyData?.percentage_point || 0}/25pp ${(staffAdequacyData?.normalized_score || 0) >= (staffAdequacyData?.target || 100) ? '▲' : '▼'}`
          };
        }
        return metric;
      });
    }

    // Update Productivity Achievement key metric
    if (productivityAchievementData) {
      const normalizedScore = parseFloat(productivityAchievementData.normalized_score || '0');
      const percentagePoint = parseFloat(productivityAchievementData.percentage_point || '0');
      const weight = parseFloat((productivityAchievementData.weight || '0%').replace('%', ''));
      
      keyMetrics = keyMetrics.map(metric => {
        if (metric.parameter === 'Productivity Achievement') {
          return {
            ...metric,
            institutionalAvg: '--',
            currentPeriod: `${normalizedScore}%`,
            target: '≥100%',
            variance: `${normalizedScore - productivityAchievementData.target}%`,
            trend: (normalizedScore >= productivityAchievementData.target ? '↑' : '↓') as '↑' | '↓' | '→',
            provAvg: '93%',
            contribution: `${percentagePoint}/${weight}pp ${normalizedScore >= productivityAchievementData.target ? '▲' : '▼'}`
          };
        }
        return metric;
      });
    }

    // Update Vacancy Impact key metric
    if (vacancyImpactData) {
      const normalizedScore = (vacancyImpactData.normalized_score || 0) * 100; // Convert to percentage
      const percentagePoint = vacancyImpactData.percentage_point || 0;
      const weight = parseFloat((vacancyImpactData.weight || '0%').replace('%', ''));
      const variance = normalizedScore - (vacancyImpactData.target || 0);
      
      keyMetrics = keyMetrics.map(metric => {
        if (metric.parameter === 'Vacancy Impact') {
          return {
            ...metric,
            institutionalAvg: '--',
            currentPeriod: `${normalizedScore.toFixed(1)}%`,
            target: '≥0%',
            variance: `${variance.toFixed(1)}%`,
            trend: (normalizedScore >= vacancyImpactData.target ? '↑' : '↓') as '↑' | '↓' | '→',
            provAvg: '92%',
            contribution: `${percentagePoint.toFixed(1)}/${weight}pp ${normalizedScore >= vacancyImpactData.target ? '▲' : '▼'}`
          };
        }
        return metric;
      });
    }

    // Update Volume Achievement key metric
    if (volumeAchievementData) {
      const normalizedScore = parseFloat(volumeAchievementData.normalized_score || '0');
      const percentagePoint = parseFloat(volumeAchievementData.percentage_point || '0');
      const weight = parseFloat((volumeAchievementData.weight || '0%').replace('%', ''));
      const branchTarget = parseFloat(volumeAchievementData.branch_target || '0');
      const totalDisbursement = parseFloat(volumeAchievementData.total_disbursement || '0');
      
      keyMetrics = keyMetrics.map(metric => {
        if (metric.parameter === 'Volume Achievement') {
          return {
            ...metric,
            institutionalAvg: '--',
            currentPeriod: `${normalizedScore.toFixed(1)}%`,
            target: `≥${branchTarget.toLocaleString()}`,
            variance: `${totalDisbursement >= branchTarget ? '+' : ''}${(totalDisbursement - branchTarget).toLocaleString()}`,
            trend: (totalDisbursement >= branchTarget ? '↑' : '↓') as '↑' | '↓' | '→',
            provAvg: '88%',
            contribution: `${percentagePoint.toFixed(1)}/${weight}pp ${totalDisbursement >= branchTarget ? '▲' : '▼'}`
          };
        }
        return metric;
      });
    }

    // Update Portfolio Load Balance key metric
    if (loanPortfolioLoadData) {
      const normalizedScore = parseFloat(loanPortfolioLoadData.score || '0');
      const percentagePoint = loanPortfolioLoadData.percentage_point || 0;
      const weight = parseFloat((loanPortfolioLoadData.weight || '0%').replace('%', ''));
      const variance = normalizedScore - (loanPortfolioLoadData.target || 0);
      
      keyMetrics = keyMetrics.map(metric => {
        if (metric.parameter === 'Portfolio Load Balance') {
          return {
            ...metric,
            institutionalAvg: '--',
            currentPeriod: `${normalizedScore.toFixed(1)}%`,
            target: '100%',
            variance: `${variance.toFixed(1)}%`,
            trend: (normalizedScore >= loanPortfolioLoadData.target ? '↑' : '↓') as '↑' | '↓' | '→',
            provAvg: '94%',
            contribution: `${percentagePoint.toFixed(1)}/${weight}pp ${normalizedScore >= loanPortfolioLoadData.target ? '▲' : '▼'}`
          };
        }
        return metric;
      });
    }

    // Update Loan Consultant Performance Index with Volume Achievement data
    if (volumeAchievementData) {
      const normalizedScore = parseFloat(volumeAchievementData.normalized_score || '0');
      const variance = normalizedScore - 100; // Target is 100% for normalized score
      
      updatedData = {
        ...updatedData,
        parameters: updatedData.parameters.map(param => {
          if (param.name === 'Loan Consultant Performance Index') {
            const trend = normalizedScore >= 100 ? '↑' : '↓';
            const status = normalizedScore >= 90 ? 'good' : normalizedScore >= 70 ? 'warning' : 'critical';
            
            return {
              ...param,
              institutionalAvg: '--', // Hardcoded institutional average
              userLevelAvg: `${normalizedScore.toFixed(1)}%`,
              variance: `${variance.toFixed(1)}%`,
              varianceAbs: `${Math.abs(variance).toFixed(1)}pp`,
              trend: trend as '↑' | '↓' | '→',
              status: status as 'good' | 'warning' | 'critical'
            };
          }
          return param;
        })
      };
    }

      // Update Cash Position Score key metric
     if (cashPositionData) {
       const score = parseFloat(cashPositionData.score || '0');
       const percentagePoints = parseFloat(cashPositionData.percentage_points || '0');
       
       keyMetrics = keyMetrics.map(metric => {
         if (metric.parameter === 'Cash Position Score') {
           return {
             ...metric,
             institutionalAvg: '--',
             currentPeriod: `${score.toFixed(1)}%`,
             target: '20000 to 30000',
             variance: `${(score - 100).toFixed(1)}%`,
             trend: (score >= 90 ? '↑' : '↓') as '↑' | '↓' | '→',
             provAvg: '90%',
             contribution: `${percentagePoints.toFixed(1)}/40pp ${score >= 90 ? '▲' : '▼'}`
           };
         }
         return metric;
       });
     }

     // Update Above-Threshold Risk key metric
     if (aboveThresholdRiskData) {
       const score = parseFloat(aboveThresholdRiskData.score || '0');
       const percentagePoints = parseFloat(aboveThresholdRiskData.percentage_points || '0');
       
       keyMetrics = keyMetrics.map(metric => {
         if (metric.parameter === 'Above-Threshold Risk') {
           return {
             ...metric,
             institutionalAvg: '--',
             currentPeriod: `${score.toFixed(1)}%`,
             target: 'Zero',
             variance: `${(score - 100).toFixed(1)}%`,
             trend: (score >= 90 ? '↑' : '↓') as '↑' | '↓' | '→',
             provAvg: '90%',
             contribution: `${percentagePoints.toFixed(1)}/30pp ${score >= 90 ? '▲' : '▼'}`
           };
         }
         return metric;
       });
     }

     // Update Below-Threshold Risk key metric
     if (belowThresholdRiskData) {
       const score = parseFloat(belowThresholdRiskData.score || '0');
       const percentagePoints = parseFloat(belowThresholdRiskData.percentage_points || '0');
       
       keyMetrics = keyMetrics.map(metric => {
         if (metric.parameter === 'Below-Threshold Risk') {
           return {
             ...metric,
             institutionalAvg: '--',
             currentPeriod: `${score.toFixed(1)}%`,
             target: 'Zero',
             variance: `${(score - 100).toFixed(1)}%`,
             trend: (score >= 90 ? '↑' : '↓') as '↑' | '↓' | '→',
             provAvg: '90%',
             contribution: `${percentagePoints.toFixed(1)}/20pp ${score >= 90 ? '▲' : '▼'}`
           };
         }
         return metric;
       });
     }

    // Recalculate overall score based on updated parameters
    const overallScore = Math.round(
      updatedData.parameters.reduce((sum, param) => {
        const score = parseFloat(param.userLevelAvg.replace('%', ''));
        return sum + (isNaN(score) ? 0 : score);
      }, 0) / updatedData.parameters.length
    );

    // Recalculate overall institutional average
    const overallInstAvg = Math.round(
      updatedData.parameters.reduce((sum, param) => {
        const score = parseFloat(param.institutionalAvg.replace('%', ''));
        return sum + (isNaN(score) ? 0 : score);
      }, 0) / updatedData.parameters.length
    );

    return {
      ...updatedData,
      keyMetrics,
      overallScore,
      overallInstAvg
    };
  }, [staffAdequacyData, productivityAchievementData, vacancyImpactData, volumeAchievementData, loanPortfolioLoadData, cashPositionData, aboveThresholdRiskData, belowThresholdRiskData, approvedExceptionRatioData]);

  return (
    <DashboardBase
      title="Branch Manager Dashboard"
      subtitle="Real-time branch performance and operations overview"
      userTier={userTier}
    >
      {/* Institutional Health Summary - Landing Page View */}
      <InstitutionalHealthSummary
        userLevel="branch"
        userLevelLabel="Branch View"
        parameters={summaryData.parameters}
        keyMetrics={summaryData.keyMetrics}
        recentActivities={summaryData.recentActivities}
        overallScore={summaryData.overallScore}
        overallInstAvg={summaryData.overallInstAvg}
        overallTarget={summaryData.overallTarget}
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
         cashPositionData={cashPositionData}
         aboveThresholdRiskData={aboveThresholdRiskData}
         belowThresholdRiskData={belowThresholdRiskData}
         approvedExceptionRatioData={approvedExceptionRatioData}
         isLoading={isLoading || isKpiLoading || isStaffAdequacyLoading || isProductivityLoading || isVacancyLoading || isVolumeLoading || isLoanPortfolioLoading || isCollectionEfficiencyLoading || isEfficiencyRatioLoading || isGrowthTrajectoryLoading || isLongTermDelinquencyLoading || isMonth1DefaultPerformanceLoading || isMonth3RecoveryAchievementsLoading || isPortfolioQualityLoading || isProductDiversificationLoading || isProductRiskScoreLoading || isRollRateControlLoading || isYieldAchievementsLoading || isCashPositionLoading || isAboveThresholdRiskLoading || isBelowThresholdRiskLoading || isApprovedExceptionRatioLoading}
       />


      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* KPI Cards with expand functionality */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Month-1 Default Rate"
            value={isLoading ? 'Loading...' : month1DefaultRate?.current_period.formatted_rate || '0.0%'}
            change={isLoading ? 'Loading...' : month1DefaultRate?.current_period.formatted_change || '0.0% from last month'}
            changeType={month1DefaultRate?.current_period.trend_direction === 'improving' ? 'positive' : 'negative'}
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Collections Rate"
            value={isLoading ? 'Loading...' : collectionRate?.current_period.formatted_rate || '0.0%'}
            change={isLoading ? 'Loading...' : collectionRate?.trend.formatted_change || '0.0% from target'}
            changeType={collectionRate?.trend.direction === 'improving' ? 'positive' : 'negative'}
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Active Loans"
            value={isLoading ? 'Loading...' : activeLoans?.current_period.formatted_count || '0'}
            change={isLoading ? 'Loading...' : activeLoans?.current_period.formatted_weekly_change || '0 this week'}
            changeType={activeLoans?.current_period.trend_direction === 'growth' ? 'positive' : 'neutral'}
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Total Staff"
            value={isLoading ? 'Loading...' : `${branchStats?.total_staff ?? 0}`}
            change={isLoading ? 'Loading...' : `${branchStats?.staff_on_leave ?? 0} on leave`}
            changeType={(branchStats?.staff_on_leave ?? 0) > 0 ? 'neutral' : 'positive'}
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
        </div>
        

        {/* Collections Waterfall */}
        <div className="col-span-12">
          <CollapsibleCard title="Collections Waterfall" defaultExpanded={true}>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Loading collections waterfall data...</p>
              </div>
            ) : collectionWaterfall ? (
              <div className="grid grid-cols-5 gap-4 text-center">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Due</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{collectionWaterfall.summary.due.formatted}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400">Collected</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{collectionWaterfall.summary.collected.formatted}</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">Partial</p>
                  <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{collectionWaterfall.summary.partial.formatted}</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">Overdue</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">{collectionWaterfall.summary.overdue.formatted}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Compliance</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{collectionWaterfall.summary.compliance.formatted}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No collections waterfall data available</p>
              </div>
            )}
          </CollapsibleCard>
        </div>
      </div>
    </DashboardBase>
  );
}
