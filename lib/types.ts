// User Types
export type UserRole = "customer" | "employee" | "manager";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  gender?: string;
  address?: string;
  nationalId?: string;
  dateOfBirth?: string;
  status: "active" | "blocked" | "pending";
  createdAt: string;
}

// Flight Types
export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  departure: {
    city: string;
    airport: string;
    code: string;
    time: string;
    date: string;
  };
  arrival: {
    city: string;
    airport: string;
    code: string;
    time: string;
    date: string;
  };
  duration: string;
  price: {
    economy: number;
    business: number;
    firstClass: number;
  };
  seatsAvailable: {
    economy: number;
    business: number;
    firstClass: number;
  };
  status: "scheduled" | "boarding" | "departed" | "arrived" | "cancelled";
  discount?: number;
  isPromotion?: boolean;
}

// Ticket Types
export type TicketClass = "economy" | "business" | "firstClass";
export type TicketStatus = "confirmed" | "pending" | "cancelled" | "completed";

export interface Ticket {
  id: string;
  bookingRef: string;
  userId: string;
  flightId: string;
  flight: Flight;
  passengerName: string;
  passengerEmail: string;
  ticketClass: TicketClass;
  seatNumber: string;
  price: number;
  baggage: {
    cabin: number;
    checked: number;
  };
  status: TicketStatus;
  bookedAt: string;
  bookedBy?: string; // For employee bookings
}

// Approval Types
export type ApprovalType = "cancellation" | "promotion" | "profile_edit";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterRole: UserRole;
  description: string;
  data: Record<string, unknown>;
  status: ApprovalStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

// Statistics Types
export interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
}

export interface FlightPopularity {
  flightId: string;
  flightNumber: string;
  route: string;
  bookings: number;
  revenue: number;
  occupancyRate: number;
}

// Destination for landing page
export interface Destination {
  id: string;
  city: string;
  country: string;
  image: string;
  description: string;
  startingPrice: number;
}
