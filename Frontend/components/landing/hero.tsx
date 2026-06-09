"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, ArrowRightLeft, Calendar, Users, Search, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const TODAY = new Date().toISOString().split("T")[0];

const airports = [
  { code: "HAN", city: "Ha Noi", name: "Noi Bai Airport" },
  { code: "HPH", city: "Hai Phong", name: "Cat Bi Airport" },
  { code: "VDO", city: "Quang Ninh", name: "Van Don Airport" },
  { code: "DIN", city: "Dien Bien", name: "Dien Bien Phu Airport" },
  { code: "THD", city: "Thanh Hoa", name: "Tho Xuan Airport" },
  { code: "VDH", city: "Quang Binh", name: "Dong Hoi Airport" },
  { code: "VII", city: "Nghe An", name: "Vinh Airport" },
  { code: "HUI", city: "Thua Thien Hue", name: "Phu Bai Airport" },
  { code: "DAD", city: "Da Nang", name: "Da Nang Airport" },
  { code: "VCL", city: "Quang Nam", name: "Chu Lai Airport" },
  { code: "DLI", city: "Lam Dong", name: "Lien Khuong Airport" },
  { code: "UIH", city: "Binh Dinh", name: "Phu Cat Airport" },
  { code: "TBB", city: "Phu Yen", name: "Tuy Hoa Airport" },
  { code: "CXR", city: "Khanh Hoa", name: "Cam Ranh Airport" },
  { code: "PXU", city: "Gia Lai", name: "Pleiku Airport" },
  { code: "BMV", city: "Dak Lak", name: "Buon Ma Thuot Airport" },
  { code: "SGN", city: "Ho Chi Minh City", name: "Tan Son Nhat Airport" },
  { code: "VCA", city: "Can Tho", name: "Can Tho Airport" },
  { code: "VKG", city: "Kien Giang", name: "Rach Gia Airport" },
  { code: "CAH", city: "Ca Mau", name: "Ca Mau Airport" },
  { code: "VCS", city: "Ba Ria - Vung Tau", name: "Con Dao Airport" },
  { code: "PQC", city: "Phu Quoc", name: "Phu Quoc Airport" },
];

