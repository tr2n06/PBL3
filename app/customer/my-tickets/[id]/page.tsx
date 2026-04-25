'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
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
import { mockTickets } from '@/lib/mock-data'
import type { TicketClass } from '@/lib/types'

// ─── Matches booking page exactly ────────────────────────────────────────────
const CLASS_LABELS: Record<TicketClass, string> = {
  economy: 'Economy',
  business: 'Premium Economy',
  firstClass: 'Business',
}

// Same price ranges used in booking page (VND)
const PRICE_RANGES: Record<TicketClass, readonly [number, number]> = {
  economy:   [3_000_000, 3_500_000],
  business:  [4_500_000, 5_200_000],
  firstClass:[8_000_000, 10_000_000],
}

/** Same deterministic base-price function as the booking page */
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

// Only classes strictly above current (no downgrade)
const CLASS_ORDER: TicketClass[] = ['economy', 'business', 'firstClass']
function getAvailableUpgrades(current: TicketClass): TicketClass[] {
  return CLASS_ORDER.slice(CLASS_ORDER.indexOf(current) + 1)
}

// Baggage: 30,000 VND per kg (matches booking page)
const BAGGAGE_VND_PER_KG = 30_000
// Each +/- button adds/removes exactly 1 kg
const KG_PER_BAG = 1

// ─── Seat selection for upgrade ─────────────────────────────────────────────
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

