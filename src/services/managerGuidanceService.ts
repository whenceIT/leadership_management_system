import {
  ManagerGuidanceRecommendation,
  GuidanceSeverity,
  GuidanceLevel,
  GuidanceStatus,
  TrendDirection,
  ManagerContext,
  GuidanceEngineInput,
  KPIGuidanceRule,
} from '@/types/managerGuidance';
import { getRuleByKpiCode, KPI_GUIDANCE_RULES } from '@/config/kpiGuidanceRules';
import { BranchPerformance } from '@/services/ProvincialDataService';

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function parseNumber(value: any): number | null {
  if (value === undefined || value === null || value === '--') return null;
  if (typeof value === 'number') return isNaN(value) ? null : value;
  const str = String(value).trim().replace(/,/g, '');
  const m = str.match(/^(-?\d+(?:\.\d+)?)\s*([KM]?)$/i);
  if (m) {
    const num = parseFloat(m[1]);
    const suffix = m[2].toUpperCase();
    if (isNaN(num)) return null;
    if (suffix === 'M') return num * 1_000_000;
    if (suffix === 'K') return num * 1000;
    return num;
  }
  const match = str.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  return parseFloat(match[0]);
}

function normalizeScore(value: any): number | null {
  const num = parseNumber(value);
  if (num === null || num < 0 || num > 100) return null;
  return num;
}

export class ManagerGuidanceService {
  private static instance: ManagerGuidanceService;

  private constructor() {}

  static getInstance(): ManagerGuidanceService {
    if (!ManagerGuidanceService.instance) {
      ManagerGuidanceService.instance = new ManagerGuidanceService();
    }
    return ManagerGuidanceService.instance;
  }

  evaluateKPIAgainstRule(currentValue: number, rule: KPIGuidanceRule): GuidanceSeverity {
    if (rule.higherIsBetter) {
      if (rule.severityRules.critical(currentValue, rule.target)) return 'critical';
      if (rule.severityRules.high(currentValue, rule.target)) return 'high';
      if (rule.severityRules.medium(currentValue, rule.target)) return 'medium';
      if (rule.severityRules.low(currentValue, rule.target)) return 'low';
      return 'healthy';
    } else {
      if (rule.severityRules.critical(currentValue, rule.target)) return 'critical';
      if (rule.severityRules.high(currentValue, rule.target)) return 'high';
      if (rule.severityRules.medium(currentValue, rule.target)) return 'medium';
      if (rule.severityRules.low(currentValue, rule.target)) return 'low';
      return 'healthy';
    }
  }

  analyzeTrend(current: number, historical?: number[]): TrendDirection {
    if (!historical || historical.length < 2) return 'stable';
    const sorted = [...historical].sort((a, b) => a - b);
    const previous = sorted[sorted.length - 2];
    const older = sorted[0];
    const changeRecent = current - previous;
    const changeOverall = current - older;
    const recentPct = previous > 0 ? (changeRecent / previous) * 100 : 0;
    const overallPct = older > 0 ? (changeOverall / older) * 100 : 0;

    if (recentPct <= -15 || overallPct <= -20) return 'rapidly_declining';
    if (recentPct <= -5 || overallPct <= -10) return 'declining';
    if (recentPct >= 5 || overallPct >= 10) return 'improving';
    return 'stable';
  }

  calculatePriority(
    severity: GuidanceSeverity,
    variance: number,
    benchmark: number,
    current: number,
    trend: TrendDirection,
    orgImpact: number
  ): number {
    let score = 0;

    switch (severity) {
      case 'critical': score += 40; break;
      case 'high': score += 30; break;
      case 'medium': score += 20; break;
      case 'low': score += 10; break;
      case 'healthy': score += 0; break;
    }

    const target = benchmark > 0 ? benchmark : 1;
    const variancePct = Math.abs(variance) / target;
    score += Math.min(25, variancePct * 25);

    if (trend === 'rapidly_declining') score += 20;
    else if (trend === 'declining') score += 10;
    else if (trend === 'improving') score -= 5;

    score += Math.min(15, orgImpact * 2);

    return Math.max(1, Math.min(100, Math.round(score)));
  }

