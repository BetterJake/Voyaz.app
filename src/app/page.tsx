import Hero from "@/components/Hero";
import Countries from "@/components/Countries";
import HottestTrips from "@/components/HottestTrips";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <Countries />
      <HottestTrips />
      <Features />
      <Footer />
    </main>
  );
}
