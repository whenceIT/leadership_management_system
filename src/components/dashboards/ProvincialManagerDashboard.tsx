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
import { InstitutionalHealthSummary, getInstitutionalSummaryData } from './InstitutionalHealthSummary';
import ProvincialDataService, {
  BranchPerformance, 
  ProvinceSummary,
  ProvincialPerformanceData 
} from '@/services/ProvincialDataService';
import { useUserPosition } from '@/hooks/useUserPosition';
import { useOffice } from '@/hooks/useOffice';
import { useUserKPI, ProcessedKPI } from '@/hooks/useUserKPI';
import { useProvince } from '@/hooks/useProvince';
import { useProvincialStaffAdequacy } from '@/hooks/useStaffAdequacy';
import { useProvincialCollectionEfficiency } from '@/hooks/useProvincialCollectionEfficiency';
import { useProvincialPortfolioQuality } from '@/hooks/useProvincialPortfolioQuality';
import { useProvincialProductDiversification } from '@/hooks/useProvincialProductDiversification';
import { useProvincialProductRiskScore } from '@/hooks/useProvincialProductRiskScore';
import { useProvincialProductivityAchievement } from '@/hooks/useProvincialProductivityAchievement';
import { useProvincialVacancyImpact } from '@/hooks/useProvincialVacancyImpact';
import { useProvincialVolumeAchievement } from '@/hooks/useProvincialVolumeAchievement';
import { useProvincialYieldAchievements } from '@/hooks/useProvincialYieldAchievements';
import { useProvincialLoanPortfolioLoad } from '@/hooks/useProvincialLoanPortfolioLoad';
import { useProvincialMonth3RecoveryAchievements } from '@/hooks/useProvincialMonth3RecoveryAchievements';
import { useProvincialEfficiencyRatio } from '@/hooks/useProvincialEfficiencyRatio';
import { useProvincialGrowthTrajectory } from '@/hooks/useProvincialGrowthTrajectory';
import { useProvincialLongTermDelinquency } from '@/hooks/useProvincialLongTermDelinquency';
import { useProvincialRevenueAchievements } from '@/hooks/useProvincialRevenueAchievements';
import { useProvincialProfitabilityContribution } from '@/hooks/useProvincialProfitabilityContribution';
import { useProvincialRollRateControl } from '@/hooks/useProvincialRollRateControl';
import { useProvincialCashPosition } from '@/hooks/useProvincialCashPosition';

export default function ProvincialManagerDashboard() {
  const { user, positionName, isLoading: isPositionLoading } = useUserPosition();
  const { getOffice } = useOffice();
  const { getProvinceName } = useProvince();
  const [performanceData, setPerformanceData] = useState<ProvincialPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  
  // Get user-specific KPI data
  const { processedKPIs, isLoading: isKpiLoading, error: kpiError } = useUserKPI();

  const userProvinceId = Number((user as any)?.province_id ?? (user as any)?.provinceId ?? 0);
  const provinceName = userProvinceId ? getProvinceName(userProvinceId) : null;
  const resolvedProvinceName = provinceName && provinceName !== 'Unknown Province' ? provinceName : null;

  // Get province ID from user's office
  const getProvinceIdFromUser = (): number => {
    if (user?.office_id) {
      const office = getOffice(user.office_id);
      if (office?.provinceId) {
        return parseInt(String(office.provinceId), 10);
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

   const provinceId = getProvinceIdFromUser();
   const { data: staffAdequacyData, isLoading: isStaffAdequacyLoading } = useProvincialStaffAdequacy(provinceId);
   const { data: collectionEfficiencyData } = useProvincialCollectionEfficiency(provinceId);
   const { data: portfolioQualityData } = useProvincialPortfolioQuality(provinceId);
   const { data: productDiversificationData } = useProvincialProductDiversification(provinceId);
   const { data: productRiskScoreData } = useProvincialProductRiskScore(provinceId);
   const { data: productivityAchievementData } = useProvincialProductivityAchievement(provinceId);
   const { data: vacancyImpactData } = useProvincialVacancyImpact(provinceId);
   const { data: volumeAchievementData } = useProvincialVolumeAchievement(provinceId);
   const { data: yieldAchievementsData } = useProvincialYieldAchievements(provinceId);
   const { data: loanPortfolioLoadData } = useProvincialLoanPortfolioLoad(provinceId);
   const { data: month3RecoveryAchievementsData } = useProvincialMonth3RecoveryAchievements(provinceId);
   const { data: efficiencyRatioData } = useProvincialEfficiencyRatio(provinceId);
   const { data: growthTrajectoryData } = useProvincialGrowthTrajectory(provinceId);
   const { data: longTermDelinquencyData } = useProvincialLongTermDelinquency(provinceId);
   const { data: revenueAchievementsData } = useProvincialRevenueAchievements(provinceId);
   const { data: profitabilityContributionData } = useProvincialProfitabilityContribution(provinceId);
   const { data: rollRateControlData } = useProvincialRollRateControl(provinceId);
   const { data: cashPositionData } = useProvincialCashPosition(provinceId);

     const summaryData = getInstitutionalSummaryData('province', 'Provincial View', staffAdequacyData, productivityAchievementData, vacancyImpactData, loanPortfolioLoadData, undefined, collectionEfficiencyData, efficiencyRatioData, growthTrajectoryData, longTermDelinquencyData, undefined, month3RecoveryAchievementsData, portfolioQualityData, productDiversificationData, productRiskScoreData, rollRateControlData, yieldAchievementsData, revenueAchievementsData, profitabilityContributionData, cashPositionData, undefined);

   return (
    <DashboardBase
      title="Provincial Manager Dashboard"
      subtitle="Provincial strategic oversight, portfolio health, and growth leadership"
      provinceName={resolvedProvinceName}
    >
      {/* Institutional Health Summary - Landing Page View */}
      <InstitutionalHealthSummary
        userLevel="province"
        userLevelLabel="Provincial View"
        userProvinceId={provinceId}
        parameters={summaryData.parameters}
        recentActivities={summaryData.recentActivities}
        overallScore={summaryData.overallScore}
        previousScore={summaryData.previousScore}
        prevMonthScores={summaryData.prevMonthScores}
        overallInstAvg={summaryData.overallInstAvg}
        overallTarget={summaryData.overallTarget}
        staffAdequacyData={staffAdequacyData}
        productivityAchievementData={productivityAchievementData}
        vacancyImpactData={vacancyImpactData}
        volumeAchievementData={volumeAchievementData}
        loanPortfolioLoadData={loanPortfolioLoadData}
        collectionEfficiencyData={collectionEfficiencyData}
        portfolioQualityData={portfolioQualityData}
        productDiversificationData={productDiversificationData}
        productRiskScoreData={productRiskScoreData}
        yieldAchievementsData={yieldAchievementsData}
        month3RecoveryAchievementsData={month3RecoveryAchievementsData}
        efficiencyRatioData={efficiencyRatioData}
        growthTrajectoryData={growthTrajectoryData}
        longTermDelinquencyData={longTermDelinquencyData}
        revenueAchievementsData={revenueAchievementsData}
        profitabilityContributionData={profitabilityContributionData}
         rollRateControlData={rollRateControlData}
         cashPositionData={cashPositionData}
         isLoading={isLoading || isPositionLoading || isKpiLoading || isStaffAdequacyLoading}
        />


      
    </DashboardBase>
  );
}
