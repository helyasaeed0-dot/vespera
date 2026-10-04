"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import AuthRequiredModal from "@/components/layout/AuthRequiredModal";
import { formatCurrency } from "@/lib/utils";
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight } from "lucide-react";

export default function CartDrawer() {
  const { isOpen, closeCart, items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const user = useUserStore((state) => state.user);
  const { openAuthModal } = useAuthModalStore();
  const [animatingOutId, setAnimatingOutId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  const handleRemove = (id: string) => {
    setAnimatingOutId(id);
    setTimeout(() => {
      removeItem(id);
      setAnimatingOutId(null);
    }, 280);
  };

  const subtotal = getSubtotal();
  const shippingThreshold = 100;
  const progressToFreeShipping = Math.min((subtotal / shippingThreshold) * 100, 100);
  const amountNeeded = Math.max(0, shippingThreshold - subtotal);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Fade In / Fade Out */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
            onClick={closeCart}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
            {/* Sidebar Slide In / Slide Out */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-amber-500/10 text-amber-400">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight text-white">Your Cart</h2>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-800 text-amber-400">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                </div>
                <button
                  onClick={closeCart}
                  className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close Shopping Cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Bar */}
              <div className="px-6 py-3 bg-slate-800/40 border-b border-slate-800">
                {amountNeeded > 0 ? (
                  <p className="text-xs sm:text-[13px] text-slate-300 font-normal leading-relaxed">
                    Add <span className="font-semibold text-amber-400">{formatCurrency(amountNeeded)}</span> more for <span className="text-emerald-400 font-semibold">Free Express Shipping</span>
                  </p>
                ) : (
                  <p className="text-xs sm:text-[13px] text-emerald-400 font-semibold tracking-wide flex items-center gap-1.5">
                    Qualified for Free Express Shipping
                  </p>
                )}
                <div className="w-full bg-slate-800 h-1.5 rounded-md mt-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-500"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>

              {/* Cart Items list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-500">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-base font-normal text-slate-300">Your shopping cart is empty</p>
                      <p className="text-xs text-slate-500 mt-1 font-normal">Explore Vespera Mart catalog to add products.</p>
                    </div>
                    <button
                      onClick={() => {
                        closeCart();
                        router.push("/shop");
                      }}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium rounded-lg transition-all text-sm shadow-sm cursor-pointer"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  items.map((item) => {
                    const activePrice = item.salePrice ?? item.price;
                    const isRemoving = animatingOutId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`flex gap-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 group hover:border-slate-700 transition-all duration-300 ${
                          isRemoving ? "opacity-0 scale-95 translate-x-4 max-h-0 py-0 overflow-hidden" : "opacity-100 max-h-36"
                        }`}
                      >
                        <div className="relative w-20 h-20 rounded-md overflow-hidden bg-slate-800 shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-sm font-medium text-slate-100 line-clamp-1">
                                {item.title}
                              </h4>
                              <button
                                onClick={() => handleRemove(item.id)}
                                className="text-slate-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            {/* Compact Rectangular Quantity Control */}
                            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-md px-2 py-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="text-slate-400 hover:text-amber-400 transition-colors p-0.5 cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-semibold text-slate-200 min-w-[20px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="text-slate-400 hover:text-amber-400 transition-colors p-0.5 cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-semibold text-amber-400">
                                {formatCurrency(activePrice * item.quantity)}
                              </span>
                              {item.salePrice && (
                                <span className="text-xs text-slate-500 line-through block font-normal">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer calculation & CTA */}
              {items.length > 0 && (
                <div className="p-6 border-t border-slate-800 bg-slate-950/80 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal</span>
                      <span className="text-slate-200 font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Estimated Shipping</span>
                      <span className="text-emerald-400 font-medium">
                        {subtotal >= 100 ? "FREE" : "$15.00"}
                      </span>
                    </div>
                    <div className="border-t border-slate-800 pt-2 flex justify-between text-base font-semibold">
                      <span className="text-slate-100">Total</span>
                      <span className="text-amber-400">{formatCurrency(subtotal >= 100 ? subtotal : subtotal + 15)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Link
                      href="/cart"
                      onClick={closeCart}
                      className="w-full py-3 px-4 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium text-sm text-center transition-colors flex items-center justify-center gap-2"
                    >
                      View Cart
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        if (!user) {
                          openAuthModal({
                            mode: "signin",
                            message: "Please sign in first to proceed with checkout.",
                            onSuccess: () => {
                              closeCart();
                              router.push("/checkout");
                            },
                          });
                          return;
                        }
                        closeCart();
                        router.push("/checkout");
                      }}
                      className="w-full py-3 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-sm text-center shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Checkout <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Please sign in first to proceed with checkout."
      />
    </AnimatePresence>
  );
}

