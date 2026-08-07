export type MetricKey =
  | 'Staff Adequacy Score'
  | 'Productivity Achievement'
  | 'Vacancy Impact'
  | 'Portfolio Load Balance';

export type SuggestionSeverity = 'critical' | 'warning' | 'info' | 'good';

export interface SuggestionLocation {
  provinceId?: number;
  provinceName?: string;
  districtId?: number;
  districtName?: string;
  branchId?: number | string;
  branchName?: string;
  officeId?: number | string;
  consultantName?: string;
  consultantId?: number;
}

export interface BranchAttribution {
  branchId?: number | string;
  branchName?: string;
  actualLcs?: number;
  lcsPerOffice?: number;
  portfolioPerLc?: number;
  avgDisbursement?: number;
  vacancies?: number;
  issues: string[];
}

export interface ConsultantAttribution {
  consultantId?: number;
  consultantName?: string;
  officeId?: number;
  officeName?: string;
  metric?: string;
  value?: string;
  issue: string;
}

export interface Suggestion {
  id: string;
  severity: SuggestionSeverity;
  metric: string;
  target: string;
  actual: string;
  finding: string;
  recommendation: string;
  location?: SuggestionLocation;
  details?: string;
  attribution?: BranchAttribution[];
  consultantAttribution?: ConsultantAttribution[];
}

export interface KPIThreshold {
  metric: MetricKey;
  label: string;
  target: number;
  unit: string;
  lowThreshold: number;
  highThreshold?: number;
  optimalRange?: [number, number];
}

export const METRIC_THRESHOLDS: Record<MetricKey, KPIThreshold> = {
  'Staff Adequacy Score': {
    metric: 'Staff Adequacy Score',
    label: 'Loan Consultant (LC) headcount per office',
    target: 11,
    unit: 'LCs per office',
    lowThreshold: 10,
    highThreshold: 12,
    optimalRange: [10, 12],
  },
  'Productivity Achievement': {
    metric: 'Productivity Achievement',
    label: 'Average disbursement per loan consultant (LC) user',
    target: 40000,
    unit: 'ZMW',
    lowThreshold: 40000,
  },
  'Vacancy Impact': {
    metric: 'Vacancy Impact',
    label: 'Vacant LC positions per office',
    target: 0,
    unit: 'vacancies',
    lowThreshold: 0,
    highThreshold: 0,
  },
  'Portfolio Load Balance': {
    metric: 'Portfolio Load Balance',
    label: 'Outstanding loan portfolio per LC user',
    target: 340000,
    unit: 'ZMW',
    lowThreshold: 300000,
    highThreshold: 380000,
    optimalRange: [300000, 380000],
  },
};

export const KPI_SCORE_WARNING = 76;
export const KPI_SCORE_CRITICAL = 60;
