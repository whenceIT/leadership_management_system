export interface CashPositionData {
  filter_type?: string;
  office_id?: string;
  office_name?: string;
  province_id?: string;
  district_id?: string;
  offices_count?: number;
  period?: { start_date?: string; end_date?: string } | string;
  workstations?: number;
  minimum_loan_target?: number;
  amount_disbursed?: number;
  adjusted_disbursed_140_percent?: number;
  total_collected?: number;
  collection_rate?: number;
  shortfall_against_target?: number;
  defaults?: number;
  mandatory_fixed_costs?: number;
  salaries_performance_allowances?: number;
  net_cash_position?: number;
  total_minimum_needed?: number;
  verdict?: string;
  verdict_reason?: string;

  score?: number | string;
  average_score?: number | string;
  average_normalized_score?: number | string;
  percentage_points?: number | string;
  closing_balance?: number | string;
  weight?: number | string;
  percentage_point?: number | string;
  totalCashBalance?: number;

  cash_position_score?: number;
}

export interface CashHealthFinancials {
  minimum_loan_target?: number;
  maximum_expected_repayment?: number;
  mandatory_fixed_cost?: number;
  salaries?: number;
  defaults?: number;
  irregular_cost_reserve?: number;
  averageMonthlyIrregularCostReserve?: number;
  salary_advance_reserve?: number;
  net_cash_position?: number;
  residual_cash?: number;
  [key: string]: unknown;
}

export interface CashHealthScores {
  disbursement?: number;
  collection?: number;
  residual_cash?: number;
  overall?: number;
  status?: string;
  [key: string]: unknown;
}

export interface CashHealthCycle {
  start_date?: string;
  end_date?: string;
  [key: string]: unknown;
}

export interface CashHealthOffice {
  office_id?: number;
  office_name?: string;
  cycle?: CashHealthCycle;
  disbursed?: number;
  collected?: number;
  financials?: CashHealthFinancials;
  reserve_breakdown?: Record<string, unknown>;
  scores?: CashHealthScores;
  reason?: string;
  details?: any;
  [key: string]: unknown;
}

export interface CashHealthDistrict {
  district_id?: number;
  district_name?: string;
  office_count?: number;
  cycle?: CashHealthCycle;
  financials?: CashHealthFinancials;
  reserve_breakdown?: Record<string, unknown>;
  scores?: CashHealthScores;
  reason?: string;
  offices?: CashHealthOffice[];
  [key: string]: unknown;
}

export interface CashHealthDistrictData {
  district_id?: number;
  district_name?: string;
  office_count?: number;
  cycle?: CashHealthCycle;
  disbursed?: number;
  collected?: number;
  financials?: CashHealthFinancials;
  reserve_breakdown?: Record<string, unknown>;
  scores?: CashHealthScores;
  reason?: string;
  offices?: CashHealthOffice[];
  [key: string]: unknown;
}

export interface CashHealthProvinceData {
  province_id?: number;
  province_name?: string;
  office_count?: number;
  cycle?: CashHealthCycle;
  financials?: CashHealthFinancials;
  reserve_breakdown?: Record<string, unknown>;
  scores?: CashHealthScores;
  reason?: string;
  districts?: CashHealthDistrict[];
  [key: string]: unknown;
}

export interface CashHealthProvince {
  province_id?: number;
  province_name?: string;
  office_count?: number;
  cycle?: CashHealthCycle;
  financials?: CashHealthFinancials;
  reserve_breakdown?: Record<string, unknown>;
  scores?: CashHealthScores;
  reason?: string;
   districts?: CashHealthDistrict[];
  [key: string]: unknown;
}

export interface ExecutiveCashHealthData {
  level?: string;
  office_count?: number;
  cycle?: CashHealthCycle;
  financials?: CashHealthFinancials;
  reserve_breakdown?: Record<string, unknown>;
  scores?: CashHealthScores;
  reason?: string;
  provinces: CashHealthProvince[];
  totalCashBalance?: number;
  cash_position_score?: number;
  score?: number;
  average_score?: number;
  average_normalized_score?: number;
  percentage_point?: number;
  net_cash_position?: number;
  [key: string]: unknown;
}

