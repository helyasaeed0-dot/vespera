"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { api } from "@/lib/api";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import AuthRequiredModal from "@/components/layout/AuthRequiredModal";
import {
  Star,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ChevronRight,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  UserCheck,
  Sparkles,
  Send,
  Edit3,
  X,
} from "lucide-react";

export default function SingleProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "reviews">("specs");
  const [added, setAdded] = useState(false);

  // Dynamic Reviews & Eligibility State
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 5.0,
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>,
  });
  const [eligibility, setEligibility] = useState<{
    canReview: boolean;
    hasPurchased: boolean;
    alreadyReviewed: boolean;
    existingReview: any;
    orderIdString?: string;
  }>({
    canReview: false,
    hasPurchased: false,
    alreadyReviewed: false,
    existingReview: null,
  });

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const addItem = useCartStore((state) => state.addItem);
  const user = useUserStore((state) => state.user);
  const { openAuthModal } = useAuthModalStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      try {
        setLoading(true);
        setError(false);
        const res = await api.get(`/products/${resolvedParams.slug}`);
        if (isMounted && res.success && res.data?.product) {
          const p = res.data.product;

          let normalizedImages: Array<{ url: string; color: string }> = [];
          if (Array.isArray(p.imageObjects) && p.imageObjects.length > 0) {
            normalizedImages = p.imageObjects.map((img: any) => ({
              url: typeof img === "object" ? img.url : img,
              color: typeof img === "object" ? (img.color || "").trim() : "",
            }));
          } else if (Array.isArray(p.images) && p.images.length > 0) {
            normalizedImages = p.images.map((img: any, idx: number) => ({
              url: typeof img === "object" ? img.url : img,
              color: typeof img === "object" ? (img.color || "").trim() : (p.colors?.[idx] || p.color || ""),
            }));
          }

          const imageUrls = normalizedImages.map((img) => img.url);
          const uniqueColors = [...new Set(normalizedImages.map((img) => img.color).filter(Boolean))];

          const formatted = {
            id: p._id || p.id,
            title: p.title || p.name,
            slug: p.slug,
            description: p.description || "",
            category: p.category || "General",
            categorySlug: p.categorySlug || p.category?.toLowerCase()?.replace(/[^\w ]+/g, "")?.replace(/ +/g, "-"),
            price: p.price,
            salePrice: p.salePrice ?? null,
            rating: p.rating || 5,
            reviewCount: p.reviewCount || 0,
            images: imageUrls.length > 0 ? imageUrls : ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800"],
            imageObjects: normalizedImages,
            colors: uniqueColors,
            sizes: p.sizes || [],
            specs: p.specs || {},
            stock: p.stock ?? 10,
          };
          setProduct(formatted);
          if (uniqueColors.length > 0) {
            setSelectedColor(uniqueColors[0]);
          } else {
            setSelectedColor("");
          }
          if (formatted.sizes.length > 0) setSelectedSize(formatted.sizes[0]);
        } else if (isMounted) {
          setError(true);
        }
      } catch {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProduct();
    loadReviews(resolvedParams.slug);
    if (user) {
      checkEligibility(resolvedParams.slug);
    }
    return () => { isMounted = false; };
  }, [resolvedParams.slug, user]);

  // Load public approved reviews
  const loadReviews = useCallback(async (slugOrId: string) => {
    try {
      setReviewsLoading(true);
      const res = await api.get(`/reviews/product/${slugOrId}`);
      if (res.success && res.data) {
        setReviews(res.data.reviews || []);
        setRatingStats({
          averageRating: res.data.averageRating ?? 5.0,
          totalReviews: res.data.totalReviews ?? 0,
          ratingBreakdown: res.data.ratingBreakdown ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        });
      }
    } catch {
      // ignore
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  // Check if authenticated user has purchased product and can review
  const checkEligibility = useCallback(async (slugOrId: string) => {
    if (!user) {
      setEligibility({
        canReview: false,
        hasPurchased: false,
        alreadyReviewed: false,
        existingReview: null,
      });
      return;
    }
    try {
      const res = await api.get(`/reviews/product/${slugOrId}/eligibility`);
      if (res.success && res.data) {
        setEligibility(res.data);
      }
    } catch {
      // ignore
    }
  }, [user]);

  // Submit verified review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewMessage(null);

    if (!user) {
      openAuthModal({
        mode: "signin",
        message: "Please sign in to rate and review this product.",
      });
      return;
    }

    if (!formRating || formRating < 1 || formRating > 5) {
      setReviewMessage({
        type: "error",
        text: "Please select a rating between 1 and 5 stars.",
      });
      return;
    }

    if (!formComment.trim() || formComment.trim().length < 5) {
      setReviewMessage({
        type: "error",
        text: "Review comment must be at least 5 characters long.",
      });
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post("/reviews", {
        productId: product?.id || resolvedParams.slug,
        rating: formRating,
        comment: formComment.trim(),
      });

      if (res.success) {
        setReviewMessage({
          type: "success",
          text: "Thank you! Your review has been submitted and is awaiting approval by our moderation team.",
        });
        setFormComment("");
        // Reload eligibility and reviews
        await checkEligibility(resolvedParams.slug);
        await loadReviews(resolvedParams.slug);
        setTimeout(() => setShowReviewForm(false), 3000);
      } else {
        setReviewMessage({
          type: "error",
          text: res.message || "Failed to submit review. Only verified purchasers can review.",
        });
      }
    } catch (err: any) {
      setReviewMessage({
        type: "error",
        text: err.message || "An unexpected error occurred while submitting your review.",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const activePrice = product ? (product.salePrice ?? product.price) : 0;

  const handleAddToCart = async () => {
    if (!product) return;

    // Check authentication first
    if (!user) {
      openAuthModal({
        mode: "signin",
        message: "Please sign in first to add products to your cart.",
        onSuccess: handleAddToCart,
      });
      return;
    }

    setCartLoading(true);
    try {
      const res = await api.post("/cart/add", {
        productId: product.id,
        quantity,
        selectedColor,
        selectedSize,
      });

      if (res.success) {
        addItem(
          {
            id: product.id,
            title: product.title,
            slug: product.slug,
            price: product.price,
            salePrice: product.salePrice,
            image: product.images[selectedImage] || product.images[0],
            selectedColor,
            selectedSize,
          },
          quantity
        );
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      } else if (res.message?.includes("authorized") || res.message?.includes("session") || res.message?.includes("token")) {
        openAuthModal({
          mode: "signin",
          message: "Please sign in first to add products to your cart.",
          onSuccess: handleAddToCart,
        });
      }
    } catch {
      openAuthModal({
        mode: "signin",
        message: "Please sign in first to add products to your cart.",
        onSuccess: handleAddToCart,
      });
    } finally {
      setCartLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading product details from database...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Product Not Found</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            The requested product could not be loaded from the database catalog.
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm transition-colors"
          >
            Return to Vespera Mart Catalog
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      {/* Breadcrumb Navigation */}
      <div className="bg-slate-900 border-b border-slate-800 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1140px] mx-auto flex items-center gap-2 text-xs text-slate-400 overflow-x-auto whitespace-nowrap">
          <Link
            href="/"
            className="hover:text-amber-400 transition-colors cursor-pointer"
            style={{ cursor: "pointer" }}
          >
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <Link
            href="/shop"
            className="hover:text-amber-400 transition-colors cursor-pointer"
            style={{ cursor: "pointer" }}
          >
            Vespera Mart
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <Link
            href={`/shop?category=${product.categorySlug}`}
            className="hover:text-amber-400 transition-colors cursor-pointer"
            style={{ cursor: "pointer" }}
          >
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="text-slate-200 font-medium truncate max-w-xs">{product.title}</span>
        </div>
      </div>

      {/* Main Product Display - Centered Compact Balanced Layout */}
      <section className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_minmax(0,1fr)] gap-8 lg:gap-12 xl:gap-14 items-start justify-center">
          {/* Left Area (Thumbnails + Main Image): Compact, cohesive column */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-3.5 items-center sm:items-start justify-center shrink-0">
            {/* Leftmost: Compact Vertical Thumbnail Column */}
            {product.images && product.images.length > 0 && (
              <div className="flex flex-row sm:flex-col gap-2.5 shrink-0 overflow-x-auto sm:overflow-visible max-w-full pb-1 sm:pb-0">
                {product.images.map((img: string, idx: number) => {
                  const isSelected = selectedImage === idx;
                  const imgColor = product.imageObjects?.[idx]?.color;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedImage(idx);
                        if (imgColor) {
                          setSelectedColor(imgColor);
                        }
                      }}
                      title={`Image ${idx + 1}`}
                      aria-label={`Image ${idx + 1}`}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-900 border-2 transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? "border-amber-500 ring-2 ring-amber-500/30 scale-95 shadow-md"
                          : "border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <Image
                        src={img}
                        alt={`Image ${idx + 1}`}
                        fill
                        unoptimized
                        sizes="64px"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main Product Image Container - comfortably sized, object-contain, sharp, no crop */}
            <div className="relative w-full max-w-[390px] sm:w-[400px] md:w-[410px] h-[350px] sm:h-[390px] md:h-[410px] rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl p-3 sm:p-4 flex items-center justify-center group shrink-0">
              <div className="relative w-full h-full">
                <Image
                  src={getImageUrl(product.images[selectedImage] || product.images[0])}
                  alt={product.title}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
              {product.salePrice && (
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white font-extrabold text-xs rounded-lg shadow-md z-10">
                  SALE
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Product Info & Controls */}
          <div className="space-y-4 min-w-0">
            <div>
              {/* Category & Stock Status */}
              <div className="flex items-center justify-between mb-1.5">
                <Link
                  href={`/shop?category=${product.categorySlug}`}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 uppercase tracking-widest cursor-pointer transition-colors"
                  style={{ cursor: "pointer" }}
                >
                  {product.category}
                </Link>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> In Stock ({product.stock} left)
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {product.title}
              </h1>

              {/* Dynamic Product Rating - Click to jump to reviews tab */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("reviews");
                  const elem = document.getElementById("product-tabs-section");
                  if (elem) elem.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-2 mt-2 text-sm text-left group cursor-pointer"
              >
                {ratingStats.totalReviews > 0 ? (
                  <>
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(ratingStats.averageRating)
                              ? "fill-amber-400"
                              : "text-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-slate-200">
                      {ratingStats.averageRating.toFixed(1)}
                    </span>
                    <span className="text-slate-500 group-hover:text-amber-400 transition-colors">
                      ({ratingStats.totalReviews}{" "}
                      {ratingStats.totalReviews === 1 ? "customer review" : "customer reviews"})
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 text-xs italic group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-slate-600" />
                    No customer reviews yet — be the first to review!
                  </span>
                )}
              </button>
            </div>

            {/* Pricing Card - slightly smaller overall dimensions */}
            <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-baseline gap-3">
              <span className="text-3xl font-black text-white">
                {formatCurrency(activePrice)}
              </span>
              {product.salePrice && (
                <span className="text-sm text-slate-500 line-through font-medium">
                  {formatCurrency(product.price)}
                </span>
              )}
              {product.salePrice && (
                <span className="text-xs font-bold text-emerald-400 ml-auto bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                  Save {formatCurrency(product.price - product.salePrice)}
                </span>
              )}
            </div>

            {/* Product Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {product.description}
            </p>

            {/* Color Display / Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Color:{" "}
                <span className="text-amber-400 font-mono">
                  {product.colors && product.colors.length > 0
                    ? (selectedColor || product.colors[0])
                    : "NOT SPECIFIED"}
                </span>
              </label>

              {product.colors && product.colors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c: string) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setSelectedColor(c);
                        if (product.imageObjects && Array.isArray(product.imageObjects)) {
                          const matchIdx = product.imageObjects.findIndex((imgObj: any) => imgObj.color === c);
                          if (matchIdx !== -1) {
                            setSelectedImage(matchIdx);
                          }
                        }
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedColor === c
                          ? "bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-sm"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-medium italic">
                  Not specified
                </span>
              )}
            </div>

            {/* Size Swatches */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                  Select Size: <span className="text-amber-400">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s: string) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedSize === s
                          ? "bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-sm"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
              {/* Outer quantity box keeps exact dimensions (rounded-xl px-3 py-2) */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-slate-400 hover:text-white px-1.5 text-lg sm:text-xl font-black leading-none select-none transition-colors cursor-pointer flex items-center justify-center"
                  style={{ cursor: "pointer" }}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="text-base sm:text-lg font-black text-white px-2.5 min-w-[28px] text-center select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-slate-400 hover:text-white px-1.5 text-lg sm:text-xl font-black leading-none select-none transition-colors cursor-pointer flex items-center justify-center"
                  style={{ cursor: "pointer" }}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={cartLoading}
                className={`flex-1 py-3 px-5 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 ${
                  added
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20"
                }`}
                style={{ cursor: "pointer" }}
              >
                {cartLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Adding...</>
                ) : added ? (
                  <>
                    <Check className="w-5 h-5" /> Item Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" /> Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* Supporting Benefits */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-900 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">Express Shipping</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Authentic Guarantee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">30-Day Return</span>
              </div>
            </div>
          </div>
        </div>


        {/* Product Tabs: Specifications & Customer Reviews */}
        <div id="product-tabs-section" className="mt-16 pt-8 border-t border-slate-800">
          <div className="flex gap-6 border-b border-slate-800 pb-4">
            <button
              onClick={() => setActiveTab("specs")}
              className={`text-sm font-bold pb-2 transition-colors border-b-2 cursor-pointer ${
                activeTab === "specs"
                  ? "text-amber-400 border-amber-500"
                  : "text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              Product Specifications
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`text-sm font-bold pb-2 transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === "reviews"
                  ? "text-amber-400 border-amber-500"
                  : "text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              <span>Customer Reviews</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                {ratingStats.totalReviews}
              </span>
            </button>
          </div>

          <div className="py-6">
            {activeTab === "specs" ? (
              <div className="max-w-2xl bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white mb-4">Technical Details &amp; Build</h4>
                {product.specs && Object.keys(product.specs).length > 0 ? (
                  Object.entries(product.specs as Record<string, string>).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-slate-800/80 text-xs">
                      <span className="text-slate-400 font-medium">{key}</span>
                      <span className="text-slate-100 font-bold">{String(val)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Standard specifications apply for this item.</p>
                )}
              </div>
            ) : (
              <div className="space-y-8 max-w-4xl">
                {/* 1. Star Rating & Customer Sentiment Summary Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {/* Overall Score */}
                    <div className="text-center md:text-left space-y-2 md:border-r md:border-slate-800 md:pr-6">
                      <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                        {ratingStats.averageRating.toFixed(1)}
                      </div>
                      <div className="flex justify-center md:justify-start text-amber-400">
                        {Array.from({ length: 5 }).map((_, r) => (
                          <Star
                            key={r}
                            className={`w-5 h-5 ${
                              r < Math.round(ratingStats.averageRating)
                                ? "fill-amber-400"
                                : "text-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-400">
                        Based on {ratingStats.totalReviews} verified {ratingStats.totalReviews === 1 ? "review" : "reviews"}
                      </p>
                    </div>

                    {/* Breakdown Progress Bars */}
                    <div className="space-y-1.5 text-xs font-medium">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = ratingStats.ratingBreakdown[star] || 0;
                        const pct =
                          ratingStats.totalReviews > 0
                            ? Math.round((count / ratingStats.totalReviews) * 100)
                            : 0;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="w-8 text-slate-400 font-semibold">{star} ★</span>
                            <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-slate-500 text-[11px]">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Review Eligibility & Action Button */}
                    <div className="flex flex-col items-center md:items-end justify-center gap-3 md:pl-4">
                      {user ? (
                        eligibility.alreadyReviewed ? (
                          <div className="text-center md:text-right space-y-1.5">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                              <CheckCircle2 className="w-4 h-4" />
                              Review Submitted
                            </div>
                            <p className="text-[11px] text-slate-400 max-w-xs">
                              You have submitted a review for this purchase.
                            </p>
                          </div>
                        ) : eligibility.canReview ? (
                          <button
                            type="button"
                            onClick={() => setShowReviewForm((prev) => !prev)}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer active:scale-95"
                          >
                            <Edit3 className="w-4 h-4" />
                            {showReviewForm ? "Close Form" : "Write a Review"}
                          </button>
                        ) : (
                          <div className="text-center md:text-right space-y-1">
                            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium bg-slate-950/70 border border-slate-800/80 px-3 py-2 rounded-xl">
                              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>Verified purchase required</span>
                            </div>
                            <p className="text-[11px] text-slate-500 max-w-xs">
                              Only customers who have ordered and received this item can write a review.
                            </p>
                          </div>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            openAuthModal({
                              mode: "signin",
                              message: "Sign in to check if you are eligible to review this product.",
                            })
                          }
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-400" />
                          Sign In to Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Review Submission Form (Only for eligible purchasers) */}
                {showReviewForm && eligibility.canReview && (
                  <form
                    onSubmit={handleSubmitReview}
                    className="bg-slate-900 border-2 border-amber-500/30 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          Rate &amp; Review this Product
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Verified Order #{eligibility.orderIdString || "CONFIRMED"} • Reviewing as{" "}
                          <span className="text-slate-200 font-semibold">{user?.name}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Alerts */}
                    {reviewMessage && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                          reviewMessage.type === "success"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-red-500/10 border-red-500/30 text-red-400"
                        }`}
                      >
                        {reviewMessage.type === "success" ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        )}
                        <span className="leading-relaxed font-medium">
                          {reviewMessage.text}
                        </span>
                      </div>
                    )}

                    {/* Star Rating Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Your Rating (Required)
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isFilled =
                              (hoverRating || formRating) >= star;
                            return (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setFormRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="p-1 rounded hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                                aria-label={`Rate ${star} star`}
                              >
                                <Star
                                  className={`w-6 h-6 transition-colors ${
                                    isFilled
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-700"
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                        <span className="text-xs font-bold text-amber-400 ml-2">
                          {formRating === 5 && "Exceptional — 5 Stars"}
                          {formRating === 4 && "Very Good — 4 Stars"}
                          {formRating === 3 && "Average — 3 Stars"}
                          {formRating === 2 && "Fair — 2 Stars"}
                          {formRating === 1 && "Poor — 1 Star"}
                        </span>
                      </div>
                    </div>

                    {/* Written Comment Textarea */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">
                          Written Review (Required)
                        </label>
                        <span className="text-[11px] text-slate-500">
                          {formComment.length}/1500 characters
                        </span>
                      </div>
                      <textarea
                        required
                        rows={4}
                        minLength={5}
                        maxLength={1500}
                        value={formComment}
                        onChange={(e) => setFormComment(e.target.value)}
                        placeholder="Describe product quality, sizing, material, packaging, and shipping experience..."
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition-all font-normal resize-y"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        disabled={submittingReview}
                        className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReview || formComment.trim().length < 5}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingReview ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit for Moderation</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* 3. Existing User Review Status (If already submitted) */}
                {eligibility.alreadyReviewed && eligibility.existingReview && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Your Submitted Review</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            eligibility.existingReview.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : eligibility.existingReview.status === "hidden"
                              ? "bg-slate-800 text-slate-400 border border-slate-700"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {eligibility.existingReview.status === "approved"
                            ? "Published & Live"
                            : eligibility.existingReview.status === "hidden"
                            ? "Hidden by Moderation"
                            : "Awaiting Moderation"}
                        </span>
                      </div>
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, r) => (
                          <Star
                            key={r}
                            className={`w-3.5 h-3.5 ${
                              r < eligibility.existingReview.rating
                                ? "fill-amber-400"
                                : "text-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      &quot;{eligibility.existingReview.comment}&quot;
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Submitted on{" "}
                      {new Date(eligibility.existingReview.createdAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </p>
                  </div>
                )}

                {/* 4. Public Approved Reviews List */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center justify-between">
                    <span>Customer Feedback ({reviews.length})</span>
                    <span className="text-xs font-normal text-slate-400">
                      Showing approved verified buyer reviews
                    </span>
                  </h4>

                  {reviewsLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                      <span className="text-xs">Loading verified customer reviews...</span>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="py-12 px-6 rounded-2xl bg-slate-900 border border-slate-800/80 text-center space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800/60 text-slate-400 flex items-center justify-center mx-auto">
                        <MessageSquare className="w-6 h-6 text-slate-500" />
                      </div>
                      <h5 className="text-sm font-bold text-white">No Customer Reviews Yet</h5>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        There are currently no published reviews for this product. Be the first verified customer to share your experience!
                      </p>
                    </div>
                  ) : (
                    reviews.map((rev) => (
                      <div
                        key={rev._id}
                        className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 text-xs shadow-md transition-all hover:border-slate-700/80"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black text-xs flex items-center justify-center shadow">
                              {rev.userName ? rev.userName.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">
                                  {rev.userName || "Verified Customer"}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                                  <UserCheck className="w-3 h-3" />
                                  Verified Buyer
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 font-mono">
                                {new Date(rev.createdAt).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="flex text-amber-400 shrink-0">
                            {Array.from({ length: 5 }).map((_, r) => (
                              <Star
                                key={r}
                                className={`w-3.5 h-3.5 ${
                                  r < rev.rating ? "fill-amber-400" : "text-slate-700"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-slate-300 leading-relaxed text-sm pt-1">
                          {rev.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Please sign in first to add products to your cart."
      />
    </main>
  );
}
