export interface VettingComplianceData {
  district_id?: string;
  offices_count?: number;
  average_score?: string;
  weight?: string;
  percentage_point?: number;
  target?: string;
}

export async function fetchDistrictVettingCompliance(districtId: number): Promise<VettingComplianceData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/vetting-compliance-rate/district/${districtId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch district vetting compliance: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  return {
    ...data,
    target: "≥80%"
  };
}
