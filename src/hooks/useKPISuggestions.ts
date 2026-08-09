'use client';

import { useEffect, useMemo, useState } from 'react';
import { getOfficeNameById } from '@/hooks/useOffice';
import { ProvinceService } from '@/services/ProvinceService';
import { fetchOfficeUsers } from '@/services/OfficeUserService';
import { BranchPerformance, default as ProvincialDataService } from '@/services/ProvincialDataService';
import {
  Suggestion,
  SuggestionLocation,
  MetricKey,
} from '@/lib/kpiThresholds';
import {
  MetricMeasurement,
  EvaluateInput,
  SuggestionService,
  parseNumber,
  resolveScore,
} from '@/services/SuggestionService';
import { Office } from '@/types/dashboard';

export interface UseKPISuggestionsInput {
  userLevel: 'institution' | 'province' | 'district' | 'branch' | 'consultant';
  userProvinceId?: number;
  selectedProvince?: number | null;
  selectedDistrict?: number | null;
  selectedBranch?: number | null;
  offices?: Office[];
  branchPerformances?: BranchPerformance[];
  officeName?: string;
  enableDrillDown?: boolean;
  staffAdequacyData?: any;
  productivityAchievementData?: any;
  vacancyImpactData?: any;
  loanPortfolioLoadData?: any;
  otherMetrics?: Array<{ name: string; data: any }>;
}

