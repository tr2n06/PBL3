"use client";
import { useEffect, useState } from "react";
import {
  getFlights,
  createFlight,
  updateFlight,
  deleteFlight,
  getFlightNumber,
  type FlightAdminItem,
} from "@/lib/flights-api";

const AIRPORTS = [
  { code: "BMV", name: "Buon Ma Thuot (BMV)", city: "Dak Lak" },
  { code: "CAH", name: "Ca Mau (CAH)", city: "Ca Mau" },
  { code: "CXR", name: "Cam Ranh (CXR)", city: "Khanh Hoa" },
  { code: "DAD", name: "Da Nang (DAD)", city: "Da Nang" },
  { code: "DIN", name: "Dien Bien Phu (DIN)", city: "Dien Bien" },
  { code: "DLI", name: "Lien Khuong (DLI)", city: "Lam Dong" },
  { code: "HAN", name: "Noi Bai (HAN)", city: "Ha Noi" },
  { code: "HPH", name: "Cat Bi (HPH)", city: "Hai Phong" },
  { code: "HUI", name: "Phu Bai (HUI)", city: "Thua Thien Hue" },
  { code: "PQC", name: "Phu Quoc (PQC)", city: "Kien Giang" },
  { code: "PXU", name: "Pleiku (PXU)", city: "Gia Lai" },
  { code: "SGN", name: "Tan Son Nhat (SGN)", city: "Ho Chi Minh City" },
  { code: "TBB", name: "Tuy Hoa (TBB)", city: "Phu Yen" },
  { code: "THD", name: "Tho Xuan (THD)", city: "Thanh Hoa" },
  { code: "UIH", name: "Phu Cat (UIH)", city: "Binh Dinh" },
  { code: "VCA", name: "Can Tho (VCA)", city: "Can Tho" },
  { code: "VCL", name: "Chu Lai (VCL)", city: "Quang Nam" },
  { code: "VCS", name: "Con Dao (VCS)", city: "Ba Ria - Vung Tau" },
  { code: "VDH", name: "Dong Hoi (VDH)", city: "Quang Binh" },
  { code: "VDO", name: "Van Don (VDO)", city: "Quang Ninh" },
  { code: "VII", name: "Vinh (VII)", city: "Nghe An" },
  { code: "VKG", name: "Rach Gia (VKG)", city: "Kien Giang" },
];

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Plane,
  Edit,
  Trash2,
} from "lucide-react";

import type { Flight } from "@/lib/types";

