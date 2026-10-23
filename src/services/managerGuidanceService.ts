import {
  ConsultantPerformance,
  GUIDANCE_THRESHOLDS,
  GuidanceLevel,
  GuidanceSeverity,
  GuidanceStatus,
  ManagerContext,
  ManagerGuidanceRecommendation,
  TrendDirection,
} from '@/types/managerGuidance';

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function parseNumber(value: any, fallback = 0): number {
  if (value === undefined || value === null || value === '--') return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  const str = String(value).trim().replace(/,/g, '');
  const m = str.match(/^(-?\d+(?:\.\d+)?)\s*([KM]?)$/i);
  if (m) {
    const num = parseFloat(m[1]);
    const suffix = m[2].toUpperCase();
    if (isNaN(num)) return fallback;
    if (suffix === 'M') return num * 1_000_000;
    if (suffix === 'K') return num * 1000;
    return num;
  }
  const match = str.match(/-?\d+(?:\.\d+)?/);
  if (!match) return fallback;
  return parseFloat(match[0]);
}

/**
 * Return the highest severity across several issues.
 */
function worstSeverity(...severities: GuidanceSeverity[]): GuidanceSeverity {
  const order: Record<GuidanceSeverity, number> = {
    healthy: 0,
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };
  let worst: GuidanceSeverity = 'healthy';
  for (const s of severities) {
    if (order[s as GuidanceSeverity] > order[worst]) worst = s;
  }
  return worst;
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

  /**
   * Build poor-performance recommendations from consultant performance records.
   * A consultant appears only when at least one condition is true:
   *   - given_out below the band (K40,000)
   *   - PDUA below the low threshold
   *   - still_uncollected above the high threshold
   *   - total_uncollected above the high threshold
   *   - current cycle target missed
   *
   * Recommendations are grouped implicitly by province/district/office via the
   * OrgUnit fields on each recommendation.
   */
  generateRecommendations(input: {
    consultants: ConsultantPerformance[];
    maxRecommendations?: number;
  }): ManagerGuidanceRecommendation[] {
    const { consultants, maxRecommendations = 5 } = input;
    const recommendations: ManagerGuidanceRecommendation[] = [];

    for (const c of consultants) {
      const issues: string[] = [];

      // Band check: below K40,000 given_out
      if (c.given_out < GUIDANCE_THRESHOLDS.BAND_GIVEN_OUT) {
        issues.push(
          `Given-out of K${c.given_out.toLocaleString()} is below the K${GUIDANCE_THRESHOLDS.BAND_GIVEN_OUT.toLocaleString()} band`
        );
      }

      // PDUA low
      if (c.pdua > 0 && c.pdua < GUIDANCE_THRESHOLDS.PDUA_LOW) {
        issues.push(
          `PDUA of ${(c.pdua * 100).toFixed(0)}% is below the ${(GUIDANCE_THRESHOLDS.PDUA_LOW * 100).toFixed(0)}% floor`
        );
      }

      // Still uncollected high
      if (c.still_uncollected > GUIDANCE_THRESHOLDS.STILL_UNCOLLECTED_HIGH) {
        issues.push(
          `Still uncollected of K${c.still_uncollected.toLocaleString()} exceeds the K${GUIDANCE_THRESHOLDS.STILL_UNCOLLECTED_HIGH.toLocaleString()} ceiling`
        );
      }

      // Total uncollected high
      if (c.total_uncollected > GUIDANCE_THRESHOLDS.TOTAL_UNCOLLECTED_HIGH) {
        issues.push(
          `Total uncollected of K${c.total_uncollected.toLocaleString()} exceeds the K${GUIDANCE_THRESHOLDS.TOTAL_UNCOLLECTED_HIGH.toLocaleString()} ceiling`
        );
      }

      // Target missed
      if (c.target_met_current === 0) {
        issues.push('Current cycle target was missed');
      }

      if (issues.length === 0) continue;

      const severity = worstSeverity(...issues.map((issue) => this.classifyIssue(issue)));
      const issuesDisplay = issues.join('; ');

      const band = c.given_out < GUIDANCE_THRESHOLDS.BAND_GIVEN_OUT ? `Below ${GUIDANCE_THRESHOLDS.BAND_GIVEN_OUT.toLocaleString()}` : undefined;

      recommendations.push({
        id: uid('guidance_consultant'),
        kpi: 'Consultant Performance',
        kpiCode: 'consultant_performance',
        severity,
        level: 'consultant',
        consultantId: c.user_id,
        consultantName: c.name,
        officeName: c.office_name,
        districtName: c.district_name,
        provinceName: c.province_name,
        issues,
        band,
        currentValue: c.given_out,
        target: GUIDANCE_THRESHOLDS.BAND_GIVEN_OUT,
        benchmark: c.given_out,
        variance: c.given_out - GUIDANCE_THRESHOLDS.BAND_GIVEN_OUT,
        trend: 'stable',
        whatNeedsAttention: `${c.name} — ${issuesDisplay}`,
        whyAttentionIsNeeded: `Consultant performance flags: ${issuesDisplay}.`,
        recommendedAction: `Coach ${c.name} to improve collections and move the given-out figure above the K${GUIDANCE_THRESHOLDS.BAND_GIVEN_OUT.toLocaleString()} band.`,
        route: `/lms/kpi-dashboard?tab=consultant_performance`,
        priority: 50,
        createdAt: new Date().toISOString(),
        status: 'generated',
      });
    }

    return this.rankRecommendations(recommendations).slice(0, maxRecommendations);
  }

  private classifyIssue(issue: string): GuidanceSeverity {
    if (issue.includes('target was missed')) return 'high';
    if (issue.includes('below the K') && issue.includes('band')) return 'high';
    if (issue.includes('PDUA')) return 'medium';
    if (issue.includes('still uncollected')) return 'medium';
    return 'medium';
  }

  rankRecommendations(recommendations: ManagerGuidanceRecommendation[]): ManagerGuidanceRecommendation[] {
    return [...recommendations].sort((a, b) => {
      const severityOrder: Record<GuidanceSeverity, number> = {
        healthy: 0,
        low: 1,
        medium: 2,
        high: 3,
        critical: 4,
      };
      const sevDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (sevDiff !== 0) return sevDiff;
      return b.priority - a.priority;
    });
  }

  updateStatus(
    recommendations: ManagerGuidanceRecommendation[],
    id: string,
    status: GuidanceStatus
  ): ManagerGuidanceRecommendation[] {
    return recommendations.map((r) => (r.id === id ? { ...r, status } : r));
  }

  markAllViewed(recommendations: ManagerGuidanceRecommendation[]): ManagerGuidanceRecommendation[] {
    return recommendations.map((r) => (r.status === 'generated' ? { ...r, status: 'viewed' } : r));
  }
}

export const managerGuidanceService = ManagerGuidanceService.getInstance();
