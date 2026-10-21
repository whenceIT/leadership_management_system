/**
 * Adapter for the external remuneration service.
 *
 * The remuneration service (`smart-backend`, Express + MySQL) is the system of
 * record for the remuneration configuration:
 *
 *   - `remuneration_tiers`                      the tier ladder
 *   - `position_remuneration_configs`           position + tier salary packages
 *   - `remuneration_components`                 allowances, deductions, benefits
 *   - `position_remuneration_component_values`   the amount attached to a config
 *   - `remuneration_criteria`                   the qualifying criteria
 *   - `remuneration_housing_bands`              the housing limit per band
 *   - `remuneration_bonus_rules`                the annual bonus rules
 *   - `employee_remuneration_assignments`       who is paid which package
 *   - `remuneration_assessments`                the monthly assessment record
 *
 * Every helper degrades gracefully: when the service is unreachable the caller
 * falls back to the approved structure transcribed from the remuneration guide
 * (`src/lib/remuneration/structure.ts`) and the administration continues.
 *
 * The base URL is read from `REMUNERATION_API_URL` and defaults to the local
 * remuneration service.
 */

// const BASE = process.env.REMUNERATION_API_URL;
const BASE = 'https://smartbackend.whencefinancesystem.com/api/remuneration';

const TIMEOUT_MS = 20_000;

/* -------------------------------------------------------------------------- */
/* Payloads                                                                    */
/* -------------------------------------------------------------------------- */

