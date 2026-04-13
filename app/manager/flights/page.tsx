"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Plane, Edit, Trash2 } from "lucide-react"
import { mockFlights } from "@/lib/mock-data"
import type { Flight } from "@/lib/types"

export default function FlightsPage() {
  const [flights, setFlights] = useState(mockFlights)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    flightNumber: "",
    departureCity: "",
    departureCode: "",
    departureDate: "",
    departureTime: "",
    arrivalCity: "",
    arrivalCode: "",
    arrivalDate: "",
    arrivalTime: "",
    duration: "",
    economyPrice: "",
    businessPrice: "",
    firstClassPrice: "",
    economySeats: "",
    businessSeats: "",
    firstClassSeats: "",
    status: "scheduled" as Flight["status"]
  })

  const filteredFlights = flights.filter(flight =>
    flight.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flight.departure.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flight.arrival.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const resetForm = () => {
    setFormData({
      flightNumber: "",
      departureCity: "",
      departureCode: "",
      departureDate: "",
      departureTime: "",
      arrivalCity: "",
      arrivalCode: "",
      arrivalDate: "",
      arrivalTime: "",
      duration: "",
      economyPrice: "",
      businessPrice: "",
      firstClassPrice: "",
      economySeats: "",
      businessSeats: "",
      firstClassSeats: "",
      status: "scheduled"
    })
  }

  const handleCreate = () => {
    const newFlight: Flight = {
      id: `flight-${Date.now()}`,
      flightNumber: formData.flightNumber,
      airline: "SkyLine Airways",
      departure: {
        city: formData.departureCity,
        airport: `${formData.departureCity} Airport`,
        code: formData.departureCode,
        time: formData.departureTime,
        date: formData.departureDate,
      },
      arrival: {
        city: formData.arrivalCity,
        airport: `${formData.arrivalCity} Airport`,
        code: formData.arrivalCode,
        time: formData.arrivalTime,
        date: formData.arrivalDate,
      },
      duration: formData.duration,
      price: {
        economy: parseFloat(formData.economyPrice) || 0,
        business: parseFloat(formData.businessPrice) || 0,
        firstClass: parseFloat(formData.firstClassPrice) || 0,
      },
      seatsAvailable: {
        economy: parseInt(formData.economySeats) || 0,
        business: parseInt(formData.businessSeats) || 0,
        firstClass: parseInt(formData.firstClassSeats) || 0,
      },
      status: formData.status,
    }
    setFlights([...flights, newFlight])
    setShowCreateDialog(false)
    resetForm()
  }

  const handleEdit = () => {
    if (!selectedFlight) return
    setFlights(flights.map(f => 
      f.id === selectedFlight.id 
        ? {
            ...f,
            flightNumber: formData.flightNumber,
            departure: {
              city: formData.departureCity,
              airport: `${formData.departureCity} Airport`,
              code: formData.departureCode,
              time: formData.departureTime,
              date: formData.departureDate,
            },
            arrival: {
              city: formData.arrivalCity,
              airport: `${formData.arrivalCity} Airport`,
              code: formData.arrivalCode,
              time: formData.arrivalTime,
              date: formData.arrivalDate,
            },
            duration: formData.duration,
            price: {
              economy: parseFloat(formData.economyPrice) || 0,
              business: parseFloat(formData.businessPrice) || 0,
              firstClass: parseFloat(formData.firstClassPrice) || 0,
            },
            seatsAvailable: {
              economy: parseInt(formData.economySeats) || 0,
              business: parseInt(formData.businessSeats) || 0,
              firstClass: parseInt(formData.firstClassSeats) || 0,
            },
            status: formData.status,
          }
        : f
    ))
    setShowEditDialog(false)
    setSelectedFlight(null)
    resetForm()
  }

  const handleDelete = () => {
    if (!selectedFlight) return
    setFlights(flights.filter(f => f.id !== selectedFlight.id))
    setShowDeleteDialog(false)
    setSelectedFlight(null)
  }

  const openEditDialog = (flight: Flight) => {
    setSelectedFlight(flight)
    setFormData({
      flightNumber: flight.flightNumber,
      departureCity: flight.departure.city,
      departureCode: flight.departure.code,
      departureDate: flight.departure.date,
      departureTime: flight.departure.time,
      arrivalCity: flight.arrival.city,
      arrivalCode: flight.arrival.code,
      arrivalDate: flight.arrival.date,
      arrivalTime: flight.arrival.time,
      duration: flight.duration,
      economyPrice: flight.price.economy.toString(),
      businessPrice: flight.price.business.toString(),
      firstClassPrice: flight.price.firstClass.toString(),
      economySeats: flight.seatsAvailable.economy.toString(),
      businessSeats: flight.seatsAvailable.business.toString(),
      firstClassSeats: flight.seatsAvailable.firstClass.toString(),
      status: flight.status
    })
    setShowEditDialog(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "default"
      case "boarding": return "secondary"
      case "departed": return "outline"
      case "arrived": return "default"
      case "cancelled": return "destructive"
      default: return "default"
    }
  }

  const FlightForm = ({ onSubmit, submitLabel }: { onSubmit: () => void, submitLabel: string }) => (
    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
      <div className="space-y-2">
        <Label htmlFor="flightNumber">Flight Number</Label>
        <Input
          id="flightNumber"
          placeholder="SL-101"
          value={formData.flightNumber}
          onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
        />
      </div>

      {/* Departure Section */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Departure</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="departureCity">City</Label>
            <Input
              id="departureCity"
              placeholder="New York"
              value={formData.departureCity}
              onChange={(e) => setFormData({ ...formData, departureCity: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="departureCode">Airport Code</Label>
            <Input
              id="departureCode"
              placeholder="JFK"
              value={formData.departureCode}
              onChange={(e) => setFormData({ ...formData, departureCode: e.target.value.toUpperCase() })}
              maxLength={3}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="departureDate">Date</Label>
            <Input
              id="departureDate"
              type="date"
              value={formData.departureDate}
              onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="departureTime">Time</Label>
            <Input
              id="departureTime"
              type="time"
              value={formData.departureTime}
              onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Arrival Section */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Arrival</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="arrivalCity">City</Label>
            <Input
              id="arrivalCity"
              placeholder="London"
              value={formData.arrivalCity}
              onChange={(e) => setFormData({ ...formData, arrivalCity: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="arrivalCode">Airport Code</Label>
            <Input
              id="arrivalCode"
              placeholder="LHR"
              value={formData.arrivalCode}
              onChange={(e) => setFormData({ ...formData, arrivalCode: e.target.value.toUpperCase() })}
              maxLength={3}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="arrivalDate">Date</Label>
            <Input
              id="arrivalDate"
              type="date"
              value={formData.arrivalDate}
              onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="arrivalTime">Time</Label>
            <Input
              id="arrivalTime"
              type="time"
              value={formData.arrivalTime}
              onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Duration</Label>
        <Input
          id="duration"
          placeholder="7h 00m"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
        />
      </div>

      {/* Pricing Section */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Pricing ($)</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="economyPrice">Economy</Label>
            <Input
              id="economyPrice"
              type="number"
              placeholder="450"
              value={formData.economyPrice}
              onChange={(e) => setFormData({ ...formData, economyPrice: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessPrice">Business</Label>
            <Input
              id="businessPrice"
              type="number"
              placeholder="1200"
              value={formData.businessPrice}
              onChange={(e) => setFormData({ ...formData, businessPrice: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstClassPrice">First Class</Label>
            <Input
              id="firstClassPrice"
              type="number"
              placeholder="2500"
              value={formData.firstClassPrice}
              onChange={(e) => setFormData({ ...formData, firstClassPrice: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Seats Section */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Available Seats</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="economySeats">Economy</Label>
            <Input
              id="economySeats"
              type="number"
              placeholder="120"
              value={formData.economySeats}
              onChange={(e) => setFormData({ ...formData, economySeats: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessSeats">Business</Label>
            <Input
              id="businessSeats"
              type="number"
              placeholder="30"
              value={formData.businessSeats}
              onChange={(e) => setFormData({ ...formData, businessSeats: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstClassSeats">First Class</Label>
            <Input
              id="firstClassSeats"
              type="number"
              placeholder="8"
              value={formData.firstClassSeats}
              onChange={(e) => setFormData({ ...formData, firstClassSeats: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value: Flight["status"]) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="boarding">Boarding</SelectItem>
            <SelectItem value="departed">Departed</SelectItem>
            <SelectItem value="arrived">Arrived</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => {
          setShowCreateDialog(false)
          setShowEditDialog(false)
          resetForm()
        }}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>{submitLabel}</Button>
      </DialogFooter>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flight Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage all flights</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Flight
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Flight</DialogTitle>
              <DialogDescription>Add a new flight to the system</DialogDescription>
            </DialogHeader>
            <FlightForm onSubmit={handleCreate} submitLabel="Create Flight" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flights</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flights.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flights.filter(f => f.status === "scheduled").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flights.filter(f => f.isPromotion).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flights.filter(f => f.status === "cancelled").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Flight List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Flights</CardTitle>
              <CardDescription>View and manage flight schedules</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search flights..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flight</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Economy Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFlights.map((flight) => (
                <TableRow key={flight.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{flight.flightNumber}</span>
                      {flight.isPromotion && (
                        <Badge variant="destructive" className="text-xs">
                          {flight.discount}% OFF
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{flight.departure.code}</span>
                      <Plane className="h-3 w-3 rotate-90" />
                      <span>{flight.arrival.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>{flight.departure.date}</TableCell>
                  <TableCell>{flight.departure.time}</TableCell>
                  <TableCell>${flight.price.economy}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(flight.status) as "default" | "secondary" | "destructive" | "outline"}>
                      {flight.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(flight)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            setSelectedFlight(flight)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Flight</DialogTitle>
            <DialogDescription>Update flight details</DialogDescription>
          </DialogHeader>
          <FlightForm onSubmit={handleEdit} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Flight</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete flight {selectedFlight?.flightNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Flight
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
