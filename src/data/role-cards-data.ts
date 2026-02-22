/**
 * Centralized Role and KPI Data for all Leadership Positions
 * This file consolidates all role information, KPIs, and metrics from:
 * - role-cards-data.ts (original)
 * - kpi-metrics.ts (with detailed KPI definitions)
 * - kpi-data.ts (with dashboard configuration and calculations)
 */

import { PositionType } from '@/hooks/useUserPosition';
import { getOfficeNameById } from '@/hooks/useOffice';

// ============================================
// KPI Metric Interface (from kpi-metrics.ts)
// ============================================
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

// ============================================
// KPI Dashboard Interfaces (from kpi-data.ts)
// ============================================
export interface PositionKPIConfig {
  title: string;
  description: string;
  kpiCategories: KPICategory[];
  alerts: KPIAlert[];
}

export interface KPICategory {
  name: string;
  metrics: KSIMetric[];
}

export interface KSIMetric {
  name: string;
  value: number;
  target: number;
  unit: 'currency' | 'percent' | 'number' | 'days' | 'hours' | 'minutes' | 'months' | 'rating' | 'score';
  format: 'currency' | 'percent' | 'number' | 'rating';
  weight: number;
  lowerIsBetter?: boolean;
}

export interface KPIAlert {
  type: 'warning' | 'success' | 'info' | 'error';
  title: string;
  message: string;
}

// ============================================
// Role Card Interfaces (original)
// ============================================
export interface RoleCardConfig {
  title: string;
  department: string;
  reportsTo: string;
  directReports: string;
  location: string;
  jobPurpose: string;
  responsibilities: ResponsibilityCategory[];
  kpis: KPIItem[];
  competencies: string[];
  authority: AuthorityConfig;
  reviewCycles: ReviewCycle[];
}

export interface ResponsibilityCategory {
  category: string;
  items: string[];
}

export interface KPIItem {
  name: string;
  baseline: string;
  target: string;
  weight: string;
}

export interface AuthorityConfig {
  hiring?: string;
  creditDecisions?: string;
  portfolio?: string;
  budget?: string;
  pricing?: string;
  dealer?: string;
  approval?: string;
  employer?: string;
  risk?: string;
  compliance?: string;
  paymentPlans?: string;
  legal?: string;
  [key: string]: string | undefined;
}

export interface ReviewCycle {
  cycle: string;
  description: string;
}

// ============================================
// Branch Manager KPIs (from kpi-metrics.ts)
// ============================================
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

// ============================================
// District Manager KPIs (from kpi-metrics.ts)
// ============================================
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

// ============================================
// Provincial Manager KPIs (from kpi-metrics.ts)
// ============================================
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

// ============================================
// IT Coordinator KPIs (from kpi-metrics.ts)
// ============================================
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

// ============================================
// Management Accountant KPIs (from kpi-metrics.ts)
// ============================================
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

// ============================================
// Risk Manager KPIs (from kpi-metrics.ts)
// ============================================
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

// ============================================
// Recoveries Coordinator KPIs (from kpi-metrics.ts)
// ============================================
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

// ============================================
// Payroll Loans Manager KPIs (from kpi-metrics.ts)
// ============================================
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

// ============================================
// Motor Vehicles Manager KPIs (from kpi-metrics.ts)
// ============================================
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

// ============================================
// Policy & Training Manager KPIs (from kpi-metrics.ts)
// ============================================
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

// ============================================
// R&D Coordinator KPIs (from kpi-metrics.ts)
// ============================================
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

// ============================================
// GOM KPIs (from kpi-metrics.ts)
// ============================================
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

