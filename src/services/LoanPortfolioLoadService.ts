export interface LoanPortfolioLoadData {
  office_id: string;
  total_outstanding: string;
  total_lcs: number;
  portfolio_per_lc: string;
  score: string;
  weight: string;
  percentage_point: number;
  target: number; // Target is 100% for normalized score
}

export async function fetchLoanPortfolioLoad(branchId: number): Promise<LoanPortfolioLoadData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/portfolio-load-balance/${branchId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch loan portfolio load: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  return {
    ...data,
    target: 100 // Target is 100% for normalized score
  };
}
