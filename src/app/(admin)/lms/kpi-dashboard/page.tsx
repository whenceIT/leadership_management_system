import type { Metadata } from "next";
import KPIDashboard from "@/components/kpi/KPIDashboard";

export const metadata: Metadata = {
  title: "KPI Dashboard | LMS - Leadership Management System",
  description: "Real-time KPI tracking and performance metrics",
};

export default function KPIDashboardPage() {
  return <KPIDashboard />;
}
