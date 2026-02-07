import type { Metadata } from "next";
import DashboardWrapper from '@/components/dashboards/DashboardWrapper';

export const metadata: Metadata = {
  title: "Smart Leadership Financial Services | Dashboard",
  description: "Comprehensive loan management and financial services platform",
};

export default function AdminDashboard() {
  return <DashboardWrapper />;
}
