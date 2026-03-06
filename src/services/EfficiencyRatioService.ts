export interface EfficiencyRatioData {
  office_id: string;
  period: string;
  operating_costs: string;
  income: string;
  CIR: string;
  target: string;
  repayments: number;
  disbursed: number;
  score: string;
  weight: string;
  percentage_point: string;
}

export async function fetchEfficiencyRatio(branchId: number): Promise<EfficiencyRatioData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/efficiency-ratio/${branchId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch efficiency ratio: ${response.statusText}`);
  }
  
  return await response.json();
}
