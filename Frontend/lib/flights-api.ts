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
  departureCode: string;
  departureDate: string;
  departureTime: string;
  arrivalCode: string;
  arrivalDate: string;
  arrivalTime: string;
  status: Flight["status"];
  price?: number;
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

//Lệch rồi!!!!!!!
export async function updateFlight(
  flightId: string,
  payload: {
    flightNumber?: string | null;
    departureDate?: string | null;
    departureTime?: string | null;
    arrivalDate?: string | null;
    arrivalTime?: string | null;
    status?: Flight["status"] | null;
    priceFlight?: number | null;
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
// Lệch rồi
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

export async function getFlightNumber(
  departureCode: string,
  arrivalCode: string
): Promise<{ flightNumber: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/flights/flight-number?departureCode=${departureCode}&arrivalCode=${arrivalCode}`,
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
    throw new Error(text || "Failed to fetch flight number");
  }

  return res.json() as Promise<{ flightNumber: string }>;
}