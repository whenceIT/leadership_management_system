'use client';

import React, { useState, useEffect } from 'react';
import {
  DashboardBase,
  KPICard,
  AlertCard,
  SectionCard,
  QuickInfoBar,
  KPIMetricsCard,
  CollapsibleCard
} from './DashboardBase';

import { InstitutionalHealthSummary, getInstitutionalSummaryData } from './InstitutionalHealthSummary';
import { useUserKPI } from '@/hooks/useUserKPI';
import ProvincialDataService, { ProvincialPerformanceData } from '@/services/ProvincialDataService';

// Institutional level API hooks
import { useInstitutionalStaffAdequacy } from '@/hooks/useInstitutionalStaffAdequacy';
import { useInstitutionalProductivityAchievement } from '@/hooks/useInstitutionalProductivityAchievement';
import { useInstitutionalVacancyImpact } from '@/hooks/useInstitutionalVacancyImpact';
import { useInstitutionalVolumeAchievement } from '@/hooks/useInstitutionalVolumeAchievement';
import { useInstitutionalPortfolioLoadBalance } from '@/hooks/useInstitutionalPortfolioLoadBalance';
import { useInstitutionalCollectionEfficiency } from '@/hooks/useInstitutionalCollectionEfficiency';
import { useInstitutionalPortfolioQuality } from '@/hooks/useInstitutionalPortfolioQuality';
import { useInstitutionalProductDiversification } from '@/hooks/useInstitutionalProductDiversification';
import { useInstitutionalProductRiskScore } from '@/hooks/useInstitutionalProductRiskScore';
import { useInstitutionalYieldAchievement } from '@/hooks/useInstitutionalYieldAchievement';
import { useInstitutionalMonth3RecoveryAchievements } from '@/hooks/useInstitutionalMonth3RecoveryAchievements';
import { useInstitutionalEfficiencyRatio } from '@/hooks/useInstitutionalEfficiencyRatio';
import { useInstitutionalGrowthTrajectory } from '@/hooks/useInstitutionalGrowthTrajectory';
import { useInstitutionalLongTermDelinquency } from '@/hooks/useInstitutionalLongTermDelinquency';
import { useInstitutionalMonth1DefaultRate } from '@/hooks/useInstitutionalMonth1DefaultRate';
import { useInstitutionalRevenueAchievements } from '@/hooks/useInstitutionalRevenueAchievements';
import { useInstitutionalProfitabilityContribution } from '@/hooks/useInstitutionalProfitabilityContribution';
import { useInstitutionalRollRateControl } from '@/hooks/useInstitutionalRollRateControl';

