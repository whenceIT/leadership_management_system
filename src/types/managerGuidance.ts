export type GuidanceSeverity = 'healthy' | 'low' | 'medium' | 'high' | 'critical';
export type GuidanceLevel = 'institution' | 'province' | 'district' | 'office' | 'consultant';
export type GuidanceStatus = 'generated' | 'viewed' | 'action_started' | 'resolved' | 'dismissed' | 'snoozed';
export type TrendDirection = 'improving' | 'stable' | 'declining' | 'rapidly_declining';
export type ManagerRoleTier = 'branch' | 'district' | 'province' | 'institution';

export interface OrgUnit {
  id: number;
  name: string;
}

/**
 * A single consultant's loan-performance record returned by the Performance API
 * (`GET /api/performance/consultants-performance-by-office`).
 */
export interface ConsultantPerformance {
  user_id: number;
  name: string;
  office: number;
  district: number | string;
  province: number | string;
  office_name?: string;
  district_name?: string;
  province_name?: string;
  total_uncollected: number;
  total_collected: number;
  still_uncollected: number;
  given_out: number;
  pdua: number;               // total_collected / total_uncollected (decimal)
  target_met_current: number; // 1 = met, 0 = missed
  target_history: number[];
}

/**
 * Thresholds used to decide whether a consultant shows "poor performance".
 * A consultant appears in the guidance sheet only when at least one condition below is true.
 */
export const GUIDANCE_THRESHOLDS = {
  /** Consultants below this `given_out` value are flagged as below band. */
  BAND_GIVEN_OUT: 40000,
  /** PDUA below this is flagged as low. */
  PDUA_LOW: 0.40,
  /** still_uncollected above this is flagged as high. */
  STILL_UNCOLLECTED_HIGH: 3000,
  /** total_uncollected above this is flagged as high. */
  TOTAL_UNCOLLECTED_HIGH: 8000,
} as const;

export interface ManagerGuidanceRecommendation {
  id: string;
  kpi: string;
  kpiCode: string;
  severity: GuidanceSeverity;
  level: GuidanceLevel;
  province?: OrgUnit;
  district?: OrgUnit;
  office?: OrgUnit;
  consultantId?: number;
  consultantName?: string;
  officeName?: string;
  districtName?: string;
  provinceName?: string;
  /** Poor-performance conditions that triggered this recommendation. */
  issues: string[];
  /** Band label when the consultant is below the given-out band (e.g. "Below 40,000"). */
  band?: string;
  currentValue: number | string;
  target: number | string;
  benchmark: number | string;
  variance: number | string;
  trend: TrendDirection;
  whatNeedsAttention: string;
  whyAttentionIsNeeded: string;
  recommendedAction: string;
  route: string;
  routePreserveFilters?: Record<string, any>;
  priority: number;
  createdAt: string;
  status: GuidanceStatus;
}

/**
 * Legacy rule type retained for the kpiGuidanceRules config file. The guidance
 * engine no longer evaluates KPI rules — it evaluates consultant performance
 * against GUIDANCE_THRESHOLDS instead.
 */
export interface KPIGuidanceRule {
  kpiCode: string;
  kpiName: string;
  target: number;
  warningThreshold: number;
  criticalThreshold: number;
  higherIsBetter: boolean;
  severityRules: {
    healthy: (current: number, target: number) => boolean;
    low: (current: number, target: number) => boolean;
    medium: (current: number, target: number) => boolean;
    high: (current: number, target: number) => boolean;
    critical: (current: number, target: number) => boolean;
  };
  recommendedActions: {
    branch: string;
    district: string;
    province: string;
    institution: string;
  };
  applicableRoles: ManagerRoleTier[];
  route: string;
  category: string;
}

export interface ManagerContext {
  userId: number;
  officeId: number;
  provinceId: number;
  positionId: number;
  positionName: string;
  userTier: ManagerRoleTier;
}

export interface GuidanceEngineInput {
  managerContext: ManagerContext;
  /** Consultant performance records to evaluate. Only poor performers are surfaced. */
  consultants: ConsultantPerformance[];
  maxRecommendations?: number;
}
