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
