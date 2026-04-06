export interface StaffAdequacyData {
  office_id?: string;
  province_id?: string;
  actual_lcs?: number;
  offices_count?: number;
  normalized_score?: number;
  average_normalized_score?: number;
  weight: string;
  percentage_point: number;
  target: number; // Fixed target of 100%
  instAvg?: string; // Institutional average
}

export async function fetchStaffAdequacyPerformance(branchId: number): Promise<StaffAdequacyData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/staff-adequacy/${branchId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch staff adequacy performance: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Add fixed target of 100% since it's not in the API response
  return {
    ...data,
    target: 100
  };
}

export async function fetchProvincialStaffAdequacyPerformance(provinceId: number): Promise<StaffAdequacyData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/staff-adequacy/province/${provinceId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial staff adequacy performance: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Add fixed target of 100% since it's not in the API response
  return {
    ...data,
    target: 100
  };
}

export async function fetchDistrictStaffAdequacyPerformance(districtId: number): Promise<StaffAdequacyData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/staff-adequacy/district/${districtId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch district staff adequacy performance: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Add fixed target of 100% since it's not in the API response
  return {
    ...data,
    target: 100
  };
}