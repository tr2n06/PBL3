"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Plane, ArrowRightLeft, Calendar, Users, Search, Clock,
  ArrowRight, MapPin, X, ChevronDown, Check, ChevronRight,
  Ticket, CreditCard, Printer, FileText,
} from "lucide-react";
import { mockFlights, mockTickets } from "@/lib/mock-data";
import type { Flight, TicketClass, Ticket as TicketType } from "@/lib/types";

// ─── Airports ────────────────────────────────────────────────────────────────
const AIRPORTS = [
  { code: "JFK", city: "New York" }, { code: "LAX", city: "Los Angeles" },
  { code: "LHR", city: "London" }, { code: "CDG", city: "Paris" },
  { code: "NRT", city: "Tokyo" }, { code: "DXB", city: "Dubai" },
  { code: "SIN", city: "Singapore" }, { code: "SYD", city: "Sydney" },
  { code: "HAN", city: "Hanoi" }, { code: "SGN", city: "Ho Chi Minh City" },
];

// ─── Country Dialing Codes ───────────────────────────────────────────────────
const COUNTRY_CODES = [
  { dial: "+84", name: "Vietnam 🇻🇳" }, { dial: "+1", name: "USA / Canada 🇺🇸" },
  { dial: "+44", name: "United Kingdom 🇬🇧" }, { dial: "+33", name: "France 🇫🇷" },
  { dial: "+49", name: "Germany 🇩🇪" }, { dial: "+81", name: "Japan 🇯🇵" },
  { dial: "+86", name: "China 🇨🇳" }, { dial: "+82", name: "South Korea 🇰🇷" },
  { dial: "+65", name: "Singapore 🇸🇬" }, { dial: "+66", name: "Thailand 🇹🇭" },
  { dial: "+60", name: "Malaysia 🇲🇾" }, { dial: "+62", name: "Indonesia 🇮🇩" },
  { dial: "+63", name: "Philippines 🇵🇭" }, { dial: "+91", name: "India 🇮🇳" },
  { dial: "+61", name: "Australia 🇦🇺" }, { dial: "+64", name: "New Zealand 🇳🇿" },
  { dial: "+971", name: "UAE 🇦🇪" }, { dial: "+966", name: "Saudi Arabia 🇸🇦" },
  { dial: "+7", name: "Russia 🇷🇺" }, { dial: "+39", name: "Italy 🇮🇹" },
  { dial: "+34", name: "Spain 🇪🇸" }, { dial: "+31", name: "Netherlands 🇳🇱" },
  { dial: "+32", name: "Belgium 🇧🇪" }, { dial: "+41", name: "Switzerland 🇨🇭" },
  { dial: "+43", name: "Austria 🇦🇹" }, { dial: "+46", name: "Sweden 🇸🇪" },
  { dial: "+47", name: "Norway 🇳🇴" }, { dial: "+45", name: "Denmark 🇩🇰" },
  { dial: "+358", name: "Finland 🇫🇮" }, { dial: "+48", name: "Poland 🇵🇱" },
  { dial: "+380", name: "Ukraine 🇺🇦" }, { dial: "+36", name: "Hungary 🇭🇺" },
  { dial: "+420", name: "Czech Republic 🇨🇿" }, { dial: "+40", name: "Romania 🇷🇴" },
  { dial: "+30", name: "Greece 🇬🇷" }, { dial: "+90", name: "Turkey 🇹🇷" },
  { dial: "+20", name: "Egypt 🇪🇬" }, { dial: "+27", name: "South Africa 🇿🇦" },
  { dial: "+234", name: "Nigeria 🇳🇬" }, { dial: "+254", name: "Kenya 🇰🇪" },
  { dial: "+55", name: "Brazil 🇧🇷" }, { dial: "+54", name: "Argentina 🇦🇷" },
  { dial: "+52", name: "Mexico 🇲🇽" }, { dial: "+56", name: "Chile 🇨🇱" },
  { dial: "+57", name: "Colombia 🇨🇴" }, { dial: "+51", name: "Peru 🇵🇪" },
  { dial: "+972", name: "Israel 🇮🇱" }, { dial: "+92", name: "Pakistan 🇵🇰" },
  { dial: "+880", name: "Bangladesh 🇧🇩" }, { dial: "+94", name: "Sri Lanka 🇱🇰" },
];

// ─── Price Ranges (VND) ───────────────────────────────────────────────────────
const PRICE_RANGES: Record<TicketClass, readonly [number, number]> = {
  economy: [3_000_000, 3_500_000],
  business: [4_500_000, 5_200_000],
  firstClass: [8_000_000, 10_000_000],
} as const;

// ─── Seat Types ───────────────────────────────────────────────────────────────
type SeatType = "window" | "aisle" | "middle";
interface SeatColDef { col: string; type: SeatType; }

/** Surcharge only applies when user CHOOSES a seat (not for auto-assigned) */
const SEAT_SURCHARGE: Record<SeatType, number> = {
  window: 350_000, aisle: 150_000, middle: 0,
};

const SEAT_TYPE_INFO: Record<SeatType, { label: string; icon: string; available: string; dot: string; labelColor: string }> = {
  window: {
    label: "Window", icon: "🪟",
    available: "border-[#3a6090] bg-[#eef3f9] text-[#1a3557] hover:bg-[#dce8f4]",
    dot: "bg-[#3a6090]", labelColor: "text-[#1e4069] bg-[#eef3f9]",
  },
  aisle: {
    label: "Aisle", icon: "↔",
    available: "border-emerald-400 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
    dot: "bg-emerald-400", labelColor: "text-emerald-600 bg-emerald-50",
  },
  middle: {
    label: "Middle", icon: "●",
    available: "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
    dot: "bg-amber-300", labelColor: "text-amber-700 bg-amber-50",
  },
};

// ─── Cabin Config ────────────────────────────────────────────────────────────
const CABIN_CONFIG: Record<TicketClass, {
  rows: number[]; left: SeatColDef[]; right: SeatColDef[];
  label: string; layout: string;
}> = {
  economy: {
    rows: [20, 21, 22, 23, 24, 25, 26, 27],
    left: [{ col: "A", type: "window" }, { col: "B", type: "middle" }, { col: "C", type: "aisle" }],
    right: [{ col: "D", type: "aisle" }, { col: "E", type: "middle" }, { col: "F", type: "window" }],
    label: "Economy Cabin", layout: "3 – 3",
  },
  business: {
    rows: [5, 6, 7, 8, 9, 10],
    left: [{ col: "A", type: "window" }, { col: "B", type: "aisle" }],
    right: [{ col: "C", type: "aisle" }, { col: "D", type: "window" }],
    label: "Premium Economy Cabin", layout: "2 – 2",
  },
  firstClass: {
    rows: [1, 2, 3, 4],
    left: [{ col: "A", type: "window" }],
    right: [{ col: "B", type: "window" }],
    label: "Business Suite", layout: "1 – 1 (Luxury Pods)",
  },
};

