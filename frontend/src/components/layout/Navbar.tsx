"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useFilterStore } from "@/store/useFilterStore";
import { useUserStore } from "@/store/useUserStore";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Package,
  FileText,
  MapPin,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import CartDrawer from "./CartDrawer";
import VesperaLogo from "@/components/ui/VesperaLogo";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, setUser, logout, checkAuth } = useUserStore();
  const { openAuthModal } = useAuthModalStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleUserMenuEnter = () => {
    if (userMenuTimeoutRef.current) {
      clearTimeout(userMenuTimeoutRef.current);
      userMenuTimeoutRef.current = null;
    }
    setIsUserMenuOpen(true);
  };

  const handleUserMenuLeave = () => {
    userMenuTimeoutRef.current = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 180);
  };

  const { toggleCart, getTotalItems } = useCartStore();
  const { searchQuery, setSearchQuery } = useFilterStore();
  const totalItems = getTotalItems();

  useEffect(() => {
    const updateNavbarHeight = () => {
      if (headerRef.current) {
        const announcement = headerRef.current.querySelector("[data-announcement-bar]") as HTMLElement | null;
        const announcementH = announcement ? announcement.offsetHeight : 0;
        const navBarH = 80; // Standard main nav bar h-20
        const totalHeight = announcementH + navBarH;
        document.documentElement.style.setProperty("--main-navbar-height", `${totalHeight}px`);
      }
    };

    updateNavbarHeight();
    window.addEventListener("resize", updateNavbarHeight);
    return () => {
      window.removeEventListener("resize", updateNavbarHeight);
    };
  }, [showAnnouncement]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Vespera Mart", href: "/shop" },
    { name: "Partners", href: "/partners" },
    { name: "Careers", href: "/careers" },
  ];

  return (
    <header ref={headerRef} className="w-full sticky top-0 z-40">
      {/* Top Announcement Bar */}
      {showAnnouncement && (
        <div data-announcement-bar className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 font-semibold text-xs py-2 px-4 flex items-center justify-between shadow-inner">
          <div className="flex-1 text-center flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              Free Express Shipping on Orders Over $100 &nbsp;|&nbsp;{" "}
              <Link href="/partners" className="underline font-bold hover:text-slate-900 transition-colors">
                Partner with Vespera Enterprise
              </Link>
            </span>
          </div>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="text-slate-950/70 hover:text-slate-950 p-1 transition-colors"
            aria-label="Close Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <nav className="backdrop-blur-md bg-slate-900/90 border-b border-slate-800 text-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          {/* Brand Logo - Far Left */}
          <VesperaLogo size="md" subtitle="ENTERPRISE" />

          {/* Desktop Navigation Links - Centered */}
          <div className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 flex-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`py-2 text-sm font-medium transition-colors relative group ${
                    isActive ? "text-amber-400" : "text-slate-300 hover:text-amber-300"
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-amber-400 transition-all duration-300 ease-out ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Right Controls: Search, Cart & Auth - Far Right */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex w-48 lg:w-56 xl:w-64 relative"
            >
              <input
                type="text"
                placeholder="Search Vespera Mart..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 text-sm text-slate-100 placeholder:text-slate-400 placeholder:text-sm placeholder:font-normal pl-9 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>
            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all group cursor-pointer"
              aria-label="Open Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-slate-300 group-hover:text-amber-400 transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Dynamic User State Switcher with Hover Dropdown */}
            {user ? (
              <div
                className="relative"
                onMouseEnter={handleUserMenuEnter}
                onMouseLeave={handleUserMenuLeave}
              >
                <button
                  type="button"
                  onMouseEnter={handleUserMenuEnter}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer group"
                  aria-label="User Account Menu"
                >
                  <User className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors shrink-0" />
                  <span className="text-xs font-semibold text-slate-200 hidden sm:inline-block max-w-[110px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* User Avatar Dropdown (Opens on Hover with Smooth Transition) */}
                <div
                  onMouseEnter={handleUserMenuEnter}
                  onMouseLeave={handleUserMenuLeave}
                  className={`absolute right-0 top-full pt-1.5 w-56 z-50 transition-all duration-200 ease-out origin-top-right ${
                    isUserMenuOpen
                      ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                      : "opacity-0 -translate-y-1 scale-95 pointer-events-none"
                  }`}
                >
                  <div className="rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 text-sm">
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-sm font-semibold text-slate-200">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/user/dashboard?tab=orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 transition-colors cursor-pointer"
                        style={{ cursor: "pointer" }}
                      >
                      <Package className="w-4 h-4 text-slate-400" /> My Orders
                      </Link>
                      <Link
                        href="/user/dashboard?tab=applications"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 transition-colors cursor-pointer"
                        style={{ cursor: "pointer" }}
                      >
                      <FileText className="w-4 h-4 text-slate-400" /> Job Applications
                      </Link>
                      <Link
                        href="/user/dashboard?tab=addresses"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 transition-colors cursor-pointer"
                        style={{ cursor: "pointer" }}
                      >
                        <MapPin className="w-4 h-4 text-slate-400" /> Address Book
                      </Link>
                      <Link
                        href="/user/dashboard?tab=settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 transition-colors cursor-pointer"
                        style={{ cursor: "pointer" }}
                      >
                        <Settings className="w-4 h-4 text-slate-400 text-sm" /> Profile Settings
                      </Link>
                    </div>
                    <div className="border-t border-slate-800 pt-1">
                      <button
                        onClick={async () => {
                          await logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                        style={{ cursor: "pointer" }}
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal({ mode: "signin" })}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-sm transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <User className="w-4 h-4" /> Sign In / Register
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-slate-800 text-slate-200"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search Vespera Mart..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 text-sm text-slate-100 placeholder:text-slate-400 placeholder:text-sm placeholder:font-normal pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500/60 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "text-amber-400 bg-amber-500/10 font-bold"
                      : "text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {!user && (
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal({ mode: "signin" });
                    }}
                    className="w-full text-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                  >
                    <User className="w-4 h-4" /> Sign In / Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Cart Drawer */}
      <CartDrawer />
    </header>
  );
}
