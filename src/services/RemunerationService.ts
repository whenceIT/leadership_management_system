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
  payload: Partial<ManagerProfile>
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
): Promise<{ statement: RemunerationStatement; audit: AuditEntry[] }> {
  return request<{ statement: RemunerationStatement; audit: AuditEntry[] }>(
    `/api/remuneration/statements/${id}`
  );
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
