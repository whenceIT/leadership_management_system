export interface ProductDiversificationData {
  office_id?: string;
  province_id?: string;
  offices_count?: number;
  total_clients?: number;
  HHI?: string;
  average_HHI?: string;
  weight: string;
  percentage_point: string;
}

export async function fetchProductDiversification(branchId: number): Promise<ProductDiversificationData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/product-diversification/${branchId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch product diversification: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchProvincialProductDiversification(provinceId: number): Promise<ProductDiversificationData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/product-diversification/province/${provinceId}`, {
    cache: "force-cache",
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial product diversification: ${response.statusText}`);
  }
  
  return await response.json();
}