  generateExplanation(
    kpiName: string,
    currentValue: number | string,
    target: number | string,
    benchmark: number | string,
    variance: number | string,
    level: GuidanceLevel,
    unit?: string
  ): string {
    const current = typeof currentValue === 'number' ? currentValue : parseNumber(currentValue) ?? 0;
    const tgt = typeof target === 'number' ? target : parseNumber(target) ?? 0;
    const bm = typeof benchmark === 'number' ? benchmark : parseNumber(benchmark) ?? 0;
    const varVal = typeof variance === 'number' ? variance : parseNumber(variance) ?? 0;
    const displayUnit = unit || '%';
    const levelLabel = level.charAt(0).toUpperCase() + level.slice(1);

    let explanation = `${kpiName} is currently ${typeof currentValue === 'number' ? current.toFixed(1) : currentValue}${displayUnit}`;

    if (tgt > 0) {
      explanation += `, which is ${Math.abs(varVal).toFixed(1)}${displayUnit} ${varVal < 0 ? 'below' : 'above'} the ${tgt}${displayUnit} target`;
    }

    if (bm > 0 && bm !== tgt) {
      explanation += ` and ${current < bm ? 'below' : 'above'} the institutional average of ${bm}${displayUnit}`;
    }

    explanation += `.`;

    return explanation;
  }

  generateRecommendedAction(rule: KPIGuidanceRule, level: GuidanceLevel, context: ManagerContext): string {
    const tier = context.userTier;
    let action = '';

    if (tier === 'branch') action = rule.recommendedActions.branch;
    else if (tier === 'district') action = rule.recommendedActions.district;
    else if (tier === 'province') action = rule.recommendedActions.province;
    else action = rule.recommendedActions.institution;

    if (level === 'consultant' && tier === 'branch') {
      action = 'Review individual consultant performance and workload distribution. Provide targeted coaching and re-assign accounts where necessary.';
    }

    return action;
  }

  buildLocationBreadcrumb(
    level: GuidanceLevel,
    province?: { id: number; name: string },
    district?: { id: number; name: string },
    office?: { id: number; name: string }
  ): string {
    const parts: string[] = [];
    if (province) parts.push(province.name);
    if (district) parts.push(district.name);
    if (office) parts.push(office.name);
    if (parts.length === 0) parts.push(level.charAt(0).toUpperCase() + level.slice(1));
    return parts.join(' → ');
  }

  determineWeaknessLevel(
    currentValue: number,
    target: number,
    benchmark: number,
    rule: KPIGuidanceRule,
    hierarchy: {
      provinceValue?: number;
      districtValue?: number;
      officeValue?: number;
      consultantValue?: number;
    }
  ): GuidanceLevel {
    const values = [
      { level: 'institution' as GuidanceLevel, value: currentValue },
      { level: 'province' as GuidanceLevel, value: hierarchy.provinceValue },
      { level: 'district' as GuidanceLevel, value: hierarchy.districtValue },
      { level: 'office' as GuidanceLevel, value: hierarchy.officeValue },
      { level: 'consultant' as GuidanceLevel, value: hierarchy.consultantValue },
    ].filter((v) => v.value !== undefined);

    if (values.length === 0) return 'institution';

    let weakest = values[0];
    for (const v of values) {
      if (v.value != null && weakest.value != null) {
        if (rule.higherIsBetter ? v.value < weakest.value : v.value > weakest.value) {
          weakest = v;
        }
      }
    }

    return weakest.level;
  }

  filterByScope(
    recommendations: ManagerGuidanceRecommendation[],
    context: ManagerContext
  ): ManagerGuidanceRecommendation[] {
    const tier = context.userTier;
    const provinceId = context.provinceId;
    const districtId = 0;
    const officeId = context.officeId;

    return recommendations.filter((rec) => {
      if (rec.severity === 'healthy') return false;

      if (rec.level === 'consultant' && tier !== 'branch') return false;
      if (rec.level === 'office' && tier === 'institution') return true;
      if (rec.level === 'office' && tier === 'province') return true;
      if (rec.level === 'office' && tier === 'district') return true;
      if (rec.level === 'office' && tier === 'branch') {
        if (rec.office && rec.office.id === officeId) return true;
        return false;
      }
      if (rec.level === 'district' && (tier === 'institution' || tier === 'province')) return true;
      if (rec.level === 'district' && tier === 'district') return true;
      if (rec.level === 'province' && tier === 'institution') return true;
      if (rec.level === 'province' && tier === 'province') {
        if (rec.province && rec.province.id === provinceId) return true;
        return false;
      }
      if (rec.level === 'institution') return tier === 'institution';

      return true;
    });
  }

  deduplicate(recommendations: ManagerGuidanceRecommendation[]): ManagerGuidanceRecommendation[] {
    const seen = new Map<string, ManagerGuidanceRecommendation>();
    for (const rec of recommendations) {
      const key = `${rec.kpiCode}_${rec.level}_${rec.province?.id ?? 0}_${rec.district?.id ?? 0}_${rec.office?.id ?? 0}`;
      const existing = seen.get(key);
      if (!existing || rec.priority > existing.priority) {
        seen.set(key, rec);
      }
    }
    return Array.from(seen.values());
  }

