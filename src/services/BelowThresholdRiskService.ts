import { Office } from '@/hooks/useOffice';

export interface BelowThresholdRiskData {
  office_id?: string;
  province_id?: string;
  district_id?: string;
  offices_count?: number;
  period?: string;
  below_threshold_risk?: string;
  score?: string;
  average_score?: string;
  percentage_points?: string;
  closing_balance?: string;
  weight?: string;
  percentage_point?: string;
  totalCashBalance?: number;
  shortfall?: number;
}

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

async function getOfficesFromApi(): Promise<Office[]> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/offices');
  if (!response.ok) throw new Error('Failed to fetch offices');
  const data = await response.json();
  return Array.isArray(data) ? data : (data.data || []);
}

export function calculateBelowThresholdRisk(totalCashBalance: number): { score: number; shortfall: number } {
  const threshold = 20000;
  if (totalCashBalance >= threshold) {
    return { score: 100, shortfall: 0 };
  } else {
    const shortfall = threshold - totalCashBalance;
    const score = (totalCashBalance / threshold) * 100;
    return { score, shortfall };
  }
}

function getTotalCashBalance(data: any): number {
  if (!data) return 0;
  if (data?.user?.cash_balance) return parseFloat(data.user.cash_balance);
  return parseFloat(data.total_cash || data.cashBalance || data.totalCashBalance || '0');
}

export async function fetchBelowThresholdRisk(branchId: number): Promise<BelowThresholdRiskData> {
  const offices = await getOfficesFromApi();
  const office = offices.find(o => String(o.id) === String(branchId));
  const walletId = office?.withinhereWalletId || office?.withinhere_wallet_id;

  if (!walletId) {
    throw new Error(`No withinhere_wallet_id found for branch ${branchId}`);
  }

  const apiData = await fetchKpiSummary(walletId);
  const totalCashBalance = getTotalCashBalance(apiData);
  const { score, shortfall } = calculateBelowThresholdRisk(totalCashBalance);

  return {
    office_id: branchId.toString(),
    score: score.toString(),
    average_score: score.toString(),
    totalCashBalance,
    shortfall,
    ...apiData
  };
}

export async function fetchProvincialBelowThresholdRisk(provinceId: number): Promise<BelowThresholdRiskData> {
  const offices = await getOfficesFromApi();
  const provinceOffices = offices.filter(o => String(o.provinceId) === String(provinceId));

  let totalCashBalance = 0;
  const ledgerPromises = provinceOffices
    .map(o => o.withinhereWalletId || o.withinhere_wallet_id)
    .filter((id): id is string => !!id)
    .map(walletId => fetchKpiSummary(walletId).catch(() => ({ total_cash: 0, cashBalance: 0, totalCashBalance: 0, user: { cash_balance: '0' } })));

  const results = await Promise.all(ledgerPromises);
  totalCashBalance = results.reduce((sum, r) => sum + getTotalCashBalance(r), 0);

  const { score, shortfall } = calculateBelowThresholdRisk(totalCashBalance);

  return {
    province_id: provinceId.toString(),
    score: score.toString(),
    average_score: score.toString(),
    totalCashBalance,
    shortfall,
  };
}

export async function fetchInstitutionalBelowThresholdRisk(): Promise<BelowThresholdRiskData> {
  const offices = await getOfficesFromApi();
  const validWallets = offices
    .map(o => o.withinhereWalletId || o.withinhere_wallet_id)
    .filter((id): id is string => !!id);

  const ledgerPromises = validWallets.map(walletId =>
    fetchKpiSummary(walletId).catch(() => ({ total_cash: 0, cashBalance: 0, totalCashBalance: 0, user: { cash_balance: '0' } }))
  );

  const results = await Promise.all(ledgerPromises);
  const totalCashBalance = results.reduce((sum, r) => sum + getTotalCashBalance(r), 0);

  const { score, shortfall } = calculateBelowThresholdRisk(totalCashBalance);

  return {
    score: score.toString(),
    average_score: score.toString(),
    totalCashBalance,
    shortfall,
  };
}

export async function fetchDistrictBelowThresholdRisk(districtId: number): Promise<BelowThresholdRiskData> {
  const offices = await getOfficesFromApi();
  const districtOffices = offices.filter(o => String(o.districtId) === String(districtId));

  let totalCashBalance = 0;
  const ledgerPromises = districtOffices
    .map(o => o.withinhereWalletId || o.withinhere_wallet_id)
    .filter((id): id is string => !!id)
    .map(walletId => fetchKpiSummary(walletId).catch(() => ({ total_cash: 0, cashBalance: 0, totalCashBalance: 0, user: { cash_balance: '0' } })));

  const results = await Promise.all(ledgerPromises);
  totalCashBalance = results.reduce((sum, r) => sum + getTotalCashBalance(r), 0);

  const { score, shortfall } = calculateBelowThresholdRisk(totalCashBalance);

  return {
    district_id: districtId.toString(),
    score: score.toString(),
    average_score: score.toString(),
    totalCashBalance,
    shortfall,
  };
}
