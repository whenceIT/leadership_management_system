import { PositionType } from '@/hooks/useUserPosition';

// KPI Metric Interface
export interface KpiMetric {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'team' | 'strategic' | 'compliance' | 'technical' | 'risk';
  position: PositionType;
  target: string;
  baseline: string;
  weight: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  isActive: boolean;
  lastUpdated: string;
  createdBy: string;
}

// KPI Category configuration
export const KPI_CATEGORIES = {
  financial: { label: 'Financial', color: 'green' },
  operational: { label: 'Operational', color: 'blue' },
  team: { label: 'Team & Development', color: 'purple' },
  strategic: { label: 'Strategic', color: 'orange' },
  compliance: { label: 'Compliance & Risk', color: 'red' },
  technical: { label: 'Technical', color: 'cyan' },
  risk: { label: 'Risk', color: 'red' },
} as const;

// Branch Manager KPIs
const getBranchManagerKPIs = (): KpiMetric[] => [
  {
    id: 'bm-disbursement',
    name: 'Monthly Disbursement Volume',
    description: 'Total loan disbursement amount per month',
    category: 'financial',
    position: 'Branch Manager',
    target: 'K450,000+',
    baseline: 'K420,000',
    weight: 20,
    unit: 'ZMW',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
  {
    id: 'bm-net-contribution',
    name: 'Branch Net Contribution',
    description: 'Post-provision net contribution to company',
    category: 'financial',
    position: 'Branch Manager',
    target: 'K324,000+',
    baseline: 'K280,650',
    weight: 25,
    unit: 'ZMW',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
  {
    id: 'bm-default-rate',
    name: 'Month-1 Default Rate',
    description: 'Percentage of loans defaulting in first month',
    category: 'risk',
    position: 'Branch Manager',
    target: '≤25%',
    baseline: '28.36%',
    weight: 20,
    unit: 'percent',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
  {
    id: 'bm-recovery-rate',
    name: 'In-House Recovery Rate',
    description: 'Recovery rate by Month-4',
    category: 'operational',
    position: 'Branch Manager',
    target: '≥65%',
    baseline: '56.05%',
    weight: 15,
    unit: 'percent',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
];

// District Manager KPIs
const getDistrictManagerKPIs = (): KpiMetric[] => [
  {
    id: 'dm-branch-performance',
    name: 'Branch Performance Index',
    description: 'Average performance across all managed branches',
    category: 'operational',
    position: 'District Manager',
    target: '≥85%',
    baseline: '75%',
    weight: 25,
    unit: 'percent',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
  {
    id: 'dm-default-rate',
    name: 'District Month-1 Default Rate',
    description: 'Average default rate across district',
    category: 'risk',
    position: 'District Manager',
    target: '≤23%',
    baseline: '27%',
    weight: 20,
    unit: 'percent',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
];

// Provincial Manager KPIs
const getProvincialManagerKPIs = (): KpiMetric[] => [
  {
    id: 'pm-province-performance',
    name: 'Provincial Performance Index',
    description: 'Overall province performance metrics',
    category: 'operational',
    position: 'Provincial Manager',
    target: '≥88%',
    baseline: '78%',
    weight: 25,
    unit: 'percent',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
  {
    id: 'pm-default-rate',
    name: 'Provincial Default Rate',
    description: 'Average default rate across province',
    category: 'risk',
    position: 'Provincial Manager',
    target: '≤22%',
    baseline: '26%',
    weight: 20,
    unit: 'percent',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
];

// IT Coordinator KPIs
const getITCoordinatorKPIs = (): KpiMetric[] => [
  {
    id: 'it-uptime',
    name: 'System Uptime',
    description: 'Critical systems availability',
    category: 'technical',
    position: 'IT Coordinator',
    target: '≥99.5%',
    baseline: '98%',
    weight: 20,
    unit: 'percent',
    frequency: 'daily',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
  {
    id: 'it-security',
    name: 'Security Incidents',
    description: 'Critical security incidents count',
    category: 'compliance',
    position: 'IT Coordinator',
    target: '0 critical',
    baseline: '2',
    weight: 20,
    unit: 'count',
    frequency: 'annually',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
];

// Management Accountant KPIs
const getManagementAccountantKPIs = (): KpiMetric[] => [
  {
    id: 'ma-accuracy',
    name: 'Financial Reporting Accuracy',
    description: 'Accuracy of financial reports',
    category: 'financial',
    position: 'Management Accountant',
    target: '≥99%',
    baseline: '95%',
    weight: 25,
    unit: 'percent',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
  {
    id: 'ma-compliance',
    name: 'Regulatory Compliance',
    description: 'Tax and regulatory compliance status',
    category: 'compliance',
    position: 'Management Accountant',
    target: '100% compliant',
    baseline: '98%',
    weight: 20,
    unit: 'percent',
    frequency: 'quarterly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
];

// Risk Manager KPIs
const getRiskManagerKPIs = (): KpiMetric[] => [
  {
    id: 'rm-risk-id',
    name: 'Risk Identification Rate',
    description: 'Early risk identification and mitigation',
    category: 'compliance',
    position: 'Risk Manager',
    target: '≥95%',
    baseline: '80%',
    weight: 25,
    unit: 'percent',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
  {
    id: 'rm-default-prev',
    name: 'Default Prevention',
    description: 'Loan default prevention effectiveness',
    category: 'risk',
    position: 'Risk Manager',
    target: '≥90%',
    baseline: '75%',
    weight: 25,
    unit: 'percent',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
];

// Recoveries Coordinator KPIs
const getRecoveriesCoordinatorKPIs = (): KpiMetric[] => [
  {
    id: 'rec-recovery',
    name: 'Recovery Rate',
    description: 'Overall recovery rate for assigned portfolios',
    category: 'operational',
    position: 'Recoveries Coordinator',
    target: '≥75%',
    baseline: '60%',
    weight: 30,
    unit: 'percent',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
  {
    id: 'rec-writeoff',
    name: 'Write-Off Reduction',
    description: 'Loan write-off minimization',
    category: 'financial',
    position: 'Recoveries Coordinator',
    target: '≤5%',
    baseline: '12%',
    weight: 25,
    unit: 'percent',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
];

// Payroll Loans Manager KPIs
const getPayrollLoansManagerKPIs = (): KpiMetric[] => [
  {
    id: 'plm-accuracy',
    name: 'Disbursement Accuracy',
    description: 'Loan disbursement accuracy rate',
    category: 'operational',
    position: 'Payroll Loans Manager',
    target: '≥99.5%',
    baseline: '97%',
    weight: 25,
    unit: 'percent',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
  {
    id: 'plm-default',
    name: 'Payroll Default Rate',
    description: 'Default rate for payroll-based loans',
    category: 'risk',
    position: 'Payroll Loans Manager',
    target: '≤5%',
    baseline: '8%',
    weight: 25,
    unit: 'percent',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
];

// Motor Vehicles Manager KPIs
const getMotorVehiclesManagerKPIs = (): KpiMetric[] => [
  {
    id: 'mvm-volume',
    name: 'MV Loan Volume',
    description: 'Motor vehicle loan disbursement volume',
    category: 'financial',
    position: 'Motor Vehicles Manager',
    target: 'K1,500,000+ monthly',
    baseline: 'K1,000,000',
    weight: 25,
    unit: 'ZMW',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
  {
    id: 'mvm-default',
    name: 'MV Default Rate',
    description: 'Motor vehicle loan default rate',
    category: 'risk',
    position: 'Motor Vehicles Manager',
    target: '≤8%',
    baseline: '12%',
    weight: 25,
    unit: 'percent',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
];

// Policy & Training Manager KPIs
const getPolicyTrainingManagerKPIs = (): KpiMetric[] => [
  {
    id: 'ptm-compliance',
    name: 'Policy Compliance Rate',
    description: 'Overall policy adherence across organization',
    category: 'compliance',
    position: 'Policy & Training Manager',
    target: '≥95%',
    baseline: '85%',
    weight: 25,
    unit: 'percent',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
  {
    id: 'ptm-training',
    name: 'Training Completion Rate',
    description: 'Employee training program completion',
    category: 'team',
    position: 'Policy & Training Manager',
    target: '≥90%',
    baseline: '75%',
    weight: 25,
    unit: 'percent',
    frequency: 'quarterly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
];

// R&D Coordinator KPIs
const getRDCoordinatorKPIs = (): KpiMetric[] => [
  {
    id: 'rd-projects',
    name: 'Project Completion Rate',
    description: 'R&D project milestone completion',
    category: 'strategic',
    position: 'R&D Coordinator',
    target: '≥85%',
    baseline: '70%',
    weight: 25,
    unit: 'percent',
    frequency: 'quarterly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
  {
    id: 'rd-innovation',
    name: 'Innovation Index',
    description: 'New ideas and innovations generated',
    category: 'strategic',
    position: 'R&D Coordinator',
    target: '≥10 innovations',
    baseline: '5',
    weight: 25,
    unit: 'count',
    frequency: 'annually',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
];

// GOM KPIs
const getGOMKPIs = (): KpiMetric[] => [
  {
    id: 'gom-efficiency',
    name: 'Operational Efficiency Index',
    description: 'Overall operational efficiency score',
    category: 'operational',
    position: 'General Operations Manager (GOM)',
    target: '≥90%',
    baseline: '80%',
    weight: 25,
    unit: 'percent',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
  {
    id: 'gom-quality',
    name: 'Quality Assurance Score',
    description: 'Operations quality metrics',
    category: 'compliance',
    position: 'General Operations Manager (GOM)',
    target: '≥95%',
    baseline: '88%',
    weight: 15,
    unit: 'percent',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: '2026-01-15',
    createdBy: 'System',
  },
];

// Master KPI data getter
export function getAllKPIs(): KpiMetric[] {
  return [
    ...getBranchManagerKPIs(),
    ...getDistrictManagerKPIs(),
    ...getProvincialManagerKPIs(),
    ...getITCoordinatorKPIs(),
    ...getManagementAccountantKPIs(),
    ...getRiskManagerKPIs(),
    ...getRecoveriesCoordinatorKPIs(),
    ...getPayrollLoansManagerKPIs(),
    ...getMotorVehiclesManagerKPIs(),
    ...getPolicyTrainingManagerKPIs(),
    ...getRDCoordinatorKPIs(),
    ...getGOMKPIs(),
  ];
}

// Get KPIs by position
export function getKPIsByPosition(position: PositionType): KpiMetric[] {
  const kpiMap: Partial<Record<PositionType, () => KpiMetric[]>> = {
    'Branch Manager': getBranchManagerKPIs,
    'District Manager': getDistrictManagerKPIs,
    'Provincial Manager': getProvincialManagerKPIs,
    'IT Coordinator': getITCoordinatorKPIs,
    'IT Manager': getITCoordinatorKPIs,
    'Management Accountant': getManagementAccountantKPIs,
    'Risk Manager': getRiskManagerKPIs,
    'Recoveries Coordinator': getRecoveriesCoordinatorKPIs,
    'Payroll Loans Manager': getPayrollLoansManagerKPIs,
    'Motor Vehicles Manager': getMotorVehiclesManagerKPIs,
    'Policy & Training Manager': getPolicyTrainingManagerKPIs,
    'R&D Coordinator': getRDCoordinatorKPIs,
    'General Operations Manager (GOM)': getGOMKPIs,
    'General Operations Administrator (GOA)': getGOMKPIs,
    'Performance Operations Administrator (POA)': getGOMKPIs,
    'District Regional Manager': getDistrictManagerKPIs,
    'Creative Artwork & Marketing Representative Manager': getGOMKPIs,
    'Manager Administration': getGOMKPIs,
    'Administration': getGOMKPIs,
    'Loan Consultant': getBranchManagerKPIs,
  };
  
  const getter = kpiMap[position];
  return getter ? getter() : [];
}

// Get active KPIs only
export function getActiveKPIs(): KpiMetric[] {
  return getAllKPIs().filter(kpi => kpi.isActive);
}

// Get KPI by ID
export function getKPIById(id: string): KpiMetric | undefined {
  return getAllKPIs().find(kpi => kpi.id === id);
}

// Default export
export default {
  getAllKPIs,
  getKPIsByPosition,
  getActiveKPIs,
  getKPIById,
  KPI_CATEGORIES,
};