// ============================================
// KPI Data by Position (from kpi-data.ts)
// ============================================
export const kpiDataByPosition: Record<string, PositionKPIConfig> = {
  'Branch Manager': {
    title: 'Branch Manager Dashboard',
    description: 'Revenue, portfolio quality, and team performance metrics',
    kpiCategories: [
      {
        name: 'Financial KPIs',
        metrics: [
          { name: 'Monthly Disbursement Volume', value: 420000, target: 450000, unit: 'currency', format: 'currency', weight: 20 },
          { name: 'Branch Net Contribution', value: 280650, target: 324000, unit: 'currency', format: 'currency', weight: 25 },
          { name: 'Month-1 Default Rate', value: 28.36, target: 25, unit: 'percent', format: 'percent', weight: 20, lowerIsBetter: true },
          { name: 'In-House Recovery Rate', value: 56.05, target: 65, unit: 'percent', format: 'percent', weight: 15 },
          { name: 'Delinquency Roll-Rate', value: 36.74, target: 45, unit: 'percent', format: 'percent', weight: 10, lowerIsBetter: true },
          { name: 'Cost-to-Income Ratio', value: 55, target: 50, unit: 'percent', format: 'percent', weight: 10, lowerIsBetter: true },
        ],
      },
      {
        name: 'Operational & Team KPIs',
        metrics: [
          { name: 'LCs Achieving K50K+ Tier', value: 40, target: 50, unit: 'percent', format: 'percent', weight: 10 },
          { name: 'LCs Achieving K80K+ Tier', value: 8, target: 15, unit: 'percent', format: 'percent', weight: 5 },
          { name: 'Portfolio Reassignment Compliance', value: 95, target: 100, unit: 'percent', format: 'percent', weight: 5 },
          { name: 'Client Retention Rate', value: 82, target: 85, unit: 'percent', format: 'percent', weight: 5 },
          { name: 'Staff Turnover Rate', value: 8, target: 10, unit: 'percent', format: 'percent', weight: 5, lowerIsBetter: true },
        ],
      },
      {
        name: 'Strategic KPIs',
        metrics: [
          { name: 'MV Loan Referrals', value: 35000, target: 40000, unit: 'currency', format: 'currency', weight: 5 },
          { name: 'New Process Adoption', value: 90, target: 100, unit: 'percent', format: 'percent', weight: 5 },
        ],
      },
    ],
    alerts: [
      { type: 'warning', title: 'Month-1 Default Rate', message: 'Current rate (28.36%) is above target (25%). Review client vetting procedures.' },
      { type: 'success', title: 'Recovery Rate Improving', message: 'In-house recovery rate increased by 3% this month.' },
    ],
  },
  'District Manager': {
    title: 'District Manager Dashboard',
    description: 'Multi-branch performance and regional metrics',
    kpiCategories: [
      {
        name: 'Regional Financial KPIs',
        metrics: [
          { name: 'Total District Disbursement', value: 2100000, target: 2250000, unit: 'currency', format: 'currency', weight: 20 },
          { name: 'District Net Contribution', value: 1403250, target: 1620000, unit: 'currency', format: 'currency', weight: 20 },
          { name: 'Avg Month-1 Default Rate', value: 2.8, target: 2.5, unit: 'percent', format: 'percent', weight: 15, lowerIsBetter: true },
          { name: 'Avg Recovery Rate', value: 95.2, target: 97, unit: 'percent', format: 'percent', weight: 15 },
          { name: 'Branch Compliance Score', value: 96, target: 98, unit: 'percent', format: 'percent', weight: 10 },
        ],
      },
      {
        name: 'Branch Performance KPIs',
        metrics: [
          { name: 'Branches Meeting Targets', value: 3, target: 4, unit: 'number', format: 'number', weight: 10 },
          { name: 'Branches Needing Intervention', value: 1, target: 0, unit: 'number', format: 'number', weight: 5, lowerIsBetter: true },
          { name: 'Cross-Branch Learning Sessions', value: 2, target: 4, unit: 'number', format: 'number', weight: 5 },
        ],
      },
      {
        name: 'Talent & Development KPIs',
        metrics: [
          { name: 'BM Promotions Ready', value: 2, target: 3, unit: 'number', format: 'number', weight: 5 },
          { name: 'Succession Coverage', value: 85, target: 90, unit: 'percent', format: 'percent', weight: 5 },
        ],
      },
    ],
    alerts: [
      { type: 'warning', title: 'Branch B Performance', message: 'Branch B requires intervention - default rate elevated.' },
      { type: 'info', title: 'Satellite Expansion', message: 'New satellite branch on track for Q2 launch.' },
    ],
  },
  'Provincial Manager': {
    title: 'Provincial Manager Dashboard',
    description: 'Province-wide performance and strategic initiatives',
    kpiCategories: [
      {
        name: 'Provincial Financial KPIs',
        metrics: [
          { name: 'Total Provincial Disbursement', value: 10500000, target: 12000000, unit: 'currency', format: 'currency', weight: 20 },
          { name: 'Provincial Net Contribution', value: 7016250, target: 8100000, unit: 'currency', format: 'currency', weight: 20 },
          { name: 'Avg Default Rate', value: 2.6, target: 2.4, unit: 'percent', format: 'percent', weight: 15, lowerIsBetter: true },
          { name: 'Province Recovery Rate', value: 95.8, target: 97, unit: 'percent', format: 'percent', weight: 15 },
        ],
      },
      {
        name: 'District Management KPIs',
        metrics: [
          { name: 'Districts Meeting Targets', value: 3, target: 4, unit: 'number', format: 'number', weight: 10 },
          { name: 'District Manager Development', value: 75, target: 85, unit: 'percent', format: 'percent', weight: 10 },
          { name: 'Regional Consistency', value: 88, target: 92, unit: 'percent', format: 'percent', weight: 10 },
        ],
      },
    ],
    alerts: [
      { type: 'info', title: 'Province Performance', message: 'On track for annual targets. Q2 review scheduled.' },
    ],
  },
  'General Operations Manager (GOM)': {
    title: 'General Operations Manager Dashboard',
    description: 'Operational efficiency and process optimization',
    kpiCategories: [
      {
        name: 'Operational Efficiency KPIs',
        metrics: [
          { name: 'Process Cycle Time', value: 4.2, target: 3.5, unit: 'days', format: 'number', weight: 20, lowerIsBetter: true },
          { name: 'Error Rate', value: 1.8, target: 1.0, unit: 'percent', format: 'percent', weight: 15, lowerIsBetter: true },
          { name: ' SLA Compliance', value: 94, target: 98, unit: 'percent', format: 'percent', weight: 15 },
          { name: 'Cost per Transaction', value: 45, target: 40, unit: 'currency', format: 'currency', weight: 15, lowerIsBetter: true },
        ],
      },
      {
        name: 'Resource Utilization KPIs',
        metrics: [
          { name: 'Staff Utilization Rate', value: 82, target: 85, unit: 'percent', format: 'percent', weight: 15 },
          { name: 'System Uptime', value: 99.2, target: 99.9, unit: 'percent', format: 'percent', weight: 10 },
          { name: 'Document Processing Time', value: 2.5, target: 2.0, unit: 'hours', format: 'number', weight: 10, lowerIsBetter: true },
        ],
      },
    ],
    alerts: [
      { type: 'warning', title: 'Error Rate', message: 'Error rate above target. Training refresh recommended.' },
    ],
  },
  'General Operations Administrator (GOA)': {
    title: 'GOA Dashboard',
    description: 'Administrative operations and support metrics',
    kpiCategories: [
      {
        name: 'Administrative KPIs',
        metrics: [
          { name: 'Ticket Resolution Time', value: 24, target: 18, unit: 'hours', format: 'number', weight: 25, lowerIsBetter: true },
          { name: 'Document Accuracy', value: 98.5, target: 99, unit: 'percent', format: 'percent', weight: 20 },
          { name: 'Compliance Adherence', value: 96, target: 100, unit: 'percent', format: 'percent', weight: 20 },
          { name: 'Request Completion Rate', value: 95, target: 98, unit: 'percent', format: 'percent', weight: 20 },
        ],
      },
      {
        name: 'Support KPIs',
        metrics: [
          { name: 'User Satisfaction Score', value: 4.2, target: 4.5, unit: 'rating', format: 'rating', weight: 15 },
        ],
      },
    ],
    alerts: [],
  },
  'Management Accountant': {
    title: 'Management Accountant Dashboard',
    description: 'Financial reporting and analysis metrics',
    kpiCategories: [
      {
        name: 'Financial Reporting KPIs',
        metrics: [
          { name: 'Report Accuracy', value: 99.2, target: 99.5, unit: 'percent', format: 'percent', weight: 25 },
          { name: 'Month-End Close Time', value: 5, target: 4, unit: 'days', format: 'number', weight: 20, lowerIsBetter: true },
          { name: 'Budget Variance', value: 5.2, target: 3, unit: 'percent', format: 'percent', weight: 20, lowerIsBetter: true },
          { name: 'Audit Findings', value: 2, target: 0, unit: 'number', format: 'number', weight: 15, lowerIsBetter: true },
        ],
      },
      {
        name: 'Analysis KPIs',
        metrics: [
          { name: 'Forecast Accuracy', value: 92, target: 95, unit: 'percent', format: 'percent', weight: 10 },
          { name: 'Ad-hoc Requests Completion', value: 90, target: 95, unit: 'percent', format: 'percent', weight: 10 },
        ],
      },
    ],
    alerts: [
      { type: 'warning', title: 'Budget Variance', message: 'Variance exceeds target. Review needed.' },
    ],
  },
  'IT Manager': {
    title: 'IT Manager Dashboard',
    description: 'IT operations and technology performance',
    kpiCategories: [
      {
        name: 'IT Operations KPIs',
        metrics: [
          { name: 'System Uptime', value: 99.5, target: 99.9, unit: 'percent', format: 'percent', weight: 25 },
          { name: 'Mean Time to Recovery', value: 2.5, target: 1.5, unit: 'hours', format: 'number', weight: 20, lowerIsBetter: true },
          { name: 'Change Success Rate', value: 94, target: 98, unit: 'percent', format: 'percent', weight: 15 },
          { name: 'Security Incidents', value: 1, target: 0, unit: 'number', format: 'number', weight: 20, lowerIsBetter: true },
        ],
      },
      {
        name: 'Project & Delivery KPIs',
        metrics: [
          { name: 'Project On-Time Delivery', value: 85, target: 90, unit: 'percent', format: 'percent', weight: 10 },
          { name: 'User Satisfaction', value: 4.0, target: 4.3, unit: 'rating', format: 'rating', weight: 10 },
        ],
      },
    ],
    alerts: [
      { type: 'warning', title: 'Security', message: 'Minor security incident detected and resolved.' },
    ],
  },
  'IT Coordinator': {
    title: 'IT Coordinator Dashboard',
    description: 'IT support and coordination metrics',
    kpiCategories: [
      {
        name: 'Support KPIs',
        metrics: [
          { name: 'First Contact Resolution', value: 78, target: 85, unit: 'percent', format: 'percent', weight: 30 },
          { name: 'Average Response Time', value: 45, target: 30, unit: 'minutes', format: 'number', weight: 25, lowerIsBetter: true },
          { name: 'Ticket Backlog', value: 25, target: 15, unit: 'number', format: 'number', weight: 20, lowerIsBetter: true },
          { name: 'User Training Completion', value: 88, target: 95, unit: 'percent', format: 'percent', weight: 25 },
        ],
      },
    ],
    alerts: [
      { type: 'warning', title: 'Ticket Backlog', message: 'Ticket backlog above target. Staff reallocation recommended.' },
    ],
  },
  'Recoveries Coordinator': {
    title: 'Recoveries Coordinator Dashboard',
    description: 'Recovery operations and collection performance',
    kpiCategories: [
      {
        name: 'Recovery KPIs',
        metrics: [
          { name: 'Total Recovery Amount', value: 850000, target: 1000000, unit: 'currency', format: 'currency', weight: 25 },
          { name: 'Recovery Rate', value: 68, target: 75, unit: 'percent', format: 'percent', weight: 25 },
          { name: 'Avg Days to Recovery', value: 45, target: 35, unit: 'days', format: 'number', weight: 20, lowerIsBetter: true },
          { name: 'Legal Escalation Rate', value: 8, target: 5, unit: 'percent', format: 'percent', weight: 15, lowerIsBetter: true },
          { name: 'Client Payment Plans', value: 150, target: 180, unit: 'number', format: 'number', weight: 15 },
        ],
      },
    ],
    alerts: [
      { type: 'warning', title: 'Recovery Rate', message: 'Recovery rate below target. Review strategies.' },
    ],
  },
  'Risk Manager': {
    title: 'Risk Manager Dashboard',
    description: 'Risk management and compliance metrics',
    kpiCategories: [
      {
        name: 'Risk KPIs',
        metrics: [
          { name: 'Risk Score', value: 32, target: 25, unit: 'score', format: 'number', weight: 25, lowerIsBetter: true },
          { name: 'Compliance Score', value: 96, target: 99, unit: 'percent', format: 'percent', weight: 20 },
          { name: 'Audit Findings', value: 3, target: 1, unit: 'number', format: 'number', weight: 20, lowerIsBetter: true },
          { name: 'Risk Mitigation Rate', value: 82, target: 90, unit: 'percent', format: 'percent', weight: 20 },
          { name: 'Policy Violations', value: 2, target: 0, unit: 'number', format: 'number', weight: 15, lowerIsBetter: true },
        ],
      },
    ],
    alerts: [
      { type: 'warning', title: 'Risk Score', message: 'Risk score above target. Mitigation actions needed.' },
    ],
  },
  'Policy & Training Manager': {
    title: 'Policy & Training Manager Dashboard',
    description: 'Training and policy compliance metrics',
    kpiCategories: [
      {
        name: 'Training KPIs',
        metrics: [
          { name: 'Training Completion Rate', value: 88, target: 95, unit: 'percent', format: 'percent', weight: 30 },
          { name: 'Training Effectiveness Score', value: 4.1, target: 4.3, unit: 'rating', format: 'rating', weight: 20 },
          { name: 'New Hire Onboarding Time', value: 14, target: 10, unit: 'days', format: 'number', weight: 15, lowerIsBetter: true },
          { name: 'Policy Acknowledgment', value: 98, target: 100, unit: 'percent', format: 'percent', weight: 20 },
          { name: 'Compliance Training Pass Rate', value: 94, target: 98, unit: 'percent', format: 'percent', weight: 15 },
        ],
      },
    ],
    alerts: [],
  },
  'Motor Vehicles Manager': {
    title: 'Motor Vehicles Manager Dashboard',
    description: 'Motor vehicle loan portfolio and sales performance',
    kpiCategories: [
      {
        name: 'MV Loan KPIs',
        metrics: [
          { name: 'MV Loan Disbursement', value: 280000, target: 350000, unit: 'currency', format: 'currency', weight: 25 },
          { name: 'MV Default Rate', value: 2.1, target: 1.8, unit: 'percent', format: 'percent', weight: 20, lowerIsBetter: true },
          { name: 'MV Recovery Rate', value: 97, target: 98, unit: 'percent', format: 'percent', weight: 20 },
          { name: 'Dealer Partnerships', value: 12, target: 15, unit: 'number', format: 'number', weight: 15 },
          { name: 'MV Referral Conversion', value: 35, target: 45, unit: 'percent', format: 'percent', weight: 20 },
        ],
      },
    ],
    alerts: [
      { type: 'warning', title: 'Disbursement Target', message: 'MV disbursement below target. Partner outreach needed.' },
    ],
  },
  'Payroll Loans Manager': {
    title: 'Payroll Loans Manager Dashboard',
    description: 'Payroll loan portfolio management',
    kpiCategories: [
      {
        name: 'Payroll Loan KPIs',
        metrics: [
          { name: 'Payroll Loan Disbursement', value: 520000, target: 600000, unit: 'currency', format: 'currency', weight: 25 },
          { name: 'Payroll Default Rate', value: 1.8, target: 1.5, unit: 'percent', format: 'percent', weight: 20, lowerIsBetter: true },
          { name: 'Employer Partnerships', value: 45, target: 55, unit: 'number', format: 'number', weight: 20 },
          { name: 'Payroll Deduction Accuracy', value: 99.5, target: 99.9, unit: 'percent', format: 'percent', weight: 20 },
          { name: 'Client Satisfaction', value: 4.4, target: 4.5, unit: 'rating', format: 'rating', weight: 15 },
        ],
      },
    ],
    alerts: [],
  },
  'Performance Operations Administrator (POA)': {
    title: 'POA Dashboard',
    description: 'Performance monitoring and operations support',
    kpiCategories: [
      {
        name: 'Performance KPIs',
        metrics: [
          { name: 'KPI Data Accuracy', value: 98, target: 99, unit: 'percent', format: 'percent', weight: 30 },
          { name: 'Report Timeliness', value: 96, target: 100, unit: 'percent', format: 'percent', weight: 25 },
          { name: 'Performance Review Completion', value: 92, target: 98, unit: 'percent', format: 'percent', weight: 25 },
          { name: 'Data Analysis Quality', value: 4.2, target: 4.5, unit: 'rating', format: 'rating', weight: 20 },
        ],
      },
    ],
    alerts: [],
  },
  'R&D Coordinator': {
    title: 'R&D Coordinator Dashboard',
    description: 'Research and development metrics',
    kpiCategories: [
      {
        name: 'R&D KPIs',
        metrics: [
          { name: 'Projects Completed', value: 3, target: 4, unit: 'number', format: 'number', weight: 25 },
          { name: 'Innovation Index', value: 72, target: 80, unit: 'score', format: 'number', weight: 25 },
          { name: 'Research Adoption Rate', value: 65, target: 75, unit: 'percent', format: 'percent', weight: 25 },
          { name: 'Time to Market', value: 6, target: 5, unit: 'months', format: 'number', weight: 25, lowerIsBetter: true },
        ],
      },
    ],
    alerts: [],
  },
  'Manager Administration': {
    title: 'Administration Manager Dashboard',
    description: 'Administrative management metrics',
    kpiCategories: [
      {
        name: 'Administration KPIs',
        metrics: [
          { name: 'Document Processing Time', value: 2.5, target: 2.0, unit: 'hours', format: 'number', weight: 25, lowerIsBetter: true },
          { name: 'Administrative Cost Efficiency', value: 88, target: 92, unit: 'percent', format: 'percent', weight: 25 },
          { name: 'Facility Utilization', value: 85, target: 90, unit: 'percent', format: 'percent', weight: 20 },
          { name: 'Staff Productivity', value: 90, target: 95, unit: 'percent', format: 'percent', weight: 30 },
        ],
      },
    ],
    alerts: [],
  },
  'Administration': {
    title: 'Administration Dashboard',
    description: 'General administrative support metrics',
    kpiCategories: [
      {
        name: 'Support KPIs',
        metrics: [
          { name: 'Request Fulfillment Rate', value: 94, target: 98, unit: 'percent', format: 'percent', weight: 35 },
          { name: 'Response Time', value: 1.5, target: 1.0, unit: 'hours', format: 'number', weight: 30, lowerIsBetter: true },
          { name: 'Quality Score', value: 4.3, target: 4.5, unit: 'rating', format: 'rating', weight: 35 },
        ],
      },
    ],
    alerts: [],
  },
  'District Regional Manager': {
    title: 'Regional Manager Dashboard',
    description: 'Regional performance and strategy metrics',
    kpiCategories: [
      {
        name: 'Regional Financial KPIs',
        metrics: [
          { name: 'Regional Disbursement', value: 5250000, target: 6000000, unit: 'currency', format: 'currency', weight: 25 },
          { name: 'Regional Net Contribution', value: 3508125, target: 4050000, unit: 'currency', format: 'currency', weight: 25 },
          { name: 'Regional Default Rate', value: 2.5, target: 2.2, unit: 'percent', format: 'percent', weight: 20, lowerIsBetter: true },
          { name: 'Regional Recovery Rate', value: 96, target: 98, unit: 'percent', format: 'percent', weight: 20 },
        ],
      },
      {
        name: 'Strategic KPIs',
        metrics: [
          { name: 'Regional Growth', value: 12, target: 15, unit: 'percent', format: 'percent', weight: 10 },
        ],
      },
    ],
    alerts: [],
  },
  'General Operations Manager': {
    title: 'Operations Manager Dashboard',
    description: 'Operations management and efficiency',
    kpiCategories: [
      {
        name: 'Operations KPIs',
        metrics: [
          { name: 'Operational Efficiency', value: 88, target: 92, unit: 'percent', format: 'percent', weight: 30 },
          { name: 'Process Optimization', value: 82, target: 88, unit: 'percent', format: 'percent', weight: 25 },
          { name: 'Cost Reduction', value: 5.2, target: 7, unit: 'percent', format: 'percent', weight: 25 },
          { name: 'Quality Assurance Score', value: 95, target: 98, unit: 'percent', format: 'percent', weight: 20 },
        ],
      },
    ],
    alerts: [],
  },
  'Creative Artwork & Marketing Representative Manager': {
    title: 'Marketing Manager Dashboard',
    description: 'Marketing and creative performance metrics',
    kpiCategories: [
      {
        name: 'Marketing KPIs',
        metrics: [
          { name: 'Campaign Reach', value: 85000, target: 100000, unit: 'number', format: 'number', weight: 25 },
          { name: 'Lead Generation', value: 420, target: 500, unit: 'number', format: 'number', weight: 25 },
          { name: 'Conversion Rate', value: 3.2, target: 4.0, unit: 'percent', format: 'percent', weight: 20 },
          { name: 'Brand Awareness', value: 68, target: 75, unit: 'percent', format: 'percent', weight: 15 },
          { name: 'Marketing ROI', value: 285, target: 350, unit: 'percent', format: 'percent', weight: 15 },
        ],
      },
    ],
    alerts: [
      { type: 'warning', title: 'Lead Generation', message: 'Lead generation below target. Campaign refresh needed.' },
    ],
  },
  'Super Seer': {
    title: 'Super Seer Dashboard',
    description: 'Executive overview - All positions and system-wide metrics',
    kpiCategories: [
      {
        name: 'Executive Overview KPIs',
        metrics: [
          { name: 'Total Disbursement', value: 15000000, target: 18000000, unit: 'currency', format: 'currency', weight: 20 },
          { name: 'Overall Default Rate', value: 2.4, target: 2.0, unit: 'percent', format: 'percent', weight: 20, lowerIsBetter: true },
          { name: 'System Recovery Rate', value: 96.5, target: 98, unit: 'percent', format: 'percent', weight: 15 },
          { name: 'Portfolio Health Score', value: 88, target: 92, unit: 'percent', format: 'percent', weight: 15 },
          { name: 'Employee Satisfaction', value: 4.2, target: 4.5, unit: 'rating', format: 'rating', weight: 15 },
          { name: 'System Uptime', value: 99.5, target: 99.9, unit: 'percent', format: 'percent', weight: 15 },
        ],
      },
    ],
    alerts: [
      { type: 'info', title: 'Executive View', message: 'You have access to all position KPIs. Use impersonation to view specific dashboards.' },
    ],
  },
};

