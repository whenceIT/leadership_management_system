export interface ProductRiskScoreData {
  office_id: string;
  consultant_count: number;
  total_disbursed: string;
  total_defaulted: string;
  defaulted_rate: string;
  weight: string;
  percentage_point: string;
}

export async function fetchProductRiskScore(branchId: number): Promise<ProductRiskScoreData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/product-risk-score/${branchId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch product risk score: ${response.statusText}`);
  }
  
  return await response.json();
}
