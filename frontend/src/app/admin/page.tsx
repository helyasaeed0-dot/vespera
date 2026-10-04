"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { api } from "@/lib/api";
import { formatCurrency, getImageUrl, FALLBACK_PRODUCT_IMAGE, FALLBACK_PARTNER_IMAGE } from "@/lib/utils";
import PasswordInput from "@/components/ui/PasswordInput";
import VesperaLogo from "@/components/ui/VesperaLogo";
import {
  ShieldCheck,
  ShieldAlert,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Briefcase,
  FileCheck,
  Building2,
  Star,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  ChevronRight,
  TrendingUp,
  DollarSign,
  AlertCircle,
  FileText,
  Upload,
  Lock,
  Mail,
  Loader2,
  Eye,
  Download,
  Sparkles,
} from "lucide-react";

type AdminTab =
  | "overview"
  | "products"
  | "orders"
  | "users"
  | "applications"
  | "careers"
  | "categories"
  | "partners"
  | "reviews"
  | "payments";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, setUser, logout, checkAuth, isLoading: isAuthLoading } = useUserStore();

  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Dedicated Admin Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Tab Data States
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [careers, setCareers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [partnerRequests, setPartnerRequests] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStatusFilter, setReviewStatusFilter] = useState<"all" | "pending" | "approved" | "hidden">("all");
  const [reviewSearchQuery, setReviewSearchQuery] = useState("");
  const [reviewCounts, setReviewCounts] = useState({ total: 0, pending: 0, approved: 0, hidden: 0 });

  // Modals & Active Edit States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedPartnerRequest, setSelectedPartnerRequest] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Forms
  const [productForm, setProductForm] = useState({
    id: "",
    title: "",
    category: "Tailored Apparel",
    price: 199,
    salePrice: 169,
    stock: 50,
    description: "",
    images: [] as Array<{ url: string; color: string }>,
    isFeatured: true,
    showOnHomePage: false,
  });
  const [customImageUrl, setCustomImageUrl] = useState("");

  const [categoryForm, setCategoryForm] = useState({
    id: "",
    name: "",
    description: "",
  });

  const [careerForm, setCareerForm] = useState({
    id: "",
    title: "",
    department: "Engineering",
    location: "New York, NY",
    employmentType: "Full-Time",
    salaryRange: "$140,000 - $180,000",
    experience: "3+ Years",
    description: "",
    requirements: [] as string[],
  });
  const [requirementInput, setRequirementInput] = useState("");

  const [partnerForm, setPartnerForm] = useState({
    id: "",
    name: "",
    company: "",
    category: "Institutional",
    website: "",
    image: "",
    description: "",
  });

  const showToast = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Perform Admin Login
  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await api.post("/auth/login", {
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (res.success && res.data?.user) {
        if (res.data.user.role !== "admin") {
          setLoginError("This account does not have administrator privileges.");
          return;
        }
        setUser(res.data.user);
        showToast("success", `Welcome back, ${res.data.user.name || "Administrator"}!`);
        loadData();
      } else {
        setLoginError(res.message || "Invalid administrator credentials.");
      }
    } catch (err: any) {
      setLoginError(err.message || "Authentication network error occurred.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Quick 1-Click Login
  const handleQuickLogin = () => {
    setLoginEmail("admin@gmail.com");
    setLoginPassword("admin123");
    setTimeout(() => {
      handleAdminLogin();
    }, 50);
  };

  // Body scroll locking when any modal is open
  const isAnyModalOpen = isProductModalOpen || isCategoryModalOpen || isCareerModalOpen || isPartnerModalOpen || !!selectedApplication || !!selectedOrder;

  useEffect(() => {
    if (isAnyModalOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isAnyModalOpen]);

  // Load All Dashboard Data
  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      // 1. Stats
      const statsRes = await api.get("/admin/dashboard/stats");
      if (statsRes.success) setStats(statsRes.data?.stats);

      // 2. Products
      const prodRes = await api.get("/products?limit=100");
      if (prodRes.success) {
        const list = Array.isArray(prodRes.data)
          ? prodRes.data
          : prodRes.data?.products || [];
        setProducts(list);
      }

      // 3. Orders
      const orderRes = await api.get("/admin/orders");
      if (orderRes.success) {
        const list = Array.isArray(orderRes.data)
          ? orderRes.data
          : orderRes.data?.orders || [];
        setOrders(list);
      }

      // 4. Users
      const userRes = await api.get("/admin/users");
      if (userRes.success) {
        const list = Array.isArray(userRes.data)
          ? userRes.data
          : userRes.data?.users || [];
        setUsers(list);
      }

      // 5. Applications
      const appRes = await api.get("/admin/applications");
      if (appRes.success) {
        const list = Array.isArray(appRes.data)
          ? appRes.data
          : appRes.data?.applications || [];
        setApplications(list);
      }

      // 6. Careers
      const careerRes = await api.get("/careers");
      if (careerRes.success) {
        const list = Array.isArray(careerRes.data)
          ? careerRes.data
          : careerRes.data?.careers || [];
        setCareers(list);
      }

      // 7. Categories
      const catRes = await api.get("/categories");
      if (catRes.success) {
        const list = Array.isArray(catRes.data)
          ? catRes.data
          : catRes.data?.categories || [];
        setCategories(list);
      }

      // 8. Partners
      const partnerRes = await api.get("/partners");
      if (partnerRes.success) {
        const list = Array.isArray(partnerRes.data)
          ? partnerRes.data
          : partnerRes.data?.partners || [];
        setPartners(partnerRes.data?.partners || list);
      }

      // 8b. Partner Requests (Public Proposals)
      const pReqRes = await api.get("/partners/requests");
      if (pReqRes.success) {
        setPartnerRequests(pReqRes.data?.requests || []);
      }

      // 9. Reviews
      const revRes = await api.get("/admin/reviews");
      if (revRes.success) {
        const list = Array.isArray(revRes.data)
          ? revRes.data
          : revRes.data?.reviews || [];
        setReviews(list);
        if (revRes.data?.counts) {
          setReviewCounts(revRes.data.counts);
        } else {
          setReviewCounts({
            total: list.length,
            pending: list.filter((r: any) => r.status === "pending" || !r.isApproved).length,
            approved: list.filter((r: any) => r.status === "approved" || r.isApproved).length,
            hidden: list.filter((r: any) => r.status === "hidden").length,
          });
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      await checkAuth();
      if (isMounted) {
        setAuthChecked(true);
        loadData();
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [loadData, checkAuth]);

  // Product Image Upload (Max 3)
  const DEFAULT_PLACEHOLDER = "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800";

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    if (productForm.images.length >= 3) {
      showToast("error", "Maximum 3 images allowed per product.");
      return;
    }

    setUploadingImage(true);
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post("/products/upload-image", formData);
      if (res.success && res.data?.url) {
        setProductForm((prev) => ({
          ...prev,
          images: [...prev.images, { url: res.data.url, color: "" }].slice(0, 3),
        }));
        showToast("success", "Product image uploaded successfully!");
      } else {
        showToast("error", res.message || "Failed to upload image");
      }
    } catch (err: any) {
      showToast("error", err.message || "Network error uploading image");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleAddImageUrl = () => {
    if (!customImageUrl.trim()) return;
    if (productForm.images.length >= 3) {
      showToast("error", "Maximum 3 images allowed per product.");
      return;
    }
    setProductForm((prev) => ({
      ...prev,
      images: [...prev.images, { url: customImageUrl.trim(), color: "" }].slice(0, 3),
    }));
    setCustomImageUrl("");
    showToast("success", "Image URL added");
  };

  const handleRemoveProductImage = (indexToRemove: number) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleImageColorChange = (index: number, newColor: string) => {
    setProductForm((prev) => {
      const updated = [...prev.images];
      if (updated[index]) {
        updated[index] = { ...updated[index], color: newColor };
      }
      return { ...prev, images: updated };
    });
  };

  // Product CRUD
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (productForm.images.length === 0) {
      showToast("error", "Please upload or add at least 1 product photo.");
      return;
    }
    setSubmitting(true);
    try {
      const imageObjects = productForm.images.map((img) =>
        typeof img === "object" ? { url: img.url, color: (img.color || "").trim() } : { url: String(img), color: "" }
      );
      const imageUrls = imageObjects.map((img) => img.url);
      const uniqueColors = [...new Set(imageObjects.map((img) => img.color).filter(Boolean))];

      const payload = {
        title: productForm.title.trim(),
        category: productForm.category,
        price: Number(productForm.price),
        salePrice: productForm.salePrice ? Number(productForm.salePrice) : null,
        stock: Number(productForm.stock),
        description: productForm.description.trim(),
        images: imageUrls,
        imageObjects: imageObjects,
        colors: uniqueColors,
        color: uniqueColors[0] || "",
        isFeatured: productForm.isFeatured,
        showOnHomePage: (productForm as any).showOnHomePage ?? true,
      };

      let res;
      if (productForm.id) {
        res = await api.put(`/products/${productForm.id}`, payload);
      } else {
        res = await api.post("/products", payload);
      }

      if (!res.success) {
        showToast("error", res.message || "Failed to save product. Ensure you have admin privileges.");
        return;
      }

      showToast("success", productForm.id ? "Product updated successfully!" : "Product added successfully!");
      setIsProductModalOpen(false);
      setProductForm({
        id: "",
        title: "",
        category: categories[0]?.name || "Tailored Apparel",
        price: 199,
        salePrice: 169,
        stock: 50,
        description: "",
        images: [],
        isFeatured: true,
        showOnHomePage: true,
      });
      await loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProduct = (prod: any) => {
    let loadedImages: Array<{ url: string; color: string }> = [];
    if (Array.isArray(prod.imageObjects) && prod.imageObjects.length > 0) {
      loadedImages = prod.imageObjects.map((img: any) => ({
        url: typeof img === "object" ? img.url : img,
        color: typeof img === "object" ? img.color || "" : "",
      }));
    } else if (Array.isArray(prod.images) && prod.images.length > 0) {
      loadedImages = prod.images.map((img: any, idx: number) => ({
        url: typeof img === "object" ? img.url : img,
        color: typeof img === "object" ? img.color || "" : (prod.colors?.[idx] || prod.color || ""),
      }));
    }
    setProductForm({
      id: prod._id,
      title: prod.title || "",
      category: prod.category || categories[0]?.name || "Tailored Apparel",
      price: prod.price || 0,
      salePrice: prod.salePrice || 0,
      stock: prod.stock ?? 10,
      description: prod.description || "",
      images: loadedImages,
      isFeatured: !!prod.isFeatured,
      showOnHomePage: !!prod.showOnHomePage,
    } as any);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (!res.success) {
        showToast("error", res.message || "Failed to delete product");
        return;
      }
      showToast("success", "Product deleted successfully");
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete");
    }
  };

  const handleToggleProductFeatured = async (product: any) => {
    try {
      const res = await api.put(`/products/${product._id}`, { isFeatured: !product.isFeatured });
      if (!res.success) {
        showToast("error", res.message || "Failed to update product");
        return;
      }
      showToast("success", "Product status updated");
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to update");
    }
  };

  // Orders Status Update
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}/status`, { orderStatus: status });
      if (!res.success) {
        showToast("error", res.message || "Failed to update order status");
        return;
      }
      showToast("success", `Order updated to ${status}`);
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to update order status");
    }
  };

  // Category CRUD
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let res;
      if (categoryForm.id) {
        res = await api.put(`/categories/${categoryForm.id}`, {
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim(),
        });
      } else {
        res = await api.post("/categories", {
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim(),
        });
      }

      if (!res.success) {
        showToast("error", res.message || "Failed to save category");
        return;
      }
      showToast("success", categoryForm.id ? "Category updated successfully!" : "Category created successfully!");
      setIsCategoryModalOpen(false);
      setCategoryForm({ id: "", name: "", description: "" });
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCategory = (cat: any) => {
    setCategoryForm({
      id: cat._id,
      name: cat.name || "",
      description: cat.description || "",
    });
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await api.delete(`/categories/${id}`);
      if (!res.success) {
        showToast("error", res.message || "Failed to delete category");
        return;
      }
      showToast("success", "Category deleted successfully");
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete category");
    }
  };

  // Career CRUD
  const handleAddRequirement = () => {
    if (!requirementInput.trim()) return;
    setCareerForm((prev) => ({
      ...prev,
      requirements: [...(prev.requirements || []), requirementInput.trim()],
    }));
    setRequirementInput("");
  };

  const handleRemoveRequirement = (indexToRemove: number) => {
    setCareerForm((prev) => ({
      ...prev,
      requirements: (prev.requirements || []).filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleCareerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: careerForm.title.trim(),
        department: careerForm.department.trim(),
        location: careerForm.location.trim(),
        employmentType: careerForm.employmentType,
        salaryRange: careerForm.salaryRange.trim(),
        experience: careerForm.experience.trim() || "2+ Years",
        description: careerForm.description.trim(),
        requirements: careerForm.requirements || [],
      };

      let res;
      if (careerForm.id) {
        res = await api.put(`/careers/${careerForm.id}`, payload);
      } else {
        res = await api.post("/careers", payload);
      }

      if (!res.success) {
        showToast("error", res.message || "Failed to save job opening");
        return;
      }
      showToast("success", careerForm.id ? "Job opening updated successfully!" : "Career opening posted successfully!");
      setIsCareerModalOpen(false);
      setCareerForm({
        id: "",
        title: "",
        department: "Engineering",
        location: "New York, NY",
        employmentType: "Full-Time",
        salaryRange: "$140,000 - $180,000",
        experience: "3+ Years",
        description: "",
        requirements: [],
      });
      setRequirementInput("");
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to save job opening");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCareer = (job: any) => {
    setCareerForm({
      id: job._id,
      title: job.title || "",
      department: job.department || "Engineering",
      location: job.location || "New York, NY",
      employmentType: job.employmentType || job.type || "Full-Time",
      salaryRange: job.salaryRange || "",
      experience: job.experience || "2+ Years",
      description: job.description || "",
      requirements: Array.isArray(job.requirements) ? job.requirements : [],
    });
    setRequirementInput("");
    setIsCareerModalOpen(true);
  };

  const handleDeleteCareer = async (id: string) => {
    if (!confirm("Are you sure you want to remove this job opening?")) return;
    try {
      const res = await api.delete(`/careers/${id}`);
      if (!res.success) {
        showToast("error", res.message || "Failed to delete job opening");
        return;
      }
      showToast("success", "Job opening removed successfully");
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete job opening");
    }
  };

  // Job Applications
  const handleUpdateApplicationStatus = async (appId: string, status: string) => {
    try {
      const res = await api.patch(`/admin/applications/${appId}/status`, { status });
      if (!res.success) {
        showToast("error", res.message || "Failed to update application status");
        return;
      }
      showToast("success", `Application status updated to ${status}`);
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to update application status");
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    if (!window.confirm("Are you sure you want to delete this job application? This action cannot be undone.")) {
      return;
    }
    try {
      const res = await api.delete(`/admin/applications/${appId}`);
      if (!res.success) {
        showToast("error", res.message || "Failed to delete job application");
        return;
      }
      showToast("success", "Job application deleted successfully");
      if (selectedApplication?._id === appId) {
        setSelectedApplication(null);
      }
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete job application");
    }
  };


  // Partner CRUD with Picture Upload
  const handlePartnerPicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setUploadingImage(true);
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post("/products/upload-image", formData);
      if (res.success && res.data?.url) {
        setPartnerForm((prev) => ({ ...prev, image: res.data.url }));
        showToast("success", "Partner picture uploaded successfully!");
      } else {
        showToast("error", res.message || "Failed to upload image");
      }
    } catch (err: any) {
      showToast("error", err.message || "Error uploading image");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: partnerForm.name.trim(),
        company: partnerForm.company.trim() || partnerForm.name.trim(),
        category: partnerForm.category,
        website: partnerForm.website.trim(),
        image: partnerForm.image || "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=600",
        logo: partnerForm.image || "",
        description: partnerForm.description.trim() || "Institutional alliance partner.",
      };

      let res;
      if (partnerForm.id) {
        res = await api.put(`/partners/${partnerForm.id}`, payload);
      } else {
        res = await api.post("/partners", payload);
      }

      if (!res.success) {
        showToast("error", res.message || "Failed to save partner");
        return;
      }
      showToast("success", partnerForm.id ? "Partner updated successfully!" : "Partner created successfully!");
      setIsPartnerModalOpen(false);
      setPartnerForm({ id: "", name: "", company: "", category: "Institutional", website: "", image: "", description: "" });
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to save partner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPartner = (pt: any) => {
    setPartnerForm({
      id: pt._id,
      name: pt.name || "",
      company: pt.company || pt.name || "",
      category: pt.category || "Institutional",
      website: pt.website || "",
      image: pt.image || pt.logo || "",
      description: pt.description || pt.summary || "",
    });
    setIsPartnerModalOpen(true);
  };

  const handleDeletePartner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;
    try {
      const res = await api.delete(`/partners/${id}`);
      if (!res.success) {
        showToast("error", res.message || "Failed to delete partner");
        return;
      }
      showToast("success", "Partner removed successfully");
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete partner");
    }
  };

  const handleUpdatePartnerRequestStatus = async (id: string, status: string) => {
    try {
      const res = await api.patch(`/partners/requests/${id}/status`, { status });
      if (!res.success) {
        showToast("error", res.message || "Failed to update request status");
        return;
      }
      showToast("success", `Partner request status updated to ${status}`);
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to update request status");
    }
  };

  const handleDeletePartnerRequest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this partner request?")) return;
    try {
      const res = await api.delete(`/partners/requests/${id}`);
      if (!res.success) {
        showToast("error", res.message || "Failed to delete request");
        return;
      }
      showToast("success", "Partner request deleted successfully");
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete request");
    }
  };

  // Reviews Moderation Actions
  const handleUpdateReviewStatus = async (reviewId: string, status: "approved" | "hidden" | "pending") => {
    try {
      const res = await api.patch(`/admin/reviews/${reviewId}/status`, { status });
      if (!res.success) {
        showToast("error", res.message || "Failed to update review status");
        return;
      }
      showToast(
        "success",
        status === "approved"
          ? "Review approved & published live to website"
          : status === "hidden"
          ? "Review hidden from public website"
          : "Review moved to pending moderation"
      );
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to update review status");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to permanently delete this customer review from the database?")) return;
    try {
      const res = await api.delete(`/admin/reviews/${reviewId}`);
      if (!res.success) {
        showToast("error", res.message || "Failed to delete review");
        return;
      }
      showToast("success", "Review permanently deleted from database");
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete review");
    }
  };

  const isAdmin = user && user.role === "admin";

  // 1. Loading / Authentication Check State
  if (isAuthLoading || !authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-mono">Verifying Administrator Privileges...</p>
      </div>
    );
  }

  // 2. Deny Access to Non-Admin Logged-In Users
  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Access Denied</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Administrator privileges are required to view the Vespera Admin System.
              You are currently logged in as <strong className="text-slate-200">{user.email}</strong> (Standard User).
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/"
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              Return to Store Front
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
                setAuthChecked(true);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Sign Out &amp; Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW A: ADMIN LOGIN SCREEN (If not logged in)
  // ==========================================
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-sans relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-8 relative z-10 flex flex-col items-center">
          <VesperaLogo size="lg" subtitle="ADMIN OS" />
          <p className="text-xs text-slate-400 mt-3 font-mono">
            SECURE ENTERPRISE MANAGEMENT PORTAL
          </p>
        </div>

        {/* Login Box */}
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              Administrator Access
            </h1>
            <p className="text-xs text-slate-400">
              Sign in with your privileged credentials to manage catalog, orders, and system operations.
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" /> Admin Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-400 text-white rounded-xl px-4 py-3 text-xs outline-none transition-colors font-mono"
              />
            </div>

            <PasswordInput
              label="Password"
              labelIcon={<Lock className="w-3.5 h-3.5 text-amber-400" />}
              labelClassName="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5"
              inputClassName="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-400 text-white rounded-xl px-4 py-3 text-xs outline-none transition-colors font-mono"
              iconClassName="text-slate-400 hover:text-amber-400"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loginLoading}
            />

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Authenticating Securely...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>Login to Admin Console</span>
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Fast Login Helper */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Preset Credentials:</span>
              <span className="text-amber-400">admin@gmail.com / admin123</span>
            </div>

            <button
              type="button"
              onClick={handleQuickLogin}
              disabled={loginLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>⚡ 1-Click Fast Login (admin@gmail.com)</span>
            </button>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-xs text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1"
              >
                Return to Vespera Storefront <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW B: ACTIVE ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border text-xs sm:text-sm flex items-center gap-2 transition-all duration-300 ${
            feedback.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
              : "bg-red-950/90 border-red-500/50 text-red-200"
          }`}
        >
          {feedback.type === "success" ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Top Header - Visual match to Frontend Navbar */}
      <header className="h-20 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40 transition-all">
        <div className="flex items-center gap-3">
          <VesperaLogo size="md" subtitle="ADMIN OS" />
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <button
            onClick={loadData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-amber-400 border border-slate-700/60 text-sm font-semibold transition-all shadow-sm cursor-pointer active:scale-95"
            title="Refresh Admin Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-amber-400" : "text-amber-400"}`} />
            <span className="hidden sm:inline">Sync Data</span>
          </button>

          <Link
            href="/"
            className="text-sm font-semibold text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1.5 px-3.5 py-2 rounded-xl hover:bg-slate-800/60 cursor-pointer"
          >
            <span className="hidden sm:inline">Store Front</span>
            <ExternalLink className="w-4 h-4" />
          </Link>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-sm font-semibold text-white tracking-tight">{user?.name || "Vespera Administrator"}</p>
              <p className="text-[11px] text-amber-400 font-mono font-medium">SUPER_ADMIN ({user?.email || "admin@gmail.com"})</p>
            </div>
            <button
              onClick={async () => {
                await logout();
                router.push("/admin");
              }}
              className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
              title="Logout from Admin"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col justify-between p-4 hidden md:flex shrink-0">
          <div className="space-y-1">
            <p className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Management Suites
            </p>

            {[
              { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
              { id: "products", label: "Products Catalog", icon: Package, badge: products.length },
              { id: "orders", label: "Orders & Shipping", icon: ShoppingCart, badge: orders.length },
              { id: "categories", label: "Categories", icon: Filter, badge: categories.length },
              { id: "careers", label: "Careers Openings", icon: Briefcase, badge: careers.length },
              { id: "applications", label: "Job Applications", icon: FileCheck, badge: applications.length },
              { id: "partners", label: "Partner MOUs", icon: Building2, badge: partners.length },
              { id: "users", label: "User Accounts", icon: Users, badge: users.length },
              { id: "reviews", label: "Review Moderation", icon: Star, badge: reviewCounts.pending > 0 ? `${reviewCounts.pending} Pending` : reviewCounts.total || undefined },
              { id: "payments", label: "Payments & Stripe", icon: CreditCard },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-amber-400/10 text-amber-400 border border-amber-400/25 font-semibold shadow-inner"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-semibold ${
                        isActive
                          ? "bg-amber-400 text-slate-950"
                          : "bg-slate-800/90 text-slate-400"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-3.5 bg-slate-950/80 border border-slate-800/90 rounded-2xl space-y-1.5 text-[11px] text-slate-400 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-400">Environment</span>
              <span className="text-emerald-400 font-mono font-semibold">LIVE / CONNECTED</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-400">API Gateway</span>
              <span className="text-slate-300 font-mono">Port 5000</span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Mobile Tab Strip */}
          <div className="flex md:hidden overflow-x-auto gap-2 pb-2 scrollbar-none">
            {[
              { id: "overview", label: "Overview" },
              { id: "products", label: "Products" },
              { id: "orders", label: "Orders" },
              { id: "categories", label: "Categories" },
              { id: "careers", label: "Careers" },
              { id: "applications", label: "Applications" },
              { id: "partners", label: "Partners" },
              { id: "users", label: "Users" },
              { id: "reviews", label: "Reviews" },
              { id: "payments", label: "Payments" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? "bg-amber-400 text-slate-950 font-bold shadow-md"
                    : "bg-slate-800/90 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* 1. Dashboard Overview Heading & Description */}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Dashboard Overview
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-normal mt-1.5 leading-relaxed max-w-2xl">
                  Real-time operational summary across catalog inventory, customer fulfillment, applicant pipeline, and partner alliances.
                </p>
              </div>

              {/* 2. QUICK CATALOG & OPERATIONS CONTROLS */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    Quick Catalog &amp; Operations Controls
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed max-w-xl">
                    Instantly create items or launch operational workflows using preset admin forms.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    onClick={() => {
                      setProductForm({
                        id: "",
                        title: "",
                        category: categories[0]?.name || "Tailored Apparel",
                        price: 199,
                        salePrice: 169,
                        stock: 50,
                        description: "",
                        images: [],
                        isFeatured: true,
                        showOnHomePage: true,
                      });
                      setIsProductModalOpen(true);
                    }}
                    className="px-4 py-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-start gap-3 transition-all duration-200 cursor-pointer shadow-sm group active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0 group-hover:bg-amber-400/20 transition-colors">
                      <Plus className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="truncate">Add Product</span>
                  </button>

                  <button
                    onClick={() => {
                      setCategoryForm({ id: "", name: "", description: "" });
                      setIsCategoryModalOpen(true);
                    }}
                    className="px-4 py-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-start gap-3 transition-all duration-200 cursor-pointer shadow-sm group active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-400/20 transition-colors">
                      <Plus className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="truncate">Add Category</span>
                  </button>

                  <button
                    onClick={() => {
                      setCareerForm({
                        id: "",
                        title: "",
                        department: "Engineering",
                        location: "New York, NY",
                        employmentType: "Full-Time",
                        salaryRange: "$140,000 - $180,000",
                        experience: "3+ Years",
                        description: "",
                        requirements: [],
                      });
                      setRequirementInput("");
                      setIsCareerModalOpen(true);
                    }}
                    className="px-4 py-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-start gap-3 transition-all duration-200 cursor-pointer shadow-sm group active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-400/10 border border-indigo-400/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-400/20 transition-colors">
                      <Plus className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="truncate">Add Career</span>
                  </button>

                  <button
                    onClick={() => {
                      setPartnerForm({ id: "", name: "", company: "", category: "Institutional", website: "", image: "", description: "" });
                      setIsPartnerModalOpen(true);
                    }}
                    className="px-4 py-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-start gap-3 transition-all duration-200 cursor-pointer shadow-sm group active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shrink-0 group-hover:bg-cyan-400/20 transition-colors">
                      <Plus className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="truncate">Add Partner</span>
                  </button>
                </div>
              </div>

              {/* 3. DASHBOARD STATISTIC CARDS GRID */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Suite Operations &amp; Metrics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                  {[
                    {
                      id: "products" as AdminTab,
                      title: "Products Catalog",
                      value: products.length,
                      change: `${products.filter((p) => p.isFeatured).length} Featured Items`,
                      icon: Package,
                      color: "text-blue-400",
                    },
                    {
                      id: "orders" as AdminTab,
                      title: "Orders & Shipping",
                      value: stats?.totalOrders || orders.length,
                      change: `${orders.filter((o) => o.orderStatus === "Delivered" || o.paymentStatus === "Paid").length} Fulfilled / Paid`,
                      icon: ShoppingCart,
                      color: "text-amber-400",
                    },
                    {
                      id: "categories" as AdminTab,
                      title: "Categories",
                      value: categories.length,
                      change: "Active Departments",
                      icon: Filter,
                      color: "text-emerald-400",
                    },
                    {
                      id: "careers" as AdminTab,
                      title: "Careers Openings",
                      value: careers.length,
                      change: "Published Positions",
                      icon: Briefcase,
                      color: "text-indigo-400",
                    },
                    {
                      id: "applications" as AdminTab,
                      title: "Job Applications",
                      value: applications.length,
                      change: `${applications.filter((a) => a.status === "Pending").length || applications.length} Candidates Pending`,
                      icon: FileCheck,
                      color: "text-purple-400",
                    },
                    {
                      id: "partners" as AdminTab,
                      title: "Partner MOUs",
                      value: partners.length,
                      change: "Active Institutional Alliances",
                      icon: Building2,
                      color: "text-cyan-400",
                    },
                    {
                      id: "users" as AdminTab,
                      title: "User Accounts",
                      value: users.length,
                      change: `${users.filter((u) => u.role === "admin").length} Administrators`,
                      icon: Users,
                      color: "text-sky-400",
                    },
                    {
                      id: "reviews" as AdminTab,
                      title: "Review Moderation",
                      value: reviews.length,
                      change: `${reviews.filter((r) => r.isApproved).length} Approved Reviews`,
                      icon: Star,
                      color: "text-rose-400",
                    },
                    {
                      id: "payments" as AdminTab,
                      title: "Payments & Stripe",
                      value: formatCurrency(stats?.totalRevenue || 12450),
                      change: "100% Verified Settlement",
                      icon: CreditCard,
                      color: "text-emerald-400",
                    },
                  ].map((card) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.id}
                        onClick={() => setActiveTab(card.id)}
                        className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900/90 transition-all duration-200 shadow-lg cursor-pointer group flex flex-col justify-between space-y-3 active:scale-[0.99]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
                            {card.title}
                          </span>
                          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 group-hover:border-slate-700 transition-colors">
                            <Icon className={`w-4 h-4 ${card.color}`} />
                          </div>
                        </div>

                        <div>
                          <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                            {card.value}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                          <span className="text-emerald-400 font-medium font-mono">{card.change}</span>
                          <span className="text-slate-500 group-hover:text-amber-400 transition-colors flex items-center gap-0.5 text-[10px] font-semibold">
                            Manage <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOG (CRUD + Max 3 Images) */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Products Catalog
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 font-normal mt-1.5 leading-relaxed max-w-2xl">
                    Manage storefront product specifications, multi-photo showcases, category departments, stock inventory, and pricing details.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setProductForm({
                      id: "",
                      title: "",
                      category: categories[0]?.name || "Tailored Apparel",
                      price: 199,
                      salePrice: 169,
                      stock: 50,
                      description: "",
                      images: [],
                      isFeatured: true,
                      showOnHomePage: true,
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all duration-200 active:scale-95 shrink-0"
                >
                  <Plus className="w-4.5 h-4.5 text-slate-950" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-300 font-semibold text-xs sm:text-sm">
                      <tr>
                        <th className="py-4 px-5">Product Details</th>
                        <th className="py-4 px-5">Category</th>
                        <th className="py-4 px-5">Color</th>
                        <th className="py-4 px-5">Price / Sale</th>
                        <th className="py-4 px-5">Stock Level</th>
                        <th className="py-4 px-5">Showcase Photos</th>
                        <th className="py-4 px-5">Featured Status</th>
                        <th className="py-4 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {products.map((prod) => {
                        const img = Array.isArray(prod.images) ? prod.images[0] : prod.images;
                        const displayColor = prod.color || (Array.isArray(prod.colors) && prod.colors.length > 0 ? prod.colors[0] : null);
                        return (
                          <tr key={prod._id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3.5">
                                <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden relative shrink-0 shadow-sm">
                                  {img ? (
                                    <img src={getImageUrl(img, FALLBACK_PRODUCT_IMAGE)} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">
                                      No Pic
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-white text-sm sm:text-base line-clamp-1">{prod.title}</p>
                                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{prod.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-5 text-slate-300">
                              <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-medium inline-block">
                                {prod.category}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-slate-300 font-medium">
                              {displayColor ? (
                                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 text-xs font-semibold">
                                  {displayColor}
                                </span>
                              ) : (
                                <span className="text-slate-500 italic text-xs">Not specified</span>
                              )}
                            </td>
                            <td className="py-4 px-5">
                              <p className="font-bold text-white text-sm sm:text-base">{formatCurrency(prod.price)}</p>
                              {prod.salePrice && (
                                <p className="text-xs font-semibold text-amber-400 mt-0.5">Sale: {formatCurrency(prod.salePrice)}</p>
                              )}
                            </td>
                            <td className="py-4 px-5">
                              <span className={`font-mono text-xs sm:text-sm font-semibold ${prod.stock < 10 ? "text-red-400 font-bold" : "text-slate-200"}`}>
                                {prod.stock} units
                              </span>
                            </td>
                            <td className="py-4 px-5">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono font-medium">
                                {Array.isArray(prod.images) ? prod.images.length : 1} / 3 Photos
                              </span>
                            </td>
                            <td className="py-4 px-5">
                              <button
                                onClick={() => handleToggleProductFeatured(prod)}
                                className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all duration-200 active:scale-95 ${
                                  prod.isFeatured
                                    ? "bg-amber-400/10 text-amber-400 border border-amber-400/30"
                                    : "bg-slate-800 text-slate-400 border border-slate-700/40"
                                }`}
                              >
                                {prod.isFeatured ? "★ Featured" : "Regular"}
                              </button>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditProduct(prod)}
                                  className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-amber-400 border border-slate-700/60 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                                  title="Edit Product"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod._id)}
                                  className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Orders &amp; Fulfillment
                </h2>
                <p className="text-xs text-slate-400">
                  Track all incoming customer purchases, review cart details, and manage delivery statuses.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="p-4">Order #</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Shipping Destination</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Payment</th>
                        <th className="p-4">Status &amp; Action</th>
                        <th className="p-4 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {orders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-4 font-mono font-bold text-amber-400">
                            {ord._id ? ord._id.slice(-8).toUpperCase() : "ORD-NEW"}
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-white">{ord.user?.name || ord.shippingAddress?.fullName || "Customer"}</p>
                            <p className="text-[11px] text-slate-400">{ord.user?.email || ord.shippingAddress?.email || "customer@vespera.com"}</p>
                          </td>
                          <td className="p-4 text-slate-300">
                            {ord.shippingAddress?.city || "New York"}, {ord.shippingAddress?.country || "USA"}
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-white">{formatCurrency(ord.total || 0)}</p>
                            <p className="text-[10px] text-slate-400">{ord.orderItems?.length || ord.items?.length || 1} item(s)</p>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold uppercase text-slate-300">{ord.paymentMethod || "stripe"}</span>
                            <span className="block text-[10px] text-emerald-400 font-semibold">{ord.paymentStatus || "Paid"}</span>
                          </td>
                          <td className="p-4">
                            <select
                              value={ord.orderStatus || "Processing"}
                              onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                              className="bg-slate-950 border border-slate-700 hover:border-amber-500/80 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400 cursor-pointer transition-colors"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-400 border border-slate-700/60 text-xs font-semibold cursor-pointer transition-all active:scale-95 shadow-sm"
                            >
                              View Breakdown
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIES (CRUD) */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Product Categories
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-normal mt-1 leading-relaxed max-w-2xl">
                    Create, edit, and organize product departments for storefront navigation.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCategoryForm({ id: "", name: "", description: "" });
                    setIsCategoryModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div key={cat._id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-all shadow-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-bold text-white">{cat.name}</h4>
                        <span className="text-xs font-mono font-medium text-amber-400">/{cat.slug}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCategory(cat)}
                          className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-amber-400 border border-slate-700/60 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed line-clamp-2">
                      {cat.description || "Active storefront shopping department."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CAREERS OPENINGS (CRUD) */}
          {activeTab === "careers" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                    Careers Openings
                  </h1>
                  <p className="text-sm sm:text-base text-slate-400 font-normal mt-1.5 leading-relaxed max-w-2xl">
                    Post and manage job opportunities visible on the public careers portal.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCareerForm({
                      id: "",
                      title: "",
                      department: "Engineering",
                      location: "New York, NY",
                      employmentType: "Full-Time",
                      salaryRange: "$140,000 - $180,000",
                      experience: "3+ Years",
                      description: "",
                      requirements: [],
                    });
                    setRequirementInput("");
                    setIsCareerModalOpen(true);
                  }}
                  className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all duration-200 active:scale-95 shrink-0"
                >
                  <Plus className="w-4.5 h-4.5 text-slate-950" />
                  <span>Post Job Opening</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {careers.map((job) => (
                  <div key={job._id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-all shadow-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-mono font-semibold text-amber-400 uppercase bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/20">
                          {job.department}
                        </span>
                        <h4 className="text-base sm:text-lg font-semibold text-white mt-1.5">{job.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCareer(job)}
                          className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-amber-400 border border-slate-700/60 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                          title="Edit Job Opening"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCareer(job._id)}
                          className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                          title="Delete Job Opening"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed line-clamp-2">{job.description}</p>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400 border-t border-slate-800 pt-3">
                      <span>{job.location} • {job.employmentType || job.type || "Full-Time"}</span>
                      <span className="text-emerald-400 font-semibold">{job.salaryRange || "Competitive"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: JOB APPLICATIONS (CV Download & Review) */}
          {activeTab === "applications" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  Job Applications
                </h1>
                <p className="text-sm sm:text-base text-slate-400 font-normal mt-1.5 leading-relaxed max-w-2xl">
                  Review applicant profiles, inspect submitted CV documents, and manage hiring decisions.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-300 font-semibold text-xs sm:text-sm">
                      <tr>
                        <th className="py-4 px-5">Candidate</th>
                        <th className="py-4 px-5">Role Applied</th>
                        <th className="py-4 px-5">Submitted Date</th>
                        <th className="py-4 px-5">CV / Resume Document</th>
                        <th className="py-4 px-5">Status &amp; Action</th>
                        <th className="py-4 px-5 text-right">Review</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {applications.map((app) => (
                        <tr key={app._id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-4 px-5 align-middle">
                            <p className="font-semibold text-white text-base sm:text-lg">{app.fullName}</p>
                            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal">{app.email} • {app.phone || "No phone"}</p>
                          </td>
                          <td className="py-4 px-5 align-middle">
                            <p className="font-semibold text-slate-200 text-sm sm:text-base">{app.jobTitle || app.job?.title || "Role Applicant"}</p>
                            <p className="text-xs sm:text-sm font-mono font-medium text-amber-400 mt-1">{app.department || app.job?.department || "Department"}</p>
                          </td>
                          <td className="py-4 px-5 text-slate-300 text-xs sm:text-sm font-medium align-middle">
                            {new Date(app.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="py-4 px-5 align-middle">
                            {app.resumeUrl ? (
                              <a
                                href={app.resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                              >
                                <Download className="w-4 h-4" />
                                <span>View / Download CV</span>
                              </a>
                            ) : (
                              <span className="text-slate-500 italic text-xs">No CV Attached</span>
                            )}
                          </td>
                          <td className="py-4 px-5 align-middle">
                            <select
                              value={app.status || "Pending"}
                              onChange={(e) => handleUpdateApplicationStatus(app._id, e.target.value)}
                              className="bg-slate-950 border border-slate-700 hover:border-amber-500/80 text-white rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-400 cursor-pointer transition-colors"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Reviewed">Reviewed</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Rejected">Rejected</option>
                              <option value="Hired">Hired</option>
                            </select>
                          </td>
                          <td className="py-4 px-5 text-right align-middle">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedApplication(app)}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-400 border border-slate-700/60 text-xs font-semibold cursor-pointer transition-all active:scale-95 shadow-sm"
                              >
                                Inspect Profile
                              </button>
                              <button
                                onClick={() => handleDeleteApplication(app._id)}
                                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-semibold cursor-pointer transition-all active:scale-95 shadow-sm"
                                title="Delete Application"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PARTNERS (Requests & Catalog MOUs) */}
          {activeTab === "partners" && (
            <div className="space-y-10">
              {/* SECTION A: Received Public Partner Requests & Inquiries */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-amber-400" />
                      Received Partner Proposals &amp; Inquiries
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 font-normal mt-1 leading-relaxed">
                      Proposals and partner inquiries submitted by corporate entities through the public Vespera Storefront.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                    {partnerRequests.length} Total Submissions
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-300 font-semibold text-xs sm:text-sm">
                        <tr>
                          <th className="py-4 px-5">Company / Entity</th>
                          <th className="py-4 px-5">Contact Officer</th>
                          <th className="py-4 px-5">Partnership Type</th>
                          <th className="py-4 px-5">Date Submitted</th>
                          <th className="py-4 px-5">Status</th>
                          <th className="py-4 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {partnerRequests.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 text-xs sm:text-sm">
                              No public partner inquiries submitted yet.
                            </td>
                          </tr>
                        ) : (
                          partnerRequests.map((req) => (
                            <tr key={req._id} className="hover:bg-slate-800/50 transition-colors">
                              <td className="py-4 px-5 align-middle">
                                <p className="font-semibold text-white text-base">{req.companyName}</p>
                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{req.message}</p>
                              </td>
                              <td className="py-4 px-5 align-middle">
                                <p className="font-semibold text-slate-200">{req.contactName}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{req.email} • {req.phone}</p>
                              </td>
                              <td className="py-4 px-5 align-middle">
                                <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold text-xs">
                                  {req.partnershipType || "MOU"}
                                </span>
                              </td>
                              <td className="py-4 px-5 text-slate-300 text-xs font-mono align-middle">
                                {new Date(req.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </td>
                              <td className="py-4 px-5 align-middle">
                                <select
                                  value={req.status || "Pending"}
                                  onChange={(e) => handleUpdatePartnerRequestStatus(req._id, e.target.value)}
                                  className="bg-slate-950 border border-slate-700 hover:border-amber-500/80 text-white rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-amber-400 cursor-pointer transition-colors"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Reviewed">Reviewed</option>
                                  <option value="Approved">Approved</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                              </td>
                              <td className="py-4 px-5 text-right align-middle">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setSelectedPartnerRequest(req)}
                                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-400 border border-slate-700 text-xs font-semibold cursor-pointer transition-all active:scale-95 shadow-sm"
                                  >
                                    Inspect Brief
                                  </button>
                                  <button
                                    onClick={() => handleDeletePartnerRequest(req._id)}
                                    className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all cursor-pointer active:scale-95"
                                    title="Delete Request"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* SECTION B: Signed Institutional Alliances & Catalog Partners */}
              <div className="space-y-4 pt-6 border-t border-slate-800/80">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                      Signed Institutional Alliances &amp; MOUs
                    </h2>
                    <p className="text-sm sm:text-base text-slate-400 font-normal mt-1.5 leading-relaxed max-w-2xl">
                      Manage official brand partners, institutional MOUs, and custom partner images.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPartnerForm({ id: "", name: "", company: "", category: "Institutional", website: "", image: "", description: "" });
                      setIsPartnerModalOpen(true);
                    }}
                    className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all duration-200 active:scale-95 shrink-0"
                  >
                    <Plus className="w-4.5 h-4.5 text-slate-950" />
                    <span>Add Signed Partner</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {partners.map((pt) => (
                    <div key={pt._id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-all shadow-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden relative shrink-0">
                          {pt.image || pt.logo ? (
                            <img src={getImageUrl(pt.image || pt.logo, FALLBACK_PARTNER_IMAGE)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">
                              No Logo
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-mono font-semibold text-amber-400 uppercase bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/20">
                            {pt.category || "Institutional"}
                          </span>
                          <h4 className="text-base sm:text-lg font-semibold text-white truncate mt-1">{pt.name}</h4>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed line-clamp-2">{pt.description || pt.summary}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs sm:text-sm text-slate-400">
                        <span className="truncate">Org: <strong className="text-slate-200 font-medium">{pt.company || pt.name}</strong></span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleEditPartner(pt)}
                            className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-amber-400 border border-slate-700/60 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                            title="Edit Partner"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePartner(pt._id)}
                            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                            title="Delete Partner"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: USERS */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  User Accounts Directory
                </h2>
                <p className="text-sm sm:text-base text-slate-400 font-normal mt-1.5 leading-relaxed max-w-2xl">
                  Inspect registered users, role privileges, and verification status.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-300 font-semibold text-xs sm:text-sm">
                      <tr>
                        <th className="py-4 px-5">User Name</th>
                        <th className="py-4 px-5">Email</th>
                        <th className="py-4 px-5">Role</th>
                        <th className="py-4 px-5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-4 px-5 font-semibold text-white text-base sm:text-lg align-middle">{u.name}</td>
                          <td className="py-4 px-5 text-slate-300 text-xs sm:text-sm font-mono align-middle">{u.email}</td>
                          <td className="py-4 px-5 align-middle">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase ${
                              u.role === "admin" ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" : "bg-slate-800 text-slate-300 border border-slate-700"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 px-5 align-middle">
                            <span className="text-emerald-400 text-xs sm:text-sm font-semibold">Active</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: REVIEWS MODERATION */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                    Review Moderation
                  </h2>
                  <p className="text-sm text-slate-400 font-normal mt-1 leading-relaxed max-w-2xl">
                    Inspect, approve, hide, and manage verified customer product reviews.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadData}
                  disabled={refreshing}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
                  Refresh
                </button>
              </div>

              {/* Stats KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Total Reviews</span>
                  <p className="text-2xl font-bold text-white">{reviewCounts.total}</p>
                  <p className="text-[11px] text-slate-500">All customer feedback</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 bg-amber-500/5 space-y-1">
                  <span className="text-xs text-amber-400 font-medium">Pending Moderation</span>
                  <p className="text-2xl font-bold text-amber-400">{reviewCounts.pending}</p>
                  <p className="text-[11px] text-slate-400">Needs admin approval</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 bg-emerald-500/5 space-y-1">
                  <span className="text-xs text-emerald-400 font-medium">Approved &amp; Live</span>
                  <p className="text-2xl font-bold text-emerald-400">{reviewCounts.approved}</p>
                  <p className="text-[11px] text-slate-400">Visible on product pages</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Hidden</span>
                  <p className="text-2xl font-bold text-slate-300">{reviewCounts.hidden}</p>
                  <p className="text-[11px] text-slate-500">Unpublished feedback</p>
                </div>
              </div>

              {/* Filter Tabs & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: "all", label: "All Reviews", count: reviewCounts.total },
                    { id: "pending", label: "Pending", count: reviewCounts.pending },
                    { id: "approved", label: "Approved", count: reviewCounts.approved },
                    { id: "hidden", label: "Hidden", count: reviewCounts.hidden },
                  ].map((filterTab) => (
                    <button
                      key={filterTab.id}
                      type="button"
                      onClick={() => setReviewStatusFilter(filterTab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        reviewStatusFilter === filterTab.id
                          ? "bg-amber-400 text-slate-950 font-bold shadow"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      <span>{filterTab.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        reviewStatusFilter === filterTab.id
                          ? "bg-slate-950/20 text-slate-950 font-black"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {filterTab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search reviewer or product..."
                    value={reviewSearchQuery}
                    onChange={(e) => setReviewSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 text-xs text-slate-100 placeholder:text-slate-500 pl-8 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Reviews Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-300 font-semibold text-xs">
                      <tr>
                        <th className="py-4 px-5">Customer / Reviewer</th>
                        <th className="py-4 px-5">Product</th>
                        <th className="py-4 px-5">Rating</th>
                        <th className="py-4 px-5">Review Text</th>
                        <th className="py-4 px-5">Submitted Date</th>
                        <th className="py-4 px-5">Status</th>
                        <th className="py-4 px-5 text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {reviews
                        .filter((rev) => {
                          const status = rev.status || (rev.isApproved ? "approved" : "pending");
                          if (reviewStatusFilter !== "all" && status !== reviewStatusFilter) return false;
                          if (reviewSearchQuery.trim()) {
                            const q = reviewSearchQuery.toLowerCase();
                            const name = (rev.userName || rev.user?.name || "").toLowerCase();
                            const email = (rev.userEmail || rev.user?.email || "").toLowerCase();
                            const prodTitle = (rev.product?.title || "").toLowerCase();
                            const comment = (rev.comment || "").toLowerCase();
                            return name.includes(q) || email.includes(q) || prodTitle.includes(q) || comment.includes(q);
                          }
                          return true;
                        })
                        .map((rev) => {
                          const status = rev.status || (rev.isApproved ? "approved" : "pending");
                          return (
                            <tr key={rev._id} className="hover:bg-slate-800/40 transition-colors">
                              {/* Customer */}
                              <td className="py-4 px-5 align-top">
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-white text-sm">
                                    {rev.userName || rev.user?.name || "Customer"}
                                  </div>
                                  <div className="text-slate-400 font-mono text-[11px] truncate max-w-[180px]">
                                    {rev.userEmail || rev.user?.email || "No email"}
                                  </div>
                                  {rev.order && (
                                    <div className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
                                      <ShieldCheck className="w-2.5 h-2.5" />
                                      <span>Order #{rev.order.orderId || "Verified"}</span>
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Product */}
                              <td className="py-4 px-5 align-top">
                                <div className="space-y-1">
                                  <div className="font-semibold text-white text-xs line-clamp-1 max-w-[180px]">
                                    {rev.product?.title || "Product"}
                                  </div>
                                  {rev.product?.slug && (
                                    <Link
                                      href={`/shop/${rev.product.slug}`}
                                      target="_blank"
                                      className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:underline"
                                    >
                                      <span>View in Store</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </Link>
                                  )}
                                </div>
                              </td>

                              {/* Rating */}
                              <td className="py-4 px-5 align-top">
                                <div className="space-y-1">
                                  <div className="flex text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3.5 h-3.5 ${
                                          i < (rev.rating || 5)
                                            ? "fill-amber-400"
                                            : "text-slate-700"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[11px] font-bold text-slate-300">
                                    {rev.rating} / 5 Stars
                                  </span>
                                </div>
                              </td>

                              {/* Comment */}
                              <td className="py-4 px-5 align-top">
                                <p className="text-slate-300 text-xs leading-relaxed max-w-xs break-words italic">
                                  &quot;{rev.comment}&quot;
                                </p>
                              </td>

                              {/* Submitted Date */}
                              <td className="py-4 px-5 text-slate-400 text-xs font-mono align-top whitespace-nowrap">
                                {new Date(rev.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </td>

                              {/* Status Badge */}
                              <td className="py-4 px-5 align-top whitespace-nowrap">
                                <span
                                  className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase ${
                                    status === "approved"
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      : status === "hidden"
                                      ? "bg-slate-800 text-slate-400 border border-slate-700"
                                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                                  }`}
                                >
                                  {status === "approved"
                                    ? "Approved"
                                    : status === "hidden"
                                    ? "Hidden"
                                    : "Pending"}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="py-4 px-5 text-right align-top whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  {status !== "approved" && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateReviewStatus(rev._id, "approved")}
                                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                                      title="Approve and make visible on website"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Approve</span>
                                    </button>
                                  )}
                                  {status !== "hidden" && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateReviewStatus(rev._id, "hidden")}
                                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                                      title="Hide from website"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Hide</span>
                                    </button>
                                  )}
                                  {status !== "pending" && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateReviewStatus(rev._id, "pending")}
                                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
                                      title="Move back to pending moderation"
                                    >
                                      <span>Pending</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteReview(rev._id)}
                                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                                    title="Permanently Delete Review"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  {reviews.length === 0 && (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No customer reviews found in the database.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: PAYMENTS */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  Stripe Payment Integrations
                </h2>
                <p className="text-sm sm:text-base text-slate-400 font-normal mt-1.5 leading-relaxed max-w-2xl">
                  Real-time webhook events, PCI-DSS compliance, and settlement ledger.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-xs sm:text-sm text-slate-400 font-medium">Gateway Status</span>
                  <p className="text-xl sm:text-2xl font-semibold text-emerald-400">ACTIVE</p>
                  <p className="text-xs sm:text-sm text-slate-400 font-normal">Stripe Webhook Listener Registered</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-xs sm:text-sm text-slate-400 font-medium">Settled Volume</span>
                  <p className="text-xl sm:text-2xl font-semibold text-white">{formatCurrency(stats?.totalRevenue || 12450)}</p>
                  <p className="text-xs sm:text-sm text-slate-400 font-normal">100% verified server-side transactions</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-xs sm:text-sm text-slate-400 font-medium">Payment Modes</span>
                  <p className="text-xl sm:text-2xl font-semibold text-amber-400">Cards &amp; COD</p>
                  <p className="text-xs sm:text-sm text-slate-400 font-normal">Global credit card &amp; cash fulfillment</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =================================================== */}
      {/* PRODUCT MODAL (Wide Landscape Layout & Smooth Anim) */}
      {/* =================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-overlay-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-3xl sm:max-w-4xl w-full shadow-2xl my-auto animate-modal-in space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-xl text-white tracking-tight">
                  {productForm.id ? "Edit Product Details" : "Add Product"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-normal">
                  Configure catalog product specifications, price, inventory stock, and photo colors.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Datalist for color suggestions */}
            <datalist id="color-suggestions">
              <option value="Black" />
              <option value="White" />
              <option value="Red" />
              <option value="Navy Blue" />
              <option value="Sky Blue" />
              <option value="Maroon" />
              <option value="Beige" />
              <option value="Olive Green" />
              <option value="Matte Black" />
              <option value="Rose Gold" />
              <option value="Multi Color" />
            </datalist>

            {/* Form */}
            <form onSubmit={handleProductSubmit} className="space-y-5 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-200 font-semibold mb-1.5 block">
                    Product Title <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    placeholder="e.g. Vespera Cashmere Overcoat"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-amber-400/80 transition-colors text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-200 font-semibold mb-1.5 block">
                    Category <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-amber-400/80 transition-colors text-xs sm:text-sm cursor-pointer"
                  >
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c._id} value={c.name}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Tailored Apparel">Tailored Apparel</option>
                        <option value="Tech & Smart Accessories">Tech & Smart Accessories</option>
                        <option value="Health & Personal Care">Health & Personal Care</option>
                        <option value="Home & Living">Home & Living</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-200 font-semibold mb-1.5 block">
                    Regular Price ($ USD) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-amber-400/80 transition-colors text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-200 font-semibold mb-1.5 block">
                    Sale Price ($ USD, Optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={productForm.salePrice || ""}
                    onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value ? Number(e.target.value) : 0 })}
                    placeholder="Discount price"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-amber-400/80 transition-colors text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-200 font-semibold mb-1.5 block">
                    Stock Quantity <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-amber-400/80 transition-colors text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Product Images Box - Per Image Color Specification */}
              <div className="space-y-3 border border-slate-800/90 p-4 rounded-2xl bg-slate-950/60">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-slate-200 font-semibold block text-xs sm:text-sm">
                      Product Showcase Photos &amp; Image Colors ({productForm.images.length} / 3)
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Upload photos and specify the color for EACH uploaded image separately.
                    </p>
                  </div>
                  <span className="text-xs text-amber-400 font-mono font-bold bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                    Max 3 photos
                  </span>
                </div>

                {/* 3 Image Preview Cards with Per-Image Color Input */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {productForm.images.map((imgItem, idx) => {
                    const imgUrl = typeof imgItem === "object" ? imgItem.url : imgItem;
                    const imgColor = typeof imgItem === "object" ? imgItem.color || "" : "";
                    return (
                      <div
                        key={idx}
                        className="p-3 bg-slate-900 border border-slate-700/80 rounded-xl space-y-2 relative shadow-md flex flex-col justify-between"
                      >
                        <div className="relative h-28 w-full rounded-lg overflow-hidden bg-slate-950">
                          <img
                            src={getImageUrl(imgUrl, FALLBACK_PRODUCT_IMAGE)}
                            alt={`Upload ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveProductImage(idx)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white transition-colors shadow cursor-pointer"
                            title="Delete this image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="absolute bottom-2 left-2 bg-slate-950/85 text-[10px] text-amber-400 px-2 py-0.5 rounded font-mono font-bold border border-slate-800">
                            Image #{idx + 1}
                          </span>
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                            Color:
                          </label>
                          <input
                            type="text"
                            list="color-suggestions"
                            value={imgColor}
                            onChange={(e) => handleImageColorChange(idx, e.target.value)}
                            placeholder="e.g. Black, White, Navy..."
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-amber-400/80 transition-colors font-mono"
                          />
                        </div>
                      </div>
                    );
                  })}

                  {Array.from({ length: 3 - productForm.images.length }).map((_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      className="h-36 rounded-xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 text-xs bg-slate-950/40 p-3 space-y-1 text-center"
                    >
                      <Package className="w-6 h-6 opacity-40 text-slate-400" />
                      <span className="font-mono text-slate-400 font-semibold text-xs">
                        Image Box {productForm.images.length + idx + 1} — EMPTY
                      </span>
                      <span className="text-[10px] text-slate-500">No image selected</span>
                    </div>
                  ))}
                </div>

                {/* Upload & Add URL Controls */}
                {productForm.images.length < 3 && (
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-6">
                      <label className="cursor-pointer block">
                        <div className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm">
                          {uploadingImage ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                              <span>Uploading Photo...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-amber-400" />
                              <span>Upload Photo File</span>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={handleProductImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="sm:col-span-6 flex gap-2">
                      <input
                        type="url"
                        placeholder="Or paste image URL (https://...)"
                        value={customImageUrl}
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs cursor-pointer transition-colors shadow-sm"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-200 font-semibold mb-1.5 block">
                  Product Description <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Detailed specifications, materials, and artisan finish..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-amber-400/80 transition-colors text-xs sm:text-sm leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label htmlFor="featuredCheck" className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    id="featuredCheck"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm text-slate-200 font-medium">
                    Feature on Best Sellers &amp; Featured List
                  </span>
                </label>

                <label htmlFor="homePageCheck" className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    id="homePageCheck"
                    checked={(productForm as any).showOnHomePage || false}
                    onChange={(e) => setProductForm({ ...productForm, showOnHomePage: e.target.checked } as any)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm text-slate-200 font-medium">
                    Display on Homepage Main Grid (max 8)
                  </span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 shadow-md"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin text-slate-950" />}
                  <span>{productForm.id ? "Update Product" : "Add Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* CATEGORY MODAL (Create & Edit)                      */}
      {/* =================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-overlay-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl animate-modal-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">
                {categoryForm.id ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Fine Jewelry & Timepieces"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Description</label>
                <textarea
                  rows={3}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Category department overview..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md transition-all"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{categoryForm.id ? "Update Category" : "Create Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* CAREER MODAL (Create & Edit)                        */}
      {/* =================================================== */}
      {isCareerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-overlay-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl animate-modal-in flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">
                {careerForm.id ? "Edit Career Opening" : "Post Job Opening"}
              </h3>
              <button
                type="button"
                onClick={() => setIsCareerModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCareerSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Job Title</label>
                <input
                  type="text"
                  required
                  value={careerForm.title}
                  onChange={(e) => setCareerForm({ ...careerForm, title: e.target.value })}
                  placeholder="e.g. Lead Brand Strategist"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Department</label>
                  <input
                    type="text"
                    required
                    value={careerForm.department}
                    onChange={(e) => setCareerForm({ ...careerForm, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Location</label>
                  <input
                    type="text"
                    required
                    value={careerForm.location}
                    onChange={(e) => setCareerForm({ ...careerForm, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Type</label>
                  <select
                    value={careerForm.employmentType}
                    onChange={(e) => setCareerForm({ ...careerForm, employmentType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Experience</label>
                  <input
                    type="text"
                    value={careerForm.experience}
                    onChange={(e) => setCareerForm({ ...careerForm, experience: e.target.value })}
                    placeholder="e.g. 3+ Years"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Salary Range</label>
                <input
                  type="text"
                  value={careerForm.salaryRange}
                  onChange={(e) => setCareerForm({ ...careerForm, salaryRange: e.target.value })}
                  placeholder="e.g. $140,000 - $180,000"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Description &amp; Responsibilities</label>
                <textarea
                  rows={3}
                  required
                  value={careerForm.description}
                  onChange={(e) => setCareerForm({ ...careerForm, description: e.target.value })}
                  placeholder="Key responsibilities and qualifications..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Key Requirements</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={requirementInput}
                    onChange={(e) => setRequirementInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                    placeholder="e.g. React.js, Node.js, REST APIs..."
                    className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddRequirement}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors shrink-0 text-xs"
                  >
                    + Add
                  </button>
                </div>

                {careerForm.requirements && careerForm.requirements.length > 0 ? (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {careerForm.requirements.map((req, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                      >
                        <span className="flex-1 truncate">{req}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRequirement(index)}
                          className="text-slate-400 hover:text-rose-400 transition-colors p-0.5"
                          title="Remove requirement"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">No requirements added yet. Add requirements above.</p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCareerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md transition-all"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{careerForm.id ? "Update Role" : "Publish Role"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* PARTNER MODAL (Wide Landscape Layout & Picture Upload) */}
      {/* =================================================== */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-overlay-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-2xl sm:max-w-3xl w-full shadow-2xl my-auto animate-modal-in space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-xl text-white tracking-tight">
                  {partnerForm.id ? "Edit Partner Alliance" : "Add Partner Alliance"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-normal">
                  Register an institutional partner, brand MOU, or strategic alliance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPartnerModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePartnerSubmit} className="space-y-5 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-200 font-semibold mb-1.5 block">
                    Alliance Title <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerForm.name}
                    onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                    placeholder="e.g. Global Freight Carrier Alliance"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-amber-400/80 transition-colors text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-200 font-semibold mb-1.5 block">
                    Company / Entity Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerForm.company}
                    onChange={(e) => setPartnerForm({ ...partnerForm, company: e.target.value })}
                    placeholder="e.g. DHL Express Worldwide"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-amber-400/80 transition-colors text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-200 font-semibold mb-1.5 block">
                    Category <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={partnerForm.category}
                    onChange={(e) => setPartnerForm({ ...partnerForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-amber-400/80 transition-colors text-xs sm:text-sm cursor-pointer"
                  >
                    <option value="Institutional">Institutional</option>
                    <option value="Strategic">Strategic</option>
                    <option value="Technology">Technology</option>
                    <option value="Fashion House">Fashion House</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-200 font-semibold mb-1.5 block">Official Website Link</label>
                  <input
                    type="url"
                    value={partnerForm.website}
                    onChange={(e) => setPartnerForm({ ...partnerForm, website: e.target.value })}
                    placeholder="https://company.com"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-amber-400/80 transition-colors text-xs sm:text-sm font-mono"
                  />
                </div>
              </div>

              {/* Partner Logo / Picture Upload */}
              <div className="space-y-3 border border-slate-800/90 p-4 rounded-2xl bg-slate-950/60">
                <label className="text-slate-200 font-semibold block text-xs sm:text-sm">
                  Partner Logo / Showcase Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-slate-700 bg-slate-900 overflow-hidden shrink-0 shadow-md">
                    {partnerForm.image ? (
                      <img
                        src={getImageUrl(partnerForm.image, FALLBACK_PARTNER_IMAGE)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-slate-500 font-medium">
                        <span>No Logo</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer inline-block">
                      <div className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-sm">
                        {uploadingImage ? (
                          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        ) : (
                          <Upload className="w-4 h-4 text-amber-400" />
                        )}
                        <span>Upload Logo File</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={handlePartnerPicUpload}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="url"
                      placeholder="Or paste direct image URL (https://...)"
                      value={partnerForm.image}
                      onChange={(e) => setPartnerForm({ ...partnerForm, image: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-amber-400/80"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-200 font-semibold mb-1.5 block">
                  Description &amp; Collaboration Scope <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={partnerForm.description}
                  onChange={(e) => setPartnerForm({ ...partnerForm, description: e.target.value })}
                  placeholder="Summary of agreement, strategic goals, or distribution scope..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-amber-400/80 transition-colors text-xs sm:text-sm leading-relaxed"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 shadow-md"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin text-slate-950" />}
                  <span>{partnerForm.id ? "Update Partner" : "Publish Partner"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* CANDIDATE COVER LETTER & DETAILS MODAL               */}
      {/* =================================================== */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-overlay-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl animate-modal-in">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-lg text-white">{selectedApplication.fullName}</h3>
                <p className="text-xs text-amber-400 font-medium">
                  {selectedApplication.jobTitle || selectedApplication.job?.title || "Role Application"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block font-semibold">Email</span>
                  <span className="text-white font-mono text-[11px]">{selectedApplication.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Phone</span>
                  <span className="text-white font-mono text-[11px]">{selectedApplication.phone || "Not provided"}</span>
                </div>
              </div>

              {selectedApplication.linkedinUrl && (
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">LinkedIn Profile</span>
                  <a
                    href={selectedApplication.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                  >
                    {selectedApplication.linkedinUrl} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div>
                <span className="text-slate-400 block font-semibold mb-1">Cover Letter</span>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto text-xs">
                  {selectedApplication.coverLetter || "No cover letter provided."}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-800 gap-2">
              <div className="flex items-center gap-2">
                {selectedApplication.resumeUrl && (
                  <a
                    href={selectedApplication.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CV / Resume</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteApplication(selectedApplication._id)}
                  className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* ORDER DETAILS BREAKDOWN MODAL                       */}
      {/* =================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-overlay-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl animate-modal-in">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-lg text-white">Order Details</h3>
                <p className="text-xs text-amber-400 font-mono">
                  #{selectedOrder._id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <p className="text-slate-400 font-semibold">Shipping Address:</p>
                <p className="text-white font-medium">{selectedOrder.shippingAddress?.fullName || selectedOrder.user?.name}</p>
                <p className="text-slate-300">{selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}</p>
                <p className="text-slate-400 font-mono text-[11px]">{selectedOrder.shippingAddress?.email} • {selectedOrder.shippingAddress?.phone}</p>
              </div>

              <div>
                <p className="text-slate-400 font-semibold mb-2">Purchased Products:</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(selectedOrder.orderItems || selectedOrder.items || []).map((it: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                      <div>
                        <p className="font-bold text-white">{it.title || it.name || "Luxury Item"}</p>
                        <p className="text-[11px] text-slate-400">Qty: {it.quantity || 1}</p>
                      </div>
                      <p className="font-bold text-amber-400">{formatCurrency((it.price || 0) * (it.quantity || 1))}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-300">Total Settlement:</span>
                <span className="text-white font-mono text-base">{formatCurrency(selectedOrder.total || 0)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* PARTNER REQUEST BRIEF INSPECT MODAL                  */}
      {/* =================================================== */}
      {selectedPartnerRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-overlay-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl animate-modal-in">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-lg text-white">{selectedPartnerRequest.companyName}</h3>
                <p className="text-xs text-amber-400 font-mono font-medium">
                  {selectedPartnerRequest.partnershipType || "MOU"} Proposal Brief
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPartnerRequest(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-normal">Contact Officer:</span>
                  <span className="text-slate-200 font-semibold">{selectedPartnerRequest.contactName}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400 font-normal">Email Address:</span>
                  <span className="text-amber-400 font-semibold">{selectedPartnerRequest.email}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400 font-normal">Phone Number:</span>
                  <span className="text-slate-200 font-semibold">{selectedPartnerRequest.phone}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-normal">Submitted Date:</span>
                  <span className="text-slate-300 font-mono">
                    {new Date(selectedPartnerRequest.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold block text-xs">Proposal Brief & Scope:</label>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-200 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">
                  {selectedPartnerRequest.message}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Current Status:</span>
                  <select
                    value={selectedPartnerRequest.status || "Pending"}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      handleUpdatePartnerRequestStatus(selectedPartnerRequest._id, newStatus);
                      setSelectedPartnerRequest((prev: any) => ({ ...prev, status: newStatus }));
                    }}
                    className="bg-slate-950 border border-slate-700 text-amber-400 font-semibold rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPartnerRequest(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