// ============================================
// Role Cards Data (original role-cards-data.ts)
// ============================================
export const roleCardsData: Record<string, RoleCardConfig> = {
  'Branch Manager': {
    title: 'Branch Manager',
    department: 'Operations',
    reportsTo: 'District Manager',
    directReports: 'Loan Consultants (LCs), Satellite branch supervisors',
    location: 'Branch Office',
    jobPurpose: 'The Branch Manager is the primary revenue engine and profit center leader responsible for driving branch-level performance toward the institutional goal of achieving a K100M valuation within five years. The role focuses on loan disbursement growth, portfolio quality, collections efficiency, and team development within a value-driven, performance-aligned framework.',
    responsibilities: [
      {
        category: 'Revenue & Portfolio Management',
        items: [
          'Ensure the branch meets or exceeds monthly disbursement targets (K420,000+)',
          'Oversee the end-to-end loan lifecycle: origination, disbursement, collection, and recovery',
          'Implement and monitor the Collections Waterfall Process to maximize in-house/branch recoveries and minimize long-term delinquency',
          'Drive adoption of Motor Vehicle Loans and other new products through client referrals and cross-selling'
        ]
      },
      {
        category: 'Team Leadership & Development',
        items: [
          'Supervise, train, and mentor Loan Consultants (LCs) to achieve tiered performance targets (Base, K50K+, K80K+, K120K+)',
          'Conduct weekly performance reviews and coaching sessions with LCs',
          'Implement portfolio reassignment protocols to optimize underperforming portfolios',
          'Foster a high-performance, accountable, and client-focused culture'
        ]
      },
      {
        category: 'Risk & Compliance',
        items: [
          'Ensure compliance with institutional lending policies, risk frameworks, and regulatory requirements',
          'Monitor and reduce Month-1 default rates through improved client vetting and early intervention',
          'Maintain accurate and timely reporting on portfolio health, defaults, and recoveries'
        ]
      },
      {
        category: 'Operational Excellence',
        items: [
          'Manage branch operational costs within budget',
          'Ensure efficient use of branch resources, including office space, systems, and staff',
          'Implement and adhere to Service Level Agreements (SLAs) for handovers to the Recoveries Department'
        ]
      },
      {
        category: 'Strategic Contribution',
        items: [
          'Participate in the rollout of new products, processes, and technologies',
          'Support satellite branch expansion within the district if applicable',
          'Collaborate with District and Provincial Managers on regional growth initiatives'
        ]
      }
    ],
    kpis: [
      { name: 'Monthly Disbursement Volume', baseline: 'K420,000', target: 'K450,000+', weight: '20%' },
      { name: 'Branch Net Contribution', baseline: 'K280,650', target: 'K324,000+', weight: '25%' },
      { name: 'Month-1 Default Rate', baseline: '28.36%', target: '≤25%', weight: '20%' },
      { name: 'In-House Recovery Rate', baseline: '56.05%', target: '≥65%', weight: '15%' },
      { name: 'Delinquency Roll-Rate', baseline: '36.74%', target: '≥45%', weight: '10%' },
      { name: 'Cost-to-Income Ratio', baseline: '~55%', target: '≤50%', weight: '10%' }
    ],
    competencies: [
      'Leadership: Ability to inspire, coach, and hold teams accountable',
      'Analytical Skills: Proficiency in data-driven decision-making and KPI tracking',
      'Risk Management: Understanding of credit risk, collections, and recovery processes',
      'Communication: Clear and effective communication with staff, clients, and senior management',
      'Strategic Thinking: Alignment with the K100M valuation framework and growth pillars'
    ],
    authority: {
      hiring: 'Authority to hire/fire LCs with District Manager approval',
      creditDecisions: 'Approve loans up to K5,000; refer larger loans to District Manager',
      portfolio: 'Authority to reassign delinquent portfolios to high-performing LCs',
      budget: 'Oversee branch operational budget with cost control accountability'
    },
    reviewCycles: [
      { cycle: 'Monthly', description: 'KPI dashboards reviewed with District Manager' },
      { cycle: 'Quarterly', description: 'Formal performance review tied to rewards eligibility' },
      { cycle: 'Annual', description: 'Comprehensive review for promotion, increment, or remedial action' }
    ]
  },
  'District Manager': {
    title: 'District Manager',
    department: 'Operations & Regional Management',
    reportsTo: 'Provincial Manager',
    directReports: 'Branch Managers (2–3+ branches depending on tier)',
    location: 'District Hub / Regional Office',
    jobPurpose: 'The District Manager in addition to managing their own branch, serves as the Performance Multiplier & Collections Champion for a cluster of branches. The role is not to duplicate branch-level management, but to oversee, validate, and optimize inter-branch performance, risk management, and strategic alignment with the K100M valuation target. The focus is on cross-branch synergy, escalated risk oversight, future-period follow-ups, and talent pipeline development.',
    responsibilities: [
      {
        category: 'Strategic Oversight & Validation',
        items: [
          'Ensure all branches under supervision are aligned with the K100M valuation framework',
          'Validate branch-reported data, especially: Month-1 default rates, Collections waterfall recovery percentages, Cash and cash equivalent balances, Portfolio integrity (ghost clients, fraud prevention)',
          'Conduct random and scheduled audits of branch operations without interfering in day-to-day management'
        ]
      },
      {
        category: 'Performance Optimization (Cross-Branch Focus)',
        items: [
          'Identify and share best practices across branches (successful collection scripts, client retention tactics)',
          'Facilitate inter-branch portfolio reassignment where applicable',
          'Monitor inter-branch conflicts or coordination issues and resolve impartially',
          'Drive district/regional-wide initiatives such as product launches, partnership rollouts, or training programs'
        ]
      },
      {
        category: 'Forward-Looking Supervision',
        items: [
          'Focus on future-period risks and opportunities that branch managers may overlook',
          'Ensure branch managers are planning for next-month targets while managing current performance',
          'Monitor aging delinquency reports (Month-2, Month-3 portfolios)'
        ]
      },
      {
        category: 'Risk & Compliance Escalation',
        items: [
          'Act as first point of escalation for high-risk cases, fraud suspicions, or major compliance breaches',
          'Oversee district-level risk dashboard including cross-branch default trends and recovery rate variances',
          'Ensure timely handover to Recoveries Department for portfolios beyond Month-4'
        ]
      },
      {
        category: 'Talent & Leadership Development',
        items: [
          'Identify and develop high-potential LCs and Branch Managers',
          'Mentor Branch Managers on leadership, reporting, and strategic execution',
          'Support succession planning within the district'
        ]
      },
      {
        category: 'Revenue & Growth Facilitation',
        items: [
          'Drive Motor Vehicle Loan referrals and other high-value product adoption',
          'Explore and facilitate strategic partnerships at district level',
          'Support satellite branch expansion with minimal managerial overhead'
        ]
      }
    ],
    kpis: [
      { name: 'Cross-Branch Default Reduction', baseline: 'Branch avg. 28.36%', target: '-3% vs. branch avg.', weight: '20%' },
      { name: 'District Recovery on Month-1 Default', baseline: '56.05%', target: '+2 percentage points', weight: '15%' },
      { name: 'Delinquency Roll-Rate (Month-2)', baseline: '36.74%', target: '≥45%', weight: '15%' },
      { name: 'Total District Net Contribution', baseline: 'Sum of branch contributions', target: '+15% vs. prior year', weight: '20%' },
      { name: 'Cost-to-Income Ratio (District)', baseline: '~55%', target: '≤50%', weight: '10%' },
      { name: 'Audit Compliance Score', baseline: '-', target: '100%', weight: '15%' }
    ],
    competencies: [
      'Strategic Oversight: Ability to see beyond daily operations to future risks/opportunities',
      'Data Validation & Auditing: Strong analytical and verification skills',
      'Cross-Functional Leadership: Experience managing multiple teams without micromanaging',
      'Risk Management: Understanding of credit, operational, and compliance risks',
      'Coaching & Development: Ability to mentor Branch Managers and develop talent'
    ],
    authority: {
      hiring: 'Recommendation only for Branch Manager hiring/firing',
      creditDecisions: 'Review & endorse high-risk loan approval (>K20,000)',
      portfolio: 'Approve & facilitate inter-branch portfolio transfer',
      budget: 'Monthly incremental funding pool for branch developments tied to verified value creation'
    },
    reviewCycles: [
      { cycle: 'Monthly', description: 'KPI review with Provincial Manager' },
      { cycle: 'Quarterly', description: 'Bonus eligibility based on audited value creation' },
      { cycle: 'Annual', description: 'Tier re-evaluation based on revenue and performance' }
    ]
  },
  'Provincial Manager': {
    title: 'Provincial Manager',
    department: 'Regional Management',
    reportsTo: 'Senior Management / Executive',
    directReports: 'District Managers',
    location: 'Provincial Office',
    jobPurpose: 'The Provincial Manager is responsible for overseeing all operations within a province, ensuring alignment with institutional goals, driving regional growth initiatives, and maintaining high standards of performance and compliance across all districts.',
    responsibilities: [
      {
        category: 'Regional Strategy & Oversight',
        items: [
          'Develop and implement provincial strategies aligned with K100M valuation goal',
          'Oversee district performance and ensure targets are met across the province',
          'Coordinate cross-district initiatives and resource allocation'
        ]
      },
      {
        category: 'Performance Management',
        items: [
          'Monitor and analyze provincial KPIs across all districts',
          'Identify underperforming areas and implement corrective actions',
          'Recognize and reward high-performing districts and managers'
        ]
      },
      {
        category: 'Risk & Compliance',
        items: [
          'Ensure provincial compliance with all regulatory requirements',
          'Oversee risk management frameworks across districts',
          'Handle escalated issues from District Managers'
        ]
      }
    ],
    kpis: [
      { name: 'Provincial Disbursement', baseline: 'TBD', target: 'TBD', weight: '25%' },
      { name: 'Provincial Default Rate', baseline: 'TBD', target: 'TBD', weight: '20%' },
      { name: 'Provincial Recovery Rate', baseline: 'TBD', target: 'TBD', weight: '20%' },
      { name: 'District Manager Development', baseline: 'TBD', target: 'TBD', weight: '15%' },
      { name: 'Regional Consistency', baseline: 'TBD', target: 'TBD', weight: '20%' }
    ],
    competencies: [
      'Strategic Leadership: Ability to guide regional strategy',
      'Stakeholder Management: Strong relationships with internal and external stakeholders',
      'Analytical Skills: Data-driven decision making',
      'Communication: Clear communication across all levels'
    ],
    authority: {
      hiring: 'Authority over District Manager hiring recommendations',
      creditDecisions: 'Final approval for high-value loans',
      budget: 'Provincial budget oversight and allocation'
    },
    reviewCycles: [
      { cycle: 'Monthly', description: 'Provincial performance review' },
      { cycle: 'Quarterly', description: 'Strategic review with senior management' },
      { cycle: 'Annual', description: 'Annual performance evaluation' }
    ]
  },
  'General Operations Manager (GOM)': {
    title: 'General Operations Manager',
    department: 'Operations',
    reportsTo: 'Senior Management',
    directReports: 'Department Heads, Team Leads',
    location: 'Head Office',
    jobPurpose: 'The GOM oversees all operational functions across the organization, ensuring efficiency, quality, and continuous improvement in all business processes.',
    responsibilities: [
      {
        category: 'Operational Excellence',
        items: [
          'Streamline operational processes to improve efficiency',
          'Implement best practices across all departments',
          'Monitor and reduce operational costs while maintaining quality'
        ]
      },
      {
        category: 'Process Optimization',
        items: [
          'Identify bottlenecks and implement solutions',
          'Lead continuous improvement initiatives',
          'Implement new technologies and systems'
        ]
      }
    ],
    kpis: [
      { name: 'Process Cycle Time', baseline: '4.2 days', target: '3.5 days', weight: '20%' },
      { name: 'Error Rate', baseline: '1.8%', target: '1.0%', weight: '15%' },
      { name: 'SLA Compliance', baseline: '94%', target: '98%', weight: '15%' },
      { name: 'Cost per Transaction', baseline: 'K45', target: 'K40', weight: '15%' }
    ],
    competencies: [
      'Process Management',
      'Continuous Improvement',
      'Project Management',
      'Data Analysis'
    ],
    authority: {
      budget: 'Operational budget oversight',
      hiring: 'Department head hiring recommendations'
    },
    reviewCycles: [
      { cycle: 'Monthly', description: 'Operational metrics review' },
      { cycle: 'Quarterly', description: 'Process improvement review' }
    ]
  },
  'Management Accountant': {
    title: 'Management Accountant',
    department: 'Finance',
    reportsTo: 'Finance Manager / CFO',
    directReports: 'Finance Assistants',
    location: 'Head Office',
    jobPurpose: 'The Management Accountant provides financial analysis, budgeting, and reporting to support management decision-making and organizational performance.',
    responsibilities: [
      {
        category: 'Financial Reporting',
        items: [
          'Prepare accurate and timely financial reports',
          'Analyze financial performance against budgets',
          'Provide insights for cost optimization'
        ]
      },
      {
        category: 'Budgeting & Forecasting',
        items: [
          'Develop annual budgets in collaboration with departments',
          'Monitor budget variances and provide explanations',
          'Update forecasts based on actual performance'
        ]
      }
    ],
    kpis: [
      { name: 'Report Accuracy', baseline: '99.2%', target: '99.5%', weight: '25%' },
      { name: 'Month-End Close Time', baseline: '5 days', target: '4 days', weight: '20%' },
      { name: 'Budget Variance', baseline: '5.2%', target: '3%', weight: '20%' },
      { name: 'Forecast Accuracy', baseline: '92%', target: '95%', weight: '10%' }
    ],
    competencies: [
      'Financial Analysis',
      'Budgeting & Forecasting',
      'Excel & Financial Systems',
      'Attention to Detail'
    ],
    authority: {
      budget: 'Budget preparation and monitoring',
      approvals: 'Expense approval within assigned limits'
    },
    reviewCycles: [
      { cycle: 'Monthly', description: 'Financial reporting' },
      { cycle: 'Quarterly', description: 'Budget review with management' }
    ]
  },
  'IT Manager': {
    title: 'IT Manager',
    department: 'Information Technology',
    reportsTo: 'Senior Management / CIO',
    directReports: 'IT Staff, System Administrators',
    location: 'Head Office',
    jobPurpose: 'The IT Manager oversees all technology infrastructure, ensures system availability, and leads digital transformation initiatives.',
    responsibilities: [
      {
        category: 'IT Operations',
        items: [
          'Maintain 99.9% system uptime',
          'Oversee IT infrastructure and network security',
          'Manage IT budget and vendor relationships'
        ]
      },
      {
        category: 'Project Delivery',
        items: [
          'Lead technology implementation projects',
          'Ensure on-time delivery of IT initiatives',
          'Manage change management processes'
        ]
      }
    ],
    kpis: [
      { name: 'System Uptime', baseline: '99.5%', target: '99.9%', weight: '25%' },
      { name: 'Mean Time to Recovery', baseline: '2.5 hours', target: '1.5 hours', weight: '20%' },
      { name: 'Change Success Rate', baseline: '94%', target: '98%', weight: '15%' },
      { name: 'Project On-Time Delivery', baseline: '85%', target: '90%', weight: '10%' }
    ],
    competencies: [
      'Technical Leadership',
      'Project Management',
      'Security Management',
      'Vendor Management'
    ],
    authority: {
      budget: 'IT budget management',
      vendor: 'Vendor selection and contracts'
    },
    reviewCycles: [
      { cycle: 'Monthly', description: 'IT metrics review' },
      { cycle: 'Quarterly', description: 'Project delivery review' }
    ]
  },
  'Recoveries Coordinator': {
    title: 'Recoveries Coordinator',
    department: 'Recoveries',
    reportsTo: 'Risk Manager / Collections Manager',
    directReports: 'Recovery Agents',
    location: 'Head Office',
    jobPurpose: 'The Recoveries Coordinator manages the recovery of delinquent accounts, implements collection strategies, and maximizes recovery rates.',
    responsibilities: [
      {
        category: 'Recovery Operations',
        items: [
          'Oversee end-to-end recovery process',
          'Implement recovery strategies and scripts',
          'Monitor recovery performance metrics'
        ]
      },
      {
        category: 'Legal Escalation',
        items: [
          'Manage legal escalation process',
          'Coordinate with legal team on litigation cases',
          'Track legal recovery outcomes'
        ]
      }
    ],
    kpis: [
      { name: 'Total Recovery Amount', baseline: 'K850,000', target: 'K1,000,000', weight: '25%' },
      { name: 'Recovery Rate', baseline: '68%', target: '75%', weight: '25%' },
      { name: 'Avg Days to Recovery', baseline: '45 days', target: '35 days', weight: '20%' },
      { name: 'Legal Escalation Rate', baseline: '8%', target: '5%', weight: '15%' }
    ],
    competencies: [
      'Negotiation Skills',
      'Debt Collection',
      'Legal Knowledge',
      'Data Analysis'
    ],
    authority: {
      legal: 'Legal escalation approvals',
      paymentPlans: 'Authority to approve payment plans'
    },
    reviewCycles: [
      { cycle: 'Weekly', description: 'Recovery metrics review' },
      { cycle: 'Monthly', description: 'Performance evaluation' }
    ]
  },
  'Risk Manager': {
    title: 'Risk Manager',
    department: 'Risk Management',
    reportsTo: 'Senior Management',
    directReports: 'Risk Analysts',
    location: 'Head Office',
    jobPurpose: 'The Risk Manager oversees the organization\'s risk management framework, ensures compliance with regulatory requirements, and mitigates potential risks.',
    responsibilities: [
      {
        category: 'Risk Management',
        items: [
          'Develop and implement risk management policies',
          'Identify and assess potential risks',
          'Monitor risk exposure and implement mitigation strategies'
        ]
      },
      {
        category: 'Compliance',
        items: [
          'Ensure regulatory compliance',
          'Conduct risk audits and assessments',
          'Implement compliance training programs'
        ]
      }
    ],
    kpis: [
      { name: 'Risk Score', baseline: '32', target: '25', weight: '25%' },
      { name: 'Compliance Score', baseline: '96%', target: '99%', weight: '20%' },
      { name: 'Audit Findings', baseline: '3', target: '1', weight: '20%' },
      { name: 'Risk Mitigation Rate', baseline: '82%', target: '90%', weight: '20%' }
    ],
    competencies: [
      'Risk Assessment',
      'Regulatory Knowledge',
      'Analytical Skills',
      'Policy Development'
    ],
    authority: {
      risk: 'Risk policy approval',
      compliance: 'Compliance oversight'
    },
    reviewCycles: [
      { cycle: 'Monthly', description: 'Risk metrics review' },
      { cycle: 'Quarterly', description: 'Compliance audit' }
    ]
  },
  'Motor Vehicles Manager': {
    title: 'Motor Vehicles Manager',
    department: 'Lending / Operations',
    reportsTo: 'Operations Director',
    directReports: 'MV Loan Specialists',
    location: 'Head Office',
    jobPurpose: 'The Motor Vehicles Manager manages the motor vehicle loan portfolio, maintains dealer relationships, and ensures efficient loan processing.',
    responsibilities: [
      {
        category: 'MV Loan Management',
        items: [
          'Oversee motor vehicle loan portfolio',
          'Monitor MV loan disbursement and recovery',
          'Develop strategies for MV loan growth'
        ]
      },
      {
        category: 'Dealer Partnerships',
        items: [
          'Develop and maintain dealer relationships',
          'Negotiate partnership terms',
          'Expand dealer network'
        ]
      }
    ],
    kpis: [
      { name: 'MV Loan Disbursement', baseline: 'K280,000', target: 'K350,000', weight: '25%' },
      { name: 'MV Default Rate', baseline: '2.1%', target: '1.8%', weight: '20%' },
      { name: 'MV Recovery Rate', baseline: '97%', target: '98%', weight: '20%' },
      { name: 'Dealer Partnerships', baseline: '12', target: '15', weight: '15%' }
    ],
    competencies: [
      'Sales Management',
      'Dealer Relations',
      'Product Knowledge',
      'Portfolio Management'
    ],
    authority: {
      pricing: 'MV loan pricing recommendations',
      dealer: 'Dealer partnership approvals'
    },
    reviewCycles: [
      { cycle: 'Monthly', description: 'MV portfolio review' },
      { cycle: 'Quarterly', description: 'Dealer partnership review' }
    ]
  },
  'Payroll Loans Manager': {
    title: 'Payroll Loans Manager',
    department: 'Lending / Operations',
    reportsTo: 'Operations Director',
    directReports: 'Payroll Sales Team',
    location: 'Head Office',
    jobPurpose: 'The Payroll Loans Manager manages the payroll loan portfolio, maintains employer relationships, and ensures efficient payroll deduction processes.',
    responsibilities: [
      {
        category: 'Payroll Loan Management',
        items: [
          'Oversee payroll loan portfolio',
          'Monitor payroll deduction accuracy',
          'Develop strategies for payroll loan growth'
        ]
      },
      {
        category: 'Employer Relations',
        items: [
          'Maintain relationships with employer partners',
          'Negotiate new payroll agreements',
          'Expand employer network'
        ]
      }
    ],
    kpis: [
      { name: 'Payroll Loan Disbursement', baseline: 'K520,000', target: 'K600,000', weight: '25%' },
      { name: 'Payroll Default Rate', baseline: '1.8%', target: '1.5%', weight: '20%' },
      { name: 'Employer Partnerships', baseline: '45', target: '55', weight: '20%' },
      { name: 'Payroll Deduction Accuracy', baseline: '99.5%', target: '99.9%', weight: '20%' }
    ],
    competencies: [
      'Employer Relations',
      'Payroll Processing',
      'Portfolio Management',
      'Negotiation'
    ],
    authority: {
      approval: 'Payroll loan approvals',
      employer: 'Employer agreement negotiations'
    },
    reviewCycles: [
      { cycle: 'Monthly', description: 'Payroll loan review' },
      { cycle: 'Quarterly', description: 'Employer partnership review' }
    ]
  },
  // Default templates for other positions
  'General Operations Administrator (GOA)': {
    title: 'GOA',
    department: 'Administration',
    reportsTo: 'Operations Manager',
    directReports: 'Administrative Staff',
    location: 'Head Office',
    jobPurpose: 'Supports operational efficiency through administrative excellence and process coordination.',
    responsibilities: [
      {
        category: 'Administrative Support',
        items: [
          'Provide administrative support to operations',
          'Coordinate cross-departmental activities',
          'Maintain accurate records and documentation'
        ]
      }
    ],
    kpis: [
      { name: 'Ticket Resolution Time', baseline: '24 hours', target: '18 hours', weight: '25%' },
      { name: 'Document Accuracy', baseline: '98.5%', target: '99%', weight: '20%' },
      { name: 'Request Completion Rate', baseline: '95%', target: '98%', weight: '20%' }
    ],
    competencies: [
      'Organization',
      'Communication',
      'Problem Solving'
    ],
    authority: {},
    reviewCycles: [
      { cycle: 'Monthly', description: 'Administrative metrics review' }
    ]
  },
  'IT Coordinator': {
    title: 'IT Coordinator',
    department: 'Information Technology',
    reportsTo: 'IT Manager',
    directReports: 'IT Support Staff',
    location: 'Head Office',
    jobPurpose: 'Coordinates IT support services and ensures efficient resolution of technical issues.',
    responsibilities: [
      {
        category: 'IT Support',
        items: [
          'Coordinate IT support operations',
          'Monitor ticket resolution times',
          'Ensure first contact resolution targets are met'
        ]
      }
    ],
    kpis: [
      { name: 'First Contact Resolution', baseline: '78%', target: '85%', weight: '30%' },
      { name: 'Average Response Time', baseline: '45 minutes', target: '30 minutes', weight: '25%' },
      { name: 'Ticket Backlog', baseline: '25', target: '15', weight: '20%' }
    ],
    competencies: [
      'Technical Support',
      'Problem Solving',
      'Communication'
    ],
    authority: {},
    reviewCycles: [
      { cycle: 'Weekly', description: 'Support metrics review' }
    ]
  },
  'Manager Administration': {
    title: 'Administration Manager',
    department: 'Administration',
    reportsTo: 'Senior Management',
    directReports: 'Administrative Team',
    location: 'Head Office',
    jobPurpose: 'Manages administrative functions and ensures efficient facility and document management.',
    responsibilities: [
      {
        category: 'Administration Management',
        items: [
          'Oversee administrative operations',
          'Manage facility utilization',
          'Ensure document processing efficiency'
        ]
      }
    ],
    kpis: [
      { name: 'Document Processing Time', baseline: '2.5 hours', target: '2.0 hours', weight: '25%' },
      { name: 'Administrative Cost Efficiency', baseline: '88%', target: '92%', weight: '25%' },
      { name: 'Facility Utilization', baseline: '85%', target: '90%', weight: '20%' }
    ],
    competencies: [
      'Leadership',
      'Organization',
      'Resource Management'
    ],
    authority: {},
    reviewCycles: [
      { cycle: 'Monthly', description: 'Administrative review' }
    ]
  },
  'Administration': {
    title: 'Administration Staff',
    department: 'Administration',
    reportsTo: 'Administration Manager',
    directReports: 'None',
    location: 'Head Office',
    jobPurpose: 'Provides day-to-day administrative support to ensure smooth office operations.',
    responsibilities: [
      {
        category: 'Daily Operations',
        items: [
          'Handle incoming requests and inquiries',
          'Maintain filing and documentation',
          'Support office logistics'
        ]
      }
    ],
    kpis: [
      { name: 'Request Fulfillment Rate', baseline: '94%', target: '98%', weight: '35%' },
      { name: 'Response Time', baseline: '1.5 hours', target: '1.0 hour', weight: '30%' }
    ],
    competencies: [
      'Organization',
      'Communication',
      'Attention to Detail'
    ],
    authority: {},
    reviewCycles: [
      { cycle: 'Monthly', description: 'Performance review' }
    ]
  },
  'District Regional Manager': {
    title: 'Regional Manager',
    department: 'Regional Management',
    reportsTo: 'Provincial Manager',
    directReports: 'District Managers',
    location: 'Regional Office',
    jobPurpose: 'Oversees regional operations and drives growth initiatives across multiple districts.',
    responsibilities: [
      {
        category: 'Regional Oversight',
        items: [
          'Coordinate district activities within the region',
          'Drive regional growth initiatives',
          'Monitor regional performance metrics'
        ]
      }
    ],
    kpis: [
      { name: 'Regional Disbursement', baseline: 'TBD', target: 'TBD', weight: '25%' },
      { name: 'Regional Default Rate', baseline: '2.5%', target: '2.2%', weight: '20%' },
      { name: 'Regional Growth', baseline: '12%', target: '15%', weight: '10%' }
    ],
    competencies: [
      'Strategic Leadership',
      'Regional Coordination',
      'Performance Management'
    ],
    authority: {},
    reviewCycles: [
      { cycle: 'Monthly', description: 'Regional review' }
    ]
  },
  'General Operations Manager': {
    title: 'Operations Manager',
    department: 'Operations',
    reportsTo: 'GOM / Senior Management',
    directReports: 'Team Leads',
    location: 'Head Office',
    jobPurpose: 'Manages day-to-day operations and ensures operational efficiency.',
    responsibilities: [
      {
        category: 'Operations Management',
        items: [
          'Oversee daily operations',
          'Implement process improvements',
          'Monitor operational metrics'
        ]
      }
    ],
    kpis: [
      { name: 'Operational Efficiency', baseline: '88%', target: '92%', weight: '30%' },
      { name: 'Process Optimization', baseline: '82%', target: '88%', weight: '25%' },
      { name: 'Cost Reduction', baseline: '5.2%', target: '7%', weight: '25%' }
    ],
    competencies: [
      'Operations Management',
      'Process Improvement',
      'Team Leadership'
    ],
    authority: {},
    reviewCycles: [
      { cycle: 'Monthly', description: 'Operations review' }
    ]
  },
  'Performance Operations Administrator (POA)': {
    title: 'POA',
    department: 'Performance Management',
    reportsTo: 'Performance Manager',
    directReports: 'None',
    location: 'Head Office',
    jobPurpose: 'Supports performance monitoring and operations reporting across the organization.',
    responsibilities: [
      {
        category: 'Performance Monitoring',
        items: [
          'Track KPI data accuracy',
          'Generate performance reports',
          'Support performance review processes'
        ]
      }
    ],
    kpis: [
      { name: 'KPI Data Accuracy', baseline: '98%', target: '99%', weight: '30%' },
      { name: 'Report Timeliness', baseline: '96%', target: '100%', weight: '25%' },
      { name: 'Performance Review Completion', baseline: '92%', target: '98%', weight: '25%' }
    ],
    competencies: [
      'Data Analysis',
      'Reporting',
      'Attention to Detail'
    ],
    authority: {},
    reviewCycles: [
      { cycle: 'Monthly', description: 'Performance data review' }
    ]
  },
  'R&D Coordinator': {
    title: 'R&D Coordinator',
    department: 'Research & Development',
    reportsTo: 'R&D Manager / Innovation Head',
    directReports: 'Research Team',
    location: 'Head Office / Innovation Center',
    jobPurpose: 'Coordinates research initiatives and drives innovation projects.',
    responsibilities: [
      {
        category: 'Research Coordination',
        items: [
          'Coordinate research projects',
          'Support innovation initiatives',
          'Track research outcomes'
        ]
      }
    ],
    kpis: [
      { name: 'Projects Completed', baseline: '3', target: '4', weight: '25%' },
      { name: 'Innovation Index', baseline: '72', target: '80', weight: '25%' },
      { name: 'Research Adoption Rate', baseline: '65%', target: '75%', weight: '25%' }
    ],
    competencies: [
      'Research Methods',
      'Innovation',
      'Project Coordination'
    ],
    authority: {},
    reviewCycles: [
      { cycle: 'Quarterly', description: 'R&D review' }
    ]
  },
  'Creative Artwork & Marketing Representative Manager': {
    title: 'Marketing Manager',
    department: 'Marketing',
    reportsTo: 'Marketing Director / Senior Management',
    directReports: 'Marketing Staff',
    location: 'Head Office',
    jobPurpose: 'Leads marketing initiatives, creative campaigns, and brand development.',
    responsibilities: [
      {
        category: 'Marketing & Branding',
        items: [
          'Develop and execute marketing strategies',
          'Manage creative campaigns',
          'Drive lead generation initiatives'
        ]
      }
    ],
    kpis: [
      { name: 'Campaign Reach', baseline: '85,000', target: '100,000', weight: '25%' },
      { name: 'Lead Generation', baseline: '420', target: '500', weight: '25%' },
      { name: 'Conversion Rate', baseline: '3.2%', target: '4.0%', weight: '20%' },
      { name: 'Marketing ROI', baseline: '285%', target: '350%', weight: '15%' }
    ],
    competencies: [
      'Marketing Strategy',
      'Creative Direction',
      'Analytics',
      'Brand Management'
    ],
    authority: {},
    reviewCycles: [
      { cycle: 'Monthly', description: 'Marketing performance review' }
    ]
  },
  'Loan Consultant': {
    title: 'Loan Consultant',
    department: 'Lending Operations',
    reportsTo: 'Branch Manager',
    directReports: 'Clients',
    location: 'Branch Office',
    jobPurpose: 'Achieve individual loan targets, maintain portfolio quality, and deliver excellent customer service. Responsible for the end-to-end loan process from origination to disbursement and collection.',
    responsibilities: [
      {
        category: 'Loan Origination',
        items: [
          'Source and qualify new loan applications',
          'Conduct client interviews and assess eligibility',
          'Complete loan documentation and verification',
          'Maintain strong client relationships and provide financial advice'
        ]
      },
      {
        category: 'Portfolio Management',
        items: [
          'Monitor and manage active loan portfolio',
          'Track repayments and follow up on overdue accounts',
          'Identify early warning signs of default and implement mitigation strategies',
          'Maintain accurate records of all client interactions'
        ]
      },
      {
        category: 'Collections & Recovery',
        items: [
          'Follow up on overdue payments and arrange repayment plans',
          'Implement collection strategies to minimize defaults',
          'Escalate high-risk accounts to management',
          'Maintain collection statistics and report on performance'
        ]
      },
      {
        category: 'Compliance',
        items: [
          'Ensure compliance with lending policies and regulatory requirements',
          'Adhere to credit risk assessment guidelines',
          'Maintain data privacy and security standards',
          'Participate in compliance training and audits'
        ]
      }
    ],
    kpis: [
      { name: 'Monthly Disbursement Volume', baseline: 'K250,000', target: 'K300,000+', weight: '30%' },
      { name: 'Loan Approval Rate', baseline: '78%', target: '85%', weight: '20%' },
      { name: 'Collection Rate', baseline: '94%', target: '96%+', weight: '25%' },
      { name: 'Default Rate', baseline: '2.2%', target: '≤1.8%', weight: '15%' },
      { name: 'Client Satisfaction Score', baseline: '4.2/5', target: '4.5/5', weight: '10%' }
    ],
    competencies: [
      'Sales & Relationship Management',
      'Financial Analysis',
      'Communication & Negotiation',
      'Compliance & Risk Management',
      'Problem Solving'
    ],
    authority: {
      loanApproval: 'Approval authority up to K5,000',
      paymentPlans: 'Authority to arrange repayment plans',
      clientInteraction: 'Direct client communication and relationship management'
    },
    reviewCycles: [
      { cycle: 'Weekly', description: 'Performance review with Branch Manager' },
      { cycle: 'Monthly', description: 'KPI dashboard review' },
      { cycle: 'Quarterly', description: 'Formal performance evaluation' },
      { cycle: 'Annual', description: 'Comprehensive review for tier advancement' }
    ]
  }
};

