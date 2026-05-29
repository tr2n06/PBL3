"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const heroImages = ["https://i.pinimg.com/1200x/8c/5c/84/8c5c84bb07f7a59185822e69c2a18a07.jpg", "/hero-2.jpg", "/hero-3.jpg"];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[420px] w-full">
        {heroImages.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={src}
              alt={`Hero banner ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black/35" />
          </div>
        ))}

        <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
          <div className="max-w-4xl text-white">
            <h1 className="text-4xl font-bold md:text-6xl">
              Your Journey Begins Here
            </h1>
            <p className="mt-4 text-lg md:text-2xl">
              Discover amazing destinations and book your next adventure with
              SkyLine Airways.
            </p>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-3 w-3 rounded-full ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
