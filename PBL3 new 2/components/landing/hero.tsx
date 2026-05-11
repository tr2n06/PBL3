"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Plane, ArrowRightLeft, Calendar, Users, Search } from "lucide-react";

const airports = [
  { code: "JFK", city: "New York", name: "John F. Kennedy International" },
  { code: "LAX", city: "Los Angeles", name: "Los Angeles International" },
  { code: "LHR", city: "London", name: "Heathrow Airport" },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle" },
  { code: "NRT", city: "Tokyo", name: "Narita International" },
  { code: "DXB", city: "Dubai", name: "Dubai International" },
  { code: "SIN", city: "Singapore", name: "Changi Airport" },
  { code: "SYD", city: "Sydney", name: "Sydney Airport" },
];

export function Hero() {
  const router = useRouter();
  const [tripType, setTripType] = useState("roundtrip");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("1");

  const handleSearch = () => {
    const params = new URLSearchParams({
      from,
      to,
      departDate,
      returnDate: tripType === "roundtrip" ? returnDate : "",
      passengers,
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
        <Card className="mx-auto max-w-6xl rounded-[28px] border-0 shadow-2xl">
          <CardContent className="p-6 md:p-8">
            <Tabs
              value={tripType}
              onValueChange={setTripType}
              className="w-full"
            >
              <TabsList className="mb-8 grid h-14 w-full max-w-[400px] grid-cols-2 rounded-2xl bg-slate-100 p-1">
                <TabsTrigger
                  value="roundtrip"
                  className="rounded-xl text-sm font-medium data-[state=active]:shadow-sm"
                >
                  Round Trip
                </TabsTrigger>
                <TabsTrigger
                  value="oneway"
                  className="rounded-xl text-sm font-medium data-[state=active]:shadow-sm"
                >
                  One Way
                </TabsTrigger>
              </TabsList>

              <TabsContent value="roundtrip" className="mt-0">
                <SearchForm
                  from={from}
                  to={to}
                  departDate={departDate}
                  returnDate={returnDate}
                  passengers={passengers}
                  setFrom={setFrom}
                  setTo={setTo}
                  setDepartDate={setDepartDate}
                  setReturnDate={setReturnDate}
                  setPassengers={setPassengers}
                  swapAirports={swapAirports}
                  onSearch={handleSearch}
                  showReturn
                />
              </TabsContent>

              <TabsContent value="oneway" className="mt-0">
                <SearchForm
                  from={from}
                  to={to}
                  departDate={departDate}
                  returnDate={returnDate}
                  passengers={passengers}
                  setFrom={setFrom}
                  setTo={setTo}
                  setDepartDate={setDepartDate}
                  setReturnDate={setReturnDate}
                  setPassengers={setPassengers}
                  swapAirports={swapAirports}
                  onSearch={handleSearch}
                  showReturn={false}
                />
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

interface SearchFormProps {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: string;
  setFrom: (v: string) => void;
  setTo: (v: string) => void;
  setDepartDate: (v: string) => void;
  setReturnDate: (v: string) => void;
  setPassengers: (v: string) => void;
  swapAirports: () => void;
  onSearch: () => void;
  showReturn: boolean;
}

function SearchForm({
  from,
  to,
  departDate,
  returnDate,
  passengers,
  setFrom,
  setTo,
  setDepartDate,
  setReturnDate,
  setPassengers,
  swapAirports,
  onSearch,
  showReturn,
}: SearchFormProps) {
  return (
    <div className="grid grid-cols-12 items-end gap-4">
      <div className="col-span-12 md:col-span-3">
        <Label
          htmlFor="from"
          className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground"
        >
          <Plane className="h-4 w-4" />
          From
        </Label>
        <Select value={from} onValueChange={setFrom}>
          <SelectTrigger id="from" className="h-12 rounded-xl">
            <SelectValue placeholder="Select airport" />
          </SelectTrigger>
          <SelectContent>
            {airports.map((airport) => (
              <SelectItem key={airport.code} value={airport.code}>
                {airport.city} ({airport.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Swap Button */}
      <div className="col-span-12 md:col-span-1 md:pt-7">
        <div className="flex h-12 items-center justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full bg-white shadow-sm"
            onClick={swapAirports}
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span className="sr-only">Swap airports</span>
          </Button>
        </div>
      </div>
      <div className="col-span-12 md:col-span-3">
        <Label
          htmlFor="to"
          className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground"
        >
          <Plane className="h-4 w-4 rotate-90" />
          To
        </Label>
        <Select value={to} onValueChange={setTo}>
          <SelectTrigger id="to" className="h-12 rounded-xl">
            <SelectValue placeholder="Select airport" />
          </SelectTrigger>
          <SelectContent>
            {airports.map((airport) => (
              <SelectItem key={airport.code} value={airport.code}>
                {airport.city} ({airport.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className={
          showReturn ? "col-span-12 md:col-span-2" : "col-span-12 md:col-span-3"
        }
      >
        <Label
          htmlFor="depart"
          className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground"
        >
          <Calendar className="h-4 w-4" />
          Depart
        </Label>
        <Input
          id="depart"
          type="date"
          value={departDate}
          onChange={(e) => setDepartDate(e.target.value)}
          className="h-12 rounded-xl"
        />
      </div>

      {showReturn && (
        <div className="col-span-12 md:col-span-2">
          <Label
            htmlFor="return"
            className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground"
          >
            <Calendar className="h-4 w-4" />
            Return
          </Label>
          <Input
            id="return"
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>
      )}

      <div
        className={
          showReturn ? "col-span-12 md:col-span-1" : "col-span-12 md:col-span-2"
        }
      >
        <Label
          htmlFor="passengers"
          className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground"
        >
          <Users className="h-4 w-4" />
          Guests
        </Label>
        <Select value={passengers} onValueChange={setPassengers}>
          <SelectTrigger id="passengers" className="h-12 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <SelectItem key={n} value={n.toString()}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-12 flex items-end pt-2">
        <Button
          type="button"
          onClick={onSearch}
          className="h-12 w-full gap-2 rounded-xl text-base font-semibold"
          size="lg"
        >
          <Search className="h-5 w-5" />
          Search Flights
        </Button>
      </div>
    </div>
  );
}
