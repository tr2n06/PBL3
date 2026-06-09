import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ bookingRef: string }> }
) {
  try {
    const { bookingRef } = await context.params;

    const backendBaseUrl =
      process.env.BACKEND_INTERNAL_API_BASE_URL || "http://127.0.0.1:5290";

    const statusUrl = `${backendBaseUrl}/api/payments/status/${encodeURIComponent(
      bookingRef
    )}`;

    const res = await fetch(statusUrl, {
      method: "GET",
      cache: "no-store",
    });

    const text = await res.text();
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return new NextResponse(text, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new NextResponse(text, { status: res.status });
  } catch (error: any) {
    console.error("Payment status proxy error:", error);
    return new NextResponse(error?.message || "Internal Server Error", {
      status: 500,
    });
  }
}
