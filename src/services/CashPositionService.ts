export interface CashPositionData {
  office_id?: string;
  province_id?: string;
  district_id?: string;
  offices_count?: number;
  period?: string;
  score?: string;
  average_score?: string;
  average_normalized_score?: string;
  percentage_points?: string;
  closing_balance?: string;
  weight?: string;
  percentage_point?: string;
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

import { Office } from '@/hooks/useOffice';

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

export async function fetchCashPosition(branchId: number, offices?: Office[]): Promise<CashPositionData> {
  const allOffices = offices || await getOfficesFromApi();
  const office = allOffices.find(o => String(o.id) === String(branchId));
  const walletId = office?.withinhereWalletId;

  if (!walletId) {
    throw new Error(`No withinhere_wallet_id found for branch ${branchId}`);
  }

  const { cashBalance } = await fetchLedgerForWallet(walletId);

  const metrics = calculateCashLiquidityIndex(cashBalance);

  return {
    office_id: branchId.toString(),
    score: metrics.compositeScore.toString(),
    average_score: metrics.compositeScore.toString(),
    average_normalized_score: metrics.compositeScore.toString(),
    totalCashBalance: cashBalance,
    percentage_point: metrics.compositeScore.toString(),
    cash_position_score: metrics.cashPositionScore,
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
