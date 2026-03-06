export interface CollectionEfficiencyData {
  office_id: string;
  consultant_count: number;
  total_collections: string;
  benchmark: string;
  weight: string;
  outstanding: string;
  percentage_point: string;
}

export async function fetchCollectionEfficiency(branchId: number): Promise<CollectionEfficiencyData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/collection-efficiency/${branchId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch collection efficiency: ${response.statusText}`);
  }
  
  return await response.json();
}
