export interface LongTermDelinquencyData {
  office_id: string;
  consultant_count: number;
  month_1_default_loans: number;
  long_term_delinquent_loans: number;
  long_term_default_rate: string;
  target: string;
  score: string;
  weight: string;
  percentage_point: string;
}

export async function fetchLongTermDelinquency(branchId: number): Promise<LongTermDelinquencyData> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/long-term-delinquency-risk/${branchId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch long term delinquency: ${response.statusText}`);
  }
  
  return await response.json();
}
