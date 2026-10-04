"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import AuthRequiredModal from "@/components/layout/AuthRequiredModal";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, ShieldCheck } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const user = useUserStore((state) => state.user);
  const { openAuthModal } = useAuthModalStore();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [removingIds, setRemovingIds] = useState<string[]>([]);

  const subtotal = getSubtotal();
  const shippingFee = subtotal >= 100 ? 0 : 15;
  const grandTotal = Math.max(0, subtotal - discount + shippingFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === "VESPERA10") {
      setDiscount(subtotal * 0.1);
      setCouponApplied(true);
    } else {
      alert("Invalid promo code. Try 'VESPERA10' for 10% off!");
    }
  };

  const handleRemove = (id: string) => {
    if (removingIds.includes(id)) return;
    setRemovingIds((prev) => [...prev, id]);

    setTimeout(() => {
      removeItem(id);
      setRemovingIds((prev) => prev.filter((itemId) => itemId !== id));
    }, 380);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <section className="relative border-b border-slate-800/80 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">Your Shopping Cart</h1>
            <p className="text-xs text-slate-400 font-normal hidden sm:block">Review items before proceeding to multi-step checkout.</p>
          </div>
          {items.length > 0 && (
            <span className="text-xs sm:text-sm text-slate-400 font-normal">
              Showing <span className="text-white font-medium">{items.length}</span> {items.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="p-16 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 max-w-xl mx-auto"
          >
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Your cart is currently empty</h2>
            <p className="text-sm text-slate-300 font-normal leading-relaxed">Discover premium items in our Vespera Mart catalog.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-sm cursor-pointer"
            >
              Explore Products
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Items Table */}
            <div className="lg:col-span-8">
              {items.map((item) => {
                const activePrice = item.salePrice ?? item.price;
                const isRemoving = removingIds.includes(item.id);
                return (
                  <motion.div
                    key={item.id}
                    layout="position"
                    animate={
                      isRemoving
                        ? {
                            opacity: 0,
                            scale: 0.96,
                            height: 0,
                            marginBottom: 0,
                            transition: {
                              opacity: { duration: 0.22, ease: "easeOut" },
                              scale: { duration: 0.22, ease: "easeOut" },
                              height: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
                              marginBottom: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
                            },
                          }
                        : {
                            opacity: 1,
                            scale: 1,
                            height: "auto",
                            marginBottom: 16,
                          }
                    }
                    style={{ overflow: "hidden" }}
                  >
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800/80">
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-white line-clamp-1 tracking-tight">{item.title}</h4>
                          {(item.selectedColor || item.selectedSize) && (
                            <div className="text-xs sm:text-[13px] text-slate-400 mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-normal">
                              {item.selectedColor && (
                                <span>
                                  Color: <span className="text-slate-300 font-medium">{item.selectedColor}</span>
                                </span>
                              )}
                              {item.selectedSize && (
                                <span>
                                  Size: <span className="text-slate-300 font-medium">{item.selectedSize}</span>
                                </span>
                              )}
                            </div>
                          )}
                          <span className="text-xs sm:text-sm font-semibold text-amber-400 mt-1.5 block">
                            {formatCurrency(activePrice)} each
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        {/* Slightly larger quantity box */}
                        <div className="flex items-center gap-2.5 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-slate-400 hover:text-amber-400 transition-colors p-1 cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-semibold text-slate-200 min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-slate-400 hover:text-amber-400 transition-colors p-1 cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <span className="text-base sm:text-lg font-semibold text-white tracking-tight">
                            {formatCurrency(activePrice * item.quantity)}
                          </span>
                        </div>

                        {/* Slightly larger delete icon with cursor: pointer */}
                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={isRemoving}
                          className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Summary & Coupon */}
            <div className="lg:col-span-4 space-y-6">
              {/* Coupon Form */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" /> Coupon Code
                </label>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. VESPERA10"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-lg px-3.5 py-2.5 uppercase focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 focus:outline-none transition-all font-medium"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-sm rounded-lg transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
                {couponApplied && (
                  <p className="text-xs sm:text-sm text-emerald-400 font-semibold">10% discount applied!</p>
                )}
              </div>

              {/* Order Calculation Box */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm sm:text-base font-semibold text-white uppercase tracking-wider">Order Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span className="font-normal">Subtotal</span>
                    <span className="text-slate-200 font-semibold text-sm sm:text-[15px]">{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Promo Discount</span>
                      <span className="text-sm sm:text-[15px]">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span className="font-normal">Shipping Fee</span>
                    <span className="text-emerald-400 font-semibold text-sm sm:text-[15px]">
                      {shippingFee === 0 ? "FREE" : formatCurrency(shippingFee)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex justify-between text-base sm:text-lg font-semibold">
                    <span className="text-white">Grand Total</span>
                    <span className="text-amber-400 font-bold">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      openAuthModal({
                        mode: "signin",
                        message: "Please sign in first to proceed with checkout.",
                        onSuccess: () => {
                          router.push("/checkout");
                        },
                      });
                      return;
                    }
                    router.push("/checkout");
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-base text-center shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
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
