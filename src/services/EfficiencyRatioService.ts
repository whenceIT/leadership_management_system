export interface EfficiencyRatioData {
  office_id?: string;
  province_id?: string;
  offices_count?: number;
  period: string;
  operating_costs?: string;
  income?: string;
  CIR?: string;
  target: string;
  repayments?: number;
  disbursed?: number;
  score?: string;
  average_score?: number;
  weight: string;
  percentage_point: string;
}

export async function fetchEfficiencyRatio(branchId: number): Promise<EfficiencyRatioData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/efficiency-ratio/${branchId}`, {
    cache: "force-cache",
    next: { revalidate: 600 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch efficiency ratio: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchProvincialEfficiencyRatio(provinceId: number): Promise<EfficiencyRatioData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/efficiency-ratio/province/${provinceId}`, {
    cache: "force-cache",
    next: { revalidate: 600 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial efficiency ratio: ${response.statusText}`);
  }
  
  return await response.json();
}
