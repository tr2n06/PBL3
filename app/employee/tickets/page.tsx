'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  XCircle,
  Filter,
  Eye,
} from 'lucide-react'
import { mockTickets } from '@/lib/mock-data'
import type { Ticket, TicketClass, TicketStatus } from '@/lib/types'

export default function EmployeeTicketsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [actionType, setActionType] = useState<'upgrade' | 'baggage' | 'cancel' | null>(null)

  const filteredTickets = mockTickets.filter((ticket) => {
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

  const classLabels: Record<TicketClass, string> = {
    economy: 'Economy',
    business: 'Business',
    firstClass: 'First Class',
  }

  const handleAction = (ticket: Ticket, type: 'upgrade' | 'baggage' | 'cancel') => {
    setSelectedTicket(ticket)
    setActionType(type)
    setShowActionDialog(true)
  }

  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setShowDetailsDialog(true)
  }

  const executeAction = () => {
    // Simulate action
    alert(`Action "${actionType}" performed on ticket ${selectedTicket?.bookingRef}`)
    setShowActionDialog(false)
    setSelectedTicket(null)
    setActionType(null)
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
            <Filter className="h-5 w-5" />
            Search & Filter
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
          <CardDescription>Manage upgrades, baggage, and cancellations</CardDescription>
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
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono font-medium">{ticket.bookingRef}</TableCell>
                      <TableCell>
                        <div>{ticket.passengerName}</div>
                        <div className="text-xs text-muted-foreground">{ticket.passengerEmail}</div>
                      </TableCell>
                      <TableCell>{ticket.flight.flightNumber}</TableCell>
                      <TableCell>
                        {ticket.flight.departure.code} - {ticket.flight.arrival.code}
                      </TableCell>
                      <TableCell>{classLabels[ticket.ticketClass]}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-gray-500">{ticket.bookedAt || "—"}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[ticket.status]}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(ticket)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {ticket.status === 'confirmed' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAction(ticket, 'upgrade')}
                                title="Upgrade"
                              >
                                <ArrowUpCircle className="h-4 w-4 text-primary" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAction(ticket, 'baggage')}
                                title="Add Baggage"
                              >
                                <Luggage className="h-4 w-4 text-primary" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAction(ticket, 'cancel')}
                                title="Cancel"
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle>Ticket Details</DialogTitle>
                <DialogDescription>Booking Ref: {selectedTicket.bookingRef}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Passenger</div>
                    <div className="font-medium">{selectedTicket.passengerName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium">{selectedTicket.passengerEmail}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Flight</div>
                    <div className="font-medium">{selectedTicket.flight.flightNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Route</div>
                    <div className="font-medium">
                      {selectedTicket.flight.departure.city} to {selectedTicket.flight.arrival.city}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-medium">{selectedTicket.flight.departure.date}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Time</div>
                    <div className="font-medium">{selectedTicket.flight.departure.time}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Class</div>
                    <div className="font-medium">{classLabels[selectedTicket.ticketClass]}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Seat</div>
                    <div className="font-medium">{selectedTicket.seatNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Baggage</div>
                    <div className="font-medium">
                      Cabin: {selectedTicket.baggage.cabin}, Checked: {selectedTicket.baggage.checked}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Price Paid</div>
                    <div className="font-medium text-primary">${selectedTicket.price}</div>
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

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          {selectedTicket && actionType && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {actionType === 'upgrade' && 'Upgrade Ticket'}
                  {actionType === 'baggage' && 'Add Baggage'}
                  {actionType === 'cancel' && 'Cancel Ticket'}
                </DialogTitle>
                <DialogDescription>
                  Ticket: {selectedTicket.bookingRef} - {selectedTicket.passengerName}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {actionType === 'upgrade' && (
                  <div className="space-y-4">
                    <p>Current class: {classLabels[selectedTicket.ticketClass]}</p>
                    <div className="space-y-2">
                      <Label>Upgrade to</Label>
                      <Select defaultValue="business">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="business">Business (+$750)</SelectItem>
                          <SelectItem value="firstClass">First Class (+$1500)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                {actionType === 'baggage' && (
                  <div className="space-y-4">
                    <p>
                      Current: {selectedTicket.baggage.cabin} cabin, {selectedTicket.baggage.checked} checked
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Add Cabin Bags</Label>
                        <Select defaultValue="0">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2].map((n) => (
                              <SelectItem key={n} value={n.toString()}>
                                +{n} ({n * 35}$)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Add Checked Bags</Label>
                        <Select defaultValue="0">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3].map((n) => (
                              <SelectItem key={n} value={n.toString()}>
                                +{n} ({n * 35}$)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
                {actionType === 'cancel' && (
                  <div className="rounded-lg bg-destructive/10 p-4">
                    <p className="font-medium text-destructive">
                      This will cancel the ticket and initiate a refund request.
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Estimated refund: ${Math.round(selectedTicket.price * 0.9)} (90%)
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                  Cancel
                </Button>
                <Button
                  variant={actionType === 'cancel' ? 'destructive' : 'default'}
                  onClick={executeAction}
                >
                  {actionType === 'upgrade' && 'Confirm Upgrade'}
                  {actionType === 'baggage' && 'Add Baggage'}
                  {actionType === 'cancel' && 'Cancel Ticket'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
