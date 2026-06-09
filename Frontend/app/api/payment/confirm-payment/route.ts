import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Forward the request to the local C# backend.
    // NEXT_PUBLIC_API_BASE_URL is usually http://localhost:5290
    let backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5290";
    if (backendBaseUrl.includes("localhost")) {
      backendBaseUrl = backendBaseUrl.replace("localhost", "127.0.0.1");
    }
    const confirmUrl = `${backendBaseUrl}/api/payment/confirm-payment`;
    
    console.log(`Proxying payment confirmation to C# backend: ${confirmUrl}`);

    const res = await fetch(confirmUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`C# Backend payment confirmation failed: ${res.status} - ${errText}`);
      return new NextResponse(errText || "Backend payment confirmation failed", {
        status: res.status,
      });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Payment API proxy error:", error);
    return new NextResponse(error?.message || "Internal Server Error", {
      status: 500,
    });
  }
}
