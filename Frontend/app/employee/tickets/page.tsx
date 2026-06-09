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
  Ticket,
} from 'lucide-react'

import {
  requestTicketCancellation,
  checkTicketCancellationRequested,
} from '@/lib/manage-tickets-api'
import { confirmTicketActionPayment, initiateTicketActionPayment } from '@/lib/payment-api'
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
  const [cancellationRequestedTicketIds, setCancellationRequestedTicketIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchBookingRef, setSearchBookingRef] = useState('')
  const [searchedRef, setSearchedRef] = useState('')

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

      try {
        const statuses = await Promise.all(
          data.map(async (t) => {
            try {
              const res = await checkTicketCancellationRequested(t.id)
              return { id: t.id, requested: res }
            } catch {
              return { id: t.id, requested: false }
            }
          })
        )
        const requestedIds = new Set(statuses.filter((s) => s.requested).map((s) => s.id))
        setCancellationRequestedTicketIds(requestedIds)
      } catch (err) {
        console.error('Failed to load ticket cancellation statuses:', err)
      }
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

        const payment = await initiateTicketActionPayment({
          actionType: 'upgrade',
          ticketId: selectedTicket.id,
          paymentMethod: 'card',
          amount: 0,
          newClass: upgradeTo,
          seatFee: 0,
        })

        await confirmTicketActionPayment({
          transactionCode: payment.transactionCode,
          paymentMethod: 'card',
        })
      }

      if (actionType === 'baggage') {
        const kg = Number(extraCheckedKg)

        if (!Number.isFinite(kg) || kg <= 0) {
          throw new Error('Please select extra checked baggage')
        }

        const payment = await initiateTicketActionPayment({
          actionType: 'baggage',
          ticketId: selectedTicket.id,
          paymentMethod: 'card',
          amount: kg * 40_000,
          extraCheckedKg: kg,
        })

        await confirmTicketActionPayment({
          transactionCode: payment.transactionCode,
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

  const bookingFilteredTickets = useMemo(() => {
    if (!searchedRef) return []
    const ref = searchedRef.trim().toLowerCase()
    return tickets.filter(t => t.bookingRef.toLowerCase() === ref)
  }, [tickets, searchedRef])

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
          <div className="grid gap-4 md:grid-cols-4">
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

            <div className="space-y-2">
              <Label>Mã đặt chỗ (Booking Ref)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="SL-BK-XXXXXX"
                  value={searchBookingRef}
                  onChange={(e) => setSearchBookingRef(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setSearchedRef(searchBookingRef.trim())}
                  className="font-mono uppercase h-10 text-xs"
                />
                {(searchedRef || searchBookingRef) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchBookingRef('')
                      setSearchedRef('')
                    }}
                    className="h-10 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>
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

      {/* Tickets Table or Cards */}
      {searchedRef ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  Kết quả tìm kiếm mã: <span className="font-mono text-[#0b5c66] font-bold uppercase">{searchedRef}</span>
                </CardTitle>
                <CardDescription>
                  Tìm thấy {bookingFilteredTickets.length} vé trong mã đặt chỗ này
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchBookingRef('')
                  setSearchedRef('')
                }}
              >
                Clear Tìm kiếm
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {bookingFilteredTickets.length === 0 ? (
              <div className="py-10 text-center border border-dashed rounded-xl bg-gray-50/50">
                <Plane className="mx-auto mb-2 h-8 w-8 text-muted-foreground animate-pulse" />
                <p className="text-muted-foreground text-sm font-medium">Không tìm thấy vé nào khớp với mã đặt chỗ này</p>
              </div>
            ) : (
              (() => {
                const { roundTickets, tickets: oneWay } = groupTicketsByPassenger(bookingFilteredTickets)
                return (
                  <div className="grid gap-4 md:grid-cols-2">
                    {roundTickets.map(group => (
                      <EmployeeRoundTripCard
                        key={`${group.ticket.id}-${group.returnTicket.id}`}
                        ticket={group.ticket}
                        returnTicket={group.returnTicket}
                        cancellationRequestedTicketIds={cancellationRequestedTicketIds}
                        handleViewDetails={handleViewDetails}
                        handleAction={handleAction}
                      />
                    ))}
                    {oneWay.map(ticket => (
                      <EmployeeTicketCard
                        key={ticket.id}
                        ticket={ticket}
                        cancellationRequestedTicketIds={cancellationRequestedTicketIds}
                        handleViewDetails={handleViewDetails}
                        handleAction={handleAction}
                      />
                    ))}
                  </div>
                )
              })()
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Tickets ({filteredTickets.length})</CardTitle>
            <CardDescription>Manage upgrades, baggage, and cancellations</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="py-10 text-center">
                <Plane className="mx-auto mb-3 h-8 w-8 text-muted-foreground animate-pulse" />
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
                            <div className="flex flex-col gap-1 items-start">
                              <Badge className={statusColors[ticket.status]}>
                                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                              </Badge>
                              {cancellationRequestedTicketIds.has(ticket.id) && (
                                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 text-[10px] whitespace-nowrap">
                                  Pending Cancel Request
                                </Badge>
                              )}
                            </div>
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

                              {ticket.status === 'confirmed' && !cancellationRequestedTicketIds.has(ticket.id) && (
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
      )}

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
                              +{kg} kg ({formatVND(kg * 40_000)} VND)
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

function groupTicketsByPassenger(tickets: EmployeeTicket[]) {
  const groups: Record<string, EmployeeTicket[]> = {}
  tickets.forEach(t => {
    const key = t.passengerName.trim().toUpperCase()
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  })

  const roundTickets: { ticket: EmployeeTicket; returnTicket: EmployeeTicket }[] = []
  const oneWayTickets: EmployeeTicket[] = []

  Object.values(groups).forEach(list => {
    list.sort((a, b) => {
      const dateA = new Date(`${a.flight.departure.date}T${a.flight.departure.time}`)
      const dateB = new Date(`${b.flight.departure.date}T${b.flight.departure.time}`)
      return dateA.getTime() - dateB.getTime()
    })

    if (list.length >= 2) {
      roundTickets.push({
        ticket: list[0],
        returnTicket: list[1]
      })
      for (let i = 2; i < list.length; i++) {
        oneWayTickets.push(list[i])
      }
    } else if (list.length === 1) {
      oneWayTickets.push(list[0])
    }
  })

  return { roundTickets, tickets: oneWayTickets }
}

function EmployeeTicketCard({
  ticket,
  cancellationRequestedTicketIds,
  handleViewDetails,
  handleAction,
}: {
  ticket: EmployeeTicket
  cancellationRequestedTicketIds: Set<string>
  handleViewDetails: (t: EmployeeTicket) => void
  handleAction: (t: EmployeeTicket, type: 'upgrade' | 'baggage' | 'cancel') => void
}) {
  const statusColors: Record<TicketStatus, string> = {
    confirmed: 'bg-accent text-accent-foreground border-accent-foreground/10',
    pending: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
    cancelled: 'bg-destructive/20 text-destructive border-destructive/30',
    completed: 'bg-muted text-muted-foreground border-muted/30',
  }

  const classColors: Record<TicketClass, string> = {
    economy: 'bg-[#0b5c66] text-white',
    business: 'bg-[#5a8fa3] text-white',
    firstClass: 'bg-[#dfad36] text-gray-900',
  }

  const classLabels: Record<TicketClass, string> = {
    economy: 'Economy',
    business: 'Business',
    firstClass: 'First Class',
  }

  const isPendingCancel = cancellationRequestedTicketIds.has(ticket.id)
  const classOrder: TicketClass[] = ['economy', 'business', 'firstClass']
  const getUpgradeOptions = (currentClass: TicketClass) => {
    const currentIndex = classOrder.indexOf(currentClass)
    return classOrder.slice(currentIndex + 1)
  }
  const upgradeOptions = getUpgradeOptions(ticket.ticketClass)

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200">
      <div className={`h-1.5 w-full ${classColors[ticket.ticketClass]?.split(' ')[0]}`} />
      <CardHeader className="pb-3 border-b bg-gray-50/60 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${classColors[ticket.ticketClass]}`}>
              <Plane className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">{ticket.flight.flightNumber}</CardTitle>
              <CardDescription className="text-xs">{ticket.flight.airline}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${statusColors[ticket.status]} border text-xs font-semibold`}>
              {ticket.status.toUpperCase()}
            </Badge>
            {isPendingCancel && (
              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 text-[10px]">
                Pending Cancel Request
              </Badge>
            )}
            <Badge className={`${classColors[ticket.ticketClass]} border-0 text-xs font-semibold`}>
              {classLabels[ticket.ticketClass]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center py-2">
          <div>
            <div className="text-2xl font-light text-[#0b5c66]">{ticket.flight.departure.code}</div>
            <div className="text-sm font-semibold mt-0.5">{ticket.flight.departure.time}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{ticket.flight.departure.city}</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs text-gray-500 font-medium">{ticket.flight.duration}</span>
            <div className="mt-1 flex items-center gap-1">
              <div className="h-px w-6 bg-gray-300" />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <div className="h-px w-6 bg-gray-300" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-light text-[#0b5c66]">{ticket.flight.arrival.code}</div>
            <div className="text-sm font-semibold mt-0.5">{ticket.flight.arrival.time}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{ticket.flight.arrival.city}</div>
          </div>
        </div>

        <div className="grid gap-3 rounded-lg bg-[#f0f8fb] border border-[#dce8f4] p-3 grid-cols-2 lg:grid-cols-4 text-xs">
          <div>
            <div className="text-gray-400 mb-0.5">Booking Ref</div>
            <div className="font-mono font-bold text-[#0b5c66]">{ticket.bookingRef}</div>
          </div>
          <div>
            <div className="text-gray-400 mb-0.5">Passenger</div>
            <div className="font-semibold truncate">{ticket.passengerName}</div>
          </div>
          <div>
            <div className="text-gray-400 mb-0.5">Seat</div>
            <div className="font-bold">{ticket.seatNumber || '—'}</div>
          </div>
          <div>
            <div className="text-gray-400 mb-0.5">Booked On</div>
            <div className="font-medium">{ticket.bookedAt || '—'}</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
          <div>
            <span>Cabin: {ticket.baggage.cabin} bag(s)</span>
            <span className="mx-2">·</span>
            <span>Checked: {ticket.baggage.checked} bag(s)</span>
          </div>
          <div className="font-bold text-gray-800 text-sm">{formatVND(ticket.price)} VND</div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={() => handleViewDetails(ticket)} className="h-8 gap-1.5 text-xs">
            <Eye className="h-3.5 w-3.5" /> Chi tiết
          </Button>
          {ticket.status === 'confirmed' && !isPendingCancel && (
            <>
              {upgradeOptions.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => handleAction(ticket, 'upgrade')} className="h-8 gap-1.5 text-xs text-primary border-primary/20 hover:bg-primary/5">
                  <ArrowUpCircle className="h-3.5 w-3.5" /> Nâng hạng
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => handleAction(ticket, 'baggage')} className="h-8 gap-1.5 text-xs text-primary border-primary/20 hover:bg-primary/5">
                <Luggage className="h-3.5 w-3.5" /> Thêm hành lý
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleAction(ticket, 'cancel')} className="h-8 gap-1.5 text-xs text-destructive border-destructive/20 hover:bg-destructive/5">
                <XCircle className="h-3.5 w-3.5" /> Hủy vé
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function EmployeeRoundTripCard({
  ticket,
  returnTicket,
  cancellationRequestedTicketIds,
  handleViewDetails,
  handleAction,
}: {
  ticket: EmployeeTicket
  returnTicket: EmployeeTicket
  cancellationRequestedTicketIds: Set<string>
  handleViewDetails: (t: EmployeeTicket) => void
  handleAction: (t: EmployeeTicket, type: 'upgrade' | 'baggage' | 'cancel') => void
}) {
  const classColors: Record<TicketClass, string> = {
    economy: 'bg-[#0b5c66] text-white',
    business: 'bg-[#5a8fa3] text-white',
    firstClass: 'bg-[#dfad36] text-gray-900',
  }

  const isPendingCancelOut = cancellationRequestedTicketIds.has(ticket.id)
  const isPendingCancelRet = cancellationRequestedTicketIds.has(returnTicket.id)

  const classOrder: TicketClass[] = ['economy', 'business', 'firstClass']
  const getUpgradeOptions = (currentClass: TicketClass) => {
    const currentIndex = classOrder.indexOf(currentClass)
    return classOrder.slice(currentIndex + 1)
  }

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200 col-span-1 md:col-span-2">
      <div className={`h-1.5 w-full ${classColors[ticket.ticketClass]?.split(' ')[0]}`} />
      <CardContent className="p-4 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-[#0b5c66] rotate-45" />
              <span className="font-bold text-sm text-gray-800">Chuyến đi (Outbound) - {ticket.flight.flightNumber}</span>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-accent text-accent-foreground text-xs">{ticket.status.toUpperCase()}</Badge>
              {isPendingCancelOut && (
                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 text-[10px]">
                  Pending Cancel
                </Badge>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center py-1">
            <div>
              <div className="text-xl font-light text-[#0b5c66]">{ticket.flight.departure.code}</div>
              <div className="text-xs font-semibold mt-0.5">{ticket.flight.departure.time}</div>
              <div className="text-[10px] text-muted-foreground">{ticket.flight.departure.city}</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-gray-500">{ticket.flight.duration}</span>
              <div className="h-px w-8 bg-gray-300 my-1" />
            </div>
            <div>
              <div className="text-xl font-light text-[#0b5c66]">{ticket.flight.arrival.code}</div>
              <div className="text-xs font-semibold mt-0.5">{ticket.flight.arrival.time}</div>
              <div className="text-[10px] text-muted-foreground">{ticket.flight.arrival.city}</div>
            </div>
          </div>
          <div className="grid gap-2 rounded-lg bg-[#f0f8fb] border border-[#dce8f4] p-3 grid-cols-2 lg:grid-cols-4 text-xs">
            <div>
              <div className="text-gray-400">Mã vé đi</div>
              <div className="font-mono font-bold text-[#0b5c66]">{ticket.id}</div>
            </div>
            <div>
              <div className="text-gray-400">Passenger</div>
              <div className="font-semibold">{ticket.passengerName}</div>
            </div>
            <div>
              <div className="text-gray-400">Ghế đi</div>
              <div className="font-bold">{ticket.seatNumber || '—'}</div>
            </div>
            <div>
              <div className="text-gray-400">Hành lý</div>
              <div className="text-[10px]">C: {ticket.baggage.cabin}, CK: {ticket.baggage.checked}</div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(ticket)} className="h-7 text-xs px-2">
              Chi tiết đi
            </Button>
            {ticket.status === 'confirmed' && !isPendingCancelOut && (
              <>
                {getUpgradeOptions(ticket.ticketClass).length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => handleAction(ticket, 'upgrade')} className="h-7 text-xs px-2 text-primary border-primary/10">
                    Nâng hạng
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => handleAction(ticket, 'baggage')} className="h-7 text-xs px-2 text-primary border-primary/10">
                  Thêm hành lý
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAction(ticket, 'cancel')} className="h-7 text-xs px-2 text-destructive border-destructive/10">
                  Hủy vé
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-dashed" />

        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-[#0b5c66] rotate-[225deg]" />
              <span className="font-bold text-sm text-gray-800">Chuyến về (Return) - {returnTicket.flight.flightNumber}</span>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-accent text-accent-foreground text-xs">{returnTicket.status.toUpperCase()}</Badge>
              {isPendingCancelRet && (
                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 text-[10px]">
                  Pending Cancel
                </Badge>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center py-1">
            <div>
              <div className="text-xl font-light text-[#0b5c66]">{returnTicket.flight.departure.code}</div>
              <div className="text-xs font-semibold mt-0.5">{returnTicket.flight.departure.time}</div>
              <div className="text-[10px] text-muted-foreground">{returnTicket.flight.departure.city}</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-gray-500">{returnTicket.flight.duration}</span>
              <div className="h-px w-8 bg-gray-300 my-1" />
            </div>
            <div>
              <div className="text-xl font-light text-[#0b5c66]">{returnTicket.flight.arrival.code}</div>
              <div className="text-xs font-semibold mt-0.5">{returnTicket.flight.arrival.time}</div>
              <div className="text-[10px] text-muted-foreground">{returnTicket.flight.arrival.city}</div>
            </div>
          </div>
          <div className="grid gap-2 rounded-lg bg-[#f0f8fb] border border-[#dce8f4] p-3 grid-cols-2 lg:grid-cols-4 text-xs">
            <div>
              <div className="text-gray-400">Mã vé về</div>
              <div className="font-mono font-bold text-[#0b5c66]">{returnTicket.id}</div>
            </div>
            <div>
              <div className="text-gray-400">Passenger</div>
              <div className="font-semibold">{returnTicket.passengerName}</div>
            </div>
            <div>
              <div className="text-gray-400">Ghế về</div>
              <div className="font-bold">{returnTicket.seatNumber || '—'}</div>
            </div>
            <div>
              <div className="text-gray-400">Hành lý</div>
              <div className="text-[10px]">C: {returnTicket.baggage.cabin}, CK: {returnTicket.baggage.checked}</div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(returnTicket)} className="h-7 text-xs px-2">
              Chi tiết về
            </Button>
            {returnTicket.status === 'confirmed' && !isPendingCancelRet && (
              <>
                {getUpgradeOptions(returnTicket.ticketClass).length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => handleAction(returnTicket, 'upgrade')} className="h-7 text-xs px-2 text-primary border-primary/10">
                    Nâng hạng
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => handleAction(returnTicket, 'baggage')} className="h-7 text-xs px-2 text-primary border-primary/10">
                  Thêm hành lý
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAction(returnTicket, 'cancel')} className="h-7 text-xs px-2 text-destructive border-destructive/10">
                  Hủy vé
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span className="font-semibold text-gray-800">Tổng tiền khứ hồi:</span>
          <span className="font-bold text-primary text-sm">{formatVND(ticket.price + returnTicket.price)} VND</span>
        </div>
      </CardContent>
    </Card>
  )
}
