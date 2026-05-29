import { getApiBaseUrl } from "@/lib/utils";
import type { ApprovalRequest } from "@/lib/types";

export async function getPendingApprovalRequests() {
  const res = await fetch(
    `${getApiBaseUrl()}/api/approvals?status=pending`,
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
    throw new Error(text || "Failed to load approval requests");
  }

  return res.json() as Promise<ApprovalRequest[]>;
}

export async function approveApprovalRequest(requestId: string) {
  const res = await fetch(
    `${getApiBaseUrl()}/api/approvals/${requestId}/approve`,
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
    throw new Error(text || "Failed to approve request");
  }

  return res.json();
}

export async function rejectApprovalRequest(
  requestId: string,
  reason: string
) {
  const res = await fetch(
    `${getApiBaseUrl()}/api/approvals/${requestId}/reject`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to reject request");
  }

  return res.json();
}