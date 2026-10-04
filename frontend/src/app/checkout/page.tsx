"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthRequiredModal from "@/components/layout/AuthRequiredModal";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import { formatCurrency } from "@/lib/utils";
import {
  Check,
  CreditCard,
  Truck,
  MapPin,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  PackageCheck,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";

export default function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const user = useUserStore((state) => state.user);
  const { openAuthModal } = useAuthModalStore();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Form State
  const [address, setAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("express");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cod">("stripe");
  const [cardDetails, setCardDetails] = useState({
    number: "4242 •••• •••• 4242",
    expiry: "12/28",
    cvc: "888",
  });

  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const subtotal = getSubtotal();
  const shippingFee = shippingMethod === "express" ? (subtotal >= 100 ? 0 : 20) : 10;
  const totalAmount = subtotal + shippingFee;

  // Check auth on mount and on user change
  useEffect(() => {
    if (!user) {
      openAuthModal({
        mode: "signin",
        message: "Please sign in first to complete your checkout.",
      });
    }
  }, [user, openAuthModal]);

  // Validate required address fields for step 1
  const validateAddressFields = (): boolean => {
    const errors: Record<string, string> = {};

    if (!address.fullName.trim()) errors.fullName = "Full name is required.";
    if (!address.email.trim()) errors.email = "Email address is required.";
    if (!address.street.trim()) errors.street = "Street address is required.";
    if (!address.city.trim()) errors.city = "City is required.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();

    // Always check auth before any checkout action
    if (!user) {
      openAuthModal({
        mode: "signin",
        message: "Please sign in first to complete your checkout.",
      });
      return;
    }

    if (step === 1) {
      if (!validateAddressFields()) {
        setCheckoutError("Please complete all required fields before continuing.");
        return;
      }
      setCheckoutError("");
      setFieldErrors({});
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      // Final validation before order
      if (!validateAddressFields()) {
        setCheckoutError("Please go back and complete all required shipping fields.");
        return;
      }

      if (items.length === 0) {
        setCheckoutError("Your cart is empty. Please add items before checkout.");
        return;
      }

      setLoading(true);
      setCheckoutError("");
      try {
        let stripePaymentIntentId = null;
        if (paymentMethod === "stripe") {
          const piRes = await api.post("/payments/create-payment-intent", {
            items: items.map((i) => ({
              productId: i.id,
              id: i.id,
              title: i.title,
              quantity: i.quantity,
            })),
            shippingMethod,
          });
          if (piRes.success && piRes.data?.paymentIntentId) {
            stripePaymentIntentId = piRes.data.paymentIntentId;
          } else if (!piRes.success) {
            if (piRes.message?.includes("authorized") || piRes.message?.includes("session") || piRes.message?.includes("token")) {
              setShowAuthModal(true);
              setLoading(false);
              return;
            }
            setCheckoutError(piRes.message || "Payment processing failed. Please try again.");
            setLoading(false);
            return;
          }
        }

        const res = await api.post("/orders", {
          items: items.map((i) => ({
            id: i.id,
            title: i.title,
            slug: i.slug,
            quantity: i.quantity,
            selectedColor: i.selectedColor,
            selectedSize: i.selectedSize,
            image: i.image,
          })),
          shippingAddress: {
            fullName: address.fullName,
            email: address.email,
            phone: address.phone,
            street: address.street,
            city: address.city,
            postalCode: address.postalCode,
            country: address.country,
          },
          shippingMethod,
          paymentMethod: paymentMethod.toLowerCase(),
          stripePaymentIntentId,
        });

        if (res.success && res.data?.order) {
          setOrderId(res.data.order.orderId || res.data.order._id || `VES-${Math.floor(100000 + Math.random() * 900000)}`);
          setStep(4);
          clearCart();
        } else {
          if (res.message?.includes("authorized") || res.message?.includes("session") || res.message?.includes("token")) {
            setShowAuthModal(true);
          } else {
            setCheckoutError(res.message || "Order could not be placed. Please check your details.");
          }
        }
      } catch (err: any) {
        setCheckoutError(err.message || "Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const getFieldErrorClass = (field: string) =>
    fieldErrors[field] ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/60" : "border-slate-800 focus:border-amber-500/80 focus:ring-amber-500/80";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <section className="py-8 bg-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Vespera Enterprise Checkout</h1>

          {/* Stepper Header */}
          <div className="flex items-center justify-center gap-2 sm:gap-6 mt-6 text-xs sm:text-sm font-semibold tracking-wide">
            {[
              { num: 1, label: "Address", icon: MapPin },
              { num: 2, label: "Shipping", icon: Truck },
              { num: 3, label: "Payment", icon: CreditCard },
              { num: 4, label: "Confirmation", icon: CheckCircle2 },
            ].map((s) => {
              const Icon = s.icon;
              const isActive = step === s.num;
              const isDone = step > s.num;
              const isClickable = isDone && step < 4;

              return (
                <div
                  key={s.num}
                  onClick={() => {
                    if (isClickable) setStep(s.num as 1 | 2 | 3);
                  }}
                  className={`flex items-center gap-2 ${isClickable ? "cursor-pointer" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isDone
                        ? "bg-emerald-500 text-slate-950 font-bold"
                        : isActive
                        ? "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                  </div>
                  <span
                    className={`hidden sm:inline ${
                      isActive ? "text-amber-400 font-semibold" : isDone ? "text-emerald-400 font-semibold" : "text-slate-500 font-normal"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 4 ? (
          /* Step 4: Order Confirmation */
          <div className="p-8 sm:p-12 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <PackageCheck className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs sm:text-[13px] font-semibold text-emerald-400 uppercase tracking-widest block">
                Payment Successful &amp; Order Dispatched
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Thank You for Your Order!</h2>
              <p className="text-sm sm:text-[15px] text-slate-300 font-normal leading-relaxed max-w-lg mx-auto">
                An email receipt and tracking invoice has been dispatched to{" "}
                <strong className="text-slate-100 font-medium">{address.email}</strong>.
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-xl bg-slate-950 border border-slate-800 max-w-lg mx-auto text-left space-y-4 text-sm sm:text-[15px] shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <span className="text-slate-400 font-normal">Order Reference:</span>
                <span className="font-semibold text-amber-400 tracking-wide">{orderId}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <span className="text-slate-400 font-normal">Shipping Address:</span>
                <span className="font-semibold text-slate-200">{address.street}, {address.city}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <span className="text-slate-400 font-normal">Payment Gateway:</span>
                <span className="font-semibold text-slate-200 uppercase tracking-wide">{paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center pt-1.5">
                <span className="text-slate-100 font-semibold text-base sm:text-lg">Amount Paid:</span>
                <span className="text-amber-400 font-bold text-lg sm:text-xl tracking-tight">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link
                href="/user/dashboard"
                className="px-6 py-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors cursor-pointer inline-flex items-center justify-center"
              >
                Track in My Dashboard
              </Link>
              <Link
                href="/shop"
                className="px-6 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-md cursor-pointer inline-flex items-center justify-center"
              >
                Return to Vespera Mart
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleNextStep} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Form Box */}
            <div className="lg:col-span-8 p-6 sm:p-8 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-400" /> Step 1: Shipping Address &amp; Contact
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-200 mb-1.5 block">Full Name <span className="text-amber-400">*</span></label>
                      <input
                        type="text"
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        className={`w-full bg-slate-950 text-slate-100 placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm font-normal focus:ring-1 focus:outline-none transition-all border ${getFieldErrorClass("fullName")}`}
                      />
                      {fieldErrors.fullName && <p className="text-xs text-red-400 mt-1">{fieldErrors.fullName}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-200 mb-1.5 block">Email Address <span className="text-amber-400">*</span></label>
                      <input
                        type="email"
                        value={address.email}
                        onChange={(e) => setAddress({ ...address, email: e.target.value })}
                        className={`w-full bg-slate-950 text-slate-100 placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm font-normal focus:ring-1 focus:outline-none transition-all border ${getFieldErrorClass("email")}`}
                      />
                      {fieldErrors.email && <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-sm font-semibold text-slate-200 mb-1.5 block">Street Address <span className="text-amber-400">*</span></label>
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        className={`w-full bg-slate-950 text-slate-100 placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm font-normal focus:ring-1 focus:outline-none transition-all border ${getFieldErrorClass("street")}`}
                      />
                      {fieldErrors.street && <p className="text-xs text-red-400 mt-1">{fieldErrors.street}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-200 mb-1.5 block">City <span className="text-amber-400">*</span></label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className={`w-full bg-slate-950 text-slate-100 placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm font-normal focus:ring-1 focus:outline-none transition-all border ${getFieldErrorClass("city")}`}
                      />
                      {fieldErrors.city && <p className="text-xs text-red-400 mt-1">{fieldErrors.city}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-200 mb-1.5 block">Postal Code</label>
                      <input
                        type="text"
                        value={address.postalCode}
                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                        placeholder="10001"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm font-normal focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-200 mb-1.5 block">Phone</label>
                      <input
                        type="tel"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm font-normal focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-200 mb-1.5 block">Country</label>
                      <input
                        type="text"
                        value={address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                        placeholder="United States"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm font-normal focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight flex items-center gap-2">
                    <Truck className="w-5 h-5 text-amber-400" /> Step 2: Shipping Method
                  </h3>

                  <div className="space-y-3">
                    <label
                      onClick={() => setShippingMethod("express")}
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                        shippingMethod === "express"
                          ? "bg-amber-500/10 border-amber-500 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border border-amber-500 flex items-center justify-center shrink-0">
                          {shippingMethod === "express" && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                        </div>
                        <div>
                          <p className="text-sm sm:text-[15px] font-semibold text-white tracking-tight">Express Air Courier (2-3 Business Days)</p>
                          <p className="text-xs sm:text-[13px] text-slate-300 font-normal mt-0.5 leading-relaxed">Guaranteed priority dispatch with live GPS tracking.</p>
                        </div>
                      </div>
                      <span className="text-sm sm:text-base font-semibold text-amber-400 shrink-0 ml-3">
                        {subtotal >= 100 ? "FREE" : "$20.00"}
                      </span>
                    </label>

                    <label
                      onClick={() => setShippingMethod("standard")}
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                        shippingMethod === "standard"
                          ? "bg-amber-500/10 border-amber-500 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border border-amber-500 flex items-center justify-center shrink-0">
                          {shippingMethod === "standard" && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                        </div>
                        <div>
                          <p className="text-sm sm:text-[15px] font-semibold text-white tracking-tight">Standard Ground Shipping (5-7 Business Days)</p>
                          <p className="text-xs sm:text-[13px] text-slate-300 font-normal mt-0.5 leading-relaxed">Reliable regional freight delivery.</p>
                        </div>
                      </div>
                      <span className="text-sm sm:text-base font-semibold text-amber-400 shrink-0 ml-3">$10.00</span>
                    </label>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-400" /> Step 3: Payment Gateway
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("stripe")}
                      className={`p-4 rounded-lg border text-left font-semibold text-sm transition-all cursor-pointer ${
                        paymentMethod === "stripe"
                          ? "bg-amber-500/10 border-amber-500 text-amber-400"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                      }`}
                    >
                      <CreditCard className="w-6 h-6 mb-2 text-amber-400" /> Stripe Credit Card Elements
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-4 rounded-lg border text-left font-semibold text-sm transition-all cursor-pointer ${
                        paymentMethod === "cod"
                          ? "bg-amber-500/10 border-amber-500 text-amber-400"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                      }`}
                    >
                      <DollarSign className="w-6 h-6 mb-2 text-amber-400" /> Cash on Delivery (COD)
                    </button>
                  </div>

                  {paymentMethod === "stripe" ? (
                    <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3 text-sm">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="font-semibold text-xs sm:text-[13px]">Stripe 256-Bit Encrypted Form</span>
                        <Lock className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-200 block mb-1.5">Card Number</label>
                        <input
                          type="text"
                          readOnly
                          value={cardDetails.number}
                          className="w-full bg-slate-900 border border-slate-800 text-slate-100 font-mono rounded-lg px-3.5 py-2.5 text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-300 font-normal leading-relaxed">
                      You will pay <strong className="font-semibold text-amber-400">{formatCurrency(totalAmount)}</strong> in cash upon courier delivery.
                    </div>
                  )}
                </div>
              )}

              {/* Checkout Error */}
              {checkoutError && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((step - 1) as 1 | 2)}
                    className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                ) : <div />}

                <button
                  type="submit"
                  disabled={loading}
                  className="px-7 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-sm sm:text-base shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {step === 3 ? (loading ? "Processing Order..." : "Complete Order & Pay") : "Continue to Next Step"}{" "}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Summary */}
            <div className="lg:col-span-4 p-6 sm:p-7 rounded-xl bg-slate-900 border border-slate-800 shadow-xl shadow-slate-950/40 space-y-5 h-fit">
              <h4 className="text-base sm:text-lg font-semibold text-white tracking-tight pb-3.5 border-b border-slate-800/80">
                Order Summary ({items.length} {items.length === 1 ? "item" : "items"})
              </h4>

              <div className="space-y-3.5 max-h-72 sm:max-h-80 overflow-y-auto pr-1.5">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3.5 text-sm">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-slate-800/80">
                      <Image src={item.image} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white line-clamp-2 text-sm leading-snug">{item.title}</p>
                      <p className="text-xs sm:text-[13px] text-slate-400 font-normal mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-amber-400 text-sm sm:text-base shrink-0 text-right">
                      {formatCurrency((item.salePrice ?? item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800/80 space-y-3 text-sm">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-normal">Subtotal</span>
                  <span className="text-slate-200 font-semibold text-sm sm:text-[15px]">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-normal">Shipping</span>
                  <span className="text-emerald-400 font-semibold text-sm sm:text-[15px]">
                    {shippingFee === 0 ? "FREE" : formatCurrency(shippingFee)}
                  </span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between items-center p-3.5 sm:p-4 rounded-lg bg-slate-950/80 border border-slate-800/80 shadow-sm">
                    <span className="text-base sm:text-lg font-semibold text-white">Total</span>
                    <span className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </section>

      <Footer />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Please sign in first to proceed with checkout."
      />
    </main>
  );
}
