import { Header } from "@/components/landing/header";
import HeroSlider from "@/components/landing/hero-slider";
import { Hero } from "@/components/landing/hero";
import { Destinations } from "@/components/landing/destinations";
import { Deals } from "@/components/landing/deals";
import { Contact } from "@/components/landing/contact";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSlider />
        <Hero />
        <Destinations />
        <Deals />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
