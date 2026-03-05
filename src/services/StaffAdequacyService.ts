export interface StaffAdequacyData {
  office_id: string;
  actual_lcs: number;
  normalized_score: number;
  weight: string;
  percentage_point: number;
  target: number; // Fixed target of 100%
}

export async function fetchStaffAdequacyPerformance(branchId: number): Promise<StaffAdequacyData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/staff-adequacy/${branchId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch staff adequacy performance: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Add fixed target of 100% since it's not in the API response
  return {
    ...data,
    target: 100
  };
}