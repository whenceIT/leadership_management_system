'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useOffice } from '@/hooks/useOffice';
import { useProvince } from '@/hooks/useProvince';
import { useDistrict } from '@/hooks/useDistrict';

// Import all provincial service functions (we'll reuse them for branch level)
import { fetchStaffAdequacyPerformance } from '@/services/StaffAdequacyService';
import { fetchProductivityAchievement } from '@/services/ProductivityAchievementService';
import { fetchVacancyImpact } from '@/services/VacancyImpactService';
import { fetchLoanPortfolioLoad } from '@/services/LoanPortfolioLoadService';
import { fetchVolumeAchievement } from '@/services/VolumeAchievementService';
import { fetchPortfolioQuality } from '@/services/PortfolioQualityService';
import { fetchMonth1DefaultPerformance } from '@/services/Month1DefaultPerformanceService';
import { fetchCollectionEfficiency } from '@/services/CollectionEfficiencyService';
import { fetchProductRiskScore } from '@/services/ProductRiskScoreService';
import { fetchProductDiversification } from '@/services/ProductDiversificationService';
import { fetchYieldAchievements } from '@/services/YieldAchievementsService';
import { fetchEfficiencyRatio } from '@/services/EfficiencyRatioService';
import { fetchLongTermDelinquency } from '@/services/LongTermDelinquencyService';
import { fetchMonth3RecoveryAchievements } from '@/services/Month3RecoveryAchievementsService';
import { fetchRollRateControl } from '@/services/RollRateControlService';
import { fetchGrowthTrajectory } from '@/services/GrowthTrajectoryService';
import { fetchRevenueAchievements } from '@/services/RevenueAchievementsService';
import { fetchProfitabilityContribution } from '@/services/ProfitabilityContributionService';
import { fetchCashPosition } from '@/services/CashPositionService';
import { fetchAboveThresholdRisk } from '@/services/AboveThresholdRiskService';
import { fetchBelowThresholdRisk } from '@/services/BelowThresholdRiskService';

interface BranchLevelViewProps {
  selectedKPI: string;
  selectedProvince: number;
  selectedDistrict: number | string | null;
  onBranchClick: (branchId: number) => void;
  onBack: () => void;
}

