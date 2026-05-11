import type { TicketClass } from "@/lib/types";

export type TicketDetailResponse = {
  id: string;
  bookingRef: string;
  passengerName: string;
  flightId: string;
  seatNumber: string;
  ticketClass: TicketClass;
  price: number;
  status: "confirmed" | "pending" | "cancelled";
  baggage: {
    cabin: number;
    checked: number;
  };
  flight: {
    flightNumber: string;
    airline: string;
    duration: string;
    departure: {
      code: string;
      city: string;
      airport: string;
      time: string;
      date: string;
    };
    arrival: {
      code: string;
      city: string;
      airport: string;
      time: string;
      date: string;
    };
  };
};

export async function getTicketDetail(ticketId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tickets/${ticketId}`,
    {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to load ticket detail");
  }

  return res.json() as Promise<TicketDetailResponse>;
}

export async function requestTicketUpgrade(payload: {
  ticketId: string;
  newClass: TicketClass;
  seatNumber?: string;
  seatType?: "window" | "aisle" | "middle";
  seatFee: number;
  upgradeFee: number;
  paymentMethod: "card" | "qr";
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tickets/${payload.ticketId}/upgrade`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to upgrade ticket");
  }

  return res.json();
}

export async function addTicketBaggage(payload: {
  ticketId: string;
  extraCheckedKg: number;
  amount: number;
  paymentMethod: "card" | "qr";
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tickets/${payload.ticketId}/baggage`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to add baggage");
  }

  return res.json();
}

export async function requestTicketCancellation(payload: {
  ticketId: string;
  reason: string;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tickets/${payload.ticketId}/cancellation-request`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to submit cancellation request");
  }

  return res.json();
}