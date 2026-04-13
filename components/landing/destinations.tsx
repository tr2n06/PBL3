import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { mockDestinations } from "@/lib/mock-data";

export function Destinations() {
  return (
    <section id="destinations" className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">
            Popular Destinations
          </Badge>
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Explore Amazing Places
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
            Discover our most popular destinations and start planning your next
            unforgettable journey.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockDestinations.map((destination) => (
            <Card
              key={destination.id}
              className="group overflow-hidden transition-all hover:shadow-lg"
            >
              <CardContent className="p-0">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={destination.image}
                    alt={destination.city}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">{destination.city}</span>
                    </div>
                    <span className="text-sm text-white/80">
                      {destination.country}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="mb-2 text-sm text-muted-foreground">
                    {destination.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-muted-foreground">From</span>
                    <span className="text-xl font-bold text-primary">
                      {destination.startingPrice.toLocaleString("vi-VN")} VND
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
