export interface YieldAchievementsData {
  office_id?: string;
  province_id?: string;
  offices_count?: number;
  consultant_count?: number;
  total_principal_disbursed?: string;
  total_interest_earned?: string;
  effective_interest_rate?: string;
  target: string;
  average_score?: string;
  weight: string;
  percentage_point: string;
}

export async function fetchYieldAchievements(branchId: number): Promise<YieldAchievementsData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/yield-achievement/${branchId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch yield achievements: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchProvincialYieldAchievements(provinceId: number): Promise<YieldAchievementsData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/yield-achievement/province/${provinceId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial yield achievements: ${response.statusText}`);
  }
  
  return await response.json();
}
