import type { TicketClass } from "@/lib/types";
export type SearchFlightsParams = {
  from?: string;
  to?: string;
  departDate?: string;
  returnDate?: string;
  tripType?: "oneway" | "roundtrip";
  passengers?: number;
  adults?: number;
  children?: number;
  infants?: number;
};

export type FlightApiItem = {
  id: string | number;
  flightNumber: string;
  airline: string;
  duration: string;

  departureCode: string;
  departureCity: string;
  departureAirport?: string;
  departureTime: string;
  departureDate?: string;

  arrivalCode: string;
  arrivalCity: string;
  arrivalAirport?: string;
  arrivalTime: string;
  arrivalDate?: string;

  economySeats: number;
  businessSeats: number;
  firstClassSeats: number;

  economyPrice?: number;
  businessPrice?: number;
  firstClassPrice?: number;

  status?: "scheduled" | "boarding" | "departed" | "arrived" | "cancelled";
  discount?: number | null;
  isPromotion?: boolean;
};

export type SeatAvailabilityItem = {
  seatNumber: string;
  status: "available" | "booked";
};

export async function getSeatAvailability(
  flightId: string,
  ticketClass: TicketClass,
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/flights/${flightId}/seats?class=${ticketClass}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Không lấy được danh sách ghế");
  }

  return res.json() as Promise<SeatAvailabilityItem[]>;
}
export async function searchFlights(params: SearchFlightsParams) {
  const query = new URLSearchParams();

  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.departDate) query.set("departDate", params.departDate);
  if (params.returnDate) query.set("returnDate", params.returnDate);
  if (params.tripType) query.set("tripType", params.tripType);
  if (params.passengers) query.set("passengers", String(params.passengers));

  if (params.adults !== undefined) query.set("adults", String(params.adults));
  if (params.children !== undefined) query.set("children", String(params.children));
  if (params.infants !== undefined) query.set("infants", String(params.infants));

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/flights/search?${query.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Không lấy được danh sách chuyến bay");
  }

  return res.json() as Promise<FlightApiItem[]>;
}