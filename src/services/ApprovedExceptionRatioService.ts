import { Office } from '@/hooks/useOffice';

export interface ApprovedExceptionRatioData {
  office_id?: string;
  province_id?: string;
  district_id?: string;
  offices_count?: number;
  period: string;
  approved_exception_ratio?: string;
  score?: string;
  average_score?: number;
  weight: string;
  percentage_point: string;
  totalCashBalance?: number;
  totalExcess?: number;
  approvedExcess?: number;
  normalized_score?: number;
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

export function calculateApprovedExceptionRatio(approvedExcessAmount: number, totalExcessAmount: number): { score: number; totalExcess: number; approvedExcess: number; normalized_score: number } {
  const score = totalExcessAmount === 0 ? 100 : (approvedExcessAmount / totalExcessAmount) * 100;
  const normalized_score = score;
  const totalExcess = totalExcessAmount;
  const approvedExcess = approvedExcessAmount;

  return { score, totalExcess, approvedExcess, normalized_score };
}

function getTotalCashBalance(data: any): number {
  if (!data) return 0;
  if (data?.user?.cash_balance) return parseFloat(data.user.cash_balance);
  return parseFloat(data.total_cash || data.cashBalance || data.totalCashBalance || '0');
}

export async function fetchApprovedExceptionRatio(branchId: number): Promise<ApprovedExceptionRatioData> {
  const offices = await getOfficesFromApi();
  const office = offices.find(o => String(o.id) === String(branchId));
  const walletId = office?.withinhereWalletId || office?.withinhere_wallet_id;

  if (!walletId) {
    throw new Error(`No withinhere_wallet_id found for branch ${branchId}`);
  }

  const apiData = await fetchKpiSummary(walletId);
  const { score, totalExcess, approvedExcess, normalized_score } = calculateApprovedExceptionRatio(apiData.approvedExcessAmount || 0, apiData.totalExcessAmount || 0);

  return {
    office_id: branchId.toString(),
    period: `${new Date().toISOString().split('T')[0]}`,
    approved_exception_ratio: score.toString(),
    score: score.toString(),
    average_score: score,
    normalized_score,
    weight: '10',
    percentage_point: score.toString(),
    totalCashBalance: getTotalCashBalance(apiData),
    totalExcess,
    approvedExcess,
    ...apiData
  };
}

export async function fetchProvincialApprovedExceptionRatio(provinceId: number): Promise<ApprovedExceptionRatioData> {
  const offices = await getOfficesFromApi();
  const provinceOffices = offices.filter(o => String(o.provinceId) === String(provinceId));

  let totalCashBalance = 0;
  let totalApprovedExcess = 0;
  let totalExcessAmount = 0;

  const ledgerPromises = provinceOffices
    .map(o => o.withinhereWalletId || o.withinhere_wallet_id)
    .filter((id): id is string => !!id)
    .map(walletId => fetchKpiSummary(walletId).catch(() => ({ total_cash: 0, cashBalance: 0, totalCashBalance: 0, approvedExcessAmount: 0, totalExcessAmount: 0 })));

  const results = await Promise.all(ledgerPromises);
  results.forEach(r => {
    totalCashBalance += getTotalCashBalance(r);
    totalApprovedExcess += (r.approvedExcessAmount || 0);
    totalExcessAmount += (r.totalExcessAmount || 0);
  });

  const { score, totalExcess, approvedExcess, normalized_score } = calculateApprovedExceptionRatio(totalApprovedExcess, totalExcessAmount);

  return {
    province_id: provinceId.toString(),
    period: `${new Date().toISOString().split('T')[0]}`,
    approved_exception_ratio: score.toString(),
    score: score.toString(),
    average_score: score,
    normalized_score,
    weight: '10',
    percentage_point: score.toString(),
    totalCashBalance,
    totalExcess,
    approvedExcess,
  };
}

export async function fetchInstitutionalApprovedExceptionRatio(): Promise<ApprovedExceptionRatioData> {
  const offices = await getOfficesFromApi();
  const validWallets = offices
    .map(o => o.withinhereWalletId || o.withinhere_wallet_id)
    .filter((id): id is string => !!id);

  let totalCashBalance = 0;
  let totalApprovedExcess = 0;
  let totalExcessAmount = 0;

  const ledgerPromises = validWallets.map(walletId =>
    fetchKpiSummary(walletId).catch(() => ({ total_cash: 0, cashBalance: 0, totalCashBalance: 0, approvedExcessAmount: 0, totalExcessAmount: 0 }))
  );

  const results = await Promise.all(ledgerPromises);
  results.forEach(r => {
    totalCashBalance += getTotalCashBalance(r);
    totalApprovedExcess += (r.approvedExcessAmount || 0);
    totalExcessAmount += (r.totalExcessAmount || 0);
  });

  const { score, totalExcess, approvedExcess, normalized_score } = calculateApprovedExceptionRatio(totalApprovedExcess, totalExcessAmount);

  return {
    period: `${new Date().toISOString().split('T')[0]}`,
    approved_exception_ratio: score.toString(),
    score: score.toString(),
    average_score: score,
    normalized_score,
    weight: '10',
    percentage_point: score.toString(),
    totalCashBalance,
    totalExcess,
    approvedExcess,
  };
}

export async function fetchDistrictApprovedExceptionRatio(districtId: number): Promise<ApprovedExceptionRatioData> {
  const offices = await getOfficesFromApi();
  const districtOffices = offices.filter(o => String(o.districtId) === String(districtId));

  let totalCashBalance = 0;
  let totalApprovedExcess = 0;
  let totalExcessAmount = 0;

  const ledgerPromises = districtOffices
    .map(o => o.withinhereWalletId || o.withinhere_wallet_id)
    .filter((id): id is string => !!id)
    .map(walletId => fetchKpiSummary(walletId).catch(() => ({ total_cash: 0, cashBalance: 0, totalCashBalance: 0, approvedExcessAmount: 0, totalExcessAmount: 0 })));

  const results = await Promise.all(ledgerPromises);
  results.forEach(r => {
    totalCashBalance += getTotalCashBalance(r);
    totalApprovedExcess += (r.approvedExcessAmount || 0);
    totalExcessAmount += (r.totalExcessAmount || 0);
  });

  const { score, totalExcess, approvedExcess, normalized_score } = calculateApprovedExceptionRatio(totalApprovedExcess, totalExcessAmount);

  return {
    district_id: districtId.toString(),
    period: `${new Date().toISOString().split('T')[0]}`,
    approved_exception_ratio: score.toString(),
    score: score.toString(),
    average_score: score,
    normalized_score,
    weight: '10',
    percentage_point: score.toString(),
    totalCashBalance,
    totalExcess,
    approvedExcess,
  };
}
// 
// export async function fetchProvincialApprovedExceptionRatio(provinceId: number): Promise<ApprovedExceptionRatioData> {
//   const response = await fetch(`https://smartbackend.whencefinancesystem.com/approved-exception-ratio/province/${provinceId}`);
//   
//   if (!response.ok) {
//     throw new Error(`Failed to fetch provincial approved exception ratio: ${response.statusText}`);
//   }
//   
//   return await response.json();
// }
