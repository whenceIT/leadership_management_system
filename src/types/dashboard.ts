export type KPIStatus = 'good' | 'warning' | 'critical' | 'moderate' | 'bad' | 'excellent';

export type KPITrend = '↑' | '↓' | '→';

export interface KPI {
  name: string;
  institutionalAvg: string;
  currentPeriod: string;
  target: string | number | { min: number; max: number };
  variance: string;
  trend: KPITrend;
  status: KPIStatus;
  contribution?: string;
}

export interface Office {
  id: string | number;
  name: string;
  parentId: string | number | null;
  externalId: string;
  openingDate?: string | null;
  branchCapacity?: number | string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  managerId?: string | number | null;
  active: boolean | number;
  defaultOffice?: boolean | number;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  provinceId: string | number;
  districtId?: string | number | null;
  district_id?: string | number | null;
  province_id?: string | number | null;
  withinhereWalletId?: string | null;
  withinhere_wallet_id?: string | null;
  user_count: number;
}

export interface ParameterSummary {
  name: string;
  shortName: string;
  institutionalAvg: string;
  userLevelAvg: string;
  target: string | number;
  variance: string;
  varianceAbs: string;
  trend: KPITrend;
  status: KPIStatus;
  contribution?: string;
}