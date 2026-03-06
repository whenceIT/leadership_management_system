export interface GrowthTrajectoryData {
  office_id?: string;
  province_id?: string;
  offices_count?: number;
  current_month_revenue?: number;
  previous_month_revenue?: number;
  mom_revenue?: number;
  score?: number;
  average_score?: number;
  PP: number;
  currentStart: string;
  currentEnd: string;
  previousStart?: string;
  previousEnd?: string;
}

export async function fetchGrowthTrajectory(branchId: number): Promise<GrowthTrajectoryData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/growth-trajectory/${branchId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch growth trajectory: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchProvincialGrowthTrajectory(provinceId: number): Promise<GrowthTrajectoryData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/growth-trajectory/province/${provinceId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial growth trajectory: ${response.statusText}`);
  }
  
  return await response.json();
}
