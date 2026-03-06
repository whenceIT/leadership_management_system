export interface ProductDiversificationData {
  office_id: string;
  total_clients: number;
  HHI: string;
  weight: string;
  percentage_point: string;
}

export async function fetchProductDiversification(branchId: number): Promise<ProductDiversificationData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/product-diversification/${branchId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch product diversification: ${response.statusText}`);
  }
  
  return await response.json();
}
