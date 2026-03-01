'use client';

import React, { useState } from 'react';
import { DashboardBase, KPICard, AlertCard, CollapsibleCard } from './DashboardBase';
import { HeadlineParameterCard } from './HeadlineParameterCard';
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

  // Mock data for branch drill-down
  const mockConsultants = Array.from({length: 8}, (_, i) => ({
    id: i + 1,
    name: `Consultant ${i + 1}`,
    performance: (70 + Math.random() * 30).toFixed(2),
    defaultRate: (2 + Math.random() * 5).toFixed(2),
  }));

  const mockTransactions = (consultantId: number) => Array.from({length: 15}, (_, i) => ({
    id: i + 1,
    amount: (1000 + Math.random() * 9000).toFixed(2),
    status: ['Active', 'Defaulted', 'Recovered'][Math.floor(Math.random() * 3)],
  }));

  // Render functions
  const renderConsultants = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {mockConsultants.map(consultant => (
        <div
          key={consultant.id}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md"
          onClick={() => {
            setSelectedConsultant(consultant.id);
            setDrillView('transactions');
          }}
        >
          <h3 className="font-bold">{consultant.name}</h3>
          <p>Performance: {consultant.performance}%</p>
          <p>Default Rate: {consultant.defaultRate}%</p>
        </div>
      ))}
    </div>
  );

  const renderTransactions = () => {
    if (!selectedConsultant) return null;
    const transactions = mockTransactions(selectedConsultant);
    return (
      <div>
        <button onClick={() => setDrillView('consultants')} className="mb-4 text-blue-500">Back to Consultants</button>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th>ID</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.id}</td>
                  <td>K{transaction.amount}</td>
                  <td>{transaction.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

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

      {/* Five Headline Institutional Parameters as individual cards */}
      <div className="col-span-12 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {headlineParameters.map((param, index) => (
            <HeadlineParameterCard key={index} {...param} />
          ))}
        </div>
      </div>

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


        {/* Alerts Section */}
        <div className="col-span-12 lg:col-span-8">
          <CollapsibleCard title="Priority Actions" defaultExpanded={true}>
            <div className="space-y-4">
              <AlertCard
                title="Review Required - High Default Risk"
                message="5 loans showing early warning signs. Review action plans due today."
                type="warning"
                action={
                  <button className="text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:underline">
                    Review Now →
                  </button>
                }
                expandable={true}
                expandedContent={
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-300">Clients: #4521, #4523, #4525, #4527, #4529</p>
                    <p className="text-gray-600 dark:text-gray-300">Total at Risk: K125,000</p>
                  </div>
                }
              />
              <AlertCard
                title="Monthly Report Due"
                message="Submit monthly performance report by EOD tomorrow."
                type="info"
                action={
                  <button className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline">
                    Start Report →
                  </button>
                }
                expandable={true}
                expandedContent={
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-300">Template: Monthly Performance Report</p>
                    <p className="text-gray-600 dark:text-gray-300">Due: Tomorrow, 5:00 PM</p>
                  </div>
                }
              />
            </div>
          </CollapsibleCard>
        </div>

        {/* Quick Stats */}
        <div className="col-span-12 lg:col-span-4">
          <CollapsibleCard title="Quick Stats" defaultExpanded={true}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Pending Approvals</span>
                <span className="font-semibold text-gray-900 dark:text-white">{isLoading ? '...' : branchStats?.pending_loans ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Active Clients</span>
                <span className="font-semibold text-gray-900 dark:text-white">{isLoading ? '...' : branchStats?.active_clients ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Open Tickets</span>
                <span className="font-semibold text-gray-900 dark:text-white">{isLoading ? '...' : branchStats?.open_tickets ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Pending Transactions</span>
                <span className="font-semibold text-gray-900 dark:text-white">{isLoading ? '...' : branchStats?.pending_transactions ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Disbursed Loans</span>
                <span className="font-semibold text-gray-900 dark:text-white">{isLoading ? '...' : branchStats?.disbursed_loans ?? 0}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Loan Portfolio</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {isLoading ? '...' : `ZMW ${Number(branchStats?.loan_portfolio ?? 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
                </span>
              </div>
            </div>
          </CollapsibleCard>
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

        {/* Team Overview */}
        <div className="col-span-12 lg:col-span-6">
          <CollapsibleCard title="Team Performance" defaultExpanded={true}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Staff</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Score</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rating</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Change</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No team performance data available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CollapsibleCard>
        </div>

        {/* Recent Activity */}
        <div className="col-span-12 lg:col-span-6">
          <CollapsibleCard title="Recent Activity" defaultExpanded={true}>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Loan Approved - Client #4521</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Collection Follow-up Scheduled</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Default Risk Alert - Client #3892</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Yesterday</p>
                </div>
              </div>
            </div>
          </CollapsibleCard>
        </div>

        {/* Branch Drill-down */}
        <div className="col-span-12">
          <CollapsibleCard title="Branch Drill-down">
            {drillView === 'consultants' && renderConsultants()}
            {drillView === 'transactions' && renderTransactions()}
          </CollapsibleCard>
        </div>
      </div>
    </DashboardBase>
  );
}
