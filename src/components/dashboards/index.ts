// Dashboard exports - using lazy loading for better performance

// Core Management Dashboards
export { default as BranchManagerDashboard } from './BranchManagerDashboard';
export { default as LoanConsultantDashboard } from './LoanConsultantDashboard';
export { default as DistrictManagerDashboard } from './DistrictManagerDashboard';
export { default as DistrictRegionalManagerDashboard } from './DistrictRegionalManagerDashboard';
export { default as ProvincialManagerDashboard } from './ProvincialManagerDashboard';

// Operations Dashboards
export { default as GOADashboard } from './GOADashboard';
export { default as GOMDashboard } from './GOMDashboard';
export { default as POADashboard } from './POADashboard';

// Administration Dashboards
export { default as AdministrationDashboard } from './AdministrationDashboard';
export { default as ManagerAdministrationDashboard } from './ManagerAdministrationDashboard';

// Finance Dashboards
export { default as ManagementAccountantDashboard } from './ManagementAccountantDashboard';
export { default as PayrollLoansManagerDashboard } from './PayrollLoansManagerDashboard';

// Risk & Recovery Dashboards
export { default as RiskManagerDashboard } from './RiskManagerDashboard';
export { default as RecoveriesCoordinatorDashboard } from './RecoveriesCoordinatorDashboard';

// IT Dashboards
export { default as ITManagerDashboard } from './ITManagerDashboard';
export { default as ITCoordinatorDashboard } from './ITCoordinatorDashboard';

// HR & Training Dashboards
export { default as PolicyTrainingManagerDashboard } from './PolicyTrainingManagerDashboard';

// Operations Dashboards
export { default as MotorVehiclesManagerDashboard } from './MotorVehiclesManagerDashboard';

// R&D Dashboards
export { default as RDCoordinatorDashboard } from './RDCoordinatorDashboard';

// Marketing Dashboards
export { default as MarketingManagerDashboard } from './MarketingManagerDashboard';

// Executive Leadership Dashboards
export { default as SuperSeerDashboard } from './SuperSeerDashboard';

// Generic Dashboard
export { default as GenericDashboard } from './GenericDashboard';

// Registry exports
export { POSITION_DASHBOARDS, DEFAULT_DASHBOARD, getDashboardKey, DASHBOARD_KEYS } from './dashboard-registry';
export { useUserPosition, getUserPosition } from '@/hooks/useUserPosition';

// Base component exports
export { 
  DashboardBase, 
  KPICard, 
  AlertCard, 
  SectionCard, 
  DataTable, 
  QuickInfoBar, 
  JobPurpose, 
  KPIMetricsCard,
  CollapsibleCard,
  DashboardLoading, 
  DashboardError 
} from './DashboardBase';
