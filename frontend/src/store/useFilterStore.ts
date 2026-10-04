import { create } from "zustand";

interface FilterStore {
  selectedCategories: string[];
  priceRange: [number, number];
  inStockOnly: boolean;
  minRating: number;
  sortBy: string;
  searchQuery: string;
  setSelectedCategories: (categories: string[]) => void;
  toggleCategory: (category: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setInStockOnly: (inStock: boolean) => void;
  setMinRating: (rating: number) => void;
  setSortBy: (sort: string) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  selectedCategories: [],
  priceRange: [0, 1000],
  inStockOnly: false,
  minRating: 0,
  sortBy: "featured",
  searchQuery: "",
  setSelectedCategories: (categories) => set({ selectedCategories: categories }),
  toggleCategory: (category) =>
    set((state) => {
      const exists = state.selectedCategories.includes(category);
      if (exists) {
        return {
          selectedCategories: state.selectedCategories.filter((c) => c !== category),
        };
      } else {
        return { selectedCategories: [...state.selectedCategories, category] };
      }
    }),
  setPriceRange: (priceRange) => set({ priceRange }),
  setInStockOnly: (inStockOnly) => set({ inStockOnly }),
  setMinRating: (minRating) => set({ minRating }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  resetFilters: () =>
    set({
      selectedCategories: [],
      priceRange: [0, 1000],
      inStockOnly: false,
      minRating: 0,
      sortBy: "featured",
      searchQuery: "",
    }),
}));
