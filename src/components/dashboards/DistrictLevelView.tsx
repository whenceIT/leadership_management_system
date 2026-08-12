'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useDistrict } from '@/hooks/useDistrict';
import { useProvince } from '@/hooks/useProvince';
import { calculateCashPositionScore, kpiConfigs, calculateProvinceInstitutionAvg } from './ProvinceInstitutionAvg';
import { fetchDistrictStaffAdequacyPerformance } from '@/services/StaffAdequacyService';
import { fetchDistrictProductivityAchievement } from '@/services/ProductivityAchievementService';
import { fetchDistrictVolumeAchievement } from '@/services/VolumeAchievementService';
import { fetchDistrictVacancyImpact } from '@/services/VacancyImpactService';
import { fetchDistrictPortfolioQuality } from '@/services/PortfolioQualityService';
import { fetchDistrictVettingCompliance } from '@/services/VettingComplianceService';
import { fetchDistrictCollectionEfficiency } from '@/services/CollectionEfficiencyService';
import { fetchDistrictYieldAchievements } from '@/services/YieldAchievementsService';
import { fetchDistrictProductDiversification } from '@/services/ProductDiversificationService';
import { fetchDistrictProductRiskScore } from '@/services/ProductRiskScoreService';
import { fetchDistrictMonth1DefaultPerformance } from '@/services/Month1DefaultPerformanceService';
import { fetchDistrictMonth3RecoveryAchievements } from '@/services/Month3RecoveryAchievementsService';
import { fetchDistrictRollRateControl } from '@/services/RollRateControlService';
import { fetchDistrictLongTermDelinquency } from '@/services/LongTermDelinquencyService';
import { fetchDistrictRevenueAchievements } from '@/services/RevenueAchievementsService';
import { fetchDistrictEfficiencyRatio } from '@/services/EfficiencyRatioService';
import { fetchDistrictProfitabilityContribution } from '@/services/ProfitabilityContributionService';
import { fetchDistrictGrowthTrajectory } from '@/services/GrowthTrajectoryService';
import { fetchDistrictCashPosition } from '@/services/CashPositionService';
import { fetchDistrictLoanPortfolioLoad } from '@/services/LoanPortfolioLoadService';

interface DistrictLevelViewProps {
  selectedKPI: string;
  selectedProvince: number;
  onDistrictClick: (districtId: number) => void;
  onBack: () => void;
}

