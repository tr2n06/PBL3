'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Tag, Plus, Clock, AlertTriangle, Check, X, Plane } from 'lucide-react'
import { mockFlights, mockFlightPopularity } from '@/lib/mock-data'

export default function EmployeePromotionsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedFlight, setSelectedFlight] = useState('')
  const [discount, setDiscount] = useState([15])
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock pending promotions
  const pendingPromotions = [
    {
      id: 'promo-1',
      flightNumber: 'SL-505',
      route: 'LHR - JFK',
      discount: 25,
      reason: 'Low booking rate - 45% capacity',
      status: 'pending',
      createdAt: '2024-03-27',
    },
  ]

  const activePromotions = mockFlights.filter((f) => f.isPromotion)
  const lowOccupancyFlights = mockFlightPopularity.filter((f) => f.occupancyRate < 60)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setShowCreateDialog(false)
    alert('Promotion request submitted for manager approval!')
    setSelectedFlight('')
    setDiscount([15])
    setReason('')
  }

  const getFlightInfo = () => {
    const flight = mockFlights.find((f) => f.id === selectedFlight)
    const popularity = mockFlightPopularity.find((f) => f.flightId === selectedFlight)
    return { flight, popularity }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promotions</h1>
          <p className="text-muted-foreground">Create and manage flight promotions</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Promotion Request</DialogTitle>
              <DialogDescription>
                Select a flight and set discount. Requires manager approval.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Flight</Label>
                <Select value={selectedFlight} onValueChange={setSelectedFlight}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a flight" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockFlights
                      .filter((f) => !f.isPromotion)
                      .map((flight) => {
                        const pop = mockFlightPopularity.find((p) => p.flightId === flight.id)
                        return (
                          <SelectItem key={flight.id} value={flight.id}>
                            <div className="flex items-center gap-2">
                              <span>
                                {flight.flightNumber}: {flight.departure.city} - {flight.arrival.city}
                              </span>
                              {pop && pop.occupancyRate < 60 && (
                                <Badge variant="secondary" className="text-xs">
                                  {pop.occupancyRate}% filled
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        )
                      })}
                  </SelectContent>
                </Select>
              </div>

              {selectedFlight && (
                <>
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current Price:</span>
                        <span className="ml-2 font-medium">${getFlightInfo().flight?.price.economy}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Occupancy:</span>
                        <span className="ml-2 font-medium">{getFlightInfo().popularity?.occupancyRate || 'N/A'}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Discount</Label>
                      <span className="text-xl font-bold text-primary">{discount[0]}%</span>
                    </div>
                    <Slider
                      value={discount}
                      onValueChange={setDiscount}
                      min={5}
                      max={50}
                      step={5}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5%</span>
                      <span>50%</span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-primary/10 p-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">New Price (Economy):</span>
                      <span className="ml-2 text-lg font-bold text-primary">
                        ${Math.round((getFlightInfo().flight?.price.economy || 0) * (1 - discount[0] / 100))}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Justification</Label>
                    <Textarea
                      placeholder="Explain why this promotion is needed..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedFlight || !reason || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Occupancy Alert */}
      {lowOccupancyFlights.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Flights with Low Occupancy
            </CardTitle>
            <CardDescription>
              These flights may benefit from promotional pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowOccupancyFlights.map((flight) => (
                <Badge
                  key={flight.flightId}
                  variant="outline"
                  className="cursor-pointer transition-colors hover:bg-secondary"
                  onClick={() => {
                    setSelectedFlight(flight.flightId)
                    setShowCreateDialog(true)
                  }}
                >
                  {flight.flightNumber} ({flight.route}) - {flight.occupancyRate}% filled
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Pending Approval
          </CardTitle>
          <CardDescription>Your promotion requests awaiting manager review</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingPromotions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pending requests</p>
          ) : (
            <div className="space-y-4">
              {pendingPromotions.map((promo) => (
                <div
                  key={promo.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
                      <Tag className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {promo.flightNumber} - {promo.route}
                      </div>
                      <div className="text-sm text-muted-foreground">{promo.reason}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-1">
                      {promo.discount}% discount
                    </Badge>
                    <div className="text-xs text-muted-foreground">{promo.createdAt}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Promotions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-accent" />
            Active Promotions
          </CardTitle>
          <CardDescription>Currently running promotional flights</CardDescription>
        </CardHeader>
        <CardContent>
          {activePromotions.length === 0 ? (
            <div className="py-8 text-center">
              <Plane className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No active promotions</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activePromotions.map((flight) => (
                <div key={flight.id} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Plane className="h-4 w-4 text-primary" />
                      <span className="font-medium">{flight.flightNumber}</span>
                    </div>
                    <Badge variant="destructive" className="gap-1">
                      <Tag className="h-3 w-3" />
                      {flight.discount}% OFF
                    </Badge>
                  </div>
                  <div className="mb-2 text-lg font-semibold">
                    {flight.departure.city} to {flight.arrival.city}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      ${flight.price.economy}
                    </span>
                    <span className="text-xl font-bold text-primary">
                      ${Math.round(flight.price.economy * (1 - (flight.discount || 0) / 100))}
                    </span>
                    <span className="text-sm text-muted-foreground">Economy</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
