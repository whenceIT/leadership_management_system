'use client';

import type {
  AuditEntry,
  ManagerProfile,
  PerformanceMeasure,
  RemunerationComputation,
  RemunerationStatement,
  StatutoryRules,
  StatementStatus,
} from '@/lib/remuneration/types';

export interface ServiceTier {
  id: number;
  tier_number: number;
  name: string;
  description: string | null;
  is_active: number;
}

export interface ServiceConfig {
  id: number;
  job_position_id: number;
  remuneration_tier_id: number;
  gross_pay: number;
  target_net_pay: number | null;
  currency: string;
  threshold_type: string | null;
  threshold_amount: number | null;
  threshold_operator: string | null;
  threshold_upper_amount: number | null;
  threshold_period: string | null;
  min_branches: number | null;
  max_branches: number | null;
  effective_from: string;
  effective_to: string | null;
  status: string;
  position_name: string | null;
  tier_name: string | null;
  tier_number: number | null;
}

export interface ServiceComponent {
  id: number;
  name: string;
  code: string;
  component_type: string;
  payment_method: string | null;
  tax_treatment: string | null;
  paid_by: string;
  calculation_type: string;
  description: string | null;
  is_active: number;
}

export interface ServiceComponentValue {
  id: number;
  remuneration_config_id: number;
  remuneration_component_id: number;
  amount: number | null;
  percentage: number | null;
  calculation_base: string | null;
  is_included_in_gross: number;
  is_included_in_company_cost: number;
  notes: string | null;
  component_name?: string;
  component_code?: string;
  component_type?: string;
  paid_by?: string;
  calculation_type?: string;
}

export interface ServiceCriterion {
  id: number;
  remuneration_config_id: number;
  criterion_name: string;
  criterion_code: string;
  measurement_type: string;
  operator: string;
  target_value: number | null;
  measurement_period: string;
  is_mandatory: number;
  verification_source: string | null;
}

export interface ServiceHousingBand {
  id: number;
  job_position_id: number;
  remuneration_tier_id: number;
  monthly_limit: number;
  effective_from: string;
  effective_to: string | null;
  status: string;
  position_name: string | null;
  tier_name: string | null;
  tier_number: number | null;
}

export interface ServiceBonusRule {
  id: number;
  job_position_id: number;
  bonus_name: string;
  bonus_type: string;
  amount: number | null;
  percentage: number | null;
  performance_metric: string | null;
  minimum_target: number | null;
  period: string;
  effective_from: string;
  status: string;
  position_name: string | null;
}

export interface ServiceAssignment {
  userId: number;
  assignmentId: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  actingCapacity: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  positionId: number;
  positionName: string | null;
  configId: number;
  tier: number | null;
  tierName: string | null;
  grossPay: number | null;
  notes: string | null;
}

export interface ServiceAssessment {
  id: number;
  employee_remuneration_assignment_id: number;
  assessment_period: string;
  actual_performance: string | Record<string, unknown> | null;
  achievement_percentage: number | null;
  assessment_status: string;
  corrective_plan: string | null;
  decision: string | null;
  decision_notes: string | null;
  created_at: string;
}

export interface StructureResponse {
  roles: import('@/lib/remuneration/types').RoleDefinition[];
  payBlocks: Record<string, unknown>;
  housingBands: Record<string, import('@/lib/remuneration/types').HousingBand>;
  housingPolicy: {
    heading: string;
    maximumQuarterlyCost: number;
    coverage: string;
    rules: string[];
  };
  bonusRules: import('@/lib/remuneration/types').BonusRule[];
  statutory: StatutoryRules;
  incrementPolicy: {
    heading: string;
    principles: string[];
    escalation: { stage: string; rule: string }[];
    monitoring: string;
  };
  allowancePolicy: {
    heading: string;
    rule: string;
    scheme: { pension: string; medical: string };
  };
  confirmationChecklist: {
    key: string;
    title: string;
    question: string;
    status: 'open' | 'confirmed';
  }[];
  persistence: 'mysql' | 'in-process';
  service: {
    connected: boolean;
    error: string | null;
    counts: {
      tiers: number;
      configs: number;
      activeConfigs: number;
      components: number;
      componentValues: number;
      criteria: number;
      housingBands: number;
      bonusRules: number;
    };
    tiers: ServiceTier[];
    configs: ServiceConfig[];
    components: ServiceComponent[];
    componentValues: ServiceComponentValue[];
    criteria: ServiceCriterion[];
    housingBands: ServiceHousingBand[];
    bonusRules: ServiceBonusRule[];
  };
}

