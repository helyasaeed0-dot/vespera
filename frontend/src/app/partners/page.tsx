"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthRequiredModal from "@/components/layout/AuthRequiredModal";
import { useUserStore } from "@/store/useUserStore";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import { CheckCircle2, Send, FileSignature, Building2, Globe, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface PartnerItem {
  id: string;
  name: string;
  organization: string;
  category: string;
  date: string;
  description: string;
  website?: string;
  image?: string;
  logo?: string;
}

export default function PartnersPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const user = useUserStore((state) => state.user);
  const { openAuthModal } = useAuthModalStore();

  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    partnershipType: "MOU",
    message: "",
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchPartners() {
      try {
        setLoading(true);
        const res = await api.get<{ partners: any[] }>("/partners");
        if (isMounted && res.success && Array.isArray(res.data?.partners)) {
          const mapped: PartnerItem[] = res.data.partners.map((p: any) => ({
            id: p._id || p.id,
            name: p.name || p.partner || p.company || "Enterprise MOU",
            organization: p.company || p.partner || p.name || "Enterprise Partner",
            category: p.category || "Institutional",
            date: p.date || (p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""),
            description: p.description || p.summary || "Verified enterprise partnership agreement.",
            website: p.website || "",
            image: p.image || p.logo || "",
            logo: p.logo || p.image || "",
          }));
          setPartners(mapped);
        } else if (isMounted) {
          setPartners([]);
        }
      } catch (err) {
        if (isMounted) setPartners([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPartners();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Check authentication FIRST before submission
    if (!user) {
      openAuthModal({
        mode: "signin",
        message: "Please sign in first to submit your partnership proposal.",
      });
      return;
    }

    if (!form.companyName.trim() || !form.contactName.trim() || !form.email.trim() || !form.phone.trim() || !form.message.trim()) {
      setFormError("Please complete all required fields before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/partners/inquiry", {
        companyName: form.companyName.trim(),
        contactName: form.contactName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        partnershipType: form.partnershipType,
        message: form.message.trim(),
      });

      if (res.success) {
        setSubmitted(true);
        setForm({
          companyName: "",
          contactName: "",
          email: "",
          phone: "",
          partnershipType: "MOU",
          message: "",
        });
      } else {
        if (res.message?.includes("authorized") || res.message?.includes("session") || res.message?.includes("token")) {
          setForm({
            companyName: "",
            contactName: "",
            email: "",
            phone: "",
            partnershipType: "MOU",
            message: "",
          });
          setShowAuthModal(true);
        } else {
          setFormError(res.message || "Failed to submit partnership proposal. Please try again.");
        }
      }
    } catch (err: any) {
      setFormError(err.message || "An unexpected network error occurred while submitting your proposal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-8 sm:py-10 md:py-[72px] lg:py-20 bg-slate-900/60 border-b border-slate-800/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 items-center">
            <div className="md:col-span-7 space-y-4 text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-[54px] font-semibold text-white tracking-[-0.02em] leading-[1.12]">
                Partner with Vespera Enterprise
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-[1.55] max-w-xl font-normal">
                We collaborate with manufacturers, institutional partners, and logistics providers to expand market access, streamline distribution, and execute joint ventures.
              </p>
              <div className="pt-2">
                <a
                  href="#inquiry"
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-sm transition-all inline-flex items-center gap-2 shadow-sm"
                >
                  Submit Proposal <Send className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="md:col-span-5 relative">
              <div className="relative h-40 sm:h-52 md:h-[270px] lg:h-[340px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1000"
                  alt="Vespera Corporate Partnership Meeting"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MOU & Alliances Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs sm:text-sm font-semibold text-amber-400 uppercase tracking-widest block">
            Signed Memorandums &amp; Network
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold text-white tracking-[-0.01em] leading-[1.2]">
            Active Institutional Alliances
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse space-y-4">
                <div className="h-5 bg-slate-800 rounded w-1/3" />
                <div className="h-7 bg-slate-800 rounded w-3/4" />
                <div className="h-16 bg-slate-800 rounded w-full" />
                <div className="h-6 bg-slate-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : partners.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <Building2 className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-lg font-semibold text-slate-300">No Institutional Alliances Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No active partner MOUs are currently registered in the database.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {partners.map((p) => (
              <div
                key={p.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-colors group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wide">
                      <FileSignature className="w-3.5 h-3.5" />
                      <span>{p.date || "Active MOU"}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-400 font-bold">
                      {p.category}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight leading-snug group-hover:text-amber-400 transition-colors">
                    {p.name}
                  </h3>

                  <p className="text-sm sm:text-[15px] text-slate-300 leading-[1.65] font-normal">
                    {p.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-400 font-normal">Organization:</span>
                    <span className="font-semibold text-slate-200">{p.organization}</span>
                  </div>

                  {p.website && (
                    <div className="pt-1">
                      <a
                        href={p.website.startsWith("http") ? p.website : `https://${p.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5" /> Visit Official Website <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Partner Inquiry Form Section */}
      <section id="inquiry" className="py-16 lg:py-24 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Partner Inquiry &amp; Proposal Submission
            </h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto font-normal leading-relaxed">
              Submit your corporate profile or proposal brief to Vespera's Business Development team.
            </p>
          </div>

          {submitted ? (
            <div className="p-10 rounded-2xl bg-slate-900 border border-emerald-500/30 text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-white">Inquiry Received</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto font-normal leading-relaxed">
                Thank you. Your partnership request has been submitted successfully. Our VP of Strategic Partnerships will review your brief and schedule an executive briefing.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 sm:p-10 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
              {formError && (
                <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-center gap-2.5">
                  <AlertCircle className="w-4.5 h-4.5 text-red-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-slate-200 font-medium block">
                    Company Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Global Logistics"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-lg px-4 py-3 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-200 font-medium block">
                    Contact Officer Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marcus Sterling"
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-lg px-4 py-3 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-200 font-medium block">
                    Corporate Email <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="marcus@apexlogistics.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-lg px-4 py-3 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-200 font-medium block">
                    Phone Number <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 019-2834"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-lg px-4 py-3 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-200 font-medium block">
                  Partnership Type <span className="text-amber-400">*</span>
                </label>
                <select
                  value={form.partnershipType}
                  onChange={(e) => setForm({ ...form, partnershipType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm font-medium rounded-lg px-4 py-3 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 focus:outline-none transition-all"
                >
                  <option value="MOU">Institutional MOU</option>
                  <option value="Sponsorship">Corporate Sponsorship</option>
                  <option value="Vendor">Retail Supplier &amp; Vendor</option>
                  <option value="Logistics">Cross-Border Logistics</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-200 font-medium block">
                  Proposal Brief &amp; Scope <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Outline proposed joint venture terms, target markets, or product line scope..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-lg px-4 py-3 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 focus:outline-none transition-all leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Submitting Brief...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Strategic Partnership Lead</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Please sign in first to submit the partner form."
      />
    </main>
  );
}
