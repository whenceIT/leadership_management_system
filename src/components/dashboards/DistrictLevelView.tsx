'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useDistrict } from '@/hooks/useDistrict';
import { useProvince } from '@/hooks/useProvince';
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
import { fetchDistrictAboveThresholdRisk } from '@/services/AboveThresholdRiskService';
import { fetchDistrictBelowThresholdRisk } from '@/services/BelowThresholdRiskService';
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
              case 'Above-Threshold Risk':
                data = await fetchDistrictAboveThresholdRisk(district.id);
                break;
              case 'Below-Threshold Risk':
                data = await fetchDistrictBelowThresholdRisk(district.id);
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
        return ['District', 'Inst. Avg', 'District Avg', 'Target', 'Variance', 'Trend', 'Status'];
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
      case 'Above-Threshold Risk':
      case 'Below-Threshold Risk':
        return ['District', 'Offices', 'Avg Score', 'PP', 'Status'];
      default:
        return ['District', 'Score', 'Status'];
    }
  }, [selectedKPI]);

  if (districtsLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-300">
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
          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
        >
          <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Provinces
        </button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Districts in {provinceName}</h3>
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
            {districts.map((district) => {
              const data = districtData[district.id];
              let rowData: React.ReactNode[] = [];
              let status: 'good' | 'warning' | 'critical' = 'warning';

              if (data) {
                switch(selectedKPI) {
                  case 'Staff Adequacy Score':
                  case 'Productivity Achievement Score': {
                    const instAvg = selectedKPI === 'Staff Adequacy Score' ? '78%' : '75%';
                    const score = parseFloat(data.average_normalized_score || '0');
                    const target = '100%';
                    const varianceNum = score - 100;
                    const variance = varianceNum >= 0 ? `+${varianceNum.toFixed(2)}%` : `${varianceNum.toFixed(2)}%`;
                    const trend: '↑' | '↓' | '→' = score >= 90 ? '↑' : score >= 70 ? '→' : '↓';
                    status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
                    rowData = [
                      district.name,
                      instAvg,
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
                      data.offices_count || 0,
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
                      data.offices_count || 0,
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
                      data.offices_count || 0,
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
                      data.offices_count || 0,
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
                      data.offices_count || 0,
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
                      data.offices_count || 0,
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
                      data.offices_count || 0,
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
                      data.offices_count || 0,
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
                      data.offices_count || 0,
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
                      data.offices_count || 0,
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
                      data.offices_count || 0,
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
                      data.offices_count || 0,
                      data.period || '--',
                      data.company_net_contribution || '--',
                      data.average_score || '--',
                      data.weight || '--',
                      data.percentage_point || 0
                    ];
                    break;
                  }
                  case 'Growth Trajectory':
                  case 'Cash Position Score':
                  case 'Above-Threshold Risk':
                  case 'Below-Threshold Risk': {
                    const score = parseFloat(data.average_score || '0');
                    status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
                    rowData = [
                      district.name,
                      data.offices_count || 0,
                      `${score.toFixed(2)}%`,
                      data.percentage_point || data.percentage_points || 0
                    ];
                    break;
                  }
                  case 'Portfolio Load Balance': {
                    const score = parseFloat(data.average_score || '0');
                    status = score >= 90 ? 'good' : score >= 75 ? 'warning' : 'critical';
                    rowData = [
                      district.name,
                      data.offices_count || 0,
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
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
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
