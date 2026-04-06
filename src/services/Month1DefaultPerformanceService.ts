export interface Month1DefaultPerformanceData {
  office_id?: string;
  province_id?: string;
  offices_count?: number;
  consultant_count?: number;
  total_disbursed?: string;
  month_1_defaulted?: string;
  month_1_default_rate?: string;
  average_month_1_default_rate?: string;
  weight: string;
  percentage_point: string;
}

export async function fetchMonth1DefaultPerformance(branchId: number): Promise<Month1DefaultPerformanceData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/month-1-default-performance/${branchId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch month 1 default performance: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchProvincialMonth1DefaultPerformance(provinceId: number): Promise<Month1DefaultPerformanceData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/month-1-default-performance/province/${provinceId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial month 1 default performance: ${response.statusText}`);
  }
  
  return await response.json();
}
export async function fetchDistrictMonth1DefaultPerformance(districtId: number): Promise<Month1DefaultPerformanceData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/month-1-default-performance/district/${districtId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch district month 1 default performance: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}
