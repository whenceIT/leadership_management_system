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

export interface ManagerUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  office_id: number;
  status: string;
}

export interface ReferralUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  office_id: number;
  status: string;
}

export interface OfficeUsersResponse {
  users: OfficeUser[];
  manager_users: ManagerUser[];
  referral_users: ReferralUser[];
}

export async function fetchOfficeUsers(officeId: number | string): Promise<OfficeUsersResponse> {
  const response = await fetch(`https://smartbackend.whencefinancesystem.com/office-users/${officeId}`, {
    cache: "no-store" // Real-time performance data
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch office users: ${response.status}`);
  }
  
  const data = await response.json();
  
  const users = Array.isArray(data) ? data : (data.data || data.users || []);
  const managerUsers = Array.isArray(data.manager_users) ? data.manager_users : [];
  const referralUsers = Array.isArray(data.referral_users) ? data.referral_users : [];
  
  return {
    users,
    manager_users: managerUsers,
    referral_users: referralUsers
  };
}
