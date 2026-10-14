import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle } from "lucide-react";
import { adminService } from "../services/service/adminService";
import { socket, onSocketEvent } from "../utils/socket";
import { getApiCache, invalidateApiCache, setApiCache } from "../utils/apiCache";

// Layout Components
import { AdminHeader } from "../components/Admin/layout/AdminHeader";
import { AdminSidebar, type TabType } from "../components/Admin/layout/AdminSidebar";

// Section Components
import { OverviewSection } from "../components/Admin/sections/OverviewSection";
import { PortfolioSection } from "../components/Admin/sections/PortfolioSection";
import { ServicesSection } from "../components/Admin/sections/ServicesSection";
import { BrandCollaborationsManager } from "../components/Admin/BrandCollaborations/BrandCollaborationsManager";
import { TeamSection } from "../components/Admin/sections/TeamSection";
import { BlogsSection } from "../components/Admin/sections/BlogsSection";
import { ThreeDSection } from "../components/Admin/sections/ThreeDSection";
import { InquiriesSection } from "../components/Admin/sections/InquiriesSection";
import { AdminsSection } from "../components/Admin/sections/AdminsSection";

// Modal Components
import { InquiryDetailModal } from "../components/Admin/modals/InquiryDetailModal";
import { ItemEditorModal } from "../components/Admin/modals/ItemEditorModal";
import { CreateAdminModal } from "../components/Admin/modals/CreateAdminModal";
import { AdminCredentialsModal } from "../components/Admin/modals/AdminCredentialsModal";
import { ConfirmDeleteModal } from "../components/Admin/ConfirmDeleteModal";

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
    getApiCache<any>("admin_inquiries_limit=6&page=1") ||
    getApiCache<any>("admin_inquiries_default")
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

  // Team / Founder Public Website Visibility Setting
  const [teamSectionVisible, setTeamSectionVisible] = useState<boolean>(() => {
    const cached = getApiCache<any>("admin_site_settings");
    return cached?.teamSectionVisible !== false;
  });
  const [teamVisibilityLoading, setTeamVisibilityLoading] = useState<boolean>(false);

  const fetchSettings = useCallback(async (force = false) => {
    try {
      const res = await adminService.getSettings(force);
      if (res && typeof res.teamSectionVisible === "boolean") {
        setTeamSectionVisible(res.teamSectionVisible);
      }
    } catch (err) {
      console.error("Failed to load site settings:", err);
    }
  }, []);

  const handleToggleTeamVisibility = async (newVal: boolean) => {
    if (teamVisibilityLoading) return;
    try {
      setTeamVisibilityLoading(true);
      const res = await adminService.updateTeamVisibility(newVal);
      if (res?.success || res?.settings) {
        setTeamSectionVisible(newVal);
        showNotification(
          `Team & Founder section is now ${newVal ? "VISIBLE" : "HIDDEN"} on the live website!`,
          "success"
        );
      } else {
        showNotification(res?.message || "Failed to update team visibility.", "error");
      }
    } catch (err: any) {
      showNotification(err?.message || "Network error updating team visibility.", "error");
    } finally {
      setTeamVisibilityLoading(false);
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
    name: string;
    email: string;
    role: string;
    password: string;
  } | null>(null);

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
      page: number = inquiriesPage,
      limitOrForce: number | boolean = inquiriesLimit,
      search: string = inquiriesSearch,
      status: string = inquiriesStatusFilter,
      forceRefresh: boolean = true
    ) => {
      let pageNum = typeof page === "number" ? page : 1;
      let limitNum = inquiriesLimit;
      let searchStr = inquiriesSearch;
      let statusStr = inquiriesStatusFilter;
      let force = true;

      if (typeof limitOrForce === "boolean") {
        force = limitOrForce;
      } else if (typeof limitOrForce === "number") {
        limitNum = limitOrForce;
        searchStr = typeof search === "string" ? search : inquiriesSearch;
        statusStr = typeof status === "string" ? status : inquiriesStatusFilter;
        force = forceRefresh;
      }

      setInquiriesLoading(true);
      try {
        const res = await adminService.getInquiries(
          {
            page: pageNum,
            limit: limitNum,
            search: searchStr.trim() || undefined,
            status: statusStr !== "ALL" ? statusStr : undefined,
          },
          force
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
    [inquiriesPage, inquiriesLimit, inquiriesSearch, inquiriesStatusFilter]
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
    fetchSettings(true);
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
    fetchInquiries(1, true);
    if (currentUser.role === "managedAdmin" || currentUser.role === "superAdmin") {
      fetchAdminUsers();
    }
    fetchSettings(true);
  }, [currentUser.role, fetchSettings]);

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

    const unsubFounderUpdated = onSocketEvent("founder:updated", (updated) => {
      setFounderProfile(updated);
      showNotification("Founder profile synchronized in real-time!", "success");
    });

    const unsubSettingsUpdated = onSocketEvent("settings:updated", (settings: any) => {
      if (settings && typeof settings.teamSectionVisible === "boolean") {
        setTeamSectionVisible(settings.teamSectionVisible);
        setApiCache("admin_site_settings", settings);
      }
    });

    const unsubTeamVisibility = onSocketEvent("team:visibility:updated", (payload: any) => {
      if (payload && typeof payload.teamSectionVisible === "boolean") {
        setTeamSectionVisible(payload.teamSectionVisible);
      }
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
      invalidateApiCache(["inquiries", "admin_inquiries", "admin_stats"]);
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
      invalidateApiCache(["inquiries", "admin_inquiries", "admin_stats"]);
      setInquiriesList((prev) => prev.map((inq) => (inq.id === updatedInquiry.id ? updatedInquiry : inq)));
    });

    const unsubInquiryDeleted = onSocketEvent("inquiry:deleted", (id) => {
      invalidateApiCache(["inquiries", "admin_inquiries", "admin_stats"]);
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
      unsubSettingsUpdated();
      unsubTeamVisibility();
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

  // ==========================================
  // FILE UPLOAD HANDLERS
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

  const handleMultipleBlogMediaUpload = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading ${i + 1} of ${files.length} (${files[i].name})...`);
        const res: any = await adminService.uploadMedia(files[i]);
        const url = res?.url || res?.data?.url || (res as any)?.fileUrl;
        if (url) uploadedUrls.push(url);
      }
      if (uploadedUrls.length > 0) {
        setEditingItem((prev: any) => {
          if (!prev) return prev;
          const currentImages = Array.isArray(prev.data.images)
            ? [...prev.data.images]
            : prev.data.image
            ? [prev.data.image]
            : [];
          const merged = Array.from(new Set([...currentImages, ...uploadedUrls]));
          const primary = prev.data.image || merged[0] || "";
          return {
            ...prev,
            data: {
              ...prev.data,
              image: primary,
              images: merged,
            },
          };
        });
        showNotification(`${uploadedUrls.length} image(s) uploaded successfully!`);
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
          images: Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []),
          content: typeof data.content === "string"
            ? data.content
            : Array.isArray(data.content)
            ? data.content
            : "",
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

      {/* Header Bar */}
      <AdminHeader
        currentUser={currentUser}
        isSocketOnline={isSocketOnline}
        onReload={reloadAll}
        onLogout={handleLogout}
      />

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 pb-20 md:pb-0">
        {/* Navigation Sidebar & Mobile Bottom Dock */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          stats={stats}
          adminUsersCount={adminUsersList.length}
        />

        {/* Dynamic Content Views */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* 1. OVERVIEW */}
          {activeTab === "overview" && (
            <OverviewSection
              stats={stats}
              currentUser={currentUser}
              adminUsersList={adminUsersList}
              inquiriesList={inquiriesList}
              teamTotal={teamTotal}
              blogsTotal={blogsTotal}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onViewInquiry={(inq) => setViewingInquiry(inq)}
              onUpdateInquiryStatus={handleUpdateInquiryStatus}
            />
          )}

          {/* 2. PORTFOLIO */}
          {activeTab === "portfolio" && (
            <PortfolioSection
              portfolioItems={portfolioItems}
              portfolioLoading={portfolioLoading}
              portfolioTotal={portfolioTotal}
              portfolioPage={portfolioPage}
              portfolioTotalPages={portfolioTotalPages}
              portfolioLimit={portfolioLimit}
              portfolioSearch={portfolioSearch}
              portfolioCategory={portfolioCategory}
              setPortfolioLimit={setPortfolioLimit}
              setPortfolioSearch={setPortfolioSearch}
              setPortfolioCategory={setPortfolioCategory}
              onFetchPortfolio={fetchPortfolio}
              onOpenCreate={() =>
                setEditingItem({
                  type: "portfolio",
                  isNew: true,
                  data: {
                    title: "",
                    client: "",
                    category: "",
                    subtitle: "",
                    year: "2026",
                    image: "",
                    description: "",
                    tags: [],
                  },
                })
              }
              onOpenEdit={(item: any) =>
                setEditingItem({
                  type: "portfolio",
                  isNew: false,
                  data: item,
                })
              }
              onDeleteItem={(id: string | number) => handleDeleteItem("portfolio", id)}
            />
          )}

          {/* 3. SERVICES */}
          {activeTab === "services" && (
            <ServicesSection
              servicesItems={servicesItems}
              servicesLoading={servicesLoading}
              servicesTotal={servicesTotal}
              servicesPage={servicesPage}
              servicesTotalPages={servicesTotalPages}
              servicesLimit={servicesLimit}
              servicesSearch={servicesSearch}
              setServicesLimit={setServicesLimit}
              setServicesSearch={setServicesSearch}
              onFetchServices={fetchServices}
              onOpenCreate={() =>
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
              onOpenEdit={(item: any) =>
                setEditingItem({
                  type: "services",
                  isNew: false,
                  data: item,
                })
              }
              onDeleteItem={(id: string | number, title?: string) => handleDeleteItem("services", id, title)}
            />
          )}

          {/* 4. BRAND COLLABORATIONS */}
          {activeTab === "brands" && (
            <div className="animate-in fade-in duration-200">
              <BrandCollaborationsManager />
            </div>
          )}

          {/* 5. TEAM & FOUNDER */}
          {activeTab === "team" && (
            <TeamSection
              teamItems={teamItems}
              teamLoading={teamLoading}
              teamTotal={teamTotal}
              teamPage={teamPage}
              teamTotalPages={teamTotalPages}
              teamLimit={teamLimit}
              teamSearch={teamSearch}
              teamColumnFilter={teamColumnFilter}
              setTeamLimit={setTeamLimit}
              setTeamSearch={setTeamSearch}
              setTeamColumnFilter={setTeamColumnFilter}
              onFetchTeam={fetchTeam}
              founderProfile={founderProfile}
              founderLoading={founderLoading}
              onFetchFounder={fetchFounder}
              teamSubTab={teamSubTab}
              setTeamSubTab={setTeamSubTab}
              teamSectionVisible={teamSectionVisible}
              teamVisibilityLoading={teamVisibilityLoading}
              onToggleTeamVisibility={handleToggleTeamVisibility}
              onOpenCreateMember={() =>
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
              onOpenEditMember={(item: any) =>
                setEditingItem({
                  type: "team",
                  isNew: false,
                  data: item,
                })
              }
              onDeleteMember={(id: string | number, name?: string) => handleDeleteItem("team", id, name)}
              onEditFounder={() =>
                setEditingItem({
                  type: "founder",
                  isNew: false,
                  data: founderProfile || {},
                })
              }
            />
          )}

          {/* 6. BLOGS */}
          {activeTab === "blogs" && (
            <BlogsSection
              blogsItems={blogsItems}
              blogsLoading={blogsLoading}
              blogsTotal={blogsTotal}
              blogsPage={blogsPage}
              blogsTotalPages={blogsTotalPages}
              blogsLimit={blogsLimit}
              blogsSearch={blogsSearch}
              blogsCategory={blogsCategory}
              setBlogsLimit={setBlogsLimit}
              setBlogsSearch={setBlogsSearch}
              setBlogsCategory={setBlogsCategory}
              onFetchBlogs={fetchBlogs}
              onOpenCreate={() =>
                setEditingItem({
                  type: "blogs",
                  isNew: true,
                  data: {
                    number: `(0${blogsTotal + 1})`,
                    title: "",
                    category: "Digital Acceleration",
                    description: "",
                    readTime: "5 MIN READ",
                    date: "AUG 2026",
                    image: "",
                    images: [],
                    content: "",
                    bullets: [],
                    isPublished: true,
                  },
                })
              }
              onOpenEdit={(item: any) =>
                setEditingItem({
                  type: "blogs",
                  isNew: false,
                  data: item,
                })
              }
              onDeleteItem={(id: string | number, title?: string) => handleDeleteItem("blogs", id, title)}
            />
          )}

          {/* 7. 3D SHOWCASE */}
          {activeTab === "threed" && currentUser.role === "managedAdmin" && (
            <ThreeDSection
              threeDItems={threeDItems}
              threeDLoading={threeDLoading}
              threeDTotal={threeDTotal}
              threeDPage={threeDPage}
              threeDTotalPages={threeDTotalPages}
              threeDLimit={threeDLimit}
              threeDSearch={threeDSearch}
              threeDCategory={threeDCategory}
              setThreeDLimit={setThreeDLimit}
              setThreeDSearch={setThreeDSearch}
              setThreeDCategory={setThreeDCategory}
              onFetchThreeD={fetchThreeD}
              onOpenCreate={() =>
                setEditingItem({
                  type: "threed",
                  isNew: true,
                  data: {
                    title: "",
                    category: "All",
                    duration: "4K UHD",
                    videoUrl: "",
                  },
                })
              }
              onOpenEdit={(item: any) =>
                setEditingItem({
                  type: "threed",
                  isNew: false,
                  data: item,
                })
              }
              onDeleteItem={(id: string | number) => handleDeleteItem("threed", id)}
            />
          )}

          {/* 8. INQUIRIES */}
          {activeTab === "inquiries" && (
            <InquiriesSection
              inquiriesList={inquiriesList}
              inquiriesLoading={inquiriesLoading}
              inquiriesTotal={inquiriesTotal}
              inquiriesPage={inquiriesPage}
              inquiriesTotalPages={inquiriesTotalPages}
              inquiriesLimit={inquiriesLimit}
              inquiriesSearch={inquiriesSearch}
              inquiriesStatusFilter={inquiriesStatusFilter}
              setInquiriesLimit={setInquiriesLimit}
              setInquiriesSearch={setInquiriesSearch}
              setInquiriesStatusFilter={setInquiriesStatusFilter}
              onFetchInquiries={fetchInquiries}
              onViewInquiry={(inquiry) => setViewingInquiry(inquiry)}
              onUpdateInquiryStatus={handleUpdateInquiryStatus}
              onDeleteInquiry={(id: string) => handleDeleteItem("inquiries", id)}
            />
          )}

          {/* 9. ADMINISTRATORS (RBAC) */}
          {activeTab === "admins" && (
            <AdminsSection
              adminUsersList={adminUsersList}
              adminUsersLoading={adminUsersLoading}
              currentUser={currentUser}
              onRefresh={() => fetchAdminUsers(true)}
              onOpenCreateAdmin={() => setIsCreateAdminModalOpen(true)}
              onDeleteAdminUser={(id: string, name: string) => handleDeleteItem("adminUser", id, name)}
            />
          )}
        </main>
      </div>

      {/* Inquiry Detail Modal */}
      <InquiryDetailModal
        inquiry={viewingInquiry}
        onClose={() => setViewingInquiry(null)}
        onUpdateStatus={handleUpdateInquiryStatus}
      />

      {/* Item Editor Modal */}
      <ItemEditorModal
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveItem}
        handleFileUpload={handleFileUpload}
        handleMultipleBlogMediaUpload={handleMultipleBlogMediaUpload}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        showNotification={showNotification}
      />

      {/* Register New Administrator Modal */}
      <CreateAdminModal
        isOpen={isCreateAdminModalOpen}
        onClose={() => setIsCreateAdminModalOpen(false)}
        currentUser={currentUser}
        newAdminForm={newAdminForm}
        setNewAdminForm={setNewAdminForm}
        isRegisteringAdmin={isRegisteringAdmin}
        onSubmit={handleCreateAdminSubmit}
        onGenerateRandomPassword={handleGenerateRandomPassword}
      />

      {/* Admin Credentials Generated Modal */}
      <AdminCredentialsModal
        credentials={createdCredentialModal}
        onClose={() => setCreatedCredentialModal(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        itemTitle={deleteModal.title}
        isLoading={deleteModal.isDeleting}
        onCancel={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
export default AdminDashboardPage;
