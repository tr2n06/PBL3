export type CompletePaymentPayload = {
  bookingRef?: string;
  flightId: string;
  returnFlightId?: string;
  ticketClasses: string[];
  returnTicketClasses?: string[];
  seatNumbers: string[];
  returnSeatNumbers?: string[];
  passengers: {
    passengerType: "adult" | "child" | "infant";
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    gender: "male" | "female" | "other";
    dateOfBirth: string;
    cccd: string;
    email: string;
    phoneType: "personal" | "business";
    countryCode: string;
    phone: string;
    guardianPhone?: string;
  }[];
  passengerCounts: {
    adults: number;
    children: number;
    infants: number;
  };
  basePrices: number[];
  returnBasePrices?: number[];
  seatTypes: string[];
  returnSeatTypes?: string[];
  seatSurchargeTotal: number;
  totalPrice: number;
  extraBaggageKg: number[];
  pointsUsed: number;
  pointsEarned: number;
  paymentMethod: "card" | "qr" | "cash";
};

export async function completePayment(payload: CompletePaymentPayload) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payments/complete`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Không lưu được thanh toán");
  }

  return res.json();
}

export type ConfirmSuccessPaymentPayload = {
  bookingRef: string;
  paymentMethod: "card" | "qr" | "cash";
  sourceBank?: string;
  sourceAccount?: string;
  accountName?: string;
  amount: number;
};

export async function confirmSuccessPayment(payload: ConfirmSuccessPaymentPayload) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payments/confirm-success`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Không xác nhận được thanh toán thành công");
  }

  return res.json();
}

export async function fetchPaymentStatus(referenceCode: string) {
  const encodedReference = encodeURIComponent(referenceCode.trim());
  const baseUrl =
    typeof window === "undefined" ? "" : window.location.origin.replace(/\/$/, "");
  const res = await fetch(`${baseUrl}/api/payments/status/${encodedReference}`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Khong kiem tra duoc trang thai thanh toan");
  }

  return res.json() as Promise<{ status: string }>;
}

export type TicketActionPaymentPayload = {
  actionType: "upgrade" | "baggage";
  ticketId: string;
  paymentMethod: "card" | "qr" | "cash";
  amount: number;
  newClass?: string;
  seatNumber?: string;
  seatType?: string;
  seatFee?: number;
  extraCheckedKg?: number;
};

export async function initiateTicketActionPayment(payload: TicketActionPaymentPayload) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payments/ticket-action`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Khong tao duoc giao dich thanh toan");
  }

  return res.json() as Promise<{
    success: boolean;
    paymentMethod: "card" | "qr" | "cash";
    transactionCode: string;
    amount: number;
    qrLink?: string;
  }>;
}

export async function confirmTicketActionPayment(payload: {
  transactionCode: string;
  paymentMethod: "card" | "qr" | "cash";
  sourceBank?: string;
  sourceAccount?: string;
  accountName?: string;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payments/ticket-action/confirm`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Khong xac nhan duoc thanh toan");
  }

  return res.json();
}
