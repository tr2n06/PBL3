'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plane,
  Search,
  ArrowUpCircle,
  Luggage,
  Filter,
  Eye,
  Plus,
  Minus,
  ChevronRight,
  ArrowLeft,
  Check,
  CreditCard,
  QrCode,
  Banknote,
} from 'lucide-react'
import { mockTickets } from '@/lib/mock-data'
import type { Ticket, TicketClass, TicketStatus } from '@/lib/types'

// ─── Matches booking page exactly ────────────────────────────────────────────
const CLASS_LABELS: Record<TicketClass, string> = {
  economy: 'Economy',
  business: 'Premium Economy',
  firstClass: 'Business',
}

const PRICE_RANGES: Record<TicketClass, readonly [number, number]> = {
  economy:    [3_000_000, 3_500_000],
  business:   [4_500_000, 5_200_000],
  firstClass: [8_000_000, 10_000_000],
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

const BAGGAGE_VND_PER_KG = 30_000
const KG_STEP = 1  // each +/- button adds 1 kg

// ─── Seat selection for upgrade ──────────────────────────────────────────────
type SeatType = 'window' | 'aisle' | 'middle'
const SEAT_SURCHARGE: Record<SeatType, number> = { window: 350_000, aisle: 150_000, middle: 0 }
const SEAT_TYPE_INFO: Record<SeatType, { label: string; available: string; dot: string }> = {
  window: { label: 'Window', available: 'border-[#3a6090] bg-[#eef3f9] text-[#1a3557] hover:bg-[#dce8f4]', dot: 'bg-[#3a6090]' },
  aisle:  { label: 'Aisle',  available: 'border-emerald-400 bg-emerald-50 text-emerald-800 hover:bg-emerald-100', dot: 'bg-emerald-400' },
  middle: { label: 'Middle', available: 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100', dot: 'bg-amber-300' },
}
interface SeatColDef { col: string; type: SeatType }
const CABIN_CONFIG: Record<TicketClass, { rows: number[]; left: SeatColDef[]; right: SeatColDef[]; label: string }> = {
  economy:    { rows: [20,21,22,23,24,25,26,27], left: [{col:'A',type:'window'},{col:'B',type:'middle'},{col:'C',type:'aisle'}], right: [{col:'D',type:'aisle'},{col:'E',type:'middle'},{col:'F',type:'window'}], label: 'Economy Cabin' },
  business:   { rows: [5,6,7,8,9,10], left: [{col:'A',type:'window'},{col:'B',type:'aisle'}], right: [{col:'C',type:'aisle'},{col:'D',type:'window'}], label: 'Premium Economy Cabin' },
  firstClass: { rows: [1,2,3,4], left: [{col:'A',type:'window'}], right: [{col:'B',type:'window'}], label: 'Business Suite' },
}
function isSeatOccupied(flightId: string, seatId: string) { return hashStr(flightId + seatId) % 4 === 0 }

type PaymentMethod = 'card' | 'cash' | 'qr' | null

// ─── Payment method picker (card/cash/qr for employee) ───────────────────────
function PaymentSelector({
  paymentMethod,
  setPaymentMethod,
}: {
  paymentMethod: PaymentMethod
  setPaymentMethod: (m: PaymentMethod) => void
}) {
  const METHODS: { key: NonNullable<PaymentMethod>; label: string; img: string }[] = [
    { key: 'card', label: 'Card',
      img: 'https://i.pinimg.com/736x/9c/71/d6/9c71d69a83143c2ec5f518698b174533.jpg' },
    { key: 'cash', label: 'Cash',
      img: 'https://i.pinimg.com/736x/a4/c5/7d/a4c57d46403896867bca5ef39324f41a.jpg' },
    { key: 'qr',   label: 'QR',
      img: 'https://i.pinimg.com/736x/f6/fb/c4/f6fbc4deadbcc5287d59fff163191cee.jpg' },
  ]
  return (
    <div className="grid grid-cols-3 gap-3">
      {METHODS.map(({ key, label, img }) => (
        <button
          key={key}
          type="button"
          onClick={() => setPaymentMethod(key)}
          className={`relative group flex flex-col items-center p-2 rounded-2xl border-2 transition-all bg-white shadow-sm hover:shadow-lg ${
            paymentMethod === key
              ? 'border-primary ring-4 ring-primary/10'
              : 'border-gray-100 grayscale hover:grayscale-0'
          }`}
        >
          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-1 relative">
            <img src={img} alt={label}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            {paymentMethod === key && (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <div className="bg-white rounded-full p-1 shadow-lg">
                  <Check className="w-3 h-3 text-primary stroke-[3px]" />
                </div>
              </div>
            )}
          </div>
          <span className="text-xs font-bold text-gray-800">{label}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function EmployeeTicketsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [tickets, setTickets] = useState<Ticket[]>([...mockTickets])

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  // ── Upgrade state ─────────────────────────────────────────────────────────
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [upgradeStep, setUpgradeStep] = useState<'select' | 'seat' | 'payment' | 'success'>('select')
  const [selectedUpgrade, setSelectedUpgrade] = useState<TicketClass | ''>('')
  const [upgradePaymentMethod, setUpgradePaymentMethod] = useState<PaymentMethod>(null)
  const [upgradeSeat, setUpgradeSeat] = useState<string>('')
  const [upgradeType, setUpgradeType] = useState<SeatType>('window')
  const [upgradeSeatChosen, setUpgradeSeatChosen] = useState(false)

  // ── Baggage state ─────────────────────────────────────────────────────────
  const [showBaggageDialog, setShowBaggageDialog] = useState(false)
  const [baggageStep, setBaggageStep] = useState<'select' | 'payment' | 'success'>('select')
  // Only checked baggage upsell – cabin not allowed
  const [extraCheckedKg, setExtraCheckedKg] = useState(0)
  const [baggagePaymentMethod, setBaggagePaymentMethod] = useState<PaymentMethod>(null)

  const [isProcessing, setIsProcessing] = useState(false)

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.passengerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusColors: Record<TicketStatus, string> = {
    confirmed: 'bg-accent text-accent-foreground',
    pending: 'bg-yellow-500/20 text-yellow-700',
    cancelled: 'bg-destructive/20 text-destructive',
    completed: 'bg-muted text-muted-foreground',
  }

  // ── Upgrade helpers ───────────────────────────────────────────────────────
  const upgradeClassDiff = selectedTicket && selectedUpgrade
    ? getBasePrice(selectedTicket.flightId, selectedUpgrade as TicketClass) -
      getBasePrice(selectedTicket.flightId, selectedTicket.ticketClass)
    : 0
  const upgradeSeatFee = upgradeSeatChosen ? SEAT_SURCHARGE[upgradeType] : 0
  const upgradePrice = upgradeClassDiff + upgradeSeatFee

  const openUpgradeDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setSelectedUpgrade('')
    setUpgradeStep('select')
    setUpgradePaymentMethod(null)
    setUpgradeSeat('')
    setUpgradeType('window')
    setUpgradeSeatChosen(false)
    setShowUpgradeDialog(true)
  }

  const handleUpgradePayment = async () => {
    if (!upgradePaymentMethod || !selectedUpgrade || !selectedTicket) return
    setIsProcessing(true)
    await new Promise(r => setTimeout(r, 1200))
    const newClass = selectedUpgrade as TicketClass
    const newPrice = getBasePrice(selectedTicket.flightId, newClass)
    const finalSeat = upgradeSeatChosen && upgradeSeat ? upgradeSeat : selectedTicket.seatNumber
    const updated = tickets.map(t =>
      t.id === selectedTicket.id ? { ...t, ticketClass: newClass, price: newPrice, seatNumber: finalSeat } : t
    )
    setTickets(updated)
    const idx = mockTickets.findIndex(t => t.id === selectedTicket.id)
    if (idx !== -1) mockTickets[idx] = { ...mockTickets[idx], ticketClass: newClass, price: newPrice, seatNumber: finalSeat }
    setSelectedTicket(prev => prev ? { ...prev, ticketClass: newClass, price: newPrice, seatNumber: finalSeat } : prev)
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

  // ── Baggage helpers ───────────────────────────────────────────────────────
  const bagCostVND = extraCheckedKg * BAGGAGE_VND_PER_KG

  const openBaggageDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setExtraCheckedKg(0)
    setBaggageStep('select')
    setBaggagePaymentMethod(null)
    setShowBaggageDialog(true)
  }

  const handleBaggagePayment = async () => {
    if (!baggagePaymentMethod || !selectedTicket) return
    setIsProcessing(true)
    await new Promise(r => setTimeout(r, 1200))
    const newChecked = selectedTicket.baggage.checked + extraCheckedKg
    const updated = tickets.map(t =>
      t.id === selectedTicket.id
        ? { ...t, baggage: { cabin: t.baggage.cabin, checked: newChecked } }
        : t
    )
    setTickets(updated)
    const idx = mockTickets.findIndex(t => t.id === selectedTicket.id)
    if (idx !== -1) mockTickets[idx] = { ...mockTickets[idx], baggage: { cabin: selectedTicket.baggage.cabin, checked: newChecked } }
    setSelectedTicket(prev => prev ? { ...prev, baggage: { cabin: prev.baggage.cabin, checked: newChecked } } : prev)
    setIsProcessing(false)
    setBaggageStep('success')
  }

  const closeBaggageDialog = () => {
    setShowBaggageDialog(false)
    setBaggageStep('select')
    setBaggagePaymentMethod(null)
    setExtraCheckedKg(0)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Tickets</h1>
        <p className="text-muted-foreground">View and manage all customer tickets</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" /> Search &amp; Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by ref, name, or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v as TicketStatus | 'all')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tickets ({filteredTickets.length})</CardTitle>
          <CardDescription>Manage upgrades and baggage for confirmed tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking Ref</TableHead>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Flight</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Booked At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center">
                      <Plane className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No tickets found</p>
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.map(ticket => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono font-medium">{ticket.bookingRef}</TableCell>
                    <TableCell>
                      <div>{ticket.passengerName}</div>
                      <div className="text-xs text-muted-foreground">{ticket.passengerEmail}</div>
                    </TableCell>
                    <TableCell>{ticket.flight.flightNumber}</TableCell>
                    <TableCell>{ticket.flight.departure.code} - {ticket.flight.arrival.code}</TableCell>
                    <TableCell>{CLASS_LABELS[ticket.ticketClass]}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-gray-500">{ticket.bookedAt || '—'}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[ticket.status]}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedTicket(ticket); setShowDetailsDialog(true) }} title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {ticket.status === 'confirmed' && (
                          <>
                            {getAvailableUpgrades(ticket.ticketClass).length > 0 && (
                              <Button variant="ghost" size="icon" onClick={() => openUpgradeDialog(ticket)} title="Upgrade Class">
                                <ArrowUpCircle className="h-4 w-4 text-primary" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => openBaggageDialog(ticket)} title="Add Baggage">
                              <Luggage className="h-4 w-4 text-primary" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Details Dialog ── */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle>Ticket Details</DialogTitle>
                <DialogDescription>Booking Ref: {selectedTicket.bookingRef}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                {[
                  ['Passenger', selectedTicket.passengerName],
                  ['Email', selectedTicket.passengerEmail],
                  ['Flight', selectedTicket.flight.flightNumber],
                  ['Route', `${selectedTicket.flight.departure.city} → ${selectedTicket.flight.arrival.city}`],
                  ['Date', selectedTicket.flight.departure.date],
                  ['Time', selectedTicket.flight.departure.time],
                  ['Class', CLASS_LABELS[selectedTicket.ticketClass]],
                  ['Seat', selectedTicket.seatNumber],
                  ['Cabin', `${selectedTicket.baggage.cabin} kg`],
                  ['Checked', `${selectedTicket.baggage.checked} kg`],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div className="text-sm text-muted-foreground">{label}</div>
                    <div className="font-medium">{val}</div>
                  </div>
                ))}
                {/* Ticket price – full width */}
                <div className="col-span-2 border-t pt-3 mt-1 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Ticket Fare</div>
                    <div className="text-xs text-muted-foreground">{CLASS_LABELS[selectedTicket.ticketClass]} class</div>
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {formatVND(getBasePrice(selectedTicket.flightId, selectedTicket.ticketClass))} VND
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Upgrade Dialog ── */}
      <Dialog open={showUpgradeDialog} onOpenChange={open => { if (!open) closeUpgradeDialog() }}>
        <DialogContent className="max-w-md">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle>Upgrade Ticket Class</DialogTitle>
                <DialogDescription>
                  {selectedTicket.bookingRef} — {selectedTicket.passengerName}
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

              {/* Select */}
              {upgradeStep === 'select' && (
                <div className="py-2 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Current class:{' '}
                    <span className="font-semibold text-foreground">{CLASS_LABELS[selectedTicket.ticketClass]}</span>
                  </p>
                  <RadioGroup value={selectedUpgrade} onValueChange={v => setSelectedUpgrade(v as TicketClass)}>
                    {getAvailableUpgrades(selectedTicket.ticketClass).map(cls => {
                      const delta =
                        getBasePrice(selectedTicket.flightId, cls) -
                        getBasePrice(selectedTicket.flightId, selectedTicket.ticketClass)
                      return (
                        <div key={cls}
                          className="flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                          onClick={() => setSelectedUpgrade(cls)}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value={cls} id={`emp-upg-${cls}`} />
                            <Label htmlFor={`emp-upg-${cls}`} className="cursor-pointer font-medium">
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
              {upgradeStep === 'seat' && selectedTicket && selectedUpgrade && (() => {
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
                            const occupied = isSeatOccupied(selectedTicket.flightId, id)
                            const selected = upgradeSeat === id
                            let c2 = 'w-9 h-9 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center '
                            if (occupied) c2 += 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                            else if (selected) c2 += 'bg-[#1a3557] border-[#1a3557] text-white scale-110 shadow-lg'
                            else c2 += SEAT_TYPE_INFO[type].available + ' cursor-pointer hover:scale-105'
                            return <button key={col} type="button" disabled={occupied} className={c2}
                              onClick={() => { if (!occupied) { if (upgradeSeat === id) { setUpgradeSeat(''); setUpgradeSeatChosen(false) } else { setUpgradeSeat(id); setUpgradeType(type); setUpgradeSeatChosen(true) } } }}
                            >{occupied ? '✕' : selected ? '✓' : col}</button>
                          })}
                          <div className="w-4 shrink-0" />
                          {right.map(({col, type}) => {
                            const id = `${row}${col}`
                            const occupied = isSeatOccupied(selectedTicket.flightId, id)
                            const selected = upgradeSeat === id
                            let c2 = 'w-9 h-9 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center '
                            if (occupied) c2 += 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                            else if (selected) c2 += 'bg-[#1a3557] border-[#1a3557] text-white scale-110 shadow-lg'
                            else c2 += SEAT_TYPE_INFO[type].available + ' cursor-pointer hover:scale-105'
                            return <button key={col} type="button" disabled={occupied} className={c2}
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
                      <p className="text-xs text-center text-muted-foreground">No seat selected — current seat kept</p>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setUpgradeStep('select')} className="flex-1">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                      </Button>
                      <Button onClick={() => setUpgradeStep('payment')} className="flex-1">
                        Next: Payment <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )
              })()}

              {/* Payment */}
              {upgradeStep === 'payment' && (
                <div className="py-2 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upgrading to{' '}
                    <span className="font-semibold text-foreground">
                      {selectedUpgrade ? CLASS_LABELS[selectedUpgrade as TicketClass] : ''}
                    </span>
                    {upgradeSeatChosen && upgradeSeat && <span className="text-muted-foreground"> · Seat {upgradeSeat} ({SEAT_TYPE_INFO[upgradeType].label})</span>}
                  </p>
                  <div className="rounded-lg bg-secondary/50 p-4 flex justify-between items-center">
                    <span className="font-semibold">Amount</span>
                    <span className="text-xl font-bold text-primary">{formatVND(upgradePrice)} VND</span>
                  </div>
                  <PaymentSelector paymentMethod={upgradePaymentMethod} setPaymentMethod={setUpgradePaymentMethod} />
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setUpgradeStep('seat')} className="flex-1">
                      <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <Button onClick={handleUpgradePayment} disabled={!upgradePaymentMethod || isProcessing} className="flex-1">
                      {isProcessing ? 'Processing…' : 'Confirm Payment'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Success */}
              {upgradeStep === 'success' && (
                <div className="py-6 flex flex-col items-center gap-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">Upgrade Successful!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ticket upgraded to{' '}
                      <span className="font-semibold text-foreground">
                        {selectedTicket ? CLASS_LABELS[selectedTicket.ticketClass] : ''}
                      </span>.
                    </p>
                  </div>
                  <Button onClick={closeUpgradeDialog} className="w-full">Close</Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Baggage Dialog ── */}
      <Dialog open={showBaggageDialog} onOpenChange={open => { if (!open) closeBaggageDialog() }}>
        <DialogContent className="max-w-md">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle>Add Baggage</DialogTitle>
                <DialogDescription>
                  {selectedTicket.bookingRef} — {selectedTicket.passengerName} ·{' '}
                  {formatVND(BAGGAGE_VND_PER_KG)} VND/kg
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <span className={baggageStep === 'select' ? 'font-bold text-primary' : ''}>1. Select</span>
                <ChevronRight className="h-3 w-3" />
                <span className={baggageStep === 'payment' ? 'font-bold text-primary' : ''}>2. Payment</span>
                <ChevronRight className="h-3 w-3" />
                <span className={baggageStep === 'success' ? 'font-bold text-primary' : ''}>3. Done</span>
              </div>

              {/* Select */}
              {baggageStep === 'select' && (
                <div className="space-y-5 py-2">
                  <div className="rounded-lg bg-secondary/30 p-3 text-sm">
                    <p className="font-medium mb-1">Current allowance</p>
                    <div className="flex gap-4 text-muted-foreground">
                      <span>Cabin: <strong className="text-foreground">{selectedTicket.baggage.cabin} kg</strong></span>
                      <span>Checked: <strong className="text-foreground">{selectedTicket.baggage.checked} kg</strong></span>
                    </div>
                  </div>

                  {/* Extra checked kg only – cabin upsell not allowed */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Extra Checked Weight</Label>
                      <p className="text-xs text-muted-foreground">{formatVND(BAGGAGE_VND_PER_KG)} VND / kg</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="icon"
                        onClick={() => setExtraCheckedKg(Math.max(0, extraCheckedKg - KG_STEP))}
                        disabled={extraCheckedKg === 0}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-16 text-center font-medium">{extraCheckedKg} kg</span>
                      <Button variant="outline" size="icon"
                        onClick={() => setExtraCheckedKg(extraCheckedKg + KG_STEP)}
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

              {/* Payment */}
              {baggageStep === 'payment' && (
                <div className="py-2 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Adding{' '}
                    <span className="font-semibold">{extraCheckedKg} kg checked</span>
                  </p>
                  <div className="rounded-lg bg-secondary/50 p-4 flex justify-between items-center">
                    <span className="font-semibold">Amount</span>
                    <span className="text-xl font-bold text-primary">{formatVND(bagCostVND)} VND</span>
                  </div>
                  <PaymentSelector paymentMethod={baggagePaymentMethod} setPaymentMethod={setBaggagePaymentMethod} />
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setBaggageStep('select')} className="flex-1">
                      <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <Button onClick={handleBaggagePayment} disabled={!baggagePaymentMethod || isProcessing} className="flex-1">
                      {isProcessing ? 'Processing…' : 'Confirm Payment'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Success */}
              {baggageStep === 'success' && (
                <div className="py-6 flex flex-col items-center gap-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">Baggage Updated!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      New checked allowance:{' '}
                      <span className="font-semibold text-foreground">
                        Checked {selectedTicket.baggage.checked} kg
                      </span>
                    </p>
                  </div>
                  <Button onClick={closeBaggageDialog} className="w-full">Close</Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
