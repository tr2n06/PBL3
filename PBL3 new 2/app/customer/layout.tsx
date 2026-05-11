"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Search, Ticket, User, HelpCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/profile-api";

const customerNavItems = [
  { href: "/customer/booking", label: "Book Flight", icon: Search },
  { href: "/customer/my-tickets", label: "My Tickets", icon: Ticket },
  { href: "/customer/profile", label: "Profile", icon: User },
  { href: "/customer/faq", label: "FAQ", icon: HelpCircle },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState("Customer");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const me = await getCurrentUser();
        setUserName(me.fullName || "Customer");
        setUserEmail(me.email || "");
      } catch (error) {
        console.error("Load current user failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMe();
  }, []);

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <DashboardLayout
      navItems={customerNavItems}
      userRole="customer"
      userName={userName}
      userEmail={userEmail}
    >
      {children}
    </DashboardLayout>
  );
}