// ============================================
// Helper Functions (from kpi-metrics.ts and kpi-data.ts)
// ============================================

// Master KPI data getter (from kpi-metrics.ts)
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

// Get KPIs by position (from kpi-metrics.ts)
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

// Get active KPIs only (from kpi-metrics.ts)
export function getActiveKPIs(): KpiMetric[] {
  return getAllKPIs().filter(kpi => kpi.isActive);
}

// Get KPI by ID (from kpi-metrics.ts)
export function getKPIById(id: string): KpiMetric | undefined {
  return getAllKPIs().find(kpi => kpi.id === id);
}

// Helper function to get position from localStorage (from kpi-data.ts)
export function getCurrentUserPosition(): string {
  if (typeof window === 'undefined') {
    return 'Branch Manager';
  }
  
  const storedUser = localStorage.getItem('thisUser');
  if (!storedUser) {
    return 'Branch Manager';
  }
  
  try {
    const user = JSON.parse(storedUser);
    // First try position string, then job_position (from API), then position_id
    const positionStr = user.position?.trim();
    if (positionStr) {
      return positionStr;
    }
    // Check job_position (from API) or position_id
    const positionId = user.job_position || user.position_id;
    if (positionId) {
      // Map position ID to name
      return getPositionNameByIdStatic(positionId);
    }
    return 'Branch Manager';
  } catch (e) {
    console.error('Error parsing user data:', e);
    return 'Branch Manager';
  }
}