export default function ExecutiveChairpersonDashboard({ userTier }: { userTier?: string }) {
  const [provincialData, setProvincialData] = useState<ProvincialPerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get user-specific KPI data
  const { processedKPIs, isLoading: isKpiLoading, error: kpiError } = useUserKPI();
  
  // Build KPIs from user-specific KPI data
  const kpis = processedKPIs.length > 0 ? processedKPIs.map(kpi => ({
    name: kpi.name,
    baseline: kpi.baseline.toString(),
    target: kpi.target.toString(),
    weight: `${kpi.weight}%`
  })) : [];

  // Institutional level API data fetching
  const { data: staffAdequacyData } = useInstitutionalStaffAdequacy();
  const { data: productivityAchievementData } = useInstitutionalProductivityAchievement();
  const { data: vacancyImpactData } = useInstitutionalVacancyImpact();
  const { data: volumeAchievementData } = useInstitutionalVolumeAchievement();
  const { data: portfolioLoadBalanceData } = useInstitutionalPortfolioLoadBalance();
  const { data: collectionEfficiencyData } = useInstitutionalCollectionEfficiency();
  const { data: portfolioQualityData } = useInstitutionalPortfolioQuality();
  const { data: productDiversificationData } = useInstitutionalProductDiversification();
  const { data: productRiskScoreData } = useInstitutionalProductRiskScore();
  const { data: yieldAchievementData } = useInstitutionalYieldAchievement();
  const { data: month3RecoveryData } = useInstitutionalMonth3RecoveryAchievements();
  const { data: efficiencyRatioData } = useInstitutionalEfficiencyRatio();
  const { data: growthTrajectoryData } = useInstitutionalGrowthTrajectory();
  const { data: longTermDelinquencyData } = useInstitutionalLongTermDelinquency();
  const { data: month1DefaultData } = useInstitutionalMonth1DefaultRate();
  const { data: revenueAchievementsData } = useInstitutionalRevenueAchievements();
  const { data: profitabilityContributionData } = useInstitutionalProfitabilityContribution();
  const { data: rollRateControlData } = useInstitutionalRollRateControl();

  // Fetch provincial performance data
  useEffect(() => {
    const fetchProvincialData = async () => {
      try {
        setIsLoading(true);
        const data: ProvincialPerformanceData[] = [];
        
        // Fetch data for all provinces (simulated)
        const provinces = [1, 2, 3, 4, 5]; // Lusaka, Copperbelt, Southern, Eastern, Northern
        for (const provinceId of provinces) {
          const service = ProvincialDataService.getInstance();
          const provinceData = await service.fetchProvincialPerformance({
            province_id: provinceId,
            include_details: true,
          });
          if (provinceData) {
            data.push(provinceData);
          }
        }
        
        setProvincialData(data);
      } catch (error) {
        console.error('Error fetching provincial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvincialData();
  }, []);

  // Province data
  const provinceNames = {
    1: "Lusaka Province",
    2: "Copperbelt Province",
    3: "Southern Province",
    4: "Eastern Province",
    5: "Northern Province"
  };

  // Drill-down states
  const [view, setView] = useState<'provinces' | 'districts' | 'branches' | 'officers' | 'transactions'>('provinces');
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<number | null>(null);

  

  // Mock data
  const mockProvinces = Array.from({length: 10}, (_, i) => ({
    id: i + 1,
    name: `Province ${i + 1}`,
    avgDefaultRate: (25 + Math.random() * 10).toFixed(2),
    avgRecoveryRate: (50 + Math.random() * 20).toFixed(2),
  }));

  const mockDistricts = (provinceId: number) => Array.from({length: 3}, (_, i) => ({
    id: i + 1,
    name: `District ${i + 1} in Province ${provinceId}`,
    avgDefaultRate: (25 + Math.random() * 10).toFixed(2),
  }));

  const mockBranches = (districtId: number) => Array.from({length: 5}, (_, i) => ({
    id: i + 1,
    name: `Branch ${i + 1} in District ${districtId}`,
    avgDefaultRate: (25 + Math.random() * 10).toFixed(2),
  }));

  const mockOfficers = (branchId: number) => Array.from({length: 10}, (_, i) => ({
    id: i + 1,
    name: `Officer ${i + 1} in   ${branchId}`,
    performance: (70 + Math.random() * 30).toFixed(2),
  }));

  const mockTransactions = (officerId: number) => Array.from({length: 20}, (_, i) => ({
    id: i + 1,
    amount: (1000 + Math.random() * 9000).toFixed(2),
    status: ['Active', 'Defaulted', 'Recovered'][Math.floor(Math.random() * 3)],
  }));

  // Render functions
  const renderProvinces = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {mockProvinces.map(province => (
        <div
          key={province.id}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md border border-gray-100 dark:border-gray-700 hover:border-blue-300 transition-all"
          onClick={() => {
            setSelectedProvince(province.id);
            setView('districts');
          }}
        >
          <h3 className="font-bold text-gray-900 dark:text-white">{province.name}</h3>
          <p className="text-sm text-gray-500 mt-1">Default Rate: <span className="font-semibold text-red-600">{province.avgDefaultRate}%</span></p>
          <p className="text-sm text-gray-500">Recovery Rate: <span className="font-semibold text-green-600">{province.avgRecoveryRate}%</span></p>
          <p className="text-xs text-blue-500 mt-2">Click to drill down →</p>
        </div>
      ))}
    </div>
  );

  const renderDistricts = () => {
    if (!selectedProvince) return null;
    const districts = mockDistricts(selectedProvince);
    return (
      <div>
        <button onClick={() => setView('provinces')} className="mb-4 text-blue-500 hover:underline flex items-center gap-1">
          ← Back to Provinces
        </button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {districts.map(district => (
            <div
              key={district.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md border border-gray-100 dark:border-gray-700 hover:border-blue-300 transition-all"
              onClick={() => {
                setSelectedDistrict(district.id);
                setView('branches');
              }}
            >
              <h3 className="font-bold text-gray-900 dark:text-white">{district.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Default Rate: <span className="font-semibold text-red-600">{district.avgDefaultRate}%</span></p>
              <p className="text-xs text-blue-500 mt-2">Click to drill down →</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBranches = () => {
    if (!selectedDistrict) return null;
    const branches = mockBranches(selectedDistrict);
    return (
      <div>
        <button onClick={() => setView('districts')} className="mb-4 text-blue-500 hover:underline flex items-center gap-1">
          ← Back to Districts
        </button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branches.map(branch => (
            <div
              key={branch.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md border border-gray-100 dark:border-gray-700 hover:border-blue-300 transition-all"
              onClick={() => {
                setSelectedBranch(branch.id);
                setView('officers');
              }}
            >
              <h3 className="font-bold text-gray-900 dark:text-white">{branch.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Default Rate: <span className="font-semibold text-red-600">{branch.avgDefaultRate}%</span></p>
              <p className="text-xs text-blue-500 mt-2">Click to drill down →</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderOfficers = () => {
    if (!selectedBranch) return null;
    const officers = mockOfficers(selectedBranch);
    return (
      <div>
        <button onClick={() => setView('branches')} className="mb-4 text-blue-500 hover:underline flex items-center gap-1">
          ← Back to Branches
        </button>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {officers.map(officer => (
            <div
              key={officer.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md border border-gray-100 dark:border-gray-700 hover:border-blue-300 transition-all"
              onClick={() => {
                setSelectedOfficer(officer.id);
                setView('transactions');
              }}
            >
              <h3 className="font-bold text-gray-900 dark:text-white">{officer.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Performance: <span className="font-semibold text-green-600">{officer.performance}%</span></p>
              <p className="text-xs text-blue-500 mt-2">Click to view loans →</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTransactions = () => {
    if (!selectedOfficer) return null;
    const transactions = mockTransactions(selectedOfficer);
    return (
      <div>
        <button onClick={() => setView('officers')} className="mb-4 text-blue-500 hover:underline flex items-center gap-1">
          ← Back to Officers
        </button>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">#{transaction.id}</td>
                  <td className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">K{transaction.amount}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      transaction.status === 'Active' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'Defaulted' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>{transaction.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const summaryData = getInstitutionalSummaryData(
    'institution', 
    'Whence Financial Services — Institutional View',
    staffAdequacyData,
    productivityAchievementData,
    vacancyImpactData,
    portfolioLoadBalanceData,
    volumeAchievementData,
    collectionEfficiencyData,
    efficiencyRatioData,
    growthTrajectoryData,
    longTermDelinquencyData,
    month1DefaultData,
    month3RecoveryData,
    portfolioQualityData,
    productDiversificationData,
    productRiskScoreData,
    rollRateControlData,
    yieldAchievementData,
    revenueAchievementsData,
    profitabilityContributionData
  );

  // Institution metrics
  const institutionMetrics = [
    { title: "Total Branches", value: "--", change: "--", changeType: "positive" as const },
    { title: "Total Staff", value: "--", change: "--", changeType: "positive" as const },
    { title: "Active Loans", value: "--", change: "--", changeType: "positive" as const },
    { title: "Portfolio Value", value: "--", change: "--", changeType: "positive" as const },
    { title: "Collection Rate", value: "--", change: "--", changeType: "positive" as const },
    { title: "M1 Default Rate", value: "--", change: "--", changeType: "positive" as const },
    { title: "Net Profit Margin", value: "--", change: "--", changeType: "positive" as const },
    { title: "Avg Loan Size", value: "--", change: "--", changeType: "positive" as const }
  ];

  return (
    <DashboardBase
      title="Executive Chairperson Dashboard"
      subtitle="Comprehensive organizational oversight and executive decision support"
    >
      {/* Institutional Health Summary - Landing Page View */}
      <InstitutionalHealthSummary
        userLevel="institution"
        userLevelLabel="Whence Financial Services — Institutional View"
        parameters={summaryData.parameters}
        recentActivities={summaryData.recentActivities}
        overallScore={summaryData.overallScore}
        overallInstAvg={summaryData.overallInstAvg}
        overallTarget={summaryData.overallTarget}
        staffAdequacyData={staffAdequacyData}
        productivityAchievementData={productivityAchievementData}
        vacancyImpactData={vacancyImpactData}
        volumeAchievementData={volumeAchievementData}
        loanPortfolioLoadData={portfolioLoadBalanceData}
        collectionEfficiencyData={collectionEfficiencyData}
        efficiencyRatioData={efficiencyRatioData}
        growthTrajectoryData={growthTrajectoryData}
        longTermDelinquencyData={longTermDelinquencyData}
        month1DefaultPerformanceData={month1DefaultData}
        month3RecoveryAchievementsData={month3RecoveryData}
        portfolioQualityData={portfolioQualityData}
        productDiversificationData={productDiversificationData}
        productRiskScoreData={productRiskScoreData}
        rollRateControlData={rollRateControlData}
        yieldAchievementsData={yieldAchievementData}
        revenueAchievementsData={revenueAchievementsData}
        profitabilityContributionData={profitabilityContributionData}
      />
    
    

      
    </DashboardBase>
  );
}
