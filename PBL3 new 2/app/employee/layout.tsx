'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Search, Ticket, BarChart3, Tag, User } from 'lucide-react'

const employeeNavItems = [
  { href: '/employee/booking', label: 'Book Flight', icon: Search },
  { href: '/employee/tickets', label: 'Manage Tickets', icon: Ticket },
  { href: '/employee/statistics', label: 'Statistics', icon: BarChart3 },
  { href: '/employee/promotions', label: 'Promotions', icon: Tag },
  { href: '/employee/profile', label: 'Profile', icon: User },
]

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout
      navItems={employeeNavItems}
      userRole="employee"
      userName="Sarah Johnson"
      userEmail="sarah@skyline.com"
    >
      {children}
    </DashboardLayout>
  )
}