const CASH_HEALTH_API_BASE = process.env.NEXT_PUBLIC_CASH_HEALTH_API_URL || 'https://lms2backend.whencefinancesystem.com';

function parseCashHealthNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  const parsed = parseFloat(String(value).replace(/,/g, '').replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeCashHealthFinancials(value: any): CashHealthFinancials | undefined {
  if (!value || typeof value !== 'object') return undefined;
  return {
    ...value,
    minimum_loan_target: parseCashHealthNumber(value.minimum_loan_target),
    maximum_expected_repayment: parseCashHealthNumber(value.maximum_expected_repayment),
    mandatory_fixed_cost: parseCashHealthNumber(value.mandatory_fixed_cost),
    salaries: parseCashHealthNumber(value.salaries),
    defaults: parseCashHealthNumber(value.defaults),
    irregular_cost_reserve: parseCashHealthNumber(value.irregular_cost_reserve),
    averageMonthlyIrregularCostReserve: parseCashHealthNumber(value.averageMonthlyIrregularCostReserve),
    salary_advance_reserve: parseCashHealthNumber(value.salary_advance_reserve),
    net_cash_position: parseCashHealthNumber(value.net_cash_position),
    residual_cash: parseCashHealthNumber(value.residual_cash),
  };
}

function normalizeCashHealthScores(value: any): CashHealthScores | undefined {
  if (!value || typeof value !== 'object') return undefined;
  return {
    ...value,
    disbursement: parseCashHealthNumber(value.disbursement),
    collection: parseCashHealthNumber(value.collection),
    residual_cash: parseCashHealthNumber(value.residual_cash),
    overall: parseCashHealthNumber(value.overall),
  };
}

function normalizeCashHealthOffice(value: any): CashHealthOffice {
  return {
    ...value,
    office_id: parseCashHealthNumber(value.office_id ?? value.id),
    cycle: value.cycle || undefined,
    disbursed: parseCashHealthNumber(value.disbursed),
    collected: parseCashHealthNumber(value.collected),
    financials: normalizeCashHealthFinancials(value.financials),
    reserve_breakdown: value.reserve_breakdown || {},
    scores: normalizeCashHealthScores(value.scores),
    reason: value.reason || '',
    details: value.details || undefined,
  };
}

function normalizeCashHealthDistrict(value: any): CashHealthDistrict {
  return {
    ...value,
    district_id: parseCashHealthNumber(value.district_id ?? value.id),
    office_count: parseCashHealthNumber(value.office_count) || 0,
    financials: normalizeCashHealthFinancials(value.financials),
    reserve_breakdown: value.reserve_breakdown || {},
    scores: normalizeCashHealthScores(value.scores),
    reason: value.reason || '',
    offices: Array.isArray(value.offices) ? value.offices.map(normalizeCashHealthOffice) : [],
  };
}

function normalizeCashHealthProvince(value: any): CashHealthProvince {
  return {
    ...value,
    province_id: parseCashHealthNumber(value.province_id ?? value.id),
    office_count: parseCashHealthNumber(value.office_count) || 0,
    financials: normalizeCashHealthFinancials(value.financials),
    reserve_breakdown: value.reserve_breakdown || {},
    scores: normalizeCashHealthScores(value.scores),
    reason: value.reason || '',
    districts: Array.isArray(value.districts) ? value.districts.map(normalizeCashHealthDistrict) : [],
  };
}

export async function fetchExecutiveCashHealth(): Promise<ExecutiveCashHealthData> {
  const response = await fetch(`${CASH_HEALTH_API_BASE}/cash-health/national`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch executive cash health: ${response.statusText}`);
  }

  const payload = await response.json();
  const result = payload?.data && typeof payload.data === 'object' ? payload.data : payload;

  if (result?.error) {
    throw new Error(result.message || result.error);
  }

  const provinces: CashHealthProvince[] = Array.isArray(result?.provinces)
    ? result.provinces.map(normalizeCashHealthProvince)
    : [];
  const financials = normalizeCashHealthFinancials(result?.financials);
  const scores = normalizeCashHealthScores(result?.scores);
  const residualCash = financials?.residual_cash ?? financials?.net_cash_position ?? 0;

  return {
    ...result,
    level: result?.level || 'national',
    office_count: parseCashHealthNumber(result?.office_count) || provinces.reduce((sum, province) => sum + (province.office_count || 0), 0),
    cycle: result?.cycle || undefined,
    financials,
    reserve_breakdown: result?.reserve_breakdown || {},
    scores,
    reason: result?.reason || '',
    provinces,
    totalCashBalance: residualCash,
    cash_position_score: scores?.overall,
    score: scores?.overall,
    average_score: scores?.overall,
    average_normalized_score: scores?.overall,
    percentage_point: scores?.overall,
    net_cash_position: financials?.net_cash_position,
  };
}

const CASH_HEALTH_PROVINCE_API_BASE = process.env.NEXT_PUBLIC_CASH_HEALTH_API_URL || 'https://lms2backend.whencefinancesystem.com';

export async function fetchCashHealthProvince(provinceId: number): Promise<CashHealthProvinceData> {
  const response = await fetch(`${CASH_HEALTH_PROVINCE_API_BASE}/cash-health/province/${provinceId}?cycle_start=${getCurrentCycleStart()}`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch cash health province: ${response.statusText}`);
  }

  const payload = await response.json();
  const result = payload?.data && typeof payload.data === 'object' ? payload.data : payload;

  if (result?.error) {
    throw new Error(result.message || result.error);
  }

  const financials = normalizeCashHealthFinancials(result?.financials);
  const scores = normalizeCashHealthScores(result?.scores);
  const districts = Array.isArray(result?.districts)
    ? result.districts.map(normalizeCashHealthDistrict)
    : [];

  return {
    ...result,
    province_id: parseCashHealthNumber(result?.province_id ?? result?.id),
    province_name: result?.province_name || `Province ${result?.province_id}`,
    office_count: parseCashHealthNumber(result?.office_count) || 0,
    cycle: result?.cycle || undefined,
    financials,
    reserve_breakdown: result?.reserve_breakdown || {},
    scores,
    reason: result?.reason || '',
    districts,
    totalCashBalance: financials?.residual_cash ?? financials?.net_cash_position ?? 0,
    cash_position_score: scores?.overall,
    score: scores?.overall,
    average_score: scores?.overall,
    average_normalized_score: scores?.overall,
    net_cash_position: financials?.net_cash_position,
  };
}

