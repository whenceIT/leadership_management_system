export interface ProductRiskScoreData {
  office_id?: string;
  province_id?: string;
  offices_count?: number;
  consultant_count?: number;
  total_disbursed?: string;
  total_defaulted?: string;
  defaulted_rate?: string;
  average_score?: number;
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

export async function fetchProvincialProductRiskScore(provinceId: number): Promise<ProductRiskScoreData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/product-risk-score/province/${provinceId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial product risk score: ${response.statusText}`);
  }
  
  return await response.json();
}
