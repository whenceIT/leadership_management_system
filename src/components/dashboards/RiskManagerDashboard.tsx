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

export default function RiskManagerDashboard() {
  const jobInfo = {
    department: "Risk Management",
    reportsTo: "Executive Committee / Audit Committee",
    directReports: "Risk Officers, Collections Team",
    location: "Headquarters"
  };

  const jobPurpose = "The Risk Manager serves as the strategic guardian of institutional stability and resilience. This role is critical for protecting the institution's $100M valuation by proactively identifying, assessing, and mitigating risks across all operations while ensuring regulatory compliance.";

  const kpis = [
    { name: "Month-1 Default Rate", baseline: "5%", target: "≤4%", weight: "25%" },
    { name: "Month-3 Default Rate", baseline: "12%", target: "≤10%", weight: "25%" },
    { name: "Collection Rate", baseline: "88%", target: "≥92%", weight: "20%" },
    { name: "Risk Rating Accuracy", baseline: "75%", target: "≥90%", weight: "15%" },
    { name: "Fraud Incidents", baseline: "3/quarter", target: "0", weight: "15%" }
  ];

  return (
    <DashboardBase
      title="Risk Manager Dashboard"
      subtitle="Risk assessment, portfolio quality, and collections oversight"
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
            title="M1 Default Rate"
            value="3.8%"
            change="-1.2% improvement"
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
            title="M3 Default Rate"
            value="9.5%"
            change="-2.5% improvement"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Collection Rate"
            value="91.2%"
            change="+3.2% improvement"
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
            title="Portfolio at Risk"
            value="5.2%"
            change="-1.8% improvement"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
        </div>

        {/* Risk Overview */}
        <div className="col-span-12">
          <CollapsibleCard title="Risk Overview">
            <div className="grid grid-cols-5 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Portfolio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">K45M</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Risk Weighted Assets</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">K32M</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">NPL Ratio</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">4.2%</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Credit Risk Score</p>
                <p className="text-2xl font-bold text-green-600 mt-1">A-</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Operational Risk</p>
                <p className="text-2xl font-bold text-green-600 mt-1">Low</p>
              </div>
            </div>
          </CollapsibleCard>
        </div>

        {/* Alerts */}
        <div className="col-span-12 lg:col-span-8">
          <CollapsibleCard title="Risk Items">
            <div className="space-y-4">
              <AlertCard
                title="High Default Risk Alert"
                message="28 loans showing early warning signs. Immediate review required."
                type="warning"
                action={
                  <button className="text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:underline">
                    Review High Risk Loans →
                  </button>
                }
              />
              <AlertCard
                title="Fraud Detection"
                message="Suspicious activity detected on 3 accounts. Investigation ongoing."
                type="error"
                action={
                  <button className="text-sm font-medium text-red-700 dark:text-red-300 hover:underline">
                    Investigate →
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
                <span className="text-gray-500 dark:text-gray-400">Collections Due</span>
                <span className="font-semibold text-gray-900 dark:text-white">K1.2M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Legal Actions</span>
                <span className="font-semibold text-yellow-600">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Restructured Loans</span>
                <span className="font-semibold text-gray-900 dark:text-white">45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Write-offs (YTD)</span>
                <span className="font-semibold text-red-600">K125K</span>
              </div>
            </div>
          </CollapsibleCard>
        </div>
      </div>
    </DashboardBase>
  );
}
