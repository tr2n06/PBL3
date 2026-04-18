"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  X, Plane, Clock, ChevronRight, Check, ArrowRight,
  Users, MapPin, CreditCard, Mail, LogIn, FileText,
} from "lucide-react";
import type { Flight } from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────────────────────
type TicketClass = "economy" | "business" | "firstClass";
type SeatType = "window" | "aisle" | "middle";
type ModalView = "flight-detail" | "configure" | "seatmap" | "login-prompt" | "info" | "summary" | "confirmed";

interface PassengerInfo {
  title: string; firstName: string; middleName: string; lastName: string;
  dateOfBirth: string; cccd: string; email: string;
  phoneType: "personal" | "business"; countryCode: string; phone: string;
}
function emptyPassenger(): PassengerInfo {
  return { title: "Mr", firstName: "", middleName: "", lastName: "", dateOfBirth: "", cccd: "", email: "", phoneType: "personal", countryCode: "+84", phone: "" };
}

interface SeatColDef { col: string; type: SeatType; }

// ─── Constants ────────────────────────────────────────────────────────────────
const PRICE_RANGES: Record<TicketClass, readonly [number, number]> = {
  economy: [3_000_000, 3_500_000],
  business: [4_500_000, 5_200_000],
  firstClass: [8_000_000, 10_000_000],
} as const;

const SEAT_SURCHARGE: Record<SeatType, number> = { window: 350_000, aisle: 150_000, middle: 0 };

const SEAT_TYPE_INFO: Record<SeatType, { label: string; icon: string; available: string; dot: string; labelColor: string }> = {
  window: { label: "Window", icon: "🪟", available: "border-[#3a6090] bg-[#eef3f9] text-[#1a3557] hover:bg-[#dce8f4]", dot: "bg-[#3a6090]", labelColor: "text-[#1e4069] bg-[#eef3f9]" },
  aisle:  { label: "Aisle",  icon: "↔",  available: "border-emerald-400 bg-emerald-50 text-emerald-800 hover:bg-emerald-100", dot: "bg-emerald-400", labelColor: "text-emerald-600 bg-emerald-50" },
  middle: { label: "Middle", icon: "●",  available: "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100", dot: "bg-amber-300", labelColor: "text-amber-700 bg-amber-50" },
};

const CABIN_CONFIG: Record<TicketClass, { rows: number[]; left: SeatColDef[]; right: SeatColDef[]; label: string; layout: string }> = {
  economy:    { rows: [20,21,22,23,24,25,26,27], left: [{col:"A",type:"window"},{col:"B",type:"middle"},{col:"C",type:"aisle"}],  right: [{col:"D",type:"aisle"},{col:"E",type:"middle"},{col:"F",type:"window"}], label: "Economy Cabin", layout: "3 – 3" },
  business:   { rows: [5,6,7,8,9,10],             left: [{col:"A",type:"window"},{col:"B",type:"aisle"}],                           right: [{col:"C",type:"aisle"},{col:"D",type:"window"}],                         label: "Premium Economy Cabin", layout: "2 – 2" },
  firstClass: { rows: [1,2,3,4],                  left: [{col:"A",type:"window"}],                                                  right: [{col:"B",type:"window"}],                                                label: "Business Suite", layout: "1 – 1 (Luxury Pods)" },
};

const CLASS_LABELS: Record<TicketClass, string> = { economy: "Economy", business: "Premium Economy", firstClass: "Business" };
const CLASS_THEME: Record<TicketClass, { card: string; text: string }> = {
  economy:    { card: "bg-[#5aabe8]", text: "text-white" },
  business:   { card: "bg-[#f07832]", text: "text-white" },
  firstClass: { card: "bg-[#f5d020]", text: "text-gray-900" },
};

const COUNTRY_CODES = [
  { dial: "+84", name: "Vietnam 🇻🇳" }, { dial: "+1", name: "USA/Canada 🇺🇸" },
  { dial: "+44", name: "UK 🇬🇧" }, { dial: "+33", name: "France 🇫🇷" },
  { dial: "+81", name: "Japan 🇯🇵" }, { dial: "+65", name: "Singapore 🇸🇬" },
  { dial: "+61", name: "Australia 🇦🇺" }, { dial: "+86", name: "China 🇨🇳" },
  { dial: "+82", name: "Korea 🇰🇷" }, { dial: "+66", name: "Thailand 🇹🇭" },
  { dial: "+60", name: "Malaysia 🇲🇾" }, { dial: "+62", name: "Indonesia 🇮🇩" },
  { dial: "+49", name: "Germany 🇩🇪" }, { dial: "+39", name: "Italy 🇮🇹" },
  { dial: "+34", name: "Spain 🇪🇸" }, { dial: "+7",  name: "Russia 🇷🇺" },
  { dial: "+971", name: "UAE 🇦🇪" }, { dial: "+91", name: "India 🇮🇳" },
  { dial: "+55", name: "Brazil 🇧🇷" }, { dial: "+27", name: "S.Africa 🇿🇦" },
];

