export interface AboveThresholdRiskData {
  office_id?: string;
  province_id?: string;
  district_id?: string;
  offices_count?: number;
  period?: string;
  above_threshold_risk?: string;
  score?: string;
  average_score?: string;
  percentage_points?: string;
  closing_balance?: string;
  weight?: string;
  percentage_point?: string;
  totalCashBalance?: number;
  unapprovedExcess?: number;
  approvedExcess?: number;
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

function calculateAboveThresholdRisk(totalCashBalance: number, approvedExcess: number = 0): { score: number; unapprovedExcess: number } {
  const threshold = 30000;
  const totalExcess = Math.max(0, totalCashBalance - threshold);
  const unapprovedExcess = Math.max(0, totalExcess - approvedExcess);
  const score = totalCashBalance <= threshold ? 100 : 100 * (1 - (unapprovedExcess / totalCashBalance));
  return { score, unapprovedExcess };
}

export async function fetchAboveThresholdRisk(branchId: number): Promise<AboveThresholdRiskData> {
  const apiData = await fetchKpiSummary({ office_id: branchId });
  const { score, unapprovedExcess } = calculateAboveThresholdRisk(apiData.totalCashBalance, apiData.approvedExcess || 0);

  return {
    office_id: branchId.toString(),
    score: score.toString(),
    average_score: score.toString(),
    totalCashBalance: apiData.totalCashBalance,
    unapprovedExcess,
    approvedExcess: apiData.approvedExcess || 0,
    ...apiData
  };
}

export async function fetchProvincialAboveThresholdRisk(provinceId: number): Promise<AboveThresholdRiskData> {
  const apiData = await fetchKpiSummary({ province_id: provinceId });
  const { score, unapprovedExcess } = calculateAboveThresholdRisk(apiData.totalCashBalance, apiData.approvedExcess || 0);

  return {
    province_id: provinceId.toString(),
    score: score.toString(),
    average_score: score.toString(),
    totalCashBalance: apiData.totalCashBalance,
    unapprovedExcess,
    approvedExcess: apiData.approvedExcess || 0,
    ...apiData
  };
}

export async function fetchInstitutionalAboveThresholdRisk(): Promise<AboveThresholdRiskData> {
  const apiData = await fetchKpiSummary();
  const { score, unapprovedExcess } = calculateAboveThresholdRisk(apiData.totalCashBalance, apiData.approvedExcess || 0);

  return {
    score: score.toString(),
    average_score: score.toString(),
    totalCashBalance: apiData.totalCashBalance,
    unapprovedExcess,
    approvedExcess: apiData.approvedExcess || 0,
    ...apiData
  };
}

export async function fetchDistrictAboveThresholdRisk(districtId: number): Promise<AboveThresholdRiskData> {
  const apiData = await fetchKpiSummary({ district_id: districtId });
  const { score, unapprovedExcess } = calculateAboveThresholdRisk(apiData.totalCashBalance, apiData.approvedExcess || 0);

  return {
    district_id: districtId.toString(),
    score: score.toString(),
    average_score: score.toString(),
    totalCashBalance: apiData.totalCashBalance,
    unapprovedExcess,
    approvedExcess: apiData.approvedExcess || 0,
    ...apiData
  };
}
