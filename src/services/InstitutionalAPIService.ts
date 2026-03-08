export interface InstitutionalAPIResponse {
  offices_count: number;
  benchmark?: string;
  average_score?: string | number;
  average_normalized_score?: string | number;
  average_HHI?: string | number;
  weight?: string;
  percentage_point?: string | number;
  PP?: string | number;
  target?: string;
  period?: string;
  company_net_contribution?: string;
  expected_revenue?: number;
  branch_target?: string;
  authorized_positions_per_office?: number;
  avg_mom_revenue?: number;
  currentStart?: string;
  currentEnd?: string;
  previousStart?: string;
  previousEnd?: string;
}

export async function fetchInstitutionalStaffAdequacy(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/staff-adequacy/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional staff adequacy');
  }
  return response.json();
}

export async function fetchInstitutionalProductivityAchievement(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/productivity-achievement/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional productivity achievement');
  }
  return response.json();
}

export async function fetchInstitutionalVacancyImpact(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/vacancy-impact/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional vacancy impact');
  }
  return response.json();
}

export async function fetchInstitutionalVolumeAchievement(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/volume-achievement/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional volume achievement');
  }
  return response.json();
}

export async function fetchInstitutionalPortfolioLoadBalance(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/portfolio-load-balance/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional portfolio load balance');
  }
  return response.json();
}

export async function fetchInstitutionalCollectionEfficiency(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/collection-efficiency/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional collection efficiency');
  }
  return response.json();
}

export async function fetchInstitutionalPortfolioQuality(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/portfolio-quality/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional portfolio quality');
  }
  return response.json();
}

export async function fetchInstitutionalProductDiversification(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/product-diversification/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional product diversification');
  }
  return response.json();
}

export async function fetchInstitutionalProductRiskScore(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/product-risk-score/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional product risk score');
  }
  return response.json();
}

export async function fetchInstitutionalYieldAchievement(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/yield-achievement/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional yield achievement');
  }
  return response.json();
}

export async function fetchInstitutionalMonth3RecoveryAchievements(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/3-month-recovery-achievement/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional 3-month recovery achievements');
  }
  return response.json();
}

export async function fetchInstitutionalEfficiencyRatio(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/efficiency-ratio/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional efficiency ratio');
  }
  return response.json();
}

export async function fetchInstitutionalGrowthTrajectory(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/growth-trajectory/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional growth trajectory');
  }
  return response.json();
}

export async function fetchInstitutionalLongTermDelinquency(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/long-term-delinquency-risk/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional long-term delinquency');
  }
  return response.json();
}

export async function fetchInstitutionalMonth1DefaultRate(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/month-1-default-performance/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional month-1 default rate');
  }
  return response.json();
}

export async function fetchInstitutionalRevenueAchievements(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/revenue-achievement/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional revenue achievements');
  }
  return response.json();
}

export async function fetchInstitutionalProfitabilityContribution(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/profitability-contribution/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional profitability contribution');
  }
  return response.json();
}

export async function fetchInstitutionalRollRateControl(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/roll-rate-control/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional roll rate control');
  }
  return response.json();
}

export async function fetchInstitutionalCashPosition(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/cash-position/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional cash position');
  }
  return response.json();
}

export async function fetchInstitutionalAboveThresholdRisk(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/above-threshold-risk/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional above-threshold risk');
  }
  return response.json();
}

export async function fetchInstitutionalBelowThresholdRisk(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/below-threshold-risk/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional below-threshold risk');
  }
  return response.json();
}

export async function fetchInstitutionalApprovedExceptionRatio(): Promise<InstitutionalAPIResponse> {
  const response = await fetch('https://smartbackend.whencefinancesystem.com/approved-exception-ratio/company');
  if (!response.ok) {
    throw new Error('Failed to fetch institutional approved exception ratio');
  }
  return response.json();
}