export function Hero() {
  const router = useRouter();
  const [tripType, setTripType] = useState("roundtrip");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);

  const passCount = adultCount + childCount + infantCount;

  const incrementPassenger = (type: "adult" | "child" | "infant") => {
    const total = adultCount + childCount + infantCount;
    if (total >= 10) return;

    if (type === "adult") {
      setAdultCount((prev) => prev + 1);
    } else if (type === "child") {
      setChildCount((prev) => prev + 1);
    } else if (type === "infant") {
      if (infantCount < adultCount) {
        setInfantCount((prev) => prev + 1);
      }
    }
  };

  const decrementPassenger = (type: "adult" | "child" | "infant") => {
    if (type === "adult") {
      if (adultCount > 1 && adultCount > infantCount) {
        setAdultCount((prev) => prev - 1);
      }
    } else if (type === "child") {
      if (childCount > 0) {
        setChildCount((prev) => prev - 1);
      }
    } else if (type === "infant") {
      if (infantCount > 0) {
        setInfantCount((prev) => prev - 1);
      }
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams({
      from,
      to,
      departDate,
      returnDate: tripType === "roundtrip" ? returnDate : "",
      adults: adultCount.toString(),
      children: childCount.toString(),
      infants: infantCount.toString(),
      passengers: passCount.toString(),
      tripType,
    });

    router.push(`/search?${params.toString()}`);
  };

  const swapAirports = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-14 md:py-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/5" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/5" />
      </div>

      <div className="container relative mx-auto px-4">
        <Card className="mx-auto max-w-6xl rounded-[28px] border-0 bg-white/70 shadow-2xl backdrop-blur">
          <CardHeader className="px-6 py-5 md:px-8 md:py-6 pb-0 md:pb-0">
            <CardTitle className="text-2xl font-bold text-gray-800">Flight Search</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Enter your journey details to find available flights
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8 pt-4 md:pt-4">
            <Tabs
              value={tripType}
              onValueChange={setTripType}
              className="w-full"
            >
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <TabsList className="grid h-12 w-full max-w-[360px] grid-cols-2 rounded-2xl bg-slate-100 p-1 mb-0">
                  <TabsTrigger
                    value="roundtrip"
                    className="rounded-xl text-sm font-medium"
                  >
                    Round Trip
                  </TabsTrigger>
                  <TabsTrigger
                    value="oneway"
                    className="rounded-xl text-sm font-medium"
                  >
                    One Way
                  </TabsTrigger>
                </TabsList>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 w-full sm:w-56 justify-between rounded-xl bg-white border border-gray-200 text-left px-3 font-normal hover:bg-white text-gray-800"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500 shrink-0" />
                        <span className="truncate">
                          {passCount} Passenger{passCount > 1 ? "s" : ""}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 bg-white border border-gray-200 rounded-xl shadow-lg z-50" align="start">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Adults</p>
                          <p className="text-xs text-gray-400">Age 12+</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full border-gray-200 flex items-center justify-center p-0"
                            disabled={adultCount <= 1 || adultCount <= infantCount}
                            onClick={() => decrementPassenger("adult")}
                          >
                            -
                          </Button>
                          <span className="w-4 text-center text-sm font-bold">{adultCount}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full border-gray-200 flex items-center justify-center p-0"
                            disabled={adultCount + childCount + infantCount >= 10}
                            onClick={() => incrementPassenger("adult")}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Children</p>
                          <p className="text-xs text-gray-400">Age 2-11</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full border-gray-200 flex items-center justify-center p-0"
                            disabled={childCount <= 0}
                            onClick={() => decrementPassenger("child")}
                          >
                            -
                          </Button>
                          <span className="w-4 text-center text-sm font-bold">{childCount}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full border-gray-200 flex items-center justify-center p-0"
                            disabled={adultCount + childCount + infantCount >= 10}
                            onClick={() => incrementPassenger("child")}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Infants</p>
                          <p className="text-xs text-gray-400">Under 2</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full border-gray-200 flex items-center justify-center p-0"
                            disabled={infantCount <= 0}
                            onClick={() => decrementPassenger("infant")}
                          >
                            -
                          </Button>
                          <span className="w-4 text-center text-sm font-bold">{infantCount}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full border-gray-200 flex items-center justify-center p-0"
                            disabled={adultCount + childCount + infantCount >= 10 || infantCount >= adultCount}
                            onClick={() => incrementPassenger("infant")}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-2 space-y-1">
                        <p className="text-[10px] text-gray-400">
                          • Max 10 passengers total per booking.
                        </p>
                        <p className="text-[10px] text-gray-400">
                          • Number of infants cannot exceed adults.
                        </p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <TabsContent value={tripType} className="mt-0">
                <div className="flex flex-col gap-4">
                  {/* Inputs Row */}
                  <div className="flex flex-col md:flex-row items-end justify-between gap-4 w-full">
                    {/* Left Group: From, Swap, To */}
                    <div className="w-full md:w-[52%] flex items-end gap-3 min-w-0">
                      <div className="flex flex-col flex-1 min-w-0">
                        <Label className="mb-2 flex items-center gap-2">
                          <Plane className="h-4 w-4 shrink-0" />
                          <span className="truncate">From</span>
                        </Label>
                        <Select value={from} onValueChange={setFrom}>
                          <SelectTrigger className="h-12 data-[size=default]:h-12 w-full min-w-0 rounded-xl bg-white border border-gray-200 text-gray-800">
                            <SelectValue placeholder="Select airport" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {airports.map((a) => (
                              <SelectItem key={a.code} value={a.code}>
                                {a.city} ({a.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-center items-end min-w-0 shrink-0 pb-0.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-full bg-white border border-gray-200 shrink-0"
                          onClick={swapAirports}
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <Label className="mb-2 flex items-center gap-2">
                          <Plane className="h-4 w-4 rotate-90 shrink-0" />
                          <span className="truncate">To</span>
                        </Label>
                        <Select value={to} onValueChange={setTo}>
                          <SelectTrigger className="h-12 data-[size=default]:h-12 w-full min-w-0 rounded-xl bg-white border border-gray-200 text-gray-800">
                            <SelectValue placeholder="Select airport" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {airports.map((a) => (
                              <SelectItem key={a.code} value={a.code}>
                                {a.city} ({a.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Right Group: Depart, Return */}
                    <div className="w-full md:w-[42%] flex items-end gap-3 min-w-0">
                      <div className="flex flex-col flex-1 min-w-0">
                        <Label className="mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span className="truncate">Depart</span>
                        </Label>
                        <Input
                          type="date"
                          min={TODAY}
                          value={departDate}
                          onChange={(e) => {
                            setDepartDate(e.target.value);
                            if (returnDate && e.target.value > returnDate)
                              setReturnDate("");
                          }}
                          className="h-12 w-full min-w-0 rounded-xl bg-white border border-gray-200 text-gray-800"
                        />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <Label className="mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span className="truncate">Return</span>
                        </Label>
                        <Input
                          type="date"
                          min={departDate || TODAY}
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          disabled={tripType === "oneway"}
                          className="h-12 w-full min-w-0 rounded-xl bg-white border border-gray-200 text-gray-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Search Button Row */}
                  <div className="w-full pt-1">
                    <Button
                      type="button"
                      onClick={handleSearch}
                      className="h-12 w-full flex items-center justify-center gap-2 rounded-xl bg-[#0b5c66] hover:bg-[#08424a] text-white text-base font-semibold transition-colors"
                    >
                      <Search className="h-5 w-5" />
                      Search Flights
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {[
            { value: "50+", label: "Destinations" },
            { value: "1M+", label: "Happy Travelers" },
            { value: "99%", label: "On-time Flights" },
            { value: "24/7", label: "Customer Support" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary md:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
