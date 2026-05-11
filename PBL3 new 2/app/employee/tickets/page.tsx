'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plane,
  Search,
  ArrowUpCircle,
  Luggage,
  XCircle,
  Filter,
  Eye,
  RefreshCcw,
} from 'lucide-react'

import {
  addTicketBaggage,
  requestTicketCancellation,
  requestTicketUpgrade,
} from '@/lib/manage-tickets-api'
import type { Flight, TicketClass, TicketStatus } from '@/lib/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''
const TICKETS_ENDPOINT = '/api/tickets'

type EmployeeTicket = {
  id: string
  bookingRef: string
  passengerName: string
  passengerEmail?: string
  flightId: string
  flight: Flight
  ticketClass: TicketClass
  seatNumber?: string
  price: number
  baggage: {
    cabin: number
    checked: number
  }
  status: TicketStatus
  bookedAt: string
}

const statusColors: Record<TicketStatus, string> = {
  confirmed: 'bg-accent text-accent-foreground',
  pending: 'bg-yellow-500/20 text-yellow-700',
  cancelled: 'bg-destructive/20 text-destructive',
  completed: 'bg-muted text-muted-foreground',
}

const classLabels: Record<TicketClass, string> = {
  economy: 'Economy',
  business: 'Business',
  firstClass: 'First Class',
}

const classOrder: TicketClass[] = ['economy', 'business', 'firstClass']

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readString(value: unknown, fallback = '') {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return fallback
}

function readNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

function readTicketStatus(value: unknown): TicketStatus {
  const status = readString(value).toLowerCase()

  if (
    status === 'confirmed' ||
    status === 'pending' ||
    status === 'cancelled' ||
    status === 'completed'
  ) {
    return status
  }

  return 'pending'
}

function readTicketClass(value: unknown): TicketClass {
  const ticketClass = readString(value)

  if (ticketClass === 'economy' || ticketClass === 'business' || ticketClass === 'firstClass') {
    return ticketClass
  }

  return 'economy'
}

function unwrapTicketList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload

  if (!isRecord(payload)) return []

  const directKeys = ['data', 'items', 'tickets', 'result', 'results']

  for (const key of directKeys) {
    const value = payload[key]

    if (Array.isArray(value)) return value

    if (isRecord(value)) {
      if (Array.isArray(value.items)) return value.items
      if (Array.isArray(value.data)) return value.data
      if (Array.isArray(value.tickets)) return value.tickets
    }
  }

  return []
}

