export interface ProductivityAchievementData {
  office_id?: string;
  province_id?: string;
  offices_count?: number;
  consultant_count?: number;
  average_disbursement?: string;
  normalized_score?: string;
  average_normalized_score?: string;
  weight: string;
  percentage_point: string;
  target: number; // Fixed target of 100%
}

export async function fetchProductivityAchievement(branchId: number): Promise<ProductivityAchievementData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/productivity-achievement/${branchId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch productivity achievement: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Add fixed target of 100% since it's not in the API response
  return {
    ...data,
    target: 100
  };
}

export async function fetchProvincialProductivityAchievement(provinceId: number): Promise<ProductivityAchievementData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/productivity-achievement/province/${provinceId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial productivity achievement: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Add fixed target of 100% since it's not in the API response
  return {
    ...data,
    target: 100
  };
}
