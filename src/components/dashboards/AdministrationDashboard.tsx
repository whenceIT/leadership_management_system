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

export default function AdministrationDashboard() {
  const jobInfo = {
    department: "Administration",
    reportsTo: "Administration Director",
    directReports: "GOAs, Secretary, Support Staff",
    location: "Headquarters"
  };

  const jobPurpose = "The Administration role serves as the operational backbone of the institution, ensuring seamless day-to-day administrative functions. This role supports the institution's $100M valuation by enabling operational efficiency, maintaining regulatory compliance, and creating a productive work environment.";

  const kpis = [
    { name: "Staff Turnover Rate", baseline: "15%", target: "≤10%", weight: "25%" },
    { name: "Staff Engagement Score", baseline: "65%", target: "≥80%", weight: "25%" },
    { name: "HR Compliance Rate", baseline: "90%", target: "100%", weight: "20%" },
    { name: "Payroll Accuracy", baseline: "95%", target: "100%", weight: "20%" },
    { name: "Training Completion Rate", baseline: "75%", target: "≥95%", weight: "10%" }
  ];

  return (
    <DashboardBase
      title="Administration Dashboard"
      subtitle="HR management, staff welfare, and administrative operations"
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
            title="Staff Turnover"
            value="8%"
            change="-7% improvement"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Staff Engagement"
            value="78%"
            change="+13% improvement"
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
            title="HR Compliance"
            value="98%"
            change="+8% improvement"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Payroll Accuracy"
            value="99.8%"
            change="+4.8% improvement"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* HR Overview */}
        <div className="col-span-12">
          <CollapsibleCard title="HR Overview">
            <div className="grid grid-cols-5 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">245</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Positions</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">8</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Staff on Leave</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">12</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Training Due</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">28</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Tenure (months)</p>
                <p className="text-2xl font-bold text-green-600 mt-1">24</p>
              </div>
            </div>
          </CollapsibleCard>
        </div>

        {/* Alerts */}
        <div className="col-span-12 lg:col-span-8">
          <CollapsibleCard title="HR Items">
            <div className="space-y-4">
              <AlertCard
                title="Critical Position Vacancy"
                message="Branch Manager position vacant for 18 days. Immediate action required."
                type="warning"
                action={
                  <button className="text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:underline">
                    Review Recruitment →
                  </button>
                }
              />
              <AlertCard
                title="Performance Reviews Due"
                message="15 staff performance reviews are overdue."
                type="info"
                action={
                  <button className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline">
                    Schedule Reviews →
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
                <span className="text-gray-500 dark:text-gray-400">New Hires (Month)</span>
                <span className="font-semibold text-gray-900 dark:text-white">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Departures (Month)</span>
                <span className="font-semibold text-gray-900 dark:text-white">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Promotions (Month)</span>
                <span className="font-semibold text-gray-900 dark:text-white">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Training Complete</span>
                <span className="font-semibold text-green-600">89%</span>
              </div>
            </div>
          </CollapsibleCard>
        </div>
      </div>
    </DashboardBase>
  );
}
