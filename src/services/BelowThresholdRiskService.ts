export interface BelowThresholdRiskData {
  office_id?: string;
  province_id?: string;
  offices_count?: number;
  period?: string;
  below_threshold_risk?: string;
  score?: string;
  average_score?: string;
  percentage_points?: string;
  closing_balance?: string;
  weight?: string;
  percentage_point?: string;
}

export async function fetchBelowThresholdRisk(branchId: number): Promise<BelowThresholdRiskData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/below-threshold-risk/${branchId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch below threshold risk: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchProvincialBelowThresholdRisk(provinceId: number): Promise<BelowThresholdRiskData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/below-threshold-risk/province/${provinceId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial below threshold risk: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchInstitutionalBelowThresholdRisk(): Promise<BelowThresholdRiskData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/below-threshold-risk/company`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch institutional below threshold risk: ${response.statusText}`);
  }
  
  return await response.json();
}
export async function fetchDistrictBelowThresholdRisk(districtId: number): Promise<BelowThresholdRiskData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/below-threshold-risk/district/${districtId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch district below threshold risk: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}