// Map position ID to name (same as useUserPosition) (from kpi-data.ts)
function getPositionNameByIdStatic(id: number): string {
  const positionMap: Record<number, string> = {
    1: 'General Operations Manager (GOM)',
    2: 'Provincial Manager',
    3: 'District Regional Manager',
    4: 'District Manager',
    5: 'Branch Manager',
    6: 'IT Manager',
    7: 'Risk Manager',
    8: 'Management Accountant',
    9: 'Motor Vehicles Manager',
    10: 'Payroll Loans Manager',
    11: 'Policy & Training Manager',
    12: 'Manager Administration',
    13: 'R&D Coordinator',
    14: 'Recoveries Coordinator',
    15: 'IT Coordinator',
    16: 'General Operations Administrator (GOA)',
    17: 'Performance Operations Administrator (POA)',
    18: 'Creative Artwork & Marketing Representative Manager',
    19: 'Administration',
    20: 'Super Seer',
  };
  return positionMap[id] || 'Branch Manager';
}

// Helper function to calculate overall KPI score (from kpi-data.ts)
export function calculateOverallScore(metrics: KSIMetric[]): number {
  if (metrics.length === 0) return 0;
  
  let totalWeight = 0;
  let weightedScore = 0;
  
  metrics.forEach(metric => {
    const weight = metric.weight || 0;
    totalWeight += weight;
    
    let score = 0;
    if (metric.lowerIsBetter) {
      // For metrics where lower is better, calculate how close to target
      if (metric.value <= metric.target) {
        score = 100;
      } else {
        score = Math.max(0, 100 - ((metric.value - metric.target) / metric.target) * 100);
      }
    } else {
      // For metrics where higher is better
      score = Math.min(100, (metric.value / metric.target) * 100);
    }
    
    weightedScore += score * weight;
  });
  
  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
}

// Default fallback for unknown positions (from kpi-data.ts)
export const defaultKPIData: PositionKPIConfig = {
  title: 'Performance Dashboard',
  description: 'General performance metrics',
  kpiCategories: [
    {
      name: 'Key Performance Indicators',
      metrics: [
        { name: 'Overall Performance', value: 85, target: 90, unit: 'percent', format: 'percent', weight: 50 },
        { name: 'Efficiency', value: 88, target: 92, unit: 'percent', format: 'percent', weight: 30 },
        { name: 'Quality', value: 90, target: 95, unit: 'percent', format: 'percent', weight: 20 },
      ],
    },
  ],
  alerts: [],
};

// Default fallback for unknown positions (from role-cards-data.ts)
export const defaultRoleCard: RoleCardConfig = {
  title: 'Position',
  department: 'TBD',
  reportsTo: 'TBD',
  directReports: 'TBD',
  location: 'TBD',
  jobPurpose: 'Position responsibilities to be defined.',
  responsibilities: [],
  kpis: [],
  competencies: [],
  authority: {},
  reviewCycles: []
};

// ============================================
// Default Exports
// ============================================
export default roleCardsData;
