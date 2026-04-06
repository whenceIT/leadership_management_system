export interface VacancyImpactData {
  office_id?: string;
  province_id?: string;
  offices_count?: number;
  actual_lcs?: number;
  authorized_positions?: number;
  authorized_positions_per_office?: number;
  vacancies?: number;
  normalized_score?: number;
  average_normalized_score?: number;
  weight: string;
  percentage_point: number;
  target: number; // Fixed target of 0 (greater or equal to 0)
}

export async function fetchVacancyImpact(branchId: number): Promise<VacancyImpactData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/vacancy-impact/${branchId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
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

export async function fetchProvincialVacancyImpact(provinceId: number): Promise<VacancyImpactData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/vacancy-impact/province/${provinceId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial vacancy impact: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Add fixed target of 0 since it's not in the API response
  return {
    ...data,
    target: 0
  };
}
export async function fetchDistrictVacancyImpact(districtId: number): Promise<VacancyImpactData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/vacancy-impact/district/${districtId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch district vacancy impact: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Add fixed target of 0 since it's not in the API response
  return {
    ...data,
    target: 0
  };
}
