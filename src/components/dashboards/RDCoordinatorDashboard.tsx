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

export default function RDCoordinatorDashboard() {
  const jobInfo = {
    department: "Research & Development",
    reportsTo: "Executive Committee / Technical Director",
    directReports: "Research Analysts",
    location: "Headquarters"
  };

  const jobPurpose = "The R&D Coordinator serves as the innovation catalyst, driving product development and market research to sustain competitive advantage. This role directly supports the $100M valuation by identifying new revenue streams, improving product offerings, and ensuring market relevance through continuous innovation.";

  const kpis = [
    { name: "New Product Revenue", baseline: "K200K/yr", target: "≥K500K/yr", weight: "30%" },
    { name: "Research Projects Completed", baseline: "2/yr", target: "≥4/yr", weight: "25%" },
    { name: "Market Research Adoption Rate", baseline: "50%", target: "≥75%", weight: "20%" },
    { name: "Innovation Pipeline Health", baseline: "3 projects", target: "≥5 projects", weight: "15%" },
    { name: "R&D Investment ROI", baseline: "120%", target: "≥200%", weight: "10%" }
  ];

  return (
    <DashboardBase
      title="R&D Coordinator Dashboard"
      subtitle="Research initiatives, product development, and market innovation"
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
            title="New Product Revenue"
            value="K385K"
            change="+K185K this year"
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
            title="Research Completed"
            value="3"
            change="This year"
            changeType="neutral"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Market Research Adoption"
            value="68%"
            change="+18% improvement"
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
            title="Innovation Pipeline"
            value="5"
            change="Active projects"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
        </div>

        {/* R&D Overview */}
        <div className="col-span-12">
          <CollapsibleCard title="R&D Overview">
            <div className="grid grid-cols-5 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">5</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Development</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">2</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Testing</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">1</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Launched (YTD)</p>
                <p className="text-2xl font-bold text-green-600 mt-1">2</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Research Reports</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">8</p>
              </div>
            </div>
          </CollapsibleCard>
        </div>

        {/* Alerts */}
        <div className="col-span-12 lg:col-span-8">
          <CollapsibleCard title="R&D Items">
            <div className="space-y-4">
              <AlertCard
                title="Product Launch Ready"
                message="New mobile wallet feature ready for pilot launch."
                type="success"
                action={
                  <button className="text-sm font-medium text-green-700 dark:text-green-300 hover:underline">
                    Review Launch Plan →
                  </button>
                }
              />
              <AlertCard
                title="Market Research Complete"
                message="Customer satisfaction survey analysis ready for review."
                type="info"
                action={
                  <button className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline">
                    Review Findings →
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
                <span className="text-gray-500 dark:text-gray-400">R&D Budget Used</span>
                <span className="font-semibold text-gray-900 dark:text-white">65%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Patents Filed</span>
                <span className="font-semibold text-gray-900 dark:text-white">1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Competitor Analysis</span>
                <span className="font-semibold text-gray-900 dark:text-white">Updated</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">R&D ROI</span>
                <span className="font-semibold text-green-600">175%</span>
              </div>
            </div>
          </CollapsibleCard>
        </div>
      </div>
    </DashboardBase>
  );
}
