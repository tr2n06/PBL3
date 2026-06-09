"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Users, ClipboardList, BarChart3, Plane } from "lucide-react";
import { getCurrentUser } from "@/lib/profile-api";

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
  const [userName, setUserName] = useState("Manager");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const me = await getCurrentUser();
        setUserName(me.fullName || "Manager");
        setUserEmail(me.email || "");
      } catch (error) {
        console.error("Load current manager failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMe();
  }, []);

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <DashboardLayout
      navItems={managerNavItems}
      userRole="manager"
      userName={userName}
      userEmail={userEmail}
    >
      {children}
    </DashboardLayout>
  );
}

