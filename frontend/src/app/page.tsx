import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import CounterGrid from "@/components/home/CounterGrid";
import SponsorTicker from "@/components/home/SponsorTicker";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import MOUHighlights from "@/components/home/MOUHighlights";

export const metadata = {
  title: "Vespera Enterprise & Vespera Mart | E-Commerce & Strategic Partnerships",
  description: "Vespera integrates multi-category retail excellence with high-impact institutional partnerships, cross-border supply chains, and workforce creation.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <Navbar />
      <Hero />
      <CounterGrid />
      <SponsorTicker />
      <FeaturedProducts />
      <MOUHighlights />
      <Footer />
    </main>
  );
}
