export interface LoanPortfolioLoadData {
  office_id?: string;
  province_id?: string;
  offices_count?: number;
  total_outstanding?: string;
  total_lcs?: number;
  portfolio_per_lc?: string;
  score?: string;
  average_score?: string;
  weight: string;
  percentage_point: number;
  target: number; // Target is 100% for normalized score
}

export async function fetchLoanPortfolioLoad(branchId: number): Promise<LoanPortfolioLoadData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/portfolio-load-balance/${branchId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch loan portfolio load: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  return {
    ...data,
    target: 100 // Target is 100% for normalized score
  };
}

export async function fetchProvincialLoanPortfolioLoad(provinceId: number): Promise<LoanPortfolioLoadData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/portfolio-load-balance/province/${provinceId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial loan portfolio load: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  return {
    ...data,
    target: 100 // Target is 100% for normalized score
  };
}
