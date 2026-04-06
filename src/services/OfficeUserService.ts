'use client';

export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  mobile: string;
  status: string;
  joined_date: string;
  // ... other fields as needed
}

export interface Loan {
  id: number;
  principal: number | string;
  total_paid?: number | string;
  status?: string;
  disbursed_date?: string;
  first_repayment_date?: string | null;
  // ... other fields as needed
}

export interface OfficeUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  office_id: number;
  status: string;
  clients: Client[];
  loans: Loan[];
  performance?: number;
  target_achievement?: number;
}

export async function fetchOfficeUsers(officeId: number | string): Promise<OfficeUser[]> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/office-users/${officeId}`, {
    cache: "no-store" // Real-time performance data
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch office users: ${response.status}`);
  }
  
  const data = await response.json();
  
  // The API returns an array of users for the office
  return Array.isArray(data) ? data : (data.data || []);
}
