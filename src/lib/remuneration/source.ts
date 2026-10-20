/**
 * Data source adapter for the remuneration module.
 *
 * Performance results are read from the live Whence backend wherever a
 * manager's measure can be sourced from an existing system module. Every
 * helper degrades gracefully: when an endpoint is unavailable the caller
 * receives a flag instead of an exception so the administrator can enter the
 * result manually and record the evidence.
 */

const API_BASE =
  process.env.BACKEND_API_URL || 'https://smartbackend.whencefinancesystem.com';

export interface SourceOffice {
  id: number;
  name: string;
  parent_id: number | null;
  province_id: number | null;
  district_id: number | null;
  district_regional_id: number | null;
  active: number;
  user_count: number;
  branch_capacity?: number | null;
}

export interface SourceStaff {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  office_id: number | null;
  province_id: number | null;
  job_position: number | null;
  position_id: number | null;
  status: string;
  tier: string | null;
}

export interface SourceOfficeUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  office_id: number;
  status: string;
}

export interface SourceOfficeManagers {
  officeId: number;
  officeName: string;
  provinceId: number | null;
  districtId: number | null;
  managers: SourceOfficeUser[];
}

export interface ScopeResult {
  value: number | null;
  target: number | null;
  score: number | null;
  period: string | null;
  source: string;
  available: boolean;
  message: string;
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      cache: 'force-cache',
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Remuneration source request failed for ${path}:`, error);
    return null;
  }
}

export async function fetchOffices(): Promise<SourceOffice[]> {
  const data = await getJson<SourceOffice[]>('/offices');
  if (!Array.isArray(data)) return [];
  return data;
}

export async function fetchStaff(): Promise<SourceStaff[]> {
  const data = await getJson<SourceStaff[]>('/staff');
  if (!Array.isArray(data)) return [];
  return data;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results.push(await mapper(items[index]));
    }
  });
  await Promise.all(workers);
  return results;
}

/** Office managers, resolved from the staff appointed to each office. */
export async function fetchOfficeManagers(): Promise<SourceOfficeManagers[]> {
  const offices = (await fetchOffices()).filter((office) => office.active === 1);
  if (offices.length === 0) return [];

  const payloads = await mapWithConcurrency(offices, 10, async (office) => {
    const data = await getJson<{ manager_users?: SourceOfficeUser[] }>(
      `/office-users/${office.id}`
    );
    return {
      officeId: office.id,
      officeName: office.name,
      provinceId: office.province_id,
      districtId: office.district_id,
      managers: data?.manager_users ?? [],
    } satisfies SourceOfficeManagers;
  });

  return payloads;
}

/* -------------------------------------------------------------------------- */
/* Performance measures                                                         */
/* -------------------------------------------------------------------------- */

interface RevenueAchievementResponse {
  office_id?: string | number;
  district_id?: string | number;
  province_id?: string | number;
  period?: string;
  actual_revenue?: string | number;
  expected_revenue?: string | number;
  average_score?: string | number;
  score?: string | number;
  percentage_point?: string | number;
  offices_count?: number;
}

function toNumber(value: string | number | undefined | null): number | null {
  if (value === undefined || value === null || value === '') return null;
  const num = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
  return Number.isNaN(num) ? null : num;
}

export async function fetchOfficeRevenue(officeId: number): Promise<ScopeResult> {
  const source = `revenue-achievement/${officeId}`;
  const data = await getJson<RevenueAchievementResponse>(`/${source}`);
  if (!data) {
    return {
      value: null,
      target: null,
      score: null,
      period: null,
      source,
      available: false,
      message: 'Revenue achievement is unavailable for this branch.',
    };
  }
  return {
    value: toNumber(data.actual_revenue),
    target: toNumber(data.expected_revenue),
    score: toNumber(data.score ?? data.average_score),
    period: data.period ?? null,
    source,
    available: true,
    message: '',
  };
}

/** Revenue for a set of branches, aggregated for district and province scope. */
export async function fetchAggregateRevenue(
  officeIds: number[]
): Promise<ScopeResult> {
  const source = `revenue-achievement (${officeIds.length} branches)`;
  if (officeIds.length === 0) {
    return {
      value: 0,
      target: null,
      score: null,
      period: null,
      source,
      available: true,
      message: 'No branches are mapped to this scope yet.',
    };
  }
  const results = await mapWithConcurrency(officeIds, 10, (id) => fetchOfficeRevenue(id));
  const available = results.some((r) => r.available && r.value !== null);
  const total = results.reduce((sum, r) => sum + (r.value ?? 0), 0);
  const scores = results
    .map((r) => r.score)
    .filter((s): s is number => s !== null && s !== undefined);
  const averageScore =
    scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : null;
  return {
    value: total,
    target: null,
    score: averageScore !== null ? Math.round(averageScore * 100) / 100 : null,
    period: results.find((r) => r.period)?.period ?? null,
    source,
    available,
    message: available ? '' : 'No branch revenue could be retrieved for this scope.',
  };
}

interface ScoreResponse {
  period?: string;
  target?: string;
  score?: string | number;
  average_score?: string | number;
  CIR?: string | number;
  PAR?: string | number;
  offices_count?: number;
}

export async function fetchScopeScore(
  path: string
): Promise<ScopeResult> {
  const data = await getJson<ScoreResponse>(path);
  if (!data) {
    return {
      value: null,
      target: null,
      score: null,
      period: null,
      source: path.replace(/^\//, ''),
      available: false,
      message: 'This measure is unavailable from the source system.',
    };
  }
  const rawScore = data.score ?? data.average_score;
  const numeric = toNumber(rawScore);
  return {
    value: numeric === null ? null : Math.round(numeric * 100) / 100,
    target: toNumber(data.target),
    score: numeric === null ? null : Math.round(numeric * 100) / 100,
    period: data.period ?? null,
    source: path.replace(/^\//, ''),
    available: true,
    message: '',
  };
}
