import type { Flight } from "@/lib/types";

export type FlightAdminItem = Flight & {
  hasBookings?: boolean;
  bookedCount?: number;
};

export async function getFlights() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/flights`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to load flights");
  }

  return res.json() as Promise<FlightAdminItem[]>;
}

export async function createFlight(payload: {
  flightNumber: string;
  departureCity: string;
  departureCode: string;
  departureDate: string;
  departureTime: string;
  arrivalCity: string;
  arrivalCode: string;
  arrivalDate: string;
  arrivalTime: string;
  duration: string;
  economyPrice: number;
  businessPrice: number;
  firstClassPrice: number;
  economySeats: number;
  businessSeats: number;
  firstClassSeats: number;
  status: Flight["status"];
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/flights`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create flight");
  }

  return res.json() as Promise<FlightAdminItem>;
}

export async function updateFlight(
  flightId: string,
  payload: {
    flightNumber: string;
    departureCity: string;
    departureCode: string;
    departureDate: string;
    departureTime: string;
    arrivalCity: string;
    arrivalCode: string;
    arrivalDate: string;
    arrivalTime: string;
    duration: string;
    economyPrice: number;
    businessPrice: number;
    firstClassPrice: number;
    economySeats: number;
    businessSeats: number;
    firstClassSeats: number;
    status: Flight["status"];
  }
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/flights/${flightId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update flight");
  }

  return res.json() as Promise<FlightAdminItem>;
}

export async function deleteFlight(flightId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/flights/${flightId}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to delete flight");
  }

  return true;
}