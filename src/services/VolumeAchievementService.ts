export interface VolumeAchievementData {
  office_id: string;
  consultant_count: number;
  total_disbursement: string;
  branch_target: string;
  normalized_score: string;
  weight: string;
  percentage_point: string;
}

export async function fetchVolumeAchievement(branchId: number): Promise<VolumeAchievementData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/volume-achievement/${branchId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch volume achievement: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}