export interface PerformancePayload {
  value: number | null;
  manualTier: number | null;
  overrideReason: string | null;
  efficiencyScore: number | null;
  pduaScore: number | null;
  branchCount: number | null;
  source: string;
  measures: PerformanceMeasure[];
}

export interface SummaryResponse {
  period: string | null;
  totals: {
    statements: number;
    managers: number;
    grossPay: number;
    employeeDeductions: number;
    netCashPay: number;
    housing: number;
    benefits: number;
    bonus: number;
    employerCosts: number;
    totalCompanyCost: number;
    totalDirectValue: number;
  };
  byRole: {
    key: string;
    label: string;
    count: number;
    grossPay: number;
    netCashPay: number;
    totalCompanyCost: number;
  }[];
  byTier: {
    key: string;
    label: string;
    count: number;
    grossPay: number;
    netCashPay: number;
    totalCompanyCost: number;
  }[];
  byStatus: { status: string; count: number }[];
  periods: string[];
  statements: RemunerationStatement[];
  service: {
    connected: boolean;
    error: string | null;
    overview: {
      tiers: number;
      active_configs: number;
      active_components: number;
      approved_assignments: number;
    } | null;
    totals: {
      statements: number;
      unqualified: number;
      grossPay: number;
      netCashPay: number;
      housing: number;
      employerContributions: number;
      totalCompanyCost: number;
    };
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => ({ success: false, message: 'Invalid response' }));
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message ?? `Request failed (${response.status})`);
  }
  return payload.data as T;
}

/* ------------------------------- Structure -------------------------------- */

export function fetchStructure(): Promise<StructureResponse> {
  return request<StructureResponse>('/api/remuneration/structure');
}

/* -------------------------------- Managers -------------------------------- */

export interface ManagersResponse {
  managers: ManagerProfile[];
  offices: {
    id: number;
    name: string;
    province_id: number | null;
    district_id: number | null;
  }[];
  districts: { id: number; name: string; provinceId: number | null }[];
  service: {
    connected: boolean;
    error: string | null;
    assignments: ServiceAssignment[];
    counts: { total: number; approved: number; pending: number };
  };
  counts: { total: number; registered: number; acting: number };
}

export function fetchManagers(params?: {
  role?: string;
  search?: string;
  scope?: string;
}): Promise<ManagersResponse> {
  const query = new URLSearchParams();
  if (params?.role) query.set('role', params.role);
  if (params?.search) query.set('search', params.search);
  if (params?.scope) query.set('scope', params.scope);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<ManagersResponse>(`/api/remuneration/managers${suffix}`);
}

