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

export default function MotorVehiclesManagerDashboard() {
  const jobInfo = {
    department: "Operations - Fleet Management",
    reportsTo: "GOM / Operations Director",
    directReports: "Fleet Officers, Drivers",
    location: "Headquarters"
  };

  const jobPurpose = "The Motor Vehicles Manager serves as the strategic guardian of institutional mobility and collateral assets, ensuring fleet efficiency and asset protection. This role supports the institution's $100M valuation by optimizing transportation costs, ensuring vehicle availability, and protecting collateral assets.";

  const kpis = [
    { name: "Fleet Utilization Rate", baseline: "65%", target: "≥85%", weight: "25%" },
    { name: "Vehicle Uptime", baseline: "90%", target: "≥95%", weight: "25%" },
    { name: "Cost per km", baseline: "K8/km", target: "≤K6/km", weight: "20%" },
    { name: "Accident Rate", baseline: "2/quarter", target: "0", weight: "15%" },
    { name: "Collateral Value Preserved", baseline: "K8M", target: "≥K10M", weight: "15%" }
  ];

  return (
    <DashboardBase
      title="Motor Vehicles Manager Dashboard"
      subtitle="Fleet management, collateral assets, and transportation operations"
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
            title="Fleet Utilization"
            value="82%"
            change="+17% improvement"
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
            title="Vehicle Uptime"
            value="96%"
            change="+6% improvement"
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
            title="Cost per km"
            value="K5.50"
            change="-K2.50 improvement"
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
            title="Collateral Value"
            value="K11.5M"
            change="+K3.5M protected"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />
        </div>

        {/* Fleet Overview */}
        <div className="col-span-12">
          <CollapsibleCard title="Fleet Overview">
            <div className="grid grid-cols-5 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">28</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Fleet</p>
                <p className="text-2xl font-bold text-green-600 mt-1">25</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Under Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">2</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Collateral Vehicles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">12</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total km (MTH)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">125K</p>
              </div>
            </div>
          </CollapsibleCard>
        </div>

        {/* Alerts */}
        <div className="col-span-12 lg:col-span-8">
          <CollapsibleCard title="Fleet Items">
            <div className="space-y-4">
              <AlertCard
                title="Maintenance Required"
                message="2 vehicles due for scheduled maintenance."
                type="warning"
                action={
                  <button className="text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:underline">
                    Schedule Service →
                  </button>
                }
              />
              <AlertCard
                title="Insurance Renewal Due"
                message="5 vehicle insurance policies expiring next month."
                type="info"
                action={
                  <button className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline">
                    Renew Insurance →
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
                <span className="text-gray-500 dark:text-gray-400">Fuel Efficiency</span>
                <span className="font-semibold text-gray-900 dark:text-white">12 km/L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Accidents (Quarter)</span>
                <span className="font-semibold text-green-600">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Pending Trip Requests</span>
                <span className="font-semibold text-gray-900 dark:text-white">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Fleet Cost (MTH)</span>
                <span className="font-semibold text-gray-900 dark:text-white">K185K</span>
              </div>
            </div>
          </CollapsibleCard>
        </div>
      </div>
    </DashboardBase>
  );
}