// ─── Payment step ─────────────────────────────────────────────────────────────
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
          onClick={() => setPaymentMethod('card')}
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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string

  const ticketIndex = mockTickets.findIndex(t => t.id === ticketId)
  const rawTicket = mockTickets[ticketIndex]

  const [ticket, setTicket] = useState(() =>
    rawTicket ? { ...rawTicket, baggage: { ...rawTicket.baggage } } : null
  )

  // ── Extra baggage paid (VND) – persisted across dialog closes ─────────────
  const [extraBaggagePaidVND, setExtraBaggagePaidVND] = useState(0)

  // ── Upgrade dialog ────────────────────────────────────────────────────────
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [upgradeStep, setUpgradeStep] = useState<'select' | 'seat' | 'payment' | 'success'>('select')
  const [selectedUpgrade, setSelectedUpgrade] = useState<TicketClass | ''>('')
  const [upgradePaymentMethod, setUpgradePaymentMethod] = useState<PaymentMethod>(null)
  const [upgradeSeat, setUpgradeSeat] = useState<string>('')
  const [upgradeType, setUpgradeType] = useState<SeatType>('window')
  const [upgradeSeatChosen, setUpgradeSeatChosen] = useState(false)

  // ── Baggage dialog ────────────────────────────────────────────────────────
  const [showBaggageDialog, setShowBaggageDialog] = useState(false)
  const [baggageStep, setBaggageStep] = useState<'select' | 'payment' | 'success'>('select')
  // extra kg – only checked baggage allowed (no cabin upsell)
  const [extraCheckedKg, setExtraCheckedKg] = useState(0)
  const [baggagePaymentMethod, setBaggagePaymentMethod] = useState<PaymentMethod>(null)

  // ── Cancel dialog ─────────────────────────────────────────────────────────
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Plane className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">Ticket not found</h2>
        <p className="mb-4 text-muted-foreground">The ticket you are looking for does not exist.</p>
        <Button asChild>
          <Link href="/customer/my-tickets">Back to My Tickets</Link>
        </Button>
      </div>
    )
  }

  const availableUpgrades = getAvailableUpgrades(ticket.ticketClass)

  // Upgrade cost = difference in base prices + optional seat surcharge
  const upgradeClassDiff = selectedUpgrade
    ? getBasePrice(ticket.flightId, selectedUpgrade as TicketClass) -
      getBasePrice(ticket.flightId, ticket.ticketClass)
    : 0
  const upgradeSeatFee = upgradeSeatChosen ? SEAT_SURCHARGE[upgradeType] : 0
  const upgradePrice = upgradeClassDiff + upgradeSeatFee

  // Baggage cost: 30,000 VND per kg (checked only)
  const bagCostVND = extraCheckedKg * BAGGAGE_VND_PER_KG

  // Total Paid = current class base price + cumulative extra baggage paid
  const currentBasePrice = ticket ? getBasePrice(ticket.flightId, ticket.ticketClass) : 0
  const totalPaidVND = currentBasePrice + extraBaggagePaidVND

  // ── Upgrade handlers ──────────────────────────────────────────────────────
  const openUpgradeDialog = () => {
    setSelectedUpgrade('')
    setUpgradeStep('select')
    setUpgradePaymentMethod(null)
    setUpgradeSeat('')
    setUpgradeType('window')
    setUpgradeSeatChosen(false)
    setShowUpgradeDialog(true)
  }

  const handleUpgradePayment = async () => {
    if (!upgradePaymentMethod || !selectedUpgrade || !ticket) return
    setIsProcessing(true)
    await new Promise(r => setTimeout(r, 1200))
    const newClass = selectedUpgrade as TicketClass
    const newPrice = getBasePrice(ticket.flightId, newClass)
    const finalSeat = upgradeSeatChosen && upgradeSeat ? upgradeSeat : ticket.seatNumber
    const updated = { ...ticket, ticketClass: newClass, price: newPrice, seatNumber: finalSeat }
    setTicket(updated)
    if (ticketIndex !== -1) mockTickets[ticketIndex] = updated
    setIsProcessing(false)
    setUpgradeStep('success')
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

  // ── Baggage handlers ──────────────────────────────────────────────────────
  const openBaggageDialog = () => {
    setExtraCheckedKg(0)
    setBaggageStep('select')
    setBaggagePaymentMethod(null)
    setShowBaggageDialog(true)
  }

  const handleBaggagePayment = async () => {
    if (!baggagePaymentMethod || !ticket) return
    setIsProcessing(true)
    await new Promise(r => setTimeout(r, 1200))
    const updated = {
      ...ticket,
      baggage: {
        cabin: ticket.baggage.cabin,
        checked: ticket.baggage.checked + extraCheckedKg,
      },
    }
    setTicket(updated)
    if (ticketIndex !== -1) mockTickets[ticketIndex] = updated
    // Accumulate the baggage cost paid
    setExtraBaggagePaidVND(prev => prev + bagCostVND)
    setIsProcessing(false)
    setBaggageStep('success')
  }

  const closeBaggageDialog = () => {
    setShowBaggageDialog(false)
    setBaggageStep('select')
    setBaggagePaymentMethod(null)
    setExtraCheckedKg(0)
  }

  // ── Cancel handler ────────────────────────────────────────────────────────
  const handleCancelRequest = async () => {
    setIsProcessing(true)
    await new Promise(r => setTimeout(r, 1500))
    setIsProcessing(false)
    setShowCancelDialog(false)
    alert('Cancellation request submitted. A manager will review your request.')
    router.push('/customer/my-tickets')
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/customer/my-tickets">
          <ArrowLeft className="h-4 w-4" />
          Back to My Tickets
        </Link>
      </Button>

      {/* Ticket Header */}
      <Card>
        <CardHeader className="border-b bg-secondary/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                <Plane className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">{ticket.flight.flightNumber}</CardTitle>
                <CardDescription>{ticket.flight.airline}</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{CLASS_LABELS[ticket.ticketClass]}</Badge>
              <Badge className="bg-accent text-accent-foreground">
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Flight Route */}
          <div className="mb-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold">{ticket.flight.departure.code}</div>
              <div className="text-xl">{ticket.flight.departure.time}</div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {ticket.flight.departure.city}
              </div>
              <div className="text-sm text-muted-foreground">{ticket.flight.departure.airport}</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <Clock className="mb-2 h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-medium">{ticket.flight.duration}</span>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-px w-12 bg-border" />
                <ArrowRight className="h-5 w-5 text-primary" />
                <div className="h-px w-12 bg-border" />
              </div>
              <span className="mt-1 text-sm text-muted-foreground">Direct Flight</span>
            </div>
            <div>
              <div className="text-3xl font-bold">{ticket.flight.arrival.code}</div>
              <div className="text-xl">{ticket.flight.arrival.time}</div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {ticket.flight.arrival.city}
              </div>
              <div className="text-sm text-muted-foreground">{ticket.flight.arrival.airport}</div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="grid gap-4 rounded-lg bg-secondary/30 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-sm text-muted-foreground">Booking Reference</div>
              <div className="font-mono text-lg font-bold">{ticket.bookingRef}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Passenger</div>
              <div className="text-lg font-medium">{ticket.passengerName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Seat Number</div>
              <div className="text-lg font-medium">{ticket.seatNumber}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Travel Date</div>
              <div className="flex items-center gap-1 text-lg font-medium">
                <Calendar className="h-4 w-4" />
                {ticket.flight.departure.date}
              </div>
            </div>
          </div>

          {/* Baggage */}
          <div className="mt-6">
            <h3 className="mb-3 font-semibold">Baggage Allowance</h3>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Luggage className="h-5 w-5 text-muted-foreground" />
                <span>Cabin: {ticket.baggage.cabin} kg</span>
              </div>
              <div className="flex items-center gap-2">
                <Luggage className="h-5 w-5 text-muted-foreground" />
                <span>Checked: {ticket.baggage.checked} kg</span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="mt-6 border-t pt-6 space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Ticket fare ({CLASS_LABELS[ticket.ticketClass]})</span>
              <span>{formatVND(currentBasePrice)} VND</span>
            </div>
            {extraBaggagePaidVND > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Extra baggage</span>
                <span>+{formatVND(extraBaggagePaidVND)} VND</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t pt-2">
              <span className="font-semibold">Total Paid</span>
              <span className="text-2xl font-bold text-primary">{formatVND(totalPaidVND)} VND</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Cards */}
      {ticket.status === 'confirmed' && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowUpCircle className="h-5 w-5 text-primary" />
                Upgrade Class
              </CardTitle>
              <CardDescription>Upgrade to a better experience</CardDescription>
            </CardHeader>
            <CardContent>
              {availableUpgrades.length > 0 ? (
                <Button onClick={openUpgradeDialog} className="w-full">
                  View Upgrade Options
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">You are already in the highest class</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Luggage className="h-5 w-5 text-primary" />
                Add Baggage
              </CardTitle>
              <CardDescription>Purchase additional baggage</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={openBaggageDialog} className="w-full">
                Manage Baggage
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <XCircle className="h-5 w-5 text-destructive" />
                Cancel Ticket
              </CardTitle>
              <CardDescription>Request ticket cancellation</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => setShowCancelDialog(true)} className="w-full">
                Request Cancellation
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Upgrade Dialog ── */}
      <Dialog open={showUpgradeDialog} onOpenChange={open => { if (!open) closeUpgradeDialog() }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade Your Class</DialogTitle>
            <DialogDescription>
              Current class:{' '}
              <span className="font-semibold text-foreground">{CLASS_LABELS[ticket.ticketClass]}</span>
            </DialogDescription>
          </DialogHeader>

          {/* Steps */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <span className={upgradeStep === 'select' ? 'font-bold text-primary' : ''}>1. Select</span>
            <ChevronRight className="h-3 w-3" />
            <span className={upgradeStep === 'seat' ? 'font-bold text-primary' : ''}>2. Seat</span>
            <ChevronRight className="h-3 w-3" />
            <span className={upgradeStep === 'payment' ? 'font-bold text-primary' : ''}>3. Payment</span>
            <ChevronRight className="h-3 w-3" />
            <span className={upgradeStep === 'success' ? 'font-bold text-primary' : ''}>4. Done</span>
          </div>

          {/* Select step */}
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

          {/* Seat step */}
          {upgradeStep === 'seat' && selectedUpgrade && (() => {
            const cls = selectedUpgrade as TicketClass
            const { rows, left, right, label } = CABIN_CONFIG[cls]
            const allCols = [...left, ...right]
            return (
              <div className="py-2 space-y-3">
                <p className="text-sm text-muted-foreground">Upgrading to <span className="font-semibold text-foreground">{CLASS_LABELS[cls]}</span> — optionally pick a seat or skip.</p>
                <div className="text-xs text-center font-medium text-gray-400 uppercase tracking-wider">{label}</div>
                {/* Legend */}
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
                {/* Seat grid */}
                <div className="overflow-y-auto max-h-52 space-y-1 rounded-lg border bg-slate-50 p-3">
                  {/* Column header */}
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
                {/* Selection info */}
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

          {/* Payment step */}
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

          {/* Success step */}
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

      {/* ── Baggage Dialog ── */}
      <Dialog open={showBaggageDialog} onOpenChange={open => { if (!open) closeBaggageDialog() }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Baggage</DialogTitle>
            <DialogDescription>
              {formatVND(BAGGAGE_VND_PER_KG)} VND per kg — add extra weight to your allowance
            </DialogDescription>
          </DialogHeader>

          {/* Steps */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <span className={baggageStep === 'select' ? 'font-bold text-primary' : ''}>1. Select</span>
            <ChevronRight className="h-3 w-3" />
            <span className={baggageStep === 'payment' ? 'font-bold text-primary' : ''}>2. Payment</span>
            <ChevronRight className="h-3 w-3" />
            <span className={baggageStep === 'success' ? 'font-bold text-primary' : ''}>3. Done</span>
          </div>

          {/* Select step */}
          {baggageStep === 'select' && (
            <div className="space-y-5 py-2">
              {/* Current allowance */}
              <div className="rounded-lg bg-secondary/30 p-3 text-sm">
                <p className="font-medium mb-1">Current allowance</p>
                <div className="flex gap-4 text-muted-foreground">
                  <span>Cabin: <strong className="text-foreground">{ticket.baggage.cabin} kg</strong></span>
                  <span>Checked: <strong className="text-foreground">{ticket.baggage.checked} kg</strong></span>
                </div>
              </div>

              {/* Checked extra kg only – cabin upsell not allowed */}
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

              {/* Cost summary */}
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

          {/* Payment step */}
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

          {/* Success step */}
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

      {/* ── Cancel Dialog ── */}
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
