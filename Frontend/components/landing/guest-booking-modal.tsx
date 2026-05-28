"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSeatAvailability } from "@/lib/booking-api";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Plane,
  Clock,
  ChevronRight,
  Check,
  ArrowRight,
  Users,
  MapPin,
  Mail,
  LogIn,
  FileText,
} from "lucide-react";
import type { Flight, TicketClass } from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────────────────────
type SeatType = "window" | "aisle" | "middle";
type ModalView = "flight-detail" | "configure" | "login-prompt" | "info" | "summary";

interface PassengerInfo {
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  cccd: string;
  email: string;
  phoneType: "personal" | "business";
  countryCode: string;
  phone: string;
}

function emptyPassenger(): PassengerInfo {
  return {
    title: "Mr",
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    cccd: "",
    email: "",
    phoneType: "personal",
    countryCode: "+84",
    phone: "",
  };
}

interface SeatColDef {
  col: string;
  type: SeatType;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const SEAT_SURCHARGE: Record<SeatType, number> = {
  window: 350_000,
  aisle: 150_000,
  middle: 0,
};

const SEAT_TYPE_INFO: Record<
  SeatType,
  { label: string; icon: string; available: string; dot: string; labelColor: string }
> = {
  window: {
    label: "Window",
    icon: "🪟",
    available:
      "border-[#3a6090] bg-[#eef3f9] text-[#1a3557] hover:bg-[#dce8f4]",
    dot: "bg-[#3a6090]",
    labelColor: "text-[#1e4069] bg-[#eef3f9]",
  },
  aisle: {
    label: "Aisle",
    icon: "↔",
    available:
      "border-emerald-400 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
    dot: "bg-emerald-400",
    labelColor: "text-emerald-600 bg-emerald-50",
  },
  middle: {
    label: "Middle",
    icon: "●",
    available:
      "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
    dot: "bg-amber-300",
    labelColor: "text-amber-700 bg-amber-50",
  },
};

const CABIN_CONFIG: Record<
  TicketClass,
  {
    rows: number[];
    left: SeatColDef[];
    right: SeatColDef[];
    label: string;
    layout: string;
  }
> = {
  economy: {
    rows: [20, 21, 22, 23, 24, 25, 26, 27],
    left: [
      { col: "A", type: "window" },
      { col: "B", type: "middle" },
      { col: "C", type: "aisle" },
    ],
    right: [
      { col: "D", type: "aisle" },
      { col: "E", type: "middle" },
      { col: "F", type: "window" },
    ],
    label: "Economy Cabin",
    layout: "3 – 3",
  },
  business: {
    rows: [5, 6, 7, 8, 9, 10],
    left: [
      { col: "A", type: "window" },
      { col: "B", type: "aisle" },
    ],
    right: [
      { col: "C", type: "aisle" },
      { col: "D", type: "window" },
    ],
    label: "Premium Economy Cabin",
    layout: "2 – 2",
  },
  firstClass: {
    rows: [1, 2, 3, 4],
    left: [{ col: "A", type: "window" }],
    right: [{ col: "B", type: "window" }],
    label: "Business Suite",
    layout: "1 – 1 (Luxury Pods)",
  },
};

const CLASS_LABELS: Record<TicketClass, string> = {
  economy: "Economy",
  business: "Premium Economy",
  firstClass: "Business",
};

const CLASS_THEME: Record<TicketClass, { card: string; text: string }> = {
  economy: { card: "bg-[#5aabe8]", text: "text-white" },
  business: { card: "bg-[#f07832]", text: "text-white" },
  firstClass: { card: "bg-[#f5d020]", text: "text-gray-900" },
};

const COUNTRY_CODES = [
  { dial: "+84", name: "Vietnam 🇻🇳" },
  { dial: "+1", name: "USA/Canada 🇺🇸" },
  { dial: "+44", name: "UK 🇬🇧" },
  { dial: "+33", name: "France 🇫🇷" },
  { dial: "+81", name: "Japan 🇯🇵" },
  { dial: "+65", name: "Singapore 🇸🇬" },
  { dial: "+61", name: "Australia 🇦🇺" },
  { dial: "+86", name: "China 🇨🇳" },
  { dial: "+82", name: "Korea 🇰🇷" },
  { dial: "+66", name: "Thailand 🇹🇭" },
  { dial: "+60", name: "Malaysia 🇲🇾" },
  { dial: "+62", name: "Indonesia 🇮🇩" },
  { dial: "+49", name: "Germany 🇩🇪" },
  { dial: "+39", name: "Italy 🇮🇹" },
  { dial: "+34", name: "Spain 🇪🇸" },
  { dial: "+7", name: "Russia 🇷🇺" },
  { dial: "+971", name: "UAE 🇦🇪" },
  { dial: "+91", name: "India 🇮🇳" },
  { dial: "+55", name: "Brazil 🇧🇷" },
  { dial: "+27", name: "S.Africa 🇿🇦" },
];

const TODAY = new Date().toISOString().split("T")[0];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n);
}

function generateRef(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return (
    "SL-BK-" +
    Array.from(
      { length: 6 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("")
  );
}

function normalizeToUppercase(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đ]/g, "d")
    .replace(/[Đ]/g, "D")
    .toUpperCase();
}

function getSeatType(col: string, tClass: TicketClass): SeatType {
  const all = [...CABIN_CONFIG[tClass].left, ...CABIN_CONFIG[tClass].right];
  return all.find((c) => c.col === col)?.type ?? "middle";
}