const THRESHOLDS = {
  ABSOLUTE_MINIMUM: 20000,
  IDEAL_LOWER: 20000,
  IDEAL_UPPER: 30000,
  EXCEPTIONAL_MAX: 50000,
  CRITICAL_MAX: 50000,
  CRITICAL_MIN: 10000
};

import { Office } from '@/types/dashboard';

const LEDGER_API = 'https://withinheremobileapi.com/api/v1/lmsuser/branch_ledger';

async function fetchKpiSummary(walletId: string, startDate = '2026-01-01', endDate?: string) {
  const payload: any = {
    wallet_id: walletId,
    start_date: startDate,
    end_date: endDate || new Date().toISOString().split('T')[0],
  };

  const response = await fetch(LEDGER_API, {
    method: 'POST',
    cache: "no-store",
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch branch ledger: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result?.success) throw new Error('API returned success false');
  return result;
}

export function calculateCashPositionScore(totalCashBalance: number): number {
  if (totalCashBalance >= THRESHOLDS.IDEAL_LOWER && totalCashBalance <= THRESHOLDS.IDEAL_UPPER) {
    return 100;
  } else if (totalCashBalance > THRESHOLDS.IDEAL_UPPER && totalCashBalance <= THRESHOLDS.EXCEPTIONAL_MAX) {
    const excess = totalCashBalance - THRESHOLDS.IDEAL_UPPER;
    const penalty = (excess / 20000) * 40;
    return Math.max(100 - penalty, 60);
  } else if (totalCashBalance > THRESHOLDS.CRITICAL_MAX) {
    return 0;
  } else if (totalCashBalance >= THRESHOLDS.CRITICAL_MIN && totalCashBalance < THRESHOLDS.IDEAL_LOWER) {
    const shortfall = THRESHOLDS.IDEAL_LOWER - totalCashBalance;
    const penalty = (shortfall / 10000) * 50;
    return Math.max(100 - penalty, 50);
  } else if (totalCashBalance < THRESHOLDS.CRITICAL_MIN) {
    return 0;
  }
  return 100;
}

export function calculateCashLiquidityIndex(totalCashBalance: number): {
  cashPositionScore: number;
  compositeScore: number;
} {
  const cashPositionScore = calculateCashPositionScore(totalCashBalance);
  const compositeScore = cashPositionScore;

  return {
    cashPositionScore: Math.round(cashPositionScore * 100) / 100,
    compositeScore: Math.round(compositeScore * 100) / 100
  };
}

async function getOfficesFromApi(): Promise<Office[]> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/offices');
  if (!response.ok) throw new Error('Failed to fetch offices');
  const data = await response.json();
  const arr = Array.isArray(data) ? data : (data.data || []);
  return arr.map((o: any) => ({
    id: o.id,
    name: o.name,
    parentId: o.parent_id ?? null,
    externalId: o.external_id || '',
    provinceId: o.province_id ?? o.provinceId,
    districtId: o.district_id ?? o.districtId,
    withinhereWalletId: o.withinhere_wallet_id || o.withinhereWalletId || null,
  }));
}

