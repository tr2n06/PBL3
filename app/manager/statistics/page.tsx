"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Ticket, XCircle, Users, UserX } from "lucide-react"
import { mockUsers, mockTickets } from "@/lib/mock-data"

const revenueData = [
  { month: "Jan", revenue: 125000, bookings: 450 },
  { month: "Feb", revenue: 142000, bookings: 520 },
  { month: "Mar", revenue: 168000, bookings: 610 },
  { month: "Apr", revenue: 195000, bookings: 720 },
  { month: "May", revenue: 178000, bookings: 650 },
  { month: "Jun", revenue: 210000, bookings: 780 },
]

const cancellationData = [
  { month: "Jan", cancellations: 12, rate: 2.7 },
  { month: "Feb", cancellations: 18, rate: 3.5 },
  { month: "Mar", cancellations: 15, rate: 2.5 },
  { month: "Apr", cancellations: 22, rate: 3.1 },
  { month: "May", cancellations: 28, rate: 4.3 },
  { month: "Jun", cancellations: 19, rate: 2.4 },
]

const cancellationReasons = [
  { name: "Personal Reasons", value: 35, color: "#3b82f6" },
  { name: "Schedule Change", value: 28, color: "#10b981" },
  { name: "Health Issues", value: 18, color: "#f59e0b" },
  { name: "Price Found Cheaper", value: 12, color: "#ef4444" },
  { name: "Other", value: 7, color: "#6b7280" },
]

const frequentCancellers = [
  { id: "1", name: "Michael Brown", email: "michael@email.com", cancellations: 5, totalBookings: 8, rate: 62.5 },
  { id: "2", name: "Lisa White", email: "lisa@email.com", cancellations: 4, totalBookings: 7, rate: 57.1 },
  { id: "3", name: "David Lee", email: "david@email.com", cancellations: 3, totalBookings: 4, rate: 75.0 },
]

export default function StatisticsPage() {
  const [period, setPeriod] = useState("6months")

  const customers = mockUsers.filter(u => u.role === "customer")
  const cancelledTickets = mockTickets.filter(t => t.status === "cancelled")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistics & Analytics</h1>
          <p className="text-muted-foreground">Revenue reports and cancellation analytics</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Last Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,018,000</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+12.5%</span> from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,730</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+8.2%</span> from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancellations</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">114</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span className="text-green-600">-5.3%</span> from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.1%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span className="text-green-600">-0.4%</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cancellation Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Cancellation Trends</CardTitle>
            <CardDescription>Monthly cancellation rate analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cancellationData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cancellations" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--destructive))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancellation Reasons & Frequent Cancellers */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cancellation Reasons Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cancellation Reasons</CardTitle>
            <CardDescription>Breakdown of why customers cancel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cancellationReasons}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {cancellationReasons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {cancellationReasons.map((reason) => (
                <div key={reason.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: reason.color }} />
                  <span className="text-sm">{reason.name} ({reason.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Frequent Cancellers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-destructive" />
              High-Risk Customers
            </CardTitle>
            <CardDescription>Customers with high cancellation rates - consider blocking</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Cancellations</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {frequentCancellers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.cancellations} / {customer.totalBookings}
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.rate > 50 ? "destructive" : "secondary"}>
                        {customer.rate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="text-destructive">
                        Block
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Customer Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Overview
          </CardTitle>
          <CardDescription>All registered customers and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Total Customers</div>
              <div className="text-2xl font-bold">{customers.length}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Active</div>
              <div className="text-2xl font-bold text-green-600">
                {customers.filter(c => c.status === "active").length}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Blocked</div>
              <div className="text-2xl font-bold text-destructive">
                {customers.filter(c => c.status === "blocked").length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
