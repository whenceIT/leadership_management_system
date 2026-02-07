'use client';

import React from 'react';
import { DashboardBase, KPICard, AlertCard, SectionCard } from './DashboardBase';

export default function BranchManagerDashboard() {
  return (
    <DashboardBase
      title="Branch Manager Dashboard"
      subtitle="Real-time branch performance and operations overview"
    >
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* KPI Cards */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Month-1 Default Rate"
            value="2.3%"
            change="-0.5% from last month"
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
            title="Collections Rate"
            value="94.5%"
            change="+1.2% from target"
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
            title="Active Loans"
            value="1,247"
            change="+23 this week"
            changeType="neutral"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Staff Productivity"
            value="87%"
            change="+5% improvement"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
        </div>

        {/* Alerts Section */}
        <div className="col-span-12 lg:col-span-8">
          <SectionCard title="Priority Actions">
            <div className="space-y-4">
              <AlertCard
                title="Review Required - High Default Risk"
                message="5 loans showing early warning signs. Review action plans due today."
                type="warning"
                action={
                  <button className="text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:underline">
                    Review Now →
                  </button>
                }
              />
              <AlertCard
                title="Monthly Report Due"
                message="Submit monthly performance report by EOD tomorrow."
                type="info"
                action={
                  <button className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline">
                    Start Report →
                  </button>
                }
              />
            </div>
          </SectionCard>
        </div>

        {/* Quick Stats */}
        <div className="col-span-12 lg:col-span-4">
          <SectionCard title="Quick Stats">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Pending Approvals</span>
                <span className="font-semibold text-gray-900 dark:text-white">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Collections Due</span>
                <span className="font-semibold text-gray-900 dark:text-white">ZMW 45,200</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Training Completions</span>
                <span className="font-semibold text-gray-900 dark:text-white">8/12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Compliance Score</span>
                <span className="font-semibold text-green-600 dark:text-green-400">95%</span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Collections Waterfall */}
        <div className="col-span-12">
          <SectionCard title="Collections Waterfall" action={<button className="text-sm text-brand-500 hover:underline">View Details</button>}>
            <div className="grid grid-cols-5 gap-4 text-center">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Due</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">ZMW 125,000</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">Collected</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">ZMW 118,125</p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Partial</p>
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">ZMW 4,500</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">Overdue</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">ZMW 2,375</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Compliance</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">94.5%</p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Team Overview */}
        <div className="col-span-12 lg:col-span-6">
          <SectionCard title="Team Performance">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Staff</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Loans</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Recovery</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">John M.</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">245</td>
                    <td className="px-4 py-3 text-sm text-green-600">96.2%</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">On Track</span></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Sarah K.</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">198</td>
                    <td className="px-4 py-3 text-sm text-yellow-600">92.1%</td>
                    <td className="px3"><span className="px-2 py-1 text-xs font-medium bg-yellow-100-4 py- text-yellow-800 rounded-full">Needs Attention</span></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Mike T.</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">312</td>
                    <td className="px-4 py-3 text-sm text-green-600">98.5%</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">On Track</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        {/* Recent Activity */}
        <div className="col-span-12 lg:col-span-6">
          <SectionCard title="Recent Activity">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Loan Approved - Client #4521</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Collection Follow-up Scheduled</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Default Risk Alert - Client #3892</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Yesterday</p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardBase>
  );
}