const TODAY = new Date().toISOString().split("T")[0];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatVND(n: number) { return new Intl.NumberFormat("vi-VN").format(n); }
function hashStr(s: string): number { let h = 5381; for (let i = 0; i < s.length; i++) h = (((h << 5) + h) ^ s.charCodeAt(i)) | 0; return Math.abs(h); }
function getBasePrice(flightId: string, tClass: TicketClass): number { const [min, max] = PRICE_RANGES[tClass]; return Math.round((min + (hashStr(flightId + tClass) % (max - min))) / 50_000) * 50_000; }
function isSeatOccupied(flightId: string, seatId: string) { return hashStr(flightId + seatId) % 4 === 0; }
function getSeatType(col: string, tClass: TicketClass): SeatType { const all = [...CABIN_CONFIG[tClass].left, ...CABIN_CONFIG[tClass].right]; return all.find((c) => c.col === col)?.type ?? "middle"; }
function autoAssignSeat(tClass: TicketClass, flightId: string, taken: string[]): string { const { rows, left, right } = CABIN_CONFIG[tClass]; for (const row of rows) for (const { col } of [...left, ...right]) { const id = `${row}${col}`; if (!isSeatOccupied(flightId, id) && !taken.includes(id)) return id; } return `${rows[0]}${left[0].col}`; }
function generateRef(): string { const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; return "SL-BK-" + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""); }
function normalizeToUppercase(str: string): string { return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đ]/g, "d").replace(/[Đ]/g, "D").toUpperCase(); }

