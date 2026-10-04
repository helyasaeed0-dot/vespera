"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { VesperaMark } from "@/components/ui/VesperaLogo";
import { api } from "@/lib/api";

function AuthCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser, checkAuth } = useUserStore();

  const initialMode =
    searchParams.get("mode") === "signup" ||
    searchParams.get("tab") === "register" ||
    searchParams.get("action") === "signup"
      ? "signup"
      : "signin";

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Sync mode from URL searchParams
  useEffect(() => {
    const requestedMode =
      searchParams.get("mode") === "signup" ||
      searchParams.get("tab") === "register" ||
      searchParams.get("action") === "signup"
        ? "signup"
        : "signin";
    setMode(requestedMode);
  }, [searchParams]);

  // Handle incoming Google OAuth redirect callback
  useEffect(() => {
    const googleToken = searchParams.get("google_token");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      const decodedError = decodeURIComponent(errorParam).replace(/_/g, " ");
      if (
        decodedError.toLowerCase().includes("not configured") ||
        decodedError.toLowerCase().includes("missing") ||
        decodedError.toLowerCase().includes("env")
      ) {
        // Suppress technical backend setup notices from frontend UI
        const params = new URLSearchParams(searchParams.toString());
        params.delete("error");
        const cleanUrl = params.toString() ? `/auth?${params.toString()}` : "/auth";
        router.replace(cleanUrl);
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
          (typeof window !== "undefined" ? sessionStorage.getItem("vespera_auth_redirect") : null) ||
          "/user/dashboard";
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("vespera_auth_redirect");
        }
        setTimeout(() => {
          router.push(destination);
        }, 600);
      });
    }
  }, [searchParams, checkAuth, router]);

  // Redirect if already logged in and not processing callback
  useEffect(() => {
    if (user && !searchParams.get("google_token") && !successMessage) {
      const redirect =
        searchParams.get("redirect") ||
        (typeof window !== "undefined" ? sessionStorage.getItem("vespera_auth_redirect") : null);
      if (redirect) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("vespera_auth_redirect");
        }
        router.push(redirect);
      }
    }
  }, [user, searchParams, successMessage, router]);

  const switchMode = (newMode: "signin" | "signup") => {
    setMode(newMode);
    setErrorMessage("");
    setSuccessMessage("");
    setPassword("");
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("mode", newMode);
    router.replace(`/auth?${currentParams.toString()}`);
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
          setSuccessMessage("Account created successfully! Redirecting...");

          const destination =
            searchParams.get("redirect") ||
            (typeof window !== "undefined" ? sessionStorage.getItem("vespera_auth_redirect") : null) ||
            "/user/dashboard";
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("vespera_auth_redirect");
          }

          setTimeout(() => {
            router.push(destination);
          }, 800);
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
          setSuccessMessage("Signed in successfully! Redirecting...");

          const destination =
            searchParams.get("redirect") ||
            (typeof window !== "undefined" ? sessionStorage.getItem("vespera_auth_redirect") : null) ||
            "/user/dashboard";
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("vespera_auth_redirect");
          }

          setTimeout(() => {
            router.push(destination);
          }, 600);
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

    // Preserve any target redirect in sessionStorage
    const redirect = searchParams.get("redirect");
    if (redirect && typeof window !== "undefined") {
      sessionStorage.setItem("vespera_auth_redirect", redirect);
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    window.location.href = `${apiBase}/auth/google`;
  };

  return (
    <div className="relative w-full max-w-[420px] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 p-6 sm:p-8 space-y-6 z-10 transition-all">
      {/* Brand Logo & Heading - Matching Navbar */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <VesperaMark size={48} />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {mode === "signin" ? "Sign In" : "Create Account"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
          {mode === "signin"
            ? "To sign in to your account, please enter your email and password"
            : "To create your account, please enter your username, email and password"}
        </p>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="leading-relaxed font-medium">{successMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-1.5 text-left">
            <label className="text-xs sm:text-sm font-medium text-slate-300 block">Username</label>
            <input
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
          <label className="text-xs sm:text-sm font-medium text-slate-300 block">Email</label>
          <input
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
      <div className="pt-2 text-center text-xs sm:text-sm text-slate-400 font-normal">
        {mode === "signin" ? (
          <p>
            Don&apos;t have an account yet?{" "}
            <button
              type="button"
              onClick={() => switchMode("signup")}
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
              onClick={() => switchMode("signin")}
              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer transition-colors"
            >
              Sign In
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      <Navbar />

      {/* Soft Ambient Amber Glow matching Navbar theme */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <section className="py-12 sm:py-16 px-4 sm:px-6 flex items-center justify-center relative z-10">
        <Suspense
          fallback={
            <div className="w-full max-w-[420px] rounded-3xl bg-slate-900 border border-slate-800 p-8 flex items-center justify-center min-h-[460px]">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            </div>
          }
        >
          <AuthCard />
        </Suspense>
      </section>

      <Footer />
    </main>
  );
}
