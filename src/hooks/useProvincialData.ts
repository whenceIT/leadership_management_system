'use client';

import { useState, useEffect } from 'react';
import { ProvinceService } from '@/services/ProvinceService';
import { fetchProvincialStaffAdequacyPerformance } from '@/services/StaffAdequacyService';
import { fetchProvincialProductivityAchievement } from '@/services/ProductivityAchievementService';
import { fetchProvincialVacancyImpact } from '@/services/VacancyImpactService';
import { fetchProvincialLoanPortfolioLoad } from '@/services/LoanPortfolioLoadService';
import { fetchProvincialVolumeAchievement } from '@/services/VolumeAchievementService';
import { fetchProvincialPortfolioQuality } from '@/services/PortfolioQualityService';
import { fetchProvincialMonth1DefaultPerformance } from '@/services/Month1DefaultPerformanceService';
import { fetchProvincialCollectionEfficiency } from '@/services/CollectionEfficiencyService';
import { fetchProvincialProductRiskScore } from '@/services/ProductRiskScoreService';
import { fetchProvincialProductDiversification } from '@/services/ProductDiversificationService';
import { fetchProvincialYieldAchievements } from '@/services/YieldAchievementsService';
import { fetchProvincialEfficiencyRatio } from '@/services/EfficiencyRatioService';
import { fetchProvincialLongTermDelinquency } from '@/services/LongTermDelinquencyService';
import { fetchProvincialMonth3RecoveryAchievements } from '@/services/Month3RecoveryAchievementsService';
import { fetchProvincialRollRateControl } from '@/services/RollRateControlService';
import { fetchProvincialGrowthTrajectory } from '@/services/GrowthTrajectoryService';
import { fetchProvincialRevenueAchievements } from '@/services/RevenueAchievementsService';
import { fetchProvincialProfitabilityContribution } from '@/services/ProfitabilityContributionService';
import { fetchProvincialCashPosition } from '@/services/CashPositionService';
import { fetchProvincialAboveThresholdRisk } from '@/services/AboveThresholdRiskService';
import { fetchProvincialBelowThresholdRisk } from '@/services/BelowThresholdRiskService';

export interface ProvincialData {
  [provinceId: number]: any;
}

export function useProvincialData(selectedKPI: string | null) {
  const [provincialData, setProvincialData] = useState<ProvincialData>({});
  const [provinces, setProvinces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const provinceService = ProvinceService.getInstance();
        const provincesList = await provinceService.getProvinces();
        setProvinces(provincesList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load provinces');
      }
    };

    loadProvinces();
  }, []);

  // Fetch provincial data for all provinces when KPI is selected
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedKPI) return;

      setLoading(true);
      setError(null);
      const newProvincialData: ProvincialData = {};

      try {
        for (const province of provinces) {
          try {
            if (selectedKPI === 'Staff Adequacy Score') {
              const data = await fetchProvincialStaffAdequacyPerformance(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Productivity Achievement') {
              const data = await fetchProvincialProductivityAchievement(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Vacancy Impact') {
              const data = await fetchProvincialVacancyImpact(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Portfolio Load Balance') {
              const data = await fetchProvincialLoanPortfolioLoad(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Volume Achievement') {
              const data = await fetchProvincialVolumeAchievement(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Portfolio quality') {
              const data = await fetchProvincialPortfolioQuality(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Default contribution') {
              const data = await fetchProvincialMonth1DefaultPerformance(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Collections efficiency') {
              const data = await fetchProvincialCollectionEfficiency(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Vetting compliance') {
              const data = await fetchProvincialProductRiskScore(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Product distribution mix') {
              const data = await fetchProvincialProductDiversification(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Revenue yield per product') {
              const data = await fetchProvincialYieldAchievements(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Product risk contribution') {
              const data = await fetchProvincialProductRiskScore(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Margin alignment with strategy') {
              const data = await fetchProvincialEfficiencyRatio(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Default rate (branch, province, institutional)') {
              const data = await fetchProvincialMonth1DefaultPerformance(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Default aging analysis') {
              const data = await fetchProvincialLongTermDelinquency(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Recovery rate within 1 month' || selectedKPI === 'Recovery rate within 3 months') {
              const data = await fetchProvincialMonth3RecoveryAchievements(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Risk migration trends') {
              const data = await fetchProvincialRollRateControl(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Branch revenue' || selectedKPI === 'Growth trajectory alignment') {
              const data = await fetchProvincialGrowthTrajectory(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Cost-to-income ratios') {
              const data = await fetchProvincialEfficiencyRatio(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Institutional average performance') {
              const data = await fetchProvincialProductivityAchievement(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Revenue achievement') {
              const data = await fetchProvincialRevenueAchievements(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Profitability contribution') {
              const data = await fetchProvincialProfitabilityContribution(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Cash Position Score') {
              const data = await fetchProvincialCashPosition(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Above-Threshold Risk') {
              const data = await fetchProvincialAboveThresholdRisk(province.id);
              newProvincialData[province.id] = data;
            } else if (selectedKPI === 'Below-Threshold Risk') {
              const data = await fetchProvincialBelowThresholdRisk(province.id);
              newProvincialData[province.id] = data;
            }
            // Add other KPI fetch logic here as needed
          } catch (err) {
            console.error(`Failed to fetch ${selectedKPI} data for province ${province.id}:`, err);
            newProvincialData[province.id] = null;
          }
        }

        setProvincialData(newProvincialData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial data');
      } finally {
        setLoading(false);
      }
    };

    if (selectedKPI && provinces.length > 0) {
      fetchData();
    }
  }, [selectedKPI, provinces]);

  return {
    provincialData,
    provinces,
    loading,
    error
  };
}
