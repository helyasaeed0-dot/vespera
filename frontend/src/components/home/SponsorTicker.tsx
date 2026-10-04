"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { getImageUrl } from "@/lib/utils";

interface Sponsor {
  name: string;
  logo?: string;
}

export default function SponsorTicker() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchSponsors() {
      try {
        const res = await api.get<{ partners: any[] }>("/partners");
        if (isMounted && res.success && Array.isArray(res.data?.partners) && res.data.partners.length > 0) {
          const mapped: Sponsor[] = res.data.partners.map((p: any) => ({
            name: p.company || p.partner || p.name || "Enterprise Partner",
            logo: p.logo || p.image || "",
          }));
          setSponsors(mapped);
        } else if (isMounted) {
          setSponsors([]);
        }
      } catch (err) {
        if (isMounted) setSponsors([]);
      }
    }

    fetchSponsors();
    return () => {
      isMounted = false;
    };
  }, []);

  if (sponsors.length === 0) return null;

  const doubleLogos = [...sponsors, ...sponsors, ...sponsors, ...sponsors];

  return (
    <section className="py-10 bg-slate-950 border-b border-slate-800 overflow-hidden">
      <div className="relative w-full flex overflow-x-hidden group">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee space-x-8 whitespace-nowrap py-2">
          {doubleLogos.map((sponsor, idx) => {
            const logoUrl = sponsor.logo ? getImageUrl(sponsor.logo) : "";
            return (
              <div
                key={`${sponsor.name}-${idx}`}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 font-extrabold tracking-wider text-sm hover:text-amber-400 transition-colors cursor-pointer"
              >
                {logoUrl ? (
                  <div className="relative w-5 h-5 rounded overflow-hidden">
                    <Image src={logoUrl} alt={sponsor.name} fill className="object-contain" />
                  </div>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                )}
                <span>{sponsor.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
