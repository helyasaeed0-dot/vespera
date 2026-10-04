"use client";

import React from "react";
import Link from "next/link";

interface VesperaLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  subtitle?: string;
  showWordmark?: boolean;
  clickable?: boolean;
  className?: string;
}

export function VesperaMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 select-none overflow-hidden transition-transform duration-300 group-hover:scale-105 ${className}`}
    >
      {/* Faceted geometric V vector emblem */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[82%] h-[82%] drop-shadow-sm"
      >
        <path
          d="M10 9 L18 31 L20 31 L14 9 Z"
          fill="#020617"
          opacity="0.95"
        />
        <path
          d="M30 9 L22 31 L20 31 L26 9 Z"
          fill="#0F172A"
          opacity="0.85"
        />
        {/* Subtle inner metallic highlight facet */}
        <polygon points="20,13 22,17 20,21 18,17" fill="#FEF3C7" />
      </svg>
    </div>
  );
}

export default function VesperaLogo({
  size = "md",
  subtitle = "ENTERPRISE",
  showWordmark = true,
  clickable = true,
  className = "",
}: VesperaLogoProps) {
  const sizeMap = {
    sm: { icon: 32, text: "text-lg", sub: "text-[9px]" },
    md: { icon: 40, text: "text-xl", sub: "text-[10px]" },
    lg: { icon: 48, text: "text-2xl", sub: "text-[11px]" },
    xl: { icon: 56, text: "text-3xl", sub: "text-xs" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      <VesperaMark size={currentSize.icon} />
      {showWordmark && (
        <div className="flex flex-col">
          <span
            className={`font-black tracking-tight text-white leading-none ${currentSize.text} bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent group-hover:to-amber-200 transition-colors`}
          >
            VESPERA
          </span>
          {subtitle && (
            <span
              className={`font-semibold tracking-[0.2em] text-amber-400 mt-1 uppercase ${currentSize.sub}`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (!clickable) {
    return content;
  }

  return (
    <Link href="/" className="inline-flex cursor-pointer" aria-label="Vespera Home">
      {content}
    </Link>
  );
}
