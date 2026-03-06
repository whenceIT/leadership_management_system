export interface PortfolioQualityData {
  office_id: string;
  total_outstanding: string;
  overdue_outstanding: string;
  PAR: string;
  score: string;
  weight: string;
  percentage_point: string;
}

export async function fetchPortfolioQuality(branchId: number): Promise<PortfolioQualityData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/portfolio-quality/${branchId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch portfolio quality: ${response.statusText}`);
  }
  
  return await response.json();
}
