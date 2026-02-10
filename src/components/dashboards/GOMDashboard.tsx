'use client';

import React from 'react';
import { 
  DashboardBase, 
  KPICard, 
  AlertCard, 
  SectionCard, 
  QuickInfoBar,
  JobPurpose,
  KPIMetricsCard,
  CollapsibleCard
} from './DashboardBase';

export default function GOMDashboard() {
  const jobInfo = {
    department: "Operations",
    reportsTo: "Provincial Manager",
    directReports: "GOAs, Fleet Coordinators, Facilities Manager",
    location: "Headquarters"
  };

  const jobPurpose = "The General Operations Manager (GOM) is the strategic orchestrator of national operational excellence, driving innovation, efficiency, and growth across all branches. This role is value-creating, directly contributing to the institution's $100M valuation target through operational optimization and revenue enhancement initiatives.";

  const kpis = [
    { name: "Net Contribution Growth", baseline: "-", target: "+15% YoY", weight: "30%" },
    { name: "Operational Cost Reduction", baseline: "Baseline", target: "-10%", weight: "20%" },
    { name: "Net Promoter Score (NPS)", baseline: "35", target: "≥50", weight: "15%" },
    { name: "Branch Network Growth", baseline: "42 branches", target: "+5 branches", weight: "20%" },
    { name: "Staff Engagement Score", baseline: "65%", target: "≥80%", weight: "15%" }
  ];

  return (
    <DashboardBase
      title="General Operations Manager Dashboard"
      subtitle="Operations management, strategic optimization, and national oversight"
    >
      <QuickInfoBar {...jobInfo} />
      <JobPurpose purpose={jobPurpose} />

      <KPIMetricsCard 
        title="Key Performance Indicators"
        kpis={kpis}
      />

      <div className="grid grid-cols-12 gap-4 md:gap-6 mt-6">
        {/* KPI Cards */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Net Contribution"
            value="K3.2M"
            change="+18% YoY"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Active Branches"
            value="42"
            change="3 new this year"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="NPS Score"
            value="42"
            change="+7 improvement"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Staff Engagement"
            value="72%"
            change="+7% improvement"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
        </div>

        {/* Branch Network Overview */}
        <div className="col-span-12">
          <CollapsibleCard title="Branch Network Performance">
            <div className="grid grid-cols-6 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Branches</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">42</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm font-medium text-green-600">High Performance</p>
                <p className="text-2xl font-bold text-green-600 mt-1">18</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-blue-600">On Track</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">15</p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm font-medium text-yellow-600">Needs Focus</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">7</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm font-medium text-red-600">At Risk</p>
                <p className="text-2xl font-bold text-red-600 mt-1">2</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">New This Year</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">3</p>
              </div>
            </div>
          </CollapsibleCard>
        </div>

        {/* Strategic Alerts */}
        <div className="col-span-12 lg:col-span-8">
          <CollapsibleCard title="Strategic Priority Items">
            <div className="space-y-4">
              <AlertCard
                title="Branch Expansion Opportunity"
                message="New market identified in Copperbelt province. Feasibility study recommended."
                type="info"
                action={
                  <button className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline">
                    Review Opportunity →
                  </button>
                }
              />
              <AlertCard
                title="At-Risk Branches Require Attention"
                message="Branches 23 and 31 showing concerning trends. Immediate review needed."
                type="warning"
                action={
                  <button className="text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:underline">
                    Review Action Plans →
                  </button>
                }
              />
            </div>
          </CollapsibleCard>
        </div>

        {/* Operations Health */}
        <div className="col-span-12 lg:col-span-4">
          <CollapsibleCard title="Operations Health Indicators">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">GOA Performance</span>
                <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">On Track</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Fleet Efficiency</span>
                <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full">Improving</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Facilities Status</span>
                <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">Good</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Compliance</span>
                <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">98%</span>
              </div>
            </div>
          </CollapsibleCard>
        </div>
      </div>
    </DashboardBase>
  );
}
