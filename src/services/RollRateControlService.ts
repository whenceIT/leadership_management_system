export interface RollRateControlData {
  office_id?: string;
  province_id?: string;
  offices_count?: number;
  total_loans?: number;
  buckets?: {
    '1-30_days': number;
    '31-60_days': number;
    '61-90_days': number;
    '90+_days': number;
  };
  roll_rates?: {
    '1-30_days': string;
    '31-60_days': string;
    '61-90_days': string;
    '90+_days': string;
  };
  score?: string;
  average_score?: string;
  weight: string;
  percentage_point: string;
}

export async function fetchRollRateControl(branchId: number): Promise<RollRateControlData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/roll-rate-control/${branchId}`, {
    cache: "force-cache",
    next: { revalidate: 600 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch roll rate control: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchProvincialRollRateControl(provinceId: number): Promise<RollRateControlData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/roll-rate-control/province/${provinceId}`, {
    cache: "force-cache",
    next: { revalidate: 600 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch provincial roll rate control: ${response.statusText}`);
  }
  
  return await response.json();
}
