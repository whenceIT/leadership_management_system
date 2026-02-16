'use client';

import React from 'react';
import { DashboardBase, KPICard, AlertCard, CollapsibleCard, KPIMetricsCard } from './DashboardBase';
import { roleCardsData } from '@/data/role-cards-data';

interface LoanConsultantDashboardProps {
  position?: string;
}

export default function LoanConsultantDashboard({ position = 'Loan Consultant' }: LoanConsultantDashboardProps) {
  const roleCard = roleCardsData[position] || roleCardsData['Branch Manager'] || {
    department: 'TBD',
    reportsTo: 'TBD',
    directReports: 'TBD',
    location: 'TBD',
    jobPurpose: 'TBD',
    kpis: []
  };

  return (
    <DashboardBase
      title={position}
      subtitle="Your personal loan portfolio and performance overview"
    >
      {/* Quick Info Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Reports To</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{roleCard.reportsTo}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Department</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{roleCard.department}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{roleCard.location}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Tier</p>
          <p className="text-sm font-semibold text-brand-500">K50K+</p>
        </div>
      </div>

      {/* Job Purpose */}
      <div className="bg-brand-50 dark:bg-brand-900/20 border-l-4 border-brand-500 p-4 mb-6 rounded-r-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Role Purpose:</span> {roleCard.jobPurpose || 'Achieve individual loan targets, maintain portfolio quality, and deliver excellent customer service.'}
        </p>
      </div>

      {/* KPI Metrics from Role Card */}
      {roleCard.kpis && roleCard.kpis.length > 0 && (
        <KPIMetricsCard kpis={roleCard.kpis} title="Key Performance Indicators (KPIs)" />
      )}

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* KPI Cards - Personal Performance */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Loans Disbursed"
            value="47"
            change="+8 this month"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            expandable={true}
            expandedContent={
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">Target: 40 loans/month</p>
                <p className="text-green-600 dark:text-green-400">✅ Exceeding Target</p>
              </div>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Portfolio Value"
            value="K2.3M"
            change="+K320K from last month"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            expandable={true}
            expandedContent={
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">Target: K2.0M</p>
                <p className="text-green-600 dark:text-green-400">✅ Above Target</p>
              </div>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Collection Rate"
            value="96.8%"
            change="+1.2% improvement"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            expandable={true}
            expandedContent={
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">Target: ≥95%</p>
                <p className="text-green-600 dark:text-green-400">✅ Exceeding Target</p>
              </div>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Default Rate"
            value="1.8%"
            change="-0.3% from last month"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            expandable={true}
            expandedContent={
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">Target: ≤2.5%</p>
                <p className="text-green-600 dark:text-green-400">✅ Well Below Target</p>
              </div>
            }
          />
        </div>

        {/* Alerts Section */}
        <div className="col-span-12 lg:col-span-8">
          <CollapsibleCard title="Priority Actions" defaultExpanded={true}>
            <div className="space-y-4">
              <AlertCard
                title="Follow-up Required - 3 At-Risk Loans"
                message="Review clients with payments 15+ days overdue. Action required by EOD."
                type="warning"
                action={
                  <button className="text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:underline">
                    Review Now →
                  </button>
                }
                expandable={true}
                expandedContent={
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-300">Client #4521: K12,500 overdue (18 days)</p>
                    <p className="text-gray-600 dark:text-gray-300">Client #4534: K8,200 overdue (15 days)</p>
                    <p className="text-gray-600 dark:text-gray-300">Client #4541: K5,800 overdue (16 days)</p>
                  </div>
                }
              />
              <AlertCard
                title="New Lead Assignments"
                message="You have 5 new qualified leads from walk-ins and referrals."
                type="info"
                action={
                  <button className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline">
                    View Leads →
                  </button>
                }
                expandable={true}
                expandedContent={
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-300">2 from walk-ins</p>
                    <p className="text-gray-600 dark:text-gray-300">3 from referral program</p>
                  </div>
                }
              />
            </div>
          </CollapsibleCard>
        </div>

        {/* Quick Stats */}
        <div className="col-span-12 lg:col-span-4">
          <CollapsibleCard title="This Month Summary" defaultExpanded={true}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Applications</span>
                <span className="font-semibold text-gray-900 dark:text-white">62</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Approved</span>
                <span className="font-semibold text-green-600 dark:text-green-400">47</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Pending</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Declined</span>
                <span className="font-semibold text-red-600 dark:text-red-400">7</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Conversion Rate</span>
                <span className="font-semibold text-green-600 dark:text-green-400">75.8%</span>
              </div>
            </div>
          </CollapsibleCard>
        </div>

        {/* Loan Pipeline */}
        <div className="col-span-12">
          <CollapsibleCard title="Loan Pipeline" defaultExpanded={true}>
            <div className="grid grid-cols-5 gap-4 text-center">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">New Applications</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">12</p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Under Review</p>
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">8</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-purple-600 dark:text-purple-400">Documents Pending</p>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">5</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">Approved</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">15</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Disbursed</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">47</p>
              </div>
            </div>
          </CollapsibleCard>
        </div>

        {/* Performance Tiers */}
        <div className="col-span-12 lg:col-span-6">
          <CollapsibleCard title="Performance Tier Progress" defaultExpanded={true}>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Current: K50K+ Tier</span>
                  <span className="font-medium text-brand-500">K2.3M / K2.5M to next tier</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">92% towards K80K+ tier</p>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <p className="text-xs text-gray-500">Base</p>
                  <p className="text-sm font-bold">K0-49K</p>
                </div>
                <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded border border-brand-500">
                  <p className="text-xs text-brand-600">Current</p>
                  <p className="text-sm font-bold text-brand-600">K50K+</p>
                </div>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <p className="text-xs text-gray-500">Next</p>
                  <p className="text-sm font-bold">K80K+</p>
                </div>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <p className="text-xs text-gray-500">Top</p>
                  <p className="text-sm font-bold">K120K+</p>
                </div>
              </div>
            </div>
          </CollapsibleCard>
        </div>

        {/* Recent Activity */}
        <div className="col-span-12 lg:col-span-6">
          <CollapsibleCard title="Recent Activity" defaultExpanded={true}>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Loan Disbursed - Client #4521</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">K45,000 - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Application Submitted</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Client #4556 - 4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Payment Reminder Sent</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Client #4534 - Yesterday</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">New Referral Received</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">From existing client - Yesterday</p>
                </div>
              </div>
            </div>
          </CollapsibleCard>
        </div>
      </div>
    </DashboardBase>
  );
}
