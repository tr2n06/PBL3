import { getApiBaseUrl } from "@/lib/utils";

export type RevenuePoint = {
  month: string;
  revenue: number;
  bookings: number;
};

export type CancellationTrendPoint = {
  month: string;
  cancellations: number;
  rate: number;
};

export type CancellationReasonItem = {
  name: string;
  value: number;
  color?: string;
};

export type HighRiskCustomerItem = {
  id: number;
  name: string;
  email: string;
  cancellations: number;
  totalBookings: number;
  rate: number;
  status?: "active" | "blocked";
};

export type CustomerOverview = {
  totalCustomers: number;
  activeCustomers: number;
  blockedCustomers: number;
};

export type StatisticsOverview = {
  totalRevenue: number;
  revenueChange: number;
  totalBookings: number;
  bookingsChange: number;
  cancellations: number;
  cancellationsChange: number;
  cancellationRate: number;
  cancellationRateChange: number;
};

export type StatisticsResponse = {
  overview: StatisticsOverview;
  revenueData: RevenuePoint[];
  cancellationData: CancellationTrendPoint[];
  cancellationReasons: CancellationReasonItem[];
  frequentCancellers: HighRiskCustomerItem[];
  customerOverview: CustomerOverview;
};

export async function getStatistics(period: string) {
  const res = await fetch(
    `${getApiBaseUrl()}/api/statistics?period=${period}`,
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
    throw new Error(text || "Failed to load statistics");
  }

  return res.json() as Promise<StatisticsResponse>;
}

export async function blockCustomer(customerId: string) {
  const res = await fetch(
    `${getApiBaseUrl()}/api/auth/${customerId}/block`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { 
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to block customer");
  }

  return res.json();
}