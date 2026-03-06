export interface GrowthTrajectoryData {
  office_id: string;
  current_month_revenue: number;
  previous_month_revenue: number;
  mom_revenue: number;
  score: number;
  PP: number;
  currentStart: string;
  currentEnd: string;
}

export async function fetchGrowthTrajectory(branchId: number): Promise<GrowthTrajectoryData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/growth-trajectory/${branchId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch growth trajectory: ${response.statusText}`);
  }
  
  return await response.json();
}
