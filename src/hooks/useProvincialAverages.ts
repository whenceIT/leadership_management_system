'use client';

import { useState, useEffect } from 'react';
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
import ProvinceService from '@/services/ProvinceService';

export interface ProvincialAverage {
  kpiName: string;
  average: string;
}

export function useProvincialAverages() {
  const [averages, setAverages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllProvincialAverages = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const provinceService = ProvinceService.getInstance();
        const provinces = await provinceService.getProvinces();
        const results: Record<string, string> = {};

        const kpiFetchers: Record<string, (provinceId: number) => Promise<any>> = {
          'Staff Adequacy Score': fetchProvincialStaffAdequacyPerformance,
          'Productivity Achievement': fetchProvincialProductivityAchievement,
          'Vacancy Impact': fetchProvincialVacancyImpact,
          'Portfolio Load Balance': fetchProvincialLoanPortfolioLoad,
          'Volume Achievement': fetchProvincialVolumeAchievement,
          'Portfolio quality': fetchProvincialPortfolioQuality,
          'Default contribution': fetchProvincialMonth1DefaultPerformance,
          'Collections efficiency': fetchProvincialCollectionEfficiency,
          'Vetting compliance': fetchProvincialProductRiskScore,
          'Product distribution mix': fetchProvincialProductDiversification,
          'Revenue yield per product': fetchProvincialYieldAchievements,
          'Product risk contribution': fetchProvincialProductRiskScore,
          'Margin alignment with strategy': fetchProvincialEfficiencyRatio,
          'Default rate (branch, province, institutional)': fetchProvincialMonth1DefaultPerformance,
          'Default aging analysis': fetchProvincialLongTermDelinquency,
          'Recovery rate within 1 month': fetchProvincialMonth3RecoveryAchievements,
          'Recovery rate within 3 months': fetchProvincialMonth3RecoveryAchievements,
          'Risk migration trends': fetchProvincialRollRateControl,
          'Branch revenue': fetchProvincialGrowthTrajectory,
          'Growth trajectory alignment': fetchProvincialGrowthTrajectory,
          'Cost-to-income ratios': fetchProvincialEfficiencyRatio,
          'Institutional average performance': fetchProvincialProductivityAchievement,
          'Revenue achievement': fetchProvincialRevenueAchievements,
          'Profitability contribution': fetchProvincialProfitabilityContribution,
          'Cash Position Score': fetchProvincialCashPosition,
        };

        for (const [kpiName, fetcher] of Object.entries(kpiFetchers)) {
          try {
            const values: number[] = [];
            for (const province of provinces) {
              const data = await fetcher(province.id);
              if (data) {
                let value = 0;
                if (kpiName === 'Staff Adequacy Score' || kpiName === 'Productivity Achievement') {
                  value = parseFloat(data.average_normalized_score || '0');
                } else if (kpiName === 'Vacancy Impact') {
                  value = parseFloat(data.average_normalized_score || '0');
                } else if (kpiName === 'Portfolio Load Balance') {
                  value = parseFloat(data.average_score || '0');
                } else if (kpiName === 'Cash Position Score') {
                  value = parseFloat(data.average_score || '0');
                } else if (kpiName === 'Branch revenue') {
                  value = parseFloat(data.average_score || '0');
                } else {
                  value = parseFloat(data.average_score || '0');
                }
                if (!isNaN(value)) {
                  values.push(value);
                }
              }
            }
            
            if (values.length > 0) {
              const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
              if (kpiName === 'Vacancy Impact') {
                results[kpiName] = `${avg.toFixed(2)}%`;
              } else if (kpiName === 'Product distribution mix') {
                results[kpiName] = `${avg.toFixed(3)}`;
              } else if (kpiName === 'Vetting compliance' || kpiName === 'Product risk contribution') {
                results[kpiName] = `${avg.toFixed(2)}`;
              } else if (kpiName === 'Branch revenue') {
                results[kpiName] = `K${avg.toLocaleString()}`;
              } else {
                results[kpiName] = `${avg.toFixed(2)}%`;
              }
            }
          } catch (err) {
            console.error(`Failed to fetch ${kpiName} provincial data:`, err);
          }
        }

        setAverages(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial averages');
      } finally {
        setLoading(false);
      }
    };

    fetchAllProvincialAverages();
  }, []);

  return { averages, loading, error };
}
