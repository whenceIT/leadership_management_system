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

export default function ProvincialManagerDashboard() {
  const jobInfo = {
    department: "Senior Operations & Strategic Leadership",
    reportsTo: "Technical Director / Executive Committee",
    directReports: "District Managers (5+ districts), Specialized Unit Managers",
    location: "Provincial Headquarters"
  };

  const jobPurpose = "The Provincial Manager serves as the Strategic Growth Driver & Portfolio Architect for the province/region. This role focuses on strategic oversight, provincial portfolio health, cross-district synergy, market innovation, and long-term value creation aligned with the $100M valuation target.";

  const kpis = [
    { name: "Provincial Net Contribution Growth", baseline: "-", target: "+25% YoY", weight: "25%" },
    { name: "Long-Term Delinquency Reduction", baseline: "-", target: "-5 pp", weight: "20%" },
    { name: "New Product/Channel Revenue", baseline: "-", target: "≥K500K/yr", weight: "15%" },
    { name: "Strategic Partnership Revenue", baseline: "-", target: "≥K1M/yr", weight: "15%" },
    { name: "Cost-to-Income Ratio", baseline: "50%", target: "≤45%", weight: "10%" },
    { name: "District Manager Development", baseline: "-", target: "≥2 prom/yr", weight: "10%" }
  ];

  return (
    <DashboardBase
      title="Provincial Manager Dashboard"
      subtitle="Provincial strategic oversight, portfolio health, and growth leadership"
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
            title="Provincial Net Contribution"
            value="K2.8M"
            change="+18% from target"
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
            title="Provincial Default Rate"
            value="2.4%"
            change="-0.6% improvement"
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
            value="5"
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
            title="Strategic Partnerships"
            value="8"
            change="K2.1M revenue"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
        </div>

        {/* District Performance Overview */}
        <div className="col-span-12">
          <CollapsibleCard title="District Performance Overview">
            <div className="grid grid-cols-5 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">District A</p>
                <p className="text-2xl font-bold text-green-600 mt-1">K850K</p>
                <p className="text-xs text-gray-500">Net Contribution</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">District B</p>
                <p className="text-2xl font-bold text-green-600 mt-1">K720K</p>
                <p className="text-xs text-gray-500">Net Contribution</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">District C</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">K580K</p>
                <p className="text-xs text-gray-500">Net Contribution</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">District D</p>
                <p className="text-2xl font-bold text-green-600 mt-1">K690K</p>
                <p className="text-xs text-gray-500">Net Contribution</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">District E</p>
                <p className="text-2xl font-bold text-green-600 mt-1">K760K</p>
                <p className="text-xs text-gray-500">Net Contribution</p>
              </div>
            </div>
          </CollapsibleCard>
        </div>

        {/* Strategic Alerts */}
        <div className="col-span-12 lg:col-span-8">
          <CollapsibleCard title="Strategic Priority Items">
            <div className="space-y-4">
              <AlertCard
                title="District C Performance Intervention"
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
                message="Expansion opportunity identified in District D rural areas."
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

        {/* Provincial Health */}
        <div className="col-span-12 lg:col-span-4">
          <CollapsibleCard title="Provincial Health Indicators">
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
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">District D</span>
                <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">Good</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">District E</span>
                <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">Excellent</span>
              </div>
            </div>
          </CollapsibleCard>
        </div>
      </div>
    </DashboardBase>
  );
}
