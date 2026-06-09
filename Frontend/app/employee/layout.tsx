'use client'

import { useEffect, useState } from "react"
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Search, Ticket, BarChart3, Tag, User } from 'lucide-react'
import { getCurrentUser } from "@/lib/profile-api"

const employeeNavItems = [
  { href: '/employee/booking', label: 'Book Flight', icon: Search },
  { href: '/employee/tickets', label: 'Manage Tickets', icon: Ticket },
  { href: '/employee/statistics', label: 'Statistics', icon: BarChart3 },
  { href: '/employee/promotions', label: 'Promotions', icon: Tag },
  { href: '/employee/profile', label: 'Profile', icon: User },
]

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState("Employee")
  const [userEmail, setUserEmail] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMe = async () => {
      try {
        const me = await getCurrentUser()
        setUserName(me.fullName || "Employee")
        setUserEmail(me.email || "")
      } catch (error) {
        console.error("Load current employee failed:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMe()
  }, [])

  if (loading) return <div className="p-6">Đang tải...</div>

  return (
    <DashboardLayout
      navItems={employeeNavItems}
      userRole="employee"
      userName={userName}
      userEmail={userEmail}
    >
      {children}
    </DashboardLayout>
  )
}

