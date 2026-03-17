export interface RevenueAchievementsData {
  province_id?: string;
  office_id?: string;
  offices_count?: number;
  period: string;
  expected_revenue: number;
  average_score: string;
  weight: string;
  percentage_point: number;
}

export async function fetchRevenueAchievements(branchId: number): Promise<RevenueAchievementsData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/revenue-achievement/${branchId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch revenue achievements: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchProvincialRevenueAchievements(provinceId: number): Promise<RevenueAchievementsData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/revenue-achievement/province/${provinceId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial revenue achievements: ${response.statusText}`);
  }
  
  return await response.json();
}
