'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Cell,
} from 'recharts'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plane,
  Users,
  Calendar,
  RefreshCcw,
} from 'lucide-react'

import { getStatistics, type StatisticsResponse } from '@/lib/statistics-api'

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

type FlightPopularityItem = {
  flightId: string
  flightNumber: string
  route: string
  bookings: number
  revenue: number
  occupancyRate: number
}

type EmployeeStatisticsResponse = StatisticsResponse & {
  flightPopularity?: FlightPopularityItem[]
  activeFlights?: number
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n)
}

function formatPercent(value: number) {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value}%`
}

function ChangeText({ value }: { value: number }) {
  const isPositive = value >= 0

  return (
    <p className="text-xs text-muted-foreground flex items-center gap-1">
      {isPositive ? (
        <TrendingUp className="h-3 w-3 text-green-600" />
      ) : (
        <TrendingDown className="h-3 w-3 text-red-600" />
      )}
      <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
        {formatPercent(value)}
      </span>
      from last period
    </p>
  )
}

export default function EmployeeStatisticsPage() {
  const [timeRange, setTimeRange] = useState('6months')
  const [stats, setStats] = useState<EmployeeStatisticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadStatistics = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getStatistics(timeRange)

        if (!cancelled) {
          setStats(data as EmployeeStatisticsResponse)
        }
      } catch (err) {
        console.error('Load employee statistics failed:', err)

        if (!cancelled) {
          setStats(null)
          setError(err instanceof Error ? err.message : 'Failed to load statistics')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadStatistics()

    return () => {
      cancelled = true
    }
  }, [timeRange])

  const revenueData = stats?.revenueData ?? []
  const overview = stats?.overview

  const flightPopularity = useMemo(() => {
    return stats?.flightPopularity ?? []
  }, [stats])

  const totalRevenue = overview?.totalRevenue ?? 0
  const totalBookings = overview?.totalBookings ?? 0
  const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0
  const activeFlights = stats?.activeFlights ?? flightPopularity.length

  const pieData = flightPopularity.map((flight) => ({
    name: flight.flightNumber,
    value: flight.bookings,
    route: flight.route,
  }))

  const handleRetry = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getStatistics(timeRange)
      setStats(data as EmployeeStatisticsResponse)
    } catch (err) {
      console.error('Retry load employee statistics failed:', err)
      setStats(null)
      setError(err instanceof Error ? err.message : 'Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Statistics</h1>
          <p className="text-muted-foreground">Revenue and flight popularity analytics</p>
        </div>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Last Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <Card className="p-10 text-center border-dashed">
          <Plane className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-40" />
          <h3 className="text-lg font-semibold">Loading statistics...</h3>
          <p className="text-sm text-muted-foreground">Please wait while we fetch live data.</p>
        </Card>
      )}

      {!loading && error && (
        <Card className="p-10 text-center border-red-200 bg-red-50">
          <Plane className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <h3 className="mb-2 text-lg font-semibold text-red-700">Failed to load statistics</h3>
          <p className="mb-5 text-sm text-red-600">{error}</p>
          <Button onClick={() => void handleRetry()} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
        </Card>
      )}

      {!loading && !error && stats && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatVND(totalRevenue)} VND</div>
                <ChangeText value={overview?.revenueChange ?? 0} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalBookings.toLocaleString()}</div>
                <ChangeText value={overview?.bookingsChange ?? 0} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatVND(avgBookingValue)} VND</div>
                <p className="text-xs text-muted-foreground">Based on confirmed bookings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Flights</CardTitle>
                <Plane className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeFlights}</div>
                <p className="text-xs text-muted-foreground">Across all routes</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="revenue" className="space-y-4">
            <TabsList>
              <TabsTrigger value="revenue">Revenue Trend</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="popularity">Flight Popularity</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                  <CardDescription>Monthly revenue trend from backend data</CardDescription>
                </CardHeader>
                <CardContent>
                  {revenueData.length === 0 ? (
                    <div className="flex h-[400px] items-center justify-center text-sm text-muted-foreground">
                      No revenue data available.
                    </div>
                  ) : (
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="month" className="text-xs" />
                          <YAxis
                            className="text-xs"
                            tickFormatter={(v) => `${Number(v) / 1000}k`}
                          />
                          <Tooltip
                            formatter={(value: number) => [
                              `${formatVND(value)} VND`,
                              'Revenue',
                            ]}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--primary))' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle>Bookings Over Time</CardTitle>
                  <CardDescription>Monthly booking count from backend data</CardDescription>
                </CardHeader>
                <CardContent>
                  {revenueData.length === 0 ? (
                    <div className="flex h-[400px] items-center justify-center text-sm text-muted-foreground">
                      No booking data available.
                    </div>
                  ) : (
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="month" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip
                            formatter={(value: number) => [value, 'Bookings']}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="popularity">
              {flightPopularity.length === 0 ? (
                <Card className="p-10 text-center border-dashed">
                  <Plane className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-40" />
                  <h3 className="mb-2 text-lg font-semibold">No flight popularity data</h3>
                  <p className="text-sm text-muted-foreground">
                    Backend statistics API has not returned flightPopularity data yet.
                  </p>
                </Card>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Flight Booking Distribution</CardTitle>
                      <CardDescription>Bookings by flight route</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {pieData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number, _name, props) => [
                                `${value} bookings`,
                                props.payload.route,
                              ]}
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-4 flex flex-wrap justify-center gap-4">
                        {pieData.map((entry, index) => (
                          <div key={entry.name} className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm">{entry.name}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Flight Performance</CardTitle>
                      <CardDescription>Occupancy rates and revenue by route</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {flightPopularity.map((flight) => (
                          <div key={flight.flightId || flight.flightNumber} className="rounded-lg border p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <div>
                                <span className="font-medium">{flight.flightNumber}</span>
                                <span className="ml-2 text-sm text-muted-foreground">
                                  {flight.route}
                                </span>
                              </div>

                              <Badge
                                variant={flight.occupancyRate >= 70 ? 'default' : 'secondary'}
                                className={
                                  flight.occupancyRate >= 70
                                    ? 'bg-accent text-accent-foreground'
                                    : flight.occupancyRate < 50
                                      ? 'bg-destructive/20 text-destructive'
                                      : ''
                                }
                              >
                                {flight.occupancyRate}% occupancy
                              </Badge>
                            </div>

                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {flight.bookings} bookings
                              </span>
                              <span className="font-medium text-primary">
                                {formatVND(flight.revenue)} VND
                              </span>
                            </div>

                            <div className="mt-2 h-2 rounded-full bg-secondary">
                              <div
                                className={`h-2 rounded-full ${
                                  flight.occupancyRate >= 70
                                    ? 'bg-accent'
                                    : flight.occupancyRate < 50
                                      ? 'bg-destructive'
                                      : 'bg-primary'
                                }`}
                                style={{ width: `${flight.occupancyRate}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}