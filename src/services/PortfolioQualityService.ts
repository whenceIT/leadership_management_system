export interface PortfolioQualityData {
  office_id?: string;
  province_id?: string;
  offices_count?: number;
  total_outstanding?: string;
  overdue_outstanding?: string;
  PAR?: string;
  score?: string;
  average_score?: string;
  weight: string;
  percentage_point: string;
}

export async function fetchPortfolioQuality(branchId: number): Promise<PortfolioQualityData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/portfolio-quality/${branchId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch portfolio quality: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchProvincialPortfolioQuality(provinceId: number): Promise<PortfolioQualityData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/portfolio-quality/province/${provinceId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial portfolio quality: ${response.statusText}`);
  }
  
  return await response.json();
}
export async function fetchDistrictPortfolioQuality(districtId: number): Promise<PortfolioQualityData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/portfolio-quality/district/${districtId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch district portfolio quality: ${response.statusText}`);
  }
  
  return await response.json();
}
