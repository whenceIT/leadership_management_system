export interface Month3RecoveryAchievementsData {
  office_id?: string;
  province_id?: string;
  offices_count?: number;
  consultant_count?: number;
  month_1_defaulted?: string;
  recovered_3_months?: string;
  recovery_rate_3_months?: string;
  benchmark?: string;
  weight: string;
  percentage_point: string;
  average_score?: number;
}

export async function fetchMonth3RecoveryAchievements(branchId: number): Promise<Month3RecoveryAchievementsData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/3-month-recovery-achievement/${branchId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch month 3 recovery achievements: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchProvincialMonth3RecoveryAchievements(provinceId: number): Promise<Month3RecoveryAchievementsData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/3-month-recovery-achievement/province/${provinceId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial month 3 recovery achievements: ${response.statusText}`);
  }
  
  return await response.json();
}
