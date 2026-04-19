export interface CashPositionData {
  office_id?: string;
  province_id?: string;
  district_id?: string;
  offices_count?: number;
  period?: string;
  cash_position?: string;
  score?: string;
  average_score?: string;
  percentage_points?: string;
  closing_balance?: string;
  weight?: string;
  percentage_point?: string;
  totalCashBalance?: number;
}

async function fetchKpiSummary(filters?: {
  office_id?: number;
  province_id?: number;
  district_id?: number;
  start_date?: string;
  end_date?: string;
}) {
  const queryParams = new URLSearchParams();
  if (filters?.office_id) queryParams.append('office_id', filters.office_id.toString());
  if (filters?.province_id) queryParams.append('province_id', filters.province_id.toString());
  if (filters?.district_id) queryParams.append('district_id', filters.district_id.toString());
  // if (filters?.start_date) queryParams.append('start_date', filters.start_date);
  // if (filters?.end_date) queryParams.append('end_date', filters.end_date);

  const url = `https://smartbackend.whencefinancesystem.com/api/kpi-scores/summary${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetch(url, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch KPI summary: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.success) throw new Error('API returned success false');

  return result.data;
}

function calculateCashPositionScore(totalCashBalance: number): number {
  if (totalCashBalance >= 20000 && totalCashBalance <= 30000) {
    return 100;
  } else if (totalCashBalance > 30000 && totalCashBalance <= 50000) {
    const excess = totalCashBalance - 30000;
    const penalty = (excess / 20000) * 40;
    return Math.max(100 - penalty, 60); // Declining from 100% to 60%
  } else if (totalCashBalance < 20000 && totalCashBalance >= 10000) {
    const shortfall = 20000 - totalCashBalance;
    const penalty = (shortfall / 10000) * 50;
    return Math.max(100 - penalty, 50); // Declining from 100% to 50%
  } else {
    return 0; // Above 50000 or below 10000
  }
}

export async function fetchCashPosition(branchId: number): Promise<CashPositionData> {
  const apiData = await fetchKpiSummary({ office_id: branchId });
  const score = calculateCashPositionScore(apiData.totalCashBalance);

  return {
    office_id: branchId.toString(),
    score: score.toString(),
    average_score: score.toString(),
    totalCashBalance: apiData.totalCashBalance,
    percentage_point: score.toString(),
    ...apiData
  };
}

export async function fetchProvincialCashPosition(provinceId: number): Promise<CashPositionData> {
  const apiData = await fetchKpiSummary({ province_id: provinceId });
  const score = calculateCashPositionScore(apiData.totalCashBalance);

  return {
    province_id: provinceId.toString(),
    score: score.toString(),
    average_score: score.toString(),
    totalCashBalance: apiData.totalCashBalance,
    percentage_point: score.toString(),
    ...apiData
  };
}

export async function fetchInstitutionalCashPosition(): Promise<CashPositionData> {
  const apiData = await fetchKpiSummary();
  const score = calculateCashPositionScore(apiData.totalCashBalance);

  return {
    score: score.toString(),
    average_score: score.toString(),
    totalCashBalance: apiData.totalCashBalance,
    percentage_point: score.toString(),
    ...apiData
  };
}

export async function fetchDistrictCashPosition(districtId: number): Promise<CashPositionData> {
  const apiData = await fetchKpiSummary({ district_id: districtId });
  const score = calculateCashPositionScore(apiData.totalCashBalance);

  return {
    district_id: districtId.toString(),
    score: score.toString(),
    average_score: score.toString(),
    totalCashBalance: apiData.totalCashBalance,
    percentage_point: score.toString(),
    ...apiData
  };
}
