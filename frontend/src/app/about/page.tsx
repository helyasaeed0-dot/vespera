import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { LEADERSHIP } from "@/lib/mockData";
import { Target, Compass, HeartHandshake, ShieldCheck, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About Us | Vespera Enterprise & Strategic Alliances",
  description: "Learn about Vespera's evolution as a diversified business network spanning luxury multi-category retail, institutional MOUs, and global supply chain networks.",
};

export default function AboutPage() {
  const values = [
    {
      title: "Transparency & Governance",
      description: "Rigorous integrity in contract execution, raw material verification, and accountable partner governance across every institutional initiative.",
      icon: ShieldCheck,
    },
    {
      title: "Enterprise Innovation",
      description: "Pioneering hybrid retail technologies, automated logistics nodes, and predictive supply planning to support agile cross-border operations.",
      icon: Target,
    },
    {
      title: "Quality & Consumer Trust",
      description: "Unwavering commitment to certified product safety, authentic craftsmanship, and attentive customer service across all product categories.",
      icon: Compass,
    },
    {
      title: "Collaborative Growth",
      description: "Cultivating long-term strategic alliances and institutional joint ventures that produce shared economic and operational value.",
      icon: HeartHandshake,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      {/* Hero Banner with Integrated Background Image */}
      <section className="relative py-28 lg:py-36 border-b border-slate-800/80 overflow-hidden bg-slate-950">
        {/* Background Image */}
        <Image
          src="/videos/hero-bg.jpg"
          alt="Vespera Corporate Hub Background"
          fill
          className="object-cover z-0 opacity-40 pointer-events-none"
          priority
        />
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/50 z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-80 bg-amber-500/10 blur-[100px] pointer-events-none z-0" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-[-0.02em] leading-[1.15]">
              Bridging retail excellence and{" "}
              <span className="text-amber-400 font-bold drop-shadow-sm">
                strategic partnerships
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-[1.6] max-w-2xl mx-auto font-normal">
              Vespera connects curated multi-category consumer retail with institutional alliances, cross-border supply networks, and sustainable enterprise ventures worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-16 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest block">
                Our Evolution
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold text-white tracking-[-0.01em] leading-[1.2]">
                From curated retail to <span className="text-amber-400 font-semibold">global enterprise infrastructure</span>
              </h2>
              <div className="space-y-4 text-sm sm:text-[15px] text-slate-300 leading-[1.65] font-normal">
                <p>
                  Founded with an ambition to bridge consumer retail excellence with institutional-grade enterprise networks, Vespera has developed into a resilient, multi-market business ecosystem. We operate at the intersection of direct consumer commerce and structured global collaboration, creating lasting value across diverse industries.
                </p>
                <p>
                  Through our premier marketplace, <strong className="text-white font-semibold">Vespera Mart</strong>, we deliver curated collections across Italian tailored apparel, certified organic infant care, precision electronics, and contemporary living essentials. Every collection is managed through vetted international manufacturers adhering to strict material authenticity and quality standards.
                </p>
                <p>
                  Simultaneously, <strong className="text-white font-semibold">Vespera Enterprise</strong> spearheads strategic joint ventures, sovereign distribution agreements, and collaborative memoranda of understanding (MOUs). By connecting resilient cross-border supply chains with institutional partners, we enable streamlined market access and sustainable growth worldwide.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/partners"
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all inline-flex items-center gap-2 group shadow-md shadow-amber-500/10"
                >
                  Explore Strategic Partnerships <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000"
                alt="Vespera Executive Strategy Session"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Core Values */}
      <section className="py-16 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 flex items-center justify-center font-bold text-base">
                01
              </div>
              <h3 className="text-xl font-semibold text-white">Our Mission</h3>
              <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed font-normal">
                To empower modern consumers and global organizations by delivering exceptional retail products, establishing dependable supply channels, and executing high-impact institutional partnerships anchored in transparency and operational excellence.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 text-blue-400 flex items-center justify-center font-bold text-base">
                02
              </div>
              <h3 className="text-xl font-semibold text-white">Our Vision</h3>
              <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed font-normal">
                To establish Vespera as the global benchmark in integrated e-commerce and enterprise alliances—uniting regional markets through ethical sourcing, reliable fulfillment infrastructure, and enduring corporate partnerships.
              </p>
            </div>
          </div>

          <div>
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest block">
                Guiding Principles
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold text-white tracking-[-0.01em] leading-[1.2]">
                Core values shaping <span className="text-amber-400 font-semibold">our enterprise</span>
              </h3>
              <p className="text-sm sm:text-[15px] text-slate-300 max-w-xl mx-auto font-normal leading-[1.55]">
                The fundamental principles guiding every partnership, product selection, and operational decision across our global operations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v) => {
                const Icon = v.icon;
                return (
                  <div
                    key={v.title}
                    className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
                  >
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 w-fit">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-base sm:text-lg font-semibold text-white">{v.title}</h4>
                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                      {v.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Executive Leadership Grid */}
      <section id="leadership" className="py-16 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest block">
              Leadership Team
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold text-white tracking-[-0.01em] leading-[1.2]">
              Guided by seasoned <span className="text-amber-400 font-semibold">industry pioneers</span>
            </h2>
            <p className="text-sm sm:text-[15px] text-slate-300 max-w-xl mx-auto font-normal leading-[1.55]">
              Meet the executive leaders steering Vespera’s strategic expansion, technology innovations, and global partnership portfolios.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {LEADERSHIP.map((member) => (
              <div
                key={member.name}
                className="group rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-64 w-full bg-slate-950 overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-white">{member.name}</h4>
                      <p className="text-xs font-semibold text-amber-400 tracking-wide">{member.role}</p>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                      {member.bio}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-800/80">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-normal text-slate-400 hover:text-amber-400 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 fill-current text-amber-400 shrink-0" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.46 1.46 0 1 0 0 2.92 1.46 1.46 0 0 0 0-2.92Z" />
                      </svg>
                      LinkedIn Profile
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

