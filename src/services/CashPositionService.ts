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
