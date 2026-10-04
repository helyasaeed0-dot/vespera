"use client";

import React, { useState, useEffect, useCallback } from "react";
import { JobListing } from "@/lib/mockData";
import { X, Upload, CheckCircle2, Briefcase, FileCheck, MapPin, Clock, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useUserStore } from "@/store/useUserStore";

interface ApplicationModalProps {
  job: JobListing | null;
  onClose: () => void;
}

export default function ApplicationModal({ job, onClose }: ApplicationModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const user = useUserStore((state) => state.user);

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    linkedinUrl: "",
    coverLetter: "",
    resumeName: "",
  });

  const resetFormState = useCallback(() => {
    setFormData({
      fullName: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      linkedinUrl: "",
      coverLetter: "",
      resumeName: "",
    });
    setResumeFile(null);
    setSubmitted(false);
    setIsClosing(false);
    setLoading(false);
    setErrorMessage("");
  }, [user]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      resetFormState();
    }, 200);
  }, [onClose, resetFormState]);

  // Reset form to clean empty state whenever a job is selected / modal opens
  useEffect(() => {
    if (job) {
      resetFormState();
    }
  }, [job, resetFormState]);

  // Handle body scroll lock & Escape key
  useEffect(() => {
    if (!job) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [job, handleClose]);

  if (!job) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeFile(file);
      setFormData((prev) => ({ ...prev, resumeName: file.name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage("Please sign in first to submit your job application.");
      return;
    }
    setLoading(true);
    setErrorMessage("");

    try {
      const data = new FormData();
      data.append("jobId", (job as any)._id || job.id);
      data.append("fullName", formData.fullName);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("linkedinUrl", formData.linkedinUrl);
      data.append("coverLetter", formData.coverLetter);
      if (resumeFile) {
        data.append("resume", resumeFile);
      }

      const res = await api.post("/applications", data);

      if (res.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(res.message || "Failed to submit application. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md transition-opacity duration-200 ease-out animate-overlay-in ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      aria-modal="true"
      role="dialog"
    >
      {/* Centered Landscape Glassmorphism Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-[880px] max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900/85 backdrop-blur-xl border border-slate-700/60 shadow-2xl shadow-black/80 text-slate-100 p-6 sm:p-8 transition-all duration-200 ease-out animate-modal-in ${
          isClosing ? "opacity-0 translate-y-2 scale-[0.98]" : "opacity-100"
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer z-10"
          style={{ cursor: "pointer" }}
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-10 space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">Application Received!</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your resume and application for{" "}
              <strong className="text-amber-400 font-semibold">{job.title}</strong> have been
              logged. Our talent team will review your profile and contact you shortly.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-md"
                style={{ cursor: "pointer" }}
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Modal Header: Job Meta Information */}
            <div className="border-b border-slate-800/80 pb-4 pr-8">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-amber-400 border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> {job.department}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium bg-slate-800/60 px-2 py-0.5 rounded-md">
                  <Clock className="w-3 h-3 text-slate-400" /> {job.type}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium bg-slate-800/60 px-2 py-0.5 rounded-md">
                  <MapPin className="w-3 h-3 text-amber-400" /> {job.location}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Apply for {job.title}
              </h2>
            </div>

            {/* Landscape Two-Column Grid for Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* Left Column: Personal & Contact Information */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm text-slate-200 font-medium block">
                    Full Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-xl px-4 py-2.5 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm text-slate-200 font-medium block">
                    Email Address <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-xl px-4 py-2.5 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm text-slate-200 font-medium block">
                    Phone Number <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-xl px-4 py-2.5 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm text-slate-200 font-medium block">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedinUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, linkedinUrl: e.target.value }))
                    }
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-xl px-4 py-2.5 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Right Column: Resume / CV Upload & Cover Letter */}
              <div className="space-y-4">
                {/* Resume / CV Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm text-slate-200 font-medium block">
                    Resume / CV Upload (PDF or DOCX, max 5MB) <span className="text-amber-400">*</span>
                  </label>
                  <label
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 hover:bg-slate-950/90 hover:border-amber-500/60 cursor-pointer text-slate-300 hover:text-amber-400 transition-all text-sm group"
                    style={{ cursor: "pointer" }}
                  >
                    {formData.resumeName ? (
                      <div className="flex items-center gap-2 text-emerald-400 font-medium truncate max-w-full">
                        <FileCheck className="w-5 h-5 shrink-0" />
                        <span className="truncate">{formData.resumeName}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                        <span className="font-medium text-xs sm:text-sm text-slate-300 group-hover:text-white transition-colors">
                          Click to upload CV file
                        </span>
                        <span className="text-[11px] text-slate-500">PDF, DOCX up to 5MB</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      required={!formData.resumeName}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Cover Letter Brief */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm text-slate-200 font-medium block">
                    Cover Letter Brief
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Briefly describe why you are the best fit for this role at Vespera..."
                    value={formData.coverLetter}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, coverLetter: e.target.value }))
                    }
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-xl px-4 py-2.5 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 focus:outline-none transition-all leading-relaxed resize-none"
                  />
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-400 order-2 sm:order-1">
                <span className="text-amber-400">*</span> Required fields for evaluation
              </span>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer order-1 sm:order-2 disabled:opacity-50"
                style={{ cursor: "pointer" }}
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
