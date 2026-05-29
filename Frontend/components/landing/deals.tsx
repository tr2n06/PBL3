"use client";

import { useEffect, useState } from "react";
import {
  getActivePromotions,
  type ActivePromotionItem,
} from "@/lib/employee-promotions-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane, Clock, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value);

export function Deals() {
  const [promotionFlights, setPromotionFlights] = useState<
    ActivePromotionItem[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const data = await getActivePromotions();
        setPromotionFlights(data);
      } catch (error) {
        console.error("Load active promotions failed:", error);
        setPromotionFlights([]);
      } finally {
        setLoading(false);
      }
    };

    loadPromotions();
  }, []);

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
            Grab these exclusive discounts before they fly away. Book now and
            save big on your next trip!
          </p>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">
            Loading deals...
          </div>
        ) : promotionFlights.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No promotion flights available right now.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {promotionFlights.map((flight) => {
              const discountedPrice = Math.round(
                flight.economyPrice * (1 - (flight.discount || 0) / 100),
              );

              return (
                <Card
                  key={flight.id}
                  className="relative overflow-hidden transition-all hover:shadow-lg"
                >
                  {typeof flight.discount === "number" && flight.discount > 0 && (
                    <div className="absolute right-4 top-4 z-10">
                      <Badge
                        variant="destructive"
                        className="gap-1 text-lg font-bold"
                      >
                        <Tag className="h-4 w-4" />
                        {flight.discount}% OFF
                      </Badge>
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Plane className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {flight.flightNumber}
                      </span>
                      <span className="text-sm">• {flight.airline}</span>
                    </div>

                    <CardTitle className="flex items-center gap-3 text-xl">
                      <span>{flight.departureCity}</span>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      <span>{flight.arrivalCity}</span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="mb-4 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {flight.departureCode}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {flight.departureTime}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {flight.departureDate}
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center">
                        <Clock className="mb-1 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {flight.duration}
                        </span>
                        <div className="mt-1 h-px w-full bg-border" />
                      </div>

                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {flight.arrivalCode}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {flight.arrivalTime}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {flight.arrivalDate}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground line-through">
                          {formatCurrency(flight.economyPrice)} VND
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-primary">
                            {formatCurrency(discountedPrice)} VND
                          </span>
                          <span className="text-sm text-muted-foreground">
                            / person
                          </span>
                        </div>
                      </div>

                      <Button
                        asChild
                        className="bg-[#0b5c66] text-white hover:bg-[#094a52]"
                      >
                        <Link
                          href={`/search?from=${encodeURIComponent(
                            flight.departureCode,
                          )}&to=${encodeURIComponent(
                            flight.arrivalCode,
                          )}&departDate=${encodeURIComponent(
                            flight.departureDate,
                          )}&passengers=1&tripType=oneway`}
                        >
                          Book Now
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/search">View All Flights</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}