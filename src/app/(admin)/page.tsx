import type { Metadata } from "next";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { DashboardLoading } from '@/components/dashboards/DashboardBase';

// Define dashboard components map
const DASHBOARD_COMPONENTS: Record<string, React.ComponentType<any>> = {
  // Core Management
  'Branch Manager': dynamic(() => import('@/components/dashboards/BranchManagerDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'District Manager': dynamic(() => import('@/components/dashboards/DistrictManagerDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'District Regional Manager': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'Provincial Manager': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  
  // General Operations
  'General Operations Administrator': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'General Operations Manager': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'Performance Operations Administrator': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  
  // Administration
  'Administration': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'Manager Administration': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  
  // Finance & Accounting
  'Management Accountant': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'Payroll Loans Manager': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  
  // Risk & Recovery
  'Risk Manager': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'Recoveries Coordinator': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  
  // IT
  'IT Manager': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'IT Coordinator': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  
  // HR & Training
  'Policy & Training Manager': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  
  // Operations
  'Motor Vehicles Manager': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  
  // R&D
  'R&D Coordinator': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  
  // Marketing
  'Creative Artwork & Marketing Representative Manager Performance Review': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
};

// Get user position from localStorage (synchronous)
function getUserPosition(): string {
  if (typeof window === 'undefined') {
    return 'Branch Manager';
  }

  try {
    const storedUser = localStorage.getItem('thisUser');
    if (!storedUser) {
      return 'Branch Manager';
    }

    const user = JSON.parse(storedUser);
    return user.position || 'Branch Manager';
  } catch (e) {
    return 'Branch Manager';
  }
}

export const metadata: Metadata = {
  title: "Smart Leadership Financial Services | Dashboard",
  description: "Comprehensive loan management and financial services platform",
};

export default function AdminDashboard() {
  const position = getUserPosition();
  
  // Get dashboard component based on position
  const DashboardComponent = DASHBOARD_COMPONENTS[position] || DASHBOARD_COMPONENTS['Branch Manager'];

  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardComponent position={position} />
    </Suspense>
  );
}