// ─── Class Labels & Themes ───────────────────────────────────────────────────
const CLASS_LABELS: Record<TicketClass, string> = {
  economy: "Economy", business: "Premium Economy", firstClass: "Business",
};
const CLASS_THEME: Record<TicketClass, { card: string; text: string }> = {
  economy: { card: "bg-[#1e4069]", text: "text-white" },
  business: { card: "bg-[#f07832]", text: "text-white" },
  firstClass: { card: "bg-[#f5d020]", text: "text-gray-900" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatVND(n: number) { return new Intl.NumberFormat("vi-VN").format(n); }

function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) ^ s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function getBasePrice(flightId: string, tClass: TicketClass): number {
  const [min, max] = PRICE_RANGES[tClass];
  return Math.round((min + (hashStr(flightId + tClass) % (max - min))) / 50_000) * 50_000;
}

function isSeatOccupied(flightId: string, seatId: string) { return hashStr(flightId + seatId) % 4 === 0; }

function getSeatType(col: string, tClass: TicketClass): SeatType {
  const all = [...CABIN_CONFIG[tClass].left, ...CABIN_CONFIG[tClass].right];
  return all.find((c) => c.col === col)?.type ?? "middle";
}

function autoAssignSeat(tClass: TicketClass, flightId: string, taken: string[]): string {
  const { rows, left, right } = CABIN_CONFIG[tClass];
  for (const row of rows)
    for (const { col } of [...left, ...right]) {
      const id = `${row}${col}`;
      if (!isSeatOccupied(flightId, id) && !taken.includes(id)) return id;
    }
  return `${rows[0]}${left[0].col}`;
}

function generateRef(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return "SL-BK-" + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

/** Remove Vietnamese diacritics and convert to UPPERCASE */
function normalizeToUppercase(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đ]/g, "d").replace(/[Đ]/g, "D")
    .toUpperCase();
}

/** Format YYYY-MM-DD → DD/MM/YYYY for display */
function formatDateDisplay(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return (d && m && y) ? `${d}/${m}/${y}` : iso;
}

/** Today's date in YYYY-MM-DD for min/max attributes */
const TODAY = new Date().toISOString().split("T")[0];

// ─── Types ───────────────────────────────────────────────────────────────────
interface PassengerInfo {
  title: string; firstName: string; middleName: string; lastName: string;
  dateOfBirth: string; cccd: string; email: string;
  phoneType: "personal" | "business"; countryCode: string; phone: string;
}
function emptyPassenger(): PassengerInfo {
  return {
    title: "Mr", firstName: "", middleName: "", lastName: "", dateOfBirth: "",
    cccd: "", email: "", phoneType: "personal", countryCode: "+84", phone: ""
  };
}
interface BookedTicket {
  id: string; bookingRef: string; flight: Flight; ticketClasses: TicketClass[];
  passengers: PassengerInfo[]; seatNumbers: string[]; seatTypes: SeatType[];
  basePrices: number[]; seatSurchargeTotal: number; totalPrice: number;
  usedSeatSelection: boolean; bookedAt: string; bookedAtTime: string;
  extraBaggageKg: number[]; pointsUsed: number; pointsEarned: number;
}

// ─── AirplaneSeatMap ─────────────────────────────────────────────────────────
interface SeatMapProps {
  ticketClass: TicketClass; flightId: string;
  passengerCount: number; selectedSeats: string[]; selectedTypes: SeatType[];
  basePrice: number; onToggle: (seatId: string, type: SeatType) => void;
  takenSeats?: string[];
}

