import type { Metadata } from "next";
import RoleCard from "@/components/role-cards/RoleCard";

export const metadata: Metadata = {
  title: "Role Cards | LMS - Leadership Management System",
  description: "Digital Role Cards for all leadership positions",
};

export default function RoleCardsPage() {
  return <RoleCard />;
}
