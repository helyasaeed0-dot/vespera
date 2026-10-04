import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800";

export const FALLBACK_PARTNER_IMAGE =
  "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=800";

/**
 * Resolves raw image string to absolute usable URL with fallback support.
 */
export function getImageUrl(src?: string | null, fallback = FALLBACK_PRODUCT_IMAGE): string {
  if (!src || typeof src !== "string" || src.trim() === "") {
    return fallback;
  }
  const cleanSrc = src.trim();

  // Handle local uploaded paths like "/uploads/asset_123.jpg" or "uploads/asset_123.jpg"
  if (cleanSrc.startsWith("/uploads/") || cleanSrc.startsWith("uploads/")) {
    const backendHost = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const relativePath = cleanSrc.startsWith("/") ? cleanSrc : `/${cleanSrc}`;
    return `${backendHost}${relativePath}`;
  }

  // Absolute URLs (http/https/data URI)
  if (cleanSrc.startsWith("http://") || cleanSrc.startsWith("https://") || cleanSrc.startsWith("data:")) {
    return cleanSrc;
  }

  // Any relative public asset (e.g. "/images/hero.png")
  if (cleanSrc.startsWith("/")) {
    return cleanSrc;
  }

  return fallback;
}

