export interface ProfitabilityContributionData {
  province_id?: string;
  office_id?: string;
  offices_count?: number;
  period: string;
  company_net_contribution: string;
  average_score: string;
  weight: string;
  percentage_point: number;
}

export async function fetchProfitabilityContribution(branchId: number): Promise<ProfitabilityContributionData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/profitability-contribution/${branchId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch profitability contribution: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchProvincialProfitabilityContribution(provinceId: number): Promise<ProfitabilityContributionData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/profitability-contribution/province/${provinceId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial profitability contribution: ${response.statusText}`);
  }
  
  return await response.json();
}
