"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plane, Clock, Luggage } from "lucide-react"
import type { Flight } from "@/lib/types"

interface FlightCardProps {
  flight: Flight
  onSelect?: (flight: Flight) => void
  showSelectButton?: boolean
}

export function FlightCard({ flight, onSelect, showSelectButton = true }: FlightCardProps) {
  const formatTime = (time: string) => time
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Flight Info */}
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary">{flight.flightNumber}</span>
                <span className="text-sm text-muted-foreground">{flight.airline}</span>
              </div>
              {flight.isPromotion && (
                <Badge variant="destructive" className="animate-pulse">
                  {flight.discount}% OFF
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Departure */}
              <div className="text-center">
                <div className="text-2xl font-bold">{formatTime(flight.departure.time)}</div>
                <div className="text-sm font-medium">{flight.departure.code}</div>
                <div className="text-xs text-muted-foreground">{flight.departure.city}</div>
                <div className="text-xs text-muted-foreground">{formatDate(flight.departure.date)}</div>
              </div>

              {/* Flight Duration */}
              <div className="flex-1 flex flex-col items-center">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {flight.duration}
                </div>
                <div className="w-full flex items-center gap-2 my-2">
                  <div className="h-px flex-1 bg-border" />
                  <Plane className="h-4 w-4 text-primary rotate-90" />
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="text-xs text-muted-foreground">Direct</div>
              </div>

              {/* Arrival */}
              <div className="text-center">
                <div className="text-2xl font-bold">{formatTime(flight.arrival.time)}</div>
                <div className="text-sm font-medium">{flight.arrival.code}</div>
                <div className="text-xs text-muted-foreground">{flight.arrival.city}</div>
                <div className="text-xs text-muted-foreground">{formatDate(flight.arrival.date)}</div>
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Luggage className="h-3 w-3" />
                <span>Cabin: 7kg</span>
              </div>
              <span>|</span>
              <span>{flight.seatsAvailable.economy + flight.seatsAvailable.business + flight.seatsAvailable.firstClass} seats left</span>
            </div>
          </div>

          {/* Price & Select */}
          <div className="flex md:flex-col items-center justify-between md:justify-center gap-4 p-4 bg-muted/30 md:w-48">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">From</div>
              <div className="flex items-baseline gap-1">
                {flight.isPromotion && flight.discount && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${flight.price.economy}
                  </span>
                )}
                <span className="text-2xl font-bold text-primary">
                  ${flight.isPromotion && flight.discount 
                    ? Math.round(flight.price.economy * (1 - flight.discount / 100))
                    : flight.price.economy
                  }
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Economy</div>
            </div>
            {showSelectButton && (
              <Button onClick={() => onSelect?.(flight)} className="w-full md:w-auto">
                Select
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
