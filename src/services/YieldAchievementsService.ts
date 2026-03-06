export interface YieldAchievementsData {
  office_id: string;
  consultant_count: number;
  total_principal_disbursed: string;
  total_interest_earned: string;
  effective_interest_rate: string;
  target: string;
  weight: string;
  percentage_point: string;
}

export async function fetchYieldAchievements(branchId: number): Promise<YieldAchievementsData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/yield-achievement/${branchId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch yield achievements: ${response.statusText}`);
  }
  
  return await response.json();
}
