'use client';

import React from 'react';
import { DashboardBase, KPICard, AlertCard, SectionCard } from './DashboardBase';

interface GenericDashboardProps {
  position: string;
  metrics?: {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
  }[];
  alerts?: {
    title: string;
    message: string;
    type: 'warning' | 'error' | 'success' | 'info';
  }[];
}

export function GenericDashboard({ position, metrics = [], alerts = [] }: GenericDashboardProps) {
  const subtitle = getSubtitleForPosition(position);

  return (
    <DashboardBase title={`${position} Dashboard`} subtitle={subtitle}>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Default Metrics */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Pending Tasks"
            value="12"
            change="5 due today"
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
            title="In Progress"
            value="8"
            change="3 completing today"
            changeType="neutral"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Completed"
            value="24"
            change="This month"
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
            title="Compliance Score"
            value="96%"
            change="Above target"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="col-span-12">
            <SectionCard title="Priority Items">
              <div className="space-y-4">
                {alerts.map((alert, index) => (
                  <AlertCard
                    key={index}
                    title={alert.title}
                    message={alert.message}
                    type={alert.type}
                  />
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* Workload Overview */}
        <div className="col-span-12 lg:col-span-6">
          <SectionCard title="Workload Overview">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">Active Assignments</span>
                <span className="font-semibold text-gray-900 dark:text-white">15</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">Pending Review</span>
                <span className="font-semibold text-gray-900 dark:text-white">8</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">Escalated Items</span>
                <span className="font-semibold text-yellow-600">2</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">Completed This Week</span>
                <span className="font-semibold text-green-600">12</span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Recent Activity */}
        <div className="col-span-12 lg:col-span-6">
          <SectionCard title="Recent Activity">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Document reviewed and approved</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Task completed successfully</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">New assignment received</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardBase>
  );
}

function getSubtitleForPosition(position: string): string {
  const subtitles: Record<string, string> = {
    'Branch Manager': 'Real-time branch performance and operations overview',
    'District Manager': 'Cross-branch performance and district-wide oversight',
    'District Regional Manager': 'Regional operations and strategic management',
    'Provincial Manager': 'Provincial-wide performance and resource allocation',
    'General Operations Administrator': 'Daily operations administration and coordination',
    'General Operations Manager': 'Operations management and process optimization',
    'Performance Operations Administrator': 'Performance tracking and metrics analysis',
    'Administration': 'Administrative functions and office management',
    'Manager Administration': 'Administrative leadership and oversight',
    'Management Accountant': 'Financial reporting and accounting operations',
    'Payroll Loans Manager': 'Payroll processing and loan administration',
    'Risk Manager': 'Risk assessment and mitigation oversight',
    'Recoveries Coordinator': 'Recovery operations and collections coordination',
    'IT Manager': 'Technology infrastructure and systems management',
    'IT Coordinator': 'IT operations and technical support',
    'Policy & Training Manager': 'Policy development and training program management',
    'Motor Vehicles Manager': 'Fleet management and vehicle operations',
    'R&D Coordinator': 'Research initiatives and development projects',
    'Marketing Manager': 'Marketing campaigns and brand management',
  };

  return subtitles[position] || `${position} overview and task management`;
}

export default GenericDashboard;
