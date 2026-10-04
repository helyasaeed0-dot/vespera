"use client";

import React, { useMemo, useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FilterSidebar from "@/components/shop/FilterSidebar";
import ProductCard from "@/components/shop/ProductCard";
import { Product } from "@/lib/mockData";
import { useFilterStore } from "@/store/useFilterStore";
import { ShoppingBag, SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api";

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

export default function ShopPage() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        setLoading(true);
        setError(false);
        const res = await api.get<{ products: any[] }>("/products?limit=50");
        if (isMounted && res.success && res.data?.products) {
          const formatted = res.data.products.map((p: any) => ({
            id: p._id || p.id,
            title: p.title || p.name,
            slug: p.slug,
            description: p.description,
            category: p.category,
            categorySlug: p.categorySlug || p.category?.toLowerCase()?.replace(/[^\w ]+/g, "")?.replace(/ +/g, "-"),
            price: p.price,
            salePrice: p.salePrice ?? null,
            rating: p.rating || 5,
            reviewCount: p.reviewCount || 0,
            images: Array.isArray(p.images) ? p.images : [p.images].filter(Boolean),
            colors: p.colors || [],
            sizes: p.sizes || [],
            specs: p.specs || {},
            stock: p.stock ?? 10,
            isFeatured: !!p.isFeatured,
            isNewArrival: !!p.isNewArrival,
          }));
          setProductList(formatted);
        } else if (isMounted) {
          setError(true);
        }
      } catch {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProducts();
    return () => { isMounted = false; };
  }, []);

  const {
    selectedCategories,
    priceRange,
    inStockOnly,
    minRating,
    sortBy,
    setSortBy,
    searchQuery,
  } = useFilterStore();

  const filteredProducts = useMemo(() => {
    return productList.filter((product) => {
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(product.categorySlug)
      ) {
        return false;
      }
      const activePrice = product.salePrice ?? product.price;
      if (activePrice > priceRange[1]) return false;
      if (inStockOnly && product.stock <= 0) return false;
      if (minRating > 0 && product.rating < minRating) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesCat = product.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.salePrice ?? a.price;
      const priceB = b.salePrice ?? b.price;
      if (sortBy === "price-low") return priceA - priceB;
      if (sortBy === "price-high") return priceB - priceA;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "newest") return b.isNewArrival ? 1 : -1;
      return 0;
    });
  }, [selectedCategories, priceRange, inStockOnly, minRating, sortBy, searchQuery, productList]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      {/* Catalog Containing Section */}
      <section className="relative flex-1">
        {/* Sticky Second Navbar */}
        <div
          className="sticky z-30 bg-slate-950"
          style={{ top: "var(--main-navbar-height, 80px)" }}
        >
          <div className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
              <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
                Vespera <span className="text-amber-400 font-semibold">Mart Catalog</span>
              </h1>
              <div className="text-xs sm:text-sm text-slate-400 font-normal">
                {loading ? (
                  <span className="text-slate-500">Loading...</span>
                ) : (
                  <>Showing <span className="text-white font-medium">{filteredProducts.length}</span> verified products</>
                )}
              </div>
            </div>
          </div>
          <div className="h-6 sm:h-8 bg-slate-950 pointer-events-none" aria-hidden="true" />
        </div>

        {/* Main Catalog Workspace */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Filter Sidebar */}
            <FilterSidebar />

            {/* Right Product Grid Container */}
            <div className="flex-1 space-y-6">
              {/* Sorting Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm">
                <div className="flex items-center gap-2 text-slate-200">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">Sorting &amp; Display</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="text-slate-400 whitespace-nowrap text-sm font-normal">Sort By:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto bg-slate-950 border border-slate-800 text-slate-200 text-sm font-medium px-3.5 py-2 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="featured">Featured Arrivals</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Customer Rating</option>
                    <option value="newest">Newest Releases</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : error ? (
                <div className="p-16 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Unable to load products</h3>
                  <p className="text-sm text-slate-300 font-normal">Please check your connection and try again.</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-16 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">No products match your active filters</h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal max-w-sm mx-auto">
                    Try adjusting your price range slider or clearing category selections to see more results.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
