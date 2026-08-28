export type GuidanceSeverity = 'healthy' | 'low' | 'medium' | 'high' | 'critical';
export type GuidanceLevel = 'institution' | 'province' | 'district' | 'office' | 'consultant';
export type GuidanceStatus = 'generated' | 'viewed' | 'action_started' | 'resolved' | 'dismissed' | 'snoozed';
export type TrendDirection = 'improving' | 'stable' | 'declining' | 'rapidly_declining';
export type ManagerRoleTier = 'branch' | 'district' | 'province' | 'institution';

export interface OrgUnit {
  id: number;
  name: string;
}

export interface ManagerGuidanceRecommendation {
  id: string;
  kpi: string;
  kpiCode: string;
  severity: GuidanceSeverity;
  level: GuidanceLevel;
  province?: OrgUnit;
  district?: OrgUnit;
  office?: OrgUnit;
  consultants?: Array<{ id: number; name: string }>;
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
  kpiData: Record<string, any>;
  orgHierarchy?: {
    provinces?: Array<{ id: number; name: string; districts?: any[] }>;
    branches?: Array<{ id: number; name: string; provinceId: number; districtId?: number }>;
    consultants?: Array<{ id: number; name: string; officeId: number }>;
  };
  historicalData?: Record<string, number[]>;
  maxRecommendations?: number;
}
