import React, { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  Layers,
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
  Users,
  ShieldCheck,
  UserPlus,
  KeyRound,
  Copy,
  CheckCheck,
  Crown,
  ShieldAlert,
  UserCheck,
  Sparkles,
  BookOpen,
  FileText,
} from "lucide-react";
import { adminService } from "../services/service/adminService";
import { socket, onSocketEvent } from "../utils/socket";
import { ConfirmDeleteModal } from "../components/Admin/ConfirmDeleteModal";
import CachedImage from "../components/CachedImage";
import { getApiCache, setApiCache } from "../utils/apiCache";
import founderPhoto from "../assets/Picture/Picture12.webp";

type TabType = "overview" | "portfolio" | "services" | "team" | "blogs" | "threed" | "inquiries" | "admins";

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

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isSocketOnline, setIsSocketOnline] = useState<boolean>(socket?.connected ?? false);

  // Authenticated Admin User & Role State
  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    email?: string;
    name?: string;
    role: "managedAdmin" | "superAdmin" | "admin";
  }>(() => {
    try {
      const raw = localStorage.getItem("adminUser") || sessionStorage.getItem("adminUser");
      if (raw) {
        const parsed = JSON.parse(raw);
        const r = (parsed.role || "").toLowerCase();
        const role = r.includes("managed") ? "managedAdmin" : r.includes("super") ? "superAdmin" : "admin";
        return { ...parsed, role };
      }
    } catch {}
    const r = (localStorage.getItem("adminRole") || "").toLowerCase();
    const role = r.includes("managed") ? "managedAdmin" : r.includes("super") ? "superAdmin" : "admin";
    return { role, name: "Administrator" };
  });


  // Upload State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Overview Counts from cache (0ms delay)
  const [stats, setStats] = useState(() => {
    return (
      getApiCache<{
        totalPortfolio: number;
        totalServices: number;
        totalTeam: number;
        totalBlogs: number;
        totalThreeD: number;
        totalInquiries: number;
        newInquiries: number;
      }>("admin_stats") || {
        totalPortfolio: 0,
        totalServices: 0,
        totalTeam: 0,
        totalBlogs: 0,
        totalThreeD: 0,
        totalInquiries: 0,
        newInquiries: 0,
      }
    );
  });

  // ==========================================
  // PORTFOLIO STATE (SERVER-SIDE PAGINATION + CACHE)
  // ==========================================
  const initialPortCache = extractPaginatedData(
    getApiCache<any>("admin_portfolio_category=&limit=6&page=1&search=")
  );
  const [portfolioItems, setPortfolioItems] = useState<any[]>(initialPortCache.items);
  const [portfolioPage, setPortfolioPage] = useState<number>(1);
  const [portfolioLimit, setPortfolioLimit] = useState<number>(6);
  const [portfolioTotalPages, setPortfolioTotalPages] = useState<number>(
    initialPortCache.totalPages || 1
  );
  const [portfolioTotal, setPortfolioTotal] = useState<number>(initialPortCache.total || 0);
  const [portfolioSearch, setPortfolioSearch] = useState<string>("");
  const [portfolioCategory, setPortfolioCategory] = useState<string>("All");
  const [portfolioLoading, setPortfolioLoading] = useState<boolean>(false);

  // ==========================================
  // SERVICES STATE (SERVER-SIDE PAGINATION + CACHE)
  // ==========================================
  const initialServCache = extractPaginatedData(
    getApiCache<any>("admin_services_limit=6&page=1&search=")
  );
  const [servicesItems, setServicesItems] = useState<any[]>(initialServCache.items);
  const [servicesPage, setServicesPage] = useState<number>(1);
  const [servicesLimit, setServicesLimit] = useState<number>(6);
  const [servicesTotalPages, setServicesTotalPages] = useState<number>(
    initialServCache.totalPages || 1
  );
  const [servicesTotal, setServicesTotal] = useState<number>(initialServCache.total || 0);
  const [servicesSearch, setServicesSearch] = useState<string>("");
  const [servicesLoading, setServicesLoading] = useState<boolean>(false);

  // ==========================================
  // TEAM MEMBERS STATE (SERVER-SIDE PAGINATION + CACHE)
  // ==========================================
  const initialTeamCache = extractPaginatedData(
    getApiCache<any>("admin_team_limit=10&page=1&search=")
  );
  const [teamItems, setTeamItems] = useState<any[]>(initialTeamCache.items);
  const [teamPage, setTeamPage] = useState<number>(1);
  const [teamLimit, setTeamLimit] = useState<number>(10);
  const [teamTotalPages, setTeamTotalPages] = useState<number>(
    initialTeamCache.totalPages || 1
  );
  const [teamTotal, setTeamTotal] = useState<number>(initialTeamCache.total || 0);
  const [teamSearch, setTeamSearch] = useState<string>("");
  const [teamColumnFilter, setTeamColumnFilter] = useState<string>("ALL");
  const [teamLoading, setTeamLoading] = useState<boolean>(false);

  // ==========================================
  // BLOGS STATE (SERVER-SIDE PAGINATION + CACHE)
  // ==========================================
  const initialBlogsCache = extractPaginatedData(
    getApiCache<any>("admin_blogs_limit=6&page=1&search=")
  );
  const [blogsItems, setBlogsItems] = useState<any[]>(initialBlogsCache.items);
  const [blogsPage, setBlogsPage] = useState<number>(1);
  const [blogsLimit, setBlogsLimit] = useState<number>(6);
  const [blogsTotalPages, setBlogsTotalPages] = useState<number>(
    initialBlogsCache.totalPages || 1
  );
  const [blogsTotal, setBlogsTotal] = useState<number>(initialBlogsCache.total || 0);
  const [blogsSearch, setBlogsSearch] = useState<string>("");
  const [blogsCategory, setBlogsCategory] = useState<string>("All");
  const [blogsLoading, setBlogsLoading] = useState<boolean>(false);

  // ==========================================
  // 3D SHOWCASE STATE (SERVER-SIDE PAGINATION + CACHE)
  // ==========================================
  const initialThreeDCache = extractPaginatedData(
    getApiCache<any>("admin_threed_category=&limit=6&page=1&search=")
  );
  const [threeDItems, setThreeDItems] = useState<any[]>(initialThreeDCache.items);
  const [threeDPage, setThreeDPage] = useState<number>(1);
  const [threeDLimit, setThreeDLimit] = useState<number>(6);
  const [threeDTotalPages, setThreeDTotalPages] = useState<number>(
    initialThreeDCache.totalPages || 1
  );
  const [threeDTotal, setThreeDTotal] = useState<number>(initialThreeDCache.total || 0);
  const [threeDSearch, setThreeDSearch] = useState<string>("");
  const [threeDCategory, setThreeDCategory] = useState<string>("All");
  const [threeDLoading, setThreeDLoading] = useState<boolean>(false);

  // ==========================================
  // INQUIRIES STATE (SERVER-SIDE PAGINATION + CACHE)
  // ==========================================
  const initialInqCache = extractPaginatedData(
    getApiCache<any>("admin_inquiries_limit=6&page=1&search=&status=")
  );
  const [inquiriesList, setInquiriesList] = useState<any[]>(initialInqCache.items);
  const [inquiriesPage, setInquiriesPage] = useState<number>(1);
  const [inquiriesLimit, setInquiriesLimit] = useState<number>(6);
  const [inquiriesTotalPages, setInquiriesTotalPages] = useState<number>(
    initialInqCache.totalPages || 1
  );
  const [inquiriesTotal, setInquiriesTotal] = useState<number>(initialInqCache.total || 0);
  const [inquiriesSearch, setInquiriesSearch] = useState<string>("");
  const [inquiriesStatusFilter, setInquiriesStatusFilter] = useState<string>("ALL");
  const [inquiriesLoading, setInquiriesLoading] = useState<boolean>(false);

  // Selected Inquiry for Detail Modal
  const [viewingInquiry, setViewingInquiry] = useState<any | null>(null);

  // Edit / Create Modal State
  const [editingItem, setEditingItem] = useState<{
    type: "portfolio" | "services" | "team" | "blogs" | "threed" | "founder";
    isNew: boolean;
    data: any;
  } | null>(null);

  // Founder Profile State
  const [founderProfile, setFounderProfile] = useState<any>(null);
  const [founderLoading, setFounderLoading] = useState<boolean>(false);
  const [teamSubTab, setTeamSubTab] = useState<"founder" | "members">("founder");

  const fetchFounder = async (force = false) => {
    try {
      setFounderLoading(true);
      const res = await adminService.getFounder(force);
      if (res) {
        setFounderProfile(res);
      }
    } catch (err) {
      console.error("Failed to fetch founder profile:", err);
    } finally {
      setFounderLoading(false);
    }
  };

  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // ==========================================
  // ADMIN USER MANAGEMENT STATE (SUPER ADMIN / MANAGED ADMIN)
  // ==========================================
  const [adminUsersList, setAdminUsersList] = useState<any[]>([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState<boolean>(false);
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState<boolean>(false);
  const [newAdminForm, setNewAdminForm] = useState<{
    name: string;
    email: string;
    role: "managedAdmin" | "superAdmin" | "admin";
    password: string;
  }>({
    name: "",
    email: "",
    role: "admin",
    password: "",
  });
  const [isRegisteringAdmin, setIsRegisteringAdmin] = useState<boolean>(false);
  const [createdCredentialModal, setCreatedCredentialModal] = useState<{
    isOpen: boolean;
    email: string;
    password: string;
    name: string;
    role: string;
  } | null>(null);
  const [hasCopiedPassword, setHasCopiedPassword] = useState<boolean>(false);

  // Custom Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "portfolio" | "services" | "team" | "blogs" | "threed" | "inquiries" | "adminUser";
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

  // Check auth & fetch current admin profile
  useEffect(() => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    adminService
      .getMe()
      .then((res: any) => {
        if (res?.user) {
          const r = (res.user.role || "").toLowerCase();
          const role = r.includes("managed")
            ? "managedAdmin"
            : r.includes("super")
            ? "superAdmin"
            : "admin";
          const updated = { ...res.user, role };
          setCurrentUser(updated);
          localStorage.setItem("adminUser", JSON.stringify(updated));
          localStorage.setItem("adminRole", role);
        }
      })
      .catch(() => {});
  }, []);

  // Ensure non-managedAdmin cannot stay on 3D tab
  useEffect(() => {
    if (currentUser.role !== "managedAdmin" && activeTab === "threed") {
      setActiveTab("overview");
    }
  }, [currentUser.role, activeTab]);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // ==========================================
  // FETCHERS (SERVER-SIDE PAGINATED + CACHED)
  // ==========================================
  const fetchPortfolio = useCallback(
    async (
      page = portfolioPage,
      limit = portfolioLimit,
      search = portfolioSearch,
      category = portfolioCategory,
      forceRefresh = false
    ) => {
      // If we don't have items in memory, show subtle loader
      if (portfolioItems.length === 0) {
        setPortfolioLoading(true);
      }
      try {
        const res = await adminService.getPortfolio(
          {
            page,
            limit,
            search: search.trim() || undefined,
            category: category !== "All" ? category : undefined,
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
      } finally {
        setPortfolioLoading(false);
      }
    },
    [portfolioPage, portfolioLimit, portfolioSearch, portfolioCategory, portfolioItems.length]
  );

  const fetchServices = useCallback(
    async (
      page = servicesPage,
      limit = servicesLimit,
      search = servicesSearch,
      forceRefresh = false
    ) => {
      if (servicesItems.length === 0) {
        setServicesLoading(true);
      }
      try {
        const res = await adminService.getServices(
          {
            page,
            limit,
            search: search.trim() || undefined,
          },
          forceRefresh
        );
        const clean = extractPaginatedData(res);
        setServicesItems(clean.items);
        setServicesTotal(clean.total);
        setServicesTotalPages(clean.totalPages);
        setServicesPage(clean.page);
        setStats((prev) => {
          const updated = { ...prev, totalServices: clean.total };
          setApiCache("admin_stats", updated);
          return updated;
        });
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        setServicesLoading(false);
      }
    },
    [servicesPage, servicesLimit, servicesSearch, servicesItems.length]
  );

  const fetchTeam = useCallback(
    async (
      page = teamPage,
      limit = teamLimit,
      search = teamSearch,
      column = teamColumnFilter,
      forceRefresh = false
    ) => {
      if (teamItems.length === 0) {
        setTeamLoading(true);
      }
      try {
        const res = await adminService.getTeamMembers(
          {
            page,
            limit,
            search: search.trim() || undefined,
            column: column !== "ALL" ? column : undefined,
          },
          forceRefresh
        );
        const clean = extractPaginatedData(res);
        setTeamItems(clean.items);
        setTeamTotal(clean.total);
        setTeamTotalPages(clean.totalPages);
        setTeamPage(clean.page);
        setStats((prev: any) => {
          const updated = { ...prev, totalTeam: clean.total };
          setApiCache("admin_stats", updated);
          return updated;
        });
      } catch (err) {
        console.error("Failed to load team members:", err);
      } finally {
        setTeamLoading(false);
      }
    },
    [teamPage, teamLimit, teamSearch, teamColumnFilter, teamItems.length]
  );

  const fetchBlogs = useCallback(
    async (
      page = blogsPage,
      limit = blogsLimit,
      search = blogsSearch,
      category = blogsCategory,
      forceRefresh = false
    ) => {
      if (blogsItems.length === 0) {
        setBlogsLoading(true);
      }
      try {
        const res = await adminService.getBlogs(
          {
            page,
            limit,
            search: search.trim() || undefined,
            category: category !== "All" ? category : undefined,
          },
          forceRefresh
        );
        const clean = extractPaginatedData(res);
        setBlogsItems(clean.items);
        setBlogsTotal(clean.total);
        setBlogsTotalPages(clean.totalPages);
        setBlogsPage(clean.page);
        setStats((prev: any) => {
          const updated = { ...prev, totalBlogs: clean.total };
          setApiCache("admin_stats", updated);
          return updated;
        });
      } catch (err) {
        console.error("Failed to load blogs:", err);
      } finally {
        setBlogsLoading(false);
      }
    },
    [blogsPage, blogsLimit, blogsSearch, blogsCategory, blogsItems.length]
  );

  const fetchThreeD = useCallback(
    async (
      page = threeDPage,
      limit = threeDLimit,
      search = threeDSearch,
      category = threeDCategory,
      forceRefresh = false
    ) => {
      // ONLY Managed Admin can fetch or view 3D showcase
      if (currentUser.role !== "managedAdmin") return;

      if (threeDItems.length === 0) {
        setThreeDLoading(true);
      }
      try {
        const res = await adminService.getThreeD(
          {
            page,
            limit,
            search: search.trim() || undefined,
            category: category !== "All" ? category : undefined,
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
      } finally {
        setThreeDLoading(false);
      }
    },
    [threeDPage, threeDLimit, threeDSearch, threeDCategory, threeDItems.length, currentUser.role]
  );

  const fetchInquiries = useCallback(
    async (
      page = inquiriesPage,
      limit = inquiriesLimit,
      search = inquiriesSearch,
      status = inquiriesStatusFilter,
      forceRefresh = false
    ) => {
      if (inquiriesList.length === 0) {
        setInquiriesLoading(true);
      }
      try {
        const res = await adminService.getInquiries(
          {
            page,
            limit,
            search: search.trim() || undefined,
            status: status !== "ALL" ? status : undefined,
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
      } finally {
        setInquiriesLoading(false);
      }
    },
    [inquiriesPage, inquiriesLimit, inquiriesSearch, inquiriesStatusFilter, inquiriesList.length]
  );

  const fetchAdminUsers = useCallback(
    async (forceRefresh = false) => {
      if (currentUser.role !== "managedAdmin" && currentUser.role !== "superAdmin") return;
      setAdminUsersLoading(true);
      try {
        const res: any = await adminService.getAdminUsers(forceRefresh);
        const items = res?.data || (Array.isArray(res) ? res : []);
        setAdminUsersList(items);
      } catch (err) {
        console.error("Failed to load admin users:", err);
      } finally {
        setAdminUsersLoading(false);
      }
    },
    [currentUser.role]
  );

  const reloadAll = () => {
    fetchPortfolio(portfolioPage, portfolioLimit, portfolioSearch, portfolioCategory, true);
    fetchServices(servicesPage, servicesLimit, servicesSearch, true);
    fetchTeam(teamPage, teamLimit, teamSearch, teamColumnFilter, true);
    fetchFounder(true);
    fetchBlogs(blogsPage, blogsLimit, blogsSearch, blogsCategory, true);
    if (currentUser.role === "managedAdmin") {
      fetchThreeD(threeDPage, threeDLimit, threeDSearch, threeDCategory, true);
    }
    fetchInquiries(inquiriesPage, inquiriesLimit, inquiriesSearch, inquiriesStatusFilter, true);
    if (currentUser.role === "managedAdmin" || currentUser.role === "superAdmin") {
      fetchAdminUsers(true);
    }
  };

  useEffect(() => {
    fetchPortfolio(1);
    fetchServices(1);
    fetchTeam(1);
    fetchFounder(true);
    fetchBlogs(1);
    if (currentUser.role === "managedAdmin") {
      fetchThreeD(1);
    }
    fetchInquiries(1);
    if (currentUser.role === "managedAdmin" || currentUser.role === "superAdmin") {
      fetchAdminUsers();
    }
  }, [currentUser.role]);


  // Socket Connection & Real-time Listeners
  useEffect(() => {
    const handleConnect = () => setIsSocketOnline(true);
    const handleDisconnect = () => setIsSocketOnline(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    const unsubServiceCreated = onSocketEvent("service:created", (newService) => {
      showNotification(`Service added: ${newService.title}!`, "success");
      setStats((prev) => {
        const updated = { ...prev, totalServices: prev.totalServices + 1 };
        setApiCache("admin_stats", updated);
        return updated;
      });
      fetchServices(servicesPage, servicesLimit, servicesSearch, true);
    });

    const unsubServiceUpdated = onSocketEvent("service:updated", () => {
      fetchServices(servicesPage, servicesLimit, servicesSearch, true);
    });

    const unsubServiceDeleted = onSocketEvent("service:deleted", () => {
      setStats((prev) => {
        const updated = { ...prev, totalServices: Math.max(0, prev.totalServices - 1) };
        setApiCache("admin_stats", updated);
        return updated;
      });
      fetchServices(servicesPage, servicesLimit, servicesSearch, true);
    });

    const unsubTeamCreated = onSocketEvent("team:created", (newMember) => {
      showNotification(`Team member added: ${newMember.name}!`, "success");
      setStats((prev: any) => {
        const updated = { ...prev, totalTeam: (prev.totalTeam || 0) + 1 };
        setApiCache("admin_stats", updated);
        return updated;
      });
      fetchTeam(teamPage, teamLimit, teamSearch, teamColumnFilter, true);
    });

    const unsubTeamUpdated = onSocketEvent("team:updated", () => {
      fetchTeam(teamPage, teamLimit, teamSearch, teamColumnFilter, true);
    });

    const unsubTeamDeleted = onSocketEvent("team:deleted", () => {
      setStats((prev: any) => {
        const updated = { ...prev, totalTeam: Math.max(0, (prev.totalTeam || 1) - 1) };
        setApiCache("admin_stats", updated);
        return updated;
      });
      fetchTeam(teamPage, teamLimit, teamSearch, teamColumnFilter, true);
    });

    const unsubBlogCreated = onSocketEvent("blog:created", (newBlog) => {
      showNotification(`Blog published: ${newBlog.title}!`, "success");
      setStats((prev: any) => {
        const updated = { ...prev, totalBlogs: (prev.totalBlogs || 0) + 1 };
        setApiCache("admin_stats", updated);
        return updated;
      });
      fetchBlogs(blogsPage, blogsLimit, blogsSearch, blogsCategory, true);
    });

    const unsubBlogUpdated = onSocketEvent("blog:updated", () => {
      fetchBlogs(blogsPage, blogsLimit, blogsSearch, blogsCategory, true);
    });

    const unsubBlogDeleted = onSocketEvent("blog:deleted", () => {
      setStats((prev: any) => {
        const updated = { ...prev, totalBlogs: Math.max(0, (prev.totalBlogs || 1) - 1) };
        setApiCache("admin_stats", updated);
        return updated;
      });
      fetchBlogs(blogsPage, blogsLimit, blogsSearch, blogsCategory, true);
    });

    const unsubInquiryNew = onSocketEvent("inquiry:new", (newInquiry) => {
      showNotification(`New Inquiry from ${newInquiry.name || newInquiry.fullName || "Client"}!`, "success");
      setStats((prev) => {
        const updated = {
          ...prev,
          totalInquiries: prev.totalInquiries + 1,
          newInquiries: prev.newInquiries + 1,
        };
        setApiCache("admin_stats", updated);
        return updated;
      });
      setInquiriesList((prev) => [newInquiry, ...prev]);
    });

    const unsubInquiryUpdated = onSocketEvent("inquiry:updated", (updatedInquiry) => {
      setInquiriesList((prev) => prev.map((inq) => (inq.id === updatedInquiry.id ? updatedInquiry : inq)));
    });

    const unsubInquiryDeleted = onSocketEvent("inquiry:deleted", (id) => {
      setInquiriesList((prev) => prev.filter((inq) => inq.id !== id));
      setStats((prev) => {
        const updated = { ...prev, totalInquiries: Math.max(0, prev.totalInquiries - 1) };
        setApiCache("admin_stats", updated);
        return updated;
      });
    });

    const unsubPortCreated = onSocketEvent("portfolio:created", (newPort) => {
      showNotification(`Portfolio project added: ${newPort?.title || "New Project"}!`, "success");
      setStats((prev) => {
        const updated = { ...prev, totalPortfolio: prev.totalPortfolio + 1 };
        setApiCache("admin_stats", updated);
        return updated;
      });
      fetchPortfolio(portfolioPage, portfolioLimit, portfolioSearch, portfolioCategory, true);
    });
    const unsubPortUpdated = onSocketEvent("portfolio:updated", () => {
      fetchPortfolio(portfolioPage, portfolioLimit, portfolioSearch, portfolioCategory, true);
    });
    const unsubPortDeleted = onSocketEvent("portfolio:deleted", () => {
      setStats((prev) => {
        const updated = { ...prev, totalPortfolio: Math.max(0, prev.totalPortfolio - 1) };
        setApiCache("admin_stats", updated);
        return updated;
      });
      fetchPortfolio(portfolioPage, portfolioLimit, portfolioSearch, portfolioCategory, true);
    });

    const unsubThreeDCreated = onSocketEvent("threed:created", (new3D) => {
      showNotification(`3D Showcase added: ${new3D?.title || "New Showcase"}!`, "success");
      setStats((prev) => {
        const updated = { ...prev, totalThreeD: prev.totalThreeD + 1 };
        setApiCache("admin_stats", updated);
        return updated;
      });
      fetchThreeD(threeDPage, threeDLimit, threeDSearch, threeDCategory, true);
    });
    const unsubThreeDUpdated = onSocketEvent("threed:updated", () => {
      fetchThreeD(threeDPage, threeDLimit, threeDSearch, threeDCategory, true);
    });
    const unsubThreeDDeleted = onSocketEvent("threed:deleted", () => {
      setStats((prev) => {
        const updated = { ...prev, totalThreeD: Math.max(0, prev.totalThreeD - 1) };
        setApiCache("admin_stats", updated);
        return updated;
      });
      fetchThreeD(threeDPage, threeDLimit, threeDSearch, threeDCategory, true);
    });

    const unsubAdminCreated = onSocketEvent("admin:created", (newAdmin) => {
      showNotification(`Admin account registered: ${newAdmin?.name || newAdmin?.email}!`, "success");
      fetchAdminUsers();
    });
    const unsubAdminDeleted = onSocketEvent("admin:deleted", () => {
      fetchAdminUsers();
    });

    const unsubFounderUpdated = onSocketEvent("founder:updated", (updated) => {
      setFounderProfile(updated);
      showNotification("Founder profile synchronized in real-time!", "success");
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      unsubServiceCreated();
      unsubServiceUpdated();
      unsubServiceDeleted();
      unsubTeamCreated();
      unsubTeamUpdated();
      unsubTeamDeleted();
      unsubFounderUpdated();
      unsubBlogCreated();
      unsubBlogUpdated();
      unsubBlogDeleted();
      unsubInquiryNew();
      unsubInquiryUpdated();
      unsubInquiryDeleted();
      unsubPortCreated();
      unsubPortUpdated();
      unsubPortDeleted();
      unsubThreeDCreated();
      unsubThreeDUpdated();
      unsubThreeDDeleted();
      unsubAdminCreated();
      unsubAdminDeleted();
    };
  }, [
    fetchPortfolio,
    fetchServices,
    fetchTeam,
    fetchBlogs,
    fetchThreeD,
    fetchAdminUsers,
    portfolioPage,
    portfolioLimit,
    portfolioSearch,
    portfolioCategory,
    servicesPage,
    servicesLimit,
    servicesSearch,
    teamPage,
    teamLimit,
    teamSearch,
    teamColumnFilter,
    blogsPage,
    blogsLimit,
    blogsSearch,
    blogsCategory,
    threeDPage,
    threeDLimit,
    threeDSearch,
    threeDCategory,
  ]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    window.location.href = "/admin/login";
  };

  const [activeWorkDrop, setActiveWorkDrop] = useState<string | null>(null);

  // ==========================================
  // FILE UPLOAD HANDLER (DRAG & DROP)
  // ==========================================
  const handleFileUpload = async (
    file: File,
    targetField: "image" | "videoUrl" | "workUrl" | "workThumbnail",
    workIndex?: number
  ) => {
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(`Uploading ${file.name}...`);
    try {
      const res: any = await adminService.uploadMedia(file);
      const fileUrl = res?.url || res?.data?.url;
      if (fileUrl) {
        setEditingItem((prev: any) => {
          if (!prev) return prev;
          if (workIndex !== undefined && (targetField === "workUrl" || targetField === "workThumbnail")) {
            const updatedWorks = [...(prev.data.works || [])];
            if (updatedWorks[workIndex]) {
              const fieldToUpdate = targetField === "workUrl" ? "url" : "thumbnail";
              const isVideo = file.type.startsWith("video");
              updatedWorks[workIndex] = {
                ...updatedWorks[workIndex],
                [fieldToUpdate]: fileUrl,
                type: isVideo ? "video" : updatedWorks[workIndex].type === "youtube" ? "youtube" : "image",
                ...(fieldToUpdate === "url" && !updatedWorks[workIndex].thumbnail ? { thumbnail: fileUrl } : {}),
                ...(fieldToUpdate === "thumbnail" && !updatedWorks[workIndex].url ? { url: fileUrl } : {}),
              };
            }
            return {
              ...prev,
              data: {
                ...prev.data,
                works: updatedWorks,
              },
            };
          }
          return {
            ...prev,
            data: {
              ...prev.data,
              [targetField]: fileUrl,
            },
          };
        });
        showNotification(`${file.type.startsWith("video") ? "Video" : "Image"} uploaded to CloudFront!`);
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
        fetchPortfolio(portfolioPage, portfolioLimit, portfolioSearch, portfolioCategory, true);
      } else if (type === "services") {
        const payload = {
          ...data,
          id: data.id || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          number: data.number || "(01)",
          title: data.title || "Service Title",
          subtitle: data.subtitle || "",
          tag: data.tag || "",
          image: data.image || "",
          works: data.works || [],
          details: {
            deliverables: data.details?.deliverables || [],
            timeline: data.details?.timeline || "Ongoing Retainer / Sprint Based",
            description: data.details?.description || "",
            chips: data.details?.chips || [],
          },
        };
        if (isNew) {
          await adminService.createService(payload);
          showNotification("Service capability published!");
        } else {
          await adminService.updateService(data.id, payload);
          showNotification("Service capability updated!");
        }
        fetchServices(servicesPage, servicesLimit, servicesSearch, true);
      } else if (type === "team") {
        const teamPayload = {
          ...data,
          name: data.name || "Team Member",
          role: data.role || "",
          column: Number(data.column) || 1,
          order: Number(data.order) || 1,
          image: data.image || "",
          bio: data.bio || "",
          isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        };
        if (isNew) {
          await adminService.createTeamMember(teamPayload);
          showNotification("Team member published!");
        } else {
          await adminService.updateTeamMember(data.id || data._id, teamPayload);
          showNotification("Team member updated!");
        }
        fetchTeam(teamPage, teamLimit, teamSearch, teamColumnFilter, true);
      } else if (type === "founder") {
        const founderPayload = {
          ...data,
          name: data.name || "SHUBHAM SINGH",
          role: data.role || "CREATIVE DIRECTOR & VISIONARY",
          badge: data.badge || "MEET THE FOUNDER",
          subtitle: data.subtitle || "LEADERSHIP & VISION",
          photoTag: data.photoTag || "FOUNDER",
          cityTag: data.cityTag || "VARANASI × GLOBAL",
          image: data.image || "",
          bio: data.bio || "",
          bioSecondary: data.bioSecondary || "",
          quote: data.quote || "",
          specialties: Array.isArray(data.specialties)
            ? data.specialties
            : typeof data.specialties === "string"
            ? data.specialties.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [],
          linkedinUrl: data.linkedinUrl || "https://linkedin.com",
          instagramUrl: data.instagramUrl || "https://instagram.com",
        };
        const updated = await adminService.updateFounder(founderPayload);
        setFounderProfile(updated?.data || updated || founderPayload);
        showNotification("Founder profile updated successfully!");
        setEditingItem(null);
        fetchFounder(true);
        return;
      } else if (type === "blogs") {
        const blogPayload = {
          ...data,
          id: data.id || data.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `blog-${Date.now()}`,
          number: data.number || "(01)",
          title: data.title || "Blog Title",
          category: data.category || "Digital Acceleration",
          description: data.description || "",
          readTime: data.readTime || "5 MIN READ",
          date: data.date || "AUG 2026",
          image: data.image || "",
          content: Array.isArray(data.content)
            ? data.content
            : typeof data.content === "string"
            ? data.content.split("\n\n").map((s: string) => s.trim()).filter(Boolean)
            : [],
          bullets: Array.isArray(data.bullets)
            ? data.bullets
            : typeof data.bullets === "string"
            ? data.bullets.split("\n").map((s: string) => s.trim().replace(/^[•\-\*]\s*/, "")).filter(Boolean)
            : [],
          isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
        };
        if (isNew) {
          await adminService.createBlog(blogPayload);
          showNotification("Blog article published!");
        } else {
          await adminService.updateBlog(data.id || data._id, blogPayload);
          showNotification("Blog article updated!");
        }
        fetchBlogs(blogsPage, blogsLimit, blogsSearch, blogsCategory, true);
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
        fetchThreeD(threeDPage, threeDLimit, threeDSearch, threeDCategory, true);
      }

      setEditingItem(null);
    } catch (err: any) {
      showNotification(`Failed to save: ${err.message || "Error"}`, "error");
    }
  };

  const handleDeleteItem = (
    type: "portfolio" | "services" | "team" | "blogs" | "threed" | "inquiries" | "adminUser",
    id: string | number,
    title?: string
  ) => {
    setDeleteModal({
      isOpen: true,
      type,
      id,
      title:
        title ||
        (type === "portfolio"
          ? "Portfolio Project"
          : type === "services"
          ? "Service Capability"
          : type === "team"
          ? "Team Member"
          : type === "blogs"
          ? "Blog Article"
          : type === "threed"
          ? "3D Showcase"
          : type === "adminUser"
          ? "Administrator Account"
          : "Inquiry Record"),
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
        fetchPortfolio(portfolioPage, portfolioLimit, portfolioSearch, portfolioCategory, true);
      } else if (type === "services") {
        await adminService.deleteService(String(id));
        showNotification("Service capability removed.");
        fetchServices(servicesPage, servicesLimit, servicesSearch, true);
      } else if (type === "team") {
        await adminService.deleteTeamMember(String(id));
        showNotification("Team member removed.");
        fetchTeam(teamPage, teamLimit, teamSearch, teamColumnFilter, true);
      } else if (type === "blogs") {
        await adminService.deleteBlog(String(id));
        showNotification("Blog article removed.");
        fetchBlogs(blogsPage, blogsLimit, blogsSearch, blogsCategory, true);
      } else if (type === "threed") {
        await adminService.deleteThreeD(String(id));
        showNotification("3D showcase removed.");
        fetchThreeD(threeDPage, threeDLimit, threeDSearch, threeDCategory, true);
      } else if (type === "inquiries") {
        await adminService.deleteInquiry(String(id));
        showNotification("Inquiry deleted.");
        fetchInquiries(inquiriesPage, inquiriesLimit, inquiriesSearch, inquiriesStatusFilter, true);
      } else if (type === "adminUser") {
        await adminService.deleteAdminUser(String(id));
        showNotification("Administrator account removed.");
        fetchAdminUsers(true);
      }
      setDeleteModal((prev) => ({ ...prev, isOpen: false, isDeleting: false }));
    } catch (err: any) {
      showNotification(`Delete failed: ${err.message || "Error"}`, "error");
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminForm.name || !newAdminForm.email) {
      showNotification("Please provide admin name and email address.", "error");
      return;
    }

    setIsRegisteringAdmin(true);
    try {
      const res: any = await adminService.createAdminUser(newAdminForm);
      showNotification(res?.message || "Admin registered successfully!");
      setIsCreateAdminModalOpen(false);
      setCreatedCredentialModal({
        isOpen: true,
        name: newAdminForm.name,
        email: newAdminForm.email,
        password: res?.temporaryPassword || newAdminForm.password,
        role: res?.user?.role || newAdminForm.role,
      });
      setNewAdminForm({ name: "", email: "", role: "admin", password: "" });
      fetchAdminUsers(true);
    } catch (err: any) {
      showNotification(err?.response?.data?.message || err?.message || "Failed to register admin.", "error");
    } finally {
      setIsRegisteringAdmin(false);
    }
  };

  const handleGenerateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    let pwd = "BDG#";
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewAdminForm((prev) => ({ ...prev, password: pwd }));
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

      {/* Header Bar - Mobile Optimized with Official Logo and Role Badge */}
      <header className="px-3.5 sm:px-8 py-2.5 sm:py-3.5 border-b border-white/10 flex items-center justify-between bg-[#0e1017]/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <a href="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src="/Logo/BDG Extended.webp"
              alt="Bharat DigiGuru"
              className="h-6 sm:h-7.5 w-auto object-contain drop-shadow-[0_2px_12px_rgba(255,59,48,0.35)] transition-transform group-hover:scale-105"
            />
          </a>

          {/* Dynamic Role Badge */}
          {currentUser.role === "managedAdmin" && (
            <span className="text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold tracking-wider border border-purple-500/40 shrink-0 flex items-center gap-1 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
              <Crown size={11} className="text-purple-400" />
              <span>MANAGED ADMIN</span>
            </span>
          )}
          {currentUser.role === "superAdmin" && (
            <span className="text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full bg-[#ff3b30]/20 text-red-300 font-mono font-bold tracking-wider border border-[#ff3b30]/40 shrink-0 flex items-center gap-1 shadow-[0_0_12px_rgba(255,59,48,0.3)]">
              <ShieldAlert size={11} className="text-[#ff3b30]" />
              <span>SUPER ADMIN</span>
            </span>
          )}
          {currentUser.role === "admin" && (
            <span className="text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold tracking-wider border border-blue-500/40 shrink-0 flex items-center gap-1 shadow-[0_0_12px_rgba(59,130,246,0.3)]">
              <ShieldCheck size={11} className="text-blue-400" />
              <span>ADMIN</span>
            </span>
          )}
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
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-60 border-r border-white/10 bg-[#0b0c12]/95 p-4 flex-col gap-2 shrink-0">
          {/* Overview */}
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

          {/* Portfolio */}
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

          {/* Services */}
          <button
            onClick={() => {
              setActiveTab("services");
              fetchServices(1);
            }}
            className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
              activeTab === "services"
                ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_15px_rgba(255,59,48,0.35)]"
                : "text-neutral-400 hover:text-white hover:bg-white/5 bg-white/[0.02] border border-white/5"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Layers size={15} className="shrink-0" />
              <span>SERVICES</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${activeTab === "services" ? "bg-white/20 text-white" : "bg-white/10 text-neutral-300"}`}>
              {stats.totalServices}
            </span>
          </button>

          {/* Team */}
          <button
            onClick={() => {
              setActiveTab("team");
              fetchTeam(1);
            }}
            className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
              activeTab === "team"
                ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.35)]"
                : "text-neutral-400 hover:text-white hover:bg-white/5 bg-white/[0.02] border border-white/5"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <UserCheck size={15} className="shrink-0 text-neutral-300" />
              <span>OUR TEAM</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${activeTab === "team" ? "bg-black/20 text-black font-bold" : "bg-white/10 text-neutral-300"}`}>
              {stats.totalTeam || teamTotal}
            </span>
          </button>

          {/* Blogs & Articles - VISIBLE TO ALL ADMINS */}
          <button
            onClick={() => {
              setActiveTab("blogs");
              fetchBlogs(1);
            }}
            className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
              activeTab === "blogs"
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                : "text-neutral-400 hover:text-white hover:bg-white/5 bg-white/[0.02] border border-white/5"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen size={15} className="shrink-0 text-cyan-400" />
              <span>BLOGS</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${activeTab === "blogs" ? "bg-white/20 text-white" : "bg-white/10 text-neutral-300"}`}>
              {stats.totalBlogs || blogsTotal}
            </span>
          </button>

          {/* 3D SHOWCASE - ONLY VISIBLE TO MANAGED ADMIN */}
          {currentUser.role === "managedAdmin" && (
            <button
              onClick={() => {
                setActiveTab("threed");
                fetchThreeD(1);
              }}
              className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeTab === "threed"
                  ? "bg-purple-600 text-white font-bold shadow-[0_0_15px_rgba(147,51,234,0.35)]"
                  : "text-neutral-400 hover:text-white hover:bg-white/5 bg-white/[0.02] border border-white/5"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Film size={15} className="shrink-0 text-purple-400" />
                <span>3D SHOWCASE</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${activeTab === "threed" ? "bg-white/20 text-white" : "bg-white/10 text-neutral-300"}`}>
                {stats.totalThreeD}
              </span>
            </button>
          )}

          {/* Inquiries */}
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

          {/* ADMIN MANAGEMENT - VISIBLE TO MANAGED ADMIN & SUPER ADMIN */}
          {(currentUser.role === "managedAdmin" || currentUser.role === "superAdmin") && (
            <button
              onClick={() => {
                setActiveTab("admins");
                fetchAdminUsers(true);
              }}
              className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeTab === "admins"
                  ? "bg-emerald-600 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                  : "text-neutral-400 hover:text-white hover:bg-white/5 bg-white/[0.02] border border-white/5"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Users size={15} className="shrink-0 text-emerald-400" />
                <span>ADMINS</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${activeTab === "admins" ? "bg-white/20 text-white" : "bg-white/10 text-neutral-300"}`}>
                {adminUsersList.length || 1}
              </span>
            </button>
          )}
        </aside>

        {/* Mobile Bottom Navigation Dock */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c0d14]/95 backdrop-blur-2xl border-t border-white/15 px-2 py-1.5 flex items-center justify-around shadow-[0_-10px_35px_rgba(0,0,0,0.85)]">
          {/* 1. Overview */}
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === "overview"
                ? "text-white font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === "overview" ? "bg-[#ff3b30] text-white shadow-[0_0_15px_rgba(255,59,48,0.5)]" : "bg-transparent"}`}>
              <BarChart3 size={16} />
            </div>
            <span className="text-[9px] font-mono tracking-tight">Overview</span>
          </button>

          {/* 2. Portfolio */}
          <button
            onClick={() => {
              setActiveTab("portfolio");
              fetchPortfolio(1);
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === "portfolio"
                ? "text-white font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <div className={`p-1.5 rounded-xl relative transition-all ${activeTab === "portfolio" ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]" : "bg-transparent"}`}>
              <Briefcase size={16} />
              <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-blue-500 text-[8px] font-mono text-white font-bold leading-none">
                {stats.totalPortfolio}
              </span>
            </div>
            <span className="text-[9px] font-mono tracking-tight">Portfolio</span>
          </button>

          {/* 3. Services */}
          <button
            onClick={() => {
              setActiveTab("services");
              fetchServices(1);
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === "services"
                ? "text-white font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <div className={`p-1.5 rounded-xl relative transition-all ${activeTab === "services" ? "bg-[#ff3b30] text-white shadow-[0_0_15px_rgba(255,59,48,0.5)]" : "bg-transparent"}`}>
              <Layers size={16} />
              <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-red-500 text-[8px] font-mono text-white font-bold leading-none">
                {stats.totalServices}
              </span>
            </div>
            <span className="text-[9px] font-mono tracking-tight">Services</span>
          </button>

          {/* 4. Team */}
          <button
            onClick={() => {
              setActiveTab("team");
              fetchTeam(1);
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === "team"
                ? "text-white font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <div className={`p-1.5 rounded-xl relative transition-all ${activeTab === "team" ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]" : "bg-transparent"}`}>
              <UserCheck size={16} />
              <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-neutral-300 text-[8px] font-mono text-black font-bold leading-none">
                {stats.totalTeam || teamTotal}
              </span>
            </div>
            <span className="text-[9px] font-mono tracking-tight">Team</span>
          </button>

          {/* 5. Blogs */}
          <button
            onClick={() => {
              setActiveTab("blogs");
              fetchBlogs(1);
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === "blogs"
                ? "text-white font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <div className={`p-1.5 rounded-xl relative transition-all ${activeTab === "blogs" ? "bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]" : "bg-transparent"}`}>
              <BookOpen size={16} />
              <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-cyan-500 text-[8px] font-mono text-white font-bold leading-none">
                {stats.totalBlogs || blogsTotal}
              </span>
            </div>
            <span className="text-[9px] font-mono tracking-tight">Blogs</span>
          </button>

          {/* 6. Inquiries */}
          <button
            onClick={() => {
              setActiveTab("inquiries");
              fetchInquiries(1);
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === "inquiries"
                ? "text-white font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <div className={`p-1.5 rounded-xl relative transition-all ${activeTab === "inquiries" ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]" : "bg-transparent"}`}>
              <Mail size={16} />
              <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-amber-400 text-black text-[8px] font-mono font-bold leading-none">
                {stats.totalInquiries}
              </span>
            </div>
            <span className="text-[9px] font-mono tracking-tight">Inquiries</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                {/* 1. Portfolio Card */}
                <div
                  onClick={() => {
                    setActiveTab("portfolio");
                    fetchPortfolio(1);
                  }}
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12141c] to-[#0c0d14] border border-blue-500/25 hover:border-blue-500/60 flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98] shadow-lg"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                      Portfolio
                    </span>
                    <div className="font-['Syne',sans-serif] font-bold text-2xl sm:text-3xl text-white">
                      {stats.totalPortfolio}
                    </div>
                    <span className="text-neutral-400 text-[10px] font-mono">
                      Projects →
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                    <Briefcase size={20} />
                  </div>
                </div>

                {/* 2. Services Card */}
                <div
                  onClick={() => {
                    setActiveTab("services");
                    fetchServices(1);
                  }}
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12141c] to-[#0c0d14] border border-[#ff3b30]/30 hover:border-[#ff3b30]/70 flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98] shadow-lg"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[#ff3b30] font-mono text-xs font-bold uppercase tracking-wider">
                      Services
                    </span>
                    <div className="font-['Syne',sans-serif] font-bold text-2xl sm:text-3xl text-white">
                      {stats.totalServices}
                    </div>
                    <span className="text-neutral-400 text-[10px] font-mono">
                      Capabilities →
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 flex items-center justify-center text-[#ff3b30] group-hover:scale-110 group-hover:bg-[#ff3b30]/20 transition-all">
                    <Layers size={20} />
                  </div>
                </div>

                {/* 3. Team Card */}
                <div
                  onClick={() => {
                    setActiveTab("team");
                    fetchTeam(1);
                  }}
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12141c] to-[#0c0d14] border border-white/20 hover:border-white/50 flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98] shadow-lg"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-mono text-xs font-bold uppercase tracking-wider">
                      Team Members
                    </span>
                    <div className="font-['Syne',sans-serif] font-bold text-2xl sm:text-3xl text-white">
                      {stats.totalTeam || teamTotal}
                    </div>
                    <span className="text-neutral-400 text-[10px] font-mono">
                      5 Columns Grid →
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-white/20 transition-all">
                    <UserCheck size={20} />
                  </div>
                </div>

                {/* 4. Blogs & Articles Card */}
                <div
                  onClick={() => {
                    setActiveTab("blogs");
                    fetchBlogs(1);
                  }}
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12141c] to-[#0c0d14] border border-cyan-500/25 hover:border-cyan-500/60 flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98] shadow-lg"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
                      Blogs & Articles
                    </span>
                    <div className="font-['Syne',sans-serif] font-bold text-2xl sm:text-3xl text-white">
                      {stats.totalBlogs || blogsTotal}
                    </div>
                    <span className="text-neutral-400 text-[10px] font-mono">
                      Editorials →
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all">
                    <BookOpen size={20} />
                  </div>
                </div>

                {/* 5. Inquiries Card */}
                <div
                  onClick={() => {
                    setActiveTab("inquiries");
                    fetchInquiries(1);
                  }}
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12141c] to-[#0c0d14] border border-amber-500/25 hover:border-amber-500/60 flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98] shadow-lg"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                        Client Leads
                      </span>
                      {stats.newInquiries > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[8px] font-mono font-bold">
                          {stats.newInquiries} NEW
                        </span>
                      )}
                    </div>
                    <div className="font-['Syne',sans-serif] font-bold text-2xl sm:text-3xl text-white">
                      {stats.totalInquiries}
                    </div>
                    <span className="text-neutral-400 text-[10px] font-mono">
                      Inbound leads →
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
                    <Mail size={20} />
                  </div>
                </div>

                {/* 6. 3D Studio or Admins Card */}
                {currentUser.role === "managedAdmin" ? (
                  <div
                    onClick={() => {
                      setActiveTab("threed");
                      fetchThreeD(1);
                    }}
                    className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12141c] to-[#0c0d14] border border-purple-500/25 hover:border-purple-500/60 flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98] shadow-lg"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-purple-400 font-mono text-xs font-bold uppercase tracking-wider">
                        3D Showcases
                      </span>
                      <div className="font-['Syne',sans-serif] font-bold text-2xl sm:text-3xl text-white">
                        {stats.totalThreeD}
                      </div>
                      <span className="text-neutral-400 text-[10px] font-mono">
                        CGI Reels →
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
                      <Film size={20} />
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setActiveTab("admins");
                      fetchAdminUsers(true);
                    }}
                    className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12141c] to-[#0c0d14] border border-emerald-500/25 hover:border-emerald-500/60 flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98] shadow-lg"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                        Admins
                      </span>
                      <div className="font-['Syne',sans-serif] font-bold text-2xl sm:text-3xl text-white">
                        {adminUsersList.length || 1}
                      </div>
                      <span className="text-neutral-400 text-[10px] font-mono">
                        Active Admins →
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                      <Users size={20} />
                    </div>
                  </div>
                )}
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
              2. SERVICES TAB (SERVER-SIDE PAGINATED + CACHED)
             ========================================================================= */}
          {activeTab === "services" && (
            <div className="flex flex-col gap-3.5 sm:gap-6">
              {/* Top Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-[#11131b]/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-xl">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Layers size={12} /> Capabilities & Deliverables
                    </span>
                  </div>
                  <h2 className="font-['Syne',sans-serif] font-bold text-xl sm:text-2xl text-white">
                    Services Management ({servicesTotal})
                  </h2>
                  <p className="font-mono text-xs text-neutral-400 mt-0.5">
                    Configure service offerings, deliverables, timelines, and interactive showcase works.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => fetchServices(servicesPage, servicesLimit, servicesSearch, true)}
                    disabled={servicesLoading}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    title="Refresh services list"
                  >
                    <RefreshCw size={15} className={servicesLoading ? "animate-spin text-[#ff3b30]" : ""} />
                  </button>

                  <button
                    onClick={() =>
                      setEditingItem({
                        type: "services",
                        isNew: true,
                        data: {
                          number: `(0${servicesTotal + 1})`,
                          title: "",
                          subtitle: "",
                          tag: "",
                          image: "",
                          works: [],
                          details: {
                            deliverables: [],
                            timeline: "Ongoing Retainer / Sprint Based",
                            description: "",
                            chips: [],
                          },
                        },
                      })
                    }
                    className="px-4 py-2.5 rounded-xl bg-[#ff3b30] hover:bg-[#ff3b30]/90 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(255,59,48,0.35)] transition-all cursor-pointer active:scale-95"
                  >
                    <Plus size={15} />
                    <span>Add Service</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={servicesSearch}
                    onChange={(e) => {
                      setServicesSearch(e.target.value);
                      fetchServices(1, servicesLimit, e.target.value);
                    }}
                    placeholder="Search by title, number, tag, or deliverables..."
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#ff3b30]"
                  />
                </div>

                <div className="flex items-center gap-2 justify-between sm:justify-end">
                  <span className="text-[10px] font-mono text-neutral-400">Page size:</span>
                  <select
                    value={servicesLimit}
                    onChange={(e) => {
                      const newLim = Number(e.target.value);
                      setServicesLimit(newLim);
                      fetchServices(1, newLim, servicesSearch);
                    }}
                    className="bg-[#181a24] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none cursor-pointer"
                  >
                    <option value="4">4</option>
                    <option value="6">6</option>
                    <option value="12">12</option>
                  </select>
                </div>
              </div>

              {/* Services Cards Grid */}
              {servicesLoading && servicesItems.length === 0 ? (
                <div className="py-16 text-center text-neutral-500 font-mono text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#ff3b30]" />
                  <span>Loading services...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {servicesItems.map((s) => (
                    <div
                      key={s.id || s._id}
                      className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#13151f] to-[#0d0e15] border border-white/10 hover:border-white/20 flex flex-col justify-between gap-4 transition-all group shadow-lg"
                    >
                      <div className="flex flex-col gap-3">
                        {/* Header: Number, Title, Action buttons */}
                        <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-lg bg-[#ff3b30]/15 text-[#ff3b30] border border-[#ff3b30]/30 shrink-0">
                              {s.number || "(00)"}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <h3 className="font-['Syne',sans-serif] font-bold text-sm sm:text-base text-white truncate">
                                {s.title}
                              </h3>
                              {s.tag && (
                                <span className="font-mono text-[10px] text-neutral-400 truncate">
                                  {s.tag}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setEditingItem({ type: "services", isNew: false, data: s })}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer active:scale-95"
                              title="Edit Service"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem("services", s.id || s._id, s.title)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer active:scale-95"
                              title="Delete Service"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Image Preview & Scope Overview */}
                        <div className="flex gap-3 items-start">
                          {s.image ? (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-black/40 relative shrink-0 border border-white/10">
                              <CachedImage
                                src={s.image}
                                alt={s.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-neutral-500">
                              <Layers size={20} />
                            </div>
                          )}

                          <div className="flex flex-col gap-1 min-w-0 flex-1">
                            {s.subtitle && (
                              <p className="font-mono text-[11px] text-neutral-300 font-semibold truncate">
                                {s.subtitle}
                              </p>
                            )}
                            <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                              {s.details?.description || "No scope description specified."}
                            </p>
                            <span className="font-mono text-[10px] text-emerald-400 mt-0.5">
                              ⏱ {s.details?.timeline || "Sprint Based"}
                            </span>
                          </div>
                        </div>

                        {/* Deliverables snippet */}
                        {s.details?.deliverables && s.details.deliverables.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {s.details.deliverables.slice(0, 3).map((del: string, dIdx: number) => (
                              <span
                                key={dIdx}
                                className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-neutral-300 border border-white/5"
                              >
                                ✓ {del}
                              </span>
                            ))}
                            {s.details.deliverables.length > 3 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-neutral-500">
                                +{s.details.deliverables.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Showcase Works Mini Carousel */}
                      <div className="pt-2.5 border-t border-white/5 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                          <span>SHOWCASE WORKS ({s.works?.length || 0})</span>
                          <span className="text-neutral-500">First item shown on hover</span>
                        </div>

                        {s.works && s.works.length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                            {s.works.map((w: any, wIdx: number) => (
                              <div
                                key={w.id || wIdx}
                                className="relative rounded-lg overflow-hidden border border-white/10 bg-black/60 h-14 group/work flex items-center justify-center"
                                title={`${w.title} (${w.tag || w.type})`}
                              >
                                {w.thumbnail || w.url ? (
                                  <img
                                    src={w.thumbnail || w.url}
                                    alt={w.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-[9px] font-mono text-neutral-500">Work {wIdx + 1}</span>
                                )}
                                <div className="absolute inset-0 bg-black/40 group-hover/work:bg-black/10 transition-colors flex items-center justify-center">
                                  {w.type === "youtube" ? (
                                    <span className="px-1 py-0.2 rounded bg-red-600 text-white text-[8px] font-mono font-bold">YT</span>
                                  ) : w.type === "video" ? (
                                    <Play size={10} className="text-white fill-white" />
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-2 text-center text-[10px] font-mono text-neutral-500 bg-white/[0.02] rounded-lg border border-white/5">
                            No showcase works configured.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {servicesItems.length === 0 && (
                    <div className="col-span-full py-16 text-center text-xs font-mono text-neutral-500">
                      No services match your filters. Click "Add Service" to create one.
                    </div>
                  )}
                </div>
              )}

              {/* Pagination Footer */}
              <div className="p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 flex items-center justify-between gap-2 text-xs font-mono">
                <span className="text-neutral-400 text-xs">
                  Page <span className="text-white font-bold">{servicesPage}</span> /{" "}
                  <span className="text-white font-bold">{servicesTotalPages}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => fetchServices(servicesPage - 1, servicesLimit, servicesSearch)}
                    disabled={servicesPage <= 1 || servicesLoading}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <ChevronLeft size={13} />
                    <span className="hidden sm:inline">PREV</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: servicesTotalPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => fetchServices(num, servicesLimit, servicesSearch)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-mono text-xs transition-all cursor-pointer ${
                          servicesPage === num
                            ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_10px_rgba(255,59,48,0.4)]"
                            : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => fetchServices(servicesPage + 1, servicesLimit, servicesSearch)}
                    disabled={servicesPage >= servicesTotalPages || servicesLoading}
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
              3. OUR TEAM TAB (SERVER-SIDE PAGINATED + CACHED)
             ========================================================================= */}
          {activeTab === "team" && (
            <div className="flex flex-col gap-3.5 sm:gap-6">
              {/* Sub-tab Navigation between Founder Profile and Editorial Grid */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#11131b]/80 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-white/10 shadow-lg">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTeamSubTab("founder")}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                      teamSubTab === "founder"
                        ? "bg-gradient-to-r from-[#ff3b30] to-[#ff5500] text-white shadow-[0_0_20px_rgba(255,59,48,0.35)]"
                        : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Crown size={14} />
                    <span>Founder Profile (Live on Site)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTeamSubTab("members")}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                      teamSubTab === "members"
                        ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.35)]"
                        : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Users size={14} />
                    <span>Editorial Grid ({teamTotal})</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
                    {teamSubTab === "founder" ? "Live Founder Dossier & Mobile Showcase" : "Editorial 5-Column Grid"}
                  </span>
                </div>
              </div>

              {/* Founder Profile View */}
              {teamSubTab === "founder" && (
                <div className="flex flex-col gap-4 sm:gap-6">
                  {/* Top Bar Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-[#11131b]/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-xl">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#ff3b30]/15 border border-[#ff3b30]/30 text-[#ff3b30] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Crown size={12} /> Active Live Profile
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-stone-300 text-[10px] font-mono uppercase tracking-wider">
                          Founder Dossier &amp; Mobile Showcase
                        </span>
                      </div>
                      <h2 className="font-['Syne',sans-serif] font-bold text-xl sm:text-2xl text-white">
                        Founder &amp; Leadership Management
                      </h2>
                      <p className="font-mono text-xs text-neutral-400 mt-0.5">
                        Manage the founder credentials, bio, philosophy, specialties, and links displayed in the website modal and mobile showcase.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        onClick={() => fetchFounder(true)}
                        disabled={founderLoading}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                        title="Refresh founder data"
                      >
                        <RefreshCw size={15} className={founderLoading ? "animate-spin text-white" : ""} />
                      </button>

                      <button
                        onClick={() =>
                          setEditingItem({
                            type: "founder",
                            isNew: false,
                            data: {
                              name: founderProfile?.name || "SHUBHAM SINGH",
                              role: founderProfile?.role || "CREATIVE DIRECTOR & VISIONARY",
                              badge: founderProfile?.badge || "MEET THE FOUNDER",
                              subtitle: founderProfile?.subtitle || "LEADERSHIP & VISION",
                              photoTag: founderProfile?.photoTag || "FOUNDER",
                              cityTag: founderProfile?.cityTag || "VARANASI × GLOBAL",
                              image: founderProfile?.image || "",
                              bio:
                                founderProfile?.bio ||
                                "Born in India and raised in the city of artists, Varanasi, Shubham has been capturing stories and crafting visuals for as long as he can remember.",
                              bioSecondary:
                                founderProfile?.bioSecondary ||
                                "As an accomplished digital content creator and 3D visionary, he has collaborated with premier global mobile enterprises. His portfolio encompasses high-end commercial CGI, street photography stills, cinematic short films, and high-impact music videos.",
                              quote:
                                founderProfile?.quote ||
                                '"His unique style, artistic training, and profound appreciation for light and architecture make every frame an unforgettable visual journey."',
                              specialties:
                                founderProfile?.specialties && founderProfile.specialties.length > 0
                                  ? founderProfile.specialties
                                  : [
                                      "3D CGI & ArchViz",
                                      "Commercial Stills",
                                      "Cinematic Direction",
                                      "Creative Strategy",
                                    ],
                              linkedinUrl: founderProfile?.linkedinUrl || "https://linkedin.com",
                              instagramUrl: founderProfile?.instagramUrl || "https://instagram.com",
                            },
                          })
                        }
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff3b30] to-[#ff5500] hover:brightness-110 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(255,59,48,0.35)] transition-all cursor-pointer active:scale-95"
                      >
                        <Edit2 size={15} />
                        <span>Edit Founder Profile</span>
                      </button>
                    </div>
                  </div>

                  {/* Founder Profile Live Preview Card */}
                  <div className="bg-[#0e0e12]/95 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
                      {/* Left: Founder Portrait Card */}
                      <div className="md:col-span-5 relative w-full h-[280px] sm:h-[340px] md:h-[400px] rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-2xl group">
                        <img
                          src={founderProfile?.image || founderPhoto}
                          alt={founderProfile?.name || "Shubham Singh"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          style={{ objectPosition: "48% 36%" }}
                        />
                        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                        {/* Floating Badge on Portrait */}
                        <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-between z-10 shadow-lg">
                          <div>
                            <span className="text-xs font-mono uppercase text-white font-bold tracking-wider block">
                              {founderProfile?.name || "SHUBHAM SINGH"}
                            </span>
                            <span className="text-[9px] font-mono text-neutral-400 block">
                              {founderProfile?.cityTag || "VARANASI × GLOBAL"}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[#ff5500] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md bg-[#ff5500]/15 border border-[#ff5500]/30">
                            {founderProfile?.photoTag || "FOUNDER"}
                          </span>
                        </div>
                      </div>

                      {/* Right: Founder Editorial Dossier Content */}
                      <div className="md:col-span-7 flex flex-col items-start space-y-3.5 sm:space-y-4">
                        {/* Pill Badge & Subtitle */}
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10">
                            <Sparkles className="w-3.5 h-3.5 text-[#ff3b30]" />
                            <span className="text-[10px] sm:text-xs font-mono text-white tracking-wide uppercase font-semibold">
                              {founderProfile?.badge || "MEET THE FOUNDER"}
                            </span>
                          </div>
                          <span className="text-[10px] sm:text-xs font-mono uppercase text-[#e06b3a] tracking-widest font-semibold">
                            {founderProfile?.role || "CREATIVE DIRECTOR & VISIONARY"}
                          </span>
                        </div>

                        {/* Header Subtitle tag */}
                        <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest">
                          {founderProfile?.subtitle || "LEADERSHIP & VISION"}
                        </div>

                        {/* Name */}
                        <h3 className="font-['Syne',sans-serif] font-bold text-2xl sm:text-3xl text-white tracking-wide">
                          {founderProfile?.name || "SHUBHAM SINGH"}
                        </h3>

                        {/* Bio Paragraphs */}
                        <div className="space-y-2 text-xs sm:text-sm text-stone-300 font-sans leading-relaxed">
                          <p>
                            {founderProfile?.bio ||
                              "Born in India and raised in the city of artists, Varanasi, Shubham has been capturing stories and crafting visuals for as long as he can remember."}
                          </p>
                          <p className="text-stone-400">
                            {founderProfile?.bioSecondary ||
                              "As an accomplished digital content creator and 3D visionary, he has collaborated with premier global mobile enterprises. His portfolio encompasses high-end commercial CGI, street photography stills, cinematic short films, and high-impact music videos."}
                          </p>
                        </div>

                        {/* Credo / Quote Card */}
                        <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 w-full">
                          <p className="text-xs italic text-stone-300 m-0 leading-relaxed font-sans">
                            {founderProfile?.quote ||
                              '"His unique style, artistic training, and profound appreciation for light and architecture make every frame an unforgettable visual journey."'}
                          </p>
                        </div>

                        {/* Specialties Tags */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {(
                            founderProfile?.specialties || [
                              "3D CGI & ArchViz",
                              "Commercial Stills",
                              "Cinematic Direction",
                              "Creative Strategy",
                            ]
                          ).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/10 text-[10px] font-mono uppercase tracking-wider text-stone-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-3 pt-2">
                          {founderProfile?.linkedinUrl && (
                            <a
                              href={founderProfile.linkedinUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white font-mono text-[10px] tracking-widest uppercase bg-white/5 hover:bg-[#ff3b30]/15 border border-white/10 hover:border-[#ff3b30]/30 transition-all cursor-pointer"
                            >
                              <span>LinkedIn</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                          {founderProfile?.instagramUrl && (
                            <a
                              href={founderProfile.instagramUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white font-mono text-[10px] tracking-widest uppercase bg-white/5 hover:bg-[#ff3b30]/15 border border-white/10 hover:border-[#ff3b30]/30 transition-all cursor-pointer"
                            >
                              <span>Instagram</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Editorial Team Members Grid View */}
              {teamSubTab === "members" && (
                <div className="flex flex-col gap-3.5 sm:gap-6">
                  {/* Top Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-[#11131b]/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-xl">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck size={12} /> Editorial 5-Column Grid
                    </span>
                  </div>
                  <h2 className="font-['Syne',sans-serif] font-bold text-xl sm:text-2xl text-white">
                    Our Team Management ({teamTotal})
                  </h2>
                  <p className="font-mono text-xs text-neutral-400 mt-0.5">
                    Manage team member portraits, column alignments (1-5), roles, and visual order for the editorial section.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => fetchTeam(teamPage, teamLimit, teamSearch, teamColumnFilter, true)}
                    disabled={teamLoading}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    title="Refresh team list"
                  >
                    <RefreshCw size={15} className={teamLoading ? "animate-spin text-white" : ""} />
                  </button>

                  <button
                    onClick={() =>
                      setEditingItem({
                        type: "team",
                        isNew: true,
                        data: {
                          name: "",
                          role: "",
                          column: 1,
                          order: 1,
                          image: "",
                          bio: "",
                          isActive: true,
                        },
                      })
                    }
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.35)] transition-all cursor-pointer active:scale-95"
                  >
                    <Plus size={15} />
                    <span>Add Member</span>
                  </button>
                </div>
              </div>

              {/* Search & Column Filter Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10">
                {/* Column Filter Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  {(["ALL", "1", "2", "3", "4", "5"] as const).map((col) => (
                    <button
                      key={col}
                      onClick={() => {
                        setTeamColumnFilter(col);
                        fetchTeam(1, teamLimit, teamSearch, col);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-mono tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                        teamColumnFilter === col
                          ? "bg-white text-black font-bold shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                          : "bg-white/5 text-neutral-400 hover:text-white border border-white/5"
                      }`}
                    >
                      {col === "ALL" ? "ALL COLUMNS" : `COL ${col}`}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 flex-1 md:max-w-md justify-end">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={teamSearch}
                      onChange={(e) => {
                        setTeamSearch(e.target.value);
                        fetchTeam(1, teamLimit, e.target.value, teamColumnFilter);
                      }}
                      placeholder="Search member name or role..."
                      className="w-full bg-[#181a24] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#181a24] border border-white/10 rounded-xl px-2.5 py-1.5 shrink-0">
                    <span className="text-[10px] font-mono text-neutral-400">Limit:</span>
                    <select
                      value={teamLimit}
                      onChange={(e) => {
                        const newLim = Number(e.target.value);
                        setTeamLimit(newLim);
                        fetchTeam(1, newLim, teamSearch, teamColumnFilter);
                      }}
                      className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
                    >
                      <option value="5" className="bg-[#12141c]">5</option>
                      <option value="10" className="bg-[#12141c]">10</option>
                      <option value="20" className="bg-[#12141c]">20</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Team Members Grid */}
              {teamLoading && teamItems.length === 0 ? (
                <div className="py-16 text-center text-neutral-500 font-mono text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-white" />
                  <span>Loading team members...</span>
                </div>
              ) : teamItems.length === 0 ? (
                <div className="py-16 text-center text-neutral-500 font-mono text-xs flex flex-col items-center gap-3 bg-[#11131b]/60 rounded-3xl border border-white/5 p-8">
                  <UserCheck size={32} className="text-neutral-600" />
                  <span>No team members found matching your search.</span>
                  <button
                    onClick={() =>
                      setEditingItem({
                        type: "team",
                        isNew: true,
                        data: {
                          name: "",
                          role: "",
                          column: 1,
                          order: 1,
                          image: "",
                          bio: "",
                          isActive: true,
                        },
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-white text-black font-mono text-xs font-bold"
                  >
                    Add First Member
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {teamItems.map((m) => (
                    <div
                      key={m.id || m._id}
                      className="p-4 rounded-2xl bg-gradient-to-br from-[#13151f] to-[#0d0e15] border border-white/10 hover:border-white/25 flex flex-col justify-between gap-3.5 transition-all group shadow-lg"
                    >
                      {/* Card Image and badges */}
                      <div className="flex flex-col gap-3">
                        <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-black/50 border border-white/10">
                          {m.image ? (
                            <CachedImage
                              src={m.image}
                              alt={m.name}
                              className="w-full h-full object-cover object-center grayscale contrast-125 brightness-95 group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600">
                              <UserCheck size={36} />
                              <span className="font-mono text-[10px] mt-2">No Photo</span>
                            </div>
                          )}

                          {/* Column Badge */}
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-mono text-white font-bold">
                            Col {m.column || 1}
                          </div>

                          {/* Order Badge */}
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-mono text-white font-bold">
                            #{m.order ?? 1}
                          </div>

                          {/* Status */}
                          <div className="absolute bottom-2 left-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                                m.isActive !== false
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                  : "bg-neutral-500/20 text-neutral-400 border border-neutral-500/40"
                              }`}
                            >
                              {m.isActive !== false ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>

                        {/* Text info */}
                        <div className="flex flex-col gap-0.5">
                          <h3 className="font-['Syne',sans-serif] font-bold text-sm sm:text-base text-white uppercase tracking-wider truncate">
                            {m.name}
                          </h3>
                          <div className="font-mono text-[11px] text-neutral-400 uppercase tracking-wide truncate">
                            {m.role || "TEAM MEMBER"}
                          </div>
                          {m.bio && (
                            <p className="font-sans text-xs text-neutral-400 line-clamp-2 mt-1">
                              {m.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Actions Footer */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-white/10">
                        <span className="font-mono text-[10px] text-neutral-500">
                          ID: {String(m.id || m._id || "").slice(-6)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              setEditingItem({
                                type: "team",
                                isNew: false,
                                data: m,
                              })
                            }
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors cursor-pointer active:scale-95"
                            title="Edit Member"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem("team", m.id || m._id, m.name)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer active:scale-95"
                            title="Delete Member"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 mt-2">
                <span className="text-xs font-mono text-neutral-400">
                  Showing Page <strong className="text-white">{teamPage}</strong> of{" "}
                  <strong className="text-white">{teamTotalPages}</strong> ({teamTotal} members)
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => fetchTeam(teamPage - 1, teamLimit, teamSearch, teamColumnFilter)}
                    disabled={teamPage <= 1 || teamLoading}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <ChevronLeft size={13} />
                    <span className="hidden sm:inline">PREV</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: teamTotalPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => fetchTeam(num, teamLimit, teamSearch, teamColumnFilter)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-mono text-xs transition-all cursor-pointer ${
                          teamPage === num
                            ? "bg-white text-black font-bold shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                            : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => fetchTeam(teamPage + 1, teamLimit, teamSearch, teamColumnFilter)}
                    disabled={teamPage >= teamTotalPages || teamLoading}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <span className="hidden sm:inline">NEXT</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

          {/* =========================================================================
              BLOGS & EDITORIAL ARTICLES TAB (SERVER-SIDE PAGINATED & REALTIME SYNC)
             ========================================================================= */}
          {activeTab === "blogs" && (
            <div className="flex flex-col gap-3.5 sm:gap-6">
              {/* Top Controls */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-['Syne',sans-serif] font-bold text-base sm:text-xl text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                    <span>Blogs & Articles ({blogsTotal})</span>
                  </h2>
                  <p className="font-mono text-[10px] sm:text-xs text-neutral-400">
                    Editorial publications, industry knowledge, and thought-leadership articles
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditingItem({
                      type: "blogs",
                      isNew: true,
                      data: {
                        number: `(${String(blogsTotal + 1).padStart(2, "0")})`,
                        category: "Digital Acceleration",
                        title: "",
                        description: "",
                        readTime: "5 MIN READ",
                        date: "AUG 2026",
                        image: "",
                        content: [""],
                        bullets: [""],
                        isPublished: true,
                      },
                    })
                  }
                  className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.35)] shrink-0 active:scale-95 transition-all"
                >
                  <Plus size={14} />
                  <span>ADD BLOG</span>
                </button>
              </div>

              {/* Toolbar */}
              <div className="p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search articles by title, description, or content..."
                    value={blogsSearch}
                    onChange={(e) => {
                      setBlogsSearch(e.target.value);
                      fetchBlogs(1, blogsLimit, e.target.value, blogsCategory);
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 sm:flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 min-w-0">
                    <Filter className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <select
                      value={blogsCategory}
                      onChange={(e) => {
                        setBlogsCategory(e.target.value);
                        fetchBlogs(1, blogsLimit, blogsSearch, e.target.value);
                      }}
                      className="w-full bg-transparent text-xs font-mono text-neutral-300 focus:outline-none cursor-pointer truncate"
                    >
                      <option value="All" className="bg-[#12141c]">All Categories</option>
                      <option value="Digital Acceleration" className="bg-[#12141c]">Digital Acceleration</option>
                      <option value="Tech Era & Culture" className="bg-[#12141c]">Tech Era & Culture</option>
                      <option value="SMM & ORM" className="bg-[#12141c]">SMM & ORM</option>
                      <option value="Paid Media" className="bg-[#12141c]">Paid Media</option>
                      <option value="Lead Systems" className="bg-[#12141c]">Lead Systems</option>
                      <option value="Web Engineering" className="bg-[#12141c]">Web Engineering</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-neutral-400">
                    <span>Limit:</span>
                    <select
                      value={blogsLimit}
                      onChange={(e) => {
                        const newLimit = Number(e.target.value);
                        setBlogsLimit(newLimit);
                        fetchBlogs(1, newLimit, blogsSearch, blogsCategory);
                      }}
                      className="bg-transparent text-white focus:outline-none cursor-pointer"
                    >
                      <option value="6" className="bg-[#12141c]">6</option>
                      <option value="12" className="bg-[#12141c]">12</option>
                      <option value="24" className="bg-[#12141c]">24</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Blogs Cards Grid */}
              {blogsLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-400 font-mono text-xs">
                  <Loader2 size={24} className="animate-spin text-cyan-400" />
                  <span>Loading editorial articles...</span>
                </div>
              ) : blogsItems.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 p-8 rounded-3xl bg-[#12141c] border border-white/10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <BookOpen size={28} />
                  </div>
                  <h3 className="font-['Syne',sans-serif] font-bold text-lg text-white">No Articles Found</h3>
                  <p className="font-mono text-xs text-neutral-400 max-w-sm">
                    {blogsSearch || blogsCategory !== "All"
                      ? "No articles matched your filter criteria."
                      : "Publish your first thought-leadership article to showcase in the blog."}
                  </p>
                  <button
                    onClick={() =>
                      setEditingItem({
                        type: "blogs",
                        isNew: true,
                        data: {
                          number: "(01)",
                          category: "Digital Acceleration",
                          title: "",
                          description: "",
                          readTime: "5 MIN READ",
                          date: "AUG 2026",
                          image: "",
                          content: [""],
                          bullets: [""],
                          isPublished: true,
                        },
                      })
                    }
                    className="mt-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase cursor-pointer transition-all"
                  >
                    + Publish First Article
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {blogsItems.map((blog) => {
                    const paragraphsCount = Array.isArray(blog.content) ? blog.content.length : 0;
                    const bulletsCount = Array.isArray(blog.bullets) ? blog.bullets.length : 0;

                    return (
                      <div
                        key={blog.id || blog._id}
                        className="group relative rounded-2xl overflow-hidden bg-[#12141c] border border-white/10 hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between shadow-xl"
                      >
                        <div>
                          {/* Image Banner Header */}
                          <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60 flex items-center justify-center border-b border-white/5">
                            {blog.image ? (
                              <CachedImage
                                src={blog.image}
                                alt={blog.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-cyan-950/40 via-black to-[#12141c]">
                                <BookOpen size={32} className="text-cyan-500/40" />
                                <span className="font-mono text-[10px] text-neutral-500">Text-Based Editorial</span>
                              </div>
                            )}

                            {/* Top Floating Badges */}
                            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-10">
                              <span className="px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300">
                                {blog.category || "Editorial"}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-mono font-bold text-white">
                                {blog.number || "(01)"}
                              </span>
                            </div>

                            {/* Bottom Floating Read-time & Date */}
                            <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono text-neutral-300 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                              <span>{blog.date || "AUG 2026"}</span>
                              <span className="text-cyan-300 font-bold">{blog.readTime || "5 MIN READ"}</span>
                            </div>
                          </div>

                          {/* Article Body */}
                          <div className="p-4 sm:p-5 flex flex-col gap-2.5">
                            <h3 className="font-['Syne',sans-serif] font-bold text-base sm:text-lg text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                              {blog.title}
                            </h3>

                            <p className="font-mono text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                              {blog.description}
                            </p>

                            {/* Structure Indicators */}
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-[10px] font-mono">
                              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-300">
                                📝 {paragraphsCount} {paragraphsCount === 1 ? "Paragraph" : "Paragraphs"}
                              </span>
                              {bulletsCount > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                                  ⚡ {bulletsCount} {bulletsCount === 1 ? "Bullet" : "Bullets"}
                                </span>
                              )}
                              <span
                                className={`ml-auto px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                                  blog.isPublished !== false
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-neutral-500/20 text-neutral-400 border border-neutral-500/30"
                                }`}
                              >
                                {blog.isPublished !== false ? "Published" : "Draft"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Action Footer */}
                        <div className="p-3 bg-[#0e1017] border-t border-white/10 flex items-center justify-between">
                          <span className="font-mono text-[10px] text-neutral-500">
                            Slug: {String(blog.id || blog._id || "").slice(0, 16)}...
                          </span>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`/blogs/${blog.id || blog._id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors"
                              title="View on Live Site"
                            >
                              <ExternalLink size={13} />
                            </a>
                            <button
                              onClick={() =>
                                setEditingItem({
                                  type: "blogs",
                                  isNew: false,
                                  data: {
                                    ...blog,
                                    content: Array.isArray(blog.content) ? blog.content : [blog.content || ""],
                                    bullets: Array.isArray(blog.bullets) ? blog.bullets : [blog.bullets || ""],
                                  },
                                })
                              }
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors cursor-pointer active:scale-95"
                              title="Edit Article"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem("blogs", blog.id || blog._id, blog.title)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer active:scale-95"
                              title="Delete Article"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 mt-2">
                <span className="text-xs font-mono text-neutral-400">
                  Showing Page <strong className="text-white">{blogsPage}</strong> of{" "}
                  <strong className="text-white">{blogsTotalPages}</strong> ({blogsTotal} articles)
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => fetchBlogs(blogsPage - 1, blogsLimit, blogsSearch, blogsCategory)}
                    disabled={blogsPage <= 1 || blogsLoading}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer active:scale-95 transition-colors"
                  >
                    <ChevronLeft size={13} />
                    <span className="hidden sm:inline">PREV</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: blogsTotalPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => fetchBlogs(num, blogsLimit, blogsSearch, blogsCategory)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-mono text-xs transition-all cursor-pointer ${
                          blogsPage === num
                            ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                            : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => fetchBlogs(blogsPage + 1, blogsLimit, blogsSearch, blogsCategory)}
                    disabled={blogsPage >= blogsTotalPages || blogsLoading}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer active:scale-95 transition-colors"
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

          {/* =========================================================================
              5. ADMINISTRATORS MANAGEMENT TAB
             ========================================================================= */}
          {activeTab === "admins" && (
            <div className="flex flex-col gap-4 sm:gap-6 animate-in fade-in duration-200">
              {/* Header section with Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-[#11131b]/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-xl">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck size={12} /> Access Control & RBAC
                    </span>
                  </div>
                  <h2 className="font-['Syne',sans-serif] font-bold text-xl sm:text-2xl text-white">
                    Administrator Accounts
                  </h2>
                  <p className="font-mono text-xs text-neutral-400 mt-0.5">
                    Register, manage, and provision credentials for portal administrators with role-based permissions.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => fetchAdminUsers(true)}
                    disabled={adminUsersLoading}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    title="Refresh administrator list"
                  >
                    <RefreshCw size={15} className={adminUsersLoading ? "animate-spin text-emerald-400" : ""} />
                  </button>

                  {(currentUser.role === "managedAdmin" || currentUser.role === "superAdmin") && (
                    <button
                      onClick={() => setIsCreateAdminModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer active:scale-95"
                    >
                      <UserPlus size={15} />
                      <span>Register Admin</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Administrators Table / List Card */}
              <div className="bg-[#11131b]/90 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-emerald-400" />
                    <span className="font-['Syne',sans-serif] font-bold text-sm sm:text-base text-white">
                      Registered Accounts ({adminUsersList.length})
                    </span>
                  </div>
                </div>

                {adminUsersLoading && adminUsersList.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-400 font-mono text-xs">
                    <Loader2 size={24} className="animate-spin text-emerald-400" />
                    <span>Loading administrator accounts...</span>
                  </div>
                ) : adminUsersList.length === 0 ? (
                  <div className="py-12 text-center text-neutral-400 font-mono text-xs">
                    No administrators registered yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {adminUsersList.map((user) => {
                      const isMasterUser = user.role === "managedAdmin" && (!user.createdBy || user.createdBy === "system_seed");
                      const isSelf = Boolean(currentUser.email && user.email && user.email.toLowerCase() === currentUser.email.toLowerCase());
                      
                      return (
                        <div
                          key={user._id || user.id || user.email}
                          className="p-4 rounded-2xl bg-gradient-to-br from-[#161822] to-[#0f1118] border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between gap-3 shadow-md"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                                user.role === "managedAdmin"
                                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                                  : user.role === "superAdmin"
                                  ? "bg-red-600/20 text-red-300 border border-red-500/30"
                                  : "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                              }`}>
                                {user.name ? user.name.charAt(0).toUpperCase() : "A"}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-white text-sm truncate">
                                    {user.name}
                                  </span>
                                  {isSelf && (
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-mono font-bold">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono text-xs text-neutral-400 truncate">
                                  {user.email}
                                </span>
                              </div>
                            </div>

                            {/* Role Badge */}
                            <div>
                              {user.role === "managedAdmin" ? (
                                <span className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold flex items-center gap-1">
                                  <Crown size={11} /> Managed Admin
                                </span>
                              ) : user.role === "superAdmin" ? (
                                <span className="px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-[10px] font-mono font-bold flex items-center gap-1">
                                  <ShieldAlert size={11} /> Super Admin
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-mono font-bold flex items-center gap-1">
                                  <ShieldCheck size={11} /> Admin
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Footer Details */}
                          <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[11px] font-mono text-neutral-500">
                            <span>
                              Created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Master Seed"}
                            </span>

                            {/* Delete Action Button */}
                            {!isMasterUser && !isSelf && (
                              <button
                                onClick={() => handleDeleteItem("adminUser", user._id || user.id || "", `Admin: ${user.name}`)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                                title="Revoke and delete admin account"
                              >
                                <Trash2 size={12} />
                                <span>Revoke</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                {editingItem.type === "portfolio"
                  ? "Portfolio Project"
                  : editingItem.type === "services"
                  ? "Service Capability"
                  : editingItem.type === "team"
                  ? "Team Member"
                  : editingItem.type === "founder"
                  ? "Founder Profile"
                  : editingItem.type === "blogs"
                  ? "Blog Article"
                  : "3D Showcase Video"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="flex flex-col gap-3.5">
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

              {/* Services Specific Fields */}
              {editingItem.type === "services" && (
                <div className="flex flex-col gap-4 text-left">
                  {/* Number & Tag row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Service Index (Number)
                      </label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.number || "(01)"}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, number: e.target.value },
                          })
                        }
                        placeholder="(01)"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-[#ff3b30]"
                      />
                    </div>
                    <div className="sm:col-span-2 flex flex-col gap-1">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Tagline / Category Badge
                      </label>
                      <input
                        type="text"
                        value={editingItem.data.tag || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, tag: e.target.value },
                          })
                        }
                        placeholder="& 360° DIGITAL ACCELERATION"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff3b30]"
                      />
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Service Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.title || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, title: e.target.value },
                          })
                        }
                        placeholder="e.g. Digital Media Services"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-[#ff3b30]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Subtitle / Scope Headline
                      </label>
                      <input
                        type="text"
                        value={editingItem.data.subtitle || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, subtitle: e.target.value },
                          })
                        }
                        placeholder="360° SMM, SEO, PERFORMANCE ADS & LEAD GEN"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff3b30]"
                      />
                    </div>
                  </div>

                  {/* Cover Image Upload */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Cover Image (CloudFront CDN / Upload)
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
                      <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/40 p-2.5 flex items-center gap-3">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10 relative">
                          <CachedImage
                            src={editingItem.data.image}
                            alt="Cover Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <span className="font-mono text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle size={12} /> Cover Attached
                          </span>
                          <p className="font-mono text-[10px] text-neutral-400 truncate max-w-full">
                            {editingItem.data.image}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <label className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[10px] font-mono font-bold cursor-pointer transition-colors active:scale-95 inline-flex items-center gap-1">
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
                        className="relative border-2 border-dashed border-white/15 hover:border-white/30 rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-2 bg-[#181a24]/50"
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
                          <div className="flex flex-col items-center gap-1.5 py-2">
                            <Loader2 className="w-6 h-6 text-[#ff3b30] animate-spin" />
                            <span className="text-xs font-mono text-neutral-300">{uploadProgress || "Uploading..."}</span>
                          </div>
                        ) : (
                          <>
                            <UploadCloud size={18} className="text-neutral-400" />
                            <p className="text-xs text-neutral-300">
                              Drag cover image here or <span className="text-[#ff3b30] underline">browse</span>
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    <input
                      type="text"
                      value={editingItem.data.image || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, image: e.target.value },
                        })
                      }
                      placeholder="Or paste CloudFront / CDN image link (https://...)"
                      className="w-full bg-[#181a24]/50 border border-white/5 rounded-lg px-2.5 py-1 text-[11px] font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-[#ff3b30]"
                    />
                  </div>

                  {/* Comprehensive Scope & Timeline */}
                  <div className="flex flex-col gap-2.5 p-3 rounded-2xl bg-[#141620] border border-white/10">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">
                        Service Scope & Overview Description
                      </label>
                      <textarea
                        rows={3}
                        value={editingItem.data.details?.description || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: {
                              ...editingItem.data,
                              details: {
                                ...(editingItem.data.details || {}),
                                description: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="Detailed narrative of this capability..."
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff3b30]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">
                        Execution Timeline
                      </label>
                      <input
                        type="text"
                        value={editingItem.data.details?.timeline || "Ongoing Retainer / Sprint Based"}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: {
                              ...editingItem.data,
                              details: {
                                ...(editingItem.data.details || {}),
                                timeline: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="e.g. 1–2 Weeks Per Shoot or Ongoing Retainer"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff3b30]"
                      />
                    </div>
                  </div>

                  {/* Deliverables & Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-[#141620] border border-white/10">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">
                        Key Deliverables (one per line)
                      </label>
                      <textarea
                        rows={4}
                        value={
                          Array.isArray(editingItem.data.details?.deliverables)
                            ? editingItem.data.details.deliverables.join("\n")
                            : ""
                        }
                        onChange={(e) => {
                          const lines = e.target.value.split("\n").filter((l) => l.trim().length > 0);
                          setEditingItem({
                            ...editingItem,
                            data: {
                              ...editingItem.data,
                              details: {
                                ...(editingItem.data.details || {}),
                                deliverables: lines,
                              },
                            },
                          });
                        }}
                        placeholder="Strategic SMM&#10;SEO & SMO&#10;ORM Management"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff3b30]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">
                        Specialized Chips / Tech (comma-separated)
                      </label>
                      <textarea
                        rows={4}
                        value={
                          Array.isArray(editingItem.data.details?.chips)
                            ? editingItem.data.details.chips.join(", ")
                            : ""
                        }
                        onChange={(e) => {
                          const chips = e.target.value
                            .split(",")
                            .map((c) => c.trim())
                            .filter(Boolean);
                          setEditingItem({
                            ...editingItem,
                            data: {
                              ...editingItem.data,
                              details: {
                                ...(editingItem.data.details || {}),
                                chips,
                              },
                            },
                          });
                        }}
                        placeholder="SMM, SEO, SMO, Meta Ads, Google Ads..."
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff3b30]"
                      />
                    </div>
                  </div>

                  {/* Showcase Works Manager with Drag & Drop */}
                  <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-[#141620] border border-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div>
                        <span className="font-mono text-[11px] font-bold text-white uppercase tracking-wider block">
                          Showcase Works ({editingItem.data.works?.length || 0})
                        </span>
                        <span className="font-mono text-[9px] text-neutral-400">
                          First showcase work image is displayed dynamically on website hover
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const currentWorks = editingItem.data.works || [];
                          const newWork = {
                            id: `work-${Date.now()}`,
                            title: `Showcase Item #${currentWorks.length + 1}`,
                            type: "image",
                            url: "",
                            thumbnail: "",
                            tag: "Featured Reel",
                            description: "Showcase description...",
                            metrics: "4K Master",
                          };
                          setEditingItem({
                            ...editingItem,
                            data: {
                              ...editingItem.data,
                              works: [...currentWorks, newWork],
                            },
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#ff3b30]/20 hover:bg-[#ff3b30]/30 border border-[#ff3b30]/30 text-[#ff3b30] text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                      >
                        <Plus size={11} /> Add Work
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                      {(editingItem.data.works || []).map((w: any, idx: number) => {
                        const dropKey = `work-${idx}`;
                        const isDraggingHere = activeWorkDrop === dropKey;

                        return (
                          <div
                            key={w.id || idx}
                            className="p-3.5 rounded-2xl bg-[#181a24] border border-white/10 flex flex-col gap-2.5 relative"
                          >
                            {/* Work Card Header */}
                            <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[11px] font-bold text-white">
                                  Work #{idx + 1}
                                </span>
                                {idx === 0 && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold">
                                    ★ Hover Preview
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={w.type || "image"}
                                  onChange={(e) => {
                                    const updatedWorks = [...editingItem.data.works];
                                    updatedWorks[idx] = { ...updatedWorks[idx], type: e.target.value };
                                    setEditingItem({
                                      ...editingItem,
                                      data: { ...editingItem.data, works: updatedWorks },
                                    });
                                  }}
                                  className="bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-mono text-neutral-200 focus:outline-none focus:border-[#ff3b30] cursor-pointer"
                                >
                                  <option value="image">Image Work</option>
                                  <option value="video">Video Work</option>
                                  <option value="youtube">YouTube Video</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedWorks = editingItem.data.works.filter((_: any, i: number) => i !== idx);
                                    setEditingItem({
                                      ...editingItem,
                                      data: { ...editingItem.data, works: updatedWorks },
                                    });
                                  }}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                                  title="Remove Work"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Title & Tag */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-mono text-neutral-400 uppercase">Work Title</label>
                                <input
                                  type="text"
                                  value={w.title || ""}
                                  onChange={(e) => {
                                    const updatedWorks = [...editingItem.data.works];
                                    updatedWorks[idx] = { ...updatedWorks[idx], title: e.target.value };
                                    setEditingItem({
                                      ...editingItem,
                                      data: { ...editingItem.data, works: updatedWorks },
                                    });
                                  }}
                                  placeholder="e.g. Apex Growth Campaign"
                                  className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff3b30]"
                                />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-mono text-neutral-400 uppercase">Tag / Badge</label>
                                <input
                                  type="text"
                                  value={w.tag || ""}
                                  onChange={(e) => {
                                    const updatedWorks = [...editingItem.data.works];
                                    updatedWorks[idx] = { ...updatedWorks[idx], tag: e.target.value };
                                    setEditingItem({
                                      ...editingItem,
                                      data: { ...editingItem.data, works: updatedWorks },
                                    });
                                  }}
                                  placeholder="e.g. Ad Campaign Reel / Studio Shoot"
                                  className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff3b30]"
                                />
                              </div>
                            </div>

                            {/* Drag & Drop Media Upload Area */}
                            {w.type === "youtube" ? (
                              <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-black/40 border border-red-500/20">
                                <label className="text-[9px] font-mono text-red-400 uppercase font-bold flex items-center gap-1">
                                  <span>YouTube URL / Embed Link</span>
                                </label>
                                <div className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    value={w.url || ""}
                                    onChange={(e) => {
                                      const urlVal = e.target.value;
                                      let ytId = "";
                                      const match = urlVal.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                                      if (match && match[1]) {
                                        ytId = match[1];
                                      }
                                      const updatedWorks = [...editingItem.data.works];
                                      updatedWorks[idx] = {
                                        ...updatedWorks[idx],
                                        url: urlVal,
                                        youtubeId: ytId || updatedWorks[idx].youtubeId,
                                        thumbnail: ytId
                                          ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                                          : updatedWorks[idx].thumbnail || "",
                                      };
                                      setEditingItem({
                                        ...editingItem,
                                        data: { ...editingItem.data, works: updatedWorks },
                                      });
                                    }}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="flex-1 bg-[#181a24] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                                  />
                                </div>
                                {w.thumbnail && (
                                  <div className="flex items-center gap-2.5 pt-1">
                                    <img
                                      src={w.thumbnail}
                                      alt="YT Preview"
                                      className="w-20 h-12 object-cover rounded-lg border border-white/10"
                                    />
                                    <span className="text-[10px] font-mono text-neutral-400">
                                      Thumbnail synced from YouTube ({w.youtubeId || "Auto"})
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                  <label className="text-[9px] font-mono text-neutral-400 uppercase font-semibold">
                                    Work Media (Drag & Drop Image or Video)
                                  </label>
                                  {w.url && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedWorks = [...editingItem.data.works];
                                        updatedWorks[idx] = { ...updatedWorks[idx], url: "", thumbnail: "" };
                                        setEditingItem({
                                          ...editingItem,
                                          data: { ...editingItem.data, works: updatedWorks },
                                        });
                                      }}
                                      className="text-[9px] font-mono text-red-400 hover:underline cursor-pointer flex items-center gap-0.5"
                                    >
                                      <Trash2 size={10} /> Clear Media
                                    </button>
                                  )}
                                </div>

                                {w.url ? (
                                  <div className="rounded-xl overflow-hidden border border-white/15 bg-black/40 p-2 flex items-center gap-2.5">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10 relative">
                                      {w.type === "video" || w.url.endsWith(".mp4") || w.url.endsWith(".webm") ? (
                                        <video
                                          src={w.url}
                                          className="w-full h-full object-cover"
                                          muted
                                          autoPlay
                                          loop
                                          playsInline
                                        />
                                      ) : (
                                        <CachedImage
                                          src={w.thumbnail || w.url}
                                          alt="Work Preview"
                                          className="w-full h-full object-cover"
                                        />
                                      )}
                                    </div>
                                    <div className="flex flex-col gap-1 min-w-0 flex-1 text-left">
                                      <span className="font-mono text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                                        <CheckCircle size={11} /> File Uploaded & Linked
                                      </span>
                                      <p className="font-mono text-[9px] text-neutral-400 truncate">
                                        {w.url}
                                      </p>
                                      <label className="w-fit px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[9px] font-mono font-bold cursor-pointer transition-colors inline-flex items-center gap-1">
                                        <UploadCloud size={10} />
                                        <span>Replace</span>
                                        <input
                                          type="file"
                                          accept={w.type === "video" ? "video/*" : "image/*,video/*"}
                                          className="hidden"
                                          onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) handleFileUpload(f, "workUrl", idx);
                                          }}
                                        />
                                      </label>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setActiveWorkDrop(dropKey);
                                    }}
                                    onDragLeave={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (activeWorkDrop === dropKey) setActiveWorkDrop(null);
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setActiveWorkDrop(null);
                                      const f = e.dataTransfer.files?.[0];
                                      if (f) handleFileUpload(f, "workUrl", idx);
                                    }}
                                    className={`relative border-2 border-dashed rounded-xl p-3 text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all ${
                                      isDraggingHere
                                        ? "border-[#ff3b30] bg-[#ff3b30]/15 scale-[1.01]"
                                        : "border-white/15 hover:border-white/30 bg-black/30 hover:bg-black/50"
                                    }`}
                                  >
                                    <input
                                      type="file"
                                      accept={w.type === "video" ? "video/*" : "image/*,video/*"}
                                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                      onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleFileUpload(f, "workUrl", idx);
                                      }}
                                    />
                                    {isUploading ? (
                                      <div className="flex items-center gap-1.5 py-1">
                                        <Loader2 className="w-4 h-4 text-[#ff3b30] animate-spin" />
                                        <span className="text-[10px] font-mono text-neutral-300">
                                          {uploadProgress || "Uploading..."}
                                        </span>
                                      </div>
                                    ) : (
                                      <>
                                        <UploadCloud size={16} className={isDraggingHere ? "text-[#ff3b30]" : "text-neutral-400"} />
                                        <p className="text-[10px] text-neutral-300">
                                          Drag & drop image/video here, or <span className="text-[#ff3b30] underline font-semibold">browse</span>
                                        </p>
                                      </>
                                    )}
                                  </div>
                                )}

                                {/* Fallback URL input */}
                                <input
                                  type="text"
                                  value={w.url || ""}
                                  onChange={(e) => {
                                    const updatedWorks = [...editingItem.data.works];
                                    updatedWorks[idx] = {
                                      ...updatedWorks[idx],
                                      url: e.target.value,
                                      thumbnail: updatedWorks[idx].thumbnail || e.target.value,
                                    };
                                    setEditingItem({
                                      ...editingItem,
                                      data: { ...editingItem.data, works: updatedWorks },
                                    });
                                  }}
                                  placeholder="Or paste CloudFront / CDN image/video URL"
                                  className="bg-black/30 border border-white/5 rounded-lg px-2 py-1 text-[10px] font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-[#ff3b30]"
                                />
                              </div>
                            )}

                            {/* Metrics & Description */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-mono text-neutral-400 uppercase">Metrics / Stats</label>
                                <input
                                  type="text"
                                  value={w.metrics || ""}
                                  onChange={(e) => {
                                    const updatedWorks = [...editingItem.data.works];
                                    updatedWorks[idx] = { ...updatedWorks[idx], metrics: e.target.value };
                                    setEditingItem({
                                      ...editingItem,
                                      data: { ...editingItem.data, works: updatedWorks },
                                    });
                                  }}
                                  placeholder="e.g. +280% Lead Volume • 4K"
                                  className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff3b30]"
                                />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-mono text-neutral-400 uppercase">Short Description</label>
                                <input
                                  type="text"
                                  value={w.description || ""}
                                  onChange={(e) => {
                                    const updatedWorks = [...editingItem.data.works];
                                    updatedWorks[idx] = { ...updatedWorks[idx], description: e.target.value };
                                    setEditingItem({
                                      ...editingItem,
                                      data: { ...editingItem.data, works: updatedWorks },
                                    });
                                  }}
                                  placeholder="e.g. Multi-channel lead generation campaign..."
                                  className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff3b30]"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {(!editingItem.data.works || editingItem.data.works.length === 0) && (
                        <div className="py-4 text-center text-[11px] font-mono text-neutral-500 bg-black/20 rounded-xl border border-white/5">
                          No showcase works added yet. Click "+ Add Work" above.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Team Member Specific Fields */}
              {editingItem.type === "team" && (
                <div className="flex flex-col gap-3.5 text-left">
                  {/* Name and Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.name || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, name: e.target.value },
                          })
                        }
                        placeholder="e.g. SARAH CONNER"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Role / Designation
                      </label>
                      <input
                        type="text"
                        value={editingItem.data.role || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, role: e.target.value },
                          })
                        }
                        placeholder="e.g. CREATIVE DIRECTOR"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  {/* Column and Order */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Column Alignment (1 to 5) <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={editingItem.data.column || 1}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, column: Number(e.target.value) },
                          })
                        }
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-white cursor-pointer"
                      >
                        <option value="1">Column 1 (Left - Lower Offset)</option>
                        <option value="2">Column 2 (Left-Center - Elevated)</option>
                        <option value="3">Column 3 (Center - Focal Portrait)</option>
                        <option value="4">Column 4 (Right-Center - Elevated)</option>
                        <option value="5">Column 5 (Right - Lower Offset)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Display Order (1, 2, 3...)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={editingItem.data.order ?? 1}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, order: Number(e.target.value) },
                          })
                        }
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  {/* Portrait Image Drag & Drop Upload */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Portrait Photo (Drag & Drop / CDN)
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
                      <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/40 p-2.5 flex items-center gap-3">
                        <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10 relative">
                          <CachedImage
                            src={editingItem.data.image}
                            alt="Portrait Preview"
                            className="w-full h-full object-cover grayscale contrast-125 brightness-95"
                          />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <span className="font-mono text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle size={12} /> Photo Attached
                          </span>
                          <p className="font-mono text-[10px] text-neutral-400 truncate max-w-full">
                            {editingItem.data.image}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <label className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[10px] font-mono font-bold cursor-pointer transition-colors active:scale-95 inline-flex items-center gap-1">
                              <UploadCloud size={11} />
                              <span>Replace Photo</span>
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
                        className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                          dragActive
                            ? "border-white bg-white/10 scale-[1.01]"
                            : "border-white/20 hover:border-white/40 bg-[#181a24]/60 hover:bg-[#181a24]"
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
                          <div className="flex flex-col items-center gap-1.5 py-2">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                            <span className="text-xs font-mono text-neutral-300">{uploadProgress || "Uploading portrait..."}</span>
                          </div>
                        ) : (
                          <>
                            <UploadCloud size={20} className="text-neutral-400" />
                            <p className="text-xs text-neutral-300">
                              Drag portrait photo here or <span className="text-white underline">browse</span>
                            </p>
                            <p className="text-[10px] font-mono text-neutral-500">
                              Aspect ratio ~ 3:4 portrait recommended
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    <input
                      type="text"
                      value={editingItem.data.image || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, image: e.target.value },
                        })
                      }
                      placeholder="Or paste direct image URL (https://...)"
                      className="w-full bg-[#181a24]/50 border border-white/5 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-white"
                    />
                  </div>

                  {/* Bio & Active Status */}
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                      Biography / Short Note (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={editingItem.data.bio || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, bio: e.target.value },
                        })
                      }
                      placeholder="Brief background or creative philosophy..."
                      className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-white resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="team-active-toggle"
                      checked={editingItem.data.isActive !== false}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, isActive: e.target.checked },
                        })
                      }
                      className="w-4 h-4 rounded bg-[#181a24] border-white/20 text-white focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="team-active-toggle" className="text-xs font-mono text-neutral-300 cursor-pointer">
                      Show on public website (Active)
                    </label>
                  </div>
                </div>
              )}

              {/* Founder Profile Specific Fields */}
              {editingItem.type === "founder" && (
                <div className="flex flex-col gap-4 text-left">
                  <div className="p-3.5 rounded-2xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#ff3b30]/20 text-[#ff3b30] flex items-center justify-center shrink-0">
                      <Crown size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Founder Profile Live Configuration
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Changes here are immediately reflected across the website in the Founder Dossier modal &amp; mobile showcases.
                      </p>
                    </div>
                  </div>

                  {/* Name and Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Founder Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.name || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, name: e.target.value },
                          })
                        }
                        placeholder="SHUBHAM SINGH"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-[#ff3b30]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Role &amp; Vision Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.role || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, role: e.target.value },
                          })
                        }
                        placeholder="CREATIVE DIRECTOR & VISIONARY"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff3b30]"
                      />
                    </div>
                  </div>

                  {/* Badge & Subtitle & Location Tag */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Pill Badge Text
                      </label>
                      <input
                        type="text"
                        value={editingItem.data.badge || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, badge: e.target.value },
                          })
                        }
                        placeholder="MEET THE FOUNDER"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff3b30]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Header Subtitle
                      </label>
                      <input
                        type="text"
                        value={editingItem.data.subtitle || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, subtitle: e.target.value },
                          })
                        }
                        placeholder="LEADERSHIP & VISION"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff3b30]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Location / City Tag
                      </label>
                      <input
                        type="text"
                        value={editingItem.data.cityTag || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, cityTag: e.target.value },
                          })
                        }
                        placeholder="VARANASI × GLOBAL"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff3b30]"
                      />
                    </div>
                  </div>

                  {/* Founder Portrait Photo Upload / URL */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Founder Portrait Photo
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
                          <Trash2 size={11} /> Reset to Default Photo
                        </button>
                      )}
                    </div>

                    {editingItem.data.image ? (
                      <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/40 p-2.5 flex items-center gap-3">
                        <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10 relative">
                          <img
                            src={editingItem.data.image}
                            alt="Founder Preview"
                            className="w-full h-full object-cover"
                            style={{ objectPosition: '48% 36%' }}
                          />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <span className="font-mono text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle size={12} /> Custom Photo Active
                          </span>
                          <p className="font-mono text-[10px] text-neutral-400 truncate max-w-full">
                            {editingItem.data.image}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <label className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[10px] font-mono font-bold cursor-pointer transition-colors inline-flex items-center gap-1">
                              <UploadCloud size={11} />
                              <span>Replace Photo</span>
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
                        className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all ${
                          dragActive ? "border-[#ff3b30] bg-[#ff3b30]/10" : "border-white/15 hover:border-white/30 bg-black/20"
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
                          <div className="flex items-center gap-2 py-2">
                            <Loader2 className="w-5 h-5 text-[#ff3b30] animate-spin" />
                            <span className="text-xs font-mono text-neutral-300">{uploadProgress || "Uploading portrait..."}</span>
                          </div>
                        ) : (
                          <>
                            <UploadCloud size={20} className="text-[#ff3b30]" />
                            <p className="text-xs text-neutral-300">
                              Drag portrait photo here or <span className="text-[#ff3b30] underline">browse</span>
                            </p>
                            <p className="text-[10px] font-mono text-neutral-500">
                              Leave empty to use high-res default studio portrait (Picture12.webp)
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    <input
                      type="text"
                      value={editingItem.data.image || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, image: e.target.value },
                        })
                      }
                      placeholder="Or paste direct image URL (https://...)"
                      className="w-full bg-[#181a24]/50 border border-white/5 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-[#ff3b30]"
                    />
                  </div>

                  {/* Primary & Secondary Bio */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Primary Bio Paragraph
                      </label>
                      <textarea
                        rows={4}
                        value={editingItem.data.bio || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, bio: e.target.value },
                          })
                        }
                        placeholder="Born in India and raised in the city of artists, Varanasi..."
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff3b30] resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Secondary Bio Paragraph
                      </label>
                      <textarea
                        rows={4}
                        value={editingItem.data.bioSecondary || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, bioSecondary: e.target.value },
                          })
                        }
                        placeholder="As an accomplished digital content creator and 3D visionary..."
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff3b30] resize-none"
                      />
                    </div>
                  </div>

                  {/* Credo / Quote */}
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                      Credo / Highlight Quote
                    </label>
                    <textarea
                      rows={2}
                      value={editingItem.data.quote || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, quote: e.target.value },
                        })
                      }
                      placeholder="His unique style, artistic training, and profound appreciation for light..."
                      className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white italic focus:outline-none focus:border-[#ff3b30] resize-none"
                    />
                  </div>

                  {/* Specialties Tags (comma separated) */}
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                      Specialties &amp; Disciplines (comma-separated tags)
                    </label>
                    <input
                      type="text"
                      value={
                        Array.isArray(editingItem.data.specialties)
                          ? editingItem.data.specialties.join(", ")
                          : editingItem.data.specialties || ""
                      }
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          data: {
                            ...editingItem.data,
                            specialties: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                          },
                        })
                      }
                      placeholder="3D CGI & ArchViz, Commercial Stills, Cinematic Direction, Creative Strategy"
                      className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff3b30]"
                    />
                  </div>

                  {/* Social URLs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        value={editingItem.data.linkedinUrl || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, linkedinUrl: e.target.value },
                          })
                        }
                        placeholder="https://linkedin.com"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff3b30]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Instagram Profile URL
                      </label>
                      <input
                        type="url"
                        value={editingItem.data.instagramUrl || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, instagramUrl: e.target.value },
                          })
                        }
                        placeholder="https://instagram.com"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff3b30]"
                      />
                    </div>
                  </div>
                </div>
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



              {/* =========================================================================
                  BLOGS & EDITORIAL ARTICLE SPECIFIC FIELDS
                 ========================================================================= */}
              {editingItem.type === "blogs" && (
                <div className="flex flex-col gap-3.5">
                  {/* Article Title */}
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                      Article Headline / Title <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.data.title || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, title: e.target.value },
                        })
                      }
                      placeholder="e.g. Empower Your Brand's Digital Journey with Bharat DigiGuru"
                      className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 font-semibold"
                    />
                  </div>

                  {/* Category, Number, Read Time & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">
                        Editorial Category
                      </label>
                      <input
                        type="text"
                        value={editingItem.data.category || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, category: e.target.value },
                          })
                        }
                        placeholder="e.g. Digital Acceleration"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">
                        Index Number
                      </label>
                      <input
                        type="text"
                        value={editingItem.data.number || "(01)"}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, number: e.target.value },
                          })
                        }
                        placeholder="(01)"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">
                        Read Time
                      </label>
                      <input
                        type="text"
                        value={editingItem.data.readTime || "5 MIN READ"}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, readTime: e.target.value },
                          })
                        }
                        placeholder="6 MIN READ"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">
                        Publication Date
                      </label>
                      <input
                        type="text"
                        value={editingItem.data.date || "AUG 2026"}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, date: e.target.value },
                          })
                        }
                        placeholder="AUG 2026"
                        className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center p-3 rounded-xl bg-[#141620] border border-white/10 font-mono text-xs mt-auto">
                      <label className="flex items-center gap-2 cursor-pointer text-white">
                        <input
                          type="checkbox"
                          checked={editingItem.data.isPublished !== false}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, isPublished: e.target.checked },
                            })
                          }
                          className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                        />
                        <span>Published & Visible to Public</span>
                      </label>
                    </div>
                  </div>

                  {/* Summary / Description */}
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">
                      Short Summary / Card Description <span className="text-cyan-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={editingItem.data.description || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, description: e.target.value },
                        })
                      }
                      placeholder="Brief excerpt shown on article previews and cards..."
                      className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
                    />
                  </div>

                  {/* Cover Image Upload / URL */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                        Article Banner Image (Drag & Drop or URL)
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
                      <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-black/40 p-2.5 flex items-center gap-3">
                        <div className="w-24 h-16 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10 relative">
                          <CachedImage
                            src={editingItem.data.image}
                            alt="Cover Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <span className="font-mono text-[11px] text-cyan-400 font-semibold flex items-center gap-1">
                            <CheckCircle size={12} /> Image Attached
                          </span>
                          <p className="font-mono text-[10px] text-neutral-400 truncate max-w-full">
                            {editingItem.data.image}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <label className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold cursor-pointer transition-colors active:scale-95 inline-flex items-center gap-1">
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
                        className="relative border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/60 rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-2 bg-[#181a24]/50"
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
                          <div className="flex flex-col items-center gap-1.5 py-2">
                            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                            <span className="text-xs font-mono text-cyan-300">{uploadProgress || "Uploading image..."}</span>
                          </div>
                        ) : (
                          <>
                            <UploadCloud size={18} className="text-cyan-400" />
                            <p className="text-xs text-neutral-300">
                              Drag cover image here or <span className="text-cyan-400 underline">browse</span>
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    <input
                      type="text"
                      value={editingItem.data.image || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, image: e.target.value },
                        })
                      }
                      placeholder="Or paste direct CloudFront / Unsplash / CDN image URL (https://...)"
                      className="w-full bg-[#181a24]/50 border border-white/5 rounded-lg px-2.5 py-1 text-[11px] font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Dynamic Content Paragraphs */}
                  <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-[#141620] border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-cyan-400">
                        <FileText size={15} />
                        <h4 className="font-['Syne',sans-serif] font-bold text-xs sm:text-sm text-white">
                          Article Content Paragraphs ({(editingItem.data.content || []).length})
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const currentContent = Array.isArray(editingItem.data.content) ? editingItem.data.content : [];
                          setEditingItem({
                            ...editingItem,
                            data: {
                              ...editingItem.data,
                              content: [...currentContent, ""],
                            },
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                      >
                        <Plus size={11} />
                        <span>Add Paragraph</span>
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      {(editingItem.data.content || [""]).map((para: string, idx: number) => (
                        <div key={idx} className="flex flex-col gap-1 bg-[#181a24] border border-white/5 rounded-xl p-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-cyan-400 font-semibold">
                              Paragraph #{idx + 1}
                            </span>
                            {(editingItem.data.content || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...(editingItem.data.content || [])];
                                  updated.splice(idx, 1);
                                  setEditingItem({
                                    ...editingItem,
                                    data: { ...editingItem.data, content: updated },
                                  });
                                }}
                                className="text-[10px] font-mono text-red-400 hover:text-red-300 flex items-center gap-0.5 cursor-pointer"
                              >
                                <Trash2 size={10} /> Delete
                              </button>
                            )}
                          </div>
                          <textarea
                            rows={3}
                            value={para}
                            onChange={(e) => {
                              const updated = [...(editingItem.data.content || [])];
                              updated[idx] = e.target.value;
                              setEditingItem({
                                ...editingItem,
                                data: { ...editingItem.data, content: updated },
                              });
                            }}
                            placeholder={`Enter content for paragraph #${idx + 1}...`}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500 leading-relaxed"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Highlights / Bullets */}
                  <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-[#141620] border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-cyan-400">
                        <Sparkles size={15} />
                        <h4 className="font-['Syne',sans-serif] font-bold text-xs sm:text-sm text-white">
                          Key Bullets & Strategic Highlights ({(editingItem.data.bullets || []).length})
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const currentBullets = Array.isArray(editingItem.data.bullets) ? editingItem.data.bullets : [];
                          setEditingItem({
                            ...editingItem,
                            data: {
                              ...editingItem.data,
                              bullets: [...currentBullets, ""],
                            },
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                      >
                        <Plus size={11} />
                        <span>Add Bullet</span>
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      {(editingItem.data.bullets || []).map((bullet: string, bIdx: number) => (
                        <div key={bIdx} className="flex items-center gap-2">
                          <span className="font-mono text-xs text-cyan-400 font-bold shrink-0">
                            •
                          </span>
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => {
                              const updated = [...(editingItem.data.bullets || [])];
                              updated[bIdx] = e.target.value;
                              setEditingItem({
                                ...editingItem,
                                data: { ...editingItem.data, bullets: updated },
                              });
                            }}
                            placeholder="e.g. Elevate the brand's social media presence with expert SMM Strategies"
                            className="flex-1 bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...(editingItem.data.bullets || [])];
                              updated.splice(bIdx, 1);
                              setEditingItem({
                                ...editingItem,
                                data: { ...editingItem.data, bullets: updated },
                              });
                            }}
                            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
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
                  className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer active:scale-95 ${
                    editingItem.type === "blogs"
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)]"
                      : editingItem.type === "threed"
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : editingItem.type === "team"
                      ? "bg-white hover:bg-neutral-200 !text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                      : "bg-[#ff3b30] hover:bg-[#b91c1c] text-white"
                  }`}
                >
                  {editingItem.type === "blogs"
                    ? editingItem.isNew
                      ? "PUBLISH ARTICLE"
                      : "UPDATE ARTICLE"
                    : editingItem.type === "threed"
                    ? "PUBLISH 3D VIDEO"
                    : editingItem.type === "services"
                    ? editingItem.isNew
                      ? "PUBLISH SERVICE"
                      : "UPDATE SERVICE"
                    : editingItem.type === "team"
                    ? editingItem.isNew
                      ? "PUBLISH MEMBER"
                      : "UPDATE MEMBER"
                    : "SAVE RECORD"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          REGISTER NEW ADMINISTRATOR MODAL
         ========================================================================= */}
      {isCreateAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#11131b] border border-white/15 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="font-['Syne',sans-serif] font-bold text-base sm:text-lg text-white">
                    Register New Administrator
                  </h3>
                  <p className="font-mono text-[10px] text-neutral-400">
                    Assign role permissions & email secure credentials
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateAdminModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateAdminSubmit} className="flex flex-col gap-3.5">
              {/* Full Name */}
              <div>
                <label className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1 block">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newAdminForm.name}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1 block">
                  Registered Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newAdminForm.email}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                  placeholder="admin@example.com"
                  className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1 block">
                  Assign Administrative Role <span className="text-red-400">*</span>
                </label>
                <select
                  value={newAdminForm.role}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, role: e.target.value as any })}
                  className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  <option value="admin">Admin — Portfolio & Inquiries Manager</option>
                  <option value="superAdmin">Super Admin — Core Admin + Administrator Management</option>
                  {currentUser.role === "managedAdmin" && (
                    <option value="managedAdmin">Managed Admin — Full Master Authority & 3D Showcase Access</option>
                  )}
                </select>
                <p className="font-mono text-[10px] text-neutral-500 mt-1">
                  {newAdminForm.role === "admin" && "• Can view/edit Portfolio and Inquiries. Cannot see 3D Studio or manage admins."}
                  {newAdminForm.role === "superAdmin" && "• Can manage Portfolio, Inquiries, and register/manage Admins. Cannot see 3D Studio."}
                  {newAdminForm.role === "managedAdmin" && "• Full master privileges including 3D Studio Showcase and RBAC management."}
                </p>
              </div>

              {/* Password & Generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                    Initial Password
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <KeyRound size={11} /> Auto Generate Strong
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={newAdminForm.password}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                    placeholder="Leave blank to auto-generate, or enter custom"
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-emerald-300 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Email dispatch notice */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-[11px] font-mono text-emerald-200">
                <Mail size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Email Delivery:</strong> Credentials, role level, and portal sign-in link will be automatically dispatched to <strong>{newAdminForm.email || "the registered email"}</strong> formatted professionally.
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateAdminModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isRegisteringAdmin}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  {isRegisteringAdmin ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>CREATING & SENDING...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>CREATE & DISPATCH EMAIL</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          CREDENTIALS GENERATED & DISPATCHED SUCCESS MODAL
         ========================================================================= */}
      {createdCredentialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#11131b] border border-emerald-500/40 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <UserCheck size={24} />
              </div>
              <div>
                <h3 className="font-['Syne',sans-serif] font-bold text-lg text-white">
                  Admin Registered!
                </h3>
                <p className="font-mono text-xs text-emerald-400">
                  Credentials successfully dispatched via Email
                </p>
              </div>
            </div>

            {/* Credentials details card */}
            <div className="bg-[#181a24] border border-white/10 rounded-2xl p-4 flex flex-col gap-3 font-mono text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 uppercase">Administrator Name</span>
                <span className="text-white font-semibold">{createdCredentialModal.name}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 uppercase">Registered Email</span>
                <span className="text-white font-semibold">{createdCredentialModal.email}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 uppercase">Assigned Role</span>
                <span className="text-emerald-400 font-bold capitalize">{createdCredentialModal.role}</span>
              </div>

              <div className="flex flex-col pt-1 border-t border-white/10">
                <span className="text-[10px] text-neutral-400 uppercase">Temporary Password</span>
                <div className="flex items-center justify-between bg-black/40 border border-emerald-500/30 rounded-xl px-3 py-2 mt-1">
                  <span className="text-emerald-300 font-bold tracking-wider">{createdCredentialModal.password}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentialModal.password);
                      setHasCopiedPassword(true);
                      setTimeout(() => setHasCopiedPassword(false), 2000);
                    }}
                    className="text-neutral-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                    title="Copy Password"
                  >
                    {hasCopiedPassword ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const payload = `Bharat DigiGuru Admin Credentials:\nPortal: ${window.location.origin}/admin-portal\nEmail: ${createdCredentialModal.email}\nPassword: ${createdCredentialModal.password}\nRole: ${createdCredentialModal.role}`;
                  navigator.clipboard.writeText(payload);
                  setHasCopiedPassword(true);
                  setTimeout(() => setHasCopiedPassword(false), 2000);
                }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy size={13} />
                <span>{hasCopiedPassword ? "COPIED ALL!" : "COPY ALL"}</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatedCredentialModal(null)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-lg transition-all cursor-pointer active:scale-95"
              >
                DONE
              </button>
            </div>
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
