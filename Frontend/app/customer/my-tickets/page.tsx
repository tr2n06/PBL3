'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plane,
  Clock,
  ArrowRight,
  Calendar,
  MapPin,
  QrCode,
  Download,
  Ticket,
} from 'lucide-react'

import { getMyTickets, type CustomerTicket, type MyTicketsResponse } from '@/lib/tickets-api'

// ─── Config ──────────────────────────────────────────────────────────────────
const CLASS_LABELS: Record<string, string> = {
  economy: 'Economy',
  business: 'Premium Economy',
  firstClass: 'Business',
}

const CLASS_COLORS: Record<string, string> = {
  economy: 'bg-[#0b5c66] text-white',
  business: 'bg-[#5a8fa3] text-white',
  firstClass: 'bg-[#dfad36] text-gray-900',
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  confirmed: {
    label: 'Confirmed',
    color: 'bg-[#dce8f4] text-[#1a3557] border-[#c3d4e8]',
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-600 border-red-200',
  },
  completed: {
    label: 'Completed',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
  },
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n)
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MyTicketsPage() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [response, setResponse] = useState<MyTicketsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchBookingRef, setSearchBookingRef] = useState('')
  const [searchedRef, setSearchedRef] = useState('')

  const refreshTickets = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getMyTickets()
      setResponse(data)
    } catch (err) {
      console.error('Load my tickets failed:', err)
      setResponse(null)
      setError(err instanceof Error ? err.message : 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshTickets()

    const handleFocus = () => {
      void refreshTickets()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refreshTickets])

  const unifiedItems: UnifiedTicketListItem[] = []
  if (response) {
    response.tickets.forEach(t => {
      unifiedItems.push({
        type: 'oneway',
        ticket: t,
        bookedAtDate: new Date(t.bookedAt)
      })
    })
    response.roundTickets.forEach(group => {
      unifiedItems.push({
        type: 'roundtrip',
        ticket: group.ticket,
        returnTicket: group.returnTicket,
        bookedAtDate: new Date(group.ticket.bookedAt)
      })
    })
  }

  // Sort descending by bookedAt date
  unifiedItems.sort((a, b) => b.bookedAtDate.getTime() - a.bookedAtDate.getTime())

  const isItemExpired = (item: UnifiedTicketListItem) => {
    if (item.type === 'oneway') {
      return isTicketExpired(item.ticket) || item.ticket.status === 'completed' || item.ticket.status === 'cancelled'
    } else {
      const retExpired = isTicketExpired(item.returnTicket)
      const bothDone = (item.ticket.status === 'completed' || item.ticket.status === 'cancelled') &&
        (item.returnTicket.status === 'completed' || item.returnTicket.status === 'cancelled')
      return retExpired || bothDone
    }
  }

  const matchesSearch = (item: UnifiedTicketListItem) => {
    if (!searchedRef) return true
    const q = searchedRef.toLowerCase()
    const matchesOut = item.ticket.bookingRef.toLowerCase() === q
    const matchesRet = item.type === 'roundtrip' && item.returnTicket.bookingRef.toLowerCase() === q
    return matchesOut || matchesRet
  }

  const upcoming = unifiedItems.filter(item => !isItemExpired(item) && matchesSearch(item))
  const past = unifiedItems.filter(item => isItemExpired(item) && matchesSearch(item))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Ticket className="w-8 h-8 text-[#0b5c66]" />
            My Tickets
          </h1>
          <p className="text-muted-foreground mt-1">Manage all your booked flights</p>
        </div>

        <Button asChild className="bg-[#0b5c66] hover:bg-[#094a52] gap-2">
          <Link href="/customer/booking">
            <Plane className="w-4 h-4" /> Book a Flight
          </Link>
        </Button>
      </div>

      {/* Search booking ref */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50/50">
          <div className="flex-1 relative">
            <Ticket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Nhập mã đặt chỗ (Booking Ref)..."
              value={searchBookingRef}
              onChange={(e) => setSearchBookingRef(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setSearchedRef(searchBookingRef.trim())}
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b5c66]/20 bg-white"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setSearchedRef(searchBookingRef.trim())}
              className="bg-[#0b5c66] hover:bg-[#094a52] h-10"
            >
              Tìm kiếm
            </Button>
            {(searchedRef || searchBookingRef) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchBookingRef('')
                  setSearchedRef('')
                }}
                className="h-10"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card className="p-12 text-center border-dashed">
          <Plane className="mx-auto mb-4 h-14 w-14 text-muted-foreground opacity-30" />
          <h3 className="mb-2 text-lg font-semibold text-gray-700">Loading your tickets...</h3>
          <p className="text-muted-foreground text-sm">Please wait while we fetch your bookings.</p>
        </Card>
      )}

      {!loading && error && (
        <Card className="p-12 text-center border-red-200 bg-red-50">
          <Plane className="mx-auto mb-4 h-14 w-14 text-red-400 opacity-70" />
          <h3 className="mb-2 text-lg font-semibold text-red-700">Failed to load tickets</h3>
          <p className="mb-6 text-sm text-red-600">{error}</p>
          <Button onClick={() => void refreshTickets()} className="bg-[#0b5c66] hover:bg-[#094a52]">
            Try Again
          </Button>
        </Card>
      )}

      {!loading && !error && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-12 rounded-xl bg-slate-100 p-1 gap-1">
            <TabsTrigger value="upcoming" className="rounded-lg px-6 font-medium">
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg px-6 font-medium">
              Past ({past.length})
            </TabsTrigger>
          </TabsList>

          {/* Upcoming */}
          <TabsContent value="upcoming" className="mt-6 space-y-4">
            {upcoming.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <Plane className="mx-auto mb-4 h-14 w-14 text-muted-foreground opacity-30" />
                <h3 className="mb-2 text-lg font-semibold text-gray-700">No upcoming flights</h3>
                <p className="mb-6 text-muted-foreground text-sm">Start your next adventure today!</p>
                <Button asChild className="bg-[#0b5c66] hover:bg-[#094a52]">
                  <Link href="/customer/booking">Book Now</Link>
                </Button>
              </Card>
            ) : (
              upcoming.map(item => (
                <TicketListItemCard key={item.type === 'oneway' ? item.ticket.id : `${item.ticket.id}-${item.returnTicket.id}`} item={item} />
              ))
            )}
          </TabsContent>

          {/* Past */}
          <TabsContent value="past" className="mt-6 space-y-4">
            {past.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <Plane className="mx-auto mb-4 h-14 w-14 text-muted-foreground opacity-30" />
                <h3 className="mb-2 text-lg font-semibold text-gray-700">No past flights</h3>
                <p className="text-muted-foreground text-sm">Your completed flights will appear here.</p>
              </Card>
            ) : (
              past.map(item => (
                <TicketListItemCard key={item.type === 'oneway' ? item.ticket.id : `${item.ticket.id}-${item.returnTicket.id}`} item={item} />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

// ─── Ticket Card ──────────────────────────────────────────────────────────────
function isTicketExpired(t: CustomerTicket) {
  if (!t.flight?.departure?.date || !t.flight?.departure?.time) return false
  const departureDate = new Date(`${t.flight.departure.date}T${t.flight.departure.time}`)
  return departureDate < new Date()
}

function TicketCard({ ticket }: { ticket: CustomerTicket }) {
  const isExpired = isTicketExpired(ticket)
  const statusInfo = STATUS_CONFIG[ticket.status] ?? {
    label: ticket.status,
    color: 'bg-gray-100 text-gray-600',
  }

  const classCfg = CLASS_COLORS[ticket.ticketClass] ?? 'bg-gray-200 text-gray-700'
  const isPending = ticket.status === 'pending'
  const statusLabel = isExpired ? 'Expired' : statusInfo.label
  const statusColor = isExpired ? 'bg-amber-100 text-amber-800 border-amber-200' : statusInfo.color

  return (
    <Card className={`overflow-hidden shadow-sm hover:shadow-md transition-shadow border ${isPending ? 'border-red-500 ring-2 ring-red-100' : isExpired ? 'border-amber-500 ring-2 ring-amber-50' : 'border-gray-200'}`}>
      {/* Color-coded top bar */}
      <div className={`h-1.5 w-full ${classCfg.split(' ')[0]}`} />

      <CardHeader className="pb-3 border-b bg-gray-50/60">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-full ${classCfg}`}>
              <Plane className="h-5 w-5" />
            </div>

            <div>
              <CardTitle className="text-lg">{ticket.flight.flightNumber}</CardTitle>
              <CardDescription className="text-xs">{ticket.flight.airline}</CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${statusColor} border text-xs font-semibold`}>
              {statusLabel}
            </Badge>
            <Badge className={`${classCfg} border-0 text-xs font-semibold`}>
              {CLASS_LABELS[ticket.ticketClass] ?? ticket.ticketClass}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Route */}
        <div className="mb-5 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-light text-[#0b5c66]">
              {ticket.flight.departure.code}
            </div>
            <div className="text-base font-semibold mt-0.5">
              {ticket.flight.departure.time}
            </div>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              {ticket.flight.departure.city}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <Clock className="mb-1 h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-gray-600">{ticket.flight.duration}</span>
            <div className="mt-2 flex items-center gap-1">
              <div className="h-px w-8 bg-gray-300" />
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <div className="h-px w-8 bg-gray-300" />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Direct</p>
          </div>

          <div>
            <div className="text-3xl font-light text-[#0b5c66]">
              {ticket.flight.arrival.code}
            </div>
            <div className="text-base font-semibold mt-0.5">
              {ticket.flight.arrival.time}
            </div>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              {ticket.flight.arrival.city}
            </div>
          </div>
        </div>

        {/* Ticket details */}
        <div className="grid gap-3 rounded-xl bg-[#f0f8fb] border border-[#dce8f4] p-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Booking Ref.</div>
            <div className="font-mono font-bold text-[#0b5c66]">{ticket.bookingRef}</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Passenger</div>
            <div className="font-semibold">{ticket.passengerName}</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Seat</div>
            <div className="font-bold">{ticket.seatNumber || '—'}</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Booked On</div>
            <div className="flex items-center gap-1 font-medium">
              <Calendar className="h-3 w-3" />
              {ticket.bookedAt}
            </div>
          </div>
        </div>

        {/* Price + Baggage */}
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span>Cabin: {ticket.baggage.cabin} bag(s)</span>
            <span>·</span>
            <span>Checked: {ticket.baggage.checked} bag(s)</span>
          </div>

          <div className="font-bold text-gray-800 text-base">
            {formatVND(ticket.price)} VND
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild className="bg-[#0b5c66] hover:bg-[#094a52] gap-2">
            <Link href={`/customer/my-tickets/${ticket.id}`}>
              {isExpired || ticket.status === 'cancelled' || ticket.status === 'completed'
                ? 'View Details'
                : ticket.status === 'pending'
                  ? 'Complete Payment'
                  : 'Manage Ticket'}
            </Link>
          </Button>

          {!isExpired && ticket.status === 'confirmed' && (
            <>
              <Button variant="outline" className="gap-2">
                <QrCode className="h-4 w-4" /> Boarding Pass
              </Button>

              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Download
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export type UnifiedTicketListItem =
  | { type: 'oneway'; ticket: CustomerTicket; bookedAtDate: Date }
  | { type: 'roundtrip'; ticket: CustomerTicket; returnTicket: CustomerTicket; bookedAtDate: Date }

export function TicketListItemCard({ item }: { item: UnifiedTicketListItem }) {
  if (item.type === 'oneway') {
    return <TicketCard ticket={item.ticket} />
  }

  const { ticket, returnTicket } = item

  // Expiry & pending checks for both legs
  const outExpired = isTicketExpired(ticket)
  const retExpired = isTicketExpired(returnTicket)
  const isExpired = retExpired // Roundtrip is expired if the return flight is expired
  const isPending = ticket.status === 'pending' || returnTicket.status === 'pending'

  const getBadgeConfig = (t: CustomerTicket, expired: boolean) => {
    const statusInfo = STATUS_CONFIG[t.status] ?? { label: t.status, color: 'bg-gray-100 text-gray-600' }
    return {
      label: expired ? 'Expired' : statusInfo.label,
      color: expired ? 'bg-amber-100 text-amber-800 border-amber-200' : statusInfo.color
    }
  }

  const outBadge = getBadgeConfig(ticket, outExpired)
  const retBadge = getBadgeConfig(returnTicket, retExpired)

  return (
    <Card className={`overflow-hidden shadow-sm hover:shadow-md transition-shadow border ${isPending ? 'border-red-500 ring-2 ring-red-100' : isExpired ? 'border-amber-500 ring-2 ring-amber-50' : 'border-gray-200'}`}>
      {/* Top bar (use class color of outbound) */}
      <div className={`h-1.5 w-full ${CLASS_COLORS[ticket.ticketClass]?.split(' ')[0] ?? 'bg-gray-200'}`} />

      <CardContent className="p-6 space-y-6">
        {/* Outbound Leg */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b mb-4">
            <div className="flex items-center gap-3">
              <Plane className="h-5 w-5 text-[#0b5c66] rotate-45" />
              <div>
                <span className="font-bold text-gray-800">Chuyến đi (Outbound)</span>
                <span className="ml-2 text-xs text-muted-foreground">{ticket.flight.flightNumber} · {ticket.flight.airline}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={`${outBadge.color} border text-xs font-semibold`}>{outBadge.label}</Badge>
              <Badge className={`${CLASS_COLORS[ticket.ticketClass] ?? 'bg-gray-200 text-gray-700'} border-0 text-xs font-semibold`}>{CLASS_LABELS[ticket.ticketClass] ?? ticket.ticketClass}</Badge>
            </div>
          </div>

          {/* Outbound Route */}
          <div className="mb-4 grid grid-cols-3 gap-4 text-center">
            {/* departure */}
            <div>
              <div className="text-3xl font-light text-[#0b5c66]">{ticket.flight.departure.code}</div>
              <div className="text-base font-semibold mt-0.5">{ticket.flight.departure.time}</div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                {ticket.flight.departure.city}
              </div>
            </div>
            {/* duration */}
            <div className="flex flex-col items-center justify-center">
              <Clock className="mb-1 h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-gray-600">{ticket.flight.duration}</span>
              <div className="mt-2 flex items-center gap-1">
                <div className="h-px w-8 bg-gray-300" />
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <div className="h-px w-8 bg-gray-300" />
              </div>
            </div>
            {/* arrival */}
            <div>
              <div className="text-3xl font-light text-[#0b5c66]">{ticket.flight.arrival.code}</div>
              <div className="text-base font-semibold mt-0.5">{ticket.flight.arrival.time}</div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                {ticket.flight.arrival.city}
              </div>
            </div>
          </div>

          {/* Outbound Seat/Ref */}
          <div className="grid gap-3 rounded-xl bg-[#f0f8fb] border border-[#dce8f4] p-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Mã vé</div>
              <div className="font-mono font-bold text-[#0b5c66]">{ticket.id}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Hành khách</div>
              <div className="font-semibold">{ticket.passengerName}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Ghế</div>
              <div className="font-bold">{ticket.seatNumber || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Ngày bay</div>
              <div className="flex items-center gap-1 font-medium">
                <Calendar className="h-3 w-3" />
                {ticket.flight.departure.date}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed" />

        {/* Return Leg */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b mb-4">
            <div className="flex items-center gap-3">
              <Plane className="h-5 w-5 text-[#0b5c66] rotate-[225deg]" />
              <div>
                <span className="font-bold text-gray-800">Chuyến về (Return)</span>
                <span className="ml-2 text-xs text-muted-foreground">{returnTicket.flight.flightNumber} · {returnTicket.flight.airline}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={`${retBadge.color} border text-xs font-semibold`}>{retBadge.label}</Badge>
              <Badge className={`${CLASS_COLORS[returnTicket.ticketClass] ?? 'bg-gray-200 text-gray-700'} border-0 text-xs font-semibold`}>{CLASS_LABELS[returnTicket.ticketClass] ?? returnTicket.ticketClass}</Badge>
            </div>
          </div>

          {/* Return Route */}
          <div className="mb-4 grid grid-cols-3 gap-4 text-center">
            {/* departure */}
            <div>
              <div className="text-3xl font-light text-[#0b5c66]">{returnTicket.flight.departure.code}</div>
              <div className="text-base font-semibold mt-0.5">{returnTicket.flight.departure.time}</div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                {returnTicket.flight.departure.city}
              </div>
            </div>
            {/* duration */}
            <div className="flex flex-col items-center justify-center">
              <Clock className="mb-1 h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-gray-600">{returnTicket.flight.duration}</span>
              <div className="mt-2 flex items-center gap-1">
                <div className="h-px w-8 bg-gray-300" />
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <div className="h-px w-8 bg-gray-300" />
              </div>
            </div>
            {/* arrival */}
            <div>
              <div className="text-3xl font-light text-[#0b5c66]">{returnTicket.flight.arrival.code}</div>
              <div className="text-base font-semibold mt-0.5">{returnTicket.flight.arrival.time}</div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                {returnTicket.flight.arrival.city}
              </div>
            </div>
          </div>

          {/* Return Seat/Ref */}
          <div className="grid gap-3 rounded-xl bg-[#f0f8fb] border border-[#dce8f4] p-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Mã vé</div>
              <div className="font-mono font-bold text-[#0b5c66]">{returnTicket.id}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Hành khách</div>
              <div className="font-semibold">{returnTicket.passengerName}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Ghế</div>
              <div className="font-bold">{returnTicket.seatNumber || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Ngày bay</div>
              <div className="flex items-center gap-1 font-medium">
                <Calendar className="h-3 w-3" />
                {returnTicket.flight.departure.date}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed" />

        {/* Price & Action */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
          <div className="text-base font-bold text-gray-800">
            Tổng tiền khứ hồi: <span className="text-[#0b5c66] text-lg">{formatVND(ticket.price + returnTicket.price)} VND</span>
          </div>

          <div className="flex gap-2">
            <Button asChild className="bg-[#0b5c66] hover:bg-[#094a52] gap-2">
              <Link href={`/customer/my-tickets/${ticket.id}?returnTicketId=${returnTicket.id}`}>
                {isExpired || (ticket.status === 'cancelled' && returnTicket.status === 'cancelled') || (ticket.status === 'completed' && returnTicket.status === 'completed')
                  ? 'View Details'
                  : isPending
                    ? 'Complete Payment'
                    : 'Manage Ticket'}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}