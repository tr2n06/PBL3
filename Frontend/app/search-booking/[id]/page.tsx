'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import type { TicketClass } from '@/lib/types'
import {
  getTicketDetail,
  requestTicketCancellation,
  checkTicketCancellationRequested,
} from '@/lib/manage-tickets-api'
import {
  confirmSuccessPayment,
  completePayment,
  confirmTicketActionPayment,
  fetchPaymentStatus,
  initiateTicketActionPayment,
} from '@/lib/payment-api'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Plane,
  Clock,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Calendar,
  Luggage,
  ArrowUpCircle,
  XCircle,
  Plus,
  Minus,
  AlertTriangle,
  CreditCard,
  QrCode,
  Check,
  ChevronRight,
} from 'lucide-react'

export type TicketDetailResponse = {
  id: string;
  bookingRef: string;
  passengerName: string;
  flightId: string;
  seatNumber: string;
  ticketClass: TicketClass;
  price: number;
  status: "confirmed" | "pending" | "cancelled";
  baggage: {
    cabin: number;
    checked: number;
    priceCabin?: number;
    checkedCabin?: number;
  };
  totalPrice?: number;
  isCancelled?: boolean;
  isUpgraded?: boolean;
  flight: {
    flightNumber: string;
    airline: string;
    duration: string;
    departure: {
      code: string;
      city: string;
      airport: string;
      time: string;
      date: string;
    };
    arrival: {
      code: string;
      city: string;
      airport: string;
      time: string;
      date: string;
    };
  };
};

const CLASS_LABELS: Record<TicketClass, string> = {
  economy: 'Economy',
  business: 'Premium Economy',
  firstClass: 'Business',
}

const PRICE_RANGES: Record<TicketClass, readonly [number, number]> = {
  economy:   [3_000_000, 3_500_000],
  business:  [4_500_000, 5_200_000],
  firstClass:[8_000_000, 10_000_000],
}

function hashStr(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) ^ s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function getBasePrice(flightId: string, tClass: TicketClass): number {
  const [min, max] = PRICE_RANGES[tClass]
  return Math.round((min + (hashStr(flightId + tClass) % (max - min))) / 50_000) * 50_000
}

function formatVND(n: number) { return new Intl.NumberFormat('vi-VN').format(n) }

const CLASS_ORDER: TicketClass[] = ['economy', 'business', 'firstClass']
function getAvailableUpgrades(current: TicketClass): TicketClass[] {
  return CLASS_ORDER.slice(CLASS_ORDER.indexOf(current) + 1)
}

const BAGGAGE_VND_PER_KG = 40_000
const KG_PER_BAG = 1

type SeatType = 'window' | 'aisle' | 'middle'
const SEAT_SURCHARGE: Record<SeatType, number> = { window: 350_000, aisle: 150_000, middle: 0 }
const SEAT_TYPE_INFO: Record<SeatType, { label: string; icon: string; available: string; dot: string }> = {
  window: { label: 'Window', icon: '🪟', available: 'border-[#3a6090] bg-[#eef3f9] text-[#1a3557] hover:bg-[#dce8f4]', dot: 'bg-[#3a6090]' },
  aisle:  { label: 'Aisle',  icon: '↔',  available: 'border-emerald-400 bg-emerald-50 text-emerald-800 hover:bg-emerald-100', dot: 'bg-emerald-400' },
  middle: { label: 'Middle', icon: '●',  available: 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100', dot: 'bg-amber-300' },
}
interface SeatColDef { col: string; type: SeatType }
const CABIN_CONFIG: Record<TicketClass, { rows: number[]; left: SeatColDef[]; right: SeatColDef[]; label: string }> = {
  economy:    { rows: [20,21,22,23,24,25,26,27], left: [{col:'A',type:'window'},{col:'B',type:'middle'},{col:'C',type:'aisle'}], right: [{col:'D',type:'aisle'},{col:'E',type:'middle'},{col:'F',type:'window'}], label: 'Economy Cabin' },
  business:   { rows: [5,6,7,8,9,10], left: [{col:'A',type:'window'},{col:'B',type:'aisle'}], right: [{col:'C',type:'aisle'},{col:'D',type:'window'}], label: 'Premium Economy Cabin' },
  firstClass: { rows: [1,2,3,4], left: [{col:'A',type:'window'}], right: [{col:'B',type:'window'}], label: 'Business Suite' },
}
function isSeatOccupied(flightId: string, seatId: string) { return hashStr(flightId + seatId) % 4 === 0 }

type PaymentMethod = 'card' | 'qr' | null

function PaymentStep({
  amountVND,
  paymentMethod,
  setPaymentMethod,
  isProcessing,
  onConfirm,
  onBack,
}: {
  amountVND: number
  paymentMethod: PaymentMethod
  setPaymentMethod: (m: PaymentMethod) => void
  isProcessing: boolean
  onConfirm: () => void
  onBack: () => void
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg bg-secondary/50 p-4 flex justify-between items-center">
        <span className="font-semibold">Amount to pay</span>
        <span className="text-xl font-bold text-primary">{formatVND(amountVND)} VND</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Card */}
        <button
          type="button"
          onClick={() => alert("We are sorry, this payment method is currently not supported.")}
          className={`relative group flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-200 bg-white shadow-sm hover:shadow-lg ${
            paymentMethod === 'card'
              ? 'border-primary ring-4 ring-primary/10'
              : 'border-gray-100 grayscale hover:grayscale-0'
          }`}
        >
          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-2 relative">
            <img
              src="https://i.pinimg.com/736x/9c/71/d6/9c71d69a83143c2ec5f518698b174533.jpg"
              alt="Card Payment"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {paymentMethod === 'card' && (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <div className="bg-white rounded-full p-1.5 shadow-lg">
                  <Check className="w-4 h-4 text-primary stroke-[3px]" />
                </div>
              </div>
            )}
          </div>
          <span className="text-sm font-bold text-gray-800 flex items-center gap-1">
            <CreditCard className="h-3.5 w-3.5" /> Card
          </span>
        </button>

        {/* QR */}
        <button
          type="button"
          onClick={() => setPaymentMethod('qr')}
          className={`relative group flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-200 bg-white shadow-sm hover:shadow-lg ${
            paymentMethod === 'qr'
              ? 'border-primary ring-4 ring-primary/10'
              : 'border-gray-100 grayscale hover:grayscale-0'
          }`}
        >
          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-2 relative">
            <img
              src="https://i.pinimg.com/736x/f6/fb/c4/f6fbc4deadbcc5287d59fff163191cee.jpg"
              alt="QR Payment"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {paymentMethod === 'qr' && (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <div className="bg-white rounded-full p-1.5 shadow-lg">
                  <Check className="w-4 h-4 text-primary stroke-[3px]" />
                </div>
              </div>
            )}
          </div>
          <span className="text-sm font-bold text-gray-800 flex items-center gap-1">
            <QrCode className="h-3.5 w-3.5" /> QR
          </span>
        </button>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!paymentMethod || isProcessing}
          className="flex-1"
        >
          {isProcessing ? 'Processing…' : `Confirm Payment`}
        </Button>
      </div>
    </div>
  )
}

function TicketDetailContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const ticketId = params.id as string
  const returnTicketId = searchParams.get('returnTicketId')

  const [mainTicket, setMainTicket] = useState<TicketDetailResponse | null>(null)
  const [returnTicket, setReturnTicket] = useState<TicketDetailResponse | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState("")

  const [activeDialogTicket, setActiveDialogTicket] = useState<TicketDetailResponse | null>(null)
  const [extraBaggagePaidVND, setExtraBaggagePaidVND] = useState(0)

  const [isMainCancelledRequested, setIsMainCancelledRequested] = useState(false)
  const [isReturnCancelledRequested, setIsReturnCancelledRequested] = useState(false)

  // Upgrade
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [upgradeStep, setUpgradeStep] = useState<'select' | 'seat' | 'payment' | 'success'>('select')
  const [selectedUpgrade, setSelectedUpgrade] = useState<TicketClass | ''>('')
  const [upgradePaymentMethod, setUpgradePaymentMethod] = useState<PaymentMethod>(null)
  const [upgradeSeat, setUpgradeSeat] = useState<string>('')
  const [upgradeType, setUpgradeType] = useState<SeatType>('window')
  const [upgradeSeatChosen, setUpgradeSeatChosen] = useState(false)

  // Baggage
  const [showBaggageDialog, setShowBaggageDialog] = useState(false)
  const [baggageStep, setBaggageStep] = useState<'select' | 'payment' | 'success'>('select')
  const [extraCheckedKg, setExtraCheckedKg] = useState(0)
  const [baggagePaymentMethod, setBaggagePaymentMethod] = useState<PaymentMethod>(null)

  // Cancel
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Unpaid Payment
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qr' | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [isPaying, setIsPaying] = useState(false)

  const isTicketExpiredCheck = (t: TicketDetailResponse) => {
    const departureDate = new Date(`${t.flight.departure.date}T${t.flight.departure.time}`)
    return departureDate < new Date()
  }

  const isExpired = mainTicket ? isTicketExpiredCheck(mainTicket) : false
  const isReturnExpired = returnTicket ? isTicketExpiredCheck(returnTicket) : false

  const refreshTicketDetails = useCallback(async () => {
    if (!ticketId) return
    try {
      const data = await getTicketDetail(ticketId)
      setMainTicket(data)
      try {
        const isUpgReq = await checkTicketCancellationRequested(ticketId)
        setIsMainCancelledRequested(isUpgReq)
      } catch (e) {
        console.error(e)
      }
      if (activeDialogTicket && activeDialogTicket.id === data.id) {
        setActiveDialogTicket(data)
      }
    } catch (err) {
      console.error("Refresh ticket failed:", err)
    }

    if (returnTicketId) {
      try {
        const retData = await getTicketDetail(returnTicketId)
        setReturnTicket(retData)
        try {
          const isRetReq = await checkTicketCancellationRequested(returnTicketId)
          setIsReturnCancelledRequested(isRetReq)
        } catch (e) {
          console.error(e)
        }
        if (activeDialogTicket && activeDialogTicket.id === retData.id) {
          setActiveDialogTicket(retData)
        }
      } catch (err) {
        console.error("Refresh return ticket failed:", err)
      }
    }
  }, [ticketId, returnTicketId, activeDialogTicket])

  // Status Polling for QR Payments
  useEffect(() => {
    if (!mainTicket || mainTicket.status !== 'pending' || !paymentMethod || paymentMethod !== 'qr') return;

    let active = true;
    const interval = setInterval(async () => {
      try {
        const data = await fetchPaymentStatus(mainTicket.bookingRef);
        if (data.status === "confirmed" && active) {
          clearInterval(interval);
          await refreshTicketDetails();
          alert("Thanh toan thanh cong!");
        }
      } catch (err) {
        console.error("Status polling failed:", err);
      }
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [mainTicket, paymentMethod, refreshTicketDetails]);

  const handlePendingCardPayment = async () => {
    if (!mainTicket) return;
    setIsPaying(true);
    try {
      const totalAmount = returnTicket ? mainTicket.price + returnTicket.price : mainTicket.price;
      await confirmSuccessPayment({
        bookingRef: mainTicket.bookingRef,
        paymentMethod: "card",
        amount: totalAmount
      });
      await refreshTicketDetails();
      alert("Thanh toán thành công!");
    } catch (err) {
      console.error("Payment failed:", err);
      alert(err instanceof Error ? err.message : "Thanh toán thất bại");
    } finally {
      setIsPaying(false);
    }
  };

  const handlePendingQRPayment = async () => {
    if (!mainTicket) return;
    setIsPaying(true);
    try {
      const ticketClasses = [mainTicket.ticketClass]
      const seatNumbers = [mainTicket.seatNumber]
      const basePrices = [mainTicket.price]
      const extraBaggageKg = [0]

      if (returnTicket) {
        ticketClasses.push(returnTicket.ticketClass)
        seatNumbers.push(returnTicket.seatNumber)
        basePrices.push(returnTicket.price)
        extraBaggageKg.push(0)
      }

      const res = await completePayment({
        bookingRef: mainTicket.bookingRef,
        flightId: mainTicket.flightId,
        returnFlightId: returnTicket?.flightId || undefined,
        ticketClasses,
        seatNumbers,
        passengers: [{
          passengerType: "adult",
          title: "MR",
          firstName: mainTicket.passengerName,
          middleName: "",
          lastName: "",
          gender: "male",
          dateOfBirth: "1990-01-01",
          cccd: "",
          email: "",
          phoneType: "personal",
          countryCode: "+84",
          phone: ""
        }],
        passengerCounts: { adults: 1, children: 0, infants: 0 },
        basePrices,
        seatTypes: returnTicket ? ["window", "window"] : ["window"],
        seatSurchargeTotal: 0,
        totalPrice: returnTicket ? mainTicket.price + returnTicket.price : mainTicket.price,
        extraBaggageKg,
        pointsUsed: 0,
        pointsEarned: 0,
        paymentMethod: "qr"
      } as any);
      if (res.qrLink) {
        setQrCodeUrl(res.qrLink);
      }
    } catch (err) {
      console.error("QR Code fetch failed:", err);
      alert("Không lấy được mã QR thanh toán!");
    } finally {
      setIsPaying(false);
    }
  };

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setPageLoading(true)
        setPageError("")
        const mainData = await getTicketDetail(ticketId)
        setMainTicket(mainData)
        try {
          const isUpgReq = await checkTicketCancellationRequested(ticketId)
          setIsMainCancelledRequested(isUpgReq)
        } catch (e) {
          console.error(e)
        }

        if (returnTicketId) {
          const retData = await getTicketDetail(returnTicketId)
          setReturnTicket(retData)
          try {
            const isRetReq = await checkTicketCancellationRequested(returnTicketId)
            setIsReturnCancelledRequested(isRetReq)
          } catch (e) {
            console.error(e)
          }
        }
      } catch (error) {
        console.error("Load ticket detail failed:", error)
        setPageError(error instanceof Error ? error.message : "Failed to load ticket")
      } finally {
        setPageLoading(false)
      }
    }

    if (ticketId) loadTickets()
  }, [ticketId, returnTicketId])

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Plane className="mb-4 h-12 w-12 text-muted-foreground animate-bounce" />
        <p className="text-muted-foreground">Loading ticket...</p>
      </div>
    )
  }

  if (pageError || !mainTicket) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Plane className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">Failed to load ticket</h2>
        <p className="mb-4 text-muted-foreground">{pageError || "Ticket not found"}</p>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    )
  }

  const ticket = activeDialogTicket || mainTicket
  const availableUpgrades = ticket ? getAvailableUpgrades(ticket.ticketClass) : []

  const upgradeClassDiff = (ticket && selectedUpgrade)
    ? Math.max(0, Math.round(getBasePrice(ticket.flightId, selectedUpgrade as TicketClass) * 1.2 - ticket.price))
    : 0
  const upgradeSeatFee = upgradeSeatChosen ? SEAT_SURCHARGE[upgradeType] : 0
  const upgradePrice = upgradeClassDiff + upgradeSeatFee

  const bagCostVND = extraCheckedKg * BAGGAGE_VND_PER_KG

  const openUpgradeDialog = (t: TicketDetailResponse) => {
    setActiveDialogTicket(t)
    setSelectedUpgrade('')
    setUpgradeStep('select')
    setUpgradePaymentMethod(null)
    setUpgradeSeat('')
    setUpgradeType('window')
    setUpgradeSeatChosen(false)
    setShowUpgradeDialog(true)
  }

  const closeUpgradeDialog = () => {
    setShowUpgradeDialog(false)
    setUpgradeStep('select')
    setSelectedUpgrade('')
    setUpgradePaymentMethod(null)
    setUpgradeSeat('')
    setUpgradeType('window')
    setUpgradeSeatChosen(false)
  }

  const openBaggageDialog = (t: TicketDetailResponse) => {
    setActiveDialogTicket(t)
    setExtraCheckedKg(0)
    setBaggageStep('select')
    setBaggagePaymentMethod(null)
    setShowBaggageDialog(true)
  }

  const closeBaggageDialog = () => {
    setShowBaggageDialog(false)
    setBaggageStep('select')
    setBaggagePaymentMethod(null)
    setExtraCheckedKg(0)
  }

  const openCancelDialog = (t: TicketDetailResponse) => {
    setActiveDialogTicket(t)
    setCancelReason('')
    setShowCancelDialog(true)
  }

  const waitForTicketActionConfirmation = async (transactionCode: string) => {
    for (let attempt = 0; attempt < 80; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 3000))
      const data = await fetchPaymentStatus(transactionCode)
      if (data.status === 'confirmed') return
    }
    throw new Error('Payment confirmation timed out')
  }

  const handleUpgradePayment = async () => {
    if (!upgradePaymentMethod || !selectedUpgrade || !activeDialogTicket) return
    setIsProcessing(true)
    try {
      const payment = await initiateTicketActionPayment({
        actionType: 'upgrade',
        ticketId: activeDialogTicket.id,
        paymentMethod: upgradePaymentMethod,
        amount: upgradePrice,
        newClass: selectedUpgrade as TicketClass,
        seatNumber: upgradeSeatChosen ? upgradeSeat : undefined,
        seatType: upgradeSeatChosen ? upgradeType : undefined,
        seatFee: upgradeSeatFee,
      })

      if (upgradePaymentMethod === 'qr') {
        if (!payment.qrLink) throw new Error('Missing QR payment link')
        window.open(payment.qrLink, '_blank', 'noopener,noreferrer')
        await waitForTicketActionConfirmation(payment.transactionCode)
      } else {
        await confirmTicketActionPayment({
          transactionCode: payment.transactionCode,
          paymentMethod: upgradePaymentMethod,
        })
      }

      await refreshTicketDetails()
      setIsProcessing(false)
      setUpgradeStep('success')
    } catch (error) {
      console.error("Upgrade ticket failed:", error)
      setIsProcessing(false)
      alert(error instanceof Error ? error.message : "Upgrade failed")
    }
  }

  const handleBaggagePayment = async () => {
    if (!baggagePaymentMethod || !activeDialogTicket) return
    setIsProcessing(true)
    try {
      const payment = await initiateTicketActionPayment({
        actionType: 'baggage',
        ticketId: activeDialogTicket.id,
        paymentMethod: baggagePaymentMethod,
        amount: bagCostVND,
        extraCheckedKg,
      })

      if (baggagePaymentMethod === 'qr') {
        if (!payment.qrLink) throw new Error('Missing QR payment link')
        window.open(payment.qrLink, '_blank', 'noopener,noreferrer')
        await waitForTicketActionConfirmation(payment.transactionCode)
      } else {
        await confirmTicketActionPayment({
          transactionCode: payment.transactionCode,
          paymentMethod: baggagePaymentMethod,
        })
      }

      await refreshTicketDetails()
      setExtraBaggagePaidVND(prev => prev + bagCostVND)
      setIsProcessing(false)
      setBaggageStep('success')
    } catch (error) {
      console.error("Add baggage failed:", error)
      setIsProcessing(false)
      alert(error instanceof Error ? error.message : "Add baggage failed")
    }
  }

  const handleCancelRequest = async () => {
    if (!activeDialogTicket) return
    if (!cancelReason.trim()) {
      alert("Please provide a cancellation reason")
      return
    }
    setIsProcessing(true)
    try {
      await requestTicketCancellation({
        ticketId: activeDialogTicket.id,
        reason: cancelReason.trim(),
      })
      setIsProcessing(false)
      setShowCancelDialog(false)
      alert("Cancellation request submitted. Waiting for manager approval.")
      router.push(`/search-booking?code=${mainTicket.bookingRef}`)
    } catch (error) {
      console.error("Cancellation request failed:", error)
      setIsProcessing(false)
      alert(error instanceof Error ? error.message : "Cancellation request failed")
    }
  }

  const renderTicketBlock = (t: TicketDetailResponse, isPartner: boolean = false) => {
    const tIsExpired = isTicketExpiredCheck(t)
    const tFare = t.price
    const tPriceCabin = t.baggage?.priceCabin ?? 0
    const tCheckedCabin = t.baggage?.checkedCabin ?? ((t.baggage?.checked ?? 0) * 40000)
    const tTotalPrice = t.totalPrice ?? (tFare + tPriceCabin + tCheckedCabin)
    const isCancelledRequested = isPartner ? isReturnCancelledRequested : isMainCancelledRequested

    return (
      <Card key={t.id} className="overflow-hidden border border-gray-200">
        <CardHeader className="border-b bg-secondary/30 pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white">
                <Plane className={`h-5 w-5 ${isPartner ? '-rotate-135' : 'rotate-45'}`} />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {isPartner ? 'Chuyến về · ' : 'Chuyến đi · '}{t.flight.flightNumber}
                </CardTitle>
                <CardDescription className="text-xs">{t.flight.airline}</CardDescription>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">{CLASS_LABELS[t.ticketClass] ?? t.ticketClass}</Badge>
              <Badge className={tIsExpired && t.status === 'confirmed' ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-accent text-accent-foreground"}>
                {tIsExpired && t.status === 'confirmed' ? 'Expired' : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {isCancelledRequested && (
            <div className="rounded-xl border-2 border-amber-200 bg-amber-50/50 p-4 flex gap-3 animate-in fade-in duration-300">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h3 className="font-bold text-amber-800 text-sm">Vé đang chờ xử lý hủy</h3>
                <p className="text-xs text-amber-600">
                  Yêu cầu hủy vé của bạn đang được quản lý xem xét. Bạn không thể thực hiện các thao tác khác (nâng hạng, mua hành lý...) trong thời gian này.
                </p>
              </div>
            </div>
          )}

          {t.status === 'pending' && tIsExpired && (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 flex gap-3 animate-in fade-in duration-300">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-800 text-sm">Vé quá hạn chưa thanh toán!</h3>
                <p className="text-xs text-red-600">Chuyến bay này đã khởi hành. Giao dịch mua vé của bạn không còn hiệu lực thanh toán.</p>
              </div>
            </div>
          )}

          {t.status === 'confirmed' && tIsExpired && (
            <div className="rounded-xl border-2 border-amber-200 bg-amber-50/50 p-4 flex gap-3 animate-in fade-in duration-300">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h3 className="font-bold text-amber-800 text-sm">Vé máy bay đã quá hạn</h3>
                <p className="text-xs text-amber-600">
                  Chuyến bay đã khởi hành lúc {t.flight.departure.time} ngày {t.flight.departure.date}. 
                  Bạn không thể thay đổi thông tin vé (nâng hạng, mua thêm hành lý hoặc hủy vé).
                </p>
              </div>
            </div>
          )}

          {/* Route */}
          <div className="grid grid-cols-3 gap-4 text-center py-2">
            <div>
              <div className="text-3xl font-bold text-[#0b5c66]">{t.flight.departure.code}</div>
              <div className="text-lg font-semibold mt-0.5">{t.flight.departure.time}</div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3.5 w-3.5" /> {t.flight.departure.city}
              </div>
              <div className="text-[10px] text-muted-foreground line-clamp-1">{t.flight.departure.airport}</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <Clock className="mb-1 h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-semibold">{t.flight.duration}</span>
              <div className="flex items-center gap-1 mt-1">
                <div className="h-px w-10 bg-gray-300" />
                <ArrowRight className="h-4 w-4 text-[#0b5c66]" />
                <div className="h-px w-10 bg-gray-300" />
              </div>
              <span className="text-[10px] text-muted-foreground mt-1">Direct Flight</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#0b5c66]">{t.flight.arrival.code}</div>
              <div className="text-lg font-semibold mt-0.5">{t.flight.arrival.time}</div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3.5 w-3.5" /> {t.flight.arrival.city}
              </div>
              <div className="text-[10px] text-muted-foreground line-clamp-1">{t.flight.arrival.airport}</div>
            </div>
          </div>

          {/* Details */}
          <div className="grid gap-3 rounded-xl bg-secondary/20 p-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Mã đặt chỗ</div>
              <div className="font-mono font-bold text-[#0b5c66]">{t.bookingRef}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Hành khách</div>
              <div className="font-medium">{t.passengerName}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Số ghế</div>
              <div className="font-bold">{t.seatNumber || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Ngày khởi hành</div>
              <div className="flex items-center gap-1 font-semibold">
                <Calendar className="h-3.5 w-3.5 text-gray-500" />
                {t.flight.departure.date}
              </div>
            </div>
          </div>

          {/* Baggage */}
          <div className="bg-slate-50 p-4 rounded-xl border">
            <h4 className="font-bold text-sm text-gray-800 mb-2">Hành lý đi kèm (Baggage Allowance)</h4>
            <div className="flex gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-1.5"><Luggage className="h-4 w-4 text-gray-500" /> Cabin: <strong>{t.baggage.cabin} kg</strong></span>
              <span className="flex items-center gap-1.5"><Luggage className="h-4 w-4 text-gray-500" /> Checked: <strong>{t.baggage.checked} kg</strong></span>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Giá vé cơ bản:</span>
              <span>{formatVND(tFare)} VND</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Hành lý ký gửi:</span>
              <span>{formatVND(tCheckedCabin)} VND</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Hành lý xách tay:</span>
              <span>{formatVND(tPriceCabin)} VND</span>
            </div>
            <div className="flex justify-between font-bold border-t border-dashed pt-2">
              <span>Tổng cộng chi tiết:</span>
              <span className="text-primary">{formatVND(tTotalPrice)} VND</span>
            </div>
          </div>

          {/* Action Cards */}
          {t.status === 'confirmed' && !tIsExpired && !isCancelledRequested && (
            <div className="grid gap-3 sm:grid-cols-3 border-t pt-4">
              <Card className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <h5 className="font-bold text-sm flex items-center gap-1.5"><ArrowUpCircle className="h-4 w-4 text-[#0b5c66]" /> Nâng hạng ghế</h5>
                  <p className="text-xs text-muted-foreground mt-1">Trải nghiệm dịch vụ cao cấp hơn</p>
                </div>
                <div className="mt-4">
                  {getAvailableUpgrades(t.ticketClass).length > 0 ? (
                    <Button onClick={() => openUpgradeDialog(t)} className="w-full text-xs h-9">
                      Chọn nâng hạng
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center">Hạng ghế cao nhất</p>
                  )}
                </div>
              </Card>

              <Card className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <h5 className="font-bold text-sm flex items-center gap-1.5"><Luggage className="h-4 w-4 text-[#0b5c66]" /> Thêm hành lý</h5>
                  <p className="text-xs text-muted-foreground mt-1">Đặt thêm hành lý ký gửi nhanh chóng</p>
                </div>
                <div className="mt-4">
                  <Button onClick={() => openBaggageDialog(t)} className="w-full text-xs h-9">
                    Mua hành lý
                  </Button>
                </div>
              </Card>

              <Card className="p-4 flex flex-col justify-between border-red-100 hover:shadow-md transition-shadow">
                <div>
                  <h5 className="font-bold text-sm flex items-center gap-1.5 text-destructive"><XCircle className="h-4 w-4" /> Yêu cầu hủy vé</h5>
                  <p className="text-xs text-muted-foreground mt-1">Hủy chỗ và hoàn tiền theo quy định</p>
                </div>
                <div className="mt-4">
                  <Button variant="destructive" onClick={() => openCancelDialog(t)} className="w-full text-xs h-9">
                    Yêu cầu hủy
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const isPendingPayable = 
    (mainTicket.status === 'pending' && !isExpired) || 
    (returnTicket && returnTicket.status === 'pending' && !isReturnExpired);

  const totalBookingPrice = returnTicket ? mainTicket.price + returnTicket.price : mainTicket.price;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="gap-2 text-[#0b5c66] hover:text-[#094a52]">
        <Link href={`/search-booking?code=${mainTicket.bookingRef}`}>
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách vé
        </Link>
      </Button>

      {/* Ticket detail block(s) */}
      <div className="grid gap-6">
        {renderTicketBlock(mainTicket, false)}
        
        {returnTicket && renderTicketBlock(returnTicket, true)}
      </div>

      {/* Unpaid Booking Payment Card */}
      {isPendingPayable && (
        <Card className="border-2 border-red-200 shadow-lg overflow-hidden mt-6">
          <CardHeader className="bg-red-50/50 border-b border-red-100">
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-red-500" /> Thanh toán booking #{mainTicket.bookingRef}
            </CardTitle>
            <CardDescription>Chọn phương thức thanh toán để kích hoạt vé của bạn</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {!qrCodeUrl ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => alert("We are sorry, this payment method is currently not supported.")}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 font-semibold ${paymentMethod === 'card' ? 'border-[#0b5c66] bg-[#f0f8fb] text-[#0b5c66]' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <CreditCard className="w-8 h-8" />
                    Thanh toán bằng Thẻ
                  </button>
                  <button
                    onClick={() => { setPaymentMethod('qr'); handlePendingQRPayment(); }}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 font-semibold ${paymentMethod === 'qr' ? 'border-[#0b5c66] bg-[#f0f8fb] text-[#0b5c66]' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <QrCode className="w-8 h-8" />
                    Quét Mã QR
                  </button>
                </div>
                
                {paymentMethod === 'card' && (
                  <Button onClick={handlePendingCardPayment} disabled={isPaying} className="w-full bg-[#0b5c66] hover:bg-[#094a52] h-12 text-base font-bold">
                    {isPaying ? "Đang xử lý..." : `Xác nhận thanh toán Thẻ (${formatVND(totalBookingPrice)} VND)`}
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-4">
                <p className="text-sm font-semibold text-gray-700">Dùng điện thoại quét mã QR bên dưới để thanh toán đơn hàng</p>
                <div className="p-4 bg-white rounded-2xl border shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                    alt="QR Code thanh toán"
                    className="w-48 h-48"
                  />
                </div>
                <div className="flex gap-3 w-full max-w-xs">
                  <Button variant="outline" onClick={() => { setQrCodeUrl(null); setPaymentMethod(null); }} className="flex-1">
                    Quay lại
                  </Button>
                  <Button asChild className="flex-1 bg-[#0b5c66] hover:bg-[#094a52]">
                    <a href={qrCodeUrl} target="_blank" rel="noreferrer">Cổng giả lập</a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={open => { if (!open) closeUpgradeDialog() }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade Your Class</DialogTitle>
            <DialogDescription>
              Current class:{' '}
              <span className="font-semibold text-foreground">{CLASS_LABELS[ticket.ticketClass]}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <span className={upgradeStep === 'select' ? 'font-bold text-primary' : ''}>1. Select</span>
            <ChevronRight className="h-3 w-3" />
            <span className={upgradeStep === 'seat' ? 'font-bold text-primary' : ''}>2. Seat</span>
            <ChevronRight className="h-3 w-3" />
            <span className={upgradeStep === 'payment' ? 'font-bold text-primary' : ''}>3. Payment</span>
            <ChevronRight className="h-3 w-3" />
            <span className={upgradeStep === 'success' ? 'font-bold text-primary' : ''}>4. Done</span>
          </div>

          {upgradeStep === 'select' && (
            <div className="py-2 space-y-4">
              <RadioGroup
                value={selectedUpgrade}
                onValueChange={v => setSelectedUpgrade(v as TicketClass)}
              >
                {availableUpgrades.map(cls => {
                  const delta =
                    getBasePrice(ticket.flightId, cls) -
                    getBasePrice(ticket.flightId, ticket.ticketClass)
                  return (
                    <div
                      key={cls}
                      className="flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                      onClick={() => setSelectedUpgrade(cls)}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={cls} id={`upg-${cls}`} />
                        <Label htmlFor={`upg-${cls}`} className="cursor-pointer font-medium">
                          {CLASS_LABELS[cls]}
                        </Label>
                      </div>
                      <span className="font-bold text-primary">+{formatVND(delta)} VND</span>
                    </div>
                  )
                })}
              </RadioGroup>

              {selectedUpgrade && (
                <div className="rounded-lg bg-secondary/50 p-4 flex justify-between items-center">
                  <span className="font-semibold">Upgrade Cost (base)</span>
                  <span className="text-xl font-bold text-primary">{formatVND(upgradeClassDiff)} VND</span>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={closeUpgradeDialog}>Cancel</Button>
                <Button onClick={() => { setUpgradeSeat(''); setUpgradeSeatChosen(false); setUpgradeStep('seat') }} disabled={!selectedUpgrade}>
                  Next: Choose Seat <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </DialogFooter>
            </div>
          )}

          {upgradeStep === 'seat' && selectedUpgrade && (() => {
            const cls = selectedUpgrade as TicketClass
            const { rows, left, right, label } = CABIN_CONFIG[cls]
            return (
              <div className="py-2 space-y-3">
                <p className="text-sm text-muted-foreground">Upgrading to <span className="font-semibold text-foreground">{CLASS_LABELS[cls]}</span> — optionally pick a seat or skip.</p>
                <div className="text-xs text-center font-medium text-gray-400 uppercase tracking-wider">{label}</div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
                  {(['window','aisle','middle'] as SeatType[]).map(t => (
                    <span key={t} className="flex items-center gap-1 text-[11px]">
                      <span className={`w-3 h-3 rounded-sm ${SEAT_TYPE_INFO[t].dot}`} />
                      <span className="font-medium text-gray-700">{SEAT_TYPE_INFO[t].label}</span>
                      <span className="text-gray-400">{SEAT_SURCHARGE[t] > 0 ? `+${formatVND(SEAT_SURCHARGE[t])} VND` : 'Free'}</span>
                    </span>
                  ))}
                  <span className="flex items-center gap-1 text-[11px]"><span className="w-3 h-3 rounded-sm bg-gray-200 border border-gray-300" /><span className="text-gray-400">Taken</span></span>
                </div>
                
                <div className="overflow-y-auto max-h-52 space-y-1 rounded-lg border bg-slate-50 p-3">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="w-6 shrink-0" />
                    {left.map(({col}) => <span key={col} className="w-9 text-center text-[10px] font-bold text-gray-400">{col}</span>)}
                    <span className="w-4 shrink-0" />
                    {right.map(({col}) => <span key={col} className="w-9 text-center text-[10px] font-bold text-gray-400">{col}</span>)}
                    <span className="w-6 shrink-0" />
                  </div>
                  {rows.map(row => (
                    <div key={row} className="flex items-center justify-center gap-1">
                      <span className="w-6 text-[10px] text-gray-400 text-right font-mono shrink-0">{row}</span>
                      {left.map(({col, type}) => {
                        const id = `${row}${col}`
                        const occupied = isSeatOccupied(ticket.flightId, id)
                        const selected = upgradeSeat === id
                        let cls2 = 'w-9 h-9 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center '
                        if (occupied) cls2 += 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                        else if (selected) cls2 += 'bg-[#1a3557] border-[#1a3557] text-white scale-110 shadow-lg'
                        else cls2 += SEAT_TYPE_INFO[type].available + ' cursor-pointer hover:scale-105'
                        return <button key={col} type="button" disabled={occupied}
                          className={cls2}
                          title={occupied ? 'Taken' : `${SEAT_TYPE_INFO[type].label} · ${SEAT_SURCHARGE[type] > 0 ? '+' + formatVND(SEAT_SURCHARGE[type]) + ' VND' : 'Free'}`}
                          onClick={() => { if (!occupied) { if (upgradeSeat === id) { setUpgradeSeat(''); setUpgradeSeatChosen(false) } else { setUpgradeSeat(id); setUpgradeType(type); setUpgradeSeatChosen(true) } } }}
                        >{occupied ? '✕' : selected ? '✓' : col}</button>
                      })}
                      <div className="w-4 shrink-0" />
                      {right.map(({col, type}) => {
                        const id = `${row}${col}`
                        const occupied = isSeatOccupied(ticket.flightId, id)
                        const selected = upgradeSeat === id
                        let cls2 = 'w-9 h-9 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center '
                        if (occupied) cls2 += 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                        else if (selected) cls2 += 'bg-[#1a3557] border-[#1a3557] text-white scale-110 shadow-lg'
                        else cls2 += SEAT_TYPE_INFO[type].available + ' cursor-pointer hover:scale-105'
                        return <button key={col} type="button" disabled={occupied}
                          className={cls2}
                          title={occupied ? 'Taken' : `${SEAT_TYPE_INFO[type].label} · ${SEAT_SURCHARGE[type] > 0 ? '+' + formatVND(SEAT_SURCHARGE[type]) + ' VND' : 'Free'}`}
                          onClick={() => { if (!occupied) { if (upgradeSeat === id) { setUpgradeSeat(''); setUpgradeSeatChosen(false) } else { setUpgradeSeat(id); setUpgradeType(type); setUpgradeSeatChosen(true) } } }}
                        >{occupied ? '✕' : selected ? '✓' : col}</button>
                      })}
                      <span className="w-6 text-[10px] text-gray-400 text-left font-mono shrink-0">{row}</span>
                    </div>
                  ))}
                </div>

                {upgradeSeatChosen && upgradeSeat ? (
                  <div className="rounded-lg bg-secondary/50 p-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Seat {upgradeSeat} <span className="text-muted-foreground">({SEAT_TYPE_INFO[upgradeType].label})</span></span>
                      <span>{upgradeSeatFee > 0 ? `+${formatVND(upgradeSeatFee)} VND` : 'Free'}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm border-t pt-1">
                      <span>Total upgrade</span>
                      <span className="text-primary">{formatVND(upgradePrice)} VND</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-center text-muted-foreground">No seat selected — current seat kept or auto-assigned</p>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => setUpgradeStep('select')}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
                  <Button onClick={() => setUpgradeStep('payment')}>
                    Next: Payment <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </DialogFooter>
              </div>
            )
          })()}

          {upgradeStep === 'payment' && (
            <div className="py-2">
              <p className="text-sm text-muted-foreground mb-4">
                Upgrading to{' '}
                <span className="font-semibold text-foreground">
                  {selectedUpgrade ? CLASS_LABELS[selectedUpgrade as TicketClass] : ''}
                </span>
                {upgradeSeatChosen && upgradeSeat && <span className="text-muted-foreground"> · Seat {upgradeSeat} ({SEAT_TYPE_INFO[upgradeType].label})</span>}
              </p>
              <PaymentStep
                amountVND={upgradePrice}
                paymentMethod={upgradePaymentMethod}
                setPaymentMethod={setUpgradePaymentMethod}
                isProcessing={isProcessing}
                onConfirm={handleUpgradePayment}
                onBack={() => setUpgradeStep('seat')}
              />
            </div>
          )}

          {upgradeStep === 'success' && (
            <div className="py-6 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="w-9 h-9 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-bold">Upgrade Successful!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your ticket has been upgraded to{' '}
                  <span className="font-semibold text-foreground">{CLASS_LABELS[ticket.ticketClass]}</span>.
                </p>
              </div>
              <Button onClick={closeUpgradeDialog} className="w-full">Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Baggage Dialog */}
      <Dialog open={showBaggageDialog} onOpenChange={open => { if (!open) closeBaggageDialog() }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Baggage</DialogTitle>
            <DialogDescription>
              {formatVND(BAGGAGE_VND_PER_KG)} VND per kg — add extra weight to your allowance
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <span className={baggageStep === 'select' ? 'font-bold text-primary' : ''}>1. Select</span>
            <ChevronRight className="h-3 w-3" />
            <span className={baggageStep === 'payment' ? 'font-bold text-primary' : ''}>2. Payment</span>
            <ChevronRight className="h-3 w-3" />
            <span className={baggageStep === 'success' ? 'font-bold text-primary' : ''}>3. Done</span>
          </div>

          {baggageStep === 'select' && (
            <div className="space-y-5 py-2">
              <div className="rounded-lg bg-secondary/30 p-3 text-sm">
                <p className="font-medium mb-1">Current allowance</p>
                <div className="flex gap-4 text-muted-foreground">
                  <span>Cabin: <strong className="text-foreground">{ticket.baggage.cabin} kg</strong></span>
                  <span>Checked: <strong className="text-foreground">{ticket.baggage.checked} kg</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Extra Checked Weight</Label>
                  <p className="text-xs text-muted-foreground">{formatVND(BAGGAGE_VND_PER_KG)} VND / kg</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon"
                    onClick={() => setExtraCheckedKg(Math.max(0, extraCheckedKg - KG_PER_BAG))}
                    disabled={extraCheckedKg === 0}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-16 text-center font-medium">{extraCheckedKg} kg</span>
                  <Button variant="outline" size="icon"
                    onClick={() => setExtraCheckedKg(extraCheckedKg + KG_PER_BAG)}
                    disabled={extraCheckedKg >= 50}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-lg bg-secondary/50 p-4 space-y-1">
                {extraCheckedKg > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Checked +{extraCheckedKg} kg</span>
                    <span>{formatVND(extraCheckedKg * BAGGAGE_VND_PER_KG)} VND</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t pt-2 mt-1">
                  <span>Total</span>
                  <span className="text-primary">{formatVND(bagCostVND)} VND</span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeBaggageDialog}>Cancel</Button>
                <Button onClick={() => setBaggageStep('payment')} disabled={bagCostVND === 0}>
                  Next: Payment <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </DialogFooter>
            </div>
          )}

          {baggageStep === 'payment' && (
            <div className="py-2">
              <p className="text-sm text-muted-foreground mb-4">
                Adding{' '}
                <span className="font-semibold">{extraCheckedKg} kg checked</span>
              </p>
              <PaymentStep
                amountVND={bagCostVND}
                paymentMethod={baggagePaymentMethod}
                setPaymentMethod={setBaggagePaymentMethod}
                isProcessing={isProcessing}
                onConfirm={handleBaggagePayment}
                onBack={() => setBaggageStep('select')}
              />
            </div>
          )}

          {baggageStep === 'success' && (
            <div className="py-6 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="w-9 h-9 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-bold">Baggage Updated!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  New checked allowance:{' '}
                  <span className="font-semibold text-foreground">Checked {ticket.baggage.checked} kg</span>
                </p>
              </div>
              <Button onClick={closeBaggageDialog} className="w-full">Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Request Cancellation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your cancellation request will be reviewed by a manager. Refund amount depends on your
              fare type and how close to departure you cancel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Reason for cancellation</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for cancellation..."
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              className="mt-2"
            />
            <div className="mt-4 rounded-lg bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">
                Estimated refund: {formatVND(Math.round(ticket.price * 0.9))} VND (90% of ticket price)
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Final amount subject to manager approval</p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep My Ticket</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelRequest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isProcessing}
            >
              {isProcessing ? 'Submitting…' : 'Submit Request'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function GuestTicketDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Plane className="h-10 w-10 text-[#0b5c66] animate-pulse" />
      </div>
    }>
      <TicketDetailContent />
    </Suspense>
  )
}
