export type PromotionCandidate = {
  flightId: string;
  flightNumber: string;
  route: string;
  departureDate: string;
  occupancyRate: number;
  economyPrice: number;
};

export type PromotionRequestItem = {
  id: string;
  flightId: string;
  flightNumber: string;
  route: string;
  discount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type ActivePromotionItem = {
  id: string;
  flightId: string;
  flightNumber: string;
  airline: string;

  departureCode: string;
  departureCity: string;
  departureTime: string;
  departureDate: string;

  arrivalCode: string;
  arrivalCity: string;
  arrivalTime: string;
  arrivalDate: string;

  duration: string;

  route: string;
  discount: number;
  economyPrice: number;
  createdAt: string;
};

export async function getPromotionCandidates() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/promotions/candidates`,
    {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Không lấy được danh sách chuyến bay đủ điều kiện");
  }

  return res.json() as Promise<PromotionCandidate[]>;
}

export async function getMyPendingPromotionRequests() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/promotions/requests/my?status=pending`,
    {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Không lấy được danh sách chờ duyệt");
  }

  return res.json() as Promise<PromotionRequestItem[]>;
}

export async function getActivePromotions() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/promotions/active`,
    {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Không lấy được danh sách khuyến mãi đang chạy");
  }

  return res.json() as Promise<ActivePromotionItem[]>;
}

export async function createPromotionRequest(payload: {
  flightId: string;
  discount: number;
  reason: string;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/promotions/requests`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Không tạo được yêu cầu khuyến mãi");
  }

  return res.json();
}

export async function deleteActivePromotion(promotionId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/promotions/${promotionId}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Không xóa được khuyến mãi");
  }

  return true;
}
export type PromotionCancellationRequestItem = {
  id: string;
  promotionId: string;
  flightNumber: string;
  route: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};
export async function createPromotionCancellationRequest(payload: {
  promotionId: string;
  reason: string;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/promotions/cancellation-requests`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Không gửi được yêu cầu hủy khuyến mãi");
  }

  return res.json();
}
export async function getMyPendingPromotionCancellationRequests() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/promotions/cancellation-requests/my?status=pending`,
    {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Không lấy được danh sách yêu cầu hủy đang chờ duyệt");
  }

  return res.json() as Promise<PromotionCancellationRequestItem[]>;
}