export interface VolumeAchievementData {
  office_id?: string;
  province_id?: string;
  offices_count?: number;
  consultant_count?: number;
  total_disbursement?: string;
  branch_target?: string;
  normalized_score?: string;
  average_normalized_score?: string;
  weight: string;
  percentage_point: string;
}

export async function fetchVolumeAchievement(branchId: number): Promise<VolumeAchievementData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/volume-achievement/${branchId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch volume achievement: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

export async function fetchProvincialVolumeAchievement(provinceId: number): Promise<VolumeAchievementData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/volume-achievement/province/${provinceId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial volume achievement: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}
