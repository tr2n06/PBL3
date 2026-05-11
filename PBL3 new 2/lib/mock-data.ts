import type { Destination } from "./types";

// Mock Destinations for Landing Page only.
// This data is intentionally local because the landing destination cards
// are static UI content and do not need to call the backend API.

export const mockDestinations: Destination[] = [
  {
    id: "dest-1",
    city: "Ho Chi Minh City",
    country: "Vietnam",
    image: "/HCM.jpg",
    description: "The city of lights",
    startingPrice: 2000000,
  },
  {
    id: "dest-2",
    city: "Da Nang",
    country: "Vietnam",
    image: "/danang.jpg",
    description: "Where tradition meets innovation",
    startingPrice: 3000000,
  },
  {
    id: "dest-3",
    city: "Bangkok",
    country: "Thailand",
    image: "/Bangkok.jpg",
    description: "Luxury in the desert",
    startingPrice: 4500000,
  },
  {
    id: "dest-4",
    city: "Ha Noi",
    country: "Vietnam",
    image: "/Hanoi.jpg",
    description: "Historic capital city",
    startingPrice: 2500000,
  },
  {
    id: "dest-5",
    city: "Hoi An",
    country: "Vietnam",
    image: "/Hoian.jpg",
    description: "Historic charm and modern culture",
    startingPrice: 3500000,
  },
  {
    id: "dest-6",
    city: "Phu Quoc",
    country: "Vietnam",
    image: "/phuquoc.jpg",
    description: "The city that never sleeps",
    startingPrice: 4000000,
  },
];