export function DistrictLevelView({ selectedKPI, selectedProvince, onDistrictClick, onBack }: DistrictLevelViewProps) {
  const { getDistrictsByProvince, loading: districtsLoading, error: districtsError } = useDistrict();
  const { getProvinceName } = useProvince();
  
  const provinceName = getProvinceName(selectedProvince);
  const districts = useMemo(() => getDistrictsByProvince(selectedProvince), [selectedProvince, getDistrictsByProvince]);

  const [districtData, setDistrictData] = useState<Record<string, any>>({});
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [showKpiInfo, setShowKpiInfo] = useState<boolean>(false);

  // Sort districts by district average score (highest to lowest)
  const sortedDistricts = useMemo(() => {
    return [...districts].sort((a, b) => {
      const dataA = districtData[a.id];
      const dataB = districtData[b.id];

      if (!dataA || !dataB) return 0;

      let scoreA = 0;
      let scoreB = 0;

      switch(selectedKPI) {
        case 'Staff Adequacy Score':
        case 'Productivity Achievement Score':
          scoreA = parseFloat(dataA.average_normalized_score || '0');
          scoreB = parseFloat(dataB.average_normalized_score || '0');
          break;
        case 'Below-Threshold Risk':
          scoreA = parseFloat(dataA.average_score || '0');
          scoreB = parseFloat(dataB.average_score || '0');
          break;
        default:
          scoreA = parseFloat(dataA.average_score || '0');
          scoreB = parseFloat(dataB.average_score || '0');
          break;
      }

      // Sort descending (highest first), except Below-Threshold Risk where lowest (worst liquidity) should be first
      if (selectedKPI === 'Below-Threshold Risk') {
        return scoreA - scoreB;
      }
      return scoreB - scoreA;
    });
  }, [districts, districtData, selectedKPI]);

  // Calculate Province Average by averaging district scores
  const calculateProvinceAvg = useMemo(() => {
    if (!selectedKPI || districts.length === 0) return '--';
    
    let total = 0;
    let count = 0;
    
    districts.forEach(district => {
      const data = districtData[district.id];
      if (!data) return;
      
      let score = 0;
      switch(selectedKPI) {
        case 'Staff Adequacy Score':
        case 'Productivity Achievement':
        case 'Productivity Achievement Score':
          score = parseFloat(data.average_normalized_score || '0');
          break;
        case 'Below-Threshold Risk':
          score = parseFloat(data.average_score || '0');
          break;
        default:
          score = parseFloat(data.average_score || '0');
          break;
      }
      
      if (!isNaN(score)) {
        total += score;
        count++;
      }
    });
    
    if (count === 0) return '--';
    
    const average = total / count;
    
    // Format based on KPI type
    if (selectedKPI === 'Vacancy Impact') {
      return `${average.toFixed(2)}%`;
    } else if (selectedKPI === 'Portfolio Load Balance') {
      return `${average.toFixed(2)}%`;
    } else if (selectedKPI === 'Product distribution mix') {
      return `${average.toFixed(3)}`;
    } else if (selectedKPI === 'Vetting compliance' || selectedKPI === 'Product risk contribution') {
      return `${average.toFixed(2)}`;
    } else if (selectedKPI === 'Branch revenue') {
      return `K${average.toLocaleString()}`;
    } else {
      return `${average.toFixed(2)}%`;
    }
  }, [selectedKPI, districts, districtData]);

  useEffect(() => {
    // Skip if no districts or no KPI selected
    if (!selectedKPI || districts.length === 0) return;
    
    const fetchKPI = async () => {
      setDataLoading(true);
      setDataError(null);
      const newData: Record<string, any> = {};

      try {
        for (const district of districts) {
          try {
            let data: any = null;
            switch(selectedKPI) {
               case 'Staff Adequacy Score':
                 data = await fetchDistrictStaffAdequacyPerformance(district.id);
                 break;
               case 'Productivity Achievement':
               case 'Productivity Achievement Score':
                 data = await fetchDistrictProductivityAchievement(district.id);
                 break;
              case 'Volume Achievement':
                data = await fetchDistrictVolumeAchievement(district.id);
                break;
              case 'Vacancy Impact':
                data = await fetchDistrictVacancyImpact(district.id);
                break;
              case 'Portfolio Quality Score':
                data = await fetchDistrictPortfolioQuality(district.id);
                break;
              case 'Vetting compliance':
                data = await fetchDistrictVettingCompliance(district.id);
                break;
              case 'Collection Efficiency':
                data = await fetchDistrictCollectionEfficiency(district.id);
                break;
              case 'Yield Achievement':
                data = await fetchDistrictYieldAchievements(district.id);
                break;
              case 'Product diversification':
                data = await fetchDistrictProductDiversification(district.id);
                break;
              case 'Product Risk Score':
                data = await fetchDistrictProductRiskScore(district.id);
                break;
              case 'Month-1 Default Performance':
                data = await fetchDistrictMonth1DefaultPerformance(district.id);
                break;
              case '3-Month Recovery Achievement':
                data = await fetchDistrictMonth3RecoveryAchievements(district.id);
                break;
              case 'Roll-Rate Control':
                data = await fetchDistrictRollRateControl(district.id);
                break;
              case 'Long-Term Delinquency Risk':
                data = await fetchDistrictLongTermDelinquency(district.id);
                break;
              case 'Revenue Achievement':
                data = await fetchDistrictRevenueAchievements(district.id);
                break;
              case 'Efficiency Ratio (CIR)':
                data = await fetchDistrictEfficiencyRatio(district.id);
                break;
              case 'Profitability Contribution':
                data = await fetchDistrictProfitabilityContribution(district.id);
                break;
              case 'Growth Trajectory':
                data = await fetchDistrictGrowthTrajectory(district.id);
                break;
              case 'Cash Position Score':
                data = await fetchDistrictCashPosition(district.id);
                break;
              case 'Portfolio Load Balance':
                data = await fetchDistrictLoanPortfolioLoad(district.id);
                break;
            }
            newData[district.id] = data;
          } catch (err) {
            console.error(`Failed to fetch KPI for district ${district.id}:`, err);
            newData[district.id] = null;
          }
        }
        setDistrictData(newData);
      } catch (err) {
        setDataError(err instanceof Error ? err.message : 'Failed to fetch district data');
      } finally {
        setDataLoading(false);
      }
    };

    fetchKPI();
  }, [selectedKPI, districts]);

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

  const tableHeaders = useMemo(() => {
    switch(selectedKPI) {
      case 'Staff Adequacy Score':
      case 'Productivity Achievement Score':
        return ['District', 'Offices', 'Total Staff', 'Score', 'Target', 'Variance', 'Trend', 'Status'];
      case 'Vacancy Impact':
        return ['District', 'Offices', 'Actual LCs', 'Auth. Pos.', 'Vacancies', 'Score', 'Status'];
      case 'Volume Achievement':
        return ['District', 'Offices', 'Total Disbursed', 'Target', 'Score', 'Status'];
      case 'Portfolio Quality Score':
        return ['District', 'Offices', 'Outstanding', 'Overdue', 'PAR', 'Score', 'Status'];
      case 'Vetting compliance':
        return ['District', 'Offices', 'Avg Score', 'Weight', 'PP', 'Target', 'Status'];
      case 'Collection Efficiency':
        return ['District', 'Offices', 'Collections', 'Benchmark', 'Weight', 'Avg Score', 'Status'];
      case 'Yield Achievement':
        return ['District', 'Offices', 'Target', 'Weight', 'Avg Score', 'PP', 'Status'];
      case 'Product diversification':
        return ['District', 'Offices', 'Avg HHI', 'Weight', 'PP', 'Status'];
      case 'Product Risk Score':
      case 'Month-1 Default Performance':
      case 'Roll-Rate Control':
      case 'Long-Term Delinquency Risk':
        return ['District', 'Offices', 'Avg Score', 'Weight', 'PP', 'Status'];
      case '3-Month Recovery Achievement':
        return ['District', 'Offices', 'Benchmark', 'Weight', 'Avg Score', 'PP', 'Status'];
      case 'Revenue Achievement':
        return ['District', 'Offices', 'Period', 'Expected', 'Avg Score', 'Weight', 'PP', 'Status'];
      case 'Efficiency Ratio (CIR)':
        return ['District', 'Offices', 'Period', 'Target', 'Avg Score', 'Weight', 'PP', 'Status'];
      case 'Profitability Contribution':
        return ['District', 'Offices', 'Period', 'Co. Net Contrib', 'Avg Score', 'Weight', 'PP', 'Status'];
      case 'Growth Trajectory':
      case 'Cash Position Score':
        return ['District', 'Offices', 'Avg Score', 'PP', 'Status'];
      default:
        return ['District', 'Score', 'Status'];
    }
  }, [selectedKPI]);

  if (districtsLoading || dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-800"></div>
          <div className="absolute top-0 left-0 animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-500 border-r-blue-500" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        </div>
        <span className="mt-4 text-gray-600 dark:text-gray-300 animate-pulse">
          {districtsLoading ? 'Loading districts...' : 'Loading performance data...'}
        </span>
      </div>
    );
  }

  const error = districtsError || dataError;
  if (error && districts.length === 0) {
    return (
      <div className="text-red-600 dark:text-red-400 py-8 text-center">
        Error loading districts: {error}
      </div>
    );
  }

  if (districts.length === 0) {
    return (
      <div className="text-gray-600 dark:text-gray-400 py-8 text-center">
        No districts found for {provinceName}.
        <div className="mt-4">
          <button 
            onClick={onBack}
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Provinces
          </button>
        </div>
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Districts in {provinceName}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Province Average: <span className="font-semibold text-blue-600 dark:text-blue-400">{calculateProvinceAvg}</span>
          </p>
        </div>
        <button
          onClick={() => setShowKpiInfo(!showKpiInfo)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 flex items-center justify-center"
          title="KPI Information"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300 mr-1" fill="currentColor" viewBox="0 0 16 16">
            <path d="M3.5 11.5a3.5 3.5 0 1 1 3.163-5H14L15.5 8 14 9.5l-1-1-1 1-1-1-1 1-1-1-1 1-1-1-1 1H6.663a3.5 3.5 0 0 1-3.163 2M2.5 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
          </svg>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Key</span>
        </button>
        {showKpiInfo && (
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 mt-2 w-80 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-[100] transform transition-all duration-200">
            <div className="flex items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">{selectedKPI}</h4>
                {selectedKPI === 'Staff Adequacy Score' ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <p><strong>Parameter:</strong> Branch Structure & Staffing</p>
                    <p><strong>Formula:</strong> Current LCs / Optimal LCs (capped at 100%)</p>
                    <p><strong>Target:</strong> 100% (10-12 LCs)</p>
                    <p><strong>Weight:</strong> 25% (22pp Contribution)</p>
                    <p><strong>How the score works:</strong></p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                      <li>If Current &ge; Optimal: 100%</li>
                      <li>If Current &lt; Optimal: (Current / Optimal) &times; 100</li>
                    </ul>
                    <p><strong>Drill Context:</strong> District aggregated view of staffing adequacy across branches in this district.</p>
                  </div>
                ) : selectedKPI === 'Cash Position Score' ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <p><strong>Target Cash Balance:</strong> K100,000</p>
                    <p><strong>Formula:</strong> Score = 100 - (shortfall ÷ 10,000) × 50 for balances K10,000-K20,000</p>
                    <p><strong>Thresholds:</strong> 
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                        <li>Below K10,000: Critical</li>
                        <li>K10,000-K20,000: Bad </li>
                        <li>K20,000-K30,000: Good</li>
                        <li>K30,000-K50,000: Excellent </li>
                        <li>Above K50,000: Risky</li>
                      </ul>
                    </p>
                    <p><strong>Sorting:</strong> Sorted by total cash balance descending (highest cash first)</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">KPI information not available for this metric.</p>
                )}
              </div>
              <button
                onClick={() => setShowKpiInfo(false)}
                className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                title="Close"
              >
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {tableHeaders.map(header => (
                <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedDistricts.map((district, index) => {
              const data = districtData[district.id];
              let rowData: React.ReactNode[] = [];
              let status: 'good' | 'warning' | 'critical' = 'warning';

              // Determine background color based on ranking
              let bgColor = '';
              if (index < 3) {
                // Top 3 performers
                bgColor = 'bg-green-50 dark:bg-green-900/20';
              } else if (index < 7) {
                // Next 4 performers (positions 4-7)
                bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
              }

              if (data) {
                switch(selectedKPI) {
                   case 'Staff Adequacy Score':
                   case 'Productivity Achievement':
                   case 'Productivity Achievement Score': {
                     const officesCount = district.offices_count || 0;
                     const totalStaff = data?.total_staff || data?.total_actual_lcs || data?.actual_lcs || 0;
                     const score = parseFloat(data?.average_normalized_score || '0');
                     const target = '90%';
                     const varianceNum = score - 90;
                     const variance = varianceNum >= 0 ? `+${varianceNum.toFixed(2)}%` : `${varianceNum.toFixed(2)}%`;
                     const trend: '↑' | '↓' | '→' = score >= 90 ? '↑' : score >= 70 ? '→' : '↓';
                     status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
                     rowData = [
                       district.name,
                       officesCount,
                       totalStaff,
                       `${score.toFixed(2)}%`,
                       target,
                       <span className={getVarianceColor(variance)}>{variance}</span>,
                       <span className={getTrendBadge(trend)}>{trend}</span>
                     ];
                     break;
                   }
                  case 'Vacancy Impact': {
                    const score = data.average_normalized_score || 0;
                    status = score >= 90 ? 'good' : score >= 75 ? 'warning' : 'critical';
                     rowData = [
                       district.name,
                       district.offices_count || 0,
                       data.actual_lcs || 0,
                       data.authorized_positions || 0,
                       data.vacancies || 0,
                       `${score}%`
                     ];
                    break;
                  }
                  case 'Volume Achievement': {
                    const score = parseFloat(data.average_normalized_score || '0');
                    status = score >= 100 ? 'good' : score >= 80 ? 'warning' : 'critical';
                     rowData = [
                       district.name,
                       district.offices_count || 0,
                       data.total_disbursement || '--',
                       data.branch_target || '--',
                       `${score.toFixed(2)}%`
                     ];
                    break;
                  }
                  case 'Portfolio Quality Score': {
                    const score = parseFloat(data.average_score || '0');
                    status = score >= 92 ? 'good' : score >= 85 ? 'warning' : 'critical';
                     rowData = [
                       district.name,
                       district.offices_count || 0,
                       data.total_outstanding || '--',
                       data.overdue_outstanding || '--',
                       data.PAR || '--',
                       `${score.toFixed(2)}%`
                     ];
                    break;
                  }
                  case 'Vetting compliance': {
                    const score = parseFloat(data.average_score?.replace('%', '') || '0');
                    status = score >= 80 ? 'good' : 'critical';
                     rowData = [
                       district.name,
                       district.offices_count || 0,
                       data.average_score || '--',
                       data.weight || '--',
                       data.percentage_point || 0,
                       data.target || '≥80%'
                     ];
                    break;
                  }
                  case 'Collection Efficiency': {
                    const score = parseFloat(data.average_score || '0');
                    status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
                     rowData = [
                       district.name,
                       district.offices_count || 0,
                       data.total_collections || '--',
                       data.benchmark || '--',
                       data.weight || '--',
                       `${score.toFixed(2)}%`
                     ];
                    break;
                  }
                  case 'Yield Achievement': {
                    const score = parseFloat(data.average_score || '0');
                    status = score >= 95 ? 'good' : score >= 85 ? 'warning' : 'critical';
                     rowData = [
                       district.name,
                       district.offices_count || 0,
                       data.target || '--',
                       data.weight || '--',
                       `${score.toFixed(2)}%`,
                       data.percentage_point || 0
                     ];
                    break;
                  }
                  case 'Product diversification': {
                    const score = parseFloat(data.average_HHI || '0');
                    status = score <= 2000 ? 'good' : score <= 3000 ? 'warning' : 'critical';
                     rowData = [
                       district.name,
                       district.offices_count || 0,
                       data.average_HHI || '--',
                       data.weight || '--',
                       data.percentage_point || 0
                     ];
                    break;
                  }
                  case 'Product Risk Score':
                  case 'Month-1 Default Performance':
                  case 'Roll-Rate Control':
                  case 'Long-Term Delinquency Risk': {
                    const score = parseFloat(data.average_score || '0');
                    status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
                     rowData = [
                       district.name,
                       district.offices_count || 0,
                       `${score.toFixed(2)}%`,
                       data.weight || '--',
                       data.percentage_point || 0
                     ];
                    break;
                  }
                  case '3-Month Recovery Achievement': {
                    const score = parseFloat(data.average_score || '0');
                    status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
                     rowData = [
                       district.name,
                       district.offices_count || 0,
                       data.benchmark || '--',
                       data.weight || '--',
                       `${score.toFixed(2)}%`,
                       data.percentage_point || 0
                     ];
                    break;
                  }
                  case 'Revenue Achievement': {
                    const score = parseFloat(data.average_score || '0');
                    status = score >= 100 ? 'good' : score >= 85 ? 'warning' : 'critical';
                     rowData = [
                       district.name,
                       district.offices_count || 0,
                       data.period || '--',
                       data.expected_revenue || '--',
                       `${score.toFixed(2)}%`,
                       data.weight || '--',
                       data.percentage_point || 0
                     ];
                    break;
                  }
                  case 'Efficiency Ratio (CIR)': {
                    const score = parseFloat(data.average_score || '0');
                    status = score >= 90 ? 'good' : score >= 75 ? 'warning' : 'critical';
                     rowData = [
                       district.name,
                       district.offices_count || 0,
                       data.period || '--',
                       data.target || '--',
                       `${score.toFixed(2)}%`,
                       data.weight || '--',
                       data.percentage_point || 0
                     ];
                    break;
                  }
                  case 'Profitability Contribution': {
                    const score = parseFloat(data.average_score?.replace('%', '') || '0');
                    status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
                     rowData = [
                       district.name,
                       district.offices_count || 0,
                       data.period || '--',
                       data.company_net_contribution || '--',
                       data.average_score || '--',
                       data.weight || '--',
                       data.percentage_point || 0
                     ];
                    break;
                   }
                    case 'Growth Trajectory':
                    case 'Cash Position Score': {
                      const cashBalance = parseFloat(data.totalCashBalance || data.cashBalance || '0');
                      const score = calculateCashPositionScore(cashBalance, 'province');
                      status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
                      rowData = [
                        district.name,
                        district.offices_count || 0,
                        `${score.toFixed(2)}%`,
                        selectedKPI === 'Growth Trajectory' ? data.PP || 0 : score
                      ];
                     break;
                    }
                   case 'Portfolio Load Balance': {
                    const score = parseFloat(data.average_score || '0');
                    status = score >= 90 ? 'good' : score >= 75 ? 'warning' : 'critical';
                     rowData = [
                       district.name,
                       district.offices_count || 0,
                       data.portfolio_per_lc || '--',
                       'K300k-K380k',
                       `${score.toFixed(2)}%`
                     ];
                    break;
                  }
                  default:
                    rowData = [district.name, 'No Data', '--'];
                }
              } else {
                rowData = [district.name, ...Array(tableHeaders.length - 2).fill('--')];
              }

              return (
                <tr
                  key={district.id}
                  className={`${bgColor} hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors`}
                  onClick={() => onDistrictClick(district.id)}
                >
                  {rowData.map((cell, idx) => (
                    <td key={idx} className={`px-4 py-2 text-sm ${idx === 0 ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'} ${idx === 2 ? 'font-semibold text-gray-900 dark:text-white' : ''}`}>
                      {cell}
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusBadge(status)}`}>
                      {status.toUpperCase()}
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
