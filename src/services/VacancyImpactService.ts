export interface VacancyImpactData {
  office_id: string;
  actual_lcs: number;
  authorized_positions: number;
  vacancies: number;
  normalized_score: number;
  weight: string;
  percentage_point: number;
  target: number; // Fixed target of 0 (greater or equal to 0)
}

export async function fetchVacancyImpact(branchId: number): Promise<VacancyImpactData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/vacancy-impact/${branchId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch vacancy impact: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Add fixed target of 0 since it's not in the API response
  return {
    ...data,
    target: 0
  };
}
