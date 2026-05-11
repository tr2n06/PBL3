"use client"

import { useEffect, useState } from "react";
import {
  getStatistics,
  blockCustomer,
  type StatisticsResponse,
  type CancellationReasonItem,
  type HighRiskCustomerItem,
} from "@/lib/statistics-api";
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






export default function StatisticsPage() {
  const [period, setPeriod] = useState("6months")
const [loading, setLoading] = useState(true);
const [stats, setStats] = useState<StatisticsResponse | null>(null);
 useEffect(() => {
  const loadStatistics = async () => {
    try {
      setLoading(true);
      const data = await getStatistics(period);
      setStats(data);
    } catch (error) {
      console.error("Load statistics failed:", error);
    } finally {
      setLoading(false);
    }
  };

  loadStatistics();
}, [period]);
if (loading || !stats) {
  return <div className="p-6">Loading statistics...</div>;
}
const { overview, revenueData, cancellationData, cancellationReasons, frequentCancellers, customerOverview } = stats;
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
<div className="text-2xl font-bold">${overview.totalRevenue.toLocaleString()}</div>            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
<span className={overview.revenueChange >= 0 ? "text-green-600" : "text-red-600"}>
  {overview.revenueChange >= 0 ? "+" : ""}{overview.revenueChange}%
</span> from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
<div className="text-2xl font-bold">{overview.totalBookings.toLocaleString()}</div>            <p className="text-xs text-muted-foreground flex items-center gap-1">
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
<div className="text-2xl font-bold">{overview.cancellations.toLocaleString()}</div>            <p className="text-xs text-muted-foreground flex items-center gap-1">
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
<div className="text-2xl font-bold">{overview.cancellationRate}%</div>            <p className="text-xs text-muted-foreground flex items-center gap-1">
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
              <div className="text-2xl font-bold">{customerOverview.totalCustomers}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Active</div>
              <div className="text-2xl font-bold text-green-600">
                {customerOverview.activeCustomers}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Blocked</div>
              <div className="text-2xl font-bold text-destructive">
               {customerOverview.blockedCustomers}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
