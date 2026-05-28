"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Users, ClipboardList, BarChart3, Plane } from "lucide-react";

const managerNavItems = [
  { href: "/manager/employees", label: "Employees", icon: Users },
  { href: "/manager/flights", label: "Flights", icon: Plane },
  { href: "/manager/approvals", label: "Approvals", icon: ClipboardList },
  { href: "/manager/statistics", label: "Statistics", icon: BarChart3 },
];

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      navItems={managerNavItems}
      userRole="manager"
      userName="Admin Manager"
      userEmail="michael@skyline.com"
    >
      {children}
    </DashboardLayout>
  );
}
