"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plane, Clock, Users, CreditCard, Printer, Ticket, Check, X,
  ArrowRight, Landmark, QrCode
} from "lucide-react";
import { mockTickets } from "@/lib/mock-data";
import type { Flight, TicketClass, Ticket as TicketType } from "@/lib/types";

// ─── types replicated from booking page ─────────────────────────────────────
type SeatType = "window" | "aisle" | "middle";
interface PassengerInfo {
  title: string; firstName: string; middleName: string; lastName: string;
  dateOfBirth: string; cccd: string; email: string;
  phoneType: "personal" | "business"; countryCode: string; phone: string;
}
interface BookedTicket {
  id: string; bookingRef: string; flight: Flight; ticketClasses: TicketClass[];
  passengers: PassengerInfo[]; seatNumbers: string[]; seatTypes: SeatType[];
  basePrices: number[]; seatSurchargeTotal: number; totalPrice: number;
  usedSeatSelection: boolean; bookedAt: string; bookedAtTime: string;
  extraBaggageKg: number[]; pointsUsed: number; pointsEarned: number;
}

const CLASS_LABELS: Record<TicketClass, string> = {
  economy: "Economy", business: "Premium Economy", firstClass: "Business",
};
const CLASS_THEME: Record<TicketClass, { card: string; text: string }> = {
  economy: { card: "bg-[#0b5c66]", text: "text-white" },
  business: { card: "bg-[#5a8fa3]", text: "text-white" },
  firstClass: { card: "bg-[#dfad36]", text: "text-gray-900" },
};

const SEAT_TYPE_INFO: Record<SeatType, { label: string }> = {
  window: { label: "Window" },
  aisle: { label: "Aisle" },
  middle: { label: "Middle" },
};
const SEAT_SURCHARGE: Record<SeatType, number> = {
  window: 350000,
  aisle: 150000,
  middle: 0,
};

function formatVND(n: number) { return new Intl.NumberFormat("vi-VN").format(n); }
function formatDateDisplay(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return (d && m && y) ? `${d}/${m}/${y}` : iso;
}

