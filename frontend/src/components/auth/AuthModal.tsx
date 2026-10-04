"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { X, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import { useUserStore } from "@/store/useUserStore";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { VesperaMark } from "@/components/ui/VesperaLogo";
import { api } from "@/lib/api";

export default function AuthModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isOpen, mode, message, onSuccess, closeAuthModal, setMode } = useAuthModalStore();
  const { setUser, checkAuth } = useUserStore();
  const shouldReduceMotion = useReducedMotion();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const firstInputRef = useRef<HTMLInputElement>(null);

  // Animation variants adhering strictly to specifications
  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.28, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.22, ease: "easeIn" },
    },
  };

  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.95,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.28, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.95,
      transition: { duration: 0.22, ease: "easeIn" },
    },
  };

  // Handle incoming Google OAuth redirect callback
  useEffect(() => {
    const googleToken = searchParams.get("google_token");
    const errorParam = searchParams.get("error");

    if (errorParam && isOpen) {
      const decodedError = decodeURIComponent(errorParam).replace(/_/g, " ");
      if (
        decodedError.toLowerCase().includes("not configured") ||
        decodedError.toLowerCase().includes("missing") ||
        decodedError.toLowerCase().includes("env")
      ) {
        return;
      }
      setErrorMessage(decodedError);
    } else if (googleToken) {
      if (typeof window !== "undefined") {
        localStorage.setItem("vespera_access_token", googleToken);
      }
      setSuccessMessage("Signed in with Google successfully!");
      checkAuth().then(() => {
        const destination =
          searchParams.get("redirect") ||
          (typeof window !== "undefined" ? sessionStorage.getItem("vespera_auth_redirect") : null);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("vespera_auth_redirect");
        }
        setTimeout(() => {
          closeAuthModal();
          if (destination && destination !== pathname) {
            router.push(destination);
          }
        }, 500);
      });
    }
  }, [searchParams, checkAuth, closeAuthModal, pathname, router, isOpen]);

  // Reset form errors and fields when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      setSuccessMessage("");
      setPassword("");
      // Autofocus first input
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 120);
    }
  }, [isOpen, mode]);

  // Handle ESC key to close modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeAuthModal();
      }
    },
    [isOpen, closeAuthModal]
  );

  // Lock body scroll while modal is open, restore cleanly on close/unmount without page jump
  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen, handleKeyDown]);

  const handleSwitchMode = (newMode: "signin" | "signup") => {
    setMode(newMode);
    setErrorMessage("");
    setSuccessMessage("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Frontend validation
    if (mode === "signup" && !username.trim()) {
      setErrorMessage("Please enter a username.");
      return;
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    if (mode === "signup" && password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const res = await api.post("/auth/register", {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
        });

        if (res.success && res.data?.user) {
          setPassword("");
          setUser(res.data.user);
          setSuccessMessage("Account created successfully!");

          if (onSuccess) {
            try {
              onSuccess();
            } catch {
              // ignore
            }
          }

          setTimeout(() => {
            closeAuthModal();
          }, 600);
        } else {
          setErrorMessage(res.message || "Failed to create account. Please check your details.");
        }
      } else {
        const res = await api.post("/auth/login", {
          email: email.trim().toLowerCase(),
          password,
        });

        if (res.success && res.data?.user) {
          setPassword("");
          setUser(res.data.user);
          setSuccessMessage("Signed in successfully!");

          if (onSuccess) {
            try {
              onSuccess();
            } catch {
              // ignore
            }
          }

          setTimeout(() => {
            closeAuthModal();
          }, 500);
        } else {
          setErrorMessage(res.message || "Invalid credentials. Please verify your email and password.");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (loading || googleLoading) return;
    setGoogleLoading(true);
    setErrorMessage("");

    // Preserve current full path in sessionStorage so Google callback redirects back here
    if (typeof window !== "undefined") {
      const currentQuery = searchParams.toString();
      const returnUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;
      sessionStorage.setItem("vespera_auth_redirect", returnUrl);
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    window.location.href = `${apiBase}/auth/google`;
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="auth-modal-portal"
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          {/* Dark / Navy Transparent Backdrop with Smooth Fade & Blur (Matching Navbar theme) */}
          <motion.div
            key="auth-modal-backdrop"
            variants={backdropVariants}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
            onClick={closeAuthModal}
            aria-hidden="true"
          />

          {/* Centered Sign In / Sign Up Card (Matching Navbar styling, borders, and amber accents) */}
          <motion.div
            key="auth-modal-card"
            variants={cardVariants}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[420px] my-auto max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 p-6 sm:p-8 space-y-6 text-slate-100 z-10 custom-scrollbar"
          >
            {/* Close Button at Top-Right */}
            <button
              type="button"
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Brand Logo & Heading - Matching Navbar Logo & Accent */}
            <div className="text-center space-y-2 pt-1">
              <div className="flex justify-center">
                <VesperaMark size={48} />
              </div>
              <h2 id="auth-modal-title" className="text-2xl font-bold text-white tracking-tight">
                {mode === "signin" ? "Sign In" : "Create Account"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
                {message
                  ? message
                  : mode === "signin"
                  ? "To sign in to your account, please enter your email and password"
                  : "To create your account, please enter your username, email and password"}
              </p>
            </div>

            {/* Error / Success Alerts */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="leading-relaxed font-medium">{successMessage}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5 text-left">
                  <label className="text-xs sm:text-sm font-medium text-slate-300 block">
                    Username
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="e.g. alexander"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading || googleLoading}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition-all font-normal"
                  />
                </div>
              )}

              <div className="space-y-1.5 text-left">
                <label className="text-xs sm:text-sm font-medium text-slate-300 block">
                  Email
                </label>
                <input
                  ref={mode === "signin" ? firstInputRef : undefined}
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || googleLoading}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition-all font-normal"
                />
              </div>

              <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || googleLoading}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
              />

              {/* Submit Button - Matching Navbar Amber Button Theme */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:from-amber-600 active:to-amber-700 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed pt-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{mode === "signin" ? "Signing In..." : "Creating Account..."}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === "signin" ? "Sign In" : "Sign Up"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="w-full border-t border-slate-800" />
              <span className="bg-slate-900 px-3 text-xs uppercase tracking-wider text-slate-500 font-medium absolute select-none">
                or
              </span>
            </div>

            {/* Continue with Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
              className="w-full py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 hover:border-slate-600 text-slate-200 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-3 shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.86c2.26-2.09 3.685-5.17 3.685-9.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.37 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Switch Mode Links - Matching Navbar Amber Accent */}
            <div className="pt-1 text-center text-xs sm:text-sm text-slate-400 font-normal">
              {mode === "signin" ? (
                <p>
                  Don&apos;t have an account yet?{" "}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("signup")}
                    className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer transition-colors"
                  >
                    Create Account
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("signin")}
                    className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer transition-colors"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
