'use client';

import React, { useEffect, useState } from 'react';
import { DashboardBase, KPICard, AlertCard, CollapsibleCard, KPIMetricsCard } from './DashboardBase';
import { roleCardsData } from '@/data/role-cards-data';
import { useUserTier } from '@/hooks/useUserTier';
import { getUserOfficeName } from '@/hooks/useOffice';
import { useLoanConsultantStats } from '@/hooks/useLoanConsultantStats';
import PriorityActionService from '@/services/PriorityActionService';
import { PriorityAction } from '@/services/PriorityActionService';
import LoanConsultantMetricsService from '@/services/LoanConsultantMetricsService';
import { LoanConsultantMetrics } from '@/services/LoanConsultantMetricsService';

interface LoanConsultantDashboardProps {
  position?: string;
}

export default function LoanConsultantDashboard({ position = 'Loan Consultant' }: LoanConsultantDashboardProps) {
  const { data: userTierData, isLoading, error } = useUserTier();
  const { 
    data: loanStats, 
    circleStats,
    isLoading: isLoadingStats, 
    error: errorStats,
    getCircleDateRanges 
  } = useLoanConsultantStats();
  
  const [priorityActions, setPriorityActions] = useState<PriorityAction[]>([]);
  const [metrics, setMetrics] = useState<LoanConsultantMetrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const priorityActionService = PriorityActionService.getInstance();
  const metricsService = LoanConsultantMetricsService.getInstance();
  
  const roleCard = roleCardsData[position] || roleCardsData['Branch Manager'] || {
    department: 'TBD',
    reportsTo: 'TBD',
    directReports: 'TBD',
    location: 'TBD',
    jobPurpose: 'TBD',
    kpis: []
  };

  // Calculate changes from previous circle
  const calculateChange = (current: number, previous: number): { value: number; percentage: number; isPositive: boolean } => {
    const diff = current - previous;
    const percentage = previous > 0 ? ((diff / previous) * 100) : 0;
    return {
      value: diff,
      percentage: Math.abs(percentage),
      isPositive: diff >= 0
    };
  };

  // Get circle date ranges for display
  const dateRanges = getCircleDateRanges();
  const formatDisplayDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Subscribe to priority actions
  useEffect(() => {
    const unsubscribe = priorityActionService.subscribe((updatedActions) => {
      setPriorityActions(updatedActions);
    });

    // Initialize priority actions from API
    priorityActionService.initializeFromAPI();

    return unsubscribe;
  }, []);

  // Fetch loan consultant metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoadingMetrics(true);
      try {
        // Get current user ID from localStorage
        let userId = 1907; // Default to sample user
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('thisUser');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.id) {
              userId = user.id;
            }
          }
        }

        // Get current circle date range
        const dateRanges = getCircleDateRanges();
        
        const metricsData = await metricsService.fetchLoanConsultantMetrics(
          userId,
          dateRanges.current.start_date,
          dateRanges.current.end_date
        );

        setMetrics(metricsData);
      } catch (error) {
        console.error('Error fetching loan consultant metrics:', error);
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, []);

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
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{getUserOfficeName()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Tier</p>
          <p className="text-sm font-semibold text-brand-500">
            {userTierData?.current_tier.name || 'Base'}
          </p>
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
            title="Total Uncollected"
            value={isLoadingMetrics ? '...' : metrics?.total_uncollected || '0'}
            change=""
            changeType="negative"
            isMoney={true}
            icon={
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9V7a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2h8m-2 4h2a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m10 0a2 2 0 002 2h2a2 2 0 002-2v-6a2 2 0 00-2-2h-2m-4-4V5a2 2 0 012-2h2a2 2 0 012 2v4m-6 0h6" />
              </svg>
            }
            expandable={true}
            expandedContent={
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">Amount yet to be collected</p>
              </div>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Total Collected"
            value={isLoadingMetrics ? '...' : metrics?.total_collected || '0'}
            change=""
            changeType="positive"
            isMoney={true}
            icon={
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            expandable={true}
            expandedContent={
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">Total amount collected this period</p>
              </div>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Still Uncollected"
            value={isLoadingMetrics ? '...' : metrics?.still_uncollected || '0'}
            change=""
            changeType={metrics && parseFloat(metrics.still_uncollected) < 0 ? 'negative' : 'positive'}
            isMoney={true}
            icon={
              <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            expandable={true}
            expandedContent={
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">Difference between collected and uncollected</p>
              </div>
            }
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Given Out"
            value={isLoadingMetrics ? '...' : metrics?.given_out || '0'}
            change=""
            changeType="positive"
            isMoney={true}
            icon={
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            expandable={true}
            expandedContent={
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">Total amount disbursed this period</p>
              </div>
            }
          />
        </div>

        {/* Priority Actions Section */}
        <div className="col-span-12 lg:col-span-8">
          <CollapsibleCard title="Priority Actions for Today" defaultExpanded={true}>
            <div className="space-y-4">
              {priorityActions.length > 0 ? (
                priorityActions.map((action, index) => (
                  <AlertCard
                    key={index}
                    title={action.action}
                    message={`Due: ${action.due}`}
                    type={action.urgent ? 'warning' : 'info'}
                    action={
                      <button className={`text-sm font-medium hover:underline ${
                        action.urgent 
                          ? 'text-yellow-700 dark:text-yellow-300' 
                          : 'text-blue-700 dark:text-blue-300'
                      }`}>
                        Take Action →
                      </button>
                    }
                    expandable={true}
                    expandedContent={
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600 dark:text-gray-300">
                          Status: {action.status === 0 ? 'Pending' : 'Completed'}
                        </p>
                        {action.positionSpecific && (
                          <p className="text-gray-600 dark:text-gray-300">
                            Position Specific: Yes
                          </p>
                        )}
                        {action.office_id && (
                          <p className="text-gray-600 dark:text-gray-300">
                            Office ID: {action.office_id}
                          </p>
                        )}
                      </div>
                    }
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <img 
                    src="/images/error/success.svg" 
                    alt="No priority actions" 
                    className="w-20 h-14 mx-auto mb-4 opacity-50"
                  />
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No priority actions available
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    You're all caught up! Check back later for new tasks.
                  </p>
                </div>
              )}
            </div>
          </CollapsibleCard>
        </div>

        {/* Quick Stats */}
        <div className="col-span-12 lg:col-span-4">
          <CollapsibleCard title={`Current Circle (${formatDisplayDate(dateRanges.current.start_date)} - ${formatDisplayDate(dateRanges.current.end_date)})`} defaultExpanded={true}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Applications</span>
                <div className="text-right">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {isLoadingStats ? '...' : circleStats.current?.new_applications}
                  </span>
                  {circleStats.previous && circleStats.current && (
                    <span className={`ml-2 text-xs ${
                      calculateChange(circleStats.current.new_applications, circleStats.previous.new_applications).isPositive 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {calculateChange(circleStats.current.new_applications, circleStats.previous.new_applications).isPositive ? '+' : ''}
                      {calculateChange(circleStats.current.new_applications, circleStats.previous.new_applications).value}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Approved</span>
                <div className="text-right">
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {isLoadingStats ? '...' : circleStats.current?.approved || 0}
                  </span>
                  {circleStats.previous && circleStats.current && (
                    <span className={`ml-2 text-xs ${
                      calculateChange(circleStats.current.approved, circleStats.previous.approved).isPositive 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {calculateChange(circleStats.current.approved, circleStats.previous.approved).isPositive ? '+' : ''}
                      {calculateChange(circleStats.current.approved, circleStats.previous.approved).value}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Pending</span>
                <div className="text-right">
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                    {isLoadingStats ? '...' : circleStats.current?.pending_loans || 0}
                  </span>
                  {circleStats.previous && circleStats.current && (
                    <span className={`ml-2 text-xs ${
                      calculateChange(circleStats.current.pending_loans, circleStats.previous.pending_loans).isPositive 
                        ? 'text-yellow-600 dark:text-yellow-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {calculateChange(circleStats.current.pending_loans, circleStats.previous.pending_loans).isPositive ? '+' : ''}
                      {calculateChange(circleStats.current.pending_loans, circleStats.previous.pending_loans).value}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Declined</span>
                <div className="text-right">
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {isLoadingStats ? '...' : circleStats.current?.declined || 0}
                  </span>
                  {circleStats.previous && circleStats.current && (
                    <span className={`ml-2 text-xs ${
                      calculateChange(circleStats.current.declined, circleStats.previous.declined).isPositive 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {calculateChange(circleStats.current.declined, circleStats.previous.declined).isPositive ? '+' : ''}
                      {calculateChange(circleStats.current.declined, circleStats.previous.declined).value}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Conversion Rate</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {isLoadingStats || !circleStats.current ? '...' : 
                    circleStats.current.new_applications > 0 
                      ? `${((circleStats.current.approved / circleStats.current.new_applications) * 100).toFixed(1)}%`
                      : '0%'
                  }
                </span>
              </div>
            </div>
          </CollapsibleCard>
        </div>

        {/* Loan Pipeline */}
        <div className="col-span-12">
          <CollapsibleCard title="Loan Pipeline" defaultExpanded={true}>
            <div className="relative overflow-hidden py-8">
              {/* Pipeline Container */}
              <div className="flex items-center justify-between relative px-4">
                {/* Pipeline Stages */}
                {[
                  { 
                    label: 'Pending Loans', 
                    value: isLoadingStats ? '...' : loanStats?.pending_loans || 0, 
                    color: 'blue' as const, 
                    icon: (
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    ),
                    description: 'Awaiting review'
                  },
                  { 
                    label: 'Under Review', 
                    value: isLoadingStats ? '...' : loanStats?.under_review || 0, 
                    color: 'indigo' as const, 
                    icon: (
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    ),
                    description: 'In review'
                  },
                  { 
                    label: 'Approved', 
                    value: isLoadingStats ? '...' : loanStats?.approved || 0, 
                    color: 'emerald' as const, 
                    icon: (
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ),
                    description: 'Ready for disbursement'
                  },
                  { 
                    label: 'Disbursed', 
                    value: isLoadingStats ? '...' : loanStats?.disbursed || 0, 
                    color: 'violet' as const, 
                    icon: (
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ),
                    description: 'Funds released'
                  },
                  { 
                    label: 'Delinquent', 
                    value: isLoadingStats ? '...' : 0, 
                    color: 'amber' as const, 
                    icon: (
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    ),
                    description: 'Overdue payments'
                  },
                  { 
                    label: 'Defaulted', 
                    value: isLoadingStats ? '...' : 0, 
                    color: 'rose' as const, 
                    icon: (
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    ),
                    description: 'Default status'
                  },
                  { 
                    label: 'Collected', 
                    value: isLoadingStats ? '...' : 0, 
                    color: 'teal' as const, 
                    icon: (
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    description: 'Fully collected'
                  }
                ].map((stage, index, stages) => {
                  // Enhanced color configuration
                  const colorConfig = {
                    blue: {
                      bg: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
                      shadow: 'shadow-blue-500/30',
                      ring: 'ring-blue-400/40',
                      line: 'from-blue-400',
                      text: 'text-blue-600 dark:text-blue-400'
                    },
                    indigo: {
                      bg: 'bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600',
                      shadow: 'shadow-indigo-500/30',
                      ring: 'ring-indigo-400/40',
                      line: 'from-indigo-400',
                      text: 'text-indigo-600 dark:text-indigo-400'
                    },
                    emerald: {
                      bg: 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600',
                      shadow: 'shadow-emerald-500/30',
                      ring: 'ring-emerald-400/40',
                      line: 'from-emerald-400',
                      text: 'text-emerald-600 dark:text-emerald-400'
                    },
                    violet: {
                      bg: 'bg-gradient-to-br from-violet-400 via-violet-500 to-violet-600',
                      shadow: 'shadow-violet-500/30',
                      ring: 'ring-violet-400/40',
                      line: 'from-violet-400',
                      text: 'text-violet-600 dark:text-violet-400'
                    },
                    amber: {
                      bg: 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600',
                      shadow: 'shadow-amber-500/30',
                      ring: 'ring-amber-400/40',
                      line: 'from-amber-400',
                      text: 'text-amber-600 dark:text-amber-400'
                    },
                    rose: {
                      bg: 'bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600',
                      shadow: 'shadow-rose-500/30',
                      ring: 'ring-rose-400/40',
                      line: 'from-rose-400',
                      text: 'text-rose-600 dark:text-rose-400'
                    },
                    teal: {
                      bg: 'bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600',
                      shadow: 'shadow-teal-500/30',
                      ring: 'ring-teal-400/40',
                      line: 'from-teal-400',
                      text: 'text-teal-600 dark:text-teal-400'
                    }
                  };

                  const config = colorConfig[stage.color];
                  const nextStage = stages[index + 1];
                  const nextConfig = nextStage ? colorConfig[nextStage.color] : null;

                  return (
                    <React.Fragment key={index}>
                      {/* Pipeline Stage Node */}
                      <div className="relative z-10 flex flex-col items-center group">
                        {/* Main Circle */}
                        <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full ${config.bg} text-white flex items-center justify-center shadow-lg ${config.shadow} ring-4 ${config.ring} transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                          {/* Inner highlight */}
                          <div className="absolute inset-1 rounded-full bg-white/10"></div>
                          
                          {/* Icon */}
                          <div className="relative z-10">
                            {stage.icon}
                          </div>
                          
                          {/* Pulse effect on hover */}
                          <div className={`absolute inset-0 rounded-full ${config.bg} opacity-0 group-hover:opacity-20 animate-ping`}></div>
                        </div>
                        
                        {/* Value Badge */}
                        <div className={`mt-3 px-3 py-1 rounded-full ${config.bg} text-white text-sm font-bold shadow-md`}>
                          {stage.value}
                        </div>
                        
                        {/* Label */}
                        <p className="mt-2 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white text-center whitespace-nowrap">{stage.label}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">{stage.description}</p>
                      </div>

                      {/* Animated Connection Line with Arrow */}
                      {index < stages.length - 1 && nextConfig && (
                        <div className="flex-1 mx-1 sm:mx-2 relative h-16 flex items-center">
                          {/* Background Line */}
                          <div className="absolute inset-x-0 top-1/2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full transform -translate-y-1/2"></div>
                          
                          {/* Animated Gradient Line */}
                          <div className={`absolute inset-x-0 top-1/2 h-1.5 bg-gradient-to-r ${config.line} ${nextConfig.line} rounded-full transform -translate-y-1/2 overflow-hidden`}>
                            {/* Flowing Light Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-flow-line"></div>
                            
                            {/* Moving Dots */}
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full h-0.5 relative overflow-hidden">
                                {[...Array(3)].map((_, i) => (
                                  <div
                                    key={i}
                                    className="absolute w-2 h-2 bg-white rounded-full shadow-sm animate-dot-flow"
                                    style={{ animationDelay: `${i * 0.5}s` }}
                                  ></div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {/* Animated Arrow */}
                          <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 z-20">
                            <div className={`w-4 h-4 ${nextConfig.bg} rounded-full flex items-center justify-center shadow-md animate-arrow-pulse`}>
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Custom CSS Animations */}
            <style jsx>{`
              @keyframes flow-line {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(200%); }
              }
              
              @keyframes dot-flow {
                0% { left: -10%; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { left: 110%; opacity: 0; }
              }
              
              @keyframes arrow-pulse {
                0%, 100% { transform: translateX(50%) translateY(-50%) scale(1); }
                50% { transform: translateX(50%) translateY(-50%) scale(1.15); }
              }
              
              .animate-flow-line {
                animation: flow-line 2s linear infinite;
              }
              
              .animate-dot-flow {
                animation: dot-flow 2s linear infinite;
              }
              
              .animate-arrow-pulse {
                animation: arrow-pulse 1.5s ease-in-out infinite;
              }
            `}</style>
          </CollapsibleCard>
        </div>

        {/* Performance Tiers */}
        <div className="col-span-12 lg:col-span-6">
          <CollapsibleCard title="Performance Tier Progress" defaultExpanded={true}>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Current: {userTierData?.current_tier.name || 'K50K+'}
                  </span>
                  <span className="font-medium text-brand-500">
                    {userTierData?.portfolio_summary.current_formatted || 'K2.3M'} / 
                    {userTierData?.portfolio_summary.required_formatted || 'K2.5M'} to next tier
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-brand-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${userTierData?.portfolio_summary.progress_percentage || 0}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {userTierData?.portfolio_summary.progress_percentage || 0}% towards {userTierData?.next_tier?.name || 'K80K+'}
                </p>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { id: 1, name: 'Base', range: 'K0-49K', color: 'gray' },
                  { id: 2, name: 'K50K+', range: 'K50K+', color: 'blue' },
                  { id: 3, name: 'K80K+', range: 'K80K+', color: 'purple' },
                  { id: 4, name: 'K120K+', range: 'K120K+', color: 'gold' }
                ].map((tier) => {
                  const isCurrent = userTierData?.current_tier.id === tier.id;
                  const isNext = userTierData?.next_tier?.id === tier.id;
                  
                  // Determine tier colors based on color name
                  const getTierColors = (color: string) => {
                    switch (color) {
                      case 'blue':
                        return {
                          bg: 'bg-blue-100 dark:bg-blue-900/30',
                          border: 'border-blue-500',
                          text: 'text-blue-600'
                        };
                      case 'purple':
                        return {
                          bg: 'bg-purple-100 dark:bg-purple-900/30',
                          border: 'border-purple-500',
                          text: 'text-purple-600'
                        };
                      case 'gold':
                        return {
                          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
                          border: 'border-yellow-500',
                          text: 'text-yellow-600'
                        };
                      case 'gray':
                      default:
                        return {
                          bg: 'bg-gray-100 dark:bg-gray-800',
                          border: 'border-gray-500',
                          text: 'text-gray-600'
                        };
                    }
                  };
                  
                  const tierColors = getTierColors(tier.color);
                  
                  return (
                    <div 
                      key={tier.id}
                      className={`p-2 rounded border transition-all duration-300 ${
                        isCurrent 
                          ? `${tierColors.bg} ${tierColors.border}`
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <p className={`text-xs ${
                        isCurrent 
                          ? tierColors.text 
                          : 'text-gray-500'
                      }`}>
                        {isCurrent ? 'Current' : isNext ? 'Next' : 'Base'}
                      </p>
                      <p className={`text-sm font-bold ${
                        isCurrent 
                          ? tierColors.text 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {tier.range}
                      </p>
                    </div>
                  );
                })}
              </div>
              
              {/* Tier Benefits Display */}
              {userTierData?.benefits && userTierData.benefits.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Current Tier Benefits
                  </h4>
                  <div className="space-y-2 text-sm">
                    {userTierData.benefits.map((benefit, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                          {benefit.description}:
                        </span>
                        <span className="font-semibold text-brand-500">
                          {benefit.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
