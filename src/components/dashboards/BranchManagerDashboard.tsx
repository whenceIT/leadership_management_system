'use client';

import React, { useState } from 'react';
import { DashboardBase, KPICard, AlertCard, CollapsibleCard } from './DashboardBase';
import { getHeadlineParameters } from '@/data/headline-parameters-mock';
import { InstitutionalHealthSummary, getInstitutionalSummaryData } from './InstitutionalHealthSummary';
import { useBranchManagerMetrics } from '@/hooks/useBranchManagerMetrics';
import { useUserKPI } from '@/hooks/useUserKPI';

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


  const summaryData = getInstitutionalSummaryData('branch', 'Branch View');

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
        recentActivities={summaryData.recentActivities}
        overallScore={summaryData.overallScore}
        overallInstAvg={summaryData.overallInstAvg}
        overallTarget={summaryData.overallTarget}
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
