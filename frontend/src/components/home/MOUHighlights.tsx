"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar, Building2 } from "lucide-react";
import { api } from "@/lib/api";
import { getImageUrl } from "@/lib/utils";

interface MOUItem {
  id: string;
  title: string;
  partner: string;
  category: string;
  date: string;
  summary: string;
  image?: string;
}

export default function MOUHighlights() {
  const [highlights, setHighlights] = useState<MOUItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchHighlights() {
      try {
        setLoading(true);
        const res = await api.get<{ partners: any[] }>("/partners");
        if (isMounted && res.success && Array.isArray(res.data?.partners)) {
          const mapped: MOUItem[] = res.data.partners.slice(0, 3).map((p: any) => ({
            id: p._id || p.id,
            title: p.name || p.partner || p.company || "Institutional MOU Agreement",
            partner: p.company || p.partner || p.name || "Enterprise Partner",
            category: p.category || "Institutional",
            date: p.date || (p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Active"),
            summary: p.description || p.summary || "Strategic enterprise collaboration and institutional commitment.",
            image: p.image || p.logo || "",
          }));
          setHighlights(mapped);
        } else if (isMounted) {
          setHighlights([]);
        }
      } catch (err) {
        if (isMounted) setHighlights([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchHighlights();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-16 bg-slate-900/40 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold text-white tracking-[-0.01em] leading-[1.2]">
              Recent institutional <span className="text-amber-400 font-semibold">MOU agreements</span>
            </h2>
            <p className="text-sm sm:text-[15px] text-slate-300 mt-1 max-w-xl font-normal leading-[1.55]">
              Key joint ventures, supply chain expansions, and institutional sustainability commitments with global partners.
            </p>
          </div>

          <Link
            href="/partners"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors group"
          >
            View All Signed MOUs &amp; Partners
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse p-6 space-y-4">
                <div className="h-28 bg-slate-800 rounded-xl" />
                <div className="h-5 bg-slate-800 rounded w-1/2" />
                <div className="h-4 bg-slate-800 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : highlights.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <Building2 className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400">No active institutional MOU agreements registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlights.map((mou) => {
              const imageUrl = mou.image ? getImageUrl(mou.image) : "";
              return (
                <div
                  key={mou.id}
                  className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={mou.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-600">
                        <Building2 className="w-12 h-12 text-slate-600" />
                        <span className="text-[11px] font-mono font-semibold text-slate-500">{mou.partner}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    
                    {/* Category Tag */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/90 border border-slate-800 text-amber-400 font-bold text-[11px]">
                      {mou.category}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{mou.date}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-300">{mou.partner}</span>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                        {mou.title}
                      </h3>

                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                        {mou.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80">
                      <Link
                        href="/partners"
                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        Read Memorandum Details <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