async function fetchLedgerForWallet(walletId: string, startDate = '2026-01-01', endDate?: string) {
  const result = await fetchKpiSummary(walletId, startDate, endDate);
  const cashBalance = parseFloat(result?.user?.cash_balance || '0');
  return {
    cashBalance,
    apiData: result,
  };
}

export async function fetchCashPosition(branchId: number): Promise<CashPositionData> {
  const url = `https://smartbackend.whencefinancesystem.com/api/kpi-scores/cash-position?office_id=${branchId}`;
  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch cash position: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result?.success) {
    throw new Error('API returned success false');
  }

  const apiData = result.data || {};
  const parseNumber = (value: any): number | undefined => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'number') return value;
    const cleaned = String(value).replace(/,/g, '').replace(/[^0-9.\-]/g, '');
    const parsed = parseFloat(cleaned);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const parsedCashPositionData: CashPositionData = {
    ...apiData,
    workstations: parseNumber(apiData.workstations),
    minimum_loan_target: parseNumber(apiData.minimum_loan_target),
    amount_disbursed: parseNumber(apiData.amount_disbursed),
    adjusted_disbursed_140_percent: parseNumber(apiData.adjusted_disbursed_140_percent),
    total_collected: parseNumber(apiData.total_collected),
    collection_rate: parseNumber(apiData.collection_rate),
    shortfall_against_target: parseNumber(apiData.shortfall_against_target),
    defaults: parseNumber(apiData.defaults),
    mandatory_fixed_costs: parseNumber(apiData.mandatory_fixed_costs),
    salaries_performance_allowances: parseNumber(apiData.salaries_performance_allowances),
    net_cash_position: parseNumber(apiData.net_cash_position),
    total_minimum_needed: parseNumber(apiData.total_minimum_needed),
    cash_position_score: parseNumber(apiData.cash_position_score),
    score: parseNumber(apiData.score),
    average_score: parseNumber(apiData.average_score),
    average_normalized_score: parseNumber(apiData.average_normalized_score),
    percentage_points: parseNumber(apiData.percentage_points),
    percentage_point: parseNumber(apiData.percentage_point),
    totalCashBalance: parseNumber(apiData.totalCashBalance)
  };

  const deriveScoreFromNetCash = (netCashPosition?: number, totalMinimumNeeded?: number): number | undefined => {
    if (netCashPosition === undefined || netCashPosition === null) return undefined;
    if (netCashPosition >= 0) return 100;
    if (totalMinimumNeeded && totalMinimumNeeded > 0) {
      const ratio = 1 + netCashPosition / totalMinimumNeeded;
      return Math.max(0, Math.min(100, ratio * 100));
    }
    const fallback = Math.max(0, Math.min(100, 100 + (netCashPosition / 100000) * 100));
    return fallback;
  };

  const computedScore = parsedCashPositionData.cash_position_score ?? parsedCashPositionData.score ?? parsedCashPositionData.average_score ?? deriveScoreFromNetCash(parsedCashPositionData.net_cash_position, parsedCashPositionData.total_minimum_needed);

  return {
    ...parsedCashPositionData,
    score: parsedCashPositionData.score ?? computedScore,
    average_score: parsedCashPositionData.average_score ?? computedScore,
    average_normalized_score: parsedCashPositionData.average_normalized_score ?? computedScore,
    percentage_point: parsedCashPositionData.percentage_point ?? computedScore,
    percentage_points: parsedCashPositionData.percentage_points ?? computedScore,
    cash_position_score: (parsedCashPositionData.cash_position_score ?? computedScore) as number | undefined,
  };
}

