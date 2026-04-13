'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plane, Clock, ArrowRight, Calendar, MapPin, QrCode, Download, Ticket,
} from 'lucide-react'
import { mockTickets } from '@/lib/mock-data'
import type { Ticket as TicketType } from '@/lib/types'

// ─── Config ──────────────────────────────────────────────────────────────────
const CLASS_LABELS: Record<string, string> = {
  economy:    'Economy',
  business:   'Premium Economy',
  firstClass: 'Business',
}

const CLASS_COLORS: Record<string, string> = {
  economy:    'bg-[#0b5c66] text-white',
  business:   'bg-[#5a8fa3] text-white',
  firstClass: 'bg-[#dfad36] text-gray-900',
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-200'    },
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600 border-red-200'          },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600 border-gray-200'       },
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n)
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MyTicketsPage() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [tickets, setTickets]     = useState<TicketType[]>([])

  const refreshTickets = useCallback(() => {
    setTickets(mockTickets.filter(t => t.userId === 'user-1').slice())
  }, [])

  useEffect(() => {
    refreshTickets()
    window.addEventListener('focus', refreshTickets)
    return () => window.removeEventListener('focus', refreshTickets)
  }, [refreshTickets])

  const upcoming = tickets.filter(t => t.status === 'confirmed' || t.status === 'pending')
  const past     = tickets.filter(t => t.status === 'completed' || t.status === 'cancelled')

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
            upcoming.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)
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
            past.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Ticket Card ──────────────────────────────────────────────────────────────
function TicketCard({ ticket }: { ticket: TicketType }) {
  const statusInfo = STATUS_CONFIG[ticket.status] ?? { label: ticket.status, color: 'bg-gray-100 text-gray-600' }
  const classCfg   = CLASS_COLORS[ticket.ticketClass] ?? 'bg-gray-200 text-gray-700'

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200">
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
            <Badge className={`${statusInfo.color} border text-xs font-semibold`}>
              {statusInfo.label}
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
            <div className="text-3xl font-light text-[#0b5c66]">{ticket.flight.departure.code}</div>
            <div className="text-base font-semibold mt-0.5">{ticket.flight.departure.time}</div>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />{ticket.flight.departure.city}
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
            <div className="text-3xl font-light text-[#0b5c66]">{ticket.flight.arrival.code}</div>
            <div className="text-base font-semibold mt-0.5">{ticket.flight.arrival.time}</div>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />{ticket.flight.arrival.city}
            </div>
          </div>
        </div>

        {/* Ticket details */}
        <div className="grid gap-3 rounded-xl bg-[#f0f8fb] border border-blue-100 p-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
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
              <Calendar className="h-3 w-3" />{ticket.bookedAt}
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
        {ticket.status !== 'cancelled' && ticket.status !== 'completed' && (
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="bg-[#0b5c66] hover:bg-[#094a52] gap-2">
              <Link href={`/customer/my-tickets/${ticket.id}`}>Manage Ticket</Link>
            </Button>
            <Button variant="outline" className="gap-2">
              <QrCode className="h-4 w-4" /> Boarding Pass
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Download
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