export function saveManagerAssignment(payload: Partial<ManagerProfile>): Promise<ManagerProfile> {
  return request<ManagerProfile>('/api/remuneration/managers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateManagerAssignment(
  id: string,
  payload: Partial<ManagerProfile> & { approveServiceAssignment?: boolean }
): Promise<ManagerProfile> {
  return request<ManagerProfile>(`/api/remuneration/managers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/* ------------------------------ Performance ------------------------------- */

export interface PerformanceResponse {
  manager: ManagerProfile;
  role: import('@/lib/remuneration/types').RoleDefinition;
  performance: PerformancePayload;
  evidence: {
    revenue: {
      value: number | null;
      target: number | null;
      score: number | null;
      period: string | null;
      source: string;
      available: boolean;
      message: string;
    } | null;
    efficiency: {
      value: number | null;
      target: number | null;
      score: number | null;
      period: string | null;
      source: string;
      available: boolean;
      message: string;
    } | null;
    portfolioQuality: {
      value: number | null;
      target: number | null;
      score: number | null;
      period: string | null;
      source: string;
      available: boolean;
      message: string;
    } | null;
  };
  officesInScope: number;
}

export function fetchPerformance(
  managerId: string,
  period: string
): Promise<PerformanceResponse> {
  return request<PerformanceResponse>(
    `/api/remuneration/performance?managerId=${encodeURIComponent(managerId)}&period=${period}`
  );
}

/* ------------------------- Performance criteria (API) ------------------------- */

/**
 * Fetches the total collected amount (monthly revenue) for a manager's
 * position from the performance criteria API. For revenue-based roles the
 * response `total_collected` is used as the measured amount that is compared
 * against the monthly revenue targets in the remuneration guide to assign a tier.
 */
export interface PerformanceCriteriaResponse {
  job_position: string;
  user_id: string | null;
  office_id: string | null;
  period: {
    start_date: string;
    end_date: string;
  };
  total_collected: number;
  detail: {
    scope: string;
    office_id?: string;
    province_id?: string;
    district_id?: string;
  };
}

export interface PerformanceCriteriaParams {
  job_position: string;
  office_id?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
}

export function fetchPerformanceCriteria(
  params: PerformanceCriteriaParams
): Promise<PerformanceCriteriaResponse> {
  const query = new URLSearchParams();
  query.set('job_position', params.job_position);
  if (params.office_id) query.set('office_id', params.office_id);
  if (params.user_id) query.set('user_id', params.user_id);
  if (params.start_date) query.set('start_date', params.start_date);
  if (params.end_date) query.set('end_date', params.end_date);
  return request<PerformanceCriteriaResponse>(
    `https://smartbackend.whencefinancesystem.com/api/remuneration/performance-creteria?${query.toString()}`
  );
}

/* ------------------------------- Calculate -------------------------------- */

export interface CalculationResponse {
  computation: RemunerationComputation;
  scopeLabel: string;
  manager: ManagerProfile;
}

export function calculateRemuneration(payload: {
  managerId: string;
  period: string;
  performance?: Partial<PerformancePayload>;
  previousTier?: number | null;
  statutory?: Partial<StatutoryRules>;
}): Promise<CalculationResponse> {
  return request<CalculationResponse>('/api/remuneration/calculate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/* ------------------------------- Statements ------------------------------- */

export interface StatementsResponse {
  statements: RemunerationStatement[];
  counts: {
    total: number;
    pendingApproval: number;
    approved: number;
    rejected: number;
    finalised: number;
  };
}

export function fetchStatements(params?: {
  period?: string;
  status?: string;
}): Promise<StatementsResponse> {
  const query = new URLSearchParams();
  if (params?.period) query.set('period', params.period);
  if (params?.status) query.set('status', params.status);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<StatementsResponse>(`/api/remuneration/statements${suffix}`);
}

export function saveStatement(payload: {
  managerId: string;
  period: string;
  performance?: Partial<PerformancePayload>;
  previousTier?: number | null;
  statutory?: Partial<StatutoryRules>;
  status?: StatementStatus;
  createdBy?: string;
}): Promise<RemunerationStatement> {
  return request<RemunerationStatement>('/api/remuneration/statements', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateStatementStatus(
  id: string,
  payload: { status: StatementStatus; reason?: string; actor?: string }
): Promise<RemunerationStatement> {
  return request<RemunerationStatement>(`/api/remuneration/statements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function fetchStatementDetail(
  id: string
): Promise<{
  statement: RemunerationStatement;
  audit: AuditEntry[];
  assessments: ServiceAssessment[];
}> {
  return request<{
    statement: RemunerationStatement;
    audit: AuditEntry[];
    assessments: ServiceAssessment[];
  }>(`/api/remuneration/statements/${id}`);
}

/* --------------------------------- Summary -------------------------------- */

export function fetchSummary(period?: string): Promise<SummaryResponse> {
  const suffix = period ? `?period=${encodeURIComponent(period)}` : '';
  return request<SummaryResponse>(`/api/remuneration/summary${suffix}`);
}

export function summaryExportUrl(period?: string): string {
  const suffix = period ? `?period=${encodeURIComponent(period)}&format=csv` : '?format=csv';
  return `/api/remuneration/summary${suffix}`;
}

/* --------------------------- Local rule overrides -------------------------- */

export const STATUTORY_RULES_KEY = 'remuneration.statutoryRules';

/** Administrator overrides for the statutory rules, applied to every calculation. */
export function loadStatutoryOverrides(): Partial<StatutoryRules> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STATUTORY_RULES_KEY);
    return raw ? (JSON.parse(raw) as Partial<StatutoryRules>) : null;
  } catch {
    return null;
  }
}

export function saveStatutoryOverrides(rules: Partial<StatutoryRules>): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STATUTORY_RULES_KEY, JSON.stringify(rules));
}

export function clearStatutoryOverrides(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STATUTORY_RULES_KEY);
}
