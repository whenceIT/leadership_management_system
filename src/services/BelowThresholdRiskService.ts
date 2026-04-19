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
  if (filters?.start_date) queryParams.append('start_date', filters.start_date);
  if (filters?.end_date) queryParams.append('end_date', filters.end_date);

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

function calculateBelowThresholdRisk(totalCashBalance: number): { score: number; shortfall: number } {
  const threshold = 20000;
  if (totalCashBalance >= threshold) {
    return { score: 100, shortfall: 0 };
  } else {
    const shortfall = threshold - totalCashBalance;
    const score = (totalCashBalance / threshold) * 100;
    return { score, shortfall };
  }
}

export async function fetchBelowThresholdRisk(branchId: number): Promise<BelowThresholdRiskData> {
  const apiData = await fetchKpiSummary({ office_id: branchId });
  const { score, shortfall } = calculateBelowThresholdRisk(apiData.totalCashBalance);

  return {
    office_id: branchId.toString(),
    score: score.toString(),
    average_score: score.toString(),
    totalCashBalance: apiData.totalCashBalance,
    shortfall,
    ...apiData
  };
}

export async function fetchProvincialBelowThresholdRisk(provinceId: number): Promise<BelowThresholdRiskData> {
  const apiData = await fetchKpiSummary({ province_id: provinceId });
  const { score, shortfall } = calculateBelowThresholdRisk(apiData.totalCashBalance);

  return {
    province_id: provinceId.toString(),
    score: score.toString(),
    average_score: score.toString(),
    totalCashBalance: apiData.totalCashBalance,
    shortfall,
    ...apiData
  };
}

export async function fetchInstitutionalBelowThresholdRisk(): Promise<BelowThresholdRiskData> {
  const apiData = await fetchKpiSummary();
  const { score, shortfall } = calculateBelowThresholdRisk(apiData.totalCashBalance);

  return {
    score: score.toString(),
    average_score: score.toString(),
    totalCashBalance: apiData.totalCashBalance,
    shortfall,
    ...apiData
  };
}

export async function fetchDistrictBelowThresholdRisk(districtId: number): Promise<BelowThresholdRiskData> {
  const apiData = await fetchKpiSummary({ district_id: districtId });
  const { score, shortfall } = calculateBelowThresholdRisk(apiData.totalCashBalance);

  return {
    district_id: districtId.toString(),
    score: score.toString(),
    average_score: score.toString(),
    totalCashBalance: apiData.totalCashBalance,
    shortfall,
    ...apiData
  };
}
