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

export default function GOADashboard() {
  const jobInfo = {
    department: "Administration",
    reportsTo: "Manager Administration",
    directReports: "General Staff, Fleet & Facilities Coordinators",
    location: "Headquarters"
  };

  const jobPurpose = "The General Operations Administrator (GOA) is the operational backbone of the institution, ensuring efficiency, resource coordination, and compliance across all branches. This role is value-preserving and value-enabling, directly supporting the institution's $100M valuation target by minimizing operational losses and optimizing resource utilization.";

  const kpis = [
    { name: "Recruitment Vacancy Days", baseline: "21 days", target: "≤7 days", weight: "25%" },
    { name: "Fleet Downtime", baseline: "8%", target: "≤5%", weight: "15%" },
    { name: "BMOS Compliance Rate", baseline: "90%", target: "100%", weight: "20%" },
    { name: "Statutory Submission Timeliness", baseline: "95%", target: "100%", weight: "20%" },
    { name: "Internet Uptime", baseline: "95%", target: "≥98%", weight: "10%" },
    { name: "Monthly Value Preserved", baseline: "K120K", target: "≥K150K", weight: "30%" }
  ];

  return (
    <DashboardBase
      title="General Operations Administrator Dashboard"
      subtitle="Daily operations administration and branch coordination"
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
            title="Recruitment Vacancy Days"
            value="12 days"
            change="-9 days improvement"
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
            title="Fleet Downtime"
            value="4.2%"
            change="-3.8% improvement"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="BMOS Compliance"
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
            title="Value Preserved"
            value="K185K"
            change="Above target"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Operations Overview */}
        <div className="col-span-12">
          <CollapsibleCard title="Operations Metrics">
            <div className="grid grid-cols-5 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Branches</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">42</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fleet Vehicles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">28</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Vacancies</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">8</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Statutory</p>
                <p className="text-2xl font-bold text-green-600 mt-1">0</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Internet Issues</p>
                <p className="text-2xl font-bold text-green-600 mt-1">2</p>
              </div>
            </div>
          </CollapsibleCard>
        </div>

        {/* Alerts */}
        <div className="col-span-12 lg:col-span-8">
          <CollapsibleCard title="Operational Items">
            <div className="space-y-4">
              <AlertCard
                title="Urgent Recruitment Required"
                message="Branch 15 LC position vacant for 14 days. Immediate action needed."
                type="warning"
                action={
                  <button className="text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:underline">
                    Review Applications →
                  </button>
                }
              />
              <AlertCard
                title="Fleet Maintenance Due"
                message="3 vehicles scheduled for preventive maintenance."
                type="info"
                action={
                  <button className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline">
                    Schedule Maintenance →
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
                <span className="text-gray-500 dark:text-gray-400">Staff on Leave</span>
                <span className="font-semibold text-gray-900 dark:text-white">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Pending Training</span>
                <span className="font-semibold text-gray-900 dark:text-white">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Office Supplies Low</span>
                <span className="font-semibold text-yellow-600">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Compliance Score</span>
                <span className="font-semibold text-green-600">96%</span>
              </div>
            </div>
          </CollapsibleCard>
        </div>
      </div>
    </DashboardBase>
  );
}
