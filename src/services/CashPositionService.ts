export interface CashPositionData {
  office_id?: string;
  province_id?: string;
  offices_count?: number;
  period?: string;
  cash_position?: string;
  score?: string;
  average_score?: string;
  percentage_points?: string;
  closing_balance?: string;
  weight?: string;
  percentage_point?: string;
}

export async function fetchCashPosition(branchId: number): Promise<CashPositionData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/cash-position-score/${branchId}`, {
    cache: "force-cache",
    next: { revalidate: 600 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch cash position: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchProvincialCashPosition(provinceId: number): Promise<CashPositionData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/cash-position-score/province/${provinceId}`, {
    cache: "force-cache",
    next: { revalidate: 600 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial cash position: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchInstitutionalCashPosition(): Promise<CashPositionData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/cash-position-score/institution`, {
    cache: "force-cache",
    next: { revalidate: 600 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch institutional cash position: ${response.statusText}`);
  }
  
  return await response.json();
}
