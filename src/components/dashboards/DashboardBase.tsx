'use client';

import React from 'react';

interface DashboardBaseProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function DashboardBase({ children, title, subtitle, className = '' }: DashboardBaseProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      {/* Dashboard Content */}
      {children}
    </div>
  );
}

/**
 * Collapsible Card Wrapper
 * Provides expand/collapse functionality for cards
 */
interface CollapsibleCardProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  action?: React.ReactNode;
  className?: string;
}

export function CollapsibleCard({ title, children, defaultExpanded = true, action, className = '' }: CollapsibleCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {action && <div>{action}</div>}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * KPI Card Component
 * For displaying key metrics with optional expand functionality
 */
interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  expandable?: boolean;
  expandedContent?: React.ReactNode;
}

export function KPICard({ title, value, change, changeType = 'neutral', icon, expandable = false, expandedContent }: KPICardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const changeColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-500 dark:text-gray-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {title}
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {change && (
              <p className={`mt-1 text-sm ${changeColors[changeType]}`}>
                {change}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {icon && (
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {icon}
              </div>
            )}
            {expandable && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      {expandable && isExpanded && expandedContent && (
        <div className="px-6 pb-6">
          {expandedContent}
        </div>
      )}
    </div>
  );
}

/**
 * Alert Card Component
 * For displaying important notifications with optional expand functionality
 */
interface AlertCardProps {
  title: string;
  message: string;
  type: 'warning' | 'error' | 'success' | 'info';
  action?: React.ReactNode;
  expandable?: boolean;
  expandedContent?: React.ReactNode;
}

export function AlertCard({ title, message, type, action, expandable = false, expandedContent }: AlertCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const typeStyles = {
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  };

  const iconStyles = {
    warning: 'text-yellow-500',
    error: 'text-red-500',
    success: 'text-green-500',
    info: 'text-blue-500',
  };

  return (
    <div className={`p-4 rounded-lg border ${typeStyles[type]}`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${iconStyles[type]}`}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-medium">{title}</p>
            {expandable && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
          <p className="mt-1 text-sm opacity-90">{message}</p>
          {action && <div className="mt-3">{action}</div>}
          {expandable && isExpanded && expandedContent && (
            <div className="mt-3 pt-3 border-t border-current/20">
              {expandedContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Section Card Component
 * For grouping related content with expand/collapse functionality
 */
interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export function SectionCard({ title, children, action, defaultExpanded = true, className = '' }: SectionCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {action && <div>{action}</div>}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Quick Info Bar Component
 * Displays key role information like department, reports to, direct reports, location
 */
interface QuickInfoBarProps {
  department: string;
  reportsTo: string;
  directReports: string;
  location: string;
}

export function QuickInfoBar({ department, reportsTo, directReports, location }: QuickInfoBarProps) {
  return (
    <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl p-6 text-white">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <p className="text-brand-100 text-sm">Department</p>
          <p className="font-semibold mt-1">{department}</p>
        </div>
        <div>
          <p className="text-brand-100 text-sm">Reports To</p>
          <p className="font-semibold mt-1">{reportsTo}</p>
        </div>
        <div>
          <p className="text-brand-100 text-sm">Direct Reports</p>
          <p className="font-semibold mt-1">{directReports}</p>
        </div>
        <div>
          <p className="text-brand-100 text-sm">Location</p>
          <p className="font-semibold mt-1">{location}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Job Purpose Component
 * Displays the job purpose statement
 */
interface JobPurposeProps {
  purpose: string;
}

export function JobPurpose({ purpose }: JobPurposeProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Job Purpose
      </h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
        {purpose}
      </p>
    </div>
  );
}

/**
 * KPI Metrics Card Component
 * Displays KPI metrics from role-cards-data with progress bars
 */
interface KPIMetricsCardProps {
  kpis: {
    name: string;
    baseline: string;
    target: string;
    weight: string;
  }[];
  title?: string;
}

export function KPIMetricsCard({ kpis, title = 'Key Performance Indicators' }: KPIMetricsCardProps) {
  const formatValue = (value: string): string => {
    return value;
  };

  const getWeightColor = (weight: string): string => {
    const weightNum = parseFloat(weight);
    if (weightNum >= 25) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    if (weightNum >= 20) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    if (weightNum >= 15) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  };

  const getTargetColor = (baseline: string, target: string): string => {
    const baselineNum = parseFloat(baseline.replace(/[^0-9.-]/g, ''));
    const targetNum = parseFloat(target.replace(/[^0-9.-]/g, ''));
    
    if (isNaN(baselineNum) || isNaN(targetNum)) {
      return 'text-gray-600 dark:text-gray-400';
    }
    
    if (baselineNum <= targetNum) {
      return 'text-green-600 dark:text-green-400';
    }
    return 'text-yellow-600 dark:text-yellow-400';
  };

  return (
    <CollapsibleCard title={title} defaultExpanded={true}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                KPI
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Baseline
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Target
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Weight
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {kpis.map((kpi, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                  {kpi.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {formatValue(kpi.baseline)}
                </td>
                <td className={`px-4 py-3 text-sm font-medium ${getTargetColor(kpi.baseline, kpi.target)}`}>
                  {formatValue(kpi.target)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getWeightColor(kpi.weight)}`}>
                    {kpi.weight}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CollapsibleCard>
  );
}

/**
 * Data Table Component
 * For displaying tabular data
 */
interface DataTableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export function DataTable({ headers, children, className = '' }: DataTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {children}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Loading State Component
 */
export function DashboardLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  );
}

/**
 * Error State Component
 */
export function DashboardError({ message = 'Something went wrong' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 text-red-500">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="mt-4 text-gray-900 dark:text-white font-medium">{message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export default DashboardBase;
