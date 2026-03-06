export interface Month3RecoveryAchievementsData {
  office_id: string;
  consultant_count: number;
  month_1_defaulted: string;
  recovered_3_months: string;
  recovery_rate_3_months: string;
  weight: string;
  percentage_point: string;
}

export async function fetchMonth3RecoveryAchievements(branchId: number): Promise<Month3RecoveryAchievementsData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/3-month-recovery-achievement/${branchId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch month 3 recovery achievements: ${response.statusText}`);
  }
  
  return await response.json();
}
