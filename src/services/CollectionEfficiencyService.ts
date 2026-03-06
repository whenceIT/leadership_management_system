export interface CollectionEfficiencyData {
  office_id?: string;
  province_id?: string;
  offices_count?: number;
  consultant_count?: number;
  total_collections?: string;
  benchmark: string;
  weight: string;
  outstanding?: string;
  average_score?: string;
  percentage_point: string;
}

export async function fetchCollectionEfficiency(branchId: number): Promise<CollectionEfficiencyData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/collection-efficiency/${branchId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch collection efficiency: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchProvincialCollectionEfficiency(provinceId: number): Promise<CollectionEfficiencyData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/collection-efficiency/province/${provinceId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial collection efficiency: ${response.statusText}`);
  }
  
  return await response.json();
}
