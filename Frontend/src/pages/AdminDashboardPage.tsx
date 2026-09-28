import React, { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  Film,
  Mail,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  CheckCircle,
  BarChart3,
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Check,
  Archive,
  Eye,
  X,
  Phone,
  UploadCloud,
  FileVideo,
  Loader2,
  Play,
} from "lucide-react";
import { adminService } from "../services/service/adminService";
import { socket, onSocketEvent } from "../utils/socket";
import { ConfirmDeleteModal } from "../components/Admin/ConfirmDeleteModal";
import CachedImage from "../components/CachedImage";

type TabType = "overview" | "portfolio" | "threed" | "inquiries";

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isSocketOnline, setIsSocketOnline] = useState<boolean>(socket?.connected ?? false);

  // Upload State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Overview Counts
  const [stats, setStats] = useState({
    totalPortfolio: 0,
    totalThreeD: 0,
    totalInquiries: 0,
    newInquiries: 0,
  });

  // ==========================================
  // PORTFOLIO STATE (SERVER-SIDE PAGINATION)
  // ==========================================
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [portfolioPage, setPortfolioPage] = useState<number>(1);
  const [portfolioLimit, setPortfolioLimit] = useState<number>(6);
  const [portfolioTotalPages, setPortfolioTotalPages] = useState<number>(1);
  const [portfolioTotal, setPortfolioTotal] = useState<number>(0);
  const [portfolioSearch, setPortfolioSearch] = useState<string>("");
  const [portfolioCategory, setPortfolioCategory] = useState<string>("All");
  const [portfolioLoading, setPortfolioLoading] = useState<boolean>(false);

  // ==========================================
  // 3D SHOWCASE STATE (SERVER-SIDE PAGINATION)
  // ==========================================
  const [threeDItems, setThreeDItems] = useState<any[]>([]);
  const [threeDPage, setThreeDPage] = useState<number>(1);
  const [threeDLimit, setThreeDLimit] = useState<number>(6);
  const [threeDTotalPages, setThreeDTotalPages] = useState<number>(1);
  const [threeDTotal, setThreeDTotal] = useState<number>(0);
  const [threeDSearch, setThreeDSearch] = useState<string>("");
  const [threeDCategory, setThreeDCategory] = useState<string>("All");
  const [threeDLoading, setThreeDLoading] = useState<boolean>(false);

  // ==========================================
  // INQUIRIES STATE (SERVER-SIDE PAGINATION)
  // ==========================================
  const [inquiriesList, setInquiriesList] = useState<any[]>([]);
  const [inquiriesPage, setInquiriesPage] = useState<number>(1);
  const [inquiriesLimit, setInquiriesLimit] = useState<number>(6);
  const [inquiriesTotalPages, setInquiriesTotalPages] = useState<number>(1);
  const [inquiriesTotal, setInquiriesTotal] = useState<number>(0);
  const [inquiriesSearch, setInquiriesSearch] = useState<string>("");
  const [inquiriesStatusFilter, setInquiriesStatusFilter] = useState<string>("ALL");
  const [inquiriesLoading, setInquiriesLoading] = useState<boolean>(false);

  // Selected Inquiry for Detail Modal
  const [viewingInquiry, setViewingInquiry] = useState<any | null>(null);

  // Edit / Create Modal State
  const [editingItem, setEditingItem] = useState<{
    type: "portfolio" | "threed";
    isNew: boolean;
    data: any;
  } | null>(null);

  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Custom Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "portfolio" | "threed" | "inquiries";
    id: string | number;
    title?: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    type: "portfolio",
    id: "",
    title: "",
    isDeleting: false,
  });

  // Check auth
  useEffect(() => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/admin/login";
    }
  }, []);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const extractPaginatedData = (res: any) => {
    if (!res) return { items: [], total: 0, totalPages: 1, page: 1 };
    if (Array.isArray(res)) {
      return { items: res, total: res.length, totalPages: 1, page: 1 };
    }
    if (res.items && Array.isArray(res.items)) {
      return {
        items: res.items,
        total: res.total ?? res.items.length,
        totalPages: res.totalPages ?? 1,
        page: res.page ?? 1,
      };
    }
    if (res.data && Array.isArray(res.data)) {
      return {
        items: res.data,
        total: res.total ?? res.data.length,
        totalPages: res.totalPages ?? 1,
        page: res.page ?? 1,
      };
    }
    return { items: [], total: 0, totalPages: 1, page: 1 };
  };

  // ==========================================
  // FETCHERS (SERVER-SIDE PAGINATED)
  // ==========================================
  const fetchPortfolio = useCallback(
    async (page = portfolioPage, limit = portfolioLimit, search = portfolioSearch, category = portfolioCategory) => {
      setPortfolioLoading(true);
      try {
        const res = await adminService.getPortfolio({
          page,
          limit,
          search: search.trim() || undefined,
          category: category !== "All" ? category : undefined,
        });
        const clean = extractPaginatedData(res);
        setPortfolioItems(clean.items);
        setPortfolioTotal(clean.total);
        setPortfolioTotalPages(clean.totalPages);
        setPortfolioPage(clean.page);
        setStats((prev) => ({ ...prev, totalPortfolio: clean.total }));
      } catch (err) {
        console.error("Failed to load portfolio:", err);
      } finally {
        setPortfolioLoading(false);
      }
    },
    [portfolioPage, portfolioLimit, portfolioSearch, portfolioCategory]
  );

  const fetchThreeD = useCallback(
    async (page = threeDPage, limit = threeDLimit, search = threeDSearch, category = threeDCategory) => {
      setThreeDLoading(true);
      try {
        const res = await adminService.getThreeD({
          page,
          limit,
          search: search.trim() || undefined,
          category: category !== "All" ? category : undefined,
        });
        const clean = extractPaginatedData(res);
        setThreeDItems(clean.items);
        setThreeDTotal(clean.total);
        setThreeDTotalPages(clean.totalPages);
        setThreeDPage(clean.page);
        setStats((prev) => ({ ...prev, totalThreeD: clean.total }));
      } catch (err) {
        console.error("Failed to load 3D Studio:", err);
      } finally {
        setThreeDLoading(false);
      }
    },
    [threeDPage, threeDLimit, threeDSearch, threeDCategory]
  );

  const fetchInquiries = useCallback(
    async (page = inquiriesPage, limit = inquiriesLimit, search = inquiriesSearch, status = inquiriesStatusFilter) => {
      setInquiriesLoading(true);
      try {
        const res = await adminService.getInquiries({
          page,
          limit,
          search: search.trim() || undefined,
          status: status !== "ALL" ? status : undefined,
        });
        const clean = extractPaginatedData(res);
        setInquiriesList(clean.items);
        setInquiriesTotal(clean.total);
        setInquiriesTotalPages(clean.totalPages);
        setInquiriesPage(clean.page);

        const newCount = clean.items.filter((i: any) => i.status === "NEW").length;
        setStats((prev) => ({
          ...prev,
          totalInquiries: clean.total,
          newInquiries: newCount,
        }));
      } catch (err) {
        console.error("Failed to load inquiries:", err);
      } finally {
        setInquiriesLoading(false);
      }
    },
    [inquiriesPage, inquiriesLimit, inquiriesSearch, inquiriesStatusFilter]
  );

  const reloadAll = () => {
    fetchPortfolio();
    fetchThreeD();
    fetchInquiries();
  };

  useEffect(() => {
    fetchPortfolio(1);
    fetchThreeD(1);
    fetchInquiries(1);
  }, []);

  // Socket Connection & Real-time Listeners
  useEffect(() => {
    const handleConnect = () => setIsSocketOnline(true);
    const handleDisconnect = () => setIsSocketOnline(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    const unsubInquiryNew = onSocketEvent("inquiry:new", (newInquiry) => {
      showNotification(`New Inquiry from ${newInquiry.name || newInquiry.fullName || "Client"}!`, "success");
      setStats((prev) => ({
        ...prev,
        totalInquiries: prev.totalInquiries + 1,
        newInquiries: prev.newInquiries + 1,
      }));
      setInquiriesList((prev) => [newInquiry, ...prev]);
    });

    const unsubInquiryUpdated = onSocketEvent("inquiry:updated", (updatedInquiry) => {
      setInquiriesList((prev) => prev.map((inq) => (inq.id === updatedInquiry.id ? updatedInquiry : inq)));
    });

    const unsubInquiryDeleted = onSocketEvent("inquiry:deleted", (id) => {
      setInquiriesList((prev) => prev.filter((inq) => inq.id !== id));
      setStats((prev) => ({ ...prev, totalInquiries: Math.max(0, prev.totalInquiries - 1) }));
    });

    const unsubPortCreated = onSocketEvent("portfolio:created", () => fetchPortfolio());
    const unsubPortUpdated = onSocketEvent("portfolio:updated", () => fetchPortfolio());
    const unsubPortDeleted = onSocketEvent("portfolio:deleted", () => fetchPortfolio());

    const unsubThreeDCreated = onSocketEvent("threed:created", () => fetchThreeD());
    const unsubThreeDUpdated = onSocketEvent("threed:updated", () => fetchThreeD());
    const unsubThreeDDeleted = onSocketEvent("threed:deleted", () => fetchThreeD());

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      unsubInquiryNew();
      unsubInquiryUpdated();
      unsubInquiryDeleted();
      unsubPortCreated();
      unsubPortUpdated();
      unsubPortDeleted();
      unsubThreeDCreated();
      unsubThreeDUpdated();
      unsubThreeDDeleted();
    };
  }, [fetchPortfolio, fetchThreeD]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    window.location.href = "/admin/login";
  };

  // ==========================================
  // FILE UPLOAD HANDLER (DRAG & DROP)
  // ==========================================
  const handleFileUpload = async (file: File, targetField: "image" | "videoUrl") => {
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(`Uploading ${file.name}...`);
    try {
      const res: any = await adminService.uploadMedia(file);
      const fileUrl = res?.url || res?.data?.url;
      if (fileUrl) {
        setEditingItem((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            data: {
              ...prev.data,
              [targetField]: fileUrl,
            },
          };
        });
        showNotification(`${file.type.startsWith("video") ? "Video" : "Image"} uploaded successfully!`);
      } else {
        showNotification("Upload response missing file URL", "error");
      }
    } catch (err: any) {
      showNotification(`Upload failed: ${err.message || "Error"}`, "error");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  // ==========================================
  // CRUD ACTIONS
  // ==========================================
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const { type, isNew, data } = editingItem;

    try {
      if (type === "portfolio") {
        if (isNew) {
          await adminService.createPortfolio(data);
          showNotification("Portfolio project published!");
        } else {
          await adminService.updatePortfolio(data.id, data);
          showNotification("Portfolio project updated!");
        }
        fetchPortfolio();
      } else if (type === "threed") {
        if (!data.videoUrl) {
          showNotification("Please upload a video file or provide a video URL.", "error");
          return;
        }
        const threedPayload = {
          ...data,
          title: data.title || "3D Showcase Video",
          category: data.category || "All",
          duration: data.duration || "4K UHD",
          videoUrl: data.videoUrl,
        };
        if (isNew) {
          await adminService.createThreeD(threedPayload);
          showNotification("3D showcase video published!");
        } else {
          await adminService.updateThreeD(data.id, threedPayload);
          showNotification("3D showcase video updated!");
        }
        fetchThreeD();
      }

      setEditingItem(null);
    } catch (err: any) {
      showNotification(`Failed to save: ${err.message || "Error"}`, "error");
    }
  };

  const handleDeleteItem = (type: "portfolio" | "threed" | "inquiries", id: string | number, title?: string) => {
    setDeleteModal({
      isOpen: true,
      type,
      id,
      title: title || (type === "portfolio" ? "Portfolio Project" : type === "threed" ? "3D Showcase" : "Inquiry Record"),
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    const { type, id } = deleteModal;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      if (type === "portfolio") {
        await adminService.deletePortfolio(String(id));
        showNotification("Portfolio project removed.");
        fetchPortfolio();
      } else if (type === "threed") {
        await adminService.deleteThreeD(String(id));
        showNotification("3D showcase removed.");
        fetchThreeD();
      } else if (type === "inquiries") {
        await adminService.deleteInquiry(String(id));
        showNotification("Inquiry deleted.");
        fetchInquiries();
      }
      setDeleteModal((prev) => ({ ...prev, isOpen: false, isDeleting: false }));
    } catch (err: any) {
      showNotification(`Delete failed: ${err.message || "Error"}`, "error");
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleUpdateInquiryStatus = async (id: string, newStatus: "NEW" | "CONTACTED" | "ARCHIVED") => {
    try {
      await adminService.updateInquiryStatus(id, newStatus);
      setInquiriesList((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
      );
      if (viewingInquiry && viewingInquiry.id === id) {
        setViewingInquiry({ ...viewingInquiry, status: newStatus });
      }
      showNotification(`Inquiry status set to ${newStatus}`);
    } catch {
      showNotification("Failed to update status", "error");
    }
  };

  return (
    <div className="admin-scope min-h-screen w-full bg-[#08090e] text-white flex flex-col font-sans select-none antialiased">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm sm:max-w-md px-4 py-2.5 rounded-2xl bg-[#12141c]/95 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-center gap-2 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-in slide-in-from-top duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{notification.message}</span>
        </div>
      )}

      {/* Header Bar - Mobile Optimized with Official Logo */}
      <header className="px-3.5 sm:px-8 py-2.5 sm:py-3.5 border-b border-white/10 flex items-center justify-between bg-[#0e1017]/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <a href="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src="/Logo/BDG Extended.png"
              alt="Bharat DigiGuru"
              className="h-6 sm:h-7.5 w-auto object-contain drop-shadow-[0_2px_12px_rgba(255,59,48,0.35)] transition-transform group-hover:scale-105"
            />
          </a>
          <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 font-mono font-bold tracking-wider border border-white/10 shrink-0">
            ADMIN
          </span>
          
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
      
          

          {/* View Main Site */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-neutral-300 hover:text-white transition-colors"
            title="View Site"
          >
            <span className="hidden md:inline">SITE</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Live Socket Status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-mono border ${
              isSocketOnline
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
            }`}
            title={isSocketOnline ? "Realtime Sync Online" : "Realtime Sync Connecting"}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSocketOnline ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-amber-400"
              }`}
            />
            <span className="hidden sm:inline">{isSocketOnline ? "SYNC LIVE" : "OFFLINE"}</span>
          </div>

          {/* Refresh Data */}
          <button
            onClick={reloadAll}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10 active:scale-95"
            title="Reload Data"
          >
            <RefreshCw size={13} className="sm:w-3.5 sm:h-3.5" />
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-7 h-7 sm:w-auto sm:px-3 py-1 sm:py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-mono transition-colors cursor-pointer flex items-center justify-center gap-1 active:scale-95"
            title="Logout"
          >
            <LogOut size={13} className="sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">LOGOUT</span>
          </button>
        </div>
      </header>

      {/* Main Layout - Smooth scrolling on mobile & desktop */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 pb-20 md:pb-0">
        {/* Desktop Sidebar (hidden on mobile, uses bottom dock instead) */}
        <aside className="hidden md:flex w-60 border-r border-white/10 bg-[#0b0c12]/95 p-4 flex-col gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_15px_rgba(255,59,48,0.35)]"
                : "text-neutral-400 hover:text-white hover:bg-white/5 bg-white/[0.02] border border-white/5"
            }`}
          >
            <BarChart3 size={15} className="shrink-0" />
            <span>OVERVIEW</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("portfolio");
              fetchPortfolio(1);
            }}
            className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
              activeTab === "portfolio"
                ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_15px_rgba(255,59,48,0.35)]"
                : "text-neutral-400 hover:text-white hover:bg-white/5 bg-white/[0.02] border border-white/5"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Briefcase size={15} className="shrink-0" />
              <span>PORTFOLIO</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${activeTab === "portfolio" ? "bg-white/20 text-white" : "bg-white/10 text-neutral-300"}`}>
              {stats.totalPortfolio}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("threed");
              fetchThreeD(1);
            }}
            className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
              activeTab === "threed"
                ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_15px_rgba(255,59,48,0.35)]"
                : "text-neutral-400 hover:text-white hover:bg-white/5 bg-white/[0.02] border border-white/5"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Film size={15} className="shrink-0" />
              <span>3D SHOWCASE</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${activeTab === "threed" ? "bg-white/20 text-white" : "bg-white/10 text-neutral-300"}`}>
              {stats.totalThreeD}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("inquiries");
              fetchInquiries(1);
            }}
            className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer relative ${
              activeTab === "inquiries"
                ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_15px_rgba(255,59,48,0.35)]"
                : "text-neutral-400 hover:text-white hover:bg-white/5 bg-white/[0.02] border border-white/5"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Mail size={15} className="shrink-0" />
              <span>INQUIRIES</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${activeTab === "inquiries" ? "bg-white/20 text-white" : "bg-white/10 text-neutral-300"}`}>
                {stats.totalInquiries}
              </span>
              {stats.newInquiries > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </div>
          </button>
        </aside>

        {/* Mobile Bottom Navigation Dock (iOS App Feel) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c0d14]/95 backdrop-blur-2xl border-t border-white/15 px-2 py-1.5 flex items-center justify-around shadow-[0_-10px_35px_rgba(0,0,0,0.85)]">
          {/* 1. Overview */}
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === "overview"
                ? "text-white font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === "overview" ? "bg-[#ff3b30] text-white shadow-[0_0_15px_rgba(255,59,48,0.5)]" : "bg-transparent"}`}>
              <BarChart3 size={17} />
            </div>
            <span className="text-[10px] font-mono tracking-tight">Overview</span>
          </button>

          {/* 2. Portfolio */}
          <button
            onClick={() => {
              setActiveTab("portfolio");
              fetchPortfolio(1);
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === "portfolio"
                ? "text-white font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <div className={`p-1.5 rounded-xl relative transition-all ${activeTab === "portfolio" ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]" : "bg-transparent"}`}>
              <Briefcase size={17} />
              <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-blue-500 text-[9px] font-mono text-white font-bold leading-none">
                {stats.totalPortfolio}
              </span>
            </div>
            <span className="text-[10px] font-mono tracking-tight">Portfolio</span>
          </button>

          {/* 3. 3D Studio */}
          <button
            onClick={() => {
              setActiveTab("threed");
              fetchThreeD(1);
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === "threed"
                ? "text-white font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <div className={`p-1.5 rounded-xl relative transition-all ${activeTab === "threed" ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]" : "bg-transparent"}`}>
              <Film size={17} />
              <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-purple-500 text-[9px] font-mono text-white font-bold leading-none">
                {stats.totalThreeD}
              </span>
            </div>
            <span className="text-[10px] font-mono tracking-tight">3D Studio</span>
          </button>

          {/* 4. Inquiries */}
          <button
            onClick={() => {
              setActiveTab("inquiries");
              fetchInquiries(1);
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === "inquiries"
                ? "text-white font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <div className={`p-1.5 rounded-xl relative transition-all ${activeTab === "inquiries" ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]" : "bg-transparent"}`}>
              <Mail size={17} />
              <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-mono font-bold leading-none">
                {stats.totalInquiries}
              </span>
            </div>
            <span className="text-[10px] font-mono tracking-tight">Inquiries</span>
          </button>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 md:overflow-y-auto max-w-7xl w-full">
          {/* =========================================================================
              1. OVERVIEW TAB
             ========================================================================= */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Stat KPI Cards - Sleek modern glassmorphic cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
                {/* 1. Portfolio Card */}
                <div
                  onClick={() => {
                    setActiveTab("portfolio");
                    fetchPortfolio(1);
                  }}
                  className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#12141c] to-[#0c0d14] border border-blue-500/25 hover:border-blue-500/60 flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98] shadow-lg"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                      Portfolio Projects
                    </span>
                    <div className="font-['Syne',sans-serif] font-bold text-3xl sm:text-4xl text-white">
                      {stats.totalPortfolio}
                    </div>
                    <span className="text-neutral-400 text-[11px] font-mono">
                      Published on website →
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                    <Briefcase size={22} />
                  </div>
                </div>

                {/* 2. 3D Studio Card */}
                <div
                  onClick={() => {
                    setActiveTab("threed");
                    fetchThreeD(1);
                  }}
                  className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#12141c] to-[#0c0d14] border border-purple-500/25 hover:border-purple-500/60 flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98] shadow-lg"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-purple-400 font-mono text-xs font-bold uppercase tracking-wider">
                      3D Showcases
                    </span>
                    <div className="font-['Syne',sans-serif] font-bold text-3xl sm:text-4xl text-white">
                      {stats.totalThreeD}
                    </div>
                    <span className="text-neutral-400 text-[11px] font-mono">
                      UE5 & CGI Reels →
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
                    <Film size={22} />
                  </div>
                </div>

                {/* 3. Inquiries Card */}
                <div
                  onClick={() => {
                    setActiveTab("inquiries");
                    fetchInquiries(1);
                  }}
                  className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#12141c] to-[#0c0d14] border border-amber-500/25 hover:border-amber-500/60 flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98] shadow-lg"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                        Client Leads
                      </span>
                      {stats.newInquiries > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[9px] font-mono font-bold">
                          {stats.newInquiries} NEW
                        </span>
                      )}
                    </div>
                    <div className="font-['Syne',sans-serif] font-bold text-3xl sm:text-4xl text-white">
                      {stats.totalInquiries}
                    </div>
                    <span className="text-neutral-400 text-[11px] font-mono">
                      Inbound inquiries →
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
                    <Mail size={22} />
                  </div>
                </div>
              </div>

              {/* Recent Inquiries Quick Feed */}
              <div className="p-3.5 sm:p-6 rounded-2xl bg-[#12141c] border border-white/10 flex flex-col gap-3 sm:gap-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <h3 className="font-['Syne',sans-serif] font-bold text-sm sm:text-lg text-white truncate">
                        Inquiries Feed
                      </h3>
                    </div>
                    <p className="font-mono text-[10px] sm:text-xs text-neutral-400 truncate">
                       submissions from website
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("inquiries");
                      fetchInquiries(1);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#ff3b30] hover:text-white cursor-pointer shrink-0 font-bold transition-colors active:scale-95"
                  >
                    View All →
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {inquiriesList.slice(0, 5).map((inq) => (
                    <div
                      key={inq.id}
                      className="p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="font-semibold text-xs sm:text-sm text-white truncate">{inq.name || inq.fullName}</span>
                          <span className="font-mono text-[11px] sm:text-xs text-neutral-400 truncate">({inq.email})</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                              inq.status === "NEW"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : inq.status === "CONTACTED"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-neutral-500/20 text-neutral-400"
                            }`}
                          >
                            {inq.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-300 line-clamp-1">"{inq.message}"</p>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => setViewingInquiry(inq)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <Eye size={12} />
                          <span>DETAILS</span>
                        </button>
                        {inq.status === "NEW" && (
                          <button
                            onClick={() => handleUpdateInquiryStatus(inq.id, "CONTACTED")}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono transition-colors cursor-pointer active:scale-95"
                          >
                            CONTACTED
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {inquiriesList.length === 0 && (
                    <div className="py-8 text-center text-xs font-mono text-neutral-500">
                      No client inquiries recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              2. PORTFOLIO TAB (SERVER-SIDE PAGINATED)
             ========================================================================= */}
          {activeTab === "portfolio" && (
            <div className="flex flex-col gap-3.5 sm:gap-6">
              {/* Top Controls */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-['Syne',sans-serif] font-bold text-base sm:text-xl text-white">
                    Portfolio ({portfolioTotal})
                  </h2>
                  
                </div>
                <button
                  onClick={() =>
                    setEditingItem({
                      type: "portfolio",
                      isNew: true,
                      data: {
                        title: "",
                        subtitle: "",
                        client: "",
                        year: "2026",
                        category: "Branding & Web",
                        description: "",
                        tags: ["React", "UI/UX", "WebGL"],
                        metrics: [{ label: "User Growth", value: "+240%" }],
                        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200",
                        video: "",
                      },
                    })
                  }
                  className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg shrink-0 active:scale-95"
                >
                  <Plus size={14} />
                  <span>ADD</span>
                </button>
              </div>

              {/* Filters & Search Toolbar - Mobile Optimized */}
              <div className="p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={portfolioSearch}
                    onChange={(e) => {
                      setPortfolioSearch(e.target.value);
                      fetchPortfolio(1, portfolioLimit, e.target.value, portfolioCategory);
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 sm:flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 min-w-0">
                    <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <select
                      value={portfolioCategory}
                      onChange={(e) => {
                        setPortfolioCategory(e.target.value);
                        fetchPortfolio(1, portfolioLimit, portfolioSearch, e.target.value);
                      }}
                      className="w-full bg-transparent text-xs font-mono text-neutral-300 focus:outline-none cursor-pointer truncate"
                    >
                      <option value="All" className="bg-[#12141c]">All Categories</option>
                      <option value="AI & Automation" className="bg-[#12141c]">AI & Automation</option>
                      <option value="Branding & Web" className="bg-[#12141c]">Branding & Web</option>
                      <option value="Social & Campaign" className="bg-[#12141c]">Social & Campaign</option>
                      <option value="Enterprise Portal" className="bg-[#12141c]">Enterprise Portal</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-neutral-400">
                    <span>Limit:</span>
                    <select
                      value={portfolioLimit}
                      onChange={(e) => {
                        const newLimit = Number(e.target.value);
                        setPortfolioLimit(newLimit);
                        fetchPortfolio(1, newLimit, portfolioSearch, portfolioCategory);
                      }}
                      className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
                    >
                      <option value="4" className="bg-[#12141c]">4</option>
                      <option value="6" className="bg-[#12141c]">6</option>
                      <option value="12" className="bg-[#12141c]">12</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Items Grid */}
              {portfolioLoading ? (
                <div className="py-16 text-center text-neutral-500 font-mono text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                  <span>Loading portfolio...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {portfolioItems.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 sm:p-5 rounded-2xl bg-[#12141c] border border-white/10 hover:border-white/20 flex flex-col justify-between gap-3 transition-all group"
                    >
                      <div className="flex flex-col gap-2">
                        {p.image && (
                          <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-black/40 relative">
                            <CachedImage
                              src={p.image}
                              alt={p.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-mono text-blue-400 border border-white/10">
                              {p.category || "General"}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-blue-400 truncate">
                            {p.client} // {p.year}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setEditingItem({ type: "portfolio", isNew: false, data: p })}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer active:scale-95"
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem("portfolio", p.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer active:scale-95"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <h3 className="font-['Syne',sans-serif] font-bold text-sm sm:text-base text-white line-clamp-1">
                          {p.title}
                        </h3>
                        <p className="font-mono text-xs text-neutral-400">{p.subtitle}</p>
                        <p className="text-xs text-neutral-400 line-clamp-2">{p.description}</p>
                      </div>

                      {p.tags && p.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2 border-t border-white/5">
                          {p.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-neutral-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {portfolioItems.length === 0 && (
                    <div className="col-span-full py-16 text-center text-xs font-mono text-neutral-500">
                      No portfolio projects match your filters.
                    </div>
                  )}
                </div>
              )}

              {/* Server-Side Pagination Footer - Responsive */}
              <div className="p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 flex items-center justify-between gap-2 text-xs font-mono">
                <span className="text-neutral-400 text-xs">
                  Page <span className="text-white font-bold">{portfolioPage}</span> /{" "}
                  <span className="text-white font-bold">{portfolioTotalPages}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => fetchPortfolio(portfolioPage - 1)}
                    disabled={portfolioPage <= 1 || portfolioLoading}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <ChevronLeft size={13} />
                    <span className="hidden sm:inline">PREV</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: portfolioTotalPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => fetchPortfolio(num)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-mono text-xs transition-all cursor-pointer ${
                          portfolioPage === num
                            ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_10px_rgba(255,59,48,0.4)]"
                            : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => fetchPortfolio(portfolioPage + 1)}
                    disabled={portfolioPage >= portfolioTotalPages || portfolioLoading}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <span className="hidden sm:inline">NEXT</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              3. 3D SHOWCASES TAB (SERVER-SIDE PAGINATED)
             ========================================================================= */}
          {activeTab === "threed" && (
            <div className="flex flex-col gap-3.5 sm:gap-6">
              {/* Top Controls */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-['Syne',sans-serif] font-bold text-base sm:text-xl text-white">
                    3D Studio ({threeDTotal})
                  </h2>
                
                </div>
                <button
                  onClick={() =>
                    setEditingItem({
                      type: "threed",
                      isNew: true,
                      data: {
                        title: "",
                        category: "Architecture & Interiors",
                        client: "",
                        year: "2026",
                        duration: "0:15 // 4K",
                        software: ["Unreal Engine 5", "Blender", "Octane"],
                        description: "",
                        deliverables: ["4K Walkthrough", "Interactive 3D"],
                        videoUrl: "",
                      },
                    })
                  }
                  className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg shrink-0 active:scale-95"
                >
                  <Plus size={14} />
                  <span>ADD</span>
                </button>
              </div>

              {/* Toolbar */}
              <div className="p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search 3D showcases..."
                    value={threeDSearch}
                    onChange={(e) => {
                      setThreeDSearch(e.target.value);
                      fetchThreeD(1, threeDLimit, e.target.value, threeDCategory);
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 sm:flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 min-w-0">
                    <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <select
                      value={threeDCategory}
                      onChange={(e) => {
                        setThreeDCategory(e.target.value);
                        fetchThreeD(1, threeDLimit, threeDSearch, e.target.value);
                      }}
                      className="w-full bg-transparent text-xs font-mono text-neutral-300 focus:outline-none cursor-pointer truncate"
                    >
                      <option value="All" className="bg-[#12141c]">All Categories</option>
                      <option value="Architecture & Interiors" className="bg-[#12141c]">Architecture & Interiors</option>
                      <option value="CGI Commercial" className="bg-[#12141c]">CGI Commercial</option>
                      <option value="Automotive & Product" className="bg-[#12141c]">Automotive & Product</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-neutral-400">
                    <span>Limit:</span>
                    <select
                      value={threeDLimit}
                      onChange={(e) => {
                        const newLimit = Number(e.target.value);
                        setThreeDLimit(newLimit);
                        fetchThreeD(1, newLimit, threeDSearch, threeDCategory);
                      }}
                      className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
                    >
                      <option value="4" className="bg-[#12141c]">4</option>
                      <option value="6" className="bg-[#12141c]">6</option>
                      <option value="12" className="bg-[#12141c]">12</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grid */}
              {threeDLoading ? (
                <div className="py-16 text-center text-neutral-500 font-mono text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                  <span>Loading 3D showcases...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {threeDItems.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 sm:p-5 rounded-2xl bg-[#12141c] border border-white/10 hover:border-purple-500/30 flex flex-col justify-between gap-3 transition-all group"
                    >
                      <div className="flex flex-col gap-2">
                        {t.videoUrl ? (
                          <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-black/50 relative flex items-center justify-center border border-white/5">
                            {t.videoUrl.match(/\.(mp4|webm|mov)($|\?)/i) || t.videoUrl.includes("/uploads/") ? (
                              <video
                                src={t.videoUrl}
                                muted
                                playsInline
                                preload="metadata"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <CachedImage
                                src={t.posterUrl || t.videoUrl}
                                alt={t.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            )}
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono text-white/90 border border-white/10 flex items-center gap-1">
                              <Play size={10} className="fill-current text-purple-400" />
                              <span>{t.duration || "4K"}</span>
                            </div>
                          </div>
                        ) : t.posterUrl ? (
                          <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-black/40 relative">
                            <CachedImage
                              src={t.posterUrl}
                              alt={t.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-mono text-purple-400 border border-white/10">
                              {t.category || "3D Studio"}
                            </div>
                          </div>
                        ) : null}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setEditingItem({ type: "threed", isNew: false, data: t })}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer active:scale-95"
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem("threed", t.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer active:scale-95"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                      </div>

                      
                    </div>
                  ))}

                  {threeDItems.length === 0 && (
                    <div className="col-span-full py-16 text-center text-xs font-mono text-neutral-500">
                      No 3D showcases match your filters.
                    </div>
                  )}
                </div>
              )}

              {/* Pagination */}
              <div className="p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 flex items-center justify-between gap-2 text-xs font-mono">
                <span className="text-neutral-400 text-xs">
                  Page <span className="text-white font-bold">{threeDPage}</span> /{" "}
                  <span className="text-white font-bold">{threeDTotalPages}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => fetchThreeD(threeDPage - 1)}
                    disabled={threeDPage <= 1 || threeDLoading}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <ChevronLeft size={13} />
                    <span className="hidden sm:inline">PREV</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: threeDTotalPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => fetchThreeD(num)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-mono text-xs transition-all cursor-pointer ${
                          threeDPage === num
                            ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_10px_rgba(255,59,48,0.4)]"
                            : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => fetchThreeD(threeDPage + 1)}
                    disabled={threeDPage >= threeDTotalPages || threeDLoading}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <span className="hidden sm:inline">NEXT</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              4. INQUIRIES TAB (SERVER-SIDE PAGINATED + REAL-TIME)
             ========================================================================= */}
          {activeTab === "inquiries" && (
            <div className="flex flex-col gap-3.5 sm:gap-6">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-['Syne',sans-serif] font-bold text-base sm:text-xl text-white">
                    Inquiries ({inquiriesTotal})
                  </h2>
               
                </div>

              
              </div>

              {/* Status Filter Pills & Search */}
              <div className="p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                <div className="grid grid-cols-4 sm:flex items-center gap-1 sm:gap-1.5">
                  {(["ALL", "NEW", "CONTACTED", "ARCHIVED"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setInquiriesStatusFilter(st);
                        fetchInquiries(1, inquiriesLimit, inquiriesSearch, st);
                      }}
                      className={`px-2 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-mono transition-all cursor-pointer text-center truncate ${
                        inquiriesStatusFilter === st
                          ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_10px_rgba(255,59,48,0.3)]"
                          : "bg-black/40 text-neutral-400 hover:text-white border border-white/5"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search inquiries..."
                      value={inquiriesSearch}
                      onChange={(e) => {
                        setInquiriesSearch(e.target.value);
                        fetchInquiries(1, inquiriesLimit, e.target.value, inquiriesStatusFilter);
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl px-2 py-1 text-xs font-mono text-neutral-400 shrink-0">
                    <span>Limit:</span>
                    <select
                      value={inquiriesLimit}
                      onChange={(e) => {
                        const newLimit = Number(e.target.value);
                        setInquiriesLimit(newLimit);
                        fetchInquiries(1, newLimit, inquiriesSearch, inquiriesStatusFilter);
                      }}
                      className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
                    >
                      <option value="6" className="bg-[#12141c]">6</option>
                      <option value="12" className="bg-[#12141c]">12</option>
                      <option value="24" className="bg-[#12141c]">24</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cards List */}
              {inquiriesLoading ? (
                <div className="py-16 text-center text-neutral-500 font-mono text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                  <span>Loading inquiries...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {inquiriesList.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-3.5 sm:p-5 rounded-2xl bg-[#12141c] border border-white/10 hover:border-white/20 flex flex-col gap-2.5 sm:gap-3 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="font-bold text-white text-sm sm:text-base truncate">
                            {inq.name || inq.fullName}
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <a
                              href={`mailto:${inq.email}`}
                              className="font-mono text-xs text-neutral-400 hover:text-blue-400 flex items-center gap-1 truncate"
                            >
                              <Mail size={11} /> {inq.email}
                            </a>
                            {inq.phone && inq.phone !== "Not Provided" && (
                              <a
                                href={`tel:${inq.phone}`}
                                className="font-mono text-xs text-neutral-400 hover:text-emerald-400 flex items-center gap-1"
                              >
                                <Phone size={11} /> {inq.phone}
                              </a>
                            )}
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold uppercase shrink-0 ${
                            inq.status === "NEW"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : inq.status === "CONTACTED"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-neutral-500/20 text-neutral-400 border border-white/10"
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>

                      <div className="text-xs sm:text-sm text-neutral-300 p-2.5 sm:p-3 rounded-xl bg-black/40 border border-white/5 leading-relaxed">
                        "{inq.message}"
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-neutral-400 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2.5 flex-wrap text-[11px]">
                          {inq.company && (
                            <div>Company: <span className="text-white">{inq.company}</span></div>
                          )}
                          {inq.budget && (
                            <div>Budget: <span className="text-emerald-400">{inq.budget}</span></div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => setViewingInquiry(inq)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono flex items-center gap-1 cursor-pointer active:scale-95"
                          >
                            <Eye size={12} />
                            <span>DETAILS</span>
                          </button>

                          {inq.status === "NEW" && (
                            <button
                              onClick={() => handleUpdateInquiryStatus(inq.id, "CONTACTED")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                            >
                              <Check size={12} />
                              <span>CONTACTED</span>
                            </button>
                          )}

                          {inq.status !== "ARCHIVED" && (
                            <button
                              onClick={() => handleUpdateInquiryStatus(inq.id, "ARCHIVED")}
                              className="px-2 py-1 rounded-lg bg-neutral-500/10 hover:bg-neutral-500/20 text-neutral-400 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                            >
                              <Archive size={12} />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteItem("inquiries", inq.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer active:scale-95"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {inquiriesList.length === 0 && (
                    <div className="py-16 text-center text-xs font-mono text-neutral-500 bg-[#12141c] rounded-2xl border border-white/10">
                      No client inquiries match the current filter.
                    </div>
                  )}
                </div>
              )}

              {/* Pagination Footer */}
              <div className="p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 flex items-center justify-between gap-2 text-xs font-mono">
                <span className="text-neutral-400 text-xs">
                  Page <span className="text-white font-bold">{inquiriesPage}</span> /{" "}
                  <span className="text-white font-bold">{inquiriesTotalPages}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => fetchInquiries(inquiriesPage - 1)}
                    disabled={inquiriesPage <= 1 || inquiriesLoading}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <ChevronLeft size={13} />
                    <span className="hidden sm:inline">PREV</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: inquiriesTotalPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => fetchInquiries(num)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-mono text-xs transition-all cursor-pointer ${
                          inquiriesPage === num
                            ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_10px_rgba(255,59,48,0.4)]"
                            : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => fetchInquiries(inquiriesPage + 1)}
                    disabled={inquiriesPage >= inquiriesTotalPages || inquiriesLoading}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <span className="hidden sm:inline">NEXT</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          INQUIRY DETAIL MODAL (RESPONSIVE)
         ========================================================================= */}
      {viewingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#11131b] border border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl flex flex-col gap-3.5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div>
                <h3 className="font-['Syne',sans-serif] font-bold text-base sm:text-xl text-white">
                  Client Inquiry
                </h3>
                <p className="font-mono text-[10px] text-neutral-400">
                  Submitted via Web Contact Form
                </p>
              </div>
              <button
                onClick={() => setViewingInquiry(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-neutral-500 block text-[9px] mb-0.5">CLIENT NAME</span>
                <span className="text-white font-bold text-xs sm:text-sm truncate block">
                  {viewingInquiry.name || viewingInquiry.fullName}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-neutral-500 block text-[9px] mb-0.5">EMAIL</span>
                <a
                  href={`mailto:${viewingInquiry.email}`}
                  className="text-blue-400 hover:underline font-bold text-xs sm:text-sm truncate block"
                >
                  {viewingInquiry.email}
                </a>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-neutral-500 block text-[9px] mb-0.5">PHONE</span>
                <a href={`tel:${viewingInquiry.phone}`} className="text-white hover:text-emerald-400 text-xs truncate block">
                  {viewingInquiry.phone || "Not Provided"}
                </a>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-neutral-500 block text-[9px] mb-0.5">COMPANY</span>
                <span className="text-white text-xs truncate block">{viewingInquiry.company || "Not Specified"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-neutral-500 block text-[9px] mb-0.5">BUDGET</span>
                <span className="text-emerald-400 font-bold text-xs">{viewingInquiry.budget || "Custom"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-neutral-500 block text-[9px] mb-0.5">TIMELINE</span>
                <span className="text-purple-400 text-xs">{viewingInquiry.timeline || "Flexible"}</span>
              </div>
            </div>

            {viewingInquiry.services && viewingInquiry.services.length > 0 && (
              <div className="flex flex-col gap-1 text-xs font-mono">
                <span className="text-neutral-500 text-[10px]">REQUESTED SERVICES</span>
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(viewingInquiry.services)
                    ? viewingInquiry.services
                    : [viewingInquiry.services]
                  ).map((s: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-white/10 text-white border border-white/10 text-[10px]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1 text-xs">
              <span className="font-mono text-neutral-500 text-[10px]">MESSAGE</span>
              <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-neutral-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto">
                {viewingInquiry.message}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2.5 border-t border-white/10">
              <div className="grid grid-cols-3 sm:flex items-center gap-1.5">
                <button
                  onClick={() => handleUpdateInquiryStatus(viewingInquiry.id, "NEW")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer text-center ${
                    viewingInquiry.status === "NEW"
                      ? "bg-amber-500 text-black font-bold"
                      : "bg-white/5 text-neutral-400 hover:text-white"
                  }`}
                >
                  NEW
                </button>
                <button
                  onClick={() => handleUpdateInquiryStatus(viewingInquiry.id, "CONTACTED")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer text-center ${
                    viewingInquiry.status === "CONTACTED"
                      ? "bg-emerald-500 text-black font-bold"
                      : "bg-white/5 text-neutral-400 hover:text-white"
                  }`}
                >
                  CONTACTED
                </button>
                <button
                  onClick={() => handleUpdateInquiryStatus(viewingInquiry.id, "ARCHIVED")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer text-center ${
                    viewingInquiry.status === "ARCHIVED"
                      ? "bg-neutral-500 text-white font-bold"
                      : "bg-white/5 text-neutral-400 hover:text-white"
                  }`}
                >
                  ARCHIVED
                </button>
              </div>

              <button
                onClick={() => setViewingInquiry(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white text-black font-mono text-xs font-bold cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PORTFOLIO & 3D STUDIO MODAL EDITOR (RESPONSIVE)
         ========================================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#11131b] border border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
              <h3 className="font-['Syne',sans-serif] font-bold text-base sm:text-xl text-white">
                {editingItem.isNew ? "Create New" : "Edit"}{" "}
                {editingItem.type === "portfolio" ? "Portfolio Project" : "3D Showcase Video"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="flex flex-col gap-3">
              {/* Portfolio Specific Fields */}
              {editingItem.type === "portfolio" && (
                <>
                  <div className="flex flex-col gap-1 text-left">
                    <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase">Title</label>
                    <input
                      type="text"
                      value={editingItem.data.title || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, title: e.target.value },
                        })
                      }
                      placeholder="e.g. Next-Gen Financial Cloud"
                      className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff3b30]"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="flex flex-col gap-1 text-left">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase">Client</label>
                      <input
                        type="text"
                        value={editingItem.data.client || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, client: e.target.value },
                          })
                        }
                        placeholder="e.g. Apex Global"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff3b30]"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase">Category</label>
                      <input
                        type="text"
                        value={editingItem.data.category || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, category: e.target.value },
                          })
                        }
                        placeholder="AI & Automation, Branding..."
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff3b30]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="flex flex-col gap-1 text-left">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase">Subtitle</label>
                      <input
                        type="text"
                        value={editingItem.data.subtitle || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, subtitle: e.target.value },
                          })
                        }
                        placeholder="e.g. Enterprise Cloud UI"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff3b30]"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase">Year</label>
                      <input
                        type="text"
                        value={editingItem.data.year || "2026"}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, year: e.target.value },
                          })
                        }
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff3b30]"
                      />
                    </div>
                  </div>

                  {/* Portfolio Image Drag & Drop Upload */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Project Cover Image (Drag & Drop)
                      </label>
                      {editingItem.data.image && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, image: "" },
                            })
                          }
                          className="text-[10px] font-mono text-red-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 size={11} /> Remove
                        </button>
                      )}
                    </div>

                    {editingItem.data.image ? (
                      <div className="relative rounded-2xl overflow-hidden border border-blue-500/30 bg-black/40 p-2.5 flex items-center gap-3">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10 relative">
                          <CachedImage
                            src={editingItem.data.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <span className="font-mono text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle size={12} /> Image Attached
                          </span>
                          <p className="font-mono text-[10px] text-neutral-400 truncate max-w-full">
                            {editingItem.data.image}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <label className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-[10px] font-mono font-bold cursor-pointer transition-colors active:scale-95 inline-flex items-center gap-1">
                              <UploadCloud size={11} />
                              <span>Replace Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleFileUpload(f, "image");
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragActive(false);
                          const f = e.dataTransfer.files?.[0];
                          if (f) handleFileUpload(f, "image");
                        }}
                        className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                          dragActive
                            ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
                            : "border-white/15 hover:border-blue-500/50 bg-[#181a24]/60 hover:bg-[#181a24]"
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileUpload(f, "image");
                          }}
                        />
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-2 py-2">
                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                            <span className="text-xs font-mono text-blue-300">
                              {uploadProgress || "Uploading image..."}
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                              <UploadCloud size={20} />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <p className="text-xs font-semibold text-white">
                                Drag & drop cover image here, or{" "}
                                <span className="text-blue-400 underline">browse</span>
                              </p>
                              <p className="text-[10px] font-mono text-neutral-400">
                                Supports PNG, JPG, WebP, SVG (Max 50MB)
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Optional URL Fallback */}
                    <div className="pt-0.5">
                      <input
                        type="text"
                        value={editingItem.data.image || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, image: e.target.value },
                          })
                        }
                        placeholder="Or paste image link (https://...)"
                        className="w-full bg-[#181a24]/50 border border-white/5 rounded-lg px-2.5 py-1 text-[11px] font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase">Description</label>
                    <textarea
                      rows={3}
                      value={editingItem.data.description || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, description: e.target.value },
                        })
                      }
                      placeholder="Project summary..."
                      className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff3b30]"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={Array.isArray(editingItem.data.tags) ? editingItem.data.tags.join(", ") : editingItem.data.tags || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          data: {
                            ...editingItem.data,
                            tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                          },
                        })
                      }
                      placeholder="React, Three.js, AI, Automation"
                      className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff3b30]"
                    />
                  </div>
                </>
              )}

              {/* 3D Showcase Specific: Video-Only Studio Reel */}
              {editingItem.type === "threed" && (
                <div className="flex flex-col gap-4 text-left py-2">
                  <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                      <FileVideo size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-white">Video-Only 3D Showcase Reel</p>
                      <p className="text-[11px] text-neutral-400">
                        Upload or paste high-resolution 3D CGI video render. No text or inquiry data required.
                      </p>
                    </div>
                  </div>

                  {/* 3D Showcase Video / Media Drag & Drop Upload */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-[10px] sm:text-[11px] text-purple-400 uppercase font-bold tracking-wider">
                        3D Video File (Drag & Drop or Select)
                      </label>
                      {editingItem.data.videoUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, videoUrl: "" },
                            })
                          }
                          className="text-[10px] font-mono text-red-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 size={11} /> Remove
                        </button>
                      )}
                    </div>

                    {editingItem.data.videoUrl ? (
                      <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 bg-black/60 p-3 flex flex-col gap-3">
                        {/* Video Player Preview */}
                        <div className="w-full max-h-56 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/10 relative">
                          <video
                            src={editingItem.data.videoUrl}
                            controls
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full max-h-56 object-contain"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-mono text-[11px] text-purple-300 font-semibold flex items-center gap-1">
                              <CheckCircle size={12} className="text-purple-400" /> 3D Video Attached & Ready
                            </span>
                            <p className="font-mono text-[10px] text-neutral-400 truncate">
                              {editingItem.data.videoUrl}
                            </p>
                          </div>

                          <label className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold cursor-pointer transition-colors shrink-0 active:scale-95 inline-flex items-center gap-1">
                            <UploadCloud size={13} />
                            <span>Replace Video</span>
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleFileUpload(f, "videoUrl");
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragActive(false);
                          const f = e.dataTransfer.files?.[0];
                          if (f) handleFileUpload(f, "videoUrl");
                        }}
                        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                          dragActive
                            ? "border-purple-500 bg-purple-500/15 scale-[1.01]"
                            : "border-purple-500/30 hover:border-purple-500/60 bg-[#181a24]/60 hover:bg-[#181a24]"
                        }`}
                      >
                        <input
                          type="file"
                          accept="video/*"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileUpload(f, "videoUrl");
                          }}
                        />
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-2 py-4">
                            <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                            <span className="text-xs font-mono text-purple-300 font-semibold">
                              {uploadProgress || "Uploading 3D video reel..."}
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                              <FileVideo size={28} />
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-sm font-semibold text-white">
                                Drag & drop 3D video reel (.mp4, .webm, .mov) here, or{" "}
                                <span className="text-purple-400 underline">browse</span>
                              </p>
                              <p className="text-[11px] font-mono text-neutral-400">
                                Supports high-res MP4, WebM, MOV renders (Up to 50MB)
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Or Video URL input */}
                    <div className="pt-1">
                      <label className="font-mono text-[10px] text-neutral-400 uppercase mb-1 block">
                        Or Video Stream / Cloud URL
                      </label>
                      <input
                        type="text"
                        value={editingItem.data.videoUrl || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, videoUrl: e.target.value },
                          })
                        }
                        placeholder="https://cdn.example.com/3d-render.mp4"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 mt-2 pt-2.5 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-lg cursor-pointer active:scale-95 ${
                    editingItem.type === "threed"
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-[#ff3b30] hover:bg-[#b91c1c]"
                  }`}
                >
                  {editingItem.type === "threed" ? "PUBLISH 3D VIDEO" : "SAVE RECORD"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        itemTitle={deleteModal.title}
        isLoading={deleteModal.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteModal((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
};

export default AdminDashboardPage;
