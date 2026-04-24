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

function calculateApprovedExceptionRatio(approvedExcessAmount: number, totalExcessAmount: number): { score: number; totalExcess: number; approvedExcess: number; normalized_score: number } {
  const score = totalExcessAmount === 0 ? 100 : (approvedExcessAmount / totalExcessAmount) * 100;
  const normalized_score = score;
  const totalExcess = totalExcessAmount;
  const approvedExcess = approvedExcessAmount;

  return { score, totalExcess, approvedExcess, normalized_score };
}

export async function fetchApprovedExceptionRatio(branchId: number): Promise<ApprovedExceptionRatioData> {
  const apiData = await fetchKpiSummary({ office_id: branchId });
  const { score, totalExcess, approvedExcess, normalized_score } = calculateApprovedExceptionRatio(apiData.approvedExcessAmount || 0, apiData.totalExcessAmount || 0);

  return {
    office_id: branchId.toString(),
    period: `${apiData.startDate} to ${apiData.endDate}`,
    approved_exception_ratio: score.toString(),
    score: score.toString(),
    average_score: score,
    normalized_score,
    weight: '10',
    percentage_point: score.toString(),
    totalCashBalance: apiData.totalCashBalance,
    totalExcess,
    approvedExcess,
    ...apiData
  };
}

export async function fetchProvincialApprovedExceptionRatio(provinceId: number): Promise<ApprovedExceptionRatioData> {
  const apiData = await fetchKpiSummary({ province_id: provinceId });
  const { score, totalExcess, approvedExcess, normalized_score } = calculateApprovedExceptionRatio(apiData.approvedExcessAmount || 0, apiData.totalExcessAmount || 0);

  return {
    province_id: provinceId.toString(),
    period: `${apiData.startDate} to ${apiData.endDate}`,
    approved_exception_ratio: score.toString(),
    score: score.toString(),
    average_score: score,
    normalized_score,
    weight: '10',
    percentage_point: score.toString(),
    totalCashBalance: apiData.totalCashBalance,
    totalExcess,
    approvedExcess,
    ...apiData
  };
}

export async function fetchInstitutionalApprovedExceptionRatio(): Promise<ApprovedExceptionRatioData> {
  const apiData = await fetchKpiSummary();
  const { score, totalExcess, approvedExcess, normalized_score } = calculateApprovedExceptionRatio(apiData.approvedExcessAmount || 0, apiData.totalExcessAmount || 0);

  return {
    period: `${apiData.startDate} to ${apiData.endDate}`,
    approved_exception_ratio: score.toString(),
    score: score.toString(),
    average_score: score,
    normalized_score,
    weight: '10',
    percentage_point: score.toString(),
    totalCashBalance: apiData.totalCashBalance,
    totalExcess,
    approvedExcess,
    ...apiData
  };
}

export async function fetchDistrictApprovedExceptionRatio(districtId: number): Promise<ApprovedExceptionRatioData> {
  const apiData = await fetchKpiSummary({ district_id: districtId });
  const { score, totalExcess, approvedExcess, normalized_score } = calculateApprovedExceptionRatio(apiData.approvedExcessAmount || 0, apiData.totalExcessAmount || 0);

  return {
    district_id: districtId.toString(),
    period: `${apiData.startDate} to ${apiData.endDate}`,
    approved_exception_ratio: score.toString(),
    score: score.toString(),
    average_score: score,
    normalized_score,
    weight: '10',
    percentage_point: score.toString(),
    totalCashBalance: apiData.totalCashBalance,
    totalExcess,
    approvedExcess,
    ...apiData
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