// ─── AirplaneSeatMap ──────────────────────────────────────────────────────────
interface SeatMapProps {
  ticketClass: TicketClass; flightId: string;
  passengerCount: number; selectedSeats: string[]; selectedTypes: SeatType[];
  basePrice: number; onToggle: (seatId: string, type: SeatType) => void;
  takenSeats?: string[];
}
function AirplaneSeatMap({ ticketClass, flightId, passengerCount, selectedSeats, selectedTypes, onToggle, takenSeats = [] }: SeatMapProps) {
  const { rows, left, right, label, layout } = CABIN_CONFIG[ticketClass];
  const totalSurcharge = selectedTypes.reduce((s, t) => s + SEAT_SURCHARGE[t], 0);
  const ready = selectedSeats.length === passengerCount;

  const SeatBtn = ({ col, type, row }: { col: string; type: SeatType; row: number }) => {
    const id = `${row}${col}`;
    const occupied = isSeatOccupied(flightId, id) || takenSeats.includes(id);
    const selected = selectedSeats.includes(id);
    let cls = "w-10 h-10 rounded-xl text-xs font-bold border-2 transition-all duration-150 flex items-center justify-center ";
    if (occupied) cls += "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed";
    else if (selected) cls += "bg-[#0b5c66] border-[#0b5c66] text-white scale-110 shadow-lg ring-2 ring-[#0b5c66]/30";
    else cls += SEAT_TYPE_INFO[type].available + " cursor-pointer hover:scale-105 hover:shadow-sm";
    return (
      <button type="button" disabled={occupied} onClick={() => onToggle(id, type)}
        title={occupied ? "Taken" : `${SEAT_TYPE_INFO[type].label} · ${SEAT_SURCHARGE[type] > 0 ? "+" + formatVND(SEAT_SURCHARGE[type]) + " VND" : "Free"}`}
        className={cls}>
        {occupied ? "✕" : selected ? "✓" : col}
      </button>
    );
  };

  return (
    <div className="flex flex-col select-none">
      <div className="text-center mb-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</p>
        <p className="text-[10px] text-gray-400">Seating layout: {layout}</p>
      </div>
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
      <div className="relative mx-auto w-full">
        <div className="flex justify-center mb-1">
          <div className="flex flex-col items-center">
            <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[28px] border-l-transparent border-r-transparent border-b-slate-200" />
            <div className="w-10 h-1 bg-slate-200" />
          </div>
        </div>
        <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50 border-2 border-slate-200 rounded-2xl shadow-inner overflow-hidden relative">
          <div className="absolute left-0 top-14 bottom-4 w-3 flex flex-col justify-around pl-0.5 pointer-events-none">
            {rows.map((r) => <div key={r} className="w-2 h-3 bg-sky-200/80 rounded-sm mx-auto" />)}
          </div>
          <div className="absolute right-0 top-14 bottom-4 w-3 flex flex-col justify-around pr-0.5 pointer-events-none">
            {rows.map((r) => <div key={r} className="w-2 h-3 bg-sky-200/80 rounded-sm mx-auto" />)}
          </div>
          <div className="px-5 py-3">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="w-8 shrink-0" />
              {left.map(({ col, type }) => (<div key={col} className="w-10 flex justify-center"><span className="text-base leading-none">{SEAT_TYPE_INFO[type].icon}</span></div>))}
              <span className="w-6 shrink-0" />
              {right.map(({ col, type }) => (<div key={col} className="w-10 flex justify-center"><span className="text-base leading-none">{SEAT_TYPE_INFO[type].icon}</span></div>))}
              <span className="w-8 shrink-0" />
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              <span className="w-8 shrink-0" />
              {left.map(({ col }) => (<span key={col} className="w-10 text-center text-[10px] font-bold text-gray-400">{col}</span>))}
              <span className="w-6 text-center text-[9px] text-gray-300 shrink-0">│</span>
              {right.map(({ col }) => (<span key={col} className="w-10 text-center text-[10px] font-bold text-gray-400">{col}</span>))}
              <span className="w-8 shrink-0" />
            </div>
            <div className="space-y-1.5 overflow-y-auto max-h-60">
              {rows.map((row) => (
                <div key={row} className="flex items-center justify-center gap-1">
                  <span className="w-8 text-[10px] text-gray-400 text-right font-mono shrink-0">{row}</span>
                  {left.map(({ col, type }) => <SeatBtn key={col} col={col} type={type} row={row} />)}
                  <div className="w-6 flex flex-col items-center justify-center shrink-0 gap-0.5">
                    <div className="w-px h-3 bg-gray-200" /><div className="w-1 h-1 rounded-full bg-gray-200" /><div className="w-px h-3 bg-gray-200" />
                  </div>
                  {right.map(({ col, type }) => <SeatBtn key={col} col={col} type={type} row={row} />)}
                  <span className="w-8 text-[10px] text-gray-400 text-left font-mono shrink-0">{row}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-1 mt-2 border-t border-gray-100 pt-2">
              <span className="w-8 shrink-0" />
              {left.map(({ col, type }) => (<span key={col} className={`w-10 text-center text-[8px] font-bold px-1 py-0.5 rounded ${SEAT_TYPE_INFO[type].labelColor}`}>{SEAT_TYPE_INFO[type].label.toUpperCase()}</span>))}
              <span className="w-6 shrink-0" />
              {right.map(({ col, type }) => (<span key={col} className={`w-10 text-center text-[8px] font-bold px-1 py-0.5 rounded ${SEAT_TYPE_INFO[type].labelColor}`}>{SEAT_TYPE_INFO[type].label.toUpperCase()}</span>))}
              <span className="w-8 shrink-0" />
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-1"><div className="w-10 h-1 bg-slate-200" /></div>
      </div>
      {selectedSeats.length > 0 && (
        <div className="mt-3 rounded-xl border border-[#0b5c66]/20 bg-[#0b5c66]/5 p-3 space-y-1.5">
          <p className="text-xs font-semibold text-[#0b5c66]">Selected Seats:</p>
          {selectedSeats.map((seat, i) => { const t = selectedTypes[i] ?? "middle"; return (
            <div key={seat} className="flex justify-between text-xs text-gray-700">
              <span className="font-medium">{seat} <span className="text-gray-400">({SEAT_TYPE_INFO[t].label})</span></span>
              <span>{SEAT_SURCHARGE[t] > 0 ? `+${formatVND(SEAT_SURCHARGE[t])} VND` : "Free"}</span>
            </div>
          );})}
          <div className="flex justify-between font-bold text-xs border-t pt-1.5 text-[#0b5c66]">
            <span>Seat fee total:</span><span>{formatVND(totalSurcharge)} VND</span>
          </div>
        </div>
      )}
      <p className={`text-xs text-center mt-2 font-semibold ${ready ? "text-[#0b5c66]" : "text-amber-600"}`}>
        {ready ? `✓ ${passengerCount} seat(s) selected` : `Please select ${passengerCount - selectedSeats.length} more seat(s)`}
      </p>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
interface GuestBookingModalProps {
  flight: Flight;
  initialClass: TicketClass;
  onClose: () => void;
}

export function GuestBookingModal({ flight, initialClass, onClose }: GuestBookingModalProps) {
  const router = useRouter();

  // View state
  const [view, setView] = useState<ModalView>("flight-detail");

  // Booking state — mirrors customer/booking/page.tsx exactly
  const [selectedClass, setSelectedClass] = useState<TicketClass>(initialClass);
  const [passengerCount, setPassengerCount] = useState(1);
  const [seatMapMode, setSeatMapMode] = useState(false);
  const [activePassengerIndex, setActivePassengerIndex] = useState<number | null>(null);
  const [passengerClasses, setPassengerClasses] = useState<TicketClass[]>([initialClass]);
  const [chosenSeats, setChosenSeats] = useState<string[]>([""]);
  const [chosenTypes, setChosenTypes] = useState<SeatType[]>(["window"]);
  const [usedSeatSelection, setUsedSeatSelection] = useState(false);

  // Passenger forms
  const [passForms, setPassForms] = useState<PassengerInfo[]>([emptyPassenger()]);
  const [phoneErrors, setPhoneErrors] = useState<Record<number, string>>({});
  const [emailErrors, setEmailErrors] = useState<Record<number, string>>({});

  // Baggage + summary
  const [extraBaggageKg, setExtraBaggageKg] = useState<number[]>([0]);

  // Confirmed
  const [bookingRef, setBookingRef] = useState("");

  // ── Derived ──
  const basePrices = passengerClasses.map(c => getBasePrice(flight.id, c));
  const totalSurcharge = usedSeatSelection ? chosenTypes.reduce((s, t) => s + SEAT_SURCHARGE[t], 0) : 0;
  const totalBase = basePrices.reduce((a, b) => a + b, 0);
  const baggageTotal = extraBaggageKg.reduce((s, kg) => s + kg * 30_000, 0);
  const grandTotal = totalBase + totalSurcharge + baggageTotal;

  // ── Passenger count change ──
  const applyPassengerCount = (n: number) => {
    setPassengerCount(n);
    setPassengerClasses(Array(n).fill(selectedClass));
    setChosenSeats(Array(n).fill(""));
    setChosenTypes(Array(n).fill("window" as SeatType));
    setExtraBaggageKg(Array(n).fill(0));
    setPassForms(Array(n).fill(null).map(emptyPassenger));
  };

  // ── Open seat config (Configure Passengers) ──
  const handleOpenConfigure = () => {
    applyPassengerCount(passengerCount);
    setSeatMapMode(true);
    setActivePassengerIndex(null);
    setUsedSeatSelection(false);
    setView("configure");
  };

  // ── Quick Confirm (auto-seat) ──
  const handleConfirm = (withSeatMap: boolean) => {
    const count = passengerCount;
    const taken: string[] = [];
    const finalSeats = Array.from({ length: count }, (_, i) => {
      if (withSeatMap && chosenSeats[i]) { taken.push(chosenSeats[i]); return chosenSeats[i]; }
      const s = autoAssignSeat(passengerClasses[i] || selectedClass, flight.id, taken);
      taken.push(s); return s;
    });
    const finalTypes = finalSeats.map((s, i) => {
      if (withSeatMap && chosenSeats[i]) return chosenTypes[i];
      return getSeatType(s.replace(/\d+/, ""), passengerClasses[i] || selectedClass);
    });
    setChosenSeats(finalSeats);
    setChosenTypes(finalTypes);
    setUsedSeatSelection(withSeatMap);
    setPassForms(Array.from({ length: count }, emptyPassenger));
    setPhoneErrors({}); setEmailErrors({});
    setView("login-prompt");
  };

  // ── Seat toggle ──
  const toggleSeat = (seatId: string, type: SeatType) => {
    if (activePassengerIndex === null) return;
    setChosenSeats(prev => { const n = [...prev]; n[activePassengerIndex] = n[activePassengerIndex] === seatId ? "" : seatId; return n; });
    setChosenTypes(prev => { const n = [...prev]; n[activePassengerIndex] = type; return n; });
    setActivePassengerIndex(null);
  };

  // ── Passenger form helpers ──
  const updatePassenger = (idx: number, field: keyof PassengerInfo, value: string) =>
    setPassForms(prev => { const n = [...prev]; n[idx] = { ...n[idx], [field]: value }; return n; });
  const handleNameInput = (idx: number, field: keyof PassengerInfo, raw: string) => updatePassenger(idx, field, normalizeToUppercase(raw));
  const handlePhoneInput = (idx: number, raw: string) => {
    const clean = raw.replace(/\D/g, "");
    if (raw !== clean) setPhoneErrors(p => ({ ...p, [idx]: "Phone number must contain digits only" }));
    else if (clean.length > 0 && clean.length < 6) setPhoneErrors(p => ({ ...p, [idx]: "Phone number must be at least 6 digits" }));
    else setPhoneErrors(p => { const n = { ...p }; delete n[idx]; return n; });
    updatePassenger(idx, "phone", clean);
  };
  const handleEmailInput = (idx: number, value: string) => {
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailReg.test(value)) setEmailErrors(p => ({ ...p, [idx]: "Please enter a valid email" }));
    else setEmailErrors(p => { const n = { ...p }; delete n[idx]; return n; });
    updatePassenger(idx, "email", value);
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(phoneErrors).length > 0 || Object.keys(emailErrors).length > 0) return;
    setView("summary");
  };

  const handleConfirmBooking = () => {
    setBookingRef(generateRef());
    setView("confirmed");
  };

  const handleGoLogin = () => {
    // Save pending booking so customer booking page can resume
    localStorage.setItem("pendingGuestBooking", JSON.stringify({
      flightId: flight.id, selectedClass, passengerCount,
      passengerClasses, chosenSeats, chosenTypes, usedSeatSelection,
    }));
    router.push("/login?from=booking");
  };

  const theme = CLASS_THEME[selectedClass];

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-[540px] bg-[#d2eaf4]/97 backdrop-blur-sm border-[#c3d4e8] p-0 overflow-hidden [&>button]:hidden"
        style={{ maxHeight: "92vh", overflowY: "auto" }}>
        <DialogTitle className="sr-only">Book Flight – Guest</DialogTitle>

        {/* ══════════════════════════════════════════════════════
            FLIGHT DETAIL VIEW  (same as customer booking dialog)
        ══════════════════════════════════════════════════════ */}
        {view === "flight-detail" && (
          <div className="p-7 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            <div className="space-y-4 mt-2">
              {/* Route */}
              <div className="text-center border-b border-[#c3d4e8] pb-4">
                <p className="text-gray-500 text-sm mb-1">Route</p>
                <p className="font-bold text-3xl text-[#0b5c66] tracking-tight">{flight.departure.code} – {flight.arrival.code}</p>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 text-sm flex items-center gap-1"><Clock className="w-4 h-4" />Flight time:</span>
                <span className="ml-auto font-bold text-gray-800">{flight.duration}</span>
              </div>
              {/* Departure / Arrival */}
              <div className="relative pl-5 border-l-2 border-gray-300 space-y-5 py-1 ml-1">
                <div className="relative border-b border-gray-100 pb-3">
                  <div className="absolute w-3 h-3 bg-gray-400 rounded-full -left-[27px] top-1 border-2 border-[#d2eaf4]" />
                  <p className="text-gray-400 text-xs mb-1">Departs</p>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-800">{flight.departure.city} ({flight.departure.code})</p>
                    <p className="font-bold text-gray-900 border border-gray-200 bg-white/50 px-2 py-0.5 rounded shadow-sm">{flight.departure.time}</p>
                  </div>
                </div>
                <div className="relative pt-1">
                  <div className="absolute w-3 h-3 bg-[#0b5c66] rounded-full -left-[27px] top-2 border-2 border-[#d2eaf4]" />
                  <p className="text-gray-400 text-xs mb-1">Arrives</p>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-800">{flight.arrival.city} ({flight.arrival.code})</p>
                    <p className="font-bold text-gray-900 border border-gray-200 bg-white/50 px-2 py-0.5 rounded shadow-sm">{flight.arrival.time}</p>
                  </div>
                </div>
              </div>
              {/* Flight no. */}
              <div className="text-center border-t border-[#c3d4e8] pt-4">
                <p className="text-gray-500 text-sm mb-1">Flight no.</p>
                <p className="font-bold text-xl text-[#0b5c66] tracking-wider">{flight.flightNumber}</p>
              </div>
              {/* Class + price banner */}
              <div className={`${theme.card} ${theme.text} rounded-xl p-3 flex justify-between items-center`}>
                <span className="text-sm font-semibold">{CLASS_LABELS[selectedClass]}</span>
                <span className="font-bold text-xs text-right">Default Base Fare<br />{formatVND(getBasePrice(flight.id, selectedClass))} VND / person</span>
              </div>

              {/* ── PASSENGER COUNT (the extra step vs customer) ── */}
              <div className="bg-white/80 rounded-2xl border border-[#dce8f4] p-4 space-y-3">
                <p className="text-sm font-semibold text-[#0b5c66] flex items-center gap-2"><Users className="w-4 h-4" />Number of Passengers</p>
                <div className="flex items-center justify-center gap-6">
                  <Button type="button" variant="outline" size="icon"
                    className="h-10 w-10 rounded-full border-2 border-[#0b5c66] text-[#0b5c66] hover:bg-[#0b5c66] hover:text-white text-xl font-bold"
                    onClick={() => { const n = Math.max(1, passengerCount - 1); setPassengerCount(n); applyPassengerCount(Math.max(1, passengerCount - 1)); }}>−</Button>
                  <div className="text-center">
                    <div className="text-3xl font-black text-[#0b5c66]">{passengerCount}</div>
                    <div className="text-xs text-gray-500">passenger{passengerCount > 1 ? "s" : ""}</div>
                  </div>
                  <Button type="button" variant="outline" size="icon"
                    className="h-10 w-10 rounded-full border-2 border-[#0b5c66] text-[#0b5c66] hover:bg-[#0b5c66] hover:text-white text-xl font-bold"
                    onClick={() => { const n = Math.min(9, passengerCount + 1); setPassengerCount(n); applyPassengerCount(Math.min(9, passengerCount + 1)); }}>+</Button>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-gray-500">{passengerCount} × {formatVND(getBasePrice(flight.id, selectedClass))} VND</span>
                  <span className="font-bold text-[#0b5c66]">{formatVND(getBasePrice(flight.id, selectedClass) * passengerCount)} VND</span>
                </div>
              </div>

              {/* Hint */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 flex gap-2 text-xs text-amber-800">
                <span className="shrink-0 mt-0.5">🪑</span>
                <span><strong>Confirm</strong> = auto-assigned for free. <strong>Configure Passengers</strong> = pick seat details.</span>
              </div>

              {/* Action buttons */}
              <div className="mt-5 flex flex-col items-end gap-3">
                <Button onClick={handleOpenConfigure} className="bg-[#1e5b72] hover:bg-[#154456] text-white px-8 w-full gap-2">
                  🪑 Configure Passengers
                </Button>
                <Button onClick={() => handleConfirm(false)} className="bg-[#f5d020] hover:bg-yellow-500 text-gray-900 font-semibold px-8 w-full gap-2">
                  <ChevronRight className="w-4 h-4" /> Confirm
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            CONFIGURE PASSENGERS (class + seat per passenger)
        ══════════════════════════════════════════════════════ */}
        {view === "configure" && activePassengerIndex === null && (
          <div className="p-6 relative max-h-[85vh] overflow-y-auto w-full">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-2 mb-6">
              <button type="button" onClick={() => setView("flight-detail")} className="text-gray-400 hover:text-gray-700">
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Configure Passengers</h3>
                <p className="text-xs text-gray-500">{flight.departure.code}→{flight.arrival.code} · {passengerCount} passenger(s)</p>
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: passengerCount }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-[#dce8f4] shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0b5c66]">Passenger {i + 1}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Label className="text-[10px] text-gray-500 uppercase">Ticket Class</Label>
                      <Select value={passengerClasses[i]}
                        onValueChange={(v: TicketClass) => {
                          const next = [...passengerClasses]; next[i] = v; setPassengerClasses(next);
                          if (chosenSeats[i]) { const ns = [...chosenSeats]; ns[i] = ""; setChosenSeats(ns); const nt = [...chosenTypes]; nt[i] = "window" as SeatType; setChosenTypes(nt); }
                        }}>
                        <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white">
                          {(["economy", "business", "firstClass"] as TicketClass[]).map(c => (
                            <SelectItem key={c} value={c} disabled={flight.seatsAvailable[c] === 0}>{CLASS_LABELS[c]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label className="text-[10px] text-gray-500 uppercase">Seat</Label>
                      <Button variant={chosenSeats[i] ? "default" : "outline"}
                        className={`w-full mt-1 h-9 ${chosenSeats[i] ? "bg-[#0b5c66] hover:bg-[#0a4d55] text-white" : ""}`}
                        onClick={() => setActivePassengerIndex(i)}>
                        {chosenSeats[i] || "Choose Seat"}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-[#0b5c66]/5 p-2 rounded-lg mt-2">
                    <span className="text-xs text-gray-500 font-semibold uppercase">Base Fare</span>
                    <span className="font-bold text-[#0b5c66]">{formatVND(getBasePrice(flight.id, passengerClasses[i]))} VND</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setView("flight-detail")}>Cancel</Button>
              <Button onClick={() => handleConfirm(true)} className="bg-[#f5d020] hover:bg-yellow-500 text-gray-900 font-bold px-6">
                <Check className="w-4 h-4 mr-2" /> Confirm Seats
              </Button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            INDIVIDUAL SEAT MAP
        ══════════════════════════════════════════════════════ */}
        {view === "configure" && activePassengerIndex !== null && (
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
                flightId={flight.id}
                passengerCount={1}
                selectedSeats={chosenSeats[activePassengerIndex] ? [chosenSeats[activePassengerIndex]] : []}
                selectedTypes={chosenTypes[activePassengerIndex] ? [chosenTypes[activePassengerIndex]] : []}
                basePrice={getBasePrice(flight.id, passengerClasses[activePassengerIndex])}
                onToggle={toggleSeat}
                takenSeats={chosenSeats.filter((s, i) => i !== activePassengerIndex && s !== "")}
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            LOGIN PROMPT  (unique to guest booking)
        ══════════════════════════════════════════════════════ */}
        {view === "login-prompt" && (
          <div className="p-7 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-2 mb-6">
              <button type="button" onClick={() => setView("flight-detail")} className="text-gray-400 hover:text-gray-700">
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
              <h3 className="font-bold text-gray-800 text-lg">One more step!</h3>
            </div>
            <div className="space-y-5">
              <div className="text-center py-2">
                <div className="w-16 h-16 rounded-full bg-[#0b5c66]/10 flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-8 h-8 text-[#0b5c66]" />
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">Would you like to sign in?</h4>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  Signing in lets you track bookings, earn reward points, and view all your tickets. Or continue as a guest — no account needed.
                </p>
              </div>
              <div className="grid gap-3">
                <Button onClick={handleGoLogin} className="h-12 gap-2 bg-[#0b5c66] hover:bg-[#094a52] text-white font-semibold">
                  <LogIn className="w-4 h-4" /> Log In / Sign Up
                </Button>
                <Button onClick={() => setView("info")} variant="outline"
                  className="h-12 gap-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold">
                  <ChevronRight className="w-4 h-4" /> Continue as Guest
                </Button>
              </div>
              <p className="text-xs text-center text-gray-400">Your seat selections have been held.</p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            PASSENGER INFO  (identical to customer booking)
        ══════════════════════════════════════════════════════ */}
        {view === "info" && (
          <div className="p-6 relative">
            <div className="flex items-center gap-3 mb-5">
              <Button variant="ghost" size="icon" onClick={() => setView("login-prompt")}>
                <ArrowRight className="w-5 h-5 rotate-180" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Passenger Information</h1>
                <p className="text-sm text-gray-500">{flight.departure.code} → {flight.arrival.code} · {passengerCount} passenger(s)</p>
              </div>
            </div>

            {/* Flight summary bar */}
            <div className={`${CLASS_THEME[passengerClasses[0] || selectedClass].card} ${CLASS_THEME[passengerClasses[0] || selectedClass].text} rounded-2xl p-4 flex items-center justify-between mb-4`}>
              <div className="flex items-center gap-5">
                <div className="text-center"><p className="text-2xl font-bold">{flight.departure.code}</p><p className="text-xs opacity-75">{flight.departure.time}</p></div>
                <div className="flex items-center gap-2 opacity-60"><div className="h-px w-10 bg-white/60" /><Plane className="w-4 h-4" /><div className="h-px w-10 bg-white/60" /></div>
                <div className="text-center"><p className="text-2xl font-bold">{flight.arrival.code}</p><p className="text-xs opacity-75">{flight.arrival.time}</p></div>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-75">Total due</p>
                <p className="text-lg font-bold">{formatVND(totalBase + totalSurcharge)} VND</p>
                {!usedSeatSelection && <p className="text-[10px] opacity-60">Seat auto-assigned</p>}
              </div>
            </div>

            <form onSubmit={handleSubmitInfo} className="space-y-4">
              {Array.from({ length: passengerCount }).map((_, idx) => (
                <Card key={idx} className="overflow-hidden border border-[#dce8f4]">
                  <CardHeader className="bg-[#b3ddef]/30 pb-3 border-b border-[#dce8f4]">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#0b5c66] text-white flex items-center justify-center text-sm font-bold">{idx + 1}</div>
                      Passenger {idx + 1}
                      <Badge variant="outline" className="ml-auto font-mono text-[#0b5c66] border-[#0b5c66] text-xs">
                        Seat: {chosenSeats[idx] || "Auto"}
                        {usedSeatSelection && chosenTypes[idx] ? ` (${SEAT_TYPE_INFO[chosenTypes[idx]].label})` : ""}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 bg-white space-y-4">
                    {/* Title + Name */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <Label>Title <span className="text-red-500">*</span></Label>
                        <Select value={passForms[idx]?.title ?? "Mr"} onValueChange={(v) => updatePassenger(idx, "title", v)}>
                          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                          <SelectContent>{["Mr","Mrs","Ms","Dr","Prof"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
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
                    <p className="text-[10px] text-gray-400 -mt-2 italic">Names auto-converted to uppercase (as on passport)</p>
                    {/* DOB + Passport */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Date of Birth <span className="text-red-500">*</span></Label>
                        <Input required type="date" max={TODAY} value={passForms[idx]?.dateOfBirth ?? ""} onChange={(e) => updatePassenger(idx, "dateOfBirth", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label>Passport / National ID <span className="text-red-500">*</span></Label>
                        <Input required placeholder="Enter document number" value={passForms[idx]?.cccd ?? ""} onChange={(e) => updatePassenger(idx, "cccd", e.target.value)} />
                      </div>
                    </div>
                    {/* Email */}
                    <div className="space-y-1">
                      <Label>Email Address <span className="text-red-500">*</span></Label>
                      <Input required type="email" placeholder="email@example.com" value={passForms[idx]?.email ?? ""}
                        onChange={(e) => handleEmailInput(idx, e.target.value)}
                        className={emailErrors[idx] ? "border-red-400 focus-visible:ring-red-300" : ""} />
                      {emailErrors[idx] && <p className="text-xs text-red-500">⚠ {emailErrors[idx]}</p>}
                    </div>
                    {/* Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label>Phone Type <span className="text-red-500">*</span></Label>
                        <Select value={passForms[idx]?.phoneType ?? "personal"} onValueChange={(v) => updatePassenger(idx, "phoneType", v as "personal" | "business")}>
                          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="personal">Personal</SelectItem><SelectItem value="business">Business</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Country Code <span className="text-red-500">*</span></Label>
                        <Select value={passForms[idx]?.countryCode ?? "+84"} onValueChange={(v) => updatePassenger(idx, "countryCode", v)}>
                          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                          <SelectContent className="max-h-60">
                            {COUNTRY_CODES.map(c => <SelectItem key={c.dial + c.name} value={c.dial}>{c.dial} · {c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Phone Number <span className="text-red-500">*</span></Label>
                        <Input required type="tel" inputMode="numeric" placeholder="e.g. 0901234567"
                          value={passForms[idx]?.phone ?? ""}
                          onChange={(e) => handlePhoneInput(idx, e.target.value)}
                          className={phoneErrors[idx] ? "border-red-400 focus-visible:ring-red-300" : ""} />
                        {phoneErrors[idx] && <p className="text-xs text-red-500">⚠ {phoneErrors[idx]}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="bg-[#eef3f9] p-3 rounded-xl flex items-start gap-2 border border-[#dce8f4]">
                <MapPin className="w-4 h-4 text-[#1e4069] mt-0.5 shrink-0" />
                <p className="text-xs text-[#1a3557]">Passenger names must exactly match the identity document used for check-in.</p>
              </div>

              {/* Price summary */}
              <div className="bg-gray-50 rounded-xl p-4 border text-sm space-y-2">
                <div className="flex justify-between text-gray-600"><span>Total Base Fare</span><span>{formatVND(totalBase)} VND</span></div>
                {totalSurcharge > 0 && <div className="flex justify-between text-gray-600"><span>Seat selection fee</span><span>{formatVND(totalSurcharge)} VND</span></div>}
                {!usedSeatSelection && <p className="text-xs text-gray-400 italic">Seat will be randomly assigned at no extra charge.</p>}
                <div className="flex justify-between font-bold text-gray-900 border-t pt-2"><span>Total</span><span className="text-[#0b5c66] text-base">{formatVND(totalBase + totalSurcharge)} VND</span></div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" size="lg" className="bg-[#f5d020] text-gray-900 hover:bg-yellow-500 font-semibold gap-2 px-8">
                  <FileText className="w-4 h-4" /> Next to Summary
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            SUMMARY  (mirrors customer booking summary)
        ══════════════════════════════════════════════════════ */}
        {view === "summary" && (
          <div className="p-6 relative space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <Button variant="ghost" size="icon" onClick={() => setView("info")}>
                <ArrowRight className="w-5 h-5 rotate-180" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Ticket Summary</h1>
                <p className="text-sm text-gray-500">Review your tickets before confirming.</p>
              </div>
            </div>

            {/* Tickets card */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-[#d2eaf4] px-6 py-4 border-b border-[#dce8f4] flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#0b5c66]">Tickets</h2>
                <Badge variant="outline" className="bg-white/50 border-[#0b5c66]/20 text-[#0b5c66]">
                  {flight.departure.code} → {flight.arrival.code}
                </Badge>
              </div>
              <CardContent className="p-0 divide-y">
                {passForms.map((p, i) => (
                  <div key={i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 font-medium mb-1">Passenger {i + 1}</p>
                      <p className="font-bold text-gray-900 text-lg">{[p.title, p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ")}</p>
                      <div className="flex gap-3 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded text-xs font-semibold shadow-sm">Seat {chosenSeats[i]}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 px-2 py-0.5">Includes 20kg Checked Baggage</span>
                      </div>
                    </div>
                    {/* Extra baggage */}
                    <div className="flex flex-col items-end gap-2 bg-[#eef3f9]/50 p-3 rounded-xl border border-[#dce8f4]/50">
                      <p className="text-[10px] font-bold text-[#1a3557] uppercase tracking-widest">Extra Checked Baggage</p>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-full border-[#3a6090] text-[#1a3557] hover:bg-[#dce8f4]"
                          onClick={() => setExtraBaggageKg(prev => { const n = [...prev]; n[i] = Math.max(0, n[i] - 1); return n; })}>−</Button>
                        <div className="w-12 text-center font-bold text-[#0b5c66]">{extraBaggageKg[i] || 0} kg</div>
                        <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-full border-[#3a6090] text-[#1a3557] hover:bg-[#dce8f4]"
                          onClick={() => setExtraBaggageKg(prev => { const n = [...prev]; n[i] = n[i] + 1; return n; })}>+</Button>
                      </div>
                      {extraBaggageKg[i] > 0 && <p className="text-[11px] font-bold text-[#1e4069]">+{formatVND(extraBaggageKg[i] * 30_000)} VND</p>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Price totals */}
            <Card className="border-0 shadow-xl overflow-hidden bg-[#0b5c66]">
              <CardContent className="p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-white/70 font-medium">Grand Total</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black">{formatVND(grandTotal)}</p>
                    <p className="text-sm text-white/50">VND</p>
                  </div>
                  {totalSurcharge > 0 && <p className="text-xs text-yellow-300">Includes seat fee: {formatVND(totalSurcharge)} VND</p>}
                </div>
                <Button size="lg" onClick={handleConfirmBooking}
                  className="bg-[#f5d020] hover:bg-yellow-500 text-gray-900 font-bold text-base h-14 px-8 shadow-lg rounded-xl">
                  <Check className="mr-2 w-5 h-5" /> Confirm Booking
                </Button>
              </CardContent>
            </Card>

            {/* Email notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
              <Mail className="w-5 h-5 shrink-0 mt-0.5" />
              <span>
                A booking confirmation will be sent to{" "}
                <strong>{passForms.map(p => p.email).filter(Boolean).join(", ")}</strong> after you confirm.
              </span>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            CONFIRMED  (email notification instead of payment)
        ══════════════════════════════════════════════════════ */}
        {view === "confirmed" && (
          <div className="p-7 space-y-5">
            {/* Success */}
            <div className="flex items-center gap-4 bg-[#0b5c66]/10 border border-[#0b5c66]/30 rounded-2xl p-5">
              <div className="w-14 h-14 rounded-full bg-[#0b5c66]/20 flex items-center justify-center shrink-0">
                <Check className="w-7 h-7 text-[#0b5c66]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0b5c66]">Booking Confirmed!</h1>
                <p className="text-sm text-[#0b5c66]/80 mt-0.5">Reference: <strong className="font-mono text-[#0b5c66] text-base">{bookingRef}</strong></p>
              </div>
            </div>

            {/* Flight summary */}
            <Card className="overflow-hidden shadow-lg border-0">
              <div className={`${theme.card} ${theme.text} px-6 py-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <Plane className="w-5 h-5" />
                  <div><p className="font-bold text-lg">{flight.flightNumber}</p><p className="text-xs opacity-75">{flight.airline}</p></div>
                </div>
                <Badge className="bg-white/20 border-0 font-semibold text-inherit">{CLASS_LABELS[selectedClass]}</Badge>
              </div>
              <CardContent className="p-0">
                <div className="p-6 grid grid-cols-3 items-center gap-4 border-b">
                  <div className="text-center">
                    <p className="text-4xl font-light text-[#0b5c66]">{flight.departure.time}</p>
                    <p className="text-xl font-bold mt-1">{flight.departure.code}</p>
                    <p className="text-sm text-gray-500">{flight.departure.city}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-500">{flight.duration}</p>
                    <div className="w-full flex items-center"><div className="h-px flex-1 bg-gray-200" /><Plane className="w-4 h-4 text-gray-300 mx-1" /><div className="h-px flex-1 bg-gray-200" /></div>
                    <p className="text-xs text-gray-400">Direct flight</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-light text-[#0b5c66]">{flight.arrival.time}</p>
                    <p className="text-xl font-bold mt-1">{flight.arrival.code}</p>
                    <p className="text-sm text-gray-500">{flight.arrival.city}</p>
                  </div>
                </div>
                {/* Passengers */}
                <div className="p-6 border-b space-y-3">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2"><Users className="w-4 h-4" /> Passenger Information</h3>
                  {passForms.map((p, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div><span className="text-xs text-gray-400 block">Full Name</span><span className="font-semibold">{[p.title, p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ") || "—"}</span></div>
                      <div><span className="text-xs text-gray-400 block">Seat</span><span className="font-bold text-[#0b5c66]">{chosenSeats[i] || "—"}</span></div>
                      <div><span className="text-xs text-gray-400 block">Email</span><span>{p.email || "—"}</span></div>
                      <div><span className="text-xs text-gray-400 block">Phone</span><span>{p.countryCode} {p.phone || "—"}</span></div>
                      <div><span className="text-xs text-gray-400 block">Passport / ID</span><span className="font-mono">{p.cccd || "—"}</span></div>
                    </div>
                  ))}
                </div>
                {/* Price */}
                <div className="p-6 border-b">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3"><CreditCard className="w-4 h-4" /> Payment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600"><span>Flight fare</span><span>{formatVND(totalBase)} VND</span></div>
                    {totalSurcharge > 0 && <div className="flex justify-between text-gray-600"><span>Seat fee</span><span>{formatVND(totalSurcharge)} VND</span></div>}
                    {baggageTotal > 0 && <div className="flex justify-between text-gray-600"><span>Extra baggage</span><span>{formatVND(baggageTotal)} VND</span></div>}
                    <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-2"><span>Total</span><span className="text-[#0b5c66] text-lg">{formatVND(grandTotal)} VND</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email sent notice */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center space-y-2">
              <Mail className="w-8 h-8 text-green-600 mx-auto mb-1" />
              <p className="font-bold text-green-800 text-base">📧 Confirmation Email Sent!</p>
              <div className="space-y-1">
                {passForms.map((p, i) => p.email && (
                  <p key={i} className="font-mono text-sm font-semibold text-green-800 bg-white/60 rounded-lg px-3 py-1">{p.email}</p>
                ))}
              </div>
              <p className="text-xs text-green-600 mt-1">Please check your inbox (including spam folder)</p>
            </div>

            <Button onClick={onClose} className="w-full bg-[#0b5c66] hover:bg-[#094a52] text-white font-semibold h-12">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
