"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane, Clock, Tag, ArrowRight } from "lucide-react";
import { mockFlights } from "@/lib/mock-data";
import type { Flight } from "@/lib/types";
import { GuestBookingModal } from "./guest-booking-modal";
import Link from "next/link";

type TicketClass = "economy" | "business" | "firstClass";

export function Deals() {
  const promotionFlights = mockFlights.filter((flight) => flight.isPromotion);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedClass, setSelectedClass] = useState<TicketClass>("economy");

  const handleBookNow = (flight: Flight) => {
    setSelectedFlight(flight);
    setSelectedClass("economy");
  };

  return (
    <section id="deals" className="bg-secondary/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <Badge variant="destructive" className="mb-4">
            Limited Time Offers
          </Badge>
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Hot Deals for You
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
            Grab these exclusive discounts before they fly away. Book now and save big on your next trip!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {promotionFlights.map((flight) => (
            <Card key={flight.id} className="relative overflow-hidden transition-all hover:shadow-lg">
              {flight.discount && (
                <div className="absolute right-4 top-4 z-10">
                  <Badge variant="destructive" className="gap-1 text-lg font-bold">
                    <Tag className="h-4 w-4" />
                    {flight.discount}% OFF
                  </Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Plane className="h-4 w-4" />
                  <span className="text-sm font-medium">{flight.flightNumber}</span>
                  <span className="text-sm">• {flight.airline}</span>
                </div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span>{flight.departure.city}</span>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <span>{flight.arrival.city}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{flight.departure.code}</div>
                    <div className="text-sm text-muted-foreground">{flight.departure.time}</div>
                    <div className="text-xs text-muted-foreground">{flight.departure.date}</div>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <Clock className="mb-1 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{flight.duration}</span>
                    <div className="mt-1 h-px w-full bg-border" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{flight.arrival.code}</div>
                    <div className="text-sm text-muted-foreground">{flight.arrival.time}</div>
                    <div className="text-xs text-muted-foreground">{flight.arrival.date}</div>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    {flight.discount && (
                      <div className="text-sm text-muted-foreground line-through">
                        ${flight.price.economy}
                      </div>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-primary">
                        ${Math.round(flight.price.economy * (1 - (flight.discount || 0) / 100))}
                      </span>
                      <span className="text-sm text-muted-foreground">/ person</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleBookNow(flight)}
                    className="bg-[#0b5c66] hover:bg-[#094a52] text-white"
                  >
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/search">View All Flights</Link>
          </Button>
        </div>
      </div>

      {/* Guest Booking Modal */}
      {selectedFlight && (
        <GuestBookingModal
          flight={selectedFlight}
          initialClass={selectedClass}
          onClose={() => setSelectedFlight(null)}
        />
      )}
    </section>
  );
}
