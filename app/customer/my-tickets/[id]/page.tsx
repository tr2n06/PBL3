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
} from 'lucide-react'
import { mockTickets } from '@/lib/mock-data'
import type { TicketClass } from '@/lib/types'

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string

  const ticket = mockTickets.find(t => t.id === ticketId)

  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [showBaggageDialog, setShowBaggageDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedUpgrade, setSelectedUpgrade] = useState<TicketClass | ''>('')
  const [cabinBags, setCabinBags] = useState(ticket?.baggage.cabin || 1)
  const [checkedBags, setCheckedBags] = useState(ticket?.baggage.checked || 1)
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

  const classLabels: Record<TicketClass, string> = {
    economy: 'Economy',
    business: 'Business',
    firstClass: 'First Class',
  }

  const upgradePrices: Record<TicketClass, number> = {
    economy: 0,
    business: 750,
    firstClass: 1500,
  }

  const baggagePrice = 35 // per extra bag

  const availableUpgrades = (): TicketClass[] => {
    const classes: TicketClass[] = ['economy', 'business', 'firstClass']
    const currentIndex = classes.indexOf(ticket.ticketClass)
    return classes.slice(currentIndex + 1)
  }

  const handleUpgrade = async () => {
    if (!selectedUpgrade) return
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsProcessing(false)
    setShowUpgradeDialog(false)
    alert(`Successfully upgraded to ${classLabels[selectedUpgrade]}!`)
  }

  const handleAddBaggage = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsProcessing(false)
    setShowBaggageDialog(false)
    alert('Baggage updated successfully!')
  }

  const handleCancelRequest = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsProcessing(false)
    setShowCancelDialog(false)
    alert('Cancellation request submitted. A manager will review your request.')
    router.push('/customer/my-tickets')
  }

  const calculateUpgradePrice = () => {
    if (!selectedUpgrade) return 0
    return upgradePrices[selectedUpgrade] - upgradePrices[ticket.ticketClass]
  }

  const calculateBaggagePrice = () => {
    const extraCabin = Math.max(0, cabinBags - ticket.baggage.cabin)
    const extraChecked = Math.max(0, checkedBags - ticket.baggage.checked)
    return (extraCabin + extraChecked) * baggagePrice
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
              <Badge variant="outline">{classLabels[ticket.ticketClass]}</Badge>
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
                <MapPin className="h-4 w-4" />
                {ticket.flight.departure.city}
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
                <MapPin className="h-4 w-4" />
                {ticket.flight.arrival.city}
              </div>
              <div className="text-sm text-muted-foreground">{ticket.flight.arrival.airport}</div>
            </div>
          </div>

          {/* Ticket Details Grid */}
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
                <span>Cabin: {ticket.baggage.cabin} bag(s)</span>
              </div>
              <div className="flex items-center gap-2">
                <Luggage className="h-5 w-5 text-muted-foreground" />
                <span>Checked: {ticket.baggage.checked} bag(s)</span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="mt-6 flex items-center justify-between border-t pt-6">
            <span className="text-muted-foreground">Total Paid</span>
            <span className="text-2xl font-bold text-primary">${ticket.price}</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Cards */}
      {ticket.status === 'confirmed' && (
        <div className="grid gap-4 md:grid-cols-3">
          {/* Upgrade Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowUpCircle className="h-5 w-5 text-primary" />
                Upgrade Class
              </CardTitle>
              <CardDescription>Upgrade to a better experience</CardDescription>
            </CardHeader>
            <CardContent>
              {availableUpgrades().length > 0 ? (
                <Button onClick={() => setShowUpgradeDialog(true)} className="w-full">
                  View Upgrade Options
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You are already in the highest class
                </p>
              )}
            </CardContent>
          </Card>

          {/* Baggage Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Luggage className="h-5 w-5 text-primary" />
                Add Baggage
              </CardTitle>
              <CardDescription>Purchase additional baggage</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowBaggageDialog(true)} className="w-full">
                Manage Baggage
              </Button>
            </CardContent>
          </Card>

          {/* Cancel Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <XCircle className="h-5 w-5 text-destructive" />
                Cancel Ticket
              </CardTitle>
              <CardDescription>Request ticket cancellation</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
                className="w-full"
              >
                Request Cancellation
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Your Class</DialogTitle>
            <DialogDescription>
              Current class: {classLabels[ticket.ticketClass]}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup value={selectedUpgrade} onValueChange={(v) => setSelectedUpgrade(v as TicketClass)}>
              {availableUpgrades().map((upgrade) => (
                <div
                  key={upgrade}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={upgrade} id={upgrade} />
                    <Label htmlFor={upgrade} className="cursor-pointer">
                      {classLabels[upgrade]}
                    </Label>
                  </div>
                  <span className="font-bold text-primary">
                    +${upgradePrices[upgrade] - upgradePrices[ticket.ticketClass]}
                  </span>
                </div>
              ))}
            </RadioGroup>
            {selectedUpgrade && (
              <div className="mt-4 rounded-lg bg-secondary/50 p-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Upgrade Cost</span>
                  <span className="text-primary">${calculateUpgradePrice()}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpgrade} disabled={!selectedUpgrade || isProcessing}>
              {isProcessing ? 'Processing...' : 'Confirm Upgrade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Baggage Dialog */}
      <Dialog open={showBaggageDialog} onOpenChange={setShowBaggageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Baggage</DialogTitle>
            <DialogDescription>Add extra baggage to your booking</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Cabin Bags</Label>
                <p className="text-sm text-muted-foreground">7kg each</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCabinBags(Math.max(ticket.baggage.cabin, cabinBags - 1))}
                  disabled={cabinBags <= ticket.baggage.cabin}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-lg font-medium">{cabinBags}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCabinBags(Math.min(4, cabinBags + 1))}
                  disabled={cabinBags >= 4}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Checked Bags</Label>
                <p className="text-sm text-muted-foreground">23kg each</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCheckedBags(Math.max(ticket.baggage.checked, checkedBags - 1))}
                  disabled={checkedBags <= ticket.baggage.checked}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-lg font-medium">{checkedBags}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCheckedBags(Math.min(5, checkedBags + 1))}
                  disabled={checkedBags >= 5}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="flex justify-between">
                <span>Additional baggage cost</span>
                <span className="font-bold text-primary">${calculateBaggagePrice()}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">${baggagePrice} per extra bag</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBaggageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBaggage} disabled={calculateBaggagePrice() === 0 || isProcessing}>
              {isProcessing ? 'Processing...' : 'Add Baggage'}
            </Button>
          </DialogFooter>
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
              Your cancellation request will be reviewed by a manager. Refund amount depends on
              your fare type and how close to departure you cancel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Reason for cancellation</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mt-2"
            />
            <div className="mt-4 rounded-lg bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">
                Estimated refund: ${Math.round(ticket.price * 0.9)} (90% of ticket price)
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Final amount subject to manager approval
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep My Ticket</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelRequest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isProcessing}
            >
              {isProcessing ? 'Submitting...' : 'Submit Request'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