export default function CustomerPaymentPage() {
  const router = useRouter();
  const [booked, setBooked] = useState<BookedTicket | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "qr" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("tempBooking");
    if (saved) {
      setBooked(JSON.parse(saved));
    } else {
      router.push("/customer/booking");
    }
  }, [router]);

  const handleCompletePayment = () => {
    if (!paymentMethod || !booked) return;
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      // Finalize mock data for all passengers
      booked.passengers.forEach((p, i) => {
        const mockEntry: TicketType = {
          id: `${booked.id}-${i}`,
          bookingRef: booked.bookingRef, // Same booking ref for grouping
          userId: "user-1",
          flightId: booked.flight.id,
          flight: booked.flight,
          passengerName: [p.title, p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ") || "Passenger",
          passengerEmail: p.email || "",
          ticketClass: booked.ticketClasses[i],
          seatNumber: booked.seatNumbers[i] || "",
          price: booked.basePrices[i] + (booked.usedSeatSelection ? SEAT_SURCHARGE[booked.seatTypes[i]] : 0),
          baggage: { cabin: 1, checked: 1 }, // Simplification
          status: "confirmed",
          bookedAt: booked.bookedAt,
        };
        mockTickets.push(mockEntry);
      });
      
      // Update points in localStorage
      const storedPoints = localStorage.getItem("vflight_user_points");
      let currentPoints = storedPoints ? parseInt(storedPoints, 10) : 150000;
      currentPoints = currentPoints - (booked.pointsUsed || 0) + (booked.pointsEarned || 0);
      localStorage.setItem("vflight_user_points", currentPoints.toString());

      setIsProcessing(false);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1500);
  };

  if (!booked) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (isSuccess) {
    const fl = booked.flight;
    const theme = CLASS_THEME[booked.ticketClasses[0]];
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
            <p className="text-sm text-gray-500">
              Booking reference: <strong className="font-mono text-emerald-700">{booked.bookingRef}</strong>
            </p>
          </div>
        </div>

        <Card className="overflow-hidden shadow-2xl border-0">
          <div className={`${theme.card} ${theme.text} px-8 py-5 flex items-center justify-between`}>
            <div className="flex items-center gap-4">
              <Plane className="w-6 h-6" />
              <div>
                <p className="font-bold text-xl">{fl.flightNumber}</p>
                <p className="text-xs opacity-80">{fl.airline}</p>
              </div>
            </div>
            <Badge className="bg-white/20 border-0 font-bold text-base px-4 py-1">MULTIPLE CLASSES</Badge>
          </div>
          <CardContent className="p-0 bg-white">
            <div className="p-8 grid grid-cols-3 items-center gap-6 border-b">
              <div className="text-center">
                <p className="text-5xl font-light text-gray-400">{fl.departure.time}</p>
                <p className="text-2xl font-extrabold mt-2 text-gray-800">{fl.departure.code}</p>
                <p className="text-sm text-gray-500 font-medium">{fl.departure.city}</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Clock className="w-5 h-5 text-gray-300" />
                <p className="text-sm font-semibold text-gray-400">{fl.duration}</p>
                <div className="w-full flex items-center">
                  <div className="h-0.5 flex-1 bg-gray-100" />
                  <Plane className="w-4 h-4 text-gray-300 mx-2" />
                  <div className="h-0.5 flex-1 bg-gray-100" />
                </div>
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Confirmed</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-light text-gray-400">{fl.arrival.time}</p>
                <p className="text-2xl font-extrabold mt-2 text-gray-800">{fl.arrival.code}</p>
                <p className="text-sm text-gray-500 font-medium">{fl.arrival.city}</p>
              </div>
            </div>
            
            <div className="p-8 border-b space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-gray-400" /> Passenger Details
              </h3>
              {booked.passengers.map((p, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-5 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm border border-gray-100">
                  <div><span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Name</span><span className="font-bold text-gray-700">{[p.title, p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ")}</span></div>
                  <div><span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Seat</span><span className="font-extrabold text-[#0b5c66]">{booked.seatNumbers[i]}</span></div>
                  <div><span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Phone</span><span className="font-medium text-gray-600">{p.countryCode} {p.phone}</span></div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-gray-50/50">
              <div className="flex justify-between items-center mb-4">
                <div className="bg-yellow-100 px-3 py-1.5 rounded-lg border border-yellow-200">
                  <span className="text-xs font-bold text-yellow-800">You earned {formatVND(booked.pointsEarned)} points!</span>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Total Amount Paid</p>
                  <p className="text-3xl font-black text-[#0b5c66]">{formatVND(booked.totalPrice)} VND</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="h-12 px-6 gap-2 font-bold" onClick={() => window.print()}>
                    <Printer className="w-4 h-4" /> Print Ticket
                  </Button>
                  <Button className="h-12 px-6 gap-2 bg-[#f5d020] hover:bg-yellow-500 text-gray-900 font-bold shadow-lg shadow-yellow-200" asChild>
                    <Link href="/customer/my-tickets"><Ticket className="w-4 h-4" /> View My Tickets</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Checkout</h1>
        <p className="text-gray-500">Securely complete your flight booking</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#0b5c66]" /> Select Payment Method
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Card Payment */}
            <button
              onClick={() => setPaymentMethod("card")}
              className={`relative group flex flex-col items-center p-6 rounded-3xl border-2 transition-all duration-300 bg-white shadow-sm hover:shadow-xl ${
                paymentMethod === "card" ? "border-[#0b5c66] ring-4 ring-[#0b5c66]/5" : "border-gray-100 grayscale hover:grayscale-0"
              }`}
            >
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 relative">
                <img 
                  src="https://i.pinimg.com/736x/9c/71/d6/9c71d69a83143c2ec5f518698b174533.jpg" 
                  alt="Card Payment"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-[#0b5c66]/10 flex items-center justify-center opacity-0 transition-opacity duration-300 ${paymentMethod === "card" ? "opacity-100" : ""}`}>
                  <div className="bg-white rounded-full p-3 shadow-lg">
                    <Check className="w-8 h-8 text-[#0b5c66] stroke-[3px]" />
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Card Payment</h3>
              <p className="text-sm text-gray-500 mt-1">Visa, Mastercard, JCB</p>
            </button>

            {/* QR Payment */}
            <button
              onClick={() => setPaymentMethod("qr")}
              className={`relative group flex flex-col items-center p-6 rounded-3xl border-2 transition-all duration-300 bg-white shadow-sm hover:shadow-xl ${
                paymentMethod === "qr" ? "border-[#0b5c66] ring-4 ring-[#0b5c66]/5" : "border-gray-100 grayscale hover:grayscale-0"
              }`}
            >
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 relative">
                <img 
                  src="https://i.pinimg.com/736x/f6/fb/c4/f6fbc4deadbcc5287d59fff163191cee.jpg" 
                  alt="QR Payment"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-[#0b5c66]/10 flex items-center justify-center opacity-0 transition-opacity duration-300 ${paymentMethod === "qr" ? "opacity-100" : ""}`}>
                  <div className="bg-white rounded-full p-3 shadow-lg">
                    <Check className="w-8 h-8 text-[#0b5c66] stroke-[3px]" />
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800">QR Payment</h3>
              <p className="text-sm text-gray-500 mt-1">E-wallet, Banking App</p>
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
          <Card className="rounded-[2rem] border-0 shadow-2xl overflow-hidden bg-[#d2eaf4]">
            <CardHeader className="p-8 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="bg-white/50 border-white/80 text-[#0b5c66] font-bold mb-2">
                    MULTIPLE CLASSES
                  </Badge>
                  <CardTitle className="text-2xl font-black text-[#0b5c66]">
                    {booked.flight.departure.code} → {booked.flight.arrival.code}
                  </CardTitle>
                </div>
                <Users className="w-6 h-6 text-[#0b5c66]/40" />
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Passengers ({booked.passengers.length})</span>
                  <span className="font-bold text-gray-700">{formatVND(booked.basePrices.reduce((a, b) => a + b, 0))} VND</span>
                </div>
                {booked.seatSurchargeTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Seat Surcharge</span>
                    <span className="font-bold text-gray-700">{formatVND(booked.seatSurchargeTotal)} VND</span>
                  </div>
                )}
                {booked.extraBaggageKg && booked.extraBaggageKg.some(k => k > 0) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Extra Baggage ({booked.extraBaggageKg.reduce((a,b)=>a+b, 0)} kg)</span>
                    <span className="font-bold text-gray-700">{formatVND(booked.extraBaggageKg.reduce((a,b)=>a+b, 0) * 30000)} VND</span>
                  </div>
                )}
                {booked.pointsUsed > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-600 font-medium">Points Used</span>
                    <span className="font-bold text-red-500">-{formatVND(booked.pointsUsed)} VND</span>
                  </div>
                )}
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-black text-gray-800 uppercase tracking-tighter">Grand Total</span>
                  <span className="text-2xl font-black text-[#0b5c66]">{formatVND(booked.totalPrice)} VND</span>
                </div>
              </div>

              <Button
                disabled={!paymentMethod || isProcessing}
                onClick={handleCompletePayment}
                className="w-full h-14 rounded-2xl bg-[#0b5c66] hover:bg-[#08424a] text-white font-black text-lg shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : `PAY ${formatVND(booked.totalPrice)} VND`}
              </Button>
              
              <p className="text-[10px] text-center text-gray-500 uppercase font-bold tracking-widest px-4">
                By completing payment, you agree to our Terms of Service
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