export async function fetchProvincialCashPosition(provinceId: number, offices?: Office[]): Promise<CashPositionData> {
  const allOffices = offices || await getOfficesFromApi();
  const provinceOffices = allOffices.filter(o => String(o.provinceId) === String(provinceId));

  let totalCashBalance = 0;
  const ledgerPromises = provinceOffices
    .map(o => o.withinhereWalletId)
    .filter((id): id is string => !!id)
    .map(walletId => fetchLedgerForWallet(walletId).catch(() => ({ cashBalance: 0, apiData: null })));

  const results = await Promise.all(ledgerPromises);
  totalCashBalance = results.reduce((sum, r) => sum + r.cashBalance, 0);

  const metrics = calculateCashLiquidityIndex(totalCashBalance);

  return {
    province_id: provinceId.toString(),
    score: metrics.compositeScore.toString(),
    average_score: metrics.compositeScore.toString(),
    average_normalized_score: metrics.compositeScore.toString(),
    totalCashBalance,
    percentage_point: metrics.compositeScore.toString(),
    cash_position_score: metrics.cashPositionScore,
    offices_count: provinceOffices.length,
  };
}

export async function fetchInstitutionalCashPosition(offices?: Office[]): Promise<CashPositionData> {
  const allOffices = offices || await getOfficesFromApi();
  const validWallets = allOffices
    .map(o => o.withinhereWalletId)
    .filter((id): id is string => !!id);

  const ledgerPromises = validWallets.map(walletId =>
    fetchLedgerForWallet(walletId).catch(() => ({ cashBalance: 0, apiData: null }))
  );

  const results = await Promise.all(ledgerPromises);
  const totalCashBalance = results.reduce((sum, r) => sum + r.cashBalance, 0);

  const metrics = calculateCashLiquidityIndex(totalCashBalance);

  return {
    score: metrics.compositeScore.toString(),
    average_score: metrics.compositeScore.toString(),
    average_normalized_score: metrics.compositeScore.toString(),
    totalCashBalance,
    percentage_point: metrics.compositeScore.toString(),
    cash_position_score: metrics.cashPositionScore,
    offices_count: allOffices.length,
  };
}

export async function fetchDistrictCashPosition(districtId: number, offices?: Office[]): Promise<CashPositionData> {
  const allOffices = offices || await getOfficesFromApi();
  const districtOffices = allOffices.filter(o => String(o.districtId) === String(districtId));

  let totalCashBalance = 0;
  const ledgerPromises = districtOffices
    .map(o => o.withinhereWalletId)
    .filter((id): id is string => !!id)
    .map(walletId => fetchLedgerForWallet(walletId).catch(() => ({ cashBalance: 0, apiData: null })));

  const results = await Promise.all(ledgerPromises);
  totalCashBalance = results.reduce((sum, r) => sum + r.cashBalance, 0);

  const metrics = calculateCashLiquidityIndex(totalCashBalance);

  return {
    district_id: districtId.toString(),
    score: metrics.compositeScore.toString(),
    average_score: metrics.compositeScore.toString(),
    totalCashBalance,
    percentage_point: metrics.compositeScore.toString(),
    cash_position_score: metrics.cashPositionScore,
    offices_count: districtOffices.length,
  };
}

const CASH_HEALTH_DISTRICT_API_BASE = process.env.NEXT_PUBLIC_CASH_HEALTH_API_URL || 'https://lms2backend.whencefinancesystem.com';

