"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/mockData";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { formatCurrency, getImageUrl, FALLBACK_PRODUCT_IMAGE } from "@/lib/utils";
import { Star, Heart, ShoppingBag, Eye, Check, Loader2 } from "lucide-react";
import AuthRequiredModal from "@/components/layout/AuthRequiredModal";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import { api } from "@/lib/api";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const user = useUserStore((state) => state.user);
  const { openAuthModal } = useAuthModalStore();

  const activePrice = product.salePrice ?? product.price;
  const discountPercent = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : null;

  const rawPrimary = product.images && product.images.length > 0 ? product.images[0] : null;
  const rawSecondary = product.images && product.images.length > 1 ? product.images[1] : rawPrimary;

  const primaryImage = getImageUrl(rawPrimary, FALLBACK_PRODUCT_IMAGE);
  const secondaryImage = getImageUrl(rawSecondary, primaryImage);
  const currentImage = imgError ? FALLBACK_PRODUCT_IMAGE : (isHovered ? secondaryImage : primaryImage);

  const performAddToCart = async () => {
    setIsLoading(true);
    try {
      const productId = product.id || (product as any)._id;
      const res = await api.post("/cart/add", {
        productId,
        quantity: 1,
        selectedColor: product.color || (product.colors ? product.colors[0] : ""),
        selectedSize: product.sizes ? product.sizes[0] : "",
      });

      if (res.success) {
        addItem({
          id: productId,
          title: product.title,
          slug: product.slug,
          price: product.price,
          salePrice: product.salePrice,
          image: currentImage,
          selectedColor: product.color || (product.colors ? product.colors[0] : undefined),
          selectedSize: product.sizes ? product.sizes[0] : undefined,
        });
        setAddedAnimation(true);
        setTimeout(() => setAddedAnimation(false), 1500);
      } else if (res.message?.includes("authorized") || res.message?.includes("session") || res.message?.includes("token")) {
        openAuthModal({
          mode: "signin",
          message: "Please sign in first to add products to your cart.",
          onSuccess: performAddToCart,
        });
      }
    } catch {
      openAuthModal({
        mode: "signin",
        message: "Please sign in first to add products to your cart.",
        onSuccess: performAddToCart,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check authentication first
    if (!user) {
      openAuthModal({
        mode: "signin",
        message: "Please sign in first to add products to your cart.",
        onSuccess: performAddToCart,
      });
      return;
    }

    await performAddToCart();
  };

  return (
    <>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300 shadow-xl flex flex-col justify-between"
      >
        {/* Product Image Box */}
        <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
          <Link href={`/shop/${product.slug}`} className="block relative w-full h-full">
            <Image
              src={currentImage}
              alt={product.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-all duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {discountPercent && (
              <span className="px-2.5 py-1 rounded-lg bg-red-500 text-white font-black text-[11px] shadow-md">
                -{discountPercent}% OFF
              </span>
            )}
            {product.isNewArrival && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-extrabold text-[11px] shadow-md">
                NEW
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
            className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-colors z-10 ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-slate-900/70 text-slate-300 hover:text-red-400 hover:bg-slate-900"
            }`}
            aria-label="Add to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
          </button>

          {/* Quick View Hover overlay */}
          <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none z-10">
            <Link
              href={`/shop/${product.slug}`}
              className="pointer-events-auto px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 text-slate-100 font-bold text-xs backdrop-blur-md transition-all flex items-center gap-1.5 shadow-lg"
            >
              <Eye className="w-3.5 h-3.5" /> Quick View
            </Link>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <Link href={`/shop/${product.slug}`}>
              <h3 className="text-base font-medium text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-2 leading-[1.35]">
                {product.title}
              </h3>
            </Link>
            {/* Category & Review Information on Same Line */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-normal mt-1.5 flex-wrap">
              <span>{product.category}</span>
              {(product.color || (product.colors && product.colors.length > 0)) && (
                <>
                  <span>·</span>
                  <span className="text-amber-400 font-medium">{product.color || product.colors?.[0]}</span>
                </>
              )}
              <span>·</span>
              {product.reviewCount && product.reviewCount > 0 ? (
                <>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3 h-3 fill-current inline-block" />
                    <span className="text-slate-200 font-medium">{product.rating}</span>
                  </span>
                  <span className="text-slate-500">({product.reviewCount})</span>
                </>
              ) : (
                <span className="text-slate-500 italic">No reviews yet</span>
              )}
            </div>
          </div>

          {/* Price & Add to Cart button */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <div>
              <span className="text-base font-semibold text-white">
                {formatCurrency(activePrice)}
              </span>
              {product.salePrice && (
                <span className="text-xs text-slate-500 line-through block font-normal">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className={`px-3.5 py-2 rounded-md font-medium text-sm transition-all flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer disabled:opacity-50 ${
                addedAnimation
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10"
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : addedAnimation ? (
                <>
                  <Check className="w-4 h-4" /> Added
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Please sign in first to add products to your cart."
      />
    </>
  );
}
