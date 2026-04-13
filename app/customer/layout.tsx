"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Search, Ticket, User, HelpCircle } from "lucide-react";

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
  return (
    <DashboardLayout
      navItems={customerNavItems}
      userRole="customer"
      userName="John Smith"
      userEmail="john@example.com"
    >
      {children}
    </DashboardLayout>
  );
}