function getFlightPrice(flight: Flight, tClass: TicketClass) {
  const raw =
    tClass === "economy"
      ? flight.price.economy
      : tClass === "business"
        ? flight.price.business
        : flight.price.firstClass;

  if (tClass === "economy" && flight.discount) {
    return Math.round(raw * (1 - flight.discount / 100));
  }

  return raw;
}

function autoAssignSeat(
  tClass: TicketClass,
  taken: string[],
  takenSeats: string[],
): string {
  const { rows, left, right } = CABIN_CONFIG[tClass];

  for (const row of rows) {
    for (const { col } of [...left, ...right]) {
      const id = `${row}${col}`;
      if (!takenSeats.includes(id) && !taken.includes(id)) return id;
    }
  }

  return `${rows[0]}${left[0].col}`;
}

// ─── AirplaneSeatMap ─────────────────────────────────────────────────────────
interface SeatMapProps {
  ticketClass: TicketClass;
  passengerCount: number;
  selectedSeats: string[];
  selectedTypes: SeatType[];
  onToggle: (seatId: string, type: SeatType) => void;
  takenSeats?: string[];
}

function AirplaneSeatMap({
  ticketClass,
  passengerCount,
  selectedSeats,
  selectedTypes,
  onToggle,
  takenSeats = [],
}: SeatMapProps) {
  const { rows, left, right, label, layout } = CABIN_CONFIG[ticketClass];
  const totalSurcharge = selectedTypes.reduce(
    (s, t) => s + SEAT_SURCHARGE[t],
    0,
  );
  const ready = selectedSeats.length === passengerCount;

  const SeatBtn = ({
    col,
    type,
    row,
  }: {
    col: string;
    type: SeatType;
    row: number;
  }) => {
    const id = `${row}${col}`;
    const occupied = takenSeats.includes(id);
    const selected = selectedSeats.includes(id);

    let cls =
      "w-10 h-10 rounded-xl text-xs font-bold border-2 transition-all duration-150 flex items-center justify-center ";

    if (occupied) {
      cls += "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed";
    } else if (selected) {
      cls +=
        "bg-[#0b5c66] border-[#0b5c66] text-white scale-110 shadow-lg ring-2 ring-[#0b5c66]/30";
    } else {
      cls +=
        SEAT_TYPE_INFO[type].available +
        " cursor-pointer hover:scale-105 hover:shadow-sm";
    }

    return (
      <button
        type="button"
        disabled={occupied}
        onClick={() => onToggle(id, type)}
        title={
          occupied
            ? "Taken"
            : `${SEAT_TYPE_INFO[type].label} · ${
                SEAT_SURCHARGE[type] > 0
                  ? "+" + formatVND(SEAT_SURCHARGE[type]) + " VND"
                  : "Free"
              }`
        }
        className={cls}
      >
        {occupied ? "✕" : selected ? "✓" : col}
      </button>
    );
  };

  return (
    <div className="flex flex-col select-none">
      <div className="mb-3 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
          {label}
        </p>
        <p className="text-[10px] text-gray-400">Seating layout: {layout}</p>
      </div>

      <div className="mb-3 flex flex-wrap justify-center gap-x-3 gap-y-1">
        {(["window", "aisle", "middle"] as SeatType[]).map((type) => (
          <span key={type} className="flex items-center gap-1 text-[11px]">
            <span className={`h-3 w-3 rounded-sm ${SEAT_TYPE_INFO[type].dot}`} />
            <span className="font-medium text-gray-700">
              {SEAT_TYPE_INFO[type].label}
            </span>
            <span className="text-gray-400">
              {SEAT_SURCHARGE[type] > 0
                ? `+${formatVND(SEAT_SURCHARGE[type])} VND`
                : "Free"}
            </span>
          </span>
        ))}
        <span className="flex items-center gap-1 text-[11px]">
          <span className="h-3 w-3 rounded-sm border border-gray-300 bg-gray-200" />
          <span className="text-gray-400">Taken</span>
        </span>
      </div>

      <div className="relative mx-auto w-full">
        <div className="mb-1 flex justify-center">
          <div className="flex flex-col items-center">
            <div className="h-0 w-0 border-l-[20px] border-r-[20px] border-b-[28px] border-l-transparent border-r-transparent border-b-slate-200" />
            <div className="h-1 w-10 bg-slate-200" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-gradient-to-b from-slate-50 via-white to-slate-50 shadow-inner">
          <div className="absolute left-0 top-14 bottom-4 flex w-3 flex-col justify-around pl-0.5 pointer-events-none">
            {rows.map((r) => (
              <div
                key={r}
                className="mx-auto h-3 w-2 rounded-sm bg-sky-200/80"
              />
            ))}
          </div>
          <div className="absolute right-0 top-14 bottom-4 flex w-3 flex-col justify-around pr-0.5 pointer-events-none">
            {rows.map((r) => (
              <div
                key={r}
                className="mx-auto h-3 w-2 rounded-sm bg-sky-200/80"
              />
            ))}
          </div>

          <div className="px-5 py-3">
            <div className="mb-1 flex items-center justify-center gap-1">
              <span className="w-8 shrink-0" />
              {left.map(({ col, type }) => (
                <div key={col} className="flex w-10 justify-center">
                  <span className="text-base leading-none">
                    {SEAT_TYPE_INFO[type].icon}
                  </span>
                </div>
              ))}
              <span className="w-6 shrink-0" />
              {right.map(({ col, type }) => (
                <div key={col} className="flex w-10 justify-center">
                  <span className="text-base leading-none">
                    {SEAT_TYPE_INFO[type].icon}
                  </span>
                </div>
              ))}
              <span className="w-8 shrink-0" />
            </div>

            <div className="mb-2 flex items-center justify-center gap-1">
              <span className="w-8 shrink-0" />
              {left.map(({ col }) => (
                <span
                  key={col}
                  className="w-10 text-center text-[10px] font-bold text-gray-400"
                >
                  {col}
                </span>
              ))}
              <span className="w-6 shrink-0 text-center text-[9px] text-gray-300">
                │
              </span>
              {right.map(({ col }) => (
                <span
                  key={col}
                  className="w-10 text-center text-[10px] font-bold text-gray-400"
                >
                  {col}
                </span>
              ))}
              <span className="w-8 shrink-0" />
            </div>

            <div className="max-h-60 space-y-1.5 overflow-y-auto">
              {rows.map((row) => (
                <div
                  key={row}
                  className="flex items-center justify-center gap-1"
                >
                  <span className="w-8 shrink-0 text-right font-mono text-[10px] text-gray-400">
                    {row}
                  </span>
                  {left.map(({ col, type }) => (
                    <SeatBtn key={col} col={col} type={type} row={row} />
                  ))}
                  <div className="flex w-6 shrink-0 flex-col items-center justify-center gap-0.5">
                    <div className="h-3 w-px bg-gray-200" />
                    <div className="h-1 w-1 rounded-full bg-gray-200" />
                    <div className="h-3 w-px bg-gray-200" />
                  </div>
                  {right.map(({ col, type }) => (
                    <SeatBtn key={col} col={col} type={type} row={row} />
                  ))}
                  <span className="w-8 shrink-0 text-left font-mono text-[10px] text-gray-400">
                    {row}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-2 flex items-center justify-center gap-1 border-t border-gray-100 pt-2">
              <span className="w-8 shrink-0" />
              {left.map(({ col, type }) => (
                <span
                  key={col}
                  className={`w-10 rounded px-1 py-0.5 text-center text-[8px] font-bold ${SEAT_TYPE_INFO[type].labelColor}`}
                >
                  {SEAT_TYPE_INFO[type].label.toUpperCase()}
                </span>
              ))}
              <span className="w-6 shrink-0" />
              {right.map(({ col, type }) => (
                <span
                  key={col}
                  className={`w-10 rounded px-1 py-0.5 text-center text-[8px] font-bold ${SEAT_TYPE_INFO[type].labelColor}`}
                >
                  {SEAT_TYPE_INFO[type].label.toUpperCase()}
                </span>
              ))}
              <span className="w-8 shrink-0" />
            </div>
          </div>
        </div>

        <div className="mt-1 flex justify-center">
          <div className="h-1 w-10 bg-slate-200" />
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="mt-3 space-y-1.5 rounded-xl border border-[#0b5c66]/20 bg-[#0b5c66]/5 p-3">
          <p className="text-xs font-semibold text-[#0b5c66]">
            Selected Seats:
          </p>
          {selectedSeats.map((seat, i) => {
            const t = selectedTypes[i] ?? "middle";
            return (
              <div key={seat} className="flex justify-between text-xs text-gray-700">
                <span className="font-medium">
                  {seat}{" "}
                  <span className="text-gray-400">
                    ({SEAT_TYPE_INFO[t].label})
                  </span>
                </span>
                <span>
                  {SEAT_SURCHARGE[t] > 0
                    ? `+${formatVND(SEAT_SURCHARGE[t])} VND`
                    : "Free"}
                </span>
              </div>
            );
          })}
          <div className="flex justify-between border-t pt-1.5 text-xs font-bold text-[#0b5c66]">
            <span>Seat fee total:</span>
            <span>{formatVND(totalSurcharge)} VND</span>
          </div>
        </div>
      )}

      <p
        className={`mt-2 text-center text-xs font-semibold ${
          ready ? "text-[#0b5c66]" : "text-amber-600"
        }`}
      >
        {ready
          ? `✓ ${passengerCount} seat(s) selected`
          : `Please select ${passengerCount - selectedSeats.length} more seat(s)`}
      </p>
    </div>
  );
}

// ─── Main Modal ──────────────────────────────────────────────────────────────
interface GuestBookingModalProps {
  flight: Flight;
  initialClass: TicketClass;
  onClose: () => void;
}

export function GuestBookingModal({
  flight,
  initialClass,
  onClose,
}: GuestBookingModalProps) {
  const router = useRouter();

  const [view, setView] = useState<ModalView>("flight-detail");

  const [selectedClass, setSelectedClass] =
    useState<TicketClass>(initialClass);
  const [passengerCount, setPassengerCount] = useState(1);
  const [activePassengerIndex, setActivePassengerIndex] =
    useState<number | null>(null);
  const [passengerClasses, setPassengerClasses] = useState<TicketClass[]>([
    initialClass,
  ]);
  const [chosenSeats, setChosenSeats] = useState<string[]>([""]);
  const [chosenTypes, setChosenTypes] = useState<SeatType[]>(["window"]);
  const [usedSeatSelection, setUsedSeatSelection] = useState(false);

  const [passForms, setPassForms] = useState<PassengerInfo[]>([emptyPassenger()]);
  const [phoneErrors, setPhoneErrors] = useState<Record<number, string>>({});
  const [emailErrors, setEmailErrors] = useState<Record<number, string>>({});

  const [extraBaggageKg, setExtraBaggageKg] = useState<number[]>([0]);
  const [takenSeats, setTakenSeats] = useState<string[]>([]);
  const [seatLoading, setSeatLoading] = useState(false);

  const theme = CLASS_THEME[selectedClass];

  const basePrices = passengerClasses.map((c) => getFlightPrice(flight, c));
  const totalSurcharge = usedSeatSelection
    ? chosenTypes.reduce((s, t) => s + SEAT_SURCHARGE[t], 0)
    : 0;
  const totalBase = basePrices.reduce((a, b) => a + b, 0);
  const baggageTotal = extraBaggageKg.reduce((s, kg) => s + kg * 30_000, 0);
  const grandTotal = totalBase + totalSurcharge + baggageTotal;

  const loadSeatAvailability = async (flightId: string, tClass: TicketClass) => {
    setSeatLoading(true);
    try {
      const data = await getSeatAvailability(flightId, tClass);
      setTakenSeats(
        data
          .filter((seat) => seat.status === "booked")
          .map((seat) => seat.seatNumber),
      );
    } catch (error) {
      console.error("Load seats failed:", error);
      setTakenSeats([]);
    } finally {
      setSeatLoading(false);
    }
  };

  useEffect(() => {
    const currentClass =
      activePassengerIndex !== null
        ? passengerClasses[activePassengerIndex]
        : selectedClass;

    loadSeatAvailability(flight.id, currentClass);
  }, [flight.id, selectedClass, activePassengerIndex, passengerClasses]);

  const applyPassengerCount = (n: number) => {
    setPassengerCount(n);
    setPassengerClasses(Array(n).fill(selectedClass));
    setChosenSeats(Array(n).fill(""));
    setChosenTypes(Array(n).fill("window"));
    setExtraBaggageKg(Array(n).fill(0));
    setPassForms(Array.from({ length: n }, emptyPassenger));
  };

  const handleOpenConfigure = () => {
    applyPassengerCount(passengerCount);
    setActivePassengerIndex(null);
    setUsedSeatSelection(false);
    setView("configure");
  };

  const handleConfirm = (withSeatMap: boolean) => {
    const taken: string[] = [];

    const finalSeats = Array.from({ length: passengerCount }, (_, i) => {
      if (withSeatMap && chosenSeats[i]) {
        taken.push(chosenSeats[i]);
        return chosenSeats[i];
      }

      const s = autoAssignSeat(
        passengerClasses[i] || selectedClass,
        taken,
        takenSeats,
      );
      taken.push(s);
      return s;
    });

    const finalTypes = finalSeats.map((s, i) => {
      if (withSeatMap && chosenSeats[i]) return chosenTypes[i];
      return getSeatType(s.replace(/\d+/, ""), passengerClasses[i] || selectedClass);
    });

    setChosenSeats(finalSeats);
    setChosenTypes(finalTypes);
    setUsedSeatSelection(withSeatMap);
    setPassForms(Array.from({ length: passengerCount }, emptyPassenger));
    setPhoneErrors({});
    setEmailErrors({});
    setView("login-prompt");
  };

  const toggleSeat = (seatId: string, type: SeatType) => {
    if (activePassengerIndex === null) return;

    setChosenSeats((prev) => {
      const next = [...prev];
      next[activePassengerIndex] =
        next[activePassengerIndex] === seatId ? "" : seatId;
      return next;
    });

    setChosenTypes((prev) => {
      const next = [...prev];
      next[activePassengerIndex] = type;
      return next;
    });

    setActivePassengerIndex(null);
  };

  const updatePassenger = (
    idx: number,
    field: keyof PassengerInfo,
    value: string,
  ) => {
    setPassForms((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleNameInput = (
    idx: number,
    field: keyof PassengerInfo,
    raw: string,
  ) => {
    updatePassenger(idx, field, normalizeToUppercase(raw));
  };

  const handlePhoneInput = (idx: number, raw: string) => {
    const clean = raw.replace(/\D/g, "");

    if (raw !== clean) {
      setPhoneErrors((p) => ({
        ...p,
        [idx]: "Phone number must contain digits only",
      }));
    } else if (clean.length > 0 && clean.length < 6) {
      setPhoneErrors((p) => ({
        ...p,
        [idx]: "Phone number must be at least 6 digits",
      }));
    } else {
      setPhoneErrors((p) => {
        const n = { ...p };
        delete n[idx];
        return n;
      });
    }

    updatePassenger(idx, "phone", clean);
  };

  const handleEmailInput = (idx: number, value: string) => {
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (value && !emailReg.test(value)) {
      setEmailErrors((p) => ({
        ...p,
        [idx]: "Please enter a valid email",
      }));
    } else {
      setEmailErrors((p) => {
        const n = { ...p };
        delete n[idx];
        return n;
      });
    }

    updatePassenger(idx, "email", value);
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(phoneErrors).length > 0 || Object.keys(emailErrors).length > 0) {
      return;
    }
    setView("summary");
  };

  const saveTempBookingAndGoPayment = () => {
    const finalizedPassForms = passForms.map((p) => ({
      ...p,
      phone: (p.phone || "").startsWith("0") ? p.phone.substring(1) : p.phone,
    }));

    localStorage.setItem(
      "tempBooking",
      JSON.stringify({
        bookingRef: generateRef(),
        flight,
        ticketClasses: passengerClasses,
        passengers: finalizedPassForms,
        passengerCounts: {
          adults: passengerCount,
          children: 0,
          infants: 0,
        },
        seatNumbers: chosenSeats,
        seatTypes: chosenTypes,
        basePrices,
        seatSurchargeTotal: totalSurcharge,
        totalPrice: grandTotal,
        usedSeatSelection,
        extraBaggageKg,
        pointsUsed: 0,
        pointsEarned: 0,
      }),
    );

    onClose();
    router.push("/customer/payment");
  };

  const handleGoLogin = () => {
    const finalizedPassForms = passForms.map((p) => ({
      ...p,
      phone: (p.phone || "").startsWith("0") ? p.phone.substring(1) : p.phone,
    }));

    localStorage.setItem(
      "tempBooking",
      JSON.stringify({
        bookingRef: generateRef(),
        flight,
        ticketClasses: passengerClasses,
        passengers: finalizedPassForms,
        passengerCounts: {
          adults: passengerCount,
          children: 0,
          infants: 0,
        },
        seatNumbers: chosenSeats,
        seatTypes: chosenTypes,
        basePrices,
        seatSurchargeTotal: totalSurcharge,
        totalPrice: grandTotal,
        usedSeatSelection,
        extraBaggageKg,
        pointsUsed: 0,
        pointsEarned: 0,
      }),
    );

    onClose();
    router.push("/login?returnUrl=/customer/payment");
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-w-[540px] overflow-hidden border-[#c3d4e8] bg-[#d2eaf4]/97 p-0 backdrop-blur-sm [&>button]:hidden"
        style={{ maxHeight: "92vh", overflowY: "auto" }}
      >
        <DialogTitle className="sr-only">Book Flight – Guest</DialogTitle>

        {view === "flight-detail" && (
          <div className="relative p-7">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mt-2 space-y-4">
              <div className="border-b border-[#c3d4e8] pb-4 text-center">
                <p className="mb-1 text-sm text-gray-500">Route</p>
                <p className="text-3xl font-bold tracking-tight text-[#0b5c66]">
                  {flight.departure.code} – {flight.arrival.code}
                </p>
              </div>

              <div className="flex items-center">
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  Flight time:
                </span>
                <span className="ml-auto font-bold text-gray-800">
                  {flight.duration}
                </span>
              </div>

              <div className="relative ml-1 space-y-5 border-l-2 border-gray-300 py-1 pl-5">
                <div className="relative border-b border-gray-100 pb-3">
                  <div className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-[#d2eaf4] bg-gray-400" />
                  <p className="mb-1 text-xs text-gray-400">Departs</p>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-800">
                      {flight.departure.city} ({flight.departure.code})
                    </p>
                    <p className="rounded border border-gray-200 bg-white/50 px-2 py-0.5 font-bold text-gray-900 shadow-sm">
                      {flight.departure.time}
                    </p>
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="absolute -left-[27px] top-2 h-3 w-3 rounded-full border-2 border-[#d2eaf4] bg-[#0b5c66]" />
                  <p className="mb-1 text-xs text-gray-400">Arrives</p>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-800">
                      {flight.arrival.city} ({flight.arrival.code})
                    </p>
                    <p className="rounded border border-gray-200 bg-white/50 px-2 py-0.5 font-bold text-gray-900 shadow-sm">
                      {flight.arrival.time}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#c3d4e8] pt-4 text-center">
                <p className="mb-1 text-sm text-gray-500">Flight no.</p>
                <p className="text-xl font-bold tracking-wider text-[#0b5c66]">
                  {flight.flightNumber}
                </p>
              </div>

              <div
                className={`${theme.card} ${theme.text} flex items-center justify-between rounded-xl p-3`}
              >
                <span className="text-sm font-semibold">
                  {CLASS_LABELS[selectedClass]}
                </span>
                <span className="text-right text-xs font-bold">
                  {flight.discount && selectedClass === "economy"
                    ? `Deal Fare\n${formatVND(getFlightPrice(flight, selectedClass))} VND / person`
                    : `Base Fare\n${formatVND(getFlightPrice(flight, selectedClass))} VND / person`}
                </span>
              </div>

              <div className="space-y-3 rounded-2xl border border-[#dce8f4] bg-white/80 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#0b5c66]">
                  <Users className="h-4 w-4" />
                  Number of Passengers
                </p>

                <div className="flex items-center justify-center gap-6">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full border-2 border-[#0b5c66] text-xl font-bold text-[#0b5c66] hover:bg-[#0b5c66] hover:text-white"
                    onClick={() => {
                      const n = Math.max(1, passengerCount - 1);
                      setPassengerCount(n);
                      applyPassengerCount(n);
                    }}
                  >
                    −
                  </Button>

                  <div className="text-center">
                    <div className="text-3xl font-black text-[#0b5c66]">
                      {passengerCount}
                    </div>
                    <div className="text-xs text-gray-500">
                      passenger{passengerCount > 1 ? "s" : ""}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full border-2 border-[#0b5c66] text-xl font-bold text-[#0b5c66] hover:bg-[#0b5c66] hover:text-white"
                    onClick={() => {
                      const n = Math.min(9, passengerCount + 1);
                      setPassengerCount(n);
                      applyPassengerCount(n);
                    }}
                  >
                    +
                  </Button>
                </div>

                <div className="flex justify-between border-t pt-2 text-sm">
                  <span className="text-gray-500">
                    {passengerCount} × {formatVND(getFlightPrice(flight, selectedClass))} VND
                  </span>
                  <span className="font-bold text-[#0b5c66]">
                    {formatVND(getFlightPrice(flight, selectedClass) * passengerCount)} VND
                  </span>
                </div>
              </div>

              <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                <span className="mt-0.5 shrink-0">🪑</span>
                <span>
                  <strong>Confirm</strong> = auto-assigned for free.{" "}
                  <strong>Configure Passengers</strong> = choose class/seat per passenger.
                </span>
              </div>

              <div className="mt-5 flex flex-col items-end gap-3">
                <Button
                  onClick={handleOpenConfigure}
                  className="w-full gap-2 bg-[#1e5b72] px-8 text-white hover:bg-[#154456]"
                >
                  🪑 Configure Passengers
                </Button>

                <Button
                  onClick={() => handleConfirm(false)}
                  className="w-full gap-2 bg-[#f5d020] px-8 font-semibold text-gray-900 hover:bg-yellow-500"
                >
                  <ChevronRight className="h-4 w-4" />
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        )}

        {view === "configure" && activePassengerIndex === null && (
          <div className="relative max-h-[85vh] w-full overflow-y-auto p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setView("flight-detail")}
                className="text-gray-400 hover:text-gray-700"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
              </button>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Configure Passengers
                </h3>
                <p className="text-xs text-gray-500">
                  {flight.departure.code}→{flight.arrival.code} · {passengerCount} passenger(s)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {Array.from({ length: passengerCount }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-xl border border-[#dce8f4] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0b5c66]">
                      Passenger {i + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Label className="text-[10px] uppercase text-gray-500">
                        Ticket Class
                      </Label>
                      <Select
                        value={passengerClasses[i]}
                        onValueChange={(v: TicketClass) => {
                          const next = [...passengerClasses];
                          next[i] = v;
                          setPassengerClasses(next);

                          if (chosenSeats[i]) {
                            const ns = [...chosenSeats];
                            ns[i] = "";
                            setChosenSeats(ns);

                            const nt = [...chosenTypes];
                            nt[i] = "window";
                            setChosenTypes(nt);
                          }
                        }}
                      >
                        <SelectTrigger className="mt-1 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {(["economy", "business", "firstClass"] as TicketClass[]).map(
                            (c) => (
                              <SelectItem
                                key={c}
                                value={c}
                                disabled={flight.seatsAvailable[c] === 0}
                              >
                                {CLASS_LABELS[c]}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1">
                      <Label className="text-[10px] uppercase text-gray-500">
                        Seat
                      </Label>
                      <Button
                        variant={chosenSeats[i] ? "default" : "outline"}
                        className={`mt-1 h-9 w-full ${
                          chosenSeats[i]
                            ? "bg-[#0b5c66] text-white hover:bg-[#0a4d55]"
                            : ""
                        }`}
                        onClick={() => setActivePassengerIndex(i)}
                      >
                        {chosenSeats[i] || "Choose Seat"}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between rounded-lg bg-[#0b5c66]/5 p-2">
                    <span className="text-xs font-semibold uppercase text-gray-500">
                      Base Fare
                    </span>
                    <span className="font-bold text-[#0b5c66]">
                      {formatVND(getFlightPrice(flight, passengerClasses[i]))} VND
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setView("flight-detail")}>
                Cancel
              </Button>
              <Button
                onClick={() => handleConfirm(true)}
                className="bg-[#f5d020] px-6 font-bold text-gray-900 hover:bg-yellow-500"
              >
                <Check className="mr-2 h-4 w-4" />
                Confirm Seats
              </Button>
            </div>
          </div>
        )}

        {view === "configure" && activePassengerIndex !== null && (
          <div className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActivePassengerIndex(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
              </button>
              <div>
                <h3 className="font-bold text-gray-800">
                  Passenger {activePassengerIndex + 1} Seat
                </h3>
                <p className="text-xs text-gray-500">
                  {CLASS_LABELS[passengerClasses[activePassengerIndex]]} Class
                </p>
              </div>
            </div>

            <div className="h-[65vh] overflow-y-auto px-1 pb-6">
              {seatLoading ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  Loading seat availability...
                </div>
              ) : (
                <AirplaneSeatMap
                  ticketClass={passengerClasses[activePassengerIndex]}
                  passengerCount={1}
                  selectedSeats={
                    chosenSeats[activePassengerIndex]
                      ? [chosenSeats[activePassengerIndex]]
                      : []
                  }
                  selectedTypes={
                    chosenTypes[activePassengerIndex]
                      ? [chosenTypes[activePassengerIndex]]
                      : []
                  }
                  onToggle={toggleSeat}
                  takenSeats={[
                    ...takenSeats,
                    ...chosenSeats.filter(
                      (s, i) => i !== activePassengerIndex && s !== "",
                    ),
                  ]}
                />
              )}
            </div>
          </div>
        )}

        {view === "login-prompt" && (
          <div className="relative p-7">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setView("flight-detail")}
                className="text-gray-400 hover:text-gray-700"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
              </button>
              <h3 className="text-lg font-bold text-gray-800">
                One more step!
              </h3>
            </div>

            <div className="space-y-5">
              <div className="py-2 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0b5c66]/10">
                  <LogIn className="h-8 w-8 text-[#0b5c66]" />
                </div>
                <h4 className="mb-2 text-lg font-bold text-gray-800">
                  Would you like to sign in?
                </h4>
                <p className="mx-auto max-w-xs text-sm text-gray-500">
                  Sign in to continue payment with your account, or continue as
                  guest and pay directly.
                </p>
              </div>

              <div className="grid gap-3">
                <Button
                  onClick={handleGoLogin}
                  className="h-12 gap-2 bg-[#0b5c66] font-semibold text-white hover:bg-[#094a52]"
                >
                  <LogIn className="h-4 w-4" />
                  Log In / Sign Up
                </Button>

                <Button
                  onClick={() => setView("info")}
                  variant="outline"
                  className="h-12 gap-2 border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                  Continue as Guest
                </Button>
              </div>

              <p className="text-center text-xs text-gray-400">
                Your seat selections have been held.
              </p>
            </div>
          </div>
        )}

        {view === "info" && (
          <div className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView("login-prompt")}
              >
                <ArrowRight className="h-5 w-5 rotate-180" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Passenger Information
                </h1>
                <p className="text-sm text-gray-500">
                  {flight.departure.code} → {flight.arrival.code} · {passengerCount} passenger(s)
                </p>
              </div>
            </div>

            <div
              className={`${CLASS_THEME[passengerClasses[0] || selectedClass].card} ${
                CLASS_THEME[passengerClasses[0] || selectedClass].text
              } mb-4 flex items-center justify-between rounded-2xl p-4`}
            >
              <div className="flex items-center gap-5">
                <div className="text-center">
                  <p className="text-2xl font-bold">{flight.departure.code}</p>
                  <p className="text-xs opacity-75">{flight.departure.time}</p>
                </div>
                <div className="flex items-center gap-2 opacity-60">
                  <div className="h-px w-10 bg-white/60" />
                  <Plane className="h-4 w-4" />
                  <div className="h-px w-10 bg-white/60" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{flight.arrival.code}</p>
                  <p className="text-xs opacity-75">{flight.arrival.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-75">Total due</p>
                <p className="text-lg font-bold">
                  {formatVND(totalBase + totalSurcharge)} VND
                </p>
                {!usedSeatSelection && (
                  <p className="text-[10px] opacity-60">Seat auto-assigned</p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmitInfo} className="space-y-4">
              {Array.from({ length: passengerCount }).map((_, idx) => (
                <Card key={idx} className="overflow-hidden border border-[#dce8f4]">
                  <CardHeader className="border-b border-[#dce8f4] bg-[#b3ddef]/30 pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0b5c66] text-sm font-bold text-white">
                        {idx + 1}
                      </div>
                      Passenger {idx + 1}
                      <Badge
                        variant="outline"
                        className="ml-auto border-[#0b5c66] font-mono text-xs text-[#0b5c66]"
                      >
                        Seat: {chosenSeats[idx] || "Auto"}
                        {usedSeatSelection && chosenTypes[idx]
                          ? ` (${SEAT_TYPE_INFO[chosenTypes[idx]].label})`
                          : ""}
                      </Badge>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4 bg-white pt-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div className="space-y-1">
                        <Label>
                          Title <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={passForms[idx]?.title ?? "Mr"}
                          onValueChange={(v) => updatePassenger(idx, "title", v)}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["Mr", "Mrs", "Ms", "Dr", "Prof"].map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label>
                          Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          required
                          placeholder="e.g. NGUYEN"
                          value={passForms[idx]?.lastName ?? ""}
                          onChange={(e) =>
                            handleNameInput(idx, "lastName", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Middle Name</Label>
                        <Input
                          placeholder="e.g. THI (optional)"
                          value={passForms[idx]?.middleName ?? ""}
                          onChange={(e) =>
                            handleNameInput(idx, "middleName", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>
                          First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          required
                          placeholder="e.g. AN"
                          value={passForms[idx]?.firstName ?? ""}
                          onChange={(e) =>
                            handleNameInput(idx, "firstName", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <p className="-mt-2 text-[10px] italic text-gray-400">
                      Names auto-converted to uppercase (as on passport)
                    </p>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label>
                          Date of Birth <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          required
                          type="date"
                          max={TODAY}
                          value={passForms[idx]?.dateOfBirth ?? ""}
                          onChange={(e) =>
                            updatePassenger(idx, "dateOfBirth", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>
                          Passport / National ID{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          required
                          placeholder="Enter document number"
                          value={passForms[idx]?.cccd ?? ""}
                          onChange={(e) =>
                            updatePassenger(idx, "cccd", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label>
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        required
                        type="email"
                        placeholder="email@example.com"
                        value={passForms[idx]?.email ?? ""}
                        onChange={(e) => handleEmailInput(idx, e.target.value)}
                        className={
                          emailErrors[idx]
                            ? "border-red-400 focus-visible:ring-red-300"
                            : ""
                        }
                      />
                      {emailErrors[idx] && (
                        <p className="text-xs text-red-500">
                          ⚠ {emailErrors[idx]}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-1">
                        <Label>
                          Phone Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={passForms[idx]?.phoneType ?? "personal"}
                          onValueChange={(v) =>
                            updatePassenger(
                              idx,
                              "phoneType",
                              v as "personal" | "business",
                            )
                          }
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="personal">Personal</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label>
                          Country Code <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={passForms[idx]?.countryCode ?? "+84"}
                          onValueChange={(v) =>
                            updatePassenger(idx, "countryCode", v)
                          }
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {COUNTRY_CODES.map((c) => (
                              <SelectItem
                                key={c.dial + c.name}
                                value={c.dial}
                              >
                                {c.dial} · {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label>
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          required
                          type="tel"
                          inputMode="numeric"
                          placeholder="e.g. 0901234567"
                          value={passForms[idx]?.phone ?? ""}
                          onChange={(e) => handlePhoneInput(idx, e.target.value)}
                          className={
                            phoneErrors[idx]
                              ? "border-red-400 focus-visible:ring-red-300"
                              : ""
                          }
                        />
                        {phoneErrors[idx] && (
                          <p className="text-xs text-red-500">
                            ⚠ {phoneErrors[idx]}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex items-start gap-2 rounded-xl border border-[#dce8f4] bg-[#eef3f9] p-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1e4069]" />
                <p className="text-xs text-[#1a3557]">
                  Passenger names must exactly match the identity document used
                  for check-in.
                </p>
              </div>

              <div className="rounded-xl border bg-gray-50 p-4 text-sm space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Total Base Fare</span>
                  <span>{formatVND(totalBase)} VND</span>
                </div>
                {totalSurcharge > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Seat selection fee</span>
                    <span>{formatVND(totalSurcharge)} VND</span>
                  </div>
                )}
                {!usedSeatSelection && (
                  <p className="text-xs italic text-gray-400">
                    Seat will be randomly assigned at no extra charge.
                  </p>
                )}
                <div className="flex justify-between border-t pt-2 font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-base text-[#0b5c66]">
                    {formatVND(totalBase + totalSurcharge)} VND
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  className="gap-2 bg-[#f5d020] px-8 font-semibold text-gray-900 hover:bg-yellow-500"
                >
                  <FileText className="h-4 w-4" />
                  Next to Summary
                </Button>
              </div>
            </form>
          </div>
        )}

        {view === "summary" && (
          <div className="space-y-5 p-6">
            <div className="mb-2 flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setView("info")}>
                <ArrowRight className="h-5 w-5 rotate-180" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Ticket Summary
                </h1>
                <p className="text-sm text-gray-500">
                  Review your tickets before proceeding to payment.
                </p>
              </div>
            </div>

            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#dce8f4] bg-[#d2eaf4] px-6 py-4">
                <h2 className="text-lg font-bold text-[#0b5c66]">Tickets</h2>
                <Badge
                  variant="outline"
                  className="border-[#0b5c66]/20 bg-white/50 text-[#0b5c66]"
                >
                  {flight.departure.code} → {flight.arrival.code}
                </Badge>
              </div>

              <CardContent className="divide-y p-0">
                {passForms.map((p, i) => (
                  <div
                    key={i}
                    className="flex flex-col justify-between gap-4 p-6 hover:bg-gray-50/50 md:flex-row md:items-center"
                  >
                    <div className="flex-1">
                      <p className="mb-1 text-sm font-medium text-gray-500">
                        Passenger {i + 1}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {[p.title, p.firstName, p.middleName, p.lastName]
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                      <div className="mt-2 flex gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-0.5 text-xs font-semibold shadow-sm">
                          Seat {chosenSeats[i]}
                        </span>
                        <span className="flex items-center gap-1 px-2 py-0.5 text-xs text-gray-500">
                          Includes 20kg Checked Baggage
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 rounded-xl border border-[#dce8f4]/50 bg-[#eef3f9]/50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3557]">
                        Extra Checked Baggage
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full border-[#3a6090] text-[#1a3557] hover:bg-[#dce8f4]"
                          onClick={() =>
                            setExtraBaggageKg((prev) => {
                              const n = [...prev];
                              n[i] = Math.max(0, n[i] - 1);
                              return n;
                            })
                          }
                        >
                          −
                        </Button>
                        <div className="w-12 text-center font-bold text-[#0b5c66]">
                          {extraBaggageKg[i] || 0} kg
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full border-[#3a6090] text-[#1a3557] hover:bg-[#dce8f4]"
                          onClick={() =>
                            setExtraBaggageKg((prev) => {
                              const n = [...prev];
                              n[i] = n[i] + 1;
                              return n;
                            })
                          }
                        >
                          +
                        </Button>
                      </div>
                      {extraBaggageKg[i] > 0 && (
                        <p className="text-[11px] font-bold text-[#1e4069]">
                          +{formatVND(extraBaggageKg[i] * 30_000)} VND
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 bg-[#0b5c66] shadow-xl">
              <CardContent className="flex flex-col justify-between gap-6 p-6 text-white sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white/70">
                    Grand Total
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black">{formatVND(grandTotal)}</p>
                    <p className="text-sm text-white/50">VND</p>
                  </div>
                  {totalSurcharge > 0 && (
                    <p className="text-xs text-yellow-300">
                      Includes seat fee: {formatVND(totalSurcharge)} VND
                    </p>
                  )}
                  {flight.discount && (
                    <p className="text-xs text-emerald-200">
                      Deal applied to Economy fare
                    </p>
                  )}
                </div>

                <Button
                  size="lg"
                  onClick={saveTempBookingAndGoPayment}
                  className="h-14 rounded-xl bg-[#f5d020] px-8 text-base font-bold text-gray-900 shadow-lg hover:bg-yellow-500"
                >
                  <Check className="mr-2 h-5 w-5" />
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>

            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <Mail className="mt-0.5 h-5 w-5 shrink-0" />
              <span>
                You will complete payment on the payment page after this step.
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}