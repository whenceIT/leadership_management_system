'use client';

import React from 'react';
import { useProvincialData } from '@/hooks/useProvincialData';

interface ProvinceLevelViewProps {
  selectedKPI: string | null;
  onProvinceClick: (provinceId: number) => void;
}

export function ProvinceLevelView({ selectedKPI, onProvinceClick }: ProvinceLevelViewProps) {
  const { provincialData, provinces, loading, error } = useProvincialData(selectedKPI);

  function getTrendBadge(trend: '↑' | '↓' | '→') {
    if (trend === '↑') return 'text-green-600 dark:text-gray-600 text-lg font-bold';
    if (trend === '↓') return 'text-red-600 dark:text-gray-600 text-lg font-bold';
    return 'text-orange-500 dark:text-gray-600 text-lg font-bold';
  }

  function getStatusBadge(status: 'good' | 'warning' | 'critical') {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
  }

  function getVarianceColor(variance: string) {
    if (variance.startsWith('+')) return 'text-red-600 dark:text-red-400 font-semibold';
    if (variance.startsWith('-')) return 'text-green-600 dark:text-green-400 font-semibold';
    return 'text-gray-600 dark:text-gray-400';
  }

  // Function to get current period value for sorting
  const getCurrentPeriodValue = (province: any) => {
    const data = provincialData[province.id];
    if (!data) return 0;

    let value = 0;

    if (selectedKPI === 'Staff Adequacy Score') {
      value = parseFloat(data.average_normalized_score || '0');
    } else if (selectedKPI === 'Productivity Achievement') {
      value = parseFloat(data.average_normalized_score || '0');
    } else if (selectedKPI === 'Vacancy Impact') {
      value = parseFloat(data.average_normalized_score || '0');
    } else if (selectedKPI === 'Portfolio Load Balance') {
      value = parseFloat(data.average_score || '0');
    } else if (selectedKPI === 'Volume Achievement') {
      value = parseFloat(data.average_normalized_score || '0');
    } else if (selectedKPI === 'Portfolio quality') {
      value = parseFloat(data.average_score || '0');
    } else if (selectedKPI === 'Default contribution' || selectedKPI === 'Default rate (branch, province, institutional)') {
      value = parseFloat(data.average_month_1_default_rate || '0');
    } else if (selectedKPI === 'Collections efficiency') {
      value = parseFloat(data.average_score || '0');
    } else if (selectedKPI === 'Vetting compliance' || selectedKPI === 'Product risk contribution') {
      value = parseFloat(data.average_score || '0');
    } else if (selectedKPI === 'Product distribution mix') {
      value = parseFloat(data.average_HHI || '0');
    } else if (selectedKPI === 'Revenue yield per product') {
      value = parseFloat(data.average_score || '0');
    } else if (selectedKPI === 'Margin alignment with strategy' || selectedKPI === 'Cost-to-income ratios') {
      value = parseFloat(data.average_score || '0');
    } else if (selectedKPI === 'Default aging analysis') {
      value = parseFloat(data.average_score || '0');
    } else if (selectedKPI === 'Recovery rate within 1 month' || selectedKPI === 'Recovery rate within 3 months') {
      value = parseFloat(data.average_score || '0');
    } else if (selectedKPI === 'Risk migration trends') {
      value = parseFloat(data.average_score || '0');
    } else if (selectedKPI === 'Branch revenue' || selectedKPI === 'Growth trajectory alignment') {
      value = parseFloat(data.average_score || '0');
    } else if (selectedKPI === 'Institutional average performance') {
      value = parseFloat(data.average_normalized_score || '0');
    } else if (selectedKPI === 'Revenue achievement') {
      value = parseFloat(data.average_score || '0');
    } else if (selectedKPI === 'Profitability contribution') {
      value = parseFloat(data.average_score || '0');
    } else if (selectedKPI === 'Cash Position Score') {
      value = parseFloat(data.average_score || '0');
    } else if (selectedKPI === 'Above-Threshold Risk' || selectedKPI === 'Below-Threshold Risk') {
      value = parseFloat(data.average_score || '0');
    }

    value = isNaN(value) ? 0 : value;

    // For KPIs where lower values are better, invert the value for sorting purposes
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

    if (lowerIsBetterKPIs.includes(selectedKPI || '')) {
      // Invert the value - higher inverted value means lower original value
      return 100 - value;
    }

    return value;
  };

  // Calculate Institution Avg by summing Province Avg values
  const calculateInstitutionAvg = () => {
    let total = 0;
    let count = 0;
    
    provinces.forEach(province => {
      const data = provincialData[province.id];
      let value = 0;
      
      if (selectedKPI === 'Staff Adequacy Score') {
        value = parseFloat(data?.average_normalized_score || '0');
      } else if (selectedKPI === 'Productivity Achievement') {
        value = parseFloat(data?.average_normalized_score || '0');
      } else if (selectedKPI === 'Vacancy Impact') {
        value = parseFloat(data?.average_normalized_score || '0');
      } else if (selectedKPI === 'Portfolio Load Balance') {
        value = parseFloat(data?.average_score || '0');
      } else if (selectedKPI === 'Volume Achievement') {
        value = parseFloat(data?.average_normalized_score || '0');
      } else if (selectedKPI === 'Portfolio quality') {
        value = parseFloat(data?.average_score || '0');
      } else if (selectedKPI === 'Default contribution' || selectedKPI === 'Default rate (branch, province, institutional)') {
        value = parseFloat(data?.average_month_1_default_rate || '0');
      } else if (selectedKPI === 'Collections efficiency') {
        value = parseFloat(data?.average_score || '0');
      } else if (selectedKPI === 'Vetting compliance' || selectedKPI === 'Product risk contribution') {
        value = parseFloat(data?.average_score || '0');
      } else if (selectedKPI === 'Product distribution mix') {
        value = parseFloat(data?.average_HHI || '0');
      } else if (selectedKPI === 'Revenue yield per product') {
        value = parseFloat(data?.average_score || '0');
      } else if (selectedKPI === 'Margin alignment with strategy' || selectedKPI === 'Cost-to-income ratios') {
        value = parseFloat(data?.average_score || '0');
      } else if (selectedKPI === 'Default aging analysis') {
        value = parseFloat(data?.average_score || '0');
      } else if (selectedKPI === 'Recovery rate within 1 month' || selectedKPI === 'Recovery rate within 3 months') {
        value = parseFloat(data?.average_score || '0');
      } else if (selectedKPI === 'Risk migration trends') {
        value = parseFloat(data?.average_score || '0');
      } else if (selectedKPI === 'Branch revenue' || selectedKPI === 'Growth trajectory alignment') {
        value = parseFloat(data?.average_score || '0');
      } else if (selectedKPI === 'Institutional average performance') {
        value = parseFloat(data?.average_normalized_score || '0');
      } else if (selectedKPI === 'Revenue achievement') {
        value = parseFloat(data?.average_score || '0');
      } else if (selectedKPI === 'Profitability contribution') {
        value = parseFloat(data?.average_score || '0');
      } else if (selectedKPI === 'Cash Position Score') {
        value = parseFloat(data?.average_score || '0');
      } else if (selectedKPI === 'Above-Threshold Risk' || selectedKPI === 'Below-Threshold Risk') {
        value = parseFloat(data?.average_score || '0');
      }
      
      if (!isNaN(value)) {
        total += value;
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

  // Sort provinces by current period value in descending order
  const sortedProvinces = [...provinces].sort((a, b) => {
    const valueA = getCurrentPeriodValue(a);
    const valueB = getCurrentPeriodValue(b);
    return valueB - valueA;
  });

  const institutionAvg = calculateInstitutionAvg();

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Executive Institution Overview - Country Wide Zambia</h3>
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Institution Average as at Today: <span className="font-semibold text-blue-600 dark:text-blue-400">{institutionAvg}</span>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-300">Loading provinces...</span>
        </div>
      ) : error ? (
        <div className="text-red-600 dark:text-red-400 py-8 text-center">
          Error: {error}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Province</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Offices Count</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Provincial Avg</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedProvinces.map((province, index) => {
                const data = provincialData[province.id];
                
                let institutionalAvg = '0';
                let currentPeriod = '0';
                let target = '100%';
                let variance = '0';
                let trend: '↑' | '↓' | '→' = '→';
                let status: 'good' | 'warning' | 'critical' = 'warning';
                let actualLcs = 0;
                let contribution = '--';

                if (data) {
                  // Handle both array and object data formats
                  // The provincial API returns an array of branch data
                  let branchArray: any[] = [];
                  
                  if (Array.isArray(data)) {
                    branchArray = data;
                  } else if (data.branches) {
                    branchArray = data.branches;
                  }
                  
                  // Aggregate actual_lcs and percentage_point from all branches
                  if (branchArray.length > 0) {
                    actualLcs = branchArray.reduce((sum: number, branch: any) => sum + (branch.actual_lcs || 0), 0);
                    const totalPP = branchArray.reduce((sum: number, branch: any) => sum + (branch.percentage_point || 0), 0);
                    if (totalPP > 0) {
                      contribution = `${totalPP.toFixed(2)}pp`;
                    }
                  } else if (data.total_actual_lcs) {
                    // Fallback to aggregated values if available
                    actualLcs = data.total_actual_lcs;
                    if (data.total_percentage_point) {
                      contribution = `${parseFloat(data.total_percentage_point).toFixed(2)}pp`;
                    }
                  } else if (data.actual_lcs) {
                    // Single branch data
                    actualLcs = data.actual_lcs;
                    if (data.percentage_point) {
                      contribution = `${parseFloat(data.percentage_point).toFixed(2)}pp`;
                    }
                  }

                  if (selectedKPI === 'Staff Adequacy Score') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_normalized_score ? `${parseFloat(data.average_normalized_score).toFixed(2)}%` : '0';
                    
                    if (data.average_normalized_score !== undefined) {
                      const score = parseFloat(data.average_normalized_score);
                      variance = `${(score - data.target).toFixed(2)}%`;
                      trend = score >= 90 ? '↑' : score >= 70 ? '→' : '↓';
                      status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
                    }
                  } else if (selectedKPI === 'Productivity Achievement') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_normalized_score ? `${parseFloat(data.average_normalized_score).toFixed(2)}%` : '0';
                    
                    if (data.average_normalized_score !== undefined) {
                      const score = parseFloat(data.average_normalized_score);
                      variance = `${(score - data.target).toFixed(2)}%`;
                      trend = score >= 90 ? '↑' : score >= 70 ? '→' : '↓';
                      status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
                    }
                  } else if (selectedKPI === 'Vacancy Impact') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_normalized_score ? `${parseFloat(data.average_normalized_score).toFixed(2)}%` : '0';
                    target = '0%';
                    
                    if (data.average_normalized_score !== undefined) {
                      const score = parseFloat(data.average_normalized_score);
                      variance = `${(score - data.target).toFixed(2)}%`;
                      trend = score <= 10 ? '↑' : score <= 20 ? '→' : '↓';
                      status = score <= 10 ? 'good' : score <= 20 ? 'warning' : 'critical';
                    }
                  } else if (selectedKPI === 'Portfolio Load Balance') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_score ? `${parseFloat(data.average_score).toFixed(2)}%` : '0';
                    target = '100%';
                    
                    if (data.average_score !== undefined) {
                      const score = parseFloat(data.average_score);
                      variance = `${(score - data.target).toFixed(2)}%`;
                      trend = score >= 90 ? '↑' : score >= 70 ? '→' : '↓';
                      status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
                    }
                  } else if (selectedKPI === 'Volume Achievement') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_normalized_score ? `${parseFloat(data.average_normalized_score).toFixed(2)}%` : '0';
                    target = '100%';
                    
                    if (data.average_normalized_score !== undefined) {
                      const score = parseFloat(data.average_normalized_score);
                      variance = `${(score - 100).toFixed(2)}%`;
                      trend = score >= 90 ? '↑' : score >= 70 ? '→' : '↓';
                      status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
                    }
                  } else if (selectedKPI === 'Portfolio quality') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_score ? `${parseFloat(data.average_score).toFixed(2)}%` : '0';
                    target = '≤5%';
                    
                    if (data.average_score !== undefined) {
                      const score = parseFloat(data.average_score);
                      variance = `${(score - 5).toFixed(2)}%`;
                      trend = score <= 5 ? '↑' : score <= 10 ? '→' : '↓';
                      status = score <= 5 ? 'good' : score <= 10 ? 'warning' : 'critical';
                    }
                  } else if (selectedKPI === 'Default contribution' || selectedKPI === 'Default rate (branch, province, institutional)') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_month_1_default_rate ? `${parseFloat(data.average_month_1_default_rate).toFixed(2)}%` : '0';
                    target = '≤15%';
                    
                    if (data.average_month_1_default_rate !== undefined) {
                      const score = parseFloat(data.average_month_1_default_rate);
                      variance = `${(score - 15).toFixed(2)}%`;
                      trend = score <= 15 ? '↑' : score <= 20 ? '→' : '↓';
                      status = score <= 15 ? 'good' : score <= 20 ? 'warning' : 'critical';
                    }
                  } else if (selectedKPI === 'Collections efficiency') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_score ? `${parseFloat(data.average_score).toFixed(2)}%` : '0';
                    target = '≥75%';
                    
                    if (data.average_score !== undefined) {
                      const score = parseFloat(data.average_score);
                      variance = `${(score - 75).toFixed(2)}%`;
                      trend = score >= 75 ? '↑' : score >= 65 ? '→' : '↓';
                      status = score >= 75 ? 'good' : score >= 65 ? 'warning' : 'critical';
                    }
                  } else if (selectedKPI === 'Vetting compliance' || selectedKPI === 'Product risk contribution') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_score ? `${parseFloat(data.average_score).toFixed(2)}` : '0';
                    target = '≤1.0';
                    
                    if (data.average_score !== undefined) {
                      const score = parseFloat(data.average_score);
                      variance = `${(score - 1.0).toFixed(2)}`;
                      trend = score <= 1.0 ? '↑' : score <= 1.5 ? '→' : '↓';
                      status = score <= 1.0 ? 'good' : score <= 1.5 ? 'warning' : 'critical';
                    }
                  } else if (selectedKPI === 'Product distribution mix') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_HHI ? `${parseFloat(data.average_HHI).toFixed(3)}` : '0';
                    target = 'HHI < 0.3';
                    
                    if (data.average_HHI !== undefined) {
                      const score = parseFloat(data.average_HHI);
                      variance = `${(score - 0.3).toFixed(3)}`;
                      trend = score < 0.3 ? '↑' : score < 0.4 ? '→' : '↓';
                      status = score < 0.3 ? 'good' : score < 0.4 ? 'warning' : 'critical';
                    }
                  } else if (selectedKPI === 'Revenue yield per product') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_score ? `${parseFloat(data.average_score).toFixed(2)}%` : '0%';
                    target = data.target || '≥38.2%';
                    
                    if (data.average_score !== undefined) {
                      const score = parseFloat(data.average_score);
                      const targetValue = parseFloat(data.target || '38.2');
                      variance = `${(score - targetValue).toFixed(2)}%`;
                      trend = score >= targetValue ? '↑' : score >= targetValue * 0.9 ? '→' : '↓';
                      status = score >= targetValue ? 'good' : score >= targetValue * 0.9 ? 'warning' : 'critical';
                    }
                  } else if (selectedKPI === 'Margin alignment with strategy' || selectedKPI === 'Cost-to-income ratios') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_score ? `${parseFloat(data.average_score).toFixed(2)}%` : '0%';
                    target = data.target || '≤55%';
                    
                    if (data.average_score !== undefined) {
                      const score = parseFloat(data.average_score);
                      const targetValue = parseFloat(data.target || '55');
                      variance = `${(score - targetValue).toFixed(2)}%`;
                      trend = score <= targetValue ? '↑' : score <= targetValue * 1.1 ? '→' : '↓';
                      status = score <= targetValue ? 'good' : score <= targetValue * 1.1 ? 'warning' : 'critical';
                    }
                  } else if (selectedKPI === 'Default aging analysis') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_score ? `${parseFloat(data.average_score).toFixed(2)}%` : '0%';
                    target = data.target || '≤43.95%';
                    
                    if (data.average_score !== undefined) {
                      const score = parseFloat(data.average_score);
                      const targetValue = parseFloat(data.target || '43.95');
                      variance = `${(score - targetValue).toFixed(2)}%`;
                      trend = score <= targetValue ? '↑' : score <= targetValue * 1.1 ? '→' : '↓';
                      status = score <= targetValue ? 'good' : score <= targetValue * 1.1 ? 'warning' : 'critical';
                    }
                  } else if (selectedKPI === 'Recovery rate within 1 month' || selectedKPI === 'Recovery rate within 3 months') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_score ? `${parseFloat(data.average_score).toFixed(2)}%` : '0';
                    target = '≥100%';
                    
                    if (data.average_score !== undefined) {
                      const score = parseFloat(data.average_score);
                      variance = `${(score - 100).toFixed(2)}%`;
                      trend = score >= 100 ? '↑' : score >= 90 ? '→' : '↓';
                      status = score >= 100 ? 'good' : score >= 90 ? 'warning' : 'critical';
                    }
                  } else if (selectedKPI === 'Risk migration trends') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_score ? `${parseFloat(data.average_score).toFixed(2)}%` : '0';
                    target = '≤20%';
                    
                    if (data.average_score !== undefined) {
                      const score = parseFloat(data.average_score);
                      variance = `${(score - 20).toFixed(2)}%`;
                      trend = score <= 20 ? '↑' : score <= 30 ? '→' : '↓';
                      status = score <= 20 ? 'good' : score <= 30 ? 'warning' : 'critical';
                    }
                  } else if (selectedKPI === 'Branch revenue' || selectedKPI === 'Growth trajectory alignment') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_score ? `${parseFloat(data.average_score).toFixed(2)}%` : '0';
                    target = '≥2.5%';
                    
                    if (data.average_score !== undefined) {
                      const score = parseFloat(data.average_score);
                      variance = `${(score - 2.5).toFixed(2)}%`;
                      trend = score >= 2.5 ? '↑' : score >= 0 ? '→' : '↓';
                      status = score >= 2.5 ? 'good' : score >= 0 ? 'warning' : 'critical';
                    }
                  } else if (selectedKPI === 'Institutional average performance') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_normalized_score ? `${parseFloat(data.average_normalized_score).toFixed(2)}%` : '0';
                    target = '≥100%';
                    
                    if (data.average_normalized_score !== undefined) {
                      const score = parseFloat(data.average_normalized_score);
                      variance = `${(score - 100).toFixed(2)}%`;
                      trend = score >= 100 ? '↑' : score >= 90 ? '→' : '↓';
                      status = score >= 100 ? 'good' : score >= 90 ? 'warning' : 'critical';
                    }
                  } else if (selectedKPI === 'Revenue achievement') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_score ? `${parseFloat(data.average_score).toFixed(2)}%` : '0';
                    target = '≥100%';
                    
                    if (data.average_score !== undefined) {
                      const score = parseFloat(data.average_score);
                      variance = `${(score - 100).toFixed(2)}%`;
                      trend = score >= 100 ? '↑' : score >= 90 ? '→' : '↓';
                      status = score >= 100 ? 'good' : score >= 90 ? 'warning' : 'critical';
                    }
                  } else if (selectedKPI === 'Profitability contribution') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_score ? `${parseFloat(data.average_score).toFixed(2)}%` : '0';
                    target = '≥ institutional avg';
                    
                    if (data.average_score !== undefined) {
                      const score = parseFloat(data.average_score);
                      variance = `${(score - 100).toFixed(2)}%`;
                      trend = score >= 90 ? '↑' : score >= 70 ? '→' : '↓';
                      status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
                    }
                  } else if (selectedKPI === 'Cash Position Score') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_score ? `${parseFloat(data.average_score).toFixed(2)}%` : '0';
                    target = 'Within range';
                    
                    if (data.average_score !== undefined) {
                      const score = parseFloat(data.average_score);
                      variance = `${(score - 100).toFixed(2)}%`;
                      trend = score >= 90 ? '↑' : score >= 70 ? '→' : '↓';
                      status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
                    }
                  } else if (selectedKPI === 'Above-Threshold Risk' || selectedKPI === 'Below-Threshold Risk') {
                    institutionalAvg = data.instAvg || '0';
                    currentPeriod = data.average_score ? `${parseFloat(data.average_score).toFixed(2)}%` : '0';
                    target = 'Zero';
                    
                    if (data.average_score !== undefined) {
                      const score = parseFloat(data.average_score);
                      variance = `${(score - 100).toFixed(2)}%`;
                      trend = score >= 90 ? '↑' : score >= 70 ? '→' : '↓';
                      status = score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';
                    }
                  }
                }

                // Determine background color based on ranking
                let bgColor = '';
                if (index < 3) {
                  // Top 3 performers
                  bgColor = 'bg-green-50 dark:bg-green-900/20';
                } else if (index < 7) {
                  // Next 4 performers (positions 4-7)
                  bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
                }

                return (
                  <tr
                    key={province.id}
                    className={`${bgColor} hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer`}
                    onClick={() => onProvinceClick(province.id)}
                  >
                    <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{province.name}</td>
                    <td className="px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400">{province.offices_count || 0}</td>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">{currentPeriod}</td>
                    {/* <td className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400">{actualLcs > 0 ? actualLcs : '--'}</td>
                    <td className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400">{contribution}</td> */}
                    <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{target}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`${getVarianceColor(variance)}`}>{variance}</span>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={getTrendBadge(trend)}>{trend}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusBadge(status)}`}>
                        {status === 'good' ? 'GOOD' : status === 'warning' ? 'WARNING' : 'CRITICAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