export async function fetchCashHealthDistrict(districtId: number): Promise<CashHealthDistrictData> {
  const response = await fetch(`${CASH_HEALTH_DISTRICT_API_BASE}/cash-health/district/${districtId}?cycle_start=${getCurrentCycleStart()}`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch cash health district: ${response.statusText}`);
  }

  const payload = await response.json();
  const result = payload?.data && typeof payload.data === 'object' ? payload.data : payload;

  if (result?.error) {
    throw new Error(result.message || result.error);
  }

  const financials = normalizeCashHealthFinancials(result?.financials);
  const scores = normalizeCashHealthScores(result?.scores);

  return {
    ...result,
    district_id: parseCashHealthNumber(result?.district_id ?? result?.id),
    district_name: result?.district_name || `District ${result?.district_id}`,
    office_count: parseCashHealthNumber(result?.office_count) || 0,
    cycle: result?.cycle || undefined,
    disbursed: parseCashHealthNumber(result?.disbursed),
    collected: parseCashHealthNumber(result?.collected),
    financials,
    reserve_breakdown: result?.reserve_breakdown || {},
    scores,
    reason: result?.reason || '',
    totalCashBalance: financials?.residual_cash ?? financials?.net_cash_position ?? 0,
    cash_position_score: scores?.overall,
    score: scores?.overall,
    average_score: scores?.overall,
    average_normalized_score: scores?.overall,
    net_cash_position: financials?.net_cash_position,
  };
}

export interface CashHealthBranchData {
  office_id?: number;
  office_name?: string;
  cycle?: CashHealthCycle;
  disbursed?: number;
  collected?: number;
  financials?: CashHealthFinancials;
  reserve_breakdown?: Record<string, unknown>;
  scores?: CashHealthScores;
  reason?: string;
  details?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Calculates the current cash cycle start date.
 * Per cash-health.md section 2.2:
 * - If today >= 25: cycle_start = current month's 25th
 * - Else: cycle_start = previous month's 25th
 */
export function getCurrentCycleStart(): string {
  const now = new Date();
  const day = now.getDate();
  let year = now.getFullYear();
  let month = now.getMonth(); // 0-indexed

  if (day >= 25) {
    // Current month's 25th
  } else {
    // Previous month's 25th
    month -= 1;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
  }

  const monthStr = String(month + 1).padStart(2, '0');
  return `${year}-${monthStr}-25`;
}

/**
 * Calculates the current cash cycle end date (cycle_start + 1 month - 1 day)
 */
export function getCurrentCycleEnd(): string {
  const cycleStart = getCurrentCycleStart();
  const [y, m, d] = cycleStart.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 24);
  const year = end.getFullYear();
  const monthStr = String(end.getMonth() + 1).padStart(2, '0');
  const dayStr = String(end.getDate()).padStart(2, '0');
  return `${year}-${monthStr}-${dayStr}`;
}

const CASH_HEALTH_BRANCH_API_BASE = process.env.NEXT_PUBLIC_CASH_HEALTH_API_URL || 'https://lms2backend.whencefinancesystem.com';

export async function fetchCashHealthOffice(officeId: number): Promise<CashHealthBranchData> {
  const response = await fetch(`${CASH_HEALTH_BRANCH_API_BASE}/cash-health/${officeId}?cycle_start=${getCurrentCycleStart()}`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch cash health office: ${response.statusText}`);
  }

  const payload = await response.json();
  const result = payload?.data && typeof payload.data === 'object' ? payload.data : payload;

  if (result?.error) {
    throw new Error(result.message || result.error);
  }

  const financials = normalizeCashHealthFinancials(result?.financials);
  const scores = normalizeCashHealthScores(result?.scores);

  return {
    ...result,
    office_id: parseCashHealthNumber(result?.office_id ?? result?.id),
    office_name: result?.office_name || `Office ${result?.office_id}`,
    cycle: result?.cycle || undefined,
    disbursed: parseCashHealthNumber(result?.disbursed),
    collected: parseCashHealthNumber(result?.collected),
    financials,
    reserve_breakdown: result?.reserve_breakdown || {},
    scores,
    reason: result?.reason || '',
    details: result?.details || undefined,
    totalCashBalance: financials?.residual_cash ?? financials?.net_cash_position ?? 0,
    cash_position_score: scores?.overall,
    score: scores?.overall,
    average_score: scores?.overall,
    average_normalized_score: scores?.overall,
    net_cash_position: financials?.net_cash_position,
  };
}
