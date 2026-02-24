'use client';

import React from 'react';
import { DashboardBase, KPICard, AlertCard, SectionCard, QuickInfoBar, JobPurpose, KPIMetricsCard, CollapsibleCard } from './DashboardBase';
import { roleCardsData } from '@/data/role-cards-data';
import { useUserKPI } from '@/hooks/useUserKPI';

interface DistrictManagerDashboardProps {
  position?: string;
  userTier?: string;
}

export default function DistrictManagerDashboard({ position = 'District Manager', userTier }: DistrictManagerDashboardProps) {
  const roleCard = roleCardsData[position] || roleCardsData['District Manager'] || {
    department: 'TBD',
    reportsTo: 'TBD',
    directReports: 'TBD',
    location: 'TBD',
    jobPurpose: 'TBD',
    kpis: []
  };

  // Get user-specific KPI data
  const { processedKPIs, isLoading: isKpiLoading, error: kpiError } = useUserKPI();

  // Build KPIs from user-specific KPI data
  const kpis = processedKPIs.length > 0 ? processedKPIs.map(kpi => ({
    name: kpi.name,
    baseline: kpi.baseline.toString(),
    target: kpi.target.toString(),
    weight: `${kpi.weight}%`
  })) : [];

  return (
    <DashboardBase
      title={roleCard.title}
      subtitle="Cross-branch performance and district-wide oversight"
      userTier={userTier}
    >
      {/* Quick Info Bar */}
      <QuickInfoBar
        department={roleCard.department}
        reportsTo={roleCard.reportsTo}
        directReports={roleCard.directReports}
        location={roleCard.location}
      />

      {/* Job Purpose */}
      <JobPurpose purpose={roleCard.jobPurpose} />

      {/* KPI Metrics from API */}
      <KPIMetricsCard kpis={kpis} title="Key Performance Indicators (KPIs)" />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* KPI Cards with expand functionality */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="District Default Rate"
            value="2.8%"
            change="-0.3% improvement"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            expandable={true}
            expandedContent={
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">Target: ≤2.5%</p>
                <p className="text-yellow-600 dark:text-yellow-400">⚠️ Slightly Above Target</p>
              </div>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="District Recovery Rate"
            value="95.2%"
            change="+0.8% above target"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            expandable={true}
            expandedContent={
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">Target: ≥94%</p>
                <p className="text-green-600 dark:text-green-400">✅ Exceeding Target</p>
              </div>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Active Branches"
            value="4"
            change="All operational"
            changeType="neutral"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            expandable={true}
            expandedContent={
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">Branches: A, B, C, D</p>
                <p className="text-gray-600 dark:text-gray-300">Staff: 45 total</p>
              </div>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Issue Resolution Time"
            value="2.3 days"
            change="-0.5 days faster"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            expandable={true}
            expandedContent={
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">Target: ≤3 days</p>
                <p className="text-green-600 dark:text-green-400">✅ Below Target</p>
              </div>
            }
          />
        </div>

        {/* Cross-Branch Comparison */}
        <div className="col-span-12">
          <CollapsibleCard title="Cross-Branch Performance Comparison" action={<button className="text-sm text-brand-500 hover:underline">View Full Report</button>} defaultExpanded={true}>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Branch A</p>
                <p className="text-2xl font-bold text-green-600 mt-1">2.1%</p>
                <p className="text-xs text-gray-500">Default Rate</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Branch B</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">3.2%</p>
                <p className="text-xs text-gray-500">Default Rate</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Branch C</p>
                <p className="text-2xl font-bold text-green-600 mt-1">2.5%</p>
                <p className="text-xs text-gray-500">Default Rate</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Branch D</p>
                <p className="text-2xl font-bold text-green-600 mt-1">1.9%</p>
                <p className="text-xs text-gray-500">Default Rate</p>
              </div>
            </div>
          </CollapsibleCard>
        </div>

        {/* Alerts */}
        <div className="col-span-12 lg:col-span-8">
          <CollapsibleCard title="Priority Alerts" defaultExpanded={true}>
            <div className="space-y-4">
              <AlertCard
                title="Branch B Performance Review Needed"
                message="Branch B showing elevated Month-1 defaults. Intervention recommended."
                type="warning"
                action={
                  <button className="text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:underline">
                    Schedule Review →
                  </button>
                }
                expandable={true}
                expandedContent={
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-300">Current Default Rate: 3.2%</p>
                    <p className="text-gray-600 dark:text-gray-300">Target: ≤2.5%</p>
                    <p className="text-gray-600 dark:text-gray-300">Gap: +0.7% above target</p>
                  </div>
                }
              />
              <AlertCard
                title="Talent Pipeline Update"
                message="2 promotion-ready candidates identified across branches."
                type="success"
                action={
                  <button className="text-sm font-medium text-green-700 dark:text-green-300 hover:underline">
                    View Candidates →
                  </button>
                }
                expandable={true}
                expandedContent={
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-300">Candidate 1: Branch A LC</p>
                    <p className="text-gray-600 dark:text-gray-300">Candidate 2: Branch C LC</p>
                  </div>
                }
              />
            </div>
          </CollapsibleCard>
        </div>

        {/* Branch Health */}
        <div className="col-span-12 lg:col-span-4">
          <CollapsibleCard title="Branch Health Status" defaultExpanded={true}>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Branch A</span>
                <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">Healthy</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Branch B</span>
                <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full">Attention</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Branch C</span>
                <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">Healthy</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Branch D</span>
                <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">Healthy</span>
              </div>
            </div>
          </CollapsibleCard>
        </div>
      </div>
    </DashboardBase>
  );
}