  rankRecommendations(recommendations: ManagerGuidanceRecommendation[]): ManagerGuidanceRecommendation[] {
    return [...recommendations].sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, healthy: 4 };
      const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (sevDiff !== 0) return sevDiff;
      return b.priority - a.priority;
    });
  }

  generateRecommendations(input: GuidanceEngineInput): ManagerGuidanceRecommendation[] {
    const { managerContext, kpiData, orgHierarchy, historicalData, maxRecommendations = 5 } = input;
    const recommendations: ManagerGuidanceRecommendation[] = [];

    for (const rule of KPI_GUIDANCE_RULES) {
      if (!rule.applicableRoles.includes(managerContext.userTier)) continue;

      const rawData = kpiData[rule.kpiCode];
      if (!rawData) continue;

      const currentValue = parseNumber(rawData.current ?? rawData.value ?? rawData.normalized_score);
      const target = parseNumber(rawData.target ?? rule.target) ?? rule.target;
      const benchmark = parseNumber(rawData.institutionalAvg ?? rawData.benchmark) ?? 0;

      if (currentValue === null) continue;

      const severity = this.evaluateKPIAgainstRule(currentValue, rule);
      if (severity === 'healthy') continue;

      const variance = currentValue - target;
      const trend = this.analyzeTrend(currentValue, historicalData?.[rule.kpiCode]);

      const provinceValue = parseNumber((rawData as any).provinceValue) ?? undefined;
      const districtValue = parseNumber((rawData as any).districtValue) ?? undefined;
      const officeValue = parseNumber((rawData as any).officeValue) ?? undefined;
      const consultantValue = parseNumber((rawData as any).consultantValue) ?? undefined;

      const branchPerformances = (rawData as any).branchPerformances as BranchPerformance[] | undefined;
      const weakestBranch = branchPerformances?.length
        ? [...branchPerformances].sort((a, b) => {
            const aVal = rule.higherIsBetter ? a.par.rate : -a.par.rate;
            const bVal = rule.higherIsBetter ? b.par.rate : -b.par.rate;
            return aVal - bVal;
          })[0]
        : undefined;

      const level: GuidanceLevel = this.determineWeaknessLevel(
        currentValue,
        target,
        benchmark,
        rule,
        {
          provinceValue,
          districtValue,
          officeValue,
          consultantValue,
        }
      );

      const province = orgHierarchy?.provinces?.[0];
      const district = province?.districts?.[0];
      const office = weakestBranch ? { id: weakestBranch.branch_id, name: weakestBranch.branch_name } : undefined;

      const orgImpact = branchPerformances?.length ?? 1;
      const priority = this.calculatePriority(severity, variance, benchmark, currentValue, trend, orgImpact);

      const whyNeeded = this.generateExplanation(
        rule.kpiName,
        currentValue,
        target,
        benchmark,
        variance,
        level
      );

      const action = this.generateRecommendedAction(rule, level, managerContext);

      const whatNeedsAttention = `${rule.kpiName} Requires Attention`;

      const recommendation: ManagerGuidanceRecommendation = {
        id: uid(`guidance_${rule.kpiCode}`),
        kpi: rule.kpiName,
        kpiCode: rule.kpiCode,
        severity,
        level,
        province,
        district,
        office,
        currentValue: typeof currentValue === 'number' ? Math.round(currentValue * 10) / 10 : currentValue,
        target: typeof target === 'number' ? Math.round(target * 10) / 10 : target,
        benchmark: typeof benchmark === 'number' ? Math.round(benchmark * 10) / 10 : benchmark,
        variance: typeof variance === 'number' ? Math.round(variance * 10) / 10 : variance,
        trend,
        whatNeedsAttention,
        whyAttentionIsNeeded: whyNeeded,
        recommendedAction: action,
        route: rule.route,
        priority,
        createdAt: new Date().toISOString(),
        status: 'generated',
      };

      recommendations.push(recommendation);
    }

    const filtered = this.filterByScope(recommendations, managerContext);
    const deduped = this.deduplicate(filtered);
    const ranked = this.rankRecommendations(deduped);

    if (ranked.length === 0 && recommendations.length > 0) {
      const topUnfiltered = this.rankRecommendations(recommendations)[0];
      if (topUnfiltered) {
        return [topUnfiltered];
      }
    }

    return ranked.slice(0, maxRecommendations);
  }

  updateStatus(
    recommendations: ManagerGuidanceRecommendation[],
    id: string,
    status: GuidanceStatus
  ): ManagerGuidanceRecommendation[] {
    return recommendations.map((r) => (r.id === id ? { ...r, status } : r));
  }

  markAllViewed(recommendations: ManagerGuidanceRecommendation[]): ManagerGuidanceRecommendation[] {
    return recommendations.map((r) => (r.status === 'generated' ? { ...r, status: 'viewed' as GuidanceStatus } : r));
  }
}

export const managerGuidanceService = ManagerGuidanceService.getInstance();
