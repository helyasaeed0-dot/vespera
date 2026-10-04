"use client";

import React, { useState, useEffect } from "react";
import { useFilterStore } from "@/store/useFilterStore";
import { formatCurrency } from "@/lib/utils";
import { ChevronDown, ChevronUp, Filter, RotateCcw, Star, Check } from "lucide-react";
import { api } from "@/lib/api";

interface Category {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  subcategories?: string[];
  isActive?: boolean;
}

export default function FilterSidebar() {
  const {
    selectedCategories,
    toggleCategory,
    priceRange,
    setPriceRange,
    inStockOnly,
    setInStockOnly,
    minRating,
    setMinRating,
    resetFilters,
  } = useFilterStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchCategories() {
      try {
        setLoading(true);
        setError(false);
        const res = await api.get<{ categories: any[] }>("/categories");
        if (isMounted && res.success) {
          const list = Array.isArray(res.data)
            ? res.data
            : res.data?.categories || [];
          setCategories(list);
        } else if (isMounted) {
          setError(true);
        }
      } catch {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <aside className="w-full lg:w-64 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shrink-0 h-fit lg:sticky lg:top-[calc(var(--main-navbar-height,80px)+96px)] lg:z-20 max-h-[calc(100vh-var(--main-navbar-height,80px)-116px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-white font-semibold text-base sm:text-lg">
          <Filter className="w-4 h-4 text-amber-400" />
          <span>Filters</span>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="cursor-pointer text-sm font-medium text-slate-400 hover:text-amber-400 flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-800/60 transition-all select-none"
          title="Reset all active filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Accordion */}
      <div className="space-y-3">
        <button
          onClick={() => setExpandedCategories(!expandedCategories)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-200 uppercase tracking-wider text-left cursor-pointer"
        >
          <span>Categories</span>
          {expandedCategories ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {expandedCategories && (
          <div className="space-y-2 pt-1">
            {loading ? (
              <div className="space-y-2 py-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-5 bg-slate-800 rounded animate-pulse w-3/4" />
                ))}
              </div>
            ) : error ? (
              <div className="py-1 text-xs text-rose-400">
                Unable to load categories
              </div>
            ) : categories.length === 0 ? (
              <div className="py-1 text-xs text-slate-400">
                No categories available
              </div>
            ) : (
              categories.map((cat) => {
                const catSlug = cat.slug || cat.name.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-");
                const checked = selectedCategories.includes(catSlug);
                return (
                  <label
                    key={cat._id || cat.id || catSlug}
                    htmlFor={`filter-category-${catSlug}`}
                    className="flex items-center gap-3 text-sm text-slate-300 hover:text-amber-400 cursor-pointer select-none transition-colors"
                  >
                    <input
                      id={`filter-category-${catSlug}`}
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(catSlug)}
                      className="sr-only"
                    />
                    <div
                      aria-hidden="true"
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        checked
                          ? "bg-amber-500 border-amber-500 text-slate-950"
                          : "border-slate-700 bg-slate-950"
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="flex-1">{cat.name}</span>
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Multi-range Price Slider */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Price Range
          </label>
          <span className="text-sm font-semibold text-amber-400">
            {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}+
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1000"
          step="25"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
          className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-400 font-normal">
          <span>$0</span>
          <span>$500</span>
          <span>$1,000+</span>
        </div>
      </div>

      {/* In-Stock Toggle */}
      <div className="pt-4 border-t border-slate-800">
        <label className="flex items-center justify-between cursor-pointer select-none">
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            In-Stock Only
          </span>
          <div
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
              inStockOnly ? "bg-amber-500" : "bg-slate-800"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                inStockOnly ? "translate-x-5 bg-slate-950" : "translate-x-0 bg-slate-400"
              }`}
            />
          </div>
        </label>
      </div>

      {/* Rating Filter (1-5 stars) */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
          Minimum Rating
        </label>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setMinRating(minRating === rating ? 0 : rating)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                minRating === rating
                  ? "bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < rating ? "fill-amber-400" : "text-slate-700"
                    }`}
                  />
                ))}
              </div>
              <span>&amp; Up</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
