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

export default function DistrictRegionalManagerDashboard() {
  const jobInfo = {
    department: "Regional Operations & Strategic Leadership",
    reportsTo: "Provincial Manager",
    directReports: "District Managers (3-4 districts), Specialized Unit Managers",
    location: "Regional Headquarters"
  };

  const jobPurpose = "The District Regional Manager serves as the strategic growth catalyst for the region, balancing operational excellence with market expansion and portfolio quality. This role is value-creating, directly contributing to the institution's $100M valuation target through optimized regional performance and strategic market development.";

  const kpis = [
    { name: "Regional Net Contribution Growth", baseline: "-", target: "+20% YoY", weight: "25%" },
    { name: "Month-1 Default Rate", baseline: "4.5%", target: "≤3.5%", weight: "20%" },
    { name: "Collection Rate", baseline: "88%", target: "≥92%", weight: "20%" },
    { name: "District Manager Development", baseline: "-", target: "≥1 prom/yr", weight: "15%" },
    { name: "Cross-Selling Index", baseline: "1.2", target: "≥1.5", weight: "10%" },
    { name: "Regional Compliance Score", baseline: "92%", target: "≥98%", weight: "10%" }
  ];

  return (
    <DashboardBase
      title="District Regional Manager Dashboard"
      subtitle="Regional strategic oversight and cross-district optimization"
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
            title="Regional Net Contribution"
            value="K1.8M"
            change="+22% YoY"
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
            title="M1 Default Rate"
            value="3.2%"
            change="-1.3% improvement"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Active Districts"
            value="3"
            change="All operational"
            changeType="neutral"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Collection Rate"
            value="93.5%"
            change="+5.5% improvement"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* District Performance Overview */}
        <div className="col-span-12">
          <CollapsibleCard title="District Performance Overview">
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">District A</p>
                <p className="text-2xl font-bold text-green-600 mt-1">K720K</p>
                <p className="text-xs text-gray-500">Net Contribution</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">District B</p>
                <p className="text-2xl font-bold text-green-600 mt-1">K580K</p>
                <p className="text-xs text-gray-500">Net Contribution</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">District C</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">K500K</p>
                <p className="text-xs text-gray-500">Net Contribution</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Regional Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">K1.8M</p>
                <p className="text-xs text-gray-500">Combined</p>
              </div>
            </div>
          </CollapsibleCard>
        </div>

        {/* Strategic Alerts */}
        <div className="col-span-12 lg:col-span-8">
          <CollapsibleCard title="Regional Priority Items">
            <div className="space-y-4">
              <AlertCard
                title="District C Performance Review"
                message="District C requires strategic intervention. Consider resource reallocation."
                type="warning"
                action={
                  <button className="text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:underline">
                    Review Intervention Plan →
                  </button>
                }
              />
              <AlertCard
                title="New Market Opportunity"
                message="Expansion opportunity identified in rural areas of District A."
                type="info"
                action={
                  <button className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline">
                    Assess Opportunity →
                  </button>
                }
              />
            </div>
          </CollapsibleCard>
        </div>

        {/* Regional Health */}
        <div className="col-span-12 lg:col-span-4">
          <CollapsibleCard title="Regional Health Indicators">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">District A</span>
                <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">Excellent</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">District B</span>
                <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">Good</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">District C</span>
                <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full">Needs Focus</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Compliance</span>
                <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">98%</span>
              </div>
            </div>
          </CollapsibleCard>
        </div>
      </div>
    </DashboardBase>
  );
}
