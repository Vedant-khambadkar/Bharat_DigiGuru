import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Briefcase,
  Film,
  Mail,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  CheckCircle,
  Radio,
  BarChart3,
  LogOut,
  Search,
} from "lucide-react";
import { adminService } from "../../services/service/adminService";
import { socket, onSocketEvent } from "../../utils/socket";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { getApiCache, setApiCache } from "../../utils/apiCache";

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

type TabType = "overview" | "portfolio" | "threed" | "inquiries";

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

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isSocketOnline, setIsSocketOnline] = useState<boolean>(socket.connected);

  // Overview Counts from cache
  const [stats, setStats] = useState(() => {
    return (
      getApiCache<{
        totalPortfolio: number;
        totalThreeD: number;
        totalInquiries: number;
        newInquiries: number;
      }>("admin_stats") || {
        totalPortfolio: 0,
        totalThreeD: 0,
        totalInquiries: 0,
        newInquiries: 0,
      }
    );
  });

  // ==========================================
  // PORTFOLIO STATE (SERVER-SIDE PAGINATION)
  // ==========================================
  const initialPortCache = extractPaginatedData(
    getApiCache<any>("admin_portfolio_category=&limit=6&page=1&search=")
  );
  const [portfolioItems, setPortfolioItems] = useState<any[]>(initialPortCache.items);
  const [portfolioPage, setPortfolioPage] = useState<number>(1);
  const [portfolioTotalPages, setPortfolioTotalPages] = useState<number>(
    initialPortCache.totalPages || 1
  );
  const [portfolioTotal, setPortfolioTotal] = useState<number>(initialPortCache.total || 0);
  const [portfolioSearch, setPortfolioSearch] = useState<string>("");

  // ==========================================
  // 3D SHOWCASE STATE (SERVER-SIDE PAGINATION)
  // ==========================================
  const initialThreeDCache = extractPaginatedData(
    getApiCache<any>("admin_threed_category=&limit=6&page=1&search=")
  );
  const [threeDItems, setThreeDItems] = useState<any[]>(initialThreeDCache.items);
  const [threeDPage, setThreeDPage] = useState<number>(1);
  const [threeDTotalPages, setThreeDTotalPages] = useState<number>(
    initialThreeDCache.totalPages || 1
  );
  const [threeDTotal, setThreeDTotal] = useState<number>(initialThreeDCache.total || 0);
  const [threeDSearch, setThreeDSearch] = useState<string>("");

  // ==========================================
  // INQUIRIES STATE (SERVER-SIDE PAGINATION)
  // ==========================================
  const initialInqCache = extractPaginatedData(
    getApiCache<any>("admin_inquiries_limit=6&page=1&search=&status=")
  );
  const [inquiriesList, setInquiriesList] = useState<any[]>(initialInqCache.items);
  const [inquiriesPage, setInquiriesPage] = useState<number>(1);
  const [inquiriesTotalPages, setInquiriesTotalPages] = useState<number>(
    initialInqCache.totalPages || 1
  );
  const [inquiriesTotal, setInquiriesTotal] = useState<number>(initialInqCache.total || 0);

  // Detail Modal
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

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchPortfolio = useCallback(
    async (page = portfolioPage, search = portfolioSearch, forceRefresh = false) => {
      try {
        const res = await adminService.getPortfolio(
          {
            page,
            limit: 6,
            search: search.trim() || undefined,
          },
          forceRefresh
        );
        const clean = extractPaginatedData(res);
        setPortfolioItems(clean.items);
        setPortfolioTotal(clean.total);
        setPortfolioTotalPages(clean.totalPages);
        setPortfolioPage(clean.page);
        setStats((prev) => {
          const updated = { ...prev, totalPortfolio: clean.total };
          setApiCache("admin_stats", updated);
          return updated;
        });
      } catch (err) {
        console.error("Failed to load portfolio:", err);
      }
    },
    [portfolioPage, portfolioSearch]
  );

  const fetchThreeD = useCallback(
    async (page = threeDPage, search = threeDSearch, forceRefresh = false) => {
      try {
        const res = await adminService.getThreeD(
          {
            page,
            limit: 6,
            search: search.trim() || undefined,
          },
          forceRefresh
        );
        const clean = extractPaginatedData(res);
        setThreeDItems(clean.items);
        setThreeDTotal(clean.total);
        setThreeDTotalPages(clean.totalPages);
        setThreeDPage(clean.page);
        setStats((prev) => {
          const updated = { ...prev, totalThreeD: clean.total };
          setApiCache("admin_stats", updated);
          return updated;
        });
      } catch (err) {
        console.error("Failed to load 3D Studio:", err);
      }
    },
    [threeDPage, threeDSearch]
  );

  const fetchInquiries = useCallback(
    async (page = inquiriesPage, forceRefresh = false) => {
      try {
        const res = await adminService.getInquiries(
          {
            page,
            limit: 6,
          },
          forceRefresh
        );
        const clean = extractPaginatedData(res);
        setInquiriesList(clean.items);
        setInquiriesTotal(clean.total);
        setInquiriesTotalPages(clean.totalPages);
        setInquiriesPage(clean.page);

        const newCount = clean.items.filter((i: any) => i.status === "NEW").length;
        setStats((prev) => {
          const updated = {
            ...prev,
            totalInquiries: clean.total,
            newInquiries: newCount,
          };
          setApiCache("admin_stats", updated);
          return updated;
        });
      } catch (err) {
        console.error("Failed to load inquiries:", err);
      }
    },
    [inquiriesPage]
  );

  const loadAllData = () => {
    fetchPortfolio(1, undefined, true);
    fetchThreeD(1, undefined, true);
    fetchInquiries(1, true);
  };

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen]);

  // Socket Connection Status & Real-time Listeners
  useEffect(() => {
    const handleConnect = () => setIsSocketOnline(true);
    const handleDisconnect = () => setIsSocketOnline(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    const unsubInquiry = onSocketEvent("inquiry:new", (newInquiry) => {
      setInquiriesList((prev) => [newInquiry, ...prev]);
      setStats((prev) => {
        const updated = {
          ...prev,
          totalInquiries: prev.totalInquiries + 1,
          newInquiries: prev.newInquiries + 1,
        };
        setApiCache("admin_stats", updated);
        return updated;
      });
      showNotification("New Client Inquiry Received via Socket.io!", "success");
    });

    const unsubInqUpdated = onSocketEvent("inquiry:updated", (updated) => {
      setInquiriesList((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    });

    const unsubInqDeleted = onSocketEvent("inquiry:deleted", (id) => {
      setInquiriesList((prev) => prev.filter((i) => i.id !== id));
      setStats((prev) => {
        const updated = { ...prev, totalInquiries: Math.max(0, prev.totalInquiries - 1) };
        setApiCache("admin_stats", updated);
        return updated;
      });
    });

    const unsubPortCreated = onSocketEvent("portfolio:created", () => fetchPortfolio(undefined, undefined, true));
    const unsubPortUpdated = onSocketEvent("portfolio:updated", () => fetchPortfolio(undefined, undefined, true));
    const unsubPortDeleted = onSocketEvent("portfolio:deleted", () => fetchPortfolio(undefined, undefined, true));

    const unsubThreeDCreated = onSocketEvent("threed:created", () => fetchThreeD(undefined, undefined, true));
    const unsubThreeDUpdated = onSocketEvent("threed:updated", () => fetchThreeD(undefined, undefined, true));
    const unsubThreeDDeleted = onSocketEvent("threed:deleted", () => fetchThreeD(undefined, undefined, true));

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      unsubInquiry();
      unsubInqUpdated();
      unsubInqDeleted();
      unsubPortCreated();
      unsubPortUpdated();
      unsubPortDeleted();
      unsubThreeDCreated();
      unsubThreeDUpdated();
      unsubThreeDDeleted();
    };
  }, [fetchPortfolio, fetchThreeD]);

  if (!isOpen) return null;

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const { type, isNew, data } = editingItem;

    try {
      if (type === "portfolio") {
        if (isNew) {
          await adminService.createPortfolio(data);
        } else {
          await adminService.updatePortfolio(data.id, data);
        }
        fetchPortfolio(portfolioPage, portfolioSearch, true);
      } else if (type === "threed") {
        if (isNew) {
          await adminService.createThreeD(data);
        } else {
          await adminService.updateThreeD(data.id, data);
        }
        fetchThreeD(threeDPage, threeDSearch, true);
      }

      showNotification(`${type.toUpperCase()} saved & synchronized successfully!`);
      setEditingItem(null);
    } catch (err: any) {
      showNotification(`Save failed: ${err.message}`, "error");
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
        fetchPortfolio(portfolioPage, portfolioSearch, true);
      } else if (type === "threed") {
        await adminService.deleteThreeD(String(id));
        fetchThreeD(threeDPage, threeDSearch, true);
      } else if (type === "inquiries") {
        await adminService.deleteInquiry(String(id));
        fetchInquiries(inquiriesPage, true);
      }

      showNotification("Record deleted successfully.");
      setDeleteModal((prev) => ({ ...prev, isOpen: false, isDeleting: false }));
    } catch (err: any) {
      showNotification(`Delete failed: ${err.message}`, "error");
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
      showNotification(`Inquiry status updated to ${newStatus}`);
    } catch {
      showNotification("Failed to update status", "error");
    }
  };

  return (
    <div className="admin-scope fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Toast */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 shadow-2xl backdrop-blur-xl">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Modal Shell */}
      <div className="relative w-full max-w-6xl h-[92vh] bg-[#0c0e14] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#11131b] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff3b30] to-[#b91c1c] p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-[#0c0d12] rounded-[10px] flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-[#ff3b30]" />
              </div>
            </div>
            <div>
              <h2 className="font-['Syne',sans-serif] font-bold text-base text-white">
                Admin Control Center
              </h2>
              <p className="font-mono text-[10px] text-neutral-400">
                Portfolio, 3D Showcases & Inquiries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neutral-300">
              <Radio className={`w-3 h-3 ${isSocketOnline ? "text-emerald-400 animate-pulse" : "text-amber-400"}`} />
              <span>{isSocketOnline ? "LIVE SOCKET" : "SYNCING"}</span>
            </div>

            <button
              onClick={loadAllData}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-mono transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar - ONLY 3 ENTITIES */}
          <aside className="w-full md:w-56 border-b md:border-b-0 md:border-r border-white/10 bg-[#090b10] p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible shrink-0">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_15px_rgba(255,59,48,0.3)]"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <BarChart3 size={14} />
              <span>OVERVIEW</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("portfolio");
                fetchPortfolio(1);
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "portfolio"
                  ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_15px_rgba(255,59,48,0.3)]"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Briefcase size={14} />
              <span>PORTFOLIO ({stats.totalPortfolio})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("threed");
                fetchThreeD(1);
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "threed"
                  ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_15px_rgba(255,59,48,0.3)]"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Film size={14} />
              <span>3D SHOWCASE ({stats.totalThreeD})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("inquiries");
                fetchInquiries(1);
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "inquiries"
                  ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_15px_rgba(255,59,48,0.3)]"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Mail size={14} />
                <span>INQUIRIES ({stats.totalInquiries})</span>
              </div>
              {stats.newInquiries > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-bold">
                  {stats.newInquiries}
                </span>
              )}
            </button>
          </aside>

          {/* Main Tab Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div
                    onClick={() => {
                      setActiveTab("portfolio");
                      fetchPortfolio(1);
                    }}
                    className="p-5 rounded-2xl bg-[#12141c] border border-white/10 hover:border-blue-500/40 flex flex-col gap-2 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between text-neutral-400 font-mono text-xs">
                      <span>1. PORTFOLIO</span>
                      <Briefcase className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="font-['Syne',sans-serif] font-bold text-3xl text-white">
                      {stats.totalPortfolio}
                    </div>
                    <span className="text-[11px] text-blue-400 font-mono">Published Projects</span>
                  </div>

                  <div
                    onClick={() => {
                      setActiveTab("threed");
                      fetchThreeD(1);
                    }}
                    className="p-5 rounded-2xl bg-[#12141c] border border-white/10 hover:border-purple-500/40 flex flex-col gap-2 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between text-neutral-400 font-mono text-xs">
                      <span>2. 3D STUDIO</span>
                      <Film className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="font-['Syne',sans-serif] font-bold text-3xl text-white">
                      {stats.totalThreeD}
                    </div>
                    <span className="text-[11px] text-purple-400 font-mono">CGI & UE5 Reels</span>
                  </div>

                  <div
                    onClick={() => {
                      setActiveTab("inquiries");
                      fetchInquiries(1);
                    }}
                    className="p-5 rounded-2xl bg-[#12141c] border border-white/10 hover:border-amber-500/40 flex flex-col gap-2 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between text-neutral-400 font-mono text-xs">
                      <span>3. INQUIRIES</span>
                      <Mail className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="font-['Syne',sans-serif] font-bold text-3xl text-white">
                      {stats.totalInquiries}
                    </div>
                    <span className="text-[11px] text-amber-400 font-mono">{stats.newInquiries} Unreviewed</span>
                  </div>
                </div>

                {/* Recent Inquiries List */}
                <div className="p-5 rounded-2xl bg-[#12141c] border border-white/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-['Syne',sans-serif] font-bold text-base text-white">
                      Recent Inbound Leads
                    </h3>
                    <button
                      onClick={() => {
                        setActiveTab("inquiries");
                        fetchInquiries(1);
                      }}
                      className="text-xs font-mono text-[#ff3b30] hover:underline"
                    >
                      VIEW ALL ({stats.totalInquiries}) →
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {inquiriesList.slice(0, 4).map((inq) => (
                      <div
                        key={inq.id}
                        className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{inq.name || inq.fullName}</span>
                            <span className="text-neutral-400 font-mono">({inq.email})</span>
                          </div>
                          <p className="text-neutral-300 line-clamp-1">"{inq.message}"</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewingInquiry(inq)}
                            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-neutral-300 font-mono text-[11px]"
                          >
                            VIEW
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PORTFOLIO TAB */}
            {activeTab === "portfolio" && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Syne',sans-serif] font-bold text-lg text-white">
                    Portfolio ({portfolioTotal})
                  </h3>
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
                          tags: ["React", "WebGL"],
                          image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200",
                        },
                      })
                    }
                    className="px-3.5 py-2 rounded-xl bg-white text-black font-mono text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    <span>ADD PROJECT</span>
                  </button>
                </div>

                {/* Filters */}
                <div className="p-3 rounded-xl bg-[#12141c] border border-white/10 flex gap-2 items-center">
                  <Search className="w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search portfolio..."
                    value={portfolioSearch}
                    onChange={(e) => {
                      setPortfolioSearch(e.target.value);
                      fetchPortfolio(1, e.target.value);
                    }}
                    className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {portfolioItems.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl bg-[#12141c] border border-white/10 flex flex-col justify-between gap-3 text-xs"
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-blue-400 font-mono text-[11px]">
                          <span>{p.client} // {p.year}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingItem({ type: "portfolio", isNew: false, data: p })}
                              className="p-1 rounded text-neutral-300 hover:text-white"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem("portfolio", p.id)}
                              className="p-1 rounded text-red-400"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <h4 className="font-bold text-white text-sm line-clamp-1">{p.title}</h4>
                        <p className="text-neutral-400 line-clamp-2">{p.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="p-3 rounded-xl bg-[#12141c] border border-white/10 flex items-center justify-between text-xs font-mono">
                  <span>Page {portfolioPage} of {portfolioTotalPages}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => fetchPortfolio(portfolioPage - 1)}
                      disabled={portfolioPage <= 1}
                      className="px-2.5 py-1 rounded bg-white/5 disabled:opacity-30"
                    >
                      PREV
                    </button>
                    <button
                      onClick={() => fetchPortfolio(portfolioPage + 1)}
                      disabled={portfolioPage >= portfolioTotalPages}
                      className="px-2.5 py-1 rounded bg-white/5 disabled:opacity-30"
                    >
                      NEXT
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3D SHOWCASE TAB */}
            {activeTab === "threed" && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Syne',sans-serif] font-bold text-lg text-white">
                    3D Studio ({threeDTotal})
                  </h3>
                  <button
                    onClick={() =>
                      setEditingItem({
                        type: "threed",
                        isNew: true,
                        data: {
                          title: "",
                          category: "Architecture & Interiors",
                          client: "",
                          duration: "0:15 // 4K",
                          resolution: "3840 x 2160 (4K UHD)",
                          description: "",
                          posterUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
                        },
                      })
                    }
                    className="px-3.5 py-2 rounded-xl bg-white text-black font-mono text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    <span>ADD 3D SHOWCASE</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[#12141c] border border-white/10 flex gap-2 items-center">
                  <Search className="w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search 3D showcases..."
                    value={threeDSearch}
                    onChange={(e) => {
                      setThreeDSearch(e.target.value);
                      fetchThreeD(1, e.target.value);
                    }}
                    className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {threeDItems.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl bg-[#12141c] border border-white/10 flex flex-col justify-between gap-3 text-xs"
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-purple-400 font-mono text-[11px]">
                          <span>{t.category}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingItem({ type: "threed", isNew: false, data: t })}
                              className="p-1 rounded text-neutral-300 hover:text-white"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem("threed", t.id)}
                              className="p-1 rounded text-red-400"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <h4 className="font-bold text-white text-sm line-clamp-1">{t.title}</h4>
                        <p className="text-neutral-400 line-clamp-2">{t.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-[#12141c] border border-white/10 flex items-center justify-between text-xs font-mono">
                  <span>Page {threeDPage} of {threeDTotalPages}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => fetchThreeD(threeDPage - 1)}
                      disabled={threeDPage <= 1}
                      className="px-2.5 py-1 rounded bg-white/5 disabled:opacity-30"
                    >
                      PREV
                    </button>
                    <button
                      onClick={() => fetchThreeD(threeDPage + 1)}
                      disabled={threeDPage >= threeDTotalPages}
                      className="px-2.5 py-1 rounded bg-white/5 disabled:opacity-30"
                    >
                      NEXT
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* INQUIRIES TAB */}
            {activeTab === "inquiries" && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Syne',sans-serif] font-bold text-lg text-white">
                    Inbound Inquiries ({inquiriesTotal})
                  </h3>
                </div>

                <div className="flex flex-col gap-2.5">
                  {inquiriesList.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-4 rounded-xl bg-[#12141c] border border-white/10 flex flex-col gap-2 text-xs"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{inq.name || inq.fullName}</span>
                          <span className="font-mono text-neutral-400">({inq.email})</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            inq.status === "NEW"
                              ? "bg-amber-500/20 text-amber-300"
                              : inq.status === "CONTACTED"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-neutral-500/20 text-neutral-400"
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>

                      <p className="text-neutral-300 bg-black/40 p-2.5 rounded-lg font-sans">
                        "{inq.message}"
                      </p>

                      <div className="flex items-center justify-between pt-1 font-mono text-[11px] text-neutral-400">
                        <span>Budget: {inq.budget || "Custom"}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewingInquiry(inq)}
                            className="px-2 py-1 rounded bg-white/5 text-neutral-300 hover:text-white"
                          >
                            DETAILS
                          </button>
                          {inq.status === "NEW" && (
                            <button
                              onClick={() => handleUpdateInquiryStatus(inq.id, "CONTACTED")}
                              className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300"
                            >
                              CONTACTED
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteItem("inquiries", inq.id)}
                            className="p-1 rounded text-red-400"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-[#12141c] border border-white/10 flex items-center justify-between text-xs font-mono">
                  <span>Page {inquiriesPage} of {inquiriesTotalPages}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => fetchInquiries(inquiriesPage - 1)}
                      disabled={inquiriesPage <= 1}
                      className="px-2.5 py-1 rounded bg-white/5 disabled:opacity-30"
                    >
                      PREV
                    </button>
                    <button
                      onClick={() => fetchInquiries(inquiriesPage + 1)}
                      disabled={inquiriesPage >= inquiriesTotalPages}
                      className="px-2.5 py-1 rounded bg-white/5 disabled:opacity-30"
                    >
                      NEXT
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Viewing Inquiry Details Modal */}
      {viewingInquiry && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#11131b] border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-['Syne',sans-serif] font-bold text-base text-white">Client Inquiry</h4>
              <button onClick={() => setViewingInquiry(null)} className="text-neutral-400 hover:text-white">
                <X size={15} />
              </button>
            </div>
            <div>Name: <span className="text-white font-bold">{viewingInquiry.name || viewingInquiry.fullName}</span></div>
            <div>Email: <span className="text-blue-400">{viewingInquiry.email}</span></div>
            <div>Phone: <span className="text-white">{viewingInquiry.phone || "N/A"}</span></div>
            <div>Company: <span className="text-white">{viewingInquiry.company || "N/A"}</span></div>
            <div>Budget: <span className="text-emerald-400">{viewingInquiry.budget || "Custom"}</span></div>
            <div>Message:</div>
            <div className="p-3 rounded-xl bg-black/50 border border-white/5 text-neutral-200 font-sans whitespace-pre-wrap">
              {viewingInquiry.message}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingInquiry(null)}
                className="px-4 py-1.5 rounded-xl bg-white text-black font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editing Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#11131b] border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <h4 className="font-['Syne',sans-serif] font-bold text-base text-white">
              {editingItem.isNew ? "Create" : "Edit"} {editingItem.type.toUpperCase()}
            </h4>
            <form onSubmit={handleSaveItem} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-neutral-400">Title</label>
                <input
                  type="text"
                  value={editingItem.data.title || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, title: e.target.value },
                    })
                  }
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-neutral-400">Category</label>
                <input
                  type="text"
                  value={editingItem.data.category || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, category: e.target.value },
                    })
                  }
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-neutral-400">Description</label>
                <textarea
                  rows={3}
                  value={editingItem.data.description || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, description: e.target.value },
                    })
                  }
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#ff3b30] text-white font-bold"
                >
                  Save
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

export default AdminDashboardModal;