function mapTicket(item: unknown): EmployeeTicket {
  const raw = isRecord(item) ? item : {}

  const rawFlight = isRecord(raw.flight) ? raw.flight : {}
  const rawDeparture = isRecord(rawFlight.departure) ? rawFlight.departure : {}
  const rawArrival = isRecord(rawFlight.arrival) ? rawFlight.arrival : {}

  const flightId = readString(raw.flightId ?? rawFlight.id ?? raw.flightID ?? rawFlight.flightId)

  const flight: Flight = {
    id: readString(rawFlight.id ?? flightId),
    flightNumber: readString(rawFlight.flightNumber ?? raw.flightNumber, '—'),
    airline: readString(rawFlight.airline ?? raw.airline, '—'),
    departure: {
      city: readString(rawDeparture.city ?? rawFlight.departureCity ?? raw.departureCity, '—'),
      airport: readString(
        rawDeparture.airport ?? rawFlight.departureAirport ?? raw.departureAirport,
        readString(rawDeparture.city ?? rawFlight.departureCity ?? raw.departureCity, '—'),
      ),
      code: readString(rawDeparture.code ?? rawFlight.departureCode ?? raw.departureCode, '—'),
      time: readString(rawDeparture.time ?? rawFlight.departureTime ?? raw.departureTime, '—'),
      date: readString(rawDeparture.date ?? rawFlight.departureDate ?? raw.departureDate, ''),
    },
    arrival: {
      city: readString(rawArrival.city ?? rawFlight.arrivalCity ?? raw.arrivalCity, '—'),
      airport: readString(
        rawArrival.airport ?? rawFlight.arrivalAirport ?? raw.arrivalAirport,
        readString(rawArrival.city ?? rawFlight.arrivalCity ?? raw.arrivalCity, '—'),
      ),
      code: readString(rawArrival.code ?? rawFlight.arrivalCode ?? raw.arrivalCode, '—'),
      time: readString(rawArrival.time ?? rawFlight.arrivalTime ?? raw.arrivalTime, '—'),
      date: readString(rawArrival.date ?? rawFlight.arrivalDate ?? raw.arrivalDate, ''),
    },
    duration: readString(rawFlight.duration ?? raw.duration, '—'),
    price: {
      economy: 0,
      business: 0,
      firstClass: 0,
    },
    seatsAvailable: {
      economy: 0,
      business: 0,
      firstClass: 0,
    },
    status: 'scheduled',
  }

  const rawBaggage = isRecord(raw.baggage) ? raw.baggage : {}

  return {
    id: readString(raw.id ?? raw.ticketId ?? raw.ticketID),
    bookingRef: readString(raw.bookingRef ?? raw.bookingReference ?? raw.code, '—'),
    passengerName: readString(raw.passengerName ?? raw.customerName ?? raw.fullName, '—'),
    passengerEmail: readString(raw.passengerEmail ?? raw.customerEmail ?? raw.email),
    flightId,
    flight,
    ticketClass: readTicketClass(raw.ticketClass ?? raw.class),
    seatNumber: readString(raw.seatNumber ?? raw.seatNo),
    price: readNumber(raw.price ?? raw.totalPrice ?? raw.amount),
    baggage: {
      cabin: readNumber(rawBaggage.cabin ?? raw.cabinBaggage, 0),
      checked: readNumber(rawBaggage.checked ?? raw.checkedBaggage ?? raw.checkedBags, 0),
    },
    status: readTicketStatus(raw.status),
    bookedAt: readString(raw.bookedAt ?? raw.createdAt ?? raw.bookingDate, ''),
  }
}

