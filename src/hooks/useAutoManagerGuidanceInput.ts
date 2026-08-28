'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUserPosition } from '@/hooks/useUserPosition';
import { getOfficeId, getProvinceId } from '@/utils/userContext';
import { getInstitutionalSummaryData } from '@/components/dashboards/InstitutionalHealthSummary';
import { GuidanceEngineInput, ManagerContext } from '@/types/managerGuidance';
import { fetchStaffAdequacyPerformance } from '@/services/StaffAdequacyService';
import { fetchProductivityAchievement } from '@/services/ProductivityAchievementService';
import { fetchVacancyImpact } from '@/services/VacancyImpactService';
import { fetchLoanPortfolioLoad } from '@/services/LoanPortfolioLoadService';
import { fetchVolumeAchievement } from '@/services/VolumeAchievementService';
import { fetchCollectionEfficiency } from '@/services/CollectionEfficiencyService';
import { fetchEfficiencyRatio } from '@/services/EfficiencyRatioService';
import { fetchGrowthTrajectory } from '@/services/GrowthTrajectoryService';
import { fetchLongTermDelinquency } from '@/services/LongTermDelinquencyService';
import { fetchMonth1DefaultPerformance } from '@/services/Month1DefaultPerformanceService';
import { fetchMonth3RecoveryAchievements } from '@/services/Month3RecoveryAchievementsService';
import { fetchPortfolioQuality } from '@/services/PortfolioQualityService';
import { fetchProductDiversification } from '@/services/ProductDiversificationService';
import { fetchProductRiskScore } from '@/services/ProductRiskScoreService';
import { fetchRollRateControl } from '@/services/RollRateControlService';
import { fetchYieldAchievements } from '@/services/YieldAchievementsService';
import { fetchRevenueAchievements } from '@/services/RevenueAchievementsService';
import { fetchProfitabilityContribution } from '@/services/ProfitabilityContributionService';
import { fetchCashPosition } from '@/services/CashPositionService';

function num(val: any): number | undefined {
  if (val === undefined || val === null || val === '--') return undefined;
  const n = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));
  return isNaN(n) ? undefined : n;
}

function parsePct(val: any): number | undefined {
  const n = num(val);
  if (n === undefined) return undefined;
  const s = String(val);
  if (s.includes('%')) return Math.min(100, Math.max(0, n));
  return n;
}

const PARAM_TO_KPI_MAP: Record<string, { kpiCode: string; target: number }> = {
  'Staff Adequacy Score': { kpiCode: 'staff_adequacy_score', target: 100 },
  'Productivity Achievement': { kpiCode: 'productivity_achievement', target: 100 },
  'Vacancy Impact': { kpiCode: 'vacancy_impact', target: 0 },
  'Portfolio Load Balance': { kpiCode: 'portfolio_load_balance', target: 100 },
  'Volume Achievement': { kpiCode: 'volume_achievement', target: 100 },
  'Collections efficiency': { kpiCode: 'collections_efficiency', target: 100 },
  'Efficiency Ratio (CIR)': { kpiCode: 'efficiency_ratio', target: 100 },
  'Growth trajectory alignment': { kpiCode: 'growth_trajectory', target: 100 },
  'Long-Term Delinquency': { kpiCode: 'long_term_delinquency', target: 100 },
  'Month-1 Default Performance': { kpiCode: 'month1_default_performance', target: 100 },
  'Recovery rate within 3 months': { kpiCode: 'month3_recovery_achievements', target: 100 },
  'Portfolio quality': { kpiCode: 'portfolio_quality', target: 100 },
  'Product distribution mix': { kpiCode: 'product_diversification', target: 100 },
  'Product risk contribution': { kpiCode: 'product_risk_score', target: 100 },
  'Risk migration trends': { kpiCode: 'roll_rate_control', target: 100 },
  'Revenue yield per product': { kpiCode: 'yield_achievements', target: 100 },
  'Revenue achievement': { kpiCode: 'revenue_achievements', target: 100 },
  'Profitability contribution': { kpiCode: 'profitability_contribution', target: 100 },
  'Cash Position Score': { kpiCode: 'cash_position_score', target: 100 },
};

