export interface AboveThresholdRiskData {
  office_id?: string;
  province_id?: string;
  offices_count?: number;
  period?: string;
  above_threshold_risk?: string;
  score?: string;
  average_score?: string;
  percentage_points?: string;
  closing_balance?: string;
  weight?: string;
  percentage_point?: string;
}

export async function fetchAboveThresholdRisk(branchId: number): Promise<AboveThresholdRiskData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/above-threshold-risk/${branchId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch above threshold risk: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchProvincialAboveThresholdRisk(provinceId: number): Promise<AboveThresholdRiskData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/above-threshold-risk/province/${provinceId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial above threshold risk: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchInstitutionalAboveThresholdRisk(): Promise<AboveThresholdRiskData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/above-threshold-risk/company`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch institutional above threshold risk: ${response.statusText}`);
  }
  
  return await response.json();
}