function AirplaneSeatMap({ ticketClass, flightId, passengerCount, selectedSeats, selectedTypes, basePrice, onToggle, takenSeats = [] }: SeatMapProps) {
  const { rows, left, right, label, layout } = CABIN_CONFIG[ticketClass];
  const totalSurcharge = selectedTypes.reduce((s, t) => s + SEAT_SURCHARGE[t], 0);
  const ready = selectedSeats.length === passengerCount;

  const SeatBtn = ({ col, type, row }: { col: string; type: SeatType; row: number }) => {
    const id = `${row}${col}`;
    const occupied = isSeatOccupied(flightId, id) || takenSeats.includes(id);
    const selected = selectedSeats.includes(id);
    let cls = "w-10 h-10 rounded-xl text-xs font-bold border-2 transition-all duration-150 flex items-center justify-center ";
    if (occupied) cls += "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed";
    else if (selected) cls += "bg-[#1a3557] border-[#1a3557] text-white scale-110 shadow-lg ring-2 ring-[#3a6090]/30";
    else cls += SEAT_TYPE_INFO[type].available + " cursor-pointer hover:scale-105 hover:shadow-sm";
    return (
      <button type="button" disabled={occupied} onClick={() => onToggle(id, type)}
        title={occupied ? "Taken" : `${SEAT_TYPE_INFO[type].label} · ${SEAT_SURCHARGE[type] > 0 ? "+" + formatVND(SEAT_SURCHARGE[type]) + " VND" : "Free"}`}
        className={cls}
      >
        {occupied ? "✕" : selected ? "✓" : col}
      </button>
    );
  };

  return (
    <div className="flex flex-col select-none">
      {/* Cabin info */}
      <div className="text-center mb-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</p>
        <p className="text-[10px] text-gray-400">Seating layout: {layout}</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3 justify-center">
        {(["window", "aisle", "middle"] as SeatType[]).map((type) => (
          <span key={type} className="flex items-center gap-1 text-[11px]">
            <span className={`w-3 h-3 rounded-sm ${SEAT_TYPE_INFO[type].dot}`} />
            <span className="font-medium text-gray-700">{SEAT_TYPE_INFO[type].label}</span>
            <span className="text-gray-400">{SEAT_SURCHARGE[type] > 0 ? `+${formatVND(SEAT_SURCHARGE[type])} VND` : "Free"}</span>
          </span>
        ))}
        <span className="flex items-center gap-1 text-[11px]">
          <span className="w-3 h-3 rounded-sm bg-gray-200 border border-gray-300" />
          <span className="text-gray-400">Taken</span>
        </span>
      </div>

      {/* Plane fuselage */}
      <div className="relative mx-auto w-full">
        {/* Nose */}
        <div className="flex justify-center mb-1">
          <div className="flex flex-col items-center">
            <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[28px] border-l-transparent border-r-transparent border-b-slate-200" />
            <div className="w-10 h-1 bg-slate-200" />
          </div>
        </div>

        {/* Cabin body */}
        <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50 border-2 border-slate-200 rounded-2xl shadow-inner overflow-hidden relative">
          {/* Window strips on sides */}
          <div className="absolute left-0 top-14 bottom-4 w-3 flex flex-col justify-around pl-0.5 pointer-events-none">
            {rows.map((r) => <div key={r} className="w-2 h-3 bg-sky-200/80 rounded-sm mx-auto" />)}
          </div>
          <div className="absolute right-0 top-14 bottom-4 w-3 flex flex-col justify-around pr-0.5 pointer-events-none">
            {rows.map((r) => <div key={r} className="w-2 h-3 bg-sky-200/80 rounded-sm mx-auto" />)}
          </div>

          <div className="px-5 py-3">
            {/* Seat type icons per column */}
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="w-8 shrink-0" />
              {left.map(({ col, type }) => (
                <div key={col} className="w-10 flex justify-center">
                  <span className="text-base leading-none">{SEAT_TYPE_INFO[type].icon}</span>
                </div>
              ))}
              <span className="w-6 shrink-0" />
              {right.map(({ col, type }) => (
                <div key={col} className="w-10 flex justify-center">
                  <span className="text-base leading-none">{SEAT_TYPE_INFO[type].icon}</span>
                </div>
              ))}
              <span className="w-8 shrink-0" />
            </div>

            {/* Column letters */}
            <div className="flex items-center justify-center gap-1 mb-2">
              <span className="w-8 shrink-0" />
              {left.map(({ col }) => (
                <span key={col} className="w-10 text-center text-[10px] font-bold text-gray-400">{col}</span>
              ))}
              <span className="w-6 text-center text-[9px] text-gray-300 shrink-0">│</span>
              {right.map(({ col }) => (
                <span key={col} className="w-10 text-center text-[10px] font-bold text-gray-400">{col}</span>
              ))}
              <span className="w-8 shrink-0" />
            </div>

            {/* Seat rows */}
            <div className="space-y-1.5 overflow-y-auto max-h-60">
              {rows.map((row) => (
                <div key={row} className="flex items-center justify-center gap-1">
                  <span className="w-8 text-[10px] text-gray-400 text-right font-mono shrink-0">{row}</span>
                  {left.map(({ col, type }) => <SeatBtn key={col} col={col} type={type} row={row} />)}
                  <div className="w-6 flex flex-col items-center justify-center shrink-0 gap-0.5">
                    <div className="w-px h-3 bg-gray-200" />
                    <div className="w-1 h-1 rounded-full bg-gray-200" />
                    <div className="w-px h-3 bg-gray-200" />
                  </div>
                  {right.map(({ col, type }) => <SeatBtn key={col} col={col} type={type} row={row} />)}
                  <span className="w-8 text-[10px] text-gray-400 text-left font-mono shrink-0">{row}</span>
                </div>
              ))}
            </div>

            {/* Seat type labels row at bottom */}
            <div className="flex items-center justify-center gap-1 mt-2 border-t border-gray-100 pt-2">
              <span className="w-8 shrink-0" />
              {left.map(({ col, type }) => (
                <span key={col} className={`w-10 text-center text-[8px] font-bold px-1 py-0.5 rounded ${SEAT_TYPE_INFO[type].labelColor}`}>
                  {SEAT_TYPE_INFO[type].label.toUpperCase()}
                </span>
              ))}
              <span className="w-6 shrink-0" />
              {right.map(({ col, type }) => (
                <span key={col} className={`w-10 text-center text-[8px] font-bold px-1 py-0.5 rounded ${SEAT_TYPE_INFO[type].labelColor}`}>
                  {SEAT_TYPE_INFO[type].label.toUpperCase()}
                </span>
              ))}
              <span className="w-8 shrink-0" />
            </div>
          </div>
        </div>

        {/* Tail */}
        <div className="flex justify-center mt-1">
          <div className="w-10 h-1 bg-slate-200" />
        </div>
      </div>

      {/* Selection summary */}
      {selectedSeats.length > 0 && (
        <div className="mt-3 rounded-xl border border-[#c3d4e8] bg-[#eef3f9] p-3 space-y-1.5">
          <p className="text-xs font-semibold text-[#1a3557]">Selected Seats:</p>
          {selectedSeats.map((seat, i) => {
            const t = selectedTypes[i] ?? "middle";
            return (
              <div key={seat} className="flex justify-between text-xs text-gray-700">
                <span className="font-medium">{seat} <span className="text-gray-400">({SEAT_TYPE_INFO[t].label})</span></span>
                <span>{SEAT_SURCHARGE[t] > 0 ? `+${formatVND(SEAT_SURCHARGE[t])} VND` : "Free"}</span>
              </div>
            );
          })}
          <div className="flex justify-between font-bold text-xs border-t pt-1.5 text-[#1a3557]">
            <span>Seat fee total:</span><span>{formatVND(totalSurcharge)} VND</span>
          </div>
        </div>
      )}
      <p className={`text-xs text-center mt-2 font-semibold ${ready ? "text-[#1a3557]" : "text-amber-600"}`}>
        {ready ? `✓ ${passengerCount} seat(s) selected` : `Please select ${passengerCount - selectedSeats.length} more seat(s)`}
      </p>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function CustomerBookingPage() {
  const router = useRouter();
  // Search state
  const [tripType, setTripType] = useState("roundtrip");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [searched, setSearched] = useState(false);

  // Booking flow
  const [view, setView] = useState<"search" | "info" | "summary" | "invoice">("search");
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedClass, setSelectedClass] = useState<TicketClass>("economy");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [seatMapMode, setSeatMapMode] = useState(false);
  const [activePassengerIndex, setActivePassengerIndex] = useState<number | null>(null);
  const [passengerClasses, setPassengerClasses] = useState<TicketClass[]>([]);
  const [chosenSeats, setChosenSeats] = useState<string[]>([]);
  const [chosenTypes, setChosenTypes] = useState<SeatType[]>([]);
  const [usedSeatSelection, setUsedSeatSelection] = useState(false);

  // Forms
  const [passForms, setPassForms] = useState<PassengerInfo[]>([]);
  const [phoneErrors, setPhoneErrors] = useState<Record<number, string>>({});
  const [emailErrors, setEmailErrors] = useState<Record<number, string>>({});

  // Result
  const [booked, setBooked] = useState<BookedTicket | null>(null);

  // Summary state
  const [extraBaggageKg, setExtraBaggageKg] = useState<number[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [applyPoints, setApplyPoints] = useState(false);

  useEffect(() => {
    const storedPoints = localStorage.getItem("vflight_user_points");
    if (storedPoints) setUserPoints(parseInt(storedPoints, 10));
    else {
      setUserPoints(150000); // 150k default mock
      localStorage.setItem("vflight_user_points", "150000");
    }
  }, []);

  // ── Computed ──
  const filteredFlights = useMemo(() => {
    if (!searched) return [];
    let fl = [...mockFlights];
    if (from) fl = fl.filter((f) => f.departure.code === from);
    if (to) fl = fl.filter((f) => f.arrival.code === to);
    return fl;
  }, [from, to, searched]);

  const passCount = parseInt(passengers, 10) || 1;
  const basePrices = selectedFlight ? passengerClasses.map(c => getBasePrice(selectedFlight.id, c)) : Array(passCount).fill(0);
  // Surcharge only when user explicitly used seat map
  const totalSurcharge = usedSeatSelection
    ? chosenTypes.reduce((s, t) => s + SEAT_SURCHARGE[t], 0)
    : 0;

  // ── Handlers ──
  const swapAirports = () => { const t = from; setFrom(to); setTo(t); };

  const openDialog = (flight: Flight, tClass: TicketClass) => {
    setSelectedFlight(flight); setSelectedClass(tClass);
    setPassengerClasses(Array(passCount).fill(tClass));
    setSeatMapMode(false); setActivePassengerIndex(null);
    setChosenSeats(Array(passCount).fill("")); 
    setChosenTypes(Array(passCount).fill("window" as SeatType));
    setUsedSeatSelection(false);
    setDialogOpen(true);
  };

  const toggleSeat = (seatId: string, type: SeatType) => {
    if (activePassengerIndex === null) return;
    setChosenSeats((prev) => {
      const next = [...prev];
      if (next[activePassengerIndex] === seatId) {
        next[activePassengerIndex] = "";
      } else {
        next[activePassengerIndex] = seatId;
      }
      return next;
    });
    setChosenTypes((prev) => {
      const next = [...prev];
      next[activePassengerIndex] = type;
      return next;
    });
    setActivePassengerIndex(null);
  };

  const handleConfirm = (withSeatMap: boolean) => {
    if (!selectedFlight) return;
    const taken: string[] = [];
    const finalSeats = Array.from({ length: passCount }, (_, i) => {
      if (withSeatMap && chosenSeats[i]) {
        taken.push(chosenSeats[i]);
        return chosenSeats[i];
      }
      const s = autoAssignSeat(passengerClasses[i] || selectedClass, selectedFlight.id, taken);
      taken.push(s); 
      return s;
    });
    const finalTypes = finalSeats.map((s, i) => {
      if (withSeatMap && chosenSeats[i]) return chosenTypes[i]; // keep manual type
      const autoType = getSeatType(s.replace(/\d+/, ""), passengerClasses[i] || selectedClass);
      return autoType;
    });

    setChosenSeats(finalSeats);
    setChosenTypes(finalTypes);
    setUsedSeatSelection(withSeatMap);
    setPassForms(Array.from({ length: passCount }, emptyPassenger));
    setPhoneErrors({}); setEmailErrors({});
    setDialogOpen(false); setView("info");
  };

  const updatePassenger = (idx: number, field: keyof PassengerInfo, value: string) => {
    setPassForms((prev) => { const next = [...prev]; next[idx] = { ...next[idx], [field]: value }; return next; });
  };

  /** Handle name fields: auto uppercase + no diacritics */
  const handleNameInput = (idx: number, field: keyof PassengerInfo, raw: string) => {
    updatePassenger(idx, field, normalizeToUppercase(raw));
  };

  /** Handle phone: digits only, allow leading 0 for display */
  const handlePhoneInput = (idx: number, raw: string) => {
    const clean = raw.replace(/\D/g, "");
    if (raw !== clean) {
      setPhoneErrors((prev) => ({ ...prev, [idx]: "Phone number must contain digits only" }));
    } else if (clean.length > 0 && clean.length < 6) {
      setPhoneErrors((prev) => ({ ...prev, [idx]: "Phone number must be at least 6 digits" }));
    } else {
      setPhoneErrors((prev) => { const n = { ...prev }; delete n[idx]; return n; });
    }
    updatePassenger(idx, "phone", clean);
  };

  /** Handle email: format check */
  const handleEmailInput = (idx: number, value: string) => {
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailReg.test(value)) {
      setEmailErrors((prev) => ({ ...prev, [idx]: "Please enter a valid email (e.g. user@example.com)" }));
    } else {
      setEmailErrors((prev) => { const n = { ...prev }; delete n[idx]; return n; });
    }
    updatePassenger(idx, "email", value);
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    // Check for validation errors
    const hasPhoneErr = Object.keys(phoneErrors).length > 0;
    const hasEmailErr = Object.keys(emailErrors).length > 0;
    if (hasPhoneErr || hasEmailErr) return;
    if (!selectedFlight) return;

    setExtraBaggageKg(passForms.map(() => 0));
    setView("summary");
  };

  const handleProceedToPayment = () => {
    if (!selectedFlight) return;
    const surcharge = chosenTypes.reduce((s, t, i) => s + (usedSeatSelection && chosenSeats[i] ? SEAT_SURCHARGE[t] : 0), 0);
    const baggageTotal = extraBaggageKg.reduce((s, kg) => s + kg * 30000, 0);
    const totalWithoutDiscount = basePrices.reduce((a, b) => a + b, 0) + surcharge + baggageTotal;
    const pointsUsed = applyPoints ? Math.min(userPoints, totalWithoutDiscount) : 0;
    const total = totalWithoutDiscount - pointsUsed;

    const now = new Date();
    // Strip leading 0 from phone numbers before saving
    const finalizedPassForms = passForms.map(p => ({
      ...p,
      phone: (p.phone || "").startsWith("0") ? p.phone.substring(1) : p.phone
    }));

    const ticket: BookedTicket = {
      id: "ticket-" + Date.now(), bookingRef: generateRef(),
      flight: selectedFlight, ticketClasses: passengerClasses,
      passengers: finalizedPassForms, seatNumbers: chosenSeats, seatTypes: chosenTypes,
      basePrices, seatSurchargeTotal: surcharge, totalPrice: total,
      usedSeatSelection,
      bookedAt: now.toISOString().split("T")[0],
      bookedAtTime: now.toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
      extraBaggageKg, pointsUsed, pointsEarned: Math.round(total * 0.02)
    };
    
    localStorage.setItem("tempBooking", JSON.stringify(ticket));
    router.push("/customer/payment");
  };

  // ════════════════════════════════════════════════
  // INVOICE VIEW
  // ════════════════════════════════════════════════
  if (view === "invoice" && booked) {
    const fl = booked.flight;
    const theme = CLASS_THEME[booked.ticketClasses[0]];
    return (
      <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-300">
        {/* Success banner */}
        <div className="flex items-center gap-4 bg-[#eef3f9] border border-[#c3d4e8] rounded-2xl p-5">
          <div className="w-14 h-14 rounded-full bg-[#dce8f4] flex items-center justify-center shrink-0">
            <Check className="w-7 h-7 text-[#1a3557]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1a3557]">Booking Confirmed!</h1>
            <p className="text-sm text-[#1e4069] mt-0.5">
              Booking reference: <strong className="font-mono text-[#1a3557] text-base">{booked.bookingRef}</strong>
            </p>
            <p className="text-xs text-[#2a527a] mt-0.5">Booked at: {booked.bookedAtTime}</p>
          </div>
        </div>

        <Card className="overflow-hidden shadow-lg border-0">
          <div className={`${theme.card} ${theme.text} px-6 py-4 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <Plane className="w-5 h-5" />
              <div><p className="font-bold text-lg">{fl.flightNumber}</p><p className="text-xs opacity-75">{fl.airline}</p></div>
            </div>
            <Badge className="bg-white/20 border-0 font-semibold text-inherit">MULTIPLE CLASSES</Badge>
          </div>
          <CardContent className="p-0">
            {/* Route */}
            <div className="p-6 grid grid-cols-3 items-center gap-4 border-b">
              <div className="text-center">
                <p className="text-4xl font-light text-[#1a3557]">{fl.departure.time}</p>
                <p className="text-xl font-bold mt-1">{fl.departure.code}</p>
                <p className="text-sm text-gray-500">{fl.departure.city}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-500">{fl.duration}</p>
                <div className="w-full flex items-center"><div className="h-px flex-1 bg-gray-200" /><Plane className="w-4 h-4 text-gray-300 mx-1" /><div className="h-px flex-1 bg-gray-200" /></div>
                <p className="text-xs text-gray-400">Direct flight</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-light text-[#1a3557]">{fl.arrival.time}</p>
                <p className="text-xl font-bold mt-1">{fl.arrival.code}</p>
                <p className="text-sm text-gray-500">{fl.arrival.city}</p>
              </div>
            </div>
            {/* Passengers */}
            <div className="p-6 border-b space-y-3">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2"><Users className="w-4 h-4" /> Passenger Information</h3>
              {booked.passengers.map((p, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div><span className="text-xs text-gray-400 block">Full Name</span><span className="font-semibold">{[p.title, p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ") || "—"}</span></div>
                  <div><span className="text-xs text-gray-400 block">Date of Birth</span><span>{formatDateDisplay(p.dateOfBirth)}</span></div>
                  <div>
                    <span className="text-xs text-gray-400 block">Seat</span>
                    <span className="font-bold text-[#0b5c66]">{booked.seatNumbers[i] || "—"}
                      {booked.usedSeatSelection && booked.seatTypes[i] && <span className="ml-1 text-xs font-normal text-gray-500">({SEAT_TYPE_INFO[booked.seatTypes[i]].label})</span>}
                    </span>
                  </div>
                  <div><span className="text-xs text-gray-400 block">Passport / ID</span><span className="font-mono">{p.cccd || "—"}</span></div>
                  <div><span className="text-xs text-gray-400 block">Phone</span><span>{p.countryCode} {p.phone || "—"}</span></div>
                  <div><span className="text-xs text-gray-400 block">Email</span><span>{p.email || "—"}</span></div>
                </div>
              ))}
            </div>
            {/* Price */}
            <div className="p-6 border-b">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3"><CreditCard className="w-4 h-4" /> Payment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Flight fare</span><span>{formatVND(booked.basePrices.reduce((a, b) => a + b, 0))} VND</span></div>
                {booked.seatSurchargeTotal > 0 && <div className="flex justify-between text-gray-600"><span>Seat selection fee</span><span>{formatVND(booked.seatSurchargeTotal)} VND</span></div>}
                <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-2"><span>Total</span><span className="text-[#1a3557] text-lg">{formatVND(booked.totalPrice)} VND</span></div>
                <div className="flex justify-between text-xs text-gray-400 border-t pt-2 mt-1">
                  <span>Booking time</span>
                  <span>{booked.bookedAtTime}</span>
                </div>
              </div>
            </div>
            <div className="p-6 flex flex-wrap gap-3 justify-end">
              <Button variant="outline" className="gap-2" onClick={() => window.print()}><Printer className="w-4 h-4" /> Print Ticket</Button>
              <Button className="gap-2 bg-[#1a3557] hover:bg-[#1a3557]" onClick={() => { setView("search"); setSearched(false); setBooked(null); }}><Plane className="w-4 h-4" /> Book Another</Button>
              <Button className="gap-2 bg-[#f5d020] hover:bg-yellow-500 text-gray-900 font-semibold" asChild>
                <Link href="/customer/my-tickets"><Ticket className="w-4 h-4" /> View My Tickets</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // PASSENGER INFO VIEW
  // ════════════════════════════════════════════════
  if (view === "info") {
    const theme = CLASS_THEME[passengerClasses[0] || selectedClass];
    const total = basePrices.reduce((a,b)=>a+b, 0) + totalSurcharge;

    return (
      <div className="animate-in fade-in duration-300">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => { setView("search"); setDialogOpen(false); }}>
            <ArrowRight className="w-5 h-5 rotate-180" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Passenger Information</h1>
            <p className="text-sm text-gray-500">
              {selectedFlight?.departure.code} → {selectedFlight?.arrival.code} · {passCount} passenger(s)
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left: forms */}
          <div className="lg:col-span-2">

        <form onSubmit={handleSubmitInfo} className="space-y-4">
            {Array.from({ length: passCount }).map((_, idx) => (
              <Card key={idx} className="overflow-hidden border border-[#dce8f4] shadow-sm">
                <CardHeader className="bg-[#eef3f9]/60 pb-3 border-b border-[#dce8f4]">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#1a3557] text-white flex items-center justify-center text-sm font-bold">{idx + 1}</div>
                    Passenger {idx + 1}
                    <Badge variant="outline" className="ml-auto font-mono text-[#1a3557] border-[#3a6090] text-xs">
                      Seat: {chosenSeats[idx] || "Auto"}
                      {usedSeatSelection && chosenTypes[idx] ? ` (${SEAT_TYPE_INFO[chosenTypes[idx]].label})` : ""}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 bg-white space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <Label>Title <span className="text-red-500">*</span></Label>
                      <Select value={passForms[idx]?.title ?? "Mr"} onValueChange={(v) => updatePassenger(idx, "title", v)}>
                        <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>{["Mr", "Mrs", "Ms", "Dr", "Prof"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Last Name <span className="text-red-500">*</span></Label>
                      <Input required placeholder="e.g. NGUYEN" value={passForms[idx]?.lastName ?? ""} onChange={(e) => handleNameInput(idx, "lastName", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Middle Name</Label>
                      <Input placeholder="e.g. THI (optional)" value={passForms[idx]?.middleName ?? ""} onChange={(e) => handleNameInput(idx, "middleName", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>First Name <span className="text-red-500">*</span></Label>
                      <Input required placeholder="e.g. AN" value={passForms[idx]?.firstName ?? ""} onChange={(e) => handleNameInput(idx, "firstName", e.target.value)} />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 -mt-2 italic">Names are automatically converted to uppercase and unaccented (as on passport)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Date of Birth <span className="text-red-500">*</span></Label>
                      <Input required type="date" max={TODAY} value={passForms[idx]?.dateOfBirth ?? ""} onChange={(e) => updatePassenger(idx, "dateOfBirth", e.target.value)} />
                      <p className="text-[10px] text-gray-400">Format: DD/MM/YYYY – use the calendar icon to pick a date</p>
                    </div>
                    <div className="space-y-1">
                      <Label>Passport / National ID <span className="text-red-500">*</span></Label>
                      <Input required placeholder="Enter document number" value={passForms[idx]?.cccd ?? ""} onChange={(e) => updatePassenger(idx, "cccd", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Email Address <span className="text-red-500">*</span></Label>
                    <Input required type="email" placeholder="email@example.com" value={passForms[idx]?.email ?? ""} onChange={(e) => handleEmailInput(idx, e.target.value)} className={emailErrors[idx] ? "border-red-400 focus-visible:ring-red-300" : ""} />
                    {emailErrors[idx] && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {emailErrors[idx]}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label>Phone Type <span className="text-red-500">*</span></Label>
                      <Select value={passForms[idx]?.phoneType ?? "personal"} onValueChange={(v) => updatePassenger(idx, "phoneType", v as "personal" | "business")}>
                        <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="personal">📱 Personal</SelectItem>
                          <SelectItem value="business">💼 Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Country Code <span className="text-red-500">*</span></Label>
                      <Select value={passForms[idx]?.countryCode ?? "+84"} onValueChange={(v) => updatePassenger(idx, "countryCode", v)}>
                        <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-60">
                          {COUNTRY_CODES.map((c) => (
                            <SelectItem key={c.dial + c.name} value={c.dial}>{c.dial} · {c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Phone Number <span className="text-red-500">*</span></Label>
                      <Input required type="tel" inputMode="numeric" placeholder="e.g. 0901234567" value={passForms[idx]?.phone ?? ""} onChange={(e) => handlePhoneInput(idx, e.target.value)} className={phoneErrors[idx] ? "border-red-400 focus-visible:ring-red-300" : ""} />
                      {phoneErrors[idx] && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {phoneErrors[idx]}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="bg-[#eef3f9] p-3 rounded-xl flex items-start gap-2 border border-[#dce8f4]">
              <MapPin className="w-4 h-4 text-[#1e4069] mt-0.5 shrink-0" />
              <p className="text-xs text-[#1a3557]">Passenger names must exactly match the identity document used for check-in.</p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="lg" className="bg-[#f5d020] text-gray-900 hover:bg-yellow-500 font-semibold gap-2 px-8">
                <FileText className="w-4 h-4" /> Next to Summary &amp; Baggage
              </Button>
            </div>
          </form>
          </div>

          {/* Right: booking sidebar */}
          {selectedFlight && (
            <div className="space-y-4 sticky top-6">
              <Card className="border border-[#dce8f4] shadow-md rounded-2xl overflow-hidden">
                <div className={`${theme.card} ${theme.text} px-5 py-4`}>
                  <p className="text-xs opacity-75 font-medium mb-1">Your trip</p>
                  <p className="text-2xl font-bold">{selectedFlight.departure.code} → {selectedFlight.arrival.code}</p>
                  <p className="text-sm opacity-80 mt-0.5">{selectedFlight.departure.time} – {selectedFlight.arrival.time}</p>
                </div>
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Flight</span>
                    <span className="font-semibold text-gray-800">{selectedFlight.flightNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-semibold text-gray-800">{selectedFlight.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Passengers</span>
                    <span className="font-semibold text-gray-800">{passCount}</span>
                  </div>
                  <div className="h-px bg-gray-100" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Base fare</span>
                    <span className="font-semibold text-gray-800">{formatVND(basePrices.reduce((a,b)=>a+b,0))} VND</span>
                  </div>
                  {totalSurcharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Seat fee</span>
                      <span className="font-semibold text-gray-800">{formatVND(totalSurcharge)} VND</span>
                    </div>
                  )}
                  <div className="h-px bg-gray-200" />
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-800">Total due</span>
                    <span className="font-black text-[#1a3557] text-lg">{formatVND(total)} VND</span>
                  </div>
                  {!usedSeatSelection && (
                    <p className="text-[10px] text-gray-400 italic">Seat auto-assigned · no extra charge</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // SUMMARY & BAGGAGE VIEW
  // ════════════════════════════════════════════════
  if (view === "summary") {
    const surcharge = chosenTypes.reduce((s, t, i) => s + (usedSeatSelection && chosenSeats[i] ? SEAT_SURCHARGE[t] : 0), 0);
    const baggageTotal = extraBaggageKg.reduce((s, kg) => s + kg * 30000, 0);
    const totalWithoutDiscount = basePrices.reduce((a,b)=>a+b, 0) + surcharge + baggageTotal;
    const pointsUsed = applyPoints ? Math.min(userPoints, totalWithoutDiscount) : 0;
    const finalTotal = totalWithoutDiscount - pointsUsed;

    return (
      <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setView("info")}>
            <ArrowRight className="w-5 h-5 rotate-180" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Ticket Summary</h1>
            <p className="text-sm text-gray-500">Review your tickets, add extra baggage, and apply point rewards.</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Tickets</h2>
            <Badge variant="outline" className="bg-[#eef3f9] border-[#c3d4e8] text-[#1a3557]">
              {selectedFlight?.departure.code} → {selectedFlight?.arrival.code}
            </Badge>
          </div>
          <CardContent className="p-0 divide-y">
            {passForms.map((p, i) => (
              <div key={i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium mb-1">Passenger {i + 1}</p>
                  <p className="font-bold text-gray-900 text-lg">{[p.title, p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ")}</p>
                  <div className="flex gap-3 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded text-xs font-semibold shadow-sm">
                      Seat {chosenSeats[i]}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1 px-2 py-0.5">
                      Includes 20kg Checked Baggage
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <p className="text-[10px] font-bold text-[#1a3557] uppercase tracking-widest">Extra Checked Baggage</p>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-full border-[#3a6090] text-[#1a3557] hover:bg-[#eef3f9]" 
                      onClick={() => setExtraBaggageKg(prev => { const n = [...prev]; n[i] = Math.max(0, n[i] - 1); return n; })}>
                      -
                    </Button>
                    <div className="w-12 text-center font-bold text-[#1a3557]">{extraBaggageKg[i] || 0} kg</div>
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-full border-[#3a6090] text-[#1a3557] hover:bg-[#eef3f9]" 
                      onClick={() => setExtraBaggageKg(prev => { const n = [...prev]; n[i] = n[i] + 1; return n; })}>
                      +
                    </Button>
                  </div>
                  {extraBaggageKg[i] > 0 && (
                    <p className="text-[11px] font-bold text-[#1e4069]">+{formatVND(extraBaggageKg[i] * 30000)} VND</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Point reward */}
        <Card className="border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">💎</div>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-yellow-800 flex items-center gap-2">Point reward</h3>
                <p className="text-sm text-yellow-700 mt-1">You have <strong className="font-bold">{formatVND(userPoints)}</strong> points available.</p>
                <p className="text-[10px] text-yellow-600/80 mt-1 font-bold">1 point = 1 VND discount.</p>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => setApplyPoints(!applyPoints)}
                  variant={applyPoints ? "default" : "outline"}
                  className={`w-full sm:w-auto font-bold h-12 px-6 rounded-xl transition-all ${applyPoints ? "bg-[#f5d020] hover:bg-yellow-400 text-gray-900 border-none shadow-md" : "bg-white border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"}`}
                >
                  {applyPoints ? '✓ Applied Points' : 'Apply Points'}
                </Button>
              </div>
            </div>
            {applyPoints && (
              <div className="mt-4 p-3 bg-white/60 rounded-xl border border-yellow-200 text-sm font-medium text-yellow-900 animate-in slide-in-from-top-2 flex justify-between">
                <span>Applied maximum possible discount:</span>
                <span className="font-bold text-red-600">-{formatVND(pointsUsed)} VND</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl overflow-hidden bg-[#1a3557]">
          <CardContent className="p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="text-sm text-white/70 font-medium">Grand Total</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black">{formatVND(finalTotal)}</p>
                <p className="text-sm text-white/50">VND</p>
              </div>
              {applyPoints && <p className="text-xs text-yellow-300">{formatVND(pointsUsed)} points used</p>}
            </div>
            
            <Button 
              size="lg" 
              onClick={handleProceedToPayment}
              className="bg-[#f5d020] hover:bg-yellow-500 text-gray-900 font-bold text-lg h-14 px-8 shadow-lg shadow-black/10 rounded-xl"
            >
              Proceed to Payment <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // SEARCH & RESULTS
  // ════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* Hero search */}
      <section className="relative overflow-hidden rounded-[32px]">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://i.pinimg.com/736x/b2/6c/b3/b26cb30b1cb84889d8dae4c43a0f3958.jpg')" }} />
        <div className="absolute inset-0 bg-slate-900/40" />
        <div className="relative z-10 p-6 md:p-8">
          <div className="mb-6 text-white">
            <h1 className="text-3xl font-bold md:text-4xl">Book a Flight</h1>
            <p className="mt-2 text-white/80">Search and book your next adventure</p>
          </div>
          <Card className="border-0 bg-white/70 shadow-2xl backdrop-blur">
            <CardHeader>
              <CardTitle>Flight Search</CardTitle>
              <CardDescription>Enter your journey details to find available flights</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={tripType} onValueChange={setTripType} className="w-full">
                <TabsList className="mb-6 grid h-12 w-full max-w-[360px] grid-cols-2 rounded-2xl bg-slate-100 p-1">
                  <TabsTrigger value="roundtrip" className="rounded-xl text-sm font-medium">Round Trip</TabsTrigger>
                  <TabsTrigger value="oneway" className="rounded-xl text-sm font-medium">One Way</TabsTrigger>
                </TabsList>
                <TabsContent value={tripType} className="mt-0">
                  <div className="grid grid-cols-12 items-start gap-4">
                    <div className="col-span-12 md:col-span-3">
                      <Label className="mb-2 flex items-center gap-2"><Plane className="h-4 w-4" />From</Label>
                      <Select value={from} onValueChange={setFrom}>
                        <SelectTrigger className="h-12 rounded-xl bg-white"><SelectValue placeholder="Select airport" /></SelectTrigger>
                        <SelectContent>{AIRPORTS.map((a) => <SelectItem key={a.code} value={a.code}>{a.city} ({a.code})</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-12 md:col-span-1 md:pt-7">
                      <div className="flex h-12 items-center justify-center">
                        <Button type="button" variant="outline" size="icon" className="h-12 w-12 rounded-full bg-white" onClick={swapAirports}>
                          <ArrowRightLeft className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-3">
                      <Label className="mb-2 flex items-center gap-2"><Plane className="h-4 w-4 rotate-90" />To</Label>
                      <Select value={to} onValueChange={setTo}>
                        <SelectTrigger className="h-12 rounded-xl bg-white"><SelectValue placeholder="Select airport" /></SelectTrigger>
                        <SelectContent>{AIRPORTS.map((a) => <SelectItem key={a.code} value={a.code}>{a.city} ({a.code})</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-12 md:col-span-2">
                      <Label className="mb-2 flex items-center gap-2"><Calendar className="h-4 w-4" />Depart</Label>
                      <Input type="date" min={TODAY} value={departDate}
                        onChange={(e) => { setDepartDate(e.target.value); if (returnDate && e.target.value > returnDate) setReturnDate(""); }}
                        className="h-12 rounded-xl bg-white" />
                    </div>
                    <div className="col-span-12 md:col-span-2">
                      <Label className="mb-2 flex items-center gap-2"><Calendar className="h-4 w-4" />Return</Label>
                      <Input type="date" min={departDate || TODAY} value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        disabled={tripType === "oneway"}
                        className="h-12 rounded-xl bg-white" />
                    </div>
                    <div className="col-span-12 md:col-span-1">
                      <Label className="mb-2 flex items-center gap-2"><Users className="h-4 w-4" />Guests</Label>
                      <Select value={passengers} onValueChange={setPassengers}>
                        <SelectTrigger className="h-12 rounded-xl bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>{[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-12 flex items-end pt-2">
                      <Button type="button" onClick={() => setSearched(true)} className="h-12 w-full gap-2 rounded-xl text-base font-semibold bg-[#1a3557] hover:bg-[#1a3557]">
                        <Search className="h-5 w-5" /> Search Flights
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Flight results */}
      {searched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {filteredFlights.length > 0 ? `${filteredFlights.length} flight(s) found` : "No flights found"}
            </h2>
            {filteredFlights.length > 0 && <p className="text-sm text-gray-500">{passengers} passenger(s)</p>}
          </div>

          {filteredFlights.length === 0 ? (
            <Card className="p-10 text-center">
              <Plane className="mx-auto mb-4 h-14 w-14 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground">No flights match your search. Try leaving airports blank to see all available flights.</p>
            </Card>
          ) : (
            filteredFlights.map((flight) => {
              const econPrice = getBasePrice(flight.id, "economy");
              const busPrice = getBasePrice(flight.id, "business");
              const firstPrice = getBasePrice(flight.id, "firstClass");
              const econSold = flight.seatsAvailable.economy === 0;
              const busSold = flight.seatsAvailable.business === 0;
              const firstSold = flight.seatsAvailable.firstClass === 0;

              const SoldOutCol = ({ label, wide }: { label: string; wide?: boolean }) => (
                <div className={`relative ${wide ? "w-full sm:w-44" : "w-full sm:w-40"} p-4 flex flex-col justify-center items-center bg-gray-100 border-t sm:border-t-0 sm:border-l border-gray-200 cursor-not-allowed`}>
                  <p className="text-xs font-bold text-gray-400 mb-2 text-center leading-tight">{label}</p>
                  <div className="mt-1 px-4 py-1.5 bg-gray-300 rounded-lg">
                    <p className="text-sm font-bold text-gray-500">SOLD OUT</p>
                  </div>
                </div>
              );

              return (
                <div key={flight.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col xl:flex-row hover:shadow-md transition-shadow">
                  {/* Flight info */}
                  <div className="p-6 flex-1 flex flex-col justify-center min-w-[300px]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-center">
                        <p className="text-3xl font-light text-[#1a3557]">{flight.departure.time}</p>
                        <p className="text-sm font-bold text-gray-800 mt-1">{flight.departure.code}</p>
                        <p className="text-xs text-gray-500">{flight.departure.city}</p>
                      </div>
                      <div className="flex flex-col items-center flex-1 px-3">
                        <p className="text-xs text-[#1e4069] font-medium mb-1">Direct flight</p>
                        <div className="w-full flex items-center">
                          <div className="h-px flex-1 border-t-2 border-dashed border-gray-200" />
                          <Plane className="w-4 h-4 text-gray-300 mx-1" />
                          <div className="h-px flex-1 border-t-2 border-dashed border-gray-200" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-light text-[#1a3557]">{flight.arrival.time}</p>
                        <p className="text-sm font-bold text-gray-800 mt-1">{flight.arrival.code}</p>
                        <p className="text-xs text-gray-500">{flight.arrival.city}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Flight time: {flight.duration}</span>
                      <span className="flex items-center gap-1 font-medium text-gray-700">✈ {flight.flightNumber} · Operated by {flight.airline} <span className="text-yellow-500">🪷</span></span>
                      {flight.discount && <Badge variant="destructive" className="mt-1 text-[10px]">{flight.discount}% OFF</Badge>}
                      <a href="#" className="text-[#1e4069] font-medium hover:underline block mt-1">Flight details ↗</a>
                    </div>
                  </div>

                  {/* Ticket class columns */}
                  <div className="flex flex-col sm:flex-row border-t xl:border-t-0 xl:border-l border-gray-200">
                    {econSold ? <SoldOutCol label="ECONOMY" /> : (
                      <div onClick={() => openDialog(flight, "economy")}
                        className="relative w-full sm:w-40 p-4 flex flex-col justify-center items-center bg-[#1a3557] text-white hover:bg-[#1a3557] cursor-pointer transition-all hover:scale-[1.02]">
                        <p className="text-sm font-bold mb-1">ECONOMY</p>
                        <p className="text-[10px] opacity-75">from</p>
                        <p className="text-base font-bold">{formatVND(econPrice)}</p>
                        <p className="text-[10px] opacity-75">VND</p>
                        <ChevronDown className="w-4 h-4 mt-1 opacity-60" />
                      </div>
                    )}
                    {busSold ? <SoldOutCol label="PREMIUM ECONOMY" wide /> : (
                      <div onClick={() => openDialog(flight, "business")}
                        className="relative w-full sm:w-44 p-4 flex flex-col justify-center items-center bg-[#f07832] text-white hover:bg-[#e0681e] cursor-pointer transition-all hover:scale-[1.02] border-t sm:border-t-0 sm:border-l border-white/20">
                        {flight.seatsAvailable.business <= 6 && (
                          <span className="block text-center bg-orange-900/60 text-white text-[10px] px-2 py-0.5 rounded-full mb-1 whitespace-nowrap">{flight.seatsAvailable.business} seats left</span>
                        )}
                        <p className="text-sm font-bold mb-1 text-center leading-tight">PREMIUM<br />ECONOMY</p>
                        <p className="text-[10px] opacity-75">from</p>
                        <p className="text-base font-bold">{formatVND(busPrice)}</p>
                        <p className="text-[10px] opacity-75">VND</p>
                        <ChevronDown className="w-4 h-4 mt-1 opacity-60" />
                      </div>
                    )}
                    {firstSold ? <SoldOutCol label="BUSINESS" /> : (
                      <div onClick={() => openDialog(flight, "firstClass")}
                        className="relative w-full sm:w-40 p-4 flex flex-col justify-center items-center bg-[#f5d020] text-gray-900 hover:bg-[#e5c010] cursor-pointer transition-all hover:scale-[1.02] border-t sm:border-t-0 sm:border-l border-white/20">
                        {flight.seatsAvailable.firstClass <= 4 && (
                          <span className="block text-center bg-yellow-900/40 text-gray-900 text-[10px] px-2 py-0.5 rounded-full mb-1 whitespace-nowrap">{flight.seatsAvailable.firstClass} seats left</span>
                        )}
                        <p className="text-sm font-bold mb-1 text-center">BUSINESS</p>
                        <p className="text-[10px] opacity-75">from</p>
                        <p className="text-base font-bold">{formatVND(firstPrice)}</p>
                        <p className="text-[10px] opacity-75">VND</p>
                        <ChevronDown className="w-4 h-4 mt-1 opacity-60" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Ticket Dialog ─────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedFlight && (
          <DialogContent className={`${seatMapMode ? "max-w-xl" : "max-w-md"} bg-white backdrop-blur-sm border-gray-200 p-0 overflow-hidden [&>button]:hidden`}>
            <DialogTitle className="sr-only">Flight Details</DialogTitle>

            {/* Detail view */}
            {!seatMapMode && (
              <div className="p-7 relative">
                <button onClick={() => setDialogOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
                <div className="space-y-4 mt-2">
                  <div className="text-center border-b border-[#c3d4e8] pb-4">
                    <p className="text-gray-500 text-sm mb-1">Route</p>
                    <p className="font-bold text-3xl text-[#0b5c66] tracking-tight">{selectedFlight.departure.code} – {selectedFlight.arrival.code}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm">Flight time:</span>
                    <span className="ml-auto font-bold text-gray-800">{selectedFlight.duration}</span>
                  </div>
                  <div className="relative pl-5 border-l-2 border-gray-300 space-y-5 py-1 ml-1">
                    <div className="relative border-b border-gray-100 pb-3">
                      <div className="absolute w-3 h-3 bg-gray-400 rounded-full -left-[27px] top-1 border-2 border-white" />
                      <p className="text-gray-400 text-xs mb-1">Departs</p>
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-gray-800">{selectedFlight.departure.city} ({selectedFlight.departure.code})</p>
                        <p className="font-bold text-gray-900 border border-gray-200 bg-white px-2 py-0.5 rounded shadow-sm">{selectedFlight.departure.time}</p>
                      </div>
                    </div>
                    <div className="relative pt-1">
                      <div className="absolute w-3 h-3 bg-[#1a3557] rounded-full -left-[27px] top-2 border-2 border-white" />
                      <p className="text-gray-400 text-xs mb-1">Arrives</p>
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-gray-800">{selectedFlight.arrival.city} ({selectedFlight.arrival.code})</p>
                        <p className="font-bold text-gray-900 border border-gray-200 bg-white px-2 py-0.5 rounded shadow-sm">{selectedFlight.arrival.time}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center border-t border-gray-200 pt-4">
                    <p className="text-gray-500 text-sm mb-1">Flight no.</p>
                    <p className="font-bold text-xl text-[#1a3557] tracking-wider">{selectedFlight.flightNumber}</p>
                  </div>
                  <div className={`${CLASS_THEME[selectedClass].card} ${CLASS_THEME[selectedClass].text} rounded-xl p-3 flex justify-between items-center`}>
                    <span className="text-sm font-semibold">{CLASS_LABELS[selectedClass]}</span>
                    <span className="font-bold text-xs text-right">Default Base Fare<br/>{formatVND(getBasePrice(selectedFlight.id, selectedClass))} VND / person</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 flex gap-2 text-xs text-amber-800">
                    <span className="shrink-0 mt-0.5">🪑</span>
                    <span>
                      <strong>Confirm</strong> = auto-assigned for free. <strong>Configure Passengers</strong> = pick details.
                    </span>
                  </div>
                </div>
                <div className="mt-7 flex flex-col items-end gap-3">
                  <Button onClick={() => setSeatMapMode(true)} className="bg-[#1a3557] hover:bg-[#0f1f33] text-white px-8 w-56 gap-2">
                    🪑 Configure Passengers
                  </Button>
                  <Button onClick={() => handleConfirm(false)} className="bg-[#f5d020] hover:bg-yellow-500 text-gray-900 font-semibold px-8 w-56 gap-2">
                    <ChevronRight className="w-4 h-4" /> Confirm
                  </Button>
                </div>
              </div>
            )}

            {/* Configure Passenger List View */}
            {seatMapMode && activePassengerIndex === null && (
              <div className="p-6 relative max-h-[85vh] overflow-y-auto w-full">
                <button onClick={() => setDialogOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
                <div className="flex items-center gap-2 mb-6">
                  <button type="button" onClick={() => setSeatMapMode(false)} className="text-gray-400 hover:text-gray-700">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Configure Passengers</h3>
                    <p className="text-xs text-gray-500">{selectedFlight.departure.code}→{selectedFlight.arrival.code} · {passCount} passenger(s)</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {Array.from({ length: passCount }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-[#dce8f4] shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#1a3557]">Passenger {i + 1}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Label className="text-[10px] text-gray-500 uppercase">Ticket Class</Label>
                          <Select 
                            value={passengerClasses[i]} 
                            onValueChange={(v: TicketClass) => {
                              const next = [...passengerClasses]; next[i] = v; setPassengerClasses(next);
                              if (chosenSeats[i]) {
                                const nextSeats = [...chosenSeats]; nextSeats[i] = ""; setChosenSeats(nextSeats);
                                const nextTypes = [...chosenTypes]; nextTypes[i] = "window" as SeatType; setChosenTypes(nextTypes);
                              }
                            }}
                          >
                            <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-white">
                              {(["economy", "business", "firstClass"] as TicketClass[]).map(c => (
                                <SelectItem key={c} value={c} disabled={selectedFlight.seatsAvailable[c] === 0}>
                                  {CLASS_LABELS[c]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Label className="text-[10px] text-gray-500 uppercase">Seat</Label>
                          <Button 
                            variant={chosenSeats[i] ? "default" : "outline"} 
                            className={`w-full mt-1 h-9 ${chosenSeats[i] ? 'bg-[#1a3557] hover:bg-[#1a3557] text-white' : ''}`}
                            onClick={() => setActivePassengerIndex(i)}
                          >
                            {chosenSeats[i] || "Choose Seat"}
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center bg-[#eef3f9] p-2 rounded-lg mt-2">
                        <span className="text-xs text-gray-500 font-semibold uppercase">Base Fare</span>
                        <span className="font-bold text-[#1a3557]">{formatVND(getBasePrice(selectedFlight.id, passengerClasses[i]))} VND</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setSeatMapMode(false)}>Cancel</Button>
                  <Button onClick={() => handleConfirm(true)}
                    className="bg-[#f5d020] hover:bg-yellow-500 text-gray-900 font-bold px-6">
                    <Check className="w-4 h-4 mr-2" /> Confirm &amp; Book
                  </Button>
                </div>
              </div>
            )}

            {/* Individual Seat Map view */}
            {seatMapMode && activePassengerIndex !== null && (
              <div className="p-5 relative">
                <div className="flex items-center gap-2 mb-4">
                  <button type="button" onClick={() => setActivePassengerIndex(null)} className="text-gray-400 hover:text-gray-700">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                  <div>
                    <h3 className="font-bold text-gray-800">Passenger {activePassengerIndex + 1} Seat</h3>
                    <p className="text-xs text-gray-500">{CLASS_LABELS[passengerClasses[activePassengerIndex]]} Class</p>
                  </div>
                </div>
                <div className="h-[65vh] overflow-y-auto no-scrollbar pb-6 px-1">
                  <AirplaneSeatMap
                    ticketClass={passengerClasses[activePassengerIndex]} 
                    flightId={selectedFlight.id}
                    passengerCount={1} 
                    selectedSeats={chosenSeats[activePassengerIndex] ? [chosenSeats[activePassengerIndex]] : []} 
                    selectedTypes={chosenTypes[activePassengerIndex] ? [chosenTypes[activePassengerIndex]] : []}
                    basePrice={getBasePrice(selectedFlight.id, passengerClasses[activePassengerIndex])} 
                    onToggle={toggleSeat}
                    takenSeats={chosenSeats.filter((s, i) => i !== activePassengerIndex && s !== "")}
                  />
                </div>
              </div>
            )}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}