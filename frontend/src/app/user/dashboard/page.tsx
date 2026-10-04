"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatCurrency } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";
import { Address } from "@/store/useUserStore";
import { api } from "@/lib/api";
import {
  Package,
  FileText,
  MapPin,
  Settings,
  Download,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

type TabType = "orders" | "applications" | "addresses" | "settings";

// ─── Skeleton Components ──────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 bg-slate-800 rounded w-28" />
        <div className="h-4 bg-slate-800 rounded w-16" />
      </div>
      <div className="h-3 bg-slate-800 rounded w-3/4" />
      <div className="flex justify-between pt-1">
        <div className="h-4 bg-slate-800 rounded w-20" />
        <div className="h-8 bg-slate-800 rounded-lg w-24" />
      </div>
    </div>
  );
}

function SkeletonProfile() {
  return (
    <div className="space-y-4 max-w-md animate-pulse">
      {["Full Name", "Email", "Phone"].map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-3 bg-slate-800 rounded w-20" />
          <div className="h-10 bg-slate-800 rounded-lg w-full" />
        </div>
      ))}
      <div className="h-10 bg-amber-500/20 rounded-lg w-32" />
    </div>
  );
}

// ─── Address Modal ────────────────────────────────────────────────────
function AddressModal({
  address,
  onSave,
  onClose,
  loading,
}: {
  address?: Address;
  onSave: (data: Partial<Address>) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<Partial<Address>>({
    label: address?.label || "Home",
    fullName: address?.fullName || "",
    phone: address?.phone || "",
    street: address?.street || "",
    city: address?.city || "",
    state: address?.state || "",
    postalCode: address?.postalCode || "",
    country: address?.country || "",
    isDefault: address?.isDefault || false,
  });

  const inp = "w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-lg px-3.5 py-2.5 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 focus:outline-none transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">{address ? "Edit Address" : "Add New Address"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Label</label>
              <select value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className={inp}>
                <option>Home</option>
                <option>Work</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Full Name *</label>
              <input type="text" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Full Name" className={inp} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" className={inp} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Street Address *</label>
            <input type="text" value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} placeholder="742 Evergreen Terrace" className={inp} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">City *</label>
              <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="New York" className={inp} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">State</label>
              <input type="text" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="NY" className={inp} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Postal Code</label>
              <input type="text" value={form.postalCode} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} placeholder="10001" className={inp} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Country *</label>
              <input type="text" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="United States" className={inp} />
            </div>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={!!form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} className="w-4 h-4 accent-amber-500" />
            <span className="text-sm text-slate-300">Set as default address</span>
          </label>
        </div>

        <div className="flex gap-3 mt-5 pt-4 border-t border-slate-800">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={loading || !form.fullName || !form.street || !form.city || !form.country}
            className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {loading ? "Saving..." : "Save Address"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabType | null;
  const { user, updateUser, checkAuth, isLoading } = useUserStore();

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/auth?redirect=/user/dashboard");
    }
  }, [user, isLoading, router]);

  const [formName, setFormName] = useState(user?.name || "");
  const [formPhone, setFormPhone] = useState(user?.phone || user?.phoneNumber || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  const activeTab: TabType =
    tabParam && (["orders", "applications", "addresses", "settings"] as TabType[]).includes(tabParam)
      ? tabParam
      : "orders";

  const handleTabChange = (tab: TabType) => {
    router.replace(`/user/dashboard?tab=${tab}`, { scroll: false });
  };

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Applications
  const [applications, setApplications] = useState<any[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);
  const [addressSaving, setAddressSaving] = useState(false);

  // Load orders
  useEffect(() => {
    if (activeTab !== "orders") return;
    let isMounted = true;
    setOrdersLoading(true);
    api.get<{ orders: any[] }>("/orders/my-orders")
      .then(res => {
        if (!isMounted) return;
        if (res.success && res.data?.orders) {
          setOrders(res.data.orders.map((o: any) => ({
            id: o.orderId || o._id,
            _id: o._id,
            date: new Date(o.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            status: (o.orderStatus || "Processing").toUpperCase(),
            items: o.orderItems?.map((it: any) => it.title) || ["Vespera Order"],
            total: o.total || 0,
            trackingNumber: o.trackingNumber || `TRK-${o._id?.slice(-8).toUpperCase()}`,
          })));
        }
      })
      .finally(() => { if (isMounted) setOrdersLoading(false); });
    return () => { isMounted = false; };
  }, [activeTab]);

  // Load applications
  useEffect(() => {
    if (activeTab !== "applications") return;
    let isMounted = true;
    setAppsLoading(true);
    api.get<{ applications: any[] }>("/applications/my-applications")
      .then(res => {
        if (!isMounted) return;
        if (res.success && res.data?.applications) {
          setApplications(res.data.applications.map((a: any) => ({
            id: a._id,
            title: a.job?.title || a.jobTitle || "Career Application",
            department: a.job?.department || a.department || "Corporate",
            status: a.status || "Pending",
            appliedAt: new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          })));
        }
      })
      .finally(() => { if (isMounted) setAppsLoading(false); });
    return () => { isMounted = false; };
  }, [activeTab]);

  // Load addresses
  useEffect(() => {
    if (activeTab !== "addresses") return;
    let isMounted = true;
    setAddressesLoading(true);
    api.get<{ addresses: Address[] }>("/users/me/addresses")
      .then(res => {
        if (!isMounted) return;
        if (res.success && res.data?.addresses) {
          setAddresses(res.data.addresses);
        }
      })
      .finally(() => { if (isMounted) setAddressesLoading(false); });
    return () => { isMounted = false; };
  }, [activeTab]);

  // Sync form fields when user loads
  useEffect(() => {
    if (user) {
      setFormName(user.name || "");
      setFormPhone(user.phone || user.phoneNumber || "");
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setProfileLoading(true);
    setProfileSuccess(false);
    setProfileError("");
    try {
      const res = await api.patch<{ user: any }>("/users/me", {
        name: formName.trim(),
        phone: formPhone.trim(),
      });
      if (res.success && res.data?.user) {
        updateUser({ name: res.data.user.name, phone: res.data.user.phone, phoneNumber: res.data.user.phone });
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3500);
      } else {
        setProfileError(res.message || "Failed to update profile. Please try again.");
      }
    } catch {
      setProfileError("Network error. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAddressSave = async (form: Partial<Address>) => {
    setAddressSaving(true);
    try {
      if (editingAddress?._id) {
        const res = await api.put<{ address: Address }>(`/users/me/addresses/${editingAddress._id}`, form);
        if (res.success && res.data?.address) {
          setAddresses(prev => prev.map(a => a._id === editingAddress._id ? res.data!.address : a));
        }
      } else {
        const res = await api.post<{ address: Address }>("/users/me/addresses", form);
        if (res.success && res.data?.address) {
          setAddresses(prev => [...prev, res.data!.address]);
        }
      }
      setAddressModalOpen(false);
      setEditingAddress(undefined);
    } catch {
      // silent
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Delete this address?")) return;
    await api.delete(`/users/me/addresses/${addressId}`);
    setAddresses(prev => prev.filter(a => a._id !== addressId));
  };

  const statusColor = (status: string) => {
    const s = status.toUpperCase();
    if (s === "DELIVERED" || s === "HIRED") return "text-emerald-400";
    if (s === "SHIPPED") return "text-blue-400";
    if (s === "CANCELLED" || s === "REJECTED") return "text-red-400";
    if (s === "SHORTLISTED") return "text-amber-400";
    return "text-slate-300";
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      {/* Floating Capsule Profile Bar */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pt-7 pb-2">
        <div className="max-w-4xl mx-auto relative rounded-2xl sm:rounded-full bg-gradient-to-r from-[#040814] via-[#09152b] to-[#040814] border border-blue-500/25 px-6 sm:px-8 py-3.5 sm:py-4 shadow-[0_4px_25px_-4px_rgba(29,78,216,0.22)] overflow-hidden">
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-14 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6 w-full">
            <div className="min-w-0 flex-1">
              {user ? (
                <>
                  <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug truncate">
                    {user.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 font-normal leading-tight truncate">
                    {user.email}
                  </p>
                </>
              ) : (
                <div className="space-y-1 animate-pulse">
                  <div className="h-5 bg-slate-800 rounded w-40" />
                  <div className="h-3 bg-slate-800 rounded w-56" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 sm:gap-6 shrink-0 self-start sm:self-center">
              <div className="hidden sm:block h-7 w-px bg-blue-500/25" />
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/50 border border-blue-500/30 text-xs font-medium text-blue-200 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Verified Member</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation Tabs (Sidebar) */}
          <div className="w-full lg:w-64 bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1 shrink-0 h-fit">
            {(["orders", "applications", "addresses", "settings"] as TabType[]).map(tab => {
              const icons = { orders: Package, applications: FileText, addresses: MapPin, settings: Settings };
              const labels = { orders: `My Orders (${orders.length})`, applications: `Job Applications (${applications.length})`, addresses: "Address Book", settings: "Profile Settings" };
              const Icon = icons[tab];
              return (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === tab ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-300 hover:bg-slate-800"}`}
                  style={{ cursor: "pointer" }}
                >
                  <Icon className="w-4 h-4" /> {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* Main Tab Content */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">Order Tracking &amp; History</h3>
                  <p className="text-sm text-slate-400 font-normal">View status and download invoices.</p>
                </div>
                {ordersLoading ? (
                  <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <SkeletonRow key={i} />)}</div>
                ) : orders.length === 0 ? (
                  <div className="p-10 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <Package className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">You haven't placed any orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(ord => (
                      <div key={ord.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                          <div>
                            <span className="font-semibold text-amber-400">{ord.id}</span>
                            <span className="text-slate-400 ml-2">Placed on {ord.date}</span>
                          </div>
                          <span className={`font-semibold text-sm ${statusColor(ord.status)}`}>{ord.status}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 font-medium">Items:</span>
                          <p className="text-slate-200 font-normal">{ord.items.join(", ")}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-900">
                          <span className="font-semibold text-base text-white">Total: {formatCurrency(ord.total)}</span>
                          <button
                            onClick={() => alert(`Downloading PDF Invoice for ${ord.id}...`)}
                            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-medium border border-slate-800 flex items-center gap-1.5 text-sm cursor-pointer"
                          >
                            <Download className="w-4 h-4" /> PDF Invoice
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* APPLICATIONS TAB */}
            {activeTab === "applications" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">Career Applications Track</h3>
                  <p className="text-sm text-slate-400 font-normal">Status of job applications submitted through Vespera Career Portal.</p>
                </div>
                {appsLoading ? (
                  <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <SkeletonRow key={i} />)}</div>
                ) : applications.length === 0 ? (
                  <div className="p-10 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">You haven't applied for any jobs yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map(app => (
                      <div key={app.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-sm">
                        <div>
                          <h4 className="font-medium text-white text-base">{app.title}</h4>
                          <p className="text-slate-400 text-sm font-normal">{app.department} • Applied {app.appliedAt}</p>
                        </div>
                        <span className={`font-semibold text-sm ${statusColor(app.status)}`}>{app.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Address Book</h3>
                    <p className="text-sm text-slate-400 font-normal">Manage your saved shipping addresses.</p>
                  </div>
                  <button
                    onClick={() => { setEditingAddress(undefined); setAddressModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Address
                  </button>
                </div>
                {addressesLoading ? (
                  <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <SkeletonRow key={i} />)}</div>
                ) : addresses.length === 0 ? (
                  <div className="p-10 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <MapPin className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No saved addresses yet. Add one above.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map(addr => (
                      <div key={addr._id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-amber-400 font-medium uppercase tracking-wide">
                            {addr.label || "Address"} {addr.isDefault && <span className="ml-1 text-emerald-400">(Default)</span>}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setEditingAddress(addr); setAddressModalOpen(true); }}
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => addr._id && handleDeleteAddress(addr._id)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="font-semibold text-white text-base">{addr.fullName}</p>
                        <p className="text-slate-300 font-normal">
                          {addr.street}, {addr.city}{addr.state ? `, ${addr.state}` : ""}{addr.postalCode ? ` ${addr.postalCode}` : ""}, {addr.country}
                        </p>
                        {addr.phone && <p className="text-slate-400 font-normal">Phone: {addr.phone}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">Profile Settings</h3>
                  <p className="text-sm text-slate-400 font-normal">Update personal details and contact information.</p>
                </div>

                {!user ? (
                  <SkeletonProfile />
                ) : (
                  <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
                    <div className="space-y-1.5">
                      <label className="text-sm text-slate-200 font-medium block">Full Name</label>
                      <input
                        type="text"
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-lg px-4 py-3 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-slate-200 font-medium block">Email Address</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full bg-slate-950/50 border border-slate-800 text-slate-400 text-sm rounded-lg px-4 py-3 cursor-not-allowed"
                      />
                      <p className="text-xs text-slate-500">Email cannot be changed here.</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-slate-200 font-medium block">Phone Number</label>
                      <input
                        type="tel"
                        value={formPhone}
                        onChange={e => setFormPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-lg px-4 py-3 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 focus:outline-none transition-all"
                      />
                    </div>

                    {profileSuccess && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Profile updated successfully!</span>
                      </div>
                    )}
                    {profileError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{profileError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-medium text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2"
                    >
                      {profileLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {profileLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />

      {/* Address Modal */}
      {addressModalOpen && (
        <AddressModal
          address={editingAddress}
          onSave={handleAddressSave}
          onClose={() => { setAddressModalOpen(false); setEditingAddress(undefined); }}
          loading={addressSaving}
        />
      )}
    </main>
  );
}

export default function UserDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-100" />}>
      <DashboardContent />
    </Suspense>
  );
}