async function getAllTickets() {
  const res = await fetch(`${API_BASE_URL}${TICKETS_ENDPOINT}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to load tickets')
  }

  const payload = await res.json()
  return unwrapTicketList(payload).map(mapTicket)
}

function getUpgradeOptions(currentClass: TicketClass) {
  const currentIndex = classOrder.indexOf(currentClass)
  return classOrder.slice(currentIndex + 1)
}

function getDefaultUpgradeClass(currentClass: TicketClass): TicketClass {
  const options = getUpgradeOptions(currentClass)
  return options[0] ?? currentClass
}

export default function EmployeeTicketsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [tickets, setTickets] = useState<EmployeeTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedTicket, setSelectedTicket] = useState<EmployeeTicket | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [actionType, setActionType] = useState<'upgrade' | 'baggage' | 'cancel' | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  const [upgradeTo, setUpgradeTo] = useState<TicketClass>('business')
  const [extraCheckedKg, setExtraCheckedKg] = useState('0')
  const [cancelReason, setCancelReason] = useState('Customer requested cancellation')

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getAllTickets()
      setTickets(data)
    } catch (err) {
      console.error('Load tickets failed:', err)
      setTickets([])
      setError(err instanceof Error ? err.message : 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTickets()
  }, [loadTickets])

  const filteredTickets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return tickets.filter((ticket) => {
      const matchesSearch =
        !q ||
        ticket.bookingRef.toLowerCase().includes(q) ||
        ticket.passengerName.toLowerCase().includes(q) ||
        (ticket.passengerEmail ?? '').toLowerCase().includes(q)

      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [tickets, searchQuery, statusFilter])

  const handleAction = (ticket: EmployeeTicket, type: 'upgrade' | 'baggage' | 'cancel') => {
    setSelectedTicket(ticket)
    setActionType(type)
    setActionError('')

    if (type === 'upgrade') {
      setUpgradeTo(getDefaultUpgradeClass(ticket.ticketClass))
    }

    if (type === 'baggage') {
      setExtraCheckedKg('0')
    }

    if (type === 'cancel') {
      setCancelReason('Customer requested cancellation')
    }

    setShowActionDialog(true)
  }

  const handleViewDetails = (ticket: EmployeeTicket) => {
    setSelectedTicket(ticket)
    setShowDetailsDialog(true)
  }

  const closeActionDialog = () => {
    if (actionLoading) return

    setShowActionDialog(false)
    setSelectedTicket(null)
    setActionType(null)
    setActionError('')
  }

  const executeAction = async () => {
    if (!selectedTicket || !actionType) return

    try {
      setActionLoading(true)
      setActionError('')

      if (actionType === 'upgrade') {
        const upgradeOptions = getUpgradeOptions(selectedTicket.ticketClass)

        if (upgradeOptions.length === 0) {
          throw new Error('This ticket is already in the highest class')
        }

        await requestTicketUpgrade({
          ticketId: selectedTicket.id,
          newClass: upgradeTo,
          seatFee: 0,
          upgradeFee: 0,
          paymentMethod: 'card',
        })
      }

      if (actionType === 'baggage') {
        const kg = Number(extraCheckedKg)

        if (!Number.isFinite(kg) || kg <= 0) {
          throw new Error('Please select extra checked baggage')
        }

        await addTicketBaggage({
          ticketId: selectedTicket.id,
          extraCheckedKg: kg,
          amount: kg * 30_000,
          paymentMethod: 'card',
        })
      }

      if (actionType === 'cancel') {
        if (!cancelReason.trim()) {
          throw new Error('Please enter cancellation reason')
        }

        await requestTicketCancellation({
          ticketId: selectedTicket.id,
          reason: cancelReason.trim(),
        })
      }

      await loadTickets()
      closeActionDialog()
    } catch (err) {
      console.error('Ticket action failed:', err)
      setActionError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Tickets</h1>
        <p className="text-muted-foreground">View and manage all customer tickets</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by ref, name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as TicketStatus | 'all')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => void loadTickets()}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tickets ({filteredTickets.length})</CardTitle>
          <CardDescription>Manage upgrades, baggage, and cancellations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="py-10 text-center">
              <Plane className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">Loading tickets...</p>
            </div>
          )}

          {!loading && error && (
            <div className="py-10 text-center">
              <Plane className="mx-auto mb-3 h-8 w-8 text-destructive" />
              <p className="mb-4 font-medium text-destructive">{error}</p>
              <Button onClick={() => void loadTickets()} className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking Ref</TableHead>
                    <TableHead>Passenger</TableHead>
                    <TableHead>Flight</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Booked At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center">
                        <Plane className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No tickets found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTickets.map((ticket) => {
                      const upgradeOptions = getUpgradeOptions(ticket.ticketClass)

                      return (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-mono font-medium">
                            {ticket.bookingRef}
                          </TableCell>

                          <TableCell>
                            <div>{ticket.passengerName}</div>
                            <div className="text-xs text-muted-foreground">
                              {ticket.passengerEmail || '—'}
                            </div>
                          </TableCell>

                          <TableCell>{ticket.flight.flightNumber}</TableCell>

                          <TableCell>
                            {ticket.flight.departure.code} - {ticket.flight.arrival.code}
                          </TableCell>

                          <TableCell>{classLabels[ticket.ticketClass]}</TableCell>

                          <TableCell className="whitespace-nowrap text-sm text-gray-500">
                            {ticket.bookedAt || '—'}
                          </TableCell>

                          <TableCell>
                            <Badge className={statusColors[ticket.status]}>
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetails(ticket)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              {ticket.status === 'confirmed' && (
                                <>
                                  {upgradeOptions.length > 0 && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleAction(ticket, 'upgrade')}
                                      title="Upgrade"
                                    >
                                      <ArrowUpCircle className="h-4 w-4 text-primary" />
                                    </Button>
                                  )}

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleAction(ticket, 'baggage')}
                                    title="Add Baggage"
                                  >
                                    <Luggage className="h-4 w-4 text-primary" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleAction(ticket, 'cancel')}
                                    title="Cancel"
                                  >
                                    <XCircle className="h-4 w-4 text-destructive" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle>Ticket Details</DialogTitle>
                <DialogDescription>Booking Ref: {selectedTicket.bookingRef}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Passenger</div>
                    <div className="font-medium">{selectedTicket.passengerName}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium">{selectedTicket.passengerEmail || '—'}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Flight</div>
                    <div className="font-medium">{selectedTicket.flight.flightNumber}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Route</div>
                    <div className="font-medium">
                      {selectedTicket.flight.departure.city} to {selectedTicket.flight.arrival.city}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-medium">{selectedTicket.flight.departure.date || '—'}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Time</div>
                    <div className="font-medium">{selectedTicket.flight.departure.time}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Class</div>
                    <div className="font-medium">{classLabels[selectedTicket.ticketClass]}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Seat</div>
                    <div className="font-medium">{selectedTicket.seatNumber || '—'}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Baggage</div>
                    <div className="font-medium">
                      Cabin: {selectedTicket.baggage.cabin}, Checked: {selectedTicket.baggage.checked}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Price Paid</div>
                    <div className="font-medium text-primary">
                      {formatVND(selectedTicket.price)} VND
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={closeActionDialog}>
        <DialogContent>
          {selectedTicket && actionType && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {actionType === 'upgrade' && 'Upgrade Ticket'}
                  {actionType === 'baggage' && 'Add Baggage'}
                  {actionType === 'cancel' && 'Cancel Ticket'}
                </DialogTitle>
                <DialogDescription>
                  Ticket: {selectedTicket.bookingRef} - {selectedTicket.passengerName}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                {actionError && (
                  <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {actionError}
                  </div>
                )}

                {actionType === 'upgrade' && (
                  <div className="space-y-4">
                    <p>Current class: {classLabels[selectedTicket.ticketClass]}</p>

                    <div className="space-y-2">
                      <Label>Upgrade to</Label>
                      <Select
                        value={upgradeTo}
                        onValueChange={(value) => setUpgradeTo(value as TicketClass)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getUpgradeOptions(selectedTicket.ticketClass).map((ticketClass) => (
                            <SelectItem key={ticketClass} value={ticketClass}>
                              {classLabels[ticketClass]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      The final upgrade fee will be calculated by the backend if configured.
                    </p>
                  </div>
                )}

                {actionType === 'baggage' && (
                  <div className="space-y-4">
                    <p>
                      Current: {selectedTicket.baggage.cabin} cabin,{' '}
                      {selectedTicket.baggage.checked} checked
                    </p>

                    <div className="space-y-2">
                      <Label>Add Checked Baggage</Label>
                      <Select value={extraCheckedKg} onValueChange={setExtraCheckedKg}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 5, 10, 15, 20, 25, 30].map((kg) => (
                            <SelectItem key={kg} value={kg.toString()}>
                              +{kg} kg ({formatVND(kg * 30_000)} VND)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {actionType === 'cancel' && (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-destructive/10 p-4">
                      <p className="font-medium text-destructive">
                        This will submit a cancellation request for this ticket.
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        The request may require manager approval depending on backend rules.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Cancellation reason</Label>
                      <Input
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Enter cancellation reason..."
                      />
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeActionDialog} disabled={actionLoading}>
                  Close
                </Button>

                <Button
                  variant={actionType === 'cancel' ? 'destructive' : 'default'}
                  onClick={() => void executeAction()}
                  disabled={actionLoading}
                >
                  {actionLoading && 'Processing...'}
                  {!actionLoading && actionType === 'upgrade' && 'Confirm Upgrade'}
                  {!actionLoading && actionType === 'baggage' && 'Add Baggage'}
                  {!actionLoading && actionType === 'cancel' && 'Submit Cancellation'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}