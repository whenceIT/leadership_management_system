export interface ApprovedExceptionRatioData {
  office_id?: string;
  province_id?: string;
  offices_count?: number;
  period: string;
  approved_exception_ratio?: string;
  score?: string;
  average_score?: number;
  weight: string;
  percentage_point: string;
}

export async function fetchApprovedExceptionRatio(branchId: number): Promise<ApprovedExceptionRatioData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/approved-exception-ratio/${branchId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch approved exception ratio: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchProvincialApprovedExceptionRatio(provinceId: number): Promise<ApprovedExceptionRatioData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/approved-exception-ratio/province/${provinceId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial approved exception ratio: ${response.statusText}`);
  }
  
  return await response.json();
}