const FlightForm = ({
  formData,
  setFormData,
  onSubmit,
  submitLabel,
  isEdit = false,
  onCancel,
}: {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: () => void;
  submitLabel: string;
  isEdit?: boolean;
  onCancel: () => void;
}) => (
  <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
    <div className="space-y-2">
      <Label htmlFor="flightNumber">Flight Number</Label>
      <Input
        id="flightNumber"
        placeholder="Flight number auto-generated"
        value={formData.flightNumber}
        disabled={true}
      />
    </div>

    {/* Departure Section */}
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Departure</h4>
      <div className="grid grid-cols-2 gap-4">
        {isEdit ? (
          <div className="space-y-2">
            <Label htmlFor="departureCity">City</Label>
            <Input
              id="departureCity"
              value={formData.departureCity}
              disabled
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Airport</Label>
            <Select
              value={formData.departureCode}
              onValueChange={(code) => {
                const airport = AIRPORTS.find((a) => a.code === code);
                if (airport) {
                  setFormData({
                    ...formData,
                    departureCode: airport.code,
                    departureCity: airport.city,
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Airport" />
              </SelectTrigger>
              <SelectContent>
                {AIRPORTS.filter((a) => a.code !== formData.arrivalCode).map((a) => (
                  <SelectItem key={a.code} value={a.code}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="departureCode">Airport Code</Label>
          <Input
            id="departureCode"
            placeholder="Code"
            value={formData.departureCode}
            disabled={true}
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
            onChange={(e) =>
              setFormData({ ...formData, departureDate: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="departureTime">Time</Label>
          <Input
            id="departureTime"
            type="time"
            value={formData.departureTime}
            onChange={(e) =>
              setFormData({ ...formData, departureTime: e.target.value })
            }
          />
        </div>
      </div>
    </div>

    {/* Arrival Section */}
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Arrival</h4>
      <div className="grid grid-cols-2 gap-4">
        {isEdit ? (
          <div className="space-y-2">
            <Label htmlFor="arrivalCity">City</Label>
            <Input
              id="arrivalCity"
              value={formData.arrivalCity}
              disabled
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Airport</Label>
            <Select
              value={formData.arrivalCode}
              onValueChange={(code) => {
                const airport = AIRPORTS.find((a) => a.code === code);
                if (airport) {
                  setFormData({
                    ...formData,
                    arrivalCode: airport.code,
                    arrivalCity: airport.city,
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Airport" />
              </SelectTrigger>
              <SelectContent>
                {AIRPORTS.filter((a) => a.code !== formData.departureCode).map((a) => (
                  <SelectItem key={a.code} value={a.code}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="arrivalCode">Airport Code</Label>
          <Input
            id="arrivalCode"
            placeholder="Code"
            value={formData.arrivalCode}
            disabled={true}
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
            onChange={(e) =>
              setFormData({ ...formData, arrivalDate: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="arrivalTime">Time</Label>
          <Input
            id="arrivalTime"
            type="time"
            value={formData.arrivalTime}
            onChange={(e) =>
              setFormData({ ...formData, arrivalTime: e.target.value })
            }
          />
        </div>
      </div>
    </div>

    {formData.duration && (
      <div className="space-y-2">
        <Label htmlFor="duration">Duration</Label>
        <Input
          id="duration"
          placeholder="7h 00m"
          value={formData.duration}
          disabled
        />
      </div>
    )}

    {/* Pricing Section */}
    <div className="space-y-2">
      <Label htmlFor="priceFlight">Price</Label>
      <Input
        id="priceFlight"
        type="text"
        placeholder="500000"
        value={formData.priceFlight}
        onChange={(e) => {
          const val = e.target.value.replace(/[^0-9]/g, "");
          setFormData({ ...formData, priceFlight: val });
        }}
      />
    </div>

    {/* Seats Section */}
    {isEdit && (
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
              disabled={isEdit}
              onChange={(e) =>
                setFormData({ ...formData, economySeats: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessSeats">Business</Label>
            <Input
              id="businessSeats"
              type="number"
              placeholder="30"
              value={formData.businessSeats}
              disabled={isEdit}
              onChange={(e) =>
                setFormData({ ...formData, businessSeats: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstClassSeats">First Class</Label>
            <Input
              id="firstClassSeats"
              type="number"
              placeholder="8"
              value={formData.firstClassSeats}
              disabled={isEdit}
              onChange={(e) =>
                setFormData({ ...formData, firstClassSeats: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    )}

    {isEdit && (
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value: Flight["status"]) =>
            setFormData({ ...formData, status: value })
          }
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
    )}

    <DialogFooter>
      <Button
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button onClick={onSubmit}>{submitLabel}</Button>
    </DialogFooter>
  </div>
);

export default function FlightsPage() {
  const [flights, setFlights] = useState<FlightAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

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
    status: "scheduled" as Flight["status"],
    priceFlight: "",
  });
  const [editSnapshot, setEditSnapshot] = useState<typeof formData | null>(null);
  const loadFlights = async () => {
    try {
      const data = await getFlights();
      setFlights(data);
    } catch (error) {
      console.error("Load flights failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlights();
  }, []);

  // Auto-calculate flight duration when date & time inputs change
  useEffect(() => {
    if (formData.departureDate && formData.departureTime && formData.arrivalDate && formData.arrivalTime) {
      const dep = new Date(`${formData.departureDate}T${formData.departureTime}`);
      const arr = new Date(`${formData.arrivalDate}T${formData.arrivalTime}`);
      if (!isNaN(dep.getTime()) && !isNaN(arr.getTime())) {
        const diffMs = arr.getTime() - dep.getTime();
        if (diffMs > 0) {
          const diffHrs = Math.floor(diffMs / 3600000);
          const diffMins = Math.floor((diffMs % 3600000) / 60000);
          const durationStr = `${diffHrs}h ${diffMins.toString().padStart(2, "0")}m`;
          if (formData.duration !== durationStr) {
            setFormData((prev) => ({ ...prev, duration: durationStr }));
          }
          return;
        }
      }
    }
    if (formData.duration !== "") {
      setFormData((prev) => ({ ...prev, duration: "" }));
    }
  }, [formData.departureDate, formData.departureTime, formData.arrivalDate, formData.arrivalTime]);

  // Auto-fetch flight number when departure & arrival airports are selected (only in create mode)
  useEffect(() => {
    const fetchFlightNumber = async () => {
      if (!selectedFlight && formData.departureCode && formData.arrivalCode) {
        try {
          const data = await getFlightNumber(formData.departureCode, formData.arrivalCode);
          setFormData((prev) => ({ ...prev, flightNumber: data.flightNumber }));
        } catch (error) {
          console.error("Fetch flight number failed:", error);
        }
      }
    };
    fetchFlightNumber();
  }, [formData.departureCode, formData.arrivalCode, selectedFlight]);
  const filteredFlights = flights.filter(
    (flight) =>
      (flight.flightNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (flight.departure?.city || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (flight.arrival?.city || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
      status: "scheduled",
      priceFlight: "",
    });
  };

  const handleCreate = async () => {
    // Validate that all required fields are filled
    if (
      !formData.flightNumber.trim() ||
      !formData.departureCode.trim() ||
      !formData.departureDate.trim() ||
      !formData.departureTime.trim() ||
      !formData.arrivalCode.trim() ||
      !formData.arrivalDate.trim() ||
      !formData.arrivalTime.trim() ||
      !formData.priceFlight.trim()
    ) {
      alert("Please fill in all fields.");
      return;
    }

    // 1. Validate that departure and arrival airports are different
    if (formData.departureCode === formData.arrivalCode) {
      alert("Departure and arrival airports cannot be the same.");
      return;
    }

    // 2. Validate that arrival date & time is strictly after departure date & time
    const dep = new Date(`${formData.departureDate}T${formData.departureTime}`);
    const arr = new Date(`${formData.arrivalDate}T${formData.arrivalTime}`);
    if (dep.getTime() >= arr.getTime()) {
      alert("Arrival date and time must be strictly after departure date and time.");
      return;
    }

    const price = parseFloat(formData.priceFlight);
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid price greater than 0.");
      return;
    }

    try {
      const created = await createFlight({
        flightNumber: formData.flightNumber,
        departureCode: formData.departureCode,
        departureDate: formData.departureDate,
        departureTime: formData.departureTime,
        arrivalCode: formData.arrivalCode,
        arrivalDate: formData.arrivalDate,
        arrivalTime: formData.arrivalTime,
        status: "scheduled",
        price: price,
      });

      setShowCreateDialog(false);
      resetForm();
      await loadFlights(); // Refetch from backend to ensure data correctness
    } catch (error) {
      console.error("Create flight failed:", error);
      alert(error instanceof Error ? error.message : "Create failed");
    }
  };

  const getUpdatePayload = (snapshot: typeof formData, current: typeof formData) => {
    const snapshotPrice = parseFloat(snapshot.priceFlight) || 0;
    const currentPrice = parseFloat(current.priceFlight) || 0;

    return {
      flightNumber: snapshot.flightNumber === current.flightNumber ? null : current.flightNumber,
      departureDate: snapshot.departureDate === current.departureDate ? null : current.departureDate,
      departureTime: snapshot.departureTime === current.departureTime ? null : current.departureTime,
      arrivalDate: snapshot.arrivalDate === current.arrivalDate ? null : current.arrivalDate,
      arrivalTime: snapshot.arrivalTime === current.arrivalTime ? null : current.arrivalTime,
      status: snapshot.status === current.status ? null : current.status,
      priceFlight: snapshotPrice === currentPrice ? null : currentPrice,
    };
  };

  const handleEdit = async () => {
    if (!selectedFlight || !editSnapshot) return;

    // Validate that all required fields are filled
    if (
      !formData.flightNumber.trim() ||
      !formData.departureCode.trim() ||
      !formData.departureDate.trim() ||
      !formData.departureTime.trim() ||
      !formData.arrivalCode.trim() ||
      !formData.arrivalDate.trim() ||
      !formData.arrivalTime.trim() ||
      !formData.priceFlight.trim()
    ) {
      alert("Please fill in all fields.");
      return;
    }

    // 1. Validate that arrival date & time is strictly after departure date & time
    const dep = new Date(`${formData.departureDate}T${formData.departureTime}`);
    const arr = new Date(`${formData.arrivalDate}T${formData.arrivalTime}`);
    if (dep.getTime() >= arr.getTime()) {
      alert("Arrival date and time must be strictly after departure date and time.");
      return;
    }

    // 2. Validate duplicates against existing flights
    const normalizeTime = (timeStr: string) => {
      if (!timeStr) return "";
      const parts = timeStr.split(":");
      return parts.length >= 2 ? `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}` : timeStr;
    };
    const duplicate = flights.find(
      (f) =>
        f.id !== selectedFlight.id &&
        f.flightNumber.toLowerCase() === formData.flightNumber.toLowerCase() &&
        f.departure.date === formData.departureDate &&
        normalizeTime(f.departure.time) === normalizeTime(formData.departureTime)
    );
    if (duplicate) {
      alert("A flight with this flight number, departure date, and departure time already exists.");
      return;
    }

    const price = parseFloat(formData.priceFlight);
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid price greater than 0.");
      return;
    }

    const payload = getUpdatePayload(editSnapshot, formData) as Parameters<typeof updateFlight>[1];
    const changed = Object.values(payload).some((value) => value !== null);
    if (!changed) {
      alert("No changes detected.");
      return;
    }

    try {
      const updated = await updateFlight(selectedFlight.id, payload);

      setShowEditDialog(false);
      setSelectedFlight(null);
      setEditSnapshot(null);
      resetForm();
      await loadFlights(); // Refetch from backend to ensure data correctness
    } catch (error) {
      console.error("Update flight failed:", error);
      alert(error instanceof Error ? error.message : "Update failed");
    }
  };

  const handleDelete = async () => {
    if (!selectedFlight) return;

    try {
      await deleteFlight(selectedFlight.id);
      setFlights((prev) => prev.filter((f) => f.id !== selectedFlight.id));
      setShowDeleteDialog(false);
      setSelectedFlight(null);
      await loadFlights(); // Refetch from backend to ensure data correctness
    } catch (error) {
      console.error("Delete flight failed:", error);
      alert(error instanceof Error ? error.message : "Delete failed");
    }
  };

  const openEditDialog = (flight: Flight) => {
    const snapshot = {
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
      status: flight.status,
      priceFlight: flight.priceFlight?.toString() || flight.price.economy.toString(),
    };

    setSelectedFlight(flight);
    setEditSnapshot(snapshot);
    setFormData(snapshot);
    setShowEditDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "default";
      case "boarding":
        return "secondary";
      case "departed":
        return "outline";
      case "arrived":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };


  if (loading) {
    return <div className="p-6">Loading flights...</div>;
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Flight Management
          </h1>
          <p className="text-muted-foreground">
            Create, edit, and manage all flights
          </p>
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
              <DialogDescription>
                Add a new flight to the system
              </DialogDescription>
            </DialogHeader>
            <FlightForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreate}
              submitLabel="Create Flight"
              onCancel={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
            />
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
            <div className="text-2xl font-bold">
              {flights.filter((f) => f.status === "scheduled").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flights.filter((f) => f.isPromotion).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flights.filter((f) => f.status === "cancelled").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flight List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Flights</CardTitle>
              <CardDescription>
                View and manage flight schedules
              </CardDescription>
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
                    <Badge
                      variant={
                        getStatusColor(flight.status) as
                        | "default"
                        | "secondary"
                        | "destructive"
                        | "outline"
                      }
                    >
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
                        <DropdownMenuItem
                          onClick={() => openEditDialog(flight)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>

                        {!flight.hasBookings && !flight.bookedCount && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedFlight(flight);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
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
          <FlightForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEdit}
            submitLabel="Save Changes"
            isEdit={true}
            onCancel={() => {
              setShowEditDialog(false);
              resetForm();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Flight</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete flight{" "}
              {selectedFlight?.flightNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Flight
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
