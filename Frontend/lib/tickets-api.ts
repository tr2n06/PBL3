import type { Flight, TicketClass } from '@/lib/types'

export type TicketApiItem = {
  id: string | number
  bookingRef: string
  bookedAt: string
  totalPrice: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  passengerName: string
  passengerEmail?: string
  seatNumber?: string
  ticketClass: TicketClass
  baggage?: {
    cabin: number
    checked: number
    checkedBaggage?: number
    priceCabin?: number
    checkedCabin?: number
  } 
  price?: number
  isCancelled?: boolean
  isUpgraded?: boolean
  flight: { 
    id: string | number
    flightNumber: string
    airline: string
    duration: string
    departureCode: string
    departureCity: string
    departureAirport?: string
    departureTime: string
    departureDate?: string
    arrivalCode: string
    arrivalCity: string
    arrivalAirport?: string
    arrivalTime: string
    arrivalDate?: string
  }
}

export type CustomerTicket = {
  id: string
  bookingRef: string
  bookedAt: string
  totalPrice: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  passengerName: string
  passengerEmail?: string
  seatNumber?: string
  ticketClass: TicketClass
  baggage: {
    cabin: number
    checked: number
    priceCabin: number
    checkedCabin: number
  }
  flight: Flight
  price: number 
  isCancelled: boolean
  isUpgraded: boolean
}

function mapFlight(f: TicketApiItem['flight']): Flight {
  return {
    id: String(f.id),
    flightNumber: f.flightNumber,
    airline: f.airline,
    duration: f.duration,
    departure: {
      city: f.departureCity,
      airport: f.departureAirport ?? f.departureCity,
      code: f.departureCode,
      time: f.departureTime,
      date: f.departureDate ?? '',
    },
    arrival: {
      city: f.arrivalCity,
      airport: f.arrivalAirport ?? f.arrivalCity,
      code: f.arrivalCode,
      time: f.arrivalTime,
      date: f.arrivalDate ?? '',
    },
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
}

function mapTicket(item: TicketApiItem): CustomerTicket {
  const checkedVal = item.baggage
    ? (item.baggage.checked ?? item.baggage.checkedBaggage ?? 0)
    : 0;
  return {
    id: String(item.id),
    bookingRef: item.bookingRef,
    bookedAt: item.bookedAt,
    totalPrice: item.totalPrice,
    status: item.status,
    passengerName: item.passengerName,
    passengerEmail: item.passengerEmail,
    seatNumber: item.seatNumber,
    ticketClass: item.ticketClass,
    baggage: {
      cabin: item.baggage?.cabin ?? 0,
      checked: checkedVal,
      priceCabin: item.baggage?.priceCabin ?? 0,
      checkedCabin: item.baggage?.checkedCabin ?? (checkedVal * 40000),
    },
    flight: mapFlight(item.flight),
    price: item.price ?? item.totalPrice,
    isCancelled: item.isCancelled ?? false,
    isUpgraded: item.isUpgraded ?? false,
  }
}

export type MyTicketsResponse = {
  roundTickets: { ticket: CustomerTicket; returnTicket: CustomerTicket }[]
  tickets: CustomerTicket[]
}

export async function getMyTickets(): Promise<MyTicketsResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tickets/my`,
    {
      method: 'GET', 
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
 
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Không lấy được danh sách vé')
  }

  const data = (await res.json()) as {
    roundTickets: { ticket: TicketApiItem; returnTicket: TicketApiItem }[]
    tickets: TicketApiItem[]
  }

  return {
    roundTickets: (data.roundTickets || []).map(group => ({
      ticket: mapTicket(group.ticket),
      returnTicket: mapTicket(group.returnTicket)
    })),
    tickets: (data.tickets || []).map(mapTicket)
  }
}

export async function getTicketsByBookingCode(bookingRef: string): Promise<MyTicketsResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tickets/booking/${bookingRef}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Không tìm thấy vé cho mã đặt chỗ này')
  }

  const data = (await res.json()) as {
    roundTickets: { ticket: TicketApiItem; returnTicket: TicketApiItem }[]
    tickets: TicketApiItem[]
  }

  return {
    roundTickets: (data.roundTickets || []).map(group => ({
      ticket: mapTicket(group.ticket),
      returnTicket: mapTicket(group.returnTicket)
    })),
    tickets: (data.tickets || []).map(mapTicket)
  }
}