export function BranchLevelView({ selectedKPI, selectedProvince, selectedDistrict, onBranchClick, onBack }: BranchLevelViewProps) {
  const { getOfficesByProvince, getOfficesByDistrict } = useOffice();
  const { getProvinceName } = useProvince();
  const { getDistrictName } = useDistrict();
  const provinceName = getProvinceName(selectedProvince);
  const districtName = selectedDistrict ? getDistrictName(typeof selectedDistrict === 'string' ? parseInt(selectedDistrict) : selectedDistrict) : null;
  const [branchData, setBranchData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize branches to prevent infinite re-renders
  // Filter by district if selected, otherwise by province
  const branches = useMemo(() => {
    if (selectedDistrict) {
      return getOfficesByDistrict(selectedDistrict);
    }
    return getOfficesByProvince(selectedProvince);
  }, [selectedProvince, selectedDistrict, getOfficesByProvince, getOfficesByDistrict]);

  // Fetch branch data for the selected KPI
  useEffect(() => {
    // Skip if no branches or no KPI selected
    if (!selectedKPI || branches.length === 0) return;
    
    const fetchBranchData = async () => {
      setLoading(true);
      setError(null);
      const newBranchData: Record<string, any> = {};

      try {
        for (const branch of branches) {
          try {
            const branchId = String(branch.id);
            let data: any = null;
            
            switch(selectedKPI) {
              case 'Staff Adequacy Score':
                data = await fetchStaffAdequacyPerformance(parseInt(branchId));
                break;
              case 'Productivity Achievement Score':
                data = await fetchProductivityAchievement(parseInt(branchId));
                break;
              case 'Volume Achievement':
                data = await fetchVolumeAchievement(parseInt(branchId));
                break;
              case 'Vacancy Impact':
                data = await fetchVacancyImpact(parseInt(branchId));
                break;
              case 'Portfolio Quality Score':
                data = await fetchPortfolioQuality(parseInt(branchId));
                break;
              case 'Vetting compliance':
                data = await fetchProductRiskScore(parseInt(branchId));
                break;
              case 'Collection Efficiency':
                data = await fetchCollectionEfficiency(parseInt(branchId));
                break;
              case 'Yield Achievement':
                data = await fetchYieldAchievements(parseInt(branchId));
                break;
              case 'Product diversification':
                data = await fetchProductDiversification(parseInt(branchId));
                break;
              case 'Product Risk Score':
                data = await fetchProductRiskScore(parseInt(branchId));
                break;
              case 'Month-1 Default Performance':
                data = await fetchMonth1DefaultPerformance(parseInt(branchId));
                break;
              case '3-Month Recovery Achievement':
                data = await fetchMonth3RecoveryAchievements(parseInt(branchId));
                break;
              case 'Roll-Rate Control':
                data = await fetchRollRateControl(parseInt(branchId));
                break;
              case 'Long-Term Delinquency Risk':
                data = await fetchLongTermDelinquency(parseInt(branchId));
                break;
              case 'Revenue Achievement':
                data = await fetchRevenueAchievements(parseInt(branchId));
                break;
              case 'Efficiency Ratio (CIR)':
                data = await fetchEfficiencyRatio(parseInt(branchId));
                break;
              case 'Profitability Contribution':
                data = await fetchProfitabilityContribution(parseInt(branchId));
                break;
              case 'Growth Trajectory':
                data = await fetchGrowthTrajectory(parseInt(branchId));
                break;
              case 'Cash Position Score':
                data = await fetchCashPosition(parseInt(branchId));
                break;
              case 'Above-Threshold Risk':
                data = await fetchAboveThresholdRisk(parseInt(branchId));
                break;
              case 'Below-Threshold Risk':
                data = await fetchBelowThresholdRisk(parseInt(branchId));
                break;
              case 'Portfolio Load Balance':
                data = await fetchLoanPortfolioLoad(parseInt(branchId));
                break;
            }
            newBranchData[branchId] = data;
          } catch (err) {
            console.error(`Error fetching data for branch ${branch.id}:`, err);
          }
        }
        setBranchData(newBranchData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch branch data');
      } finally {
        setLoading(false);
      }
    };

    fetchBranchData();
  }, [selectedKPI, branches]);

  // Helper functions to calculate trend and status
  const getTrendBadge = (trend: '↑' | '↓' | '→') => {
    if (trend === '↑') return 'text-green-600 dark:text-gray-600 text-lg font-bold';
    if (trend === '↓') return 'text-red-600 dark:text-gray-600 text-lg font-bold';
    return 'text-orange-500 dark:text-gray-600 text-lg font-bold';
  };

  const getStatusBadge = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
  };

  const getVarianceColor = (variance: string) => {
    if (variance.startsWith('+')) return 'text-red-600 dark:text-red-400 font-semibold';
    if (variance.startsWith('-')) return 'text-green-600 dark:text-green-400 font-semibold';
    return 'text-gray-600 dark:text-gray-400';
  };

  // Helper function to extract KPI value from data
  const getKPIValue = (data: any, selectedKPI: string): { current: string; target: string; variance: string; trend: '↑' | '↓' | '→'; status: 'good' | 'warning' | 'critical'; contribution: string; actualLcs: number } => {
    // Default values
    let current = '--';
    let target = '100%';
    let variance = '--';
    let trend: '↑' | '↓' | '→' = '→';
    let status: 'good' | 'warning' | 'critical' = 'warning';
    let contribution = '--';
    let actualLcs = 0;

    if (!data) return { current, target, variance, trend, status, contribution, actualLcs };

    // Extract actual_lcs if available
    actualLcs = data.actual_lcs || 0;
    
    // Extract contribution (percentage_points) if available
    if (data.percentage_point) {
      contribution = `${parseFloat(data.percentage_point).toFixed(2)}pp`;
    } else if (data.weight) {
      // Calculate contribution based on normalized_score and weight
      const weight = parseFloat(data.weight.replace('%', '')) / 100;
      const score = parseFloat(data.normalized_score || '0');
      contribution = `${(score * weight / 100).toFixed(2)}pp`;
    }

    // Extract values based on KPI type
    if (selectedKPI === 'Staff Adequacy Score') {
      current = data.normalized_score ? `${parseFloat(data.normalized_score).toFixed(2)}%` : '--';
      target = '100%';
      if (data.normalized_score) {
        const score = parseFloat(data.normalized_score);
        variance = `${(score - 100).toFixed(2)}%`;
        trend = score >= 90 ? '↑' : score >= 70 ? '→' : '↓';
        status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
      }
    } else if (selectedKPI === 'Productivity Achievement') {
      current = data.normalized_score ? `${parseFloat(data.normalized_score).toFixed(2)}%` : '--';
      target = '100%';
      if (data.normalized_score) {
        const score = parseFloat(data.normalized_score);
        variance = `${(score - 100).toFixed(2)}%`;
        trend = score >= 90 ? '↑' : score >= 70 ? '→' : '↓';
        status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
      }
    } else if (selectedKPI === 'Vacancy Impact') {
      current = data.normalized_score ? `${(parseFloat(data.normalized_score) * 100).toFixed(2)}%` : '--';
      target = '0%';
      if (data.normalized_score) {
        const score = parseFloat(data.normalized_score) * 100;
        variance = `${(score - 0).toFixed(2)}%`;
        trend = score <= 10 ? '↑' : score <= 20 ? '→' : '↓';
        status = score <= 10 ? 'good' : score <= 20 ? 'warning' : 'critical';
      }
    } else if (selectedKPI === 'Portfolio Load Balance') {
      current = data.score ? `${parseFloat(data.score).toFixed(2)}%` : '--';
      target = '100%';
      if (data.score) {
        const score = parseFloat(data.score);
        variance = `${(score - 100).toFixed(2)}%`;
        trend = score >= 90 ? '↑' : score >= 70 ? '→' : '↓';
        status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
      }
    } else if (selectedKPI === 'Volume Achievement') {
      current = data.normalized_score ? `${parseFloat(data.normalized_score).toFixed(2)}%` : '--';
      target = data.branch_target ? `≥${parseFloat(data.branch_target).toLocaleString()}` : '≥420000';
      if (data.normalized_score) {
        const score = parseFloat(data.normalized_score);
        variance = `${(score - 100).toFixed(2)}%`;
        trend = score >= 90 ? '↑' : score >= 70 ? '→' : '↓';
        status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
      }
    } else if (selectedKPI === 'Portfolio quality') {
      current = data.PAR ? `${parseFloat(data.PAR).toFixed(2)}%` : '--';
      target = '≤5%';
      if (data.PAR) {
        const score = parseFloat(data.PAR);
        variance = `${(score - 5).toFixed(2)}%`;
        trend = score <= 5 ? '↑' : score <= 10 ? '→' : '↓';
        status = score <= 5 ? 'good' : score <= 10 ? 'warning' : 'critical';
      }
    } else if (selectedKPI === 'Default contribution' || selectedKPI === 'Default rate (branch, province, institutional)') {
      current = data.month_1_default_rate ? `${parseFloat(data.month_1_default_rate).toFixed(2)}%` : '--';
      target = '≤15%';
      if (data.month_1_default_rate) {
        const score = parseFloat(data.month_1_default_rate);
        variance = `${(score - 15).toFixed(2)}%`;
        trend = score <= 15 ? '↑' : score <= 20 ? '→' : '↓';
        status = score <= 15 ? 'good' : score <= 20 ? 'warning' : 'critical';
      }
    } else if (selectedKPI === 'Collections efficiency') {
      current = data.benchmark ? `${parseFloat(data.benchmark).toFixed(2)}%` : '--';
      target = '≥75%';
      if (data.benchmark) {
        const score = parseFloat(data.benchmark);
        variance = `${(score - 75).toFixed(2)}%`;
        trend = score >= 75 ? '↑' : score >= 65 ? '→' : '↓';
        status = score >= 75 ? 'good' : score >= 65 ? 'warning' : 'critical';
      }
    } else if (selectedKPI === 'Vetting compliance' || selectedKPI === 'Product risk contribution') {
      current = data.defaulted_rate ? `${parseFloat(data.defaulted_rate).toFixed(2)}` : '--';
      target = '≤1.0';
      if (data.defaulted_rate) {
        const score = parseFloat(data.defaulted_rate);
        variance = `${(score - 1.0).toFixed(2)}`;
        trend = score <= 1.0 ? '↑' : score <= 1.5 ? '→' : '↓';
        status = score <= 1.0 ? 'good' : score <= 1.5 ? 'warning' : 'critical';
      }
    } else if (selectedKPI === 'Product distribution mix') {
      current = data.HHI ? `${parseFloat(data.HHI).toFixed(3)}` : '--';
      target = 'HHI < 0.3';
      if (data.HHI) {
        const score = parseFloat(data.HHI);
        variance = `${(score - 0.3).toFixed(3)}`;
        trend = score < 0.3 ? '↑' : score < 0.4 ? '→' : '↓';
        status = score < 0.3 ? 'good' : score < 0.4 ? 'warning' : 'critical';
      }
    } else if (selectedKPI === 'Revenue yield per product') {
      current = data.effective_interest_rate ? `${parseFloat(data.effective_interest_rate).toFixed(2)}%` : '--';
      target = data.target || '≥38.2%';
      if (data.effective_interest_rate) {
        const score = parseFloat(data.effective_interest_rate);
        const targetValue = parseFloat(data.target || '38.2');
        variance = `${(score - targetValue).toFixed(2)}%`;
        trend = score >= targetValue ? '↑' : score >= targetValue * 0.9 ? '→' : '↓';
        status = score >= targetValue ? 'good' : score >= targetValue * 0.9 ? 'warning' : 'critical';
      }
    } else if (selectedKPI === 'Margin alignment with strategy' || selectedKPI === 'Cost-to-income ratios') {
      current = data.CIR ? `${parseFloat(data.CIR).toFixed(2)}%` : '--';
      target = data.target || '≤55%';
      if (data.CIR) {
        const score = parseFloat(data.CIR);
        const targetValue = parseFloat(data.target || '55');
        variance = `${(score - targetValue).toFixed(2)}%`;
        trend = score <= targetValue ? '↑' : score <= targetValue * 1.1 ? '→' : '↓';
        status = score <= targetValue ? 'good' : score <= targetValue * 1.1 ? 'warning' : 'critical';
      }
    } else if (selectedKPI === 'Default aging analysis') {
      current = data.long_term_default_rate ? `${parseFloat(data.long_term_default_rate).toFixed(2)}%` : '--';
      target = data.target || '≤43.95%';
      if (data.long_term_default_rate) {
        const score = parseFloat(data.long_term_default_rate);
        const targetValue = parseFloat(data.target || '43.95');
        variance = `${(score - targetValue).toFixed(2)}%`;
        trend = score <= targetValue ? '↑' : score <= targetValue * 1.1 ? '→' : '↓';
        status = score <= targetValue ? 'good' : score <= targetValue * 1.1 ? 'warning' : 'critical';
      }
    } else if (selectedKPI === 'Recovery rate within 1 month' || selectedKPI === 'Recovery rate within 3 months') {
      current = data.recovery_rate_3_months ? `${parseFloat(data.recovery_rate_3_months).toFixed(2)}%` : '--';
      target = '≥100%';
      if (data.recovery_rate_3_months) {
        const score = parseFloat(data.recovery_rate_3_months);
        variance = `${(score - 100).toFixed(2)}%`;
        trend = score >= 100 ? '↑' : score >= 90 ? '→' : '↓';
        status = score >= 100 ? 'good' : score >= 90 ? 'warning' : 'critical';
      }
    } else if (selectedKPI === 'Risk migration trends') {
      current = data.score ? `${parseFloat(data.score).toFixed(2)}%` : '--';
      target = '≤20%';
      if (data.score) {
        const score = parseFloat(data.score);
        variance = `${(score - 20).toFixed(2)}%`;
        trend = score <= 20 ? '↑' : score <= 30 ? '→' : '↓';
        status = score <= 20 ? 'good' : score <= 30 ? 'warning' : 'critical';
      }
    } else if (selectedKPI === 'Branch revenue' || selectedKPI === 'Growth trajectory alignment') {
      current = data.current_month_revenue ? `K${parseFloat(data.current_month_revenue).toLocaleString()}` : '--';
      target = '≥2.5% MoM growth';
      if (data.mom_revenue) {
        const score = data.mom_revenue * 100;
        variance = `${score.toFixed(2)}%`;
        trend = score >= 2.5 ? '↑' : score >= 0 ? '→' : '↓';
        status = score >= 2.5 ? 'good' : score >= 0 ? 'warning' : 'critical';
      }
    } else if (selectedKPI === 'Institutional average performance') {
      current = data.normalized_score ? `${parseFloat(data.normalized_score).toFixed(2)}%` : '--';
      target = '≥100%';
      if (data.normalized_score) {
        const score = parseFloat(data.normalized_score);
        variance = `${(score - 100).toFixed(2)}%`;
        trend = score >= 100 ? '↑' : score >= 90 ? '→' : '↓';
        status = score >= 100 ? 'good' : score >= 90 ? 'warning' : 'critical';
      }
    } else if (selectedKPI === 'Revenue achievement') {
      current = data.normalized_score ? `${parseFloat(data.normalized_score).toFixed(2)}%` : '--';
      target = data.target || '≥100%';
      if (data.normalized_score) {
        const score = parseFloat(data.normalized_score);
        const targetValue = parseFloat(data.target || '100');
        variance = `${(score - targetValue).toFixed(2)}%`;
        trend = score >= targetValue ? '↑' : score >= targetValue * 0.9 ? '→' : '↓';
        status = score >= targetValue ? 'good' : score >= targetValue * 0.9 ? 'warning' : 'critical';
      }
    } else if (selectedKPI === 'Profitability contribution') {
      current = data.normalized_score ? `${parseFloat(data.normalized_score).toFixed(2)}%` : '--';
      target = data.target || '≥ institutional avg';
      if (data.normalized_score) {
        const score = parseFloat(data.normalized_score);
        const targetValue = parseFloat(data.target || '100');
        variance = `${(score - targetValue).toFixed(2)}%`;
        trend = score >= 90 ? '↑' : score >= 70 ? '→' : '↓';
        status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
      }
    } else if (selectedKPI === 'Cash Position Score') {
      current = data.score ? `${parseFloat(data.score).toFixed(2)}%` : '--';
      target = 'Within range';
      if (data.score) {
        const score = parseFloat(data.score);
        variance = `${(score - 100).toFixed(2)}%`;
        trend = score >= 90 ? '↑' : score >= 70 ? '→' : '↓';
        status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
      }
    } else if (selectedKPI === 'Above-Threshold Risk' || selectedKPI === 'Below-Threshold Risk') {
      current = data.score ? `${parseFloat(data.score).toFixed(2)}%` : '--';
      target = 'Zero';
      if (data.score) {
        const score = parseFloat(data.score);
        variance = `${(score - 100).toFixed(2)}%`;
        trend = score >= 90 ? '↑' : score >= 70 ? '→' : '↓';
        status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
      }
    }

    return { current, target, variance, trend, status, contribution, actualLcs };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-800"></div>
          <div className="absolute top-0 left-0 animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-500 border-r-blue-500" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        </div>
        <span className="mt-4 text-gray-600 dark:text-gray-300 animate-pulse">Loading branch data...</span>
      </div>
    );
  }

  // Function to extract numeric value from KPI string for sorting
  const getNumericKPIValue = (kpiString: string): number => {
    // Extract numeric value from strings like "95.5%", "1.2", "K123456"
    const match = kpiString.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  // Calculate Province Avg by summing Branch Avg values
  const calculateProvinceAvg = () => {
    let total = 0;
    let count = 0;
    
    branches.forEach(branch => {
      const data = branchData[branch.id];
      const kpiValue = getKPIValue(data, selectedKPI);
      const numericValue = getNumericKPIValue(kpiValue.current);
      
      if (!isNaN(numericValue)) {
        total += numericValue;
        count++;
      }
    });
    
    if (count === 0) return '--';
    
    const average = total / count;
    
    // Determine the format based on selected KPI
    if (selectedKPI === 'Product distribution mix') {
      return `${average.toFixed(3)}`; // HHI format
    } else if (selectedKPI === 'Vetting compliance' || selectedKPI === 'Product risk contribution') {
      return `${average.toFixed(2)}`; // Decimal format
    } else if (selectedKPI === 'Branch revenue') {
      return `K${average.toLocaleString()}`; // Currency format
    } else {
      return `${average.toFixed(2)}%`; // Percentage format
    }
  };

  // Sort branches by Branch Avg (descending)
  const sortedBranches = [...branches].sort((a, b) => {
    const dataA = branchData[a.id];
    const dataB = branchData[b.id];
    
    const kpiValueA = getKPIValue(dataA, selectedKPI);
    const kpiValueB = getKPIValue(dataB, selectedKPI);
    
    const numericValueA = getNumericKPIValue(kpiValueA.current);
    const numericValueB = getNumericKPIValue(kpiValueB.current);
    
    // For KPIs where lower values are better, invert the comparison
    const lowerIsBetterKPIs = [
      'Portfolio quality',
      'Default contribution',
      'Default rate (branch, province, institutional)',
      'Vetting compliance',
      'Product risk contribution',
      'Product distribution mix',
      'Margin alignment with strategy',
      'Cost-to-income ratios',
      'Default aging analysis',
      'Risk migration trends',
      'Vacancy Impact',
      'Above-Threshold Risk',
      'Below-Threshold Risk'
    ];
    
    if (lowerIsBetterKPIs.includes(selectedKPI)) {
      return numericValueA - numericValueB;
    }
    
    return numericValueB - numericValueA;
  });

  const provinceAvg = calculateProvinceAvg();

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 py-8 text-center">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mr-4 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 transform hover:scale-105"
          title="Back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Branches in {districtName ? `${districtName}, ` : ''}{provinceName}
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Province Average: <span className="font-semibold text-blue-600 dark:text-blue-400">{provinceAvg}</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Branch Avg</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actual LCs</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contribution (pp)</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedBranches.map((branch) => {
              const data = branchData[branch.id];
              const kpiValue = getKPIValue(data, selectedKPI);

              return (
                <tr 
                  key={branch.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => onBranchClick(Number(branch.id))}
                >
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{branch.name}</td>
                  <td className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">{kpiValue.current}</td>
                  <td className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400">{kpiValue.actualLcs > 0 ? kpiValue.actualLcs : '--'}</td>
                  <td className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400">{kpiValue.contribution}</td>
                  <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{kpiValue.target}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`${getVarianceColor(kpiValue.variance)}`}>{kpiValue.variance}</span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={getTrendBadge(kpiValue.trend)}>{kpiValue.trend}</span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusBadge(kpiValue.status)}`}>
                      {kpiValue.status === 'good' ? 'GOOD' : kpiValue.status === 'warning' ? 'WARNING' : 'CRITICAL'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
