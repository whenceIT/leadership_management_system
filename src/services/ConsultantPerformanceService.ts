import { ConsultantPerformance } from '@/types/managerGuidance';

const PERFORMANCE_API_BASE =
  process.env.NEXT_PUBLIC_PERFORMANCE_API_URL ||
  'https://smartbackend.whencefinancesystem.com/api/performance';

function toNumber(value: any, fallback = 0): number {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  const cleaned = String(value).replace(/,/g, '').replace(/[^0-9.\-]/g, '');
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeConsultant(c: any): ConsultantPerformance {
  const targetHistory = Array.isArray(c.target_history) ? c.target_history : [];
  return {
    user_id: toNumber(c.user_id),
    name: c.name || 'Unknown Consultant',
    office: toNumber(c.office),
    district: toNumber(c.district),
    province: toNumber(c.province),
    office_name: c.office_name || undefined,
    district_name: c.district_name || undefined,
    province_name: c.province_name || undefined,
    total_uncollected: toNumber(c.total_uncollected),
    total_collected: toNumber(c.total_collected),
    still_uncollected: toNumber(c.still_uncollected),
    given_out: toNumber(c.given_out),
    pdua: toNumber(c.pdua),
    target_met_current: toNumber(c.target_met_current),
    target_history: targetHistory.map((h: any) => toNumber(h, 0)),
  };
}

/**
 * Fetches consultant loan-performance records for a single office from the
 * Performance API (`GET /consultants-performance-by-office?office_id=...`).
 * Returns an empty array when the office has no consultants or the call fails.
 */
export async function fetchConsultantPerformanceByOffice(
  officeId: number,
  startDate?: string,
  endDate?: string
): Promise<ConsultantPerformance[]> {
  if (!officeId || officeId <= 0) return [];
  const params = new URLSearchParams({ office_id: String(officeId) });
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  const url = `${PERFORMANCE_API_BASE}/consultants-performance-by-office?${params.toString()}`;
  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch consultant performance: ${response.statusText}`);
  }
  const payload = await response.json();
  const data = payload?.data ?? payload ?? [];
  const list = Array.isArray(data) ? data : [data];
  return list.map(normalizeConsultant);
}

/**
 * Fetches consultant performance for every office id provided and returns a
 * flattened list of all consultants across those offices.
 */
export async function fetchConsultantPerformanceByOffices(
  officeIds: number[]
): Promise<ConsultantPerformance[]> {
  const valid = officeIds.filter((id) => id && id > 0);
  if (valid.length === 0) return [];
  const results = await Promise.all(valid.map((id) => fetchConsultantPerformanceByOffice(id)));
  return results.flat();
}