export interface BackendTier {
  id: number;
  tier_number: number;
  name: string;
  description: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface BackendConfig {
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
  created_at: string;
  updated_at: string;
  position_name: string | null;
  tier_name: string | null;
  tier_number: number | null;
}

export interface BackendComponent {
  id: number;
  name: string;
  code: string;
  component_type: 'allowance' | 'deduction' | 'employer contribution' | 'benefit';
  payment_method: string | null;
  tax_treatment: string | null;
  paid_by: 'employee' | 'employer';
  calculation_type: 'fixed' | 'percentage';
  description: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface BackendComponentValue {
  id: number;
  remuneration_config_id: number;
  remuneration_component_id: number;
  amount: number | null;
  percentage: number | null;
  calculation_base: string | null;
  is_included_in_gross: number;
  is_included_in_company_cost: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  component_name?: string;
  component_code?: string;
  component_type?: string;
  paid_by?: string;
  calculation_type?: string;
}

export interface BackendCriterion {
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
  created_at: string;
  updated_at: string;
}

export interface BackendHousingBand {
  id: number;
  job_position_id: number;
  remuneration_tier_id: number;
  monthly_limit: number;
  effective_from: string;
  effective_to: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  position_name: string | null;
  tier_name: string | null;
  tier_number: number | null;
}

export interface BackendBonusRule {
  id: number;
  job_position_id: number;
  bonus_name: string;
  bonus_type: 'fixed' | 'percentage';
  amount: number | null;
  percentage: number | null;
  performance_metric: string | null;
  minimum_target: number | null;
  period: 'annual' | 'quarterly' | 'monthly';
  effective_from: string;
  effective_to: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  position_name: string | null;
}

export interface BackendAssignment {
  id: number;
  user_id: number;
  job_position_id: number;
  remuneration_config_id: number;
  acting_capacity: number;
  effective_from: string;
  effective_to: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by: number | null;
  approved_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  position_name: string | null;
  gross_pay: number | null;
  tier_name: string | null;
  tier_number: number | null;
}

export interface BackendAssessment {
  id: number;
  employee_remuneration_assignment_id: number;
  assessment_period: string;
  actual_performance: string | Record<string, unknown> | null;
  achievement_percentage: number | null;
  assessment_status: 'pending' | 'passed' | 'failed' | 'under review';
  corrective_plan: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  decision: string | null;
  decision_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackendCalculationComponent {
  name: string;
  code: string;
  component_type: string;
  paid_by: string;
  calculation_type: string;
  amount: number;
  is_included_in_gross: number;
  is_included_in_company_cost: number;
}

export interface BackendCalculation {
  assignment_id: number;
  period: string;
  employee: { name: string; user_id: number };
  position: string | null;
  tier: string | null;
  tier_number: number | null;
  gross_pay: number;
  currency: string;
  employee_deductions: number;
  net_cash_pay: number;
  housing_allowance: number;
  total_direct_value: number;
  employer_contributions: number;
  total_monthly_cost_to_company: number;
  components: BackendCalculationComponent[];
}

export interface BackendOverview {
  overview: {
    tiers: number;
    active_configs: number;
    active_components: number;
    approved_assignments: number;
  };
  endpoints: Record<string, string>;
}

/* -------------------------------------------------------------------------- */
/* Transport                                                                    */
/* -------------------------------------------------------------------------- */

export interface BackendResult<T> {
  ok: boolean;
  data: T | null;
  error: string | null;
}

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<BackendResult<T>> {
  try {
    const response = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || payload?.success === false) {
      const error =
        payload?.error ?? payload?.message ?? `Request failed (${response.status})`;
      return { ok: false, data: null, error };
    }

    return { ok: true, data: (payload?.data ?? null) as T | null, error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'The remuneration service is unreachable.';
    return { ok: false, data: null, error: message };
  }
}

function query(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  const suffix = search.toString();
  return suffix ? `?${suffix}` : '';
}

/* -------------------------------------------------------------------------- */
/* Reads                                                                        */
/* -------------------------------------------------------------------------- */

export function fetchBackendOverview(): Promise<BackendResult<BackendOverview>> {
  return request<BackendOverview>('/');
}

export function fetchBackendTiers(): Promise<BackendResult<BackendTier[]>> {
  return request<BackendTier[]>('/tiers');
}

export function fetchBackendConfigs(params?: {
  job_position_id?: number;
  remuneration_tier_id?: number;
  status?: string;
}): Promise<BackendResult<BackendConfig[]>> {
  return request<BackendConfig[]>(`/configs${query(params ?? {})}`);
}

export function fetchBackendComponents(params?: {
  component_type?: string;
  is_active?: string;
}): Promise<BackendResult<BackendComponent[]>> {
  return request<BackendComponent[]>(`/components${query(params ?? {})}`);
}

export function fetchBackendComponentValues(params?: {
  remuneration_config_id?: number;
}): Promise<BackendResult<BackendComponentValue[]>> {
  return request<BackendComponentValue[]>(
    `/component-values${query(params ?? {})}`
  );
}

export function fetchBackendCriteria(params?: {
  remuneration_config_id?: number;
}): Promise<BackendResult<BackendCriterion[]>> {
  return request<BackendCriterion[]>(`/criteria${query(params ?? {})}`);
}

export function fetchBackendHousingBands(params?: {
  job_position_id?: number;
  remuneration_tier_id?: number;
  status?: string;
}): Promise<BackendResult<BackendHousingBand[]>> {
  return request<BackendHousingBand[]>(`/housing-bands${query(params ?? {})}`);
}

export function fetchBackendBonusRules(params?: {
  job_position_id?: number;
  status?: string;
  period?: string;
}): Promise<BackendResult<BackendBonusRule[]>> {
  return request<BackendBonusRule[]>(`/bonus-rules${query(params ?? {})}`);
}

export function fetchBackendAssignments(params?: {
  user_id?: number;
  job_position_id?: number;
  approval_status?: string;
}): Promise<BackendResult<BackendAssignment[]>> {
  return request<BackendAssignment[]>(`/assignments${query(params ?? {})}`);
}

export function fetchBackendAssessments(params?: {
  employee_remuneration_assignment_id?: number;
  assessment_status?: string;
}): Promise<BackendResult<BackendAssessment[]>> {
  return request<BackendAssessment[]>(`/assessments${query(params ?? {})}`);
}

/**
 * Runs the remuneration service calculation for an assignment.
 *
 * The documented route is `GET /api/remuneration/calculate/:assignment_id`.
 * The service currently mounts the calculation router under
 * `/api/remuneration/calculate` as well, so the deployed path carries the
 * segment twice. The documented path is tried first and the mounted path is
 * used as the fallback, so the module works with either deployment.
 */
export async function calculateBackendRemuneration(
  assignmentId: number | string,
  period: string
): Promise<BackendResult<BackendCalculation>> {
  const documented = await request<BackendCalculation>(
    `/calculate/${assignmentId}${query({ period })}`
  );
  if (documented.ok) return documented;

  const mounted = await request<BackendCalculation>(
    `/calculate/calculate/${assignmentId}${query({ period })}`
  );
  if (mounted.ok) return mounted;

  return {
    ok: false,
    data: null,
    error: documented.error ?? mounted.error,
  };
}

/* -------------------------------------------------------------------------- */
/* Writes                                                                       */
/* -------------------------------------------------------------------------- */

export function createBackendAssignment(payload: {
  user_id: number;
  job_position_id: number;
  remuneration_config_id: number;
  acting_capacity?: boolean;
  effective_from: string;
  effective_to?: string | null;
  approval_status?: string;
  notes?: string | null;
}): Promise<BackendResult<{ id: number }>> {
  return request<{ id: number }>('/assignments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function approveBackendAssignment(
  id: number | string,
  approvedBy?: number | null
): Promise<BackendResult<null>> {
  return request<null>(`/assignments/${id}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ approved_by: approvedBy ?? null }),
  });
}

export function createBackendAssessment(payload: {
  employee_remuneration_assignment_id: number;
  assessment_period: string;
  actual_performance?: Record<string, unknown> | null;
  achievement_percentage?: number | null;
  assessment_status?: string;
  corrective_plan?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  decision?: string | null;
  decision_notes?: string | null;
}): Promise<BackendResult<{ id: number }>> {
  return request<{ id: number }>('/assessments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateBackendConfig(
  id: number | string,
  payload: Partial<{
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
  }>
): Promise<BackendResult<null>> {
  return request<null>(`/configs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function upsertBackendComponentValue(payload: {
  remuneration_config_id: number;
  remuneration_component_id: number;
  amount?: number | null;
  percentage?: number | null;
  calculation_base?: string | null;
  is_included_in_gross?: boolean;
  is_included_in_company_cost?: boolean;
  notes?: string | null;
}): Promise<BackendResult<{ id: number }>> {
  return request<{ id: number }>('/component-values', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createBackendCriterion(payload: {
  remuneration_config_id: number;
  criterion_name: string;
  criterion_code: string;
  measurement_type: string;
  operator: string;
  target_value?: number | null;
  measurement_period: string;
  is_mandatory?: boolean;
  verification_source?: string | null;
}): Promise<BackendResult<{ id: number }>> {
  return request<{ id: number }>('/criteria', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createBackendHousingBand(payload: {
  job_position_id: number;
  remuneration_tier_id: number;
  monthly_limit: number;
  effective_from: string;
  effective_to?: string | null;
  status?: string;
}): Promise<BackendResult<{ id: number }>> {
  return request<{ id: number }>('/housing-bands', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createBackendBonusRule(payload: {
  job_position_id: number;
  bonus_name: string;
  bonus_type: string;
  amount?: number | null;
  percentage?: number | null;
  performance_metric?: string | null;
  minimum_target?: number | null;
  period: string;
  effective_from: string;
  effective_to?: string | null;
  status?: string;
}): Promise<BackendResult<{ id: number }>> {
  return request<{ id: number }>('/bonus-rules', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createBackendTier(payload: {
  tier_number: number;
  name: string;
  description?: string | null;
  is_active?: boolean;
}): Promise<BackendResult<{ id: number }>> {
  return request<{ id: number }>('/tiers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/* -------------------------------------------------------------------------- */
/* Health                                                                       */
/* -------------------------------------------------------------------------- */

export interface BackendHealth {
  connected: boolean;
  baseUrl: string;
  error: string | null;
  overview: BackendOverview['overview'] | null;
}

export async function backendHealth(): Promise<BackendHealth> {
  const result = await fetchBackendOverview();
  return {
    connected: result.ok,
    baseUrl: BASE,
    error: result.error,
    overview: result.data?.overview ?? null,
  };
}
