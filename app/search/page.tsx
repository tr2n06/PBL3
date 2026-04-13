'use client'

import { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Plane, Clock, ArrowRight, Filter, Tag, Users } from 'lucide-react'
import { mockFlights } from '@/lib/mock-data'
import type { Flight, TicketClass } from '@/lib/types'

function SearchPageContent() {
  const searchParams = useSearchParams()
  const [priceRange, setPriceRange] = useState([0, 3500])
  const [selectedClass, setSelectedClass] = useState<TicketClass>('economy')
  const [showPromotionsOnly, setShowPromotionsOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price')

  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')

  const filteredFlights = useMemo(() => {
    let flights = [...mockFlights]

    // Filter by promotion
    if (showPromotionsOnly) {
      flights = flights.filter((f) => f.isPromotion)
    }

    // Filter by price
    flights = flights.filter((f) => {
      const price = f.price[selectedClass]
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Filter by route if params exist
    if (fromParam) {
      flights = flights.filter((f) => 
        f.departure.code === fromParam || 
        f.departure.city.toLowerCase().includes(fromParam.toLowerCase())
      )
    }
    if (toParam) {
      flights = flights.filter((f) => 
        f.arrival.code === toParam || 
        f.arrival.city.toLowerCase().includes(toParam.toLowerCase())
      )
    }

    // Sort
    flights.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price[selectedClass] - b.price[selectedClass]
        case 'duration':
          return parseInt(a.duration) - parseInt(b.duration)
        case 'departure':
          return a.departure.time.localeCompare(b.departure.time)
        default:
          return 0
      }
    })

    return flights
  }, [priceRange, selectedClass, showPromotionsOnly, sortBy, fromParam, toParam])

  const getPrice = (flight: Flight) => {
    const basePrice = flight.price[selectedClass]
    if (flight.discount) {
      return Math.round(basePrice * (1 - flight.discount / 100))
    }
    return basePrice
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary/20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-8 text-3xl font-bold">Search Flights</h1>

          <div className="grid gap-8 lg:grid-cols-4">
            {/* Filters Sidebar */}
            <Card className="h-fit lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Class Selection */}
                <div className="space-y-2">
                  <Label>Ticket Class</Label>
                  <Select value={selectedClass} onValueChange={(v) => setSelectedClass(v as TicketClass)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="firstClass">First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                  <Label>Price Range</Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={3500}
                    step={50}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Price (Low to High)</SelectItem>
                      <SelectItem value="duration">Duration (Shortest)</SelectItem>
                      <SelectItem value="departure">Departure Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Promotions Only */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="promotions"
                    checked={showPromotionsOnly}
                    onCheckedChange={(checked) => setShowPromotionsOnly(checked === true)}
                  />
                  <label
                    htmlFor="promotions"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show deals only
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Flight Results */}
            <div className="space-y-4 lg:col-span-3">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {filteredFlights.length} flights found
                </p>
              </div>

              {filteredFlights.length === 0 ? (
                <Card className="p-8 text-center">
                  <Plane className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No flights found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters to see more results.
                  </p>
                </Card>
              ) : (
                filteredFlights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    selectedClass={selectedClass}
                    price={getPrice(flight)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function FlightCard({
  flight,
  selectedClass,
  price,
}: {
  flight: Flight
  selectedClass: TicketClass
  price: number
}) {
  const classLabels = {
    economy: 'Economy',
    business: 'Business',
    firstClass: 'First Class',
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Flight Info */}
          <div className="flex-1 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Plane className="h-4 w-4 text-primary" />
              <span className="font-medium">{flight.flightNumber}</span>
              <span className="text-sm text-muted-foreground">• {flight.airline}</span>
              {flight.isPromotion && (
                <Badge variant="destructive" className="ml-2 gap-1">
                  <Tag className="h-3 w-3" />
                  {flight.discount}% OFF
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{flight.departure.code}</div>
                <div className="text-lg">{flight.departure.time}</div>
                <div className="text-sm text-muted-foreground">{flight.departure.city}</div>
                <div className="text-xs text-muted-foreground">{flight.departure.date}</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <Clock className="mb-1 h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{flight.duration}</span>
                <div className="mt-2 flex w-full items-center gap-1">
                  <div className="h-px flex-1 bg-border" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="h-px flex-1 bg-border" />
                </div>
                <span className="mt-1 text-xs text-muted-foreground">Direct</span>
              </div>
              <div>
                <div className="text-2xl font-bold">{flight.arrival.code}</div>
                <div className="text-lg">{flight.arrival.time}</div>
                <div className="text-sm text-muted-foreground">{flight.arrival.city}</div>
                <div className="text-xs text-muted-foreground">{flight.arrival.date}</div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{flight.seatsAvailable[selectedClass]} seats left</span>
              </div>
              <span>•</span>
              <span>{classLabels[selectedClass]}</span>
            </div>
          </div>

          {/* Price & Book */}
          <div className="flex flex-col items-center justify-center border-t bg-secondary/30 p-6 md:border-l md:border-t-0">
            {flight.discount && (
              <div className="text-sm text-muted-foreground line-through">
                ${flight.price[selectedClass]}
              </div>
            )}
            <div className="text-3xl font-bold text-primary">${price}</div>
            <div className="mb-4 text-sm text-muted-foreground">per person</div>
            <Button asChild className="w-full">
              <Link href={`/booking/${flight.id}?class=${selectedClass}`}>Select</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}
