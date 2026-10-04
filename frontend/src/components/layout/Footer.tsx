"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ShieldCheck, Truck, RefreshCw, Headset, CheckCircle2 } from "lucide-react";
import VesperaLogo from "@/components/ui/VesperaLogo";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-300">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand & Social */}
          <div className="space-y-4">
            <VesperaLogo size="md" subtitle="ENTERPRISE" />
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Vespera connects curated retail products with institutional partnerships and international supply chains.
            </p>

            {/* Newsletter Form */}
            <div className="pt-2">
              <h5 className="text-xs font-medium text-slate-200 mb-2">
                Subscribe to Vespera Updates
              </h5>
              {subscribed ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Thank you for subscribing!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-400 placeholder:text-sm text-sm rounded-lg pl-3.5 pr-10 py-2.5 focus:outline-none focus:border-amber-500/80 transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-slate-700 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.46 1.46 0 1 0 0 2.92 1.46 1.46 0 0 0 0-2.92Z" />
                </svg>
              </a>

              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-slate-700 flex items-center justify-center transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-slate-700 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.5C10 7.01 11.49 5.65 13.7 5.65c1.06 0 2.17.19 2.17.19v2.38h-1.22c-1.23 0-1.62.77-1.62 1.56V12h2.68l-.43 3h-2.25v6.8c4.56-.93 8-4.96 8-9.8z" />
                </svg>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-slate-700 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Vespera Mart */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white">Vespera Mart</h4>
            <ul className="space-y-2.5 text-sm text-slate-400 font-normal">
              <li>
                <Link href="/shop?category=baby-care-nursery" className="hover:text-amber-400 transition-colors">
                  Baby Care &amp; Nursery
                </Link>
              </li>
              <li>
                <Link href="/shop?category=mens-formalwear-suits" className="hover:text-amber-400 transition-colors">
                  Men's Suits &amp; Apparel
                </Link>
              </li>
              <li>
                <Link href="/shop?category=womens-apparel-accessories" className="hover:text-amber-400 transition-colors">
                  Women's Designer Wear
                </Link>
              </li>
              <li>
                <Link href="/shop?category=tech-smart-accessories" className="hover:text-amber-400 transition-colors">
                  Tech &amp; Smart Accessories
                </Link>
              </li>
              <li>
                <Link href="/shop?category=health-personal-care" className="hover:text-amber-400 transition-colors">
                  Health &amp; Personal Care
                </Link>
              </li>
              <li>
                <Link href="/shop?category=home-living" className="hover:text-amber-400 transition-colors">
                  Home &amp; Living Decor
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Corporate */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white">Corporate</h4>
            <ul className="space-y-2.5 text-sm text-slate-400 font-normal">
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  About Vespera Enterprise
                </Link>
              </li>
              <li>
                <Link href="/partners" className="hover:text-amber-400 transition-colors">
                  MOUs &amp; Strategic Alliances
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-amber-400 transition-colors">
                  Careers &amp; Talent Portal
                </Link>
              </li>
              <li>
                <Link href="/about#leadership" className="hover:text-amber-400 transition-colors">
                  Executive Leadership
                </Link>
              </li>
              <li>
                <Link href="/partners#inquiry" className="hover:text-amber-400 transition-colors">
                  Partner Lead Submission
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Support & Legal */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white">Support &amp; Legal</h4>
            <ul className="space-y-2.5 text-sm text-slate-400 font-normal">
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Help Center &amp; FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Privacy Policy &amp; Data Security
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Terms of Service &amp; MOU Compliance
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Return &amp; Refund Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Global Shipping Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Vespera Enterprise Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Security Certified ISO-27001</span>
            <span>Stripe Encrypted</span>
            <span>PostgreSQL &amp; Next.js 14</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
