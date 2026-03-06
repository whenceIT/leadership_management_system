export interface Month1DefaultPerformanceData {
  office_id: string;
  consultant_count: number;
  total_disbursed: string;
  month_1_defaulted: string;
  month_1_default_rate: string;
  weight: string;
  percentage_point: string;
}

export async function fetchMonth1DefaultPerformance(branchId: number): Promise<Month1DefaultPerformanceData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/month-1-default-performance/${branchId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch month 1 default performance: ${response.statusText}`);
  }
  
  return await response.json();
}
