export interface RollRateControlData {
  office_id: string;
  total_loans: number;
  buckets: {
    '1-30_days': number;
    '31-60_days': number;
    '61-90_days': number;
    '90+_days': number;
  };
  roll_rates: {
    '1-30_days': string;
    '31-60_days': string;
    '61-90_days': string;
    '90+_days': string;
  };
  score: string;
  weight: string;
  percentage_point: string;
}

export async function fetchRollRateControl(branchId: number): Promise<RollRateControlData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/roll-rate-control/${branchId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch roll rate control: ${response.statusText}`);
  }
  
  return await response.json();
}
