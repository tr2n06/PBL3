'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Plane,
  ArrowLeft,
  Ticket,
  Clock,
  ArrowRight,
  Calendar,
  MapPin,
  QrCode,
  Download,
} from 'lucide-react'
import { getTicketsByBookingCode, type MyTicketsResponse, type CustomerTicket } from '@/lib/tickets-api'

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

function isTicketExpired(t: CustomerTicket) {
  if (!t.flight?.departure?.date || !t.flight?.departure?.time) return false
  const departureDate = new Date(`${t.flight.departure.date}T${t.flight.departure.time}`)
  return departureDate < new Date()
}

// ─── Ticket Card ──────────────────────────────────────────────────────────────
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
            <Link href={`/search-booking/${ticket.id}`}>
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
              <Link href={`/search-booking/${ticket.id}?returnTicketId=${returnTicket.id}`}>
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

function SearchBookingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('code') || ''

  const [response, setResponse] = useState<MyTicketsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!code) {
      setError('Vui lòng nhập mã đặt chỗ để tìm kiếm')
      setLoading(false)
      return
    }

    async function fetchData() {
      try {
        setLoading(true)
        setError('')
        const data = await getTicketsByBookingCode(code)
        if ((!data.tickets || data.tickets.length === 0) && (!data.roundTickets || data.roundTickets.length === 0)) {
          setError('Không tìm thấy vé nào khớp với mã đặt chỗ: ' + code)
        } else {
          setResponse(data)
        }
      } catch (err) {
        console.error('Fetch booking tickets failed:', err)
        setError(err instanceof Error ? err.message : 'Lỗi khi tải thông tin vé')
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [code])

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* Back to Home Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <Button variant="ghost" onClick={() => router.push('/')} className="gap-2 text-[#0b5c66] hover:text-[#094a52]">
          <ArrowLeft className="w-4 h-4" /> Quay lại Trang chủ
        </Button>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-[#0b5c66]" />
          Tìm kiếm vé: <span className="font-mono text-[#0b5c66] font-black uppercase text-xl">{code}</span>
        </h1>
      </div>

      {loading && (
        <Card className="p-12 text-center border-dashed">
          <Plane className="mx-auto mb-4 h-14 w-14 text-muted-foreground animate-pulse opacity-30" />
          <h3 className="mb-2 text-lg font-semibold text-gray-700">Đang tìm kiếm thông tin vé...</h3>
          <p className="text-muted-foreground text-sm">Vui lòng chờ trong giây lát.</p>
        </Card>
      )}

      {!loading && error && (
        <Card className="p-12 text-center border-red-200 bg-red-50">
          <Plane className="mx-auto mb-4 h-14 w-14 text-red-400 opacity-70" />
          <h3 className="mb-2 text-lg font-semibold text-red-700">Tìm kiếm thất bại</h3>
          <p className="mb-6 text-sm text-red-600 font-medium">{error}</p>
          <Button onClick={() => router.push('/')} className="bg-[#0b5c66] hover:bg-[#094a52]">
            Về trang chủ
          </Button>
        </Card>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {unifiedItems.map(item => (
            <TicketListItemCard key={item.type === 'oneway' ? item.ticket.id : `${item.ticket.id}-${item.returnTicket.id}`} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SearchBookingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Plane className="h-10 w-10 text-[#0b5c66] animate-pulse" />
      </div>
    }>
      <SearchBookingContent />
    </Suspense>
  )
}
