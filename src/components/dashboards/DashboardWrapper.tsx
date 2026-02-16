'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { DashboardLoading } from '@/components/dashboards/DashboardBase';
import { useUserPosition } from '@/hooks/useUserPosition';
import { getPositionNameByIdStatic } from '@/hooks/useUserPosition';

// Define dashboard components map
const DASHBOARD_COMPONENTS: Record<string, React.ComponentType<any>> = {
  // Core Management
  'Branch Manager': dynamic(() => import('@/components/dashboards/BranchManagerDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'District Manager': dynamic(() => import('@/components/dashboards/DistrictManagerDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'District Regional Manager': dynamic(() => import('@/components/dashboards/DistrictRegionalManagerDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'Provincial Manager': dynamic(() => import('@/components/dashboards/ProvincialManagerDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  
  // General Operations
  'General Operations Administrator (GOA)': dynamic(() => import('@/components/dashboards/GOADashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'General Operations Administrator': dynamic(() => import('@/components/dashboards/GOADashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'General Operations Manager (GOM)': dynamic(() => import('@/components/dashboards/GOMDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'General Operations Manager': dynamic(() => import('@/components/dashboards/GOMDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'Performance Operations Administrator (POA)': dynamic(() => import('@/components/dashboards/POADashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'Performance Operations Administrator': dynamic(() => import('@/components/dashboards/POADashboard'), { 
    loading: () => <DashboardLoading />
  }),
  
  // Administration
  'Administration': dynamic(() => import('@/components/dashboards/AdministrationDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'Manager Administration': dynamic(() => import('@/components/dashboards/ManagerAdministrationDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  
  // Finance & Accounting
  'Management Accountant': dynamic(() => import('@/components/dashboards/ManagementAccountantDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'Payroll Loans Manager': dynamic(() => import('@/components/dashboards/PayrollLoansManagerDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  
  // Risk & Recovery
  'Risk Manager': dynamic(() => import('@/components/dashboards/RiskManagerDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'Recoveries Coordinator': dynamic(() => import('@/components/dashboards/RecoveriesCoordinatorDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  
  // IT
  'IT Manager': dynamic(() => import('@/components/dashboards/ITManagerDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'IT Coordinator': dynamic(() => import('@/components/dashboards/ITCoordinatorDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  
  // HR & Training
  'Policy & Training Manager': dynamic(() => import('@/components/dashboards/PolicyTrainingManagerDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  
  // Operations
  'Motor Vehicles Manager': dynamic(() => import('@/components/dashboards/MotorVehiclesManagerDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  
  // R&D
  'R&D Coordinator': dynamic(() => import('@/components/dashboards/RDCoordinatorDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  
  // Marketing
  'Creative Artwork & Marketing Representative Manager': dynamic(() => import('@/components/dashboards/MarketingManagerDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'Creative Artwork & Marketing Representative Manager Performance Review': dynamic(() => import('@/components/dashboards/MarketingManagerDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'Marketing Manager': dynamic(() => import('@/components/dashboards/MarketingManagerDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  
  // Super Seer - has access to all dashboards (currently uses GOM Dashboard as placeholder)
  'Super Seer': dynamic(() => import('@/components/dashboards/GOMDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  
  // Loan Consultant
  'Loan Consultant': dynamic(() => import('@/components/dashboards/LoanConsultantDashboard'), { 
    loading: () => <DashboardLoading />
  }),
};

/**
 * DashboardWrapper Component
 * Client-side wrapper that listens for position changes (impersonation)
 * and re-renders the appropriate dashboard
 * Uses useUserPosition hook to fetch dynamic position from API using job_position
 */
export default function DashboardWrapper() {
  const [isClient, setIsClient] = useState(false);
  
  // Use the useUserPosition hook which fetches position dynamically from API
  const { positionId, positionName, isLoading, refreshPosition } = useUserPosition();

  useEffect(() => {
    // Set client flag
    setIsClient(true);
    
    // Refresh position from API
    refreshPosition(true);
  }, [refreshPosition]);

  // Get dashboard component based on position name
  const DashboardComponent = DASHBOARD_COMPONENTS[positionName] || DASHBOARD_COMPONENTS['Branch Manager'];

  if (!isClient || isLoading) {
    return <DashboardLoading />;
  }

  return <DashboardComponent position={positionName} />;
}
