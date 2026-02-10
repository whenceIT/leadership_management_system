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

export default function POADashboard() {
  const jobInfo = {
    department: "Performance Operations",
    reportsTo: "GOM / Performance Manager",
    directReports: "None (Individual Contributor)",
    location: "Headquarters"
  };

  const jobPurpose = "The Performance Operations Administrator (POA) is the strategic data analyst and performance guardian of the institution, ensuring accountability, accuracy, and continuous improvement across all operations. This role directly supports the $100M valuation target by enabling data-driven decision-making and identifying value-creation opportunities.";

  const kpis = [
    { name: "Audit Finding Resolution", baseline: "14 days", target: "≤7 days", weight: "25%" },
    { name: "KPIs Achieving Target", baseline: "85%", target: "≥95%", weight: "25%" },
    { name: "Data-Driven Insights Generated", baseline: "2/month", target: "≥5/month", weight: "20%" },
    { name: "Staff Trained in Performance Management", baseline: "0", target: "100%", weight: "15%" },
    { name: "Action Plan Completion Rate", baseline: "78%", target: "≥95%", weight: "15%" }
  ];

  return (
    <DashboardBase
      title="Performance Operations Administrator Dashboard"
      subtitle="Performance tracking, data analysis, and accountability oversight"
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
            title="Audit Findings Resolved"
            value="92%"
            change="+12% improvement"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="KPIs Achieving Target"
            value="89%"
            change="+4% improvement"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Insights Generated"
            value="6"
            change="This month"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Action Plan Completion"
            value="85%"
            change="+7% improvement"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
          />
        </div>

        {/* Performance Overview */}
        <div className="col-span-12">
          <CollapsibleCard title="Performance Overview">
            <div className="grid grid-cols-5 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">245</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Reviews</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">18</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Actions</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">32</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue Actions</p>
                <p className="text-2xl font-bold text-red-600 mt-1">5</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Resolution (days)</p>
                <p className="text-2xl font-bold text-green-600 mt-1">8</p>
              </div>
            </div>
          </CollapsibleCard>
        </div>

        {/* Alerts */}
        <div className="col-span-12 lg:col-span-8">
          <CollapsibleCard title="Performance Items">
            <div className="space-y-4">
              <AlertCard
                title="Overdue Action Plans"
                message="5 action plans are overdue and require immediate attention."
                type="warning"
                action={
                  <button className="text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:underline">
                    Review Overdue Items →
                  </button>
                }
              />
              <AlertCard
                title="Monthly Performance Report Due"
                message="Submit monthly performance analysis report by EOW."
                type="info"
                action={
                  <button className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline">
                    Start Report →
                  </button>
                }
              />
            </div>
          </CollapsibleCard>
        </div>

        {/* Quick Stats */}
        <div className="col-span-12 lg:col-span-4">
          <CollapsibleCard title="Quick Stats">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Audits Completed</span>
                <span className="font-semibold text-gray-900 dark:text-white">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Data Reports</span>
                <span className="font-semibold text-gray-900 dark:text-white">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Training Sessions</span>
                <span className="font-semibold text-gray-900 dark:text-white">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Compliance Score</span>
                <span className="font-semibold text-green-600">94%</span>
              </div>
            </div>
          </CollapsibleCard>
        </div>
      </div>
    </DashboardBase>
  );
}
