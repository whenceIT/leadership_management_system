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

  // Custom summary data with dynamic Staff Adequacy Score, Productivity Achievement, Vacancy Impact, and Volume Achievement
  const summaryData = useMemo(() => {
    const baseData = getInstitutionalSummaryData('branch', 'Branch View');
    let updatedData = baseData;

    // Update the Staff Adequacy Score KPI with real data
    if (staffAdequacyData) {
      // Update parameters
      const updatedParameters = updatedData.parameters.map(param => {
        if (param.name === 'Branch Structure & Staffing Index') {
          // Calculate new values based on API response
          const variance = staffAdequacyData.normalized_score - staffAdequacyData.target;
          const trend = variance >= 0 ? '↑' : '↓';
          const status = staffAdequacyData.normalized_score >= 90 ? 'good' : staffAdequacyData.normalized_score >= 70 ? 'warning' : 'critical';
          
          return {
            ...param,
            institutionalAvg: '92%', // Hardcoded institutional average
            userLevelAvg: `${staffAdequacyData.normalized_score}%`,
            variance: `${variance}%`,
            varianceAbs: `${variance}pp`,
            trend: trend as '↑' | '↓' | '→',
            status: status as 'good' | 'warning' | 'critical'
          };
        }
        return param;
      });

      // Update key metrics
      const updatedKeyMetrics = updatedData.keyMetrics.map(metric => {
        if (metric.parameter === 'Staff Adequacy Score') {
          return {
            ...metric,
            institutionalAvg: '92%',
            currentPeriod: `${staffAdequacyData.normalized_score}%`,
            target: '100%',
            variance: `${staffAdequacyData.normalized_score - staffAdequacyData.target}%`,
            trend: (staffAdequacyData.normalized_score >= staffAdequacyData.target ? '↑' : '↓') as '↑' | '↓' | '→',
            provAvg: '90%',
            contribution: `${staffAdequacyData.percentage_point}/25pp ${staffAdequacyData.normalized_score >= staffAdequacyData.target ? '▲' : '▼'}`
          };
        }
        return metric;
      });

      updatedData = {
        ...updatedData,
        parameters: updatedParameters,
        keyMetrics: updatedKeyMetrics
      };
    }

    // Update the Productivity Achievement KPI with real data
    if (productivityAchievementData) {
      const normalizedScore = parseFloat(productivityAchievementData.normalized_score);
      const percentagePoint = parseFloat(productivityAchievementData.percentage_point);
      const weight = parseFloat(productivityAchievementData.weight.replace('%', ''));
      
      // Update parameters
      const updatedParameters = updatedData.parameters.map(param => {
        if (param.name === 'Loan Consultant Performance Index') {
          // Calculate new values based on API response
          const variance = normalizedScore - productivityAchievementData.target;
          const trend = variance >= 0 ? '↑' : '↓';
          const status = normalizedScore >= 90 ? 'good' : normalizedScore >= 70 ? 'warning' : 'critical';
          
          return {
            ...param,
            institutionalAvg: '95%', // Hardcoded institutional average
            userLevelAvg: `${normalizedScore}%`,
            variance: `${variance}%`,
            varianceAbs: `${variance}pp`,
            trend: trend as '↑' | '↓' | '→',
            status: status as 'good' | 'warning' | 'critical'
          };
        }
        return param;
      });

      // Update key metrics
      const updatedKeyMetrics = updatedData.keyMetrics.map(metric => {
        if (metric.parameter === 'Productivity Achievement') {
          return {
            ...metric,
            institutionalAvg: '95%',
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

      updatedData = {
        ...updatedData,
        parameters: updatedParameters,
        keyMetrics: updatedKeyMetrics
      };
    }

    // Update the Vacancy Impact KPI with real data
    if (vacancyImpactData) {
      const normalizedScore = vacancyImpactData.normalized_score * 100; // Convert to percentage
      const percentagePoint = vacancyImpactData.percentage_point;
      const weight = parseFloat(vacancyImpactData.weight.replace('%', ''));
      const variance = normalizedScore - vacancyImpactData.target;
      
      // Update parameters
      const updatedParameters = updatedData.parameters.map(param => {
        if (param.name === 'Branch Structure & Staffing Index') {
          // Calculate new values based on API response
          const trend = variance >= 0 ? '↑' : '↓';
          const status = normalizedScore >= 90 ? 'good' : normalizedScore >= 70 ? 'warning' : 'critical';
          
          return {
            ...param,
            institutionalAvg: '94%', // Hardcoded institutional average
            userLevelAvg: `${normalizedScore.toFixed(1)}%`,
            variance: `${variance.toFixed(1)}%`,
            varianceAbs: `${variance.toFixed(1)}pp`,
            trend: trend as '↑' | '↓' | '→',
            status: status as 'good' | 'warning' | 'critical'
          };
        }
        return param;
      });

      // Update key metrics
      const updatedKeyMetrics = updatedData.keyMetrics.map(metric => {
        if (metric.parameter === 'Vacancy Impact') {
          return {
            ...metric,
            institutionalAvg: '94%',
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

      updatedData = {
        ...updatedData,
        parameters: updatedParameters,
        keyMetrics: updatedKeyMetrics
      };
    }

    // Update the Volume Achievement KPI with real data
    if (volumeAchievementData) {
      const normalizedScore = parseFloat(volumeAchievementData.normalized_score);
      const percentagePoint = parseFloat(volumeAchievementData.percentage_point);
      const weight = parseFloat(volumeAchievementData.weight.replace('%', ''));
      const branchTarget = parseFloat(volumeAchievementData.branch_target);
      const totalDisbursement = parseFloat(volumeAchievementData.total_disbursement);
      const variance = normalizedScore - 100; // Target is 100% for normalized score
      
      // Update parameters
      const updatedParameters = updatedData.parameters.map(param => {
        if (param.name === 'Loan Consultant Performance Index') {
          // Calculate new values based on API response
          const trend = normalizedScore >= 100 ? '↑' : '↓';
          const status = normalizedScore >= 90 ? 'good' : normalizedScore >= 70 ? 'warning' : 'critical';
          
          return {
            ...param,
            institutionalAvg: '85%', // Hardcoded institutional average
            userLevelAvg: `${normalizedScore.toFixed(1)}%`,
            variance: `${variance.toFixed(1)}%`,
            varianceAbs: `${Math.abs(variance).toFixed(1)}pp`,
            trend: trend as '↑' | '↓' | '→',
            status: status as 'good' | 'warning' | 'critical'
          };
        }
        return param;
      });

      // Update key metrics
      const updatedKeyMetrics = updatedData.keyMetrics.map(metric => {
        if (metric.parameter === 'Volume Achievement') {
          return {
            ...metric,
            institutionalAvg: '85%',
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

      updatedData = {
        ...updatedData,
        parameters: updatedParameters,
        keyMetrics: updatedKeyMetrics
      };
    }

    // Update the Portfolio Load Balance KPI with real data
    if (loanPortfolioLoadData) {
      const normalizedScore = parseFloat(loanPortfolioLoadData.score);
      const percentagePoint = loanPortfolioLoadData.percentage_point;
      const weight = parseFloat(loanPortfolioLoadData.weight.replace('%', ''));
      const variance = normalizedScore - loanPortfolioLoadData.target;
      
      // Update parameters
      const updatedParameters = updatedData.parameters.map(param => {
        if (param.name === 'Branch Structure & Staffing Index') {
          // Calculate new values based on API response
          const trend = normalizedScore >= loanPortfolioLoadData.target ? '↑' : '↓';
          const status = normalizedScore >= 90 ? 'good' : normalizedScore >= 70 ? 'warning' : 'critical';
          
          return {
            ...param,
            institutionalAvg: '96%', // Hardcoded institutional average
            userLevelAvg: `${normalizedScore.toFixed(1)}%`,
            variance: `${variance.toFixed(1)}%`,
            varianceAbs: `${Math.abs(variance).toFixed(1)}pp`,
            trend: trend as '↑' | '↓' | '→',
            status: status as 'good' | 'warning' | 'critical'
          };
        }
        return param;
      });

      // Update key metrics
      const updatedKeyMetrics = updatedData.keyMetrics.map(metric => {
        if (metric.parameter === 'Portfolio Load Balance') {
          return {
            ...metric,
            institutionalAvg: '96%',
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

      updatedData = {
        ...updatedData,
        parameters: updatedParameters,
        keyMetrics: updatedKeyMetrics
      };
    }

    return updatedData;
  }, [staffAdequacyData, productivityAchievementData, vacancyImpactData, volumeAchievementData, loanPortfolioLoadData]);

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
