export interface LongTermDelinquencyData {
  office_id?: string;
  province_id?: string;
  offices_count?: number;
  consultant_count?: number;
  month_1_default_loans?: number;
  long_term_delinquent_loans?: number;
  long_term_default_rate?: string;
  target: string;
  score?: string;
  average_score?: number;
  weight: string;
  percentage_point: string;
}

export async function fetchLongTermDelinquency(branchId: number): Promise<LongTermDelinquencyData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/long-term-delinquency-risk/${branchId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch long term delinquency: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchProvincialLongTermDelinquency(provinceId: number): Promise<LongTermDelinquencyData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/long-term-delinquency-risk/province/${provinceId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial long term delinquency: ${response.statusText}`);
  }
  
  return await response.json();
}
export async function fetchDistrictLongTermDelinquency(districtId: number): Promise<LongTermDelinquencyData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/long-term-delinquency-risk/district/${districtId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch district long term delinquency: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}
