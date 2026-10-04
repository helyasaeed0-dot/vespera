"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  categorySlug: string;
  price: number;
  salePrice?: number | null;
  rating: number;
  reviewCount: number;
  images: string[];
  colors?: string[];
  sizes?: string[];
  specs?: Record<string, string>;
  stock: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
}

function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden animate-pulse">
      <div className="w-full aspect-square bg-slate-800" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-slate-800 rounded w-1/3" />
        <div className="h-4 bg-slate-800 rounded w-4/5" />
        <div className="h-3 bg-slate-800 rounded w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 bg-slate-800 rounded w-1/4" />
          <div className="h-8 bg-slate-800 rounded-lg w-1/3" />
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProducts() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadFeatured() {
      try {
        setLoading(true);
        setError(false);
        // Try /home first (showOnHomePage), fallback to /featured
        const res = await api.get<{ products: any[] }>("/products/home");
        if (isMounted && res.success && res.data?.products) {
          const formatted = res.data.products.slice(0, 8).map((p: any) => ({
            id: p._id || p.id,
            title: p.title || p.name,
            slug: p.slug,
            description: p.description,
            category: p.category,
            categorySlug: p.categorySlug || p.category?.toLowerCase()?.replace(/\s+/g, "-"),
            price: p.price,
            salePrice: p.salePrice ?? null,
            rating: p.rating || 5,
            reviewCount: p.reviewCount || 0,
            images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : ["/placeholder.jpg"]),
            colors: p.colors || [],
            sizes: p.sizes || [],
            specs: p.specs || {},
            stock: p.stock ?? 10,
            isFeatured: true,
          }));
          setFeatured(formatted);
        } else if (isMounted) {
          setError(true);
        }
      } catch {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadFeatured();
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="py-20 bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold text-white tracking-[-0.01em] leading-[1.2]">
              Featured products &amp; <span className="text-amber-400 font-semibold">best sellers</span>
            </h2>
            <p className="text-sm sm:text-[15px] text-slate-300 mt-2 max-w-xl font-normal leading-[1.55]">
              Explore our range of premium products across tailored apparel, smart wearables, and everyday essentials.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors group"
          >
            Explore Full Vespera Catalog
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <p className="text-slate-400 text-sm">Unable to load featured products. Please try again later.</p>
          </div>
        ) : featured.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <p className="text-slate-400 text-sm">No featured products available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