export interface UseKPISuggestionsResult {
  suggestions: Suggestion[];
  critical: Suggestion[];
  warnings: Suggestion[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

function buildLocation(input: UseKPISuggestionsInput, offices?: Office[], provinces?: any[]): SuggestionLocation | undefined {
  const loc: SuggestionLocation = {};
  const provinceId = input.selectedProvince ?? input.userProvinceId;
  if (provinceId) {
    loc.provinceId = provinceId;
    const prov = provinces?.find((p: any) => p.id === provinceId);
    if (prov) loc.provinceName = prov.name;
  }
  if (input.selectedDistrict) {
    loc.districtId = input.selectedDistrict;
  }
  if (input.selectedBranch) {
    loc.branchId = input.selectedBranch;
  }
  if (input.officeName) {
    loc.branchName = input.officeName;
  } else if (input.selectedBranch) {
    loc.branchName = getOfficeNameById(input.selectedBranch) || loc.branchName;
  }
  if (offices && input.selectedBranch) {
    const branch = offices.find((o) => String(o.id) === String(input.selectedBranch));
    if (branch) {
      loc.branchName = branch.name;
      loc.provinceId = branch.provinceId as any;
      if (branch.districtId) loc.districtId = branch.districtId as any;
    }
  }
  return loc;
}

function extractStaffAdequacy(data: any, location?: SuggestionLocation): MetricMeasurement | null {
  if (!data) return null;
  const officesCount = parseNumber(data.offices_count);
  const actualLcs = parseNumber(data.actual_lcs);
  const target = parseNumber(data.target);

  let actualLcsPerOffice: number | undefined;
  if (actualLcs !== null) {
    actualLcsPerOffice = officesCount !== null && officesCount > 0 ? actualLcs / officesCount : actualLcs;
  }
  const normalizedScore = resolveScore(data) ?? undefined;

  if (actualLcsPerOffice === undefined && normalizedScore === undefined) return null;

  return {
    metric: 'Staff Adequacy Score',
    actualLcsPerOffice: actualLcsPerOffice,
    normalizedScore,
    location,
  };
}

function extractProductivity(data: any, location?: SuggestionLocation): MetricMeasurement | null {
  if (!data) return null;
  const avgDisbursement = parseNumber(data.average_disbursement);
  if (avgDisbursement === null) return null;
  return {
    metric: 'Productivity Achievement',
    avgDisbursement,
    normalizedScore: resolveScore(data) ?? undefined,
    location,
  };
}

function extractVacancyImpact(
  data: any,
  offices: Office[] | undefined,
  location?: SuggestionLocation
): MetricMeasurement | null {
  if (!data) return null;

  const vacancies = parseNumber(data.vacancies) ?? 0;
  const authorized = parseNumber(data.authorized_positions);
  const actualLcs = parseNumber(data.actual_lcs);

  if (authorized !== null && actualLcs !== null && authorized > actualLcs) {
    return {
      metric: 'Vacancy Impact',
      vacancies: authorized - actualLcs,
      location,
      offices,
    };
  }

  if (vacancies !== null && vacancies > 0) {
    const officesCount = parseNumber(data.offices_count);
    const vacanciesPerOffice = officesCount !== null && officesCount > 0 ? vacancies / officesCount : undefined;
    return {
      metric: 'Vacancy Impact',
      vacancies,
      vacanciesPerOffice,
      location,
      offices,
    };
  }

  if (offices && offices.length) {
    const totalVac = offices.reduce((sum, o) => {
      const cap = parseNumber(o.branchCapacity);
      const users = typeof o.user_count === 'number' ? o.user_count : 0;
      return sum + (cap !== null && users < cap ? cap - users : 0);
    }, 0);
    if (totalVac > 0) {
      return {
        metric: 'Vacancy Impact',
        vacancies: totalVac,
        location,
        offices,
      };
    }
  }

  return null;
}

function extractPortfolioLoad(data: any, location?: SuggestionLocation): MetricMeasurement | null {
  if (!data) return null;
  const portfolioPerLc = parseNumber(data.portfolio_per_lc);
  if (portfolioPerLc === null) return null;
  return {
    metric: 'Portfolio Load Balance',
    portfolioPerLc,
    normalizedScore: resolveScore(data) ?? undefined,
    location,
  };
}

function aggregateBranches(branchPerformances: BranchPerformance[] | undefined) {
  if (!branchPerformances || !branchPerformances.length) return null;
  const branches = branchPerformances.filter((b) => (b.staff_count ?? 0) > 0);
  if (!branches.length) return null;

  const sum = (fn: (b: BranchPerformance) => number) => branches.reduce((acc, b) => acc + fn(b), 0);

  const staffCounts = branches.map((b) => b.staff_count);
  const lcsPerOffice = sum((b) => b.staff_count) / branches.length;

  const avgDisbursement =
    sum((b) => b.disbursements?.total ?? 0) / sum((b) => b.staff_count || 1);

  const portfolioPerLc =
    sum((b) => b.portfolio?.total_portfolio ?? 0) / sum((b) => b.staff_count || 1);

  return {
    branches,
    staffCounts,
    lcsPerOffice,
    avgDisbursement,
    portfolioPerLc,
    totalStaff: sum((b) => b.staff_count),
  };
}

function deriveFromBranches(branchPerformances: BranchPerformance[] | undefined, offices: Office[] | undefined, location?: SuggestionLocation): MetricMeasurement[] {
  const agg = aggregateBranches(branchPerformances);
  if (!agg) return [];

  const measurements: MetricMeasurement[] = [];

  measurements.push({
    metric: 'Staff Adequacy Score',
    actualLcsPerOffice: agg.lcsPerOffice,
    branchPerformances,
    offices,
    location,
  });

  measurements.push({
    metric: 'Productivity Achievement',
    avgDisbursement: agg.avgDisbursement,
    branchPerformances,
    offices,
    officeName: location?.branchName,
    location,
  });

  const vacancies = (offices ?? []).reduce((sum, o) => {
    const cap = parseNumber(o.branchCapacity);
    const users = typeof o.user_count === 'number' ? o.user_count : 0;
    return sum + (cap !== null && users < cap ? cap - users : 0);
  }, 0);
  measurements.push({
    metric: 'Vacancy Impact',
    vacancies: vacancies || undefined,
    offices,
    location,
  });

  measurements.push({
    metric: 'Portfolio Load Balance',
    portfolioPerLc: agg.portfolioPerLc,
    branchPerformances,
    offices,
    officeName: location?.branchName,
    location,
  });

  return measurements;
}

export function useKPISuggestions(input: UseKPISuggestionsInput): UseKPISuggestionsResult {
  const [branchPerformances, setBranchPerformances] = useState<BranchPerformance[]>([]);
  const [officeUsers, setOfficeUsers] = useState<any>(null);
  const [provinceList, setProvinceList] = useState<any[]>([]);
  const [drillLoading, setDrillLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Province list is static data (no network fetch) — used only for name resolution.
  useEffect(() => {
    let cancelled = false;
    ProvinceService.getInstance()
      .getProvinces()
      .then((provs) => { if (!cancelled) setProvinceList(provs ?? []); })
      .catch(() => { if (!cancelled) setProvinceList([]); });
    return () => { cancelled = true; };
  }, []);

  // Resolve office name via the static lookup map (no network fetch).
  const officeName = input.officeName ?? (input.selectedBranch ? getOfficeNameById(input.selectedBranch) : undefined);

  useEffect(() => {
    if (!input.enableDrillDown) return;
    let cancelled = false;

    const run = async () => {
      try {
        setDrillLoading(true);

        // Consultant-level root cause at branch scope (single office).
        if (input.userLevel === 'branch' && input.selectedBranch) {
          const res = await fetchOfficeUsers(input.selectedBranch);
          if (!cancelled) setOfficeUsers(res);
        }

        // Branch-level attribution for a single selected province only (avoids N parallel fetches).
        const provinceId = input.selectedProvince ?? input.userProvinceId;
        if (
          (provinceId && (input.userLevel === 'province' || input.userLevel === 'district' || input.userLevel === 'branch')) ||
          (provinceId && input.userLevel === 'institution')
        ) {
          const svc = ProvincialDataService.getInstance();
          const branches = await svc.getBranchPerformance(provinceId);
          if (!cancelled && branches) setBranchPerformances(branches);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load suggestion context');
      } finally {
        if (!cancelled) setDrillLoading(false);
      }
    };

    run();

    return () => { cancelled = true; };
  }, [input.enableDrillDown, input.selectedBranch, input.selectedProvince, input.userProvinceId, input.userLevel]);

  const officesForCtx = input.offices;
  const provincesForCtx = provinceList;

  const result = useMemo(() => {
    const location = buildLocation(input, officesForCtx, provincesForCtx);

    const directStaff = extractStaffAdequacy(input.staffAdequacyData, input.userLevel === 'branch' ? location : undefined);
    const directProd = extractProductivity(input.productivityAchievementData, input.userLevel === 'branch' ? location : undefined);
    const directVac = extractVacancyImpact(input.vacancyImpactData, officesForCtx, location);
    const directPort = extractPortfolioLoad(input.loanPortfolioLoadData, input.userLevel === 'branch' ? location : undefined);

    const branchDerived = deriveFromBranches(
      input.enableDrillDown ? branchPerformances : undefined,
      officesForCtx,
      location
    );
    const derivedByMetric = new Map(branchDerived.map((m) => [m.metric, m]));

    const hasBusinessField = (m: MetricMeasurement | null): boolean => {
      if (!m) return false;
      switch (m.metric) {
        case 'Staff Adequacy Score': return m.actualLcsPerOffice !== undefined;
        case 'Productivity Achievement': return m.avgDisbursement !== undefined;
        case 'Vacancy Impact': return m.vacancies !== undefined;
        case 'Portfolio Load Balance': return m.portfolioPerLc !== undefined;
      }
    };

    const pick = (direct: MetricMeasurement | null, metric: MetricKey): MetricMeasurement | null => {
      if (direct && hasBusinessField(direct)) return direct;
      const derived = derivedByMetric.get(metric);
      return derived ?? direct;
    };

    const mStaff = pick(directStaff, 'Staff Adequacy Score');
    const mProd = pick(directProd, 'Productivity Achievement');
    const mVac = pick(directVac, 'Vacancy Impact');
    const mPort = pick(directPort, 'Portfolio Load Balance');

    const measurements: MetricMeasurement[] = [];

    const withAttribution = (m: MetricMeasurement | null) => {
      if (!m) return;
      if (input.enableDrillDown) {
        m.branchPerformances = m.branchPerformances ?? branchPerformances;
        m.offices = m.offices ?? officesForCtx;
        m.officeUsers = m.officeUsers ?? officeUsers;
        m.officeName = m.officeName ?? officeName ?? location?.branchName;
      }
      measurements.push(m);
    };

    if (mStaff) withAttribution(mStaff);
    if (mProd) withAttribution(mProd);
    if (mVac) withAttribution(mVac);
    if (mPort) withAttribution(mPort);

    const otherMetrics = input.otherMetrics?.map((om) => ({ ...om, location }));

    const evaluateInput: EvaluateInput = {
      measurements,
      otherMetrics,
    };

    const suggestions = SuggestionService.evaluateAll(evaluateInput);

    const critical = suggestions.filter((s) => s.severity === 'critical').sort((a, b) => (b.location ? 0 : 1) - (a.location ? 0 : 1));
    const warnings = suggestions.filter((s) => s.severity === 'warning');

    return { suggestions, critical, warnings };
  }, [
    input.staffAdequacyData, input.productivityAchievementData, input.vacancyImpactData, input.loanPortfolioLoadData,
    input.otherMetrics, input.userLevel, input.selectedBranch, input.selectedProvince, input.userProvinceId,
    branchPerformances, officesForCtx, officeUsers, officeName, provincesForCtx, input.enableDrillDown,
  ]);

  const isLoading = drillLoading;

  return {
    suggestions: result.suggestions,
    critical: result.critical,
    warnings: result.warnings,
    isLoading,
    error,
    refresh: () => {
      setBranchPerformances([]);
      setOfficeUsers(null);
    },
  };
}

export default useKPISuggestions;
