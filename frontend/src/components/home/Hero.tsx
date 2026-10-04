"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, ShoppingBag, ShieldCheck, Award, Globe } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-28 lg:py-36 border-b border-slate-800/80">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/videos/hero-bg.jpg"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-45 scale-105 pointer-events-none transition-opacity duration-1000"
      >
        <source src="/videos/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay & Ambient Depth Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40 z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-96 bg-amber-500/10 blur-[120px] pointer-events-none z-0" />

      {/* Hero Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="space-y-5">
          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-[-0.02em] leading-[1.15]">
            Modern solutions and{" "}
            <span className="text-amber-400 font-bold drop-shadow-sm">
              premium products
            </span>{" "}
            for global markets.
          </h1>

          {/* Copy */}
          <p className="text-base sm:text-lg text-slate-300 leading-[1.6] max-w-2xl mx-auto font-normal">
            Vespera connects quality retail products with institutional partnerships and global supply chains.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-base transition-all flex items-center justify-center gap-2 group shadow-lg shadow-amber-500/20"
            >
              <ShoppingBag className="w-5 h-5" />
              Shop Vespera Mart
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/partners"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 backdrop-blur-md font-semibold text-base transition-all flex items-center justify-center gap-2"
            >
              Become a Partner
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
