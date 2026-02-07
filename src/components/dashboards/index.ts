// Dashboard exports - using lazy loading for better performance

export { default as BranchManagerDashboard } from './BranchManagerDashboard';
export { default as DistrictManagerDashboard } from './DistrictManagerDashboard';
export { default as GenericDashboard } from './GenericDashboard';
export { POSITION_DASHBOARDS, DEFAULT_DASHBOARD, getDashboardKey, DASHBOARD_KEYS } from './dashboard-registry';
export { useUserPosition, getUserPosition } from '@/hooks/useUserPosition';
