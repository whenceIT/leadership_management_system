'use client';

import React, { useState, useEffect } from 'react';
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
import ProvincialDataService, { 
  BranchPerformance, 
  ProvinceSummary,
  ProvincialPerformanceData 
} from '@/services/ProvincialDataService';
import { useUserPosition } from '@/hooks/useUserPosition';
import { useOffice } from '@/hooks/useOffice';
import { useUserKPI, ProcessedKPI } from '@/hooks/useUserKPI';

export default function ProvincialManagerDashboard() {
  const { user, positionName, isLoading: isPositionLoading } = useUserPosition();
  const { getOffice } = useOffice();
  const [performanceData, setPerformanceData] = useState<ProvincialPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get user-specific KPI data
  const { processedKPIs, isLoading: isKpiLoading, error: kpiError } = useUserKPI();

  // Get province ID from user's office
  const getProvinceIdFromUser = (): number => {
    if (user?.office_id) {
      const office = getOffice(user.office_id);
      if (office?.provinceId) {
        return parseInt(office.provinceId, 10);
      }
    }
    return 1; // Default to Lusaka Province
  };

  // Fetch provincial performance data
  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (isPositionLoading) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const service = ProvincialDataService.getInstance();
        
        // Get province ID from user's office
        const targetProvinceId = getProvinceIdFromUser();
        
        const data = await service.fetchProvincialPerformance({
          province_id: targetProvinceId,
          include_details: true,
        });
        
        if (data) {
          setPerformanceData(data);
        } else {
          setError('Unable to load provincial performance data');
        }
      } catch (err) {
        console.error('Error fetching provincial performance:', err);
        setError('Failed to load performance data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformanceData();
  }, [user, isPositionLoading]);

  const jobInfo = {
    department: "Senior Operations & Strategic Leadership",
    reportsTo: "Technical Director / Executive Committee",
    directReports: "District Managers (5+ districts), Specialized Unit Managers",
    location: "Provincial Headquarters"
  };

  const jobPurpose = "The Provincial Manager serves as the Strategic Growth Driver & Portfolio Architect for the province/region. This role focuses on strategic oversight, provincial portfolio health, cross-district synergy, market innovation, and long-term value creation aligned with the $100M valuation target.";

  // Build KPIs from user-specific KPI data
  const kpis = processedKPIs.length > 0 ? processedKPIs.map(kpi => ({
    name: kpi.name,
    baseline: kpi.baseline.toString(),
    target: kpi.target.toString(),
    weight: `${kpi.weight}%`
  })) : [];

  // Get health status styling
  const getHealthStatusStyle = (status: 'excellent' | 'good' | 'needs_focus' | 'critical') => {
    switch (status) {
      case 'excellent':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          text: 'text-green-700 dark:text-green-300',
          badge: 'bg-green-200 text-green-800',
          label: 'Excellent'
        };
      case 'good':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          text: 'text-green-700 dark:text-green-300',
          badge: 'bg-green-200 text-green-800',
          label: 'Good'
        };
      case 'needs_focus':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          text: 'text-yellow-700 dark:text-yellow-300',
          badge: 'bg-yellow-200 text-yellow-800',
          label: 'Needs Focus'
        };
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          text: 'text-red-700 dark:text-red-300',
          badge: 'bg-red-200 text-red-800',
          label: 'Critical'
        };
    }
  };

  // Get contribution color based on value
  const getContributionColor = (value: number, avg: number) => {
    if (value >= avg * 1.2) return 'text-green-600';
    if (value >= avg) return 'text-green-600';
    if (value >= avg * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Calculate average contribution for comparison
  const getAverageContribution = (branches: BranchPerformance[]): number => {
    if (branches.length === 0) return 0;
    return branches.reduce((sum, b) => sum + b.net_contribution_value, 0) / branches.length;
  };

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

      {isLoading && (
        <div className="flex items-center justify-center h-32 mt-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          <span className="ml-3 text-gray-500">Loading performance data...</span>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4 md:gap-6 mt-6">
        {/* KPI Cards - Use actual data if available */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <KPICard
            title="Provincial Net Contribution"
            value={performanceData?.province_summary.formatted_net_contribution || "K2.8M"}
            change={performanceData ? `${performanceData.province_summary.total_branches} branches` : "+18% from target"}
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
            value={performanceData ? `${performanceData.province_summary.average_par_rate}%` : "2.4%"}
            change={performanceData ? `PAR across ${performanceData.province_summary.total_branches} branches` : "-0.6% improvement"}
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
            title="Active Branches"
            value={performanceData ? String(performanceData.province_summary.active_branches) : "5"}
            change={performanceData ? `${performanceData.province_summary.total_staff} staff` : "All operational"}
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
            value={performanceData ? `${performanceData.province_summary.average_collection_rate}%` : "92.5%"}
            change={performanceData ? `${performanceData.province_summary.total_active_loans} active loans` : "K2.1M revenue"}
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
        </div>

        {/* Branch Performance Overview - Dynamic from API */}
        <div className="col-span-12">
          <CollapsibleCard title="Branch Performance Overview">
            {performanceData && performanceData.branches.length > 0 ? (
              <div className={`grid grid-cols-${Math.min(performanceData.branches.length, 5)} gap-4`}>
                {performanceData.branches.slice(0, 5).map((branch) => {
                  const avgContribution = getAverageContribution(performanceData.branches);
                  const contributionColor = getContributionColor(branch.net_contribution_value, avgContribution);
                  
                  return (
                    <div key={branch.branch_id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{branch.branch_name}</p>
                      <p className={`text-2xl font-bold ${contributionColor} mt-1`}>{branch.net_contribution}</p>
                      <p className="text-xs text-gray-500">Net Contribution</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-gray-400">PAR: {branch.par.rate}%</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">Col: {branch.collections.rate}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Empty state when no branch performance data is available
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-center mb-4">
                  <svg className="w-24 h-24 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Branch Performance Data</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Branch performance data is currently unavailable. Please check back later for real-time branch metrics and contributions.
                </p>
              </div>
            )}
          </CollapsibleCard>
        </div>

        {/* Strategic Alerts */}
        <div className="col-span-12 lg:col-span-8">
          <CollapsibleCard title="Strategic Priority Items">
            <div className="space-y-4">
              {performanceData && performanceData.branches.some(b => b.par.rate > 5) && (
                <AlertCard
                  title="High PAR Rate Alert"
                  message={`Some branches have PAR rates exceeding 5%. Immediate attention required.`}
                  type="warning"
                  action={
                    <button className="text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:underline">
                      Review PAR Report →
                    </button>
                  }
                />
              )}
              {performanceData && performanceData.branches.some(b => b.collections.rate < 90) && (
                <AlertCard
                  title="Collection Performance Concern"
                  message="Some branches are below 90% collection rate. Consider intervention."
                  type="warning"
                  action={
                    <button className="text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:underline">
                      Review Collection Strategy →
                    </button>
                  }
                />
              )}
              <AlertCard
                title="New Market Opportunity"
                message="Expansion opportunity identified in rural areas."
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

        {/* Provincial Health - Dynamic from API */}
        <div className="col-span-12 lg:col-span-4">
          <CollapsibleCard title="Provincial Health Indicators">
            {performanceData && performanceData.branches.length > 0 ? (
              <div className="space-y-3">
                {performanceData.branches.map((branch) => {
                  const service = ProvincialDataService.getInstance();
                  const healthStatus = service.getBranchHealthStatus(branch);
                  const statusStyle = getHealthStatusStyle(healthStatus);
                  
                  return (
                    <div key={branch.branch_id} className={`flex items-center justify-between p-3 ${statusStyle.bg} rounded-lg`}>
                      <span className={`text-sm font-medium ${statusStyle.text}`}>{branch.branch_name}</span>
                      <span className={`text-xs px-2 py-1 ${statusStyle.badge} rounded-full`}>{statusStyle.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Empty state when no branch health data is available
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-center mb-4">
                  <svg className="w-24 h-24 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Health Indicator Data</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Branch health indicator data is currently unavailable. Please check back later for real-time health status updates.
                </p>
              </div>
            )}
          </CollapsibleCard>
        </div>
      </div>
    </DashboardBase>
  );
}