export function useAutoManagerGuidanceInput(enabled: boolean): GuidanceEngineInput | null {
  const { userTier, positionId, positionName } = useUserPosition();

  const branchId = useMemo(() => {
    const oid = getOfficeId();
    return oid > 0 ? oid : 1;
  }, []);

  const officeId = useMemo(() => getOfficeId(), []);
  const provinceId = useMemo(() => getProvinceId(), []);

  const tier = useMemo(() => {
    if (!userTier) return 'branch';
    const t = userTier.toLowerCase();
    if (t.includes('executive') || t.includes('chairperson') || t.includes('institution')) return 'institution';
    if (t.includes('province') || t.includes('regional')) return 'province';
    if (t.includes('district')) return 'district';
    return 'branch';
  }, [userTier]);

  const managerContext: ManagerContext = useMemo(() => ({
    userId: 0,
    officeId: officeId || 0,
    provinceId: provinceId || 0,
    positionId: positionId || 0,
    positionName: positionName || '',
    userTier: tier,
  }), [officeId, provinceId, positionId, positionName, tier]);

  const [fetchedData, setFetchedData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    async function loadAll() {
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      const fetchers: Array<{
        key: string;
        fn: () => Promise<any>;
        extract: (d: any) => number | undefined;
      }> = [
        { key: 'staff_adequacy_score', fn: () => fetchStaffAdequacyPerformance(branchId), extract: (d) => num(d.normalized_score ?? d.average_normalized_score) },
        { key: 'productivity_achievement', fn: () => fetchProductivityAchievement(branchId), extract: (d) => num(d.average_disbursement) },
        { key: 'vacancy_impact', fn: () => fetchVacancyImpact(branchId), extract: (d) => num(d.vacancies) },
        { key: 'portfolio_load_balance', fn: () => fetchLoanPortfolioLoad(branchId), extract: (d) => num(d.portfolio_per_lc) },
        { key: 'volume_achievement', fn: () => fetchVolumeAchievement(branchId), extract: (d) => num(d.normalized_score ?? d.average_normalized_score) },
        { key: 'collections_efficiency', fn: () => fetchCollectionEfficiency(branchId), extract: (d) => num(d.average_score) },
        { key: 'efficiency_ratio', fn: () => fetchEfficiencyRatio(branchId), extract: (d) => num(d.score ?? d.average_score) },
        { key: 'growth_trajectory', fn: () => fetchGrowthTrajectory(branchId), extract: (d) => num(d.score ?? d.average_score) },
        { key: 'long_term_delinquency', fn: () => fetchLongTermDelinquency(branchId), extract: (d) => num(d.score ?? d.average_score) },
        { key: 'month1_default_performance', fn: () => fetchMonth1DefaultPerformance(branchId), extract: (d) => num(d.average_score) },
        { key: 'month3_recovery_achievements', fn: () => fetchMonth3RecoveryAchievements(branchId), extract: (d) => num(d.recovery_rate_3_months) },
        { key: 'portfolio_quality', fn: () => fetchPortfolioQuality(branchId), extract: (d) => num(d.score ?? d.average_score) },
        { key: 'product_diversification', fn: () => fetchProductDiversification(branchId), extract: (d) => num(d.average_HHI) },
        { key: 'product_risk_score', fn: () => fetchProductRiskScore(branchId), extract: (d) => num(d.average_score) },
        { key: 'roll_rate_control', fn: () => fetchRollRateControl(branchId), extract: (d) => num(d.score ?? d.average_score) },
        { key: 'yield_achievements', fn: () => fetchYieldAchievements(branchId), extract: (d) => num(d.average_score) },
        { key: 'revenue_achievements', fn: () => fetchRevenueAchievements(branchId), extract: (d) => num(d.average_score) },
        { key: 'profitability_contribution', fn: () => fetchProfitabilityContribution(branchId), extract: (d) => num(d.average_score) },
        { key: 'cash_position_score', fn: () => fetchCashPosition(branchId), extract: (d) => num(d.score ?? d.average_score ?? d.average_normalized_score) },
      ];

      const data: Record<string, any> = {};

      for (const item of fetchers) {
        if (cancelled || !enabled) return;
        try {
          const raw = await item.fn();
          const val = item.extract(raw);
          if (val !== undefined && val !== null) {
            data[item.key] = {
              current: val,
              benchmark: 0,
            };
          }
        } catch {
          // skip failed fetcher
        }
        if (!cancelled) {
          await delay(120);
        }
      }

      if (!cancelled && enabled) {
        setFetchedData(data);
      }
    }

    loadAll();

    return () => {
      cancelled = true;
    };
  }, [enabled, branchId]);

  return useMemo(() => {
    if (!enabled || !fetchedData) return null;
    return {
      managerContext,
      kpiData: fetchedData,
      orgHierarchy: { provinces: [], branches: [], consultants: [] },
      historicalData: {},
    };
  }, [enabled, fetchedData, managerContext]);
}
