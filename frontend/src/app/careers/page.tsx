"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ApplicationModal from "@/components/careers/ApplicationModal";
import AuthRequiredModal from "@/components/layout/AuthRequiredModal";
import { useUserStore } from "@/store/useUserStore";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import { JobListing } from "@/lib/mockData";
import { MapPin, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

function JobCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="h-6 bg-slate-800 rounded-md w-28" />
        <div className="h-5 bg-slate-800 rounded-md w-20" />
      </div>
      <div className="h-6 bg-slate-800 rounded w-3/4" />
      <div className="flex gap-4">
        <div className="h-4 bg-slate-800 rounded w-24" />
        <div className="h-4 bg-slate-800 rounded w-20" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-800 rounded w-full" />
        <div className="h-3 bg-slate-800 rounded w-5/6" />
        <div className="h-3 bg-slate-800 rounded w-4/5" />
      </div>
      <div className="pt-4 border-t border-slate-800/80">
        <div className="h-10 bg-slate-800 rounded-xl w-full" />
      </div>
    </div>
  );
}

export default function CareersPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const user = useUserStore((state) => state.user);
  const { openAuthModal } = useAuthModalStore();

  // Restore selected job intent after login if user was redirected
  useEffect(() => {
    if (user && jobs.length > 0) {
      try {
        const pendingJobId = sessionStorage.getItem("vespera_pending_job_id");
        if (pendingJobId) {
          sessionStorage.removeItem("vespera_pending_job_id");
          const matched = jobs.find((j) => j.id === pendingJobId);
          if (matched) {
            setSelectedJob(matched);
          }
        }
      } catch {}
    }
  }, [user, jobs]);

  useEffect(() => {
    let isMounted = true;
    async function loadCareers() {
      try {
        setLoading(true);
        setError(false);
        const res = await api.get<{ careers: any[] }>("/careers");
        if (isMounted && res.success && res.data?.careers) {
          const formatted = res.data.careers.map((c: any) => ({
            id: c._id || c.id,
            title: c.title,
            department: c.department,
            location: c.location,
            type: c.employmentType || c.type || "Full-Time",
            salary: c.salaryRange || c.salary || "Competitive",
            description: c.description,
            requirements: c.requirements || [],
            responsibilities: c.responsibilities || [],
            experience: c.experience || "2+ years",
            postedAt: c.postedAt || "Recently",
          }));
          setJobs(formatted);
        } else if (isMounted) {
          setError(true);
        }
      } catch {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCareers();
    return () => { isMounted = false; };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      {/* Clean Premium Careers Hero */}
      <section className="relative py-8 sm:py-10 md:py-[72px] lg:py-20 bg-slate-900/60 border-b border-slate-800/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 items-center">
            <div className="md:col-span-7 space-y-4 text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-[54px] font-semibold text-white tracking-[-0.02em] leading-[1.12]">
                Build your next chapter with us
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-[1.55] max-w-xl font-normal">
                Join a team bridging retail e-commerce, global supply networks, and long-term enterprise partnerships. We value clear thinking, fast execution, and practical problem solving.
              </p>
            </div>

            <div className="md:col-span-5 relative">
              <div className="relative h-44 sm:h-52 md:h-[270px] lg:h-[340px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000"
                  alt="Vespera Team Workplace"
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

      {/* Open Positions Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-slate-800/80 pb-6 gap-4">
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold text-white tracking-[-0.01em] leading-[1.2]">
              Open Career Opportunities
            </h2>
            <p className="text-sm sm:text-[15px] text-slate-300 font-normal leading-[1.55]">
              Explore live listings across engineering, retail, BD, and brand marketing.
            </p>
          </div>
          {!loading && (
            <span className="text-xs sm:text-sm font-semibold text-amber-400 border border-amber-500/20 px-3.5 py-1.5 rounded-lg bg-slate-900 w-fit shrink-0">
              {jobs.length} {jobs.length === 1 ? "Position" : "Positions"} Available
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <p className="text-slate-400 text-sm">Unable to load job listings. Please try again later.</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <p className="text-slate-400 text-sm">No open positions at this time. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start">
                    <span className="text-xs sm:text-sm font-semibold text-amber-400 border border-slate-800 bg-slate-950 px-2.5 py-1 rounded-md">
                      {job.department}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4 text-slate-400" /> {job.type}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-semibold text-white group-hover:text-amber-400 transition-colors tracking-tight">
                    {job.title}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-amber-400" /> {job.location}
                    </span>
                    <span>•</span>
                    <span>Experience: {job.experience}</span>
                  </div>

                  <p className="text-sm sm:text-[15px] text-slate-300 leading-[1.65] font-normal">
                    {job.description}
                  </p>

                  {job.requirements && job.requirements.length > 0 ? (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider">
                        Key Requirements:
                      </h4>
                      <ul className="space-y-2 text-sm text-slate-300 leading-relaxed font-normal">
                        {job.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="text-amber-400 font-extrabold shrink-0 mt-0.5 select-none">→</span>
                            <span className="flex-1 text-slate-200">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <p className="text-xs text-slate-400 italic">Requirements not specified.</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!user) {
                        try {
                          sessionStorage.setItem("vespera_pending_job_id", job.id);
                        } catch {}
                        openAuthModal({
                          mode: "signin",
                          message: "Please sign in first to apply for this position.",
                          onSuccess: () => {
                            setSelectedJob(job);
                          },
                        });
                        return;
                      }
                      setSelectedJob(job);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    style={{ cursor: "pointer" }}
                  >
                    Apply Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Application Modal */}
      <ApplicationModal job={selectedJob} onClose={() => setSelectedJob(null)} />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Please sign in first to apply for this position."
      />

      <Footer />
    </main>
  );
}
