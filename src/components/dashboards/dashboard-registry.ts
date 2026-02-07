// Leadership Dashboard Registry
// Maps positions to their respective dashboard components

export const POSITION_DASHBOARDS = {
  // Core Management Positions
  'Branch Manager': () => import('./BranchManagerDashboard'),
  'District Manager': () => import('./DistrictManagerDashboard'),
  'District Regional Manager': () => import('./DistrictRegionalManagerDashboard'),
  'Provincial Manager': () => import('./ProvincialManagerDashboard'),
  
  // General Operations
  'General Operations Administrator': () => import('./GOADashboard'),
  'General Operations Manager': () => import('./GOMDashboard'),
  'Performance Operations Administrator': () => import('./POADashboard'),
  
  // Administration
  'Administration': () => import('./AdministrationDashboard'),
  'Manager Administration': () => import('./ManagerAdministrationDashboard'),
  
  // Finance & Accounting
  'Management Accountant': () => import('./ManagementAccountantDashboard'),
  'Payroll Loans Manager': () => import('./PayrollLoansManagerDashboard'),
  
  // Risk & Recovery
  'Risk Manager': () => import('./RiskManagerDashboard'),
  'Recoveries Coordinator': () => import('./RecoveriesCoordinatorDashboard'),
  
  // IT
  'IT Manager': () => import('./ITManagerDashboard'),
  'IT Coordinator': () => import('./ITCoordinatorDashboard'),
  
  // HR & Training
  'Policy & Training Manager': () => import('./PolicyTrainingManagerDashboard'),
  
  // Operations
  'Motor Vehicles Manager': () => import('./MotorVehiclesManagerDashboard'),
  
  // R&D
  'R&D Coordinator': () => import('./RDCoordinatorDashboard'),
  
  // Marketing
  'Creative Artwork & Marketing Representative Manager Performance Review': () => import('./MarketingManagerDashboard'),
} as const;

// Default dashboard for unrecognized positions
export const DEFAULT_DASHBOARD = 'Branch Manager';

// Get dashboard component name from position
export function getDashboardKey(position: string): string {
  return POSITION_DASHBOARDS[position as keyof typeof POSITION_DASHBOARDS] 
    ? position 
    : DEFAULT_DASHBOARD;
}

// All available dashboard keys
export const DASHBOARD_KEYS = Object.keys(POSITION_DASHBOARDS) as readonly string[];
