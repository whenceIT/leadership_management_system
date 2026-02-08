'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { DashboardLoading } from '@/components/dashboards/DashboardBase';
import { getUserPosition } from '@/hooks/useUserPosition';

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
  'General Operations Administrator (GOA)': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'General Operations Manager (GOM)': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'General Operations Manager': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
  'Performance Operations Administrator (POA)': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
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
  'Creative Artwork & Marketing Representative Manager': dynamic(() => import('@/components/dashboards/GenericDashboard'), { 
    loading: () => <DashboardLoading />
  }),
};

/**
 * DashboardWrapper Component
 * Client-side wrapper that listens for position changes (impersonation)
 * and re-renders the appropriate dashboard
 */
export default function DashboardWrapper() {
  const [position, setPosition] = useState<string>('Branch Manager');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client flag
    setIsClient(true);
    
    // Get initial position
    setPosition(getUserPosition());

    // Listen for storage changes (impersonation changes)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'thisUser') {
        const newPosition = getUserPosition();
        setPosition(newPosition);
      }
    };

    // Listen for custom position change events
    const handlePositionChange = () => {
      setPosition(getUserPosition());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('positionChanged', handlePositionChange);

    // Also poll for changes (for same-tab updates)
    const pollInterval = setInterval(() => {
      const currentPosition = getUserPosition();
      if (currentPosition !== position) {
        setPosition(currentPosition);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('positionChanged', handlePositionChange);
      clearInterval(pollInterval);
    };
  }, [position]);

  // Get dashboard component based on position
  const DashboardComponent = DASHBOARD_COMPONENTS[position] || DASHBOARD_COMPONENTS['Branch Manager'];

  if (!isClient) {
    return <DashboardLoading />;
  }

  return <DashboardComponent position={position} />;
}
