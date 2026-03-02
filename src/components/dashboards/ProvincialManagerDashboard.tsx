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
import { getHeadlineParameters } from '@/data/headline-parameters-mock';
import { InstitutionalHealthSummary, getInstitutionalSummaryData } from './InstitutionalHealthSummary';
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
  const [expanded, setExpanded] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  
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

  // Headline parameters using composite index approach
  const headlineParameters = getHeadlineParameters();

  // Drill-down for Provincial Manager: districts -> branches -> consultants -> transactions
  const [drillView, setDrillView] = useState<'districts' | 'branches' | 'consultants' | 'transactions'>('districts');
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<number | null>(null);

  // Mock data for provincial drill-down
  const mockDistricts = Array.from({length: 5}, (_, i) => ({
    id: i + 1,
    name: `District ${i + 1}`,
    avgDefaultRate: (25 + Math.random() * 10).toFixed(2),
    avgRecoveryRate: (50 + Math.random() * 20).toFixed(2),
  }));

  const mockBranches = (districtId: number) => Array.from({length: 4}, (_, i) => ({
    id: i + 1,
    name: `Branch ${i + 1} in District ${districtId}`,
    avgDefaultRate: (25 + Math.random() * 10).toFixed(2),
  }));

  const mockConsultants = (branchId: number) => Array.from({length: 8}, (_, i) => ({
    id: i + 1,
    name: `Consultant ${i + 1} in Branch ${branchId}`,
    performance: (70 + Math.random() * 30).toFixed(2),
  }));

  const mockTransactions = (consultantId: number) => Array.from({length: 15}, (_, i) => ({
    id: i + 1,
    amount: (1000 + Math.random() * 9000).toFixed(2),
    status: ['Active', 'Defaulted', 'Recovered'][Math.floor(Math.random() * 3)],
  }));

  // Render functions for drill-down
  const renderDistricts = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {mockDistricts.map(district => (
        <div
          key={district.id}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md"
          onClick={() => {
            setSelectedDistrict(district.id);
            setDrillView('branches');
          }}
        >
          <h3 className="font-bold">{district.name}</h3>
          <p>Default Rate: {district.avgDefaultRate}%</p>
          <p>Recovery Rate: {district.avgRecoveryRate}%</p>
        </div>
      ))}
    </div>
  );

  const renderBranches = () => {
    if (!selectedDistrict) return null;
    const branches = mockBranches(selectedDistrict);
    return (
      <div>
        <button onClick={() => setDrillView('districts')} className="mb-4 text-blue-500">Back to Districts</button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branches.map(branch => (
            <div
              key={branch.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md"
              onClick={() => {
                setSelectedBranch(branch.id);
                setDrillView('consultants');
              }}
            >
              <h3 className="font-bold">{branch.name}</h3>
              <p>Default Rate: {branch.avgDefaultRate}%</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderConsultants = () => {
    if (!selectedBranch) return null;
    const consultants = mockConsultants(selectedBranch);
    return (
      <div>
        <button onClick={() => setDrillView('branches')} className="mb-4 text-blue-500">Back to Branches</button>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {consultants.map(consultant => (
            <div
              key={consultant.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md"
              onClick={() => {
                setSelectedConsultant(consultant.id);
                setDrillView('transactions');
              }}
            >
              <h3 className="font-bold">{consultant.name}</h3>
              <p>Performance: {consultant.performance}%</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTransactions = () => {
    if (!selectedConsultant) return null;
    const transactions = mockTransactions(selectedConsultant);
    return (
      <div>
        <button onClick={() => setDrillView('consultants')} className="mb-4 text-blue-500">Back to Consultants</button>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th>ID</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.id}</td>
                  <td>K{transaction.amount}</td>
                  <td>{transaction.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const summaryData = getInstitutionalSummaryData('province', 'Provincial View');

  return (
    <DashboardBase
      title="Provincial Manager Dashboard"
      subtitle="Provincial strategic oversight, portfolio health, and growth leadership"
    >
      {/* Institutional Health Summary - Landing Page View */}
      <InstitutionalHealthSummary
        userLevel="province"
        userLevelLabel="Provincial View"
        parameters={summaryData.parameters}
        recentActivities={summaryData.recentActivities}
        overallScore={summaryData.overallScore}
        overallInstAvg={summaryData.overallInstAvg}
        overallTarget={summaryData.overallTarget}
      />


      <div className="grid grid-cols-12 gap-4 md:gap-6 mt-6">
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
        
        
        {/* Provincial Health - Dynamic from API */}
        <div className="col-span-12">
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
