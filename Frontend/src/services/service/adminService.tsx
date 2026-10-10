import { adminApi } from "../api/adminApi/adminApi";
import { getApiCache, setApiCache, invalidateApiCache } from "../../utils/apiCache";
import { invalidateMediaCache } from "../../utils/mediaCache";

class AdminService {
  private _inflightRequests = new Map<string, Promise<any>>();

  private getCacheKey(type: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) return `admin_${type}_default`;
    const sorted = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k] ?? ""}`)
      .join("&");
    return `admin_${type}_${sorted}`;
  }

  // Auth
  login(data: any) {
    return adminApi.login(data);
  }

  forgotPassword(email: string) {
    return adminApi.forgotPassword(email);
  }

  verifyOtp(data: { email: string; otp: string }) {
    return adminApi.verifyOtp(data);
  }

  verifyOtpAndResetPassword(data: { email: string; otp: string; newPassword: string }) {
    return adminApi.verifyOtpAndResetPassword(data);
  }

  getMe() {
    return adminApi.getMe();
  }

  // Portfolio
  async getPortfolio(
    params?: { page?: number; limit?: number; search?: string; category?: string },
    forceRefresh = false
  ) {
    const key = this.getCacheKey("portfolio", params);

    if (!forceRefresh) {
      const cached = getApiCache<any>(key);
      if (cached) {
        return cached;
      }
      if (this._inflightRequests.has(key)) {
        return this._inflightRequests.get(key);
      }
    }

    const promise = (async () => {
      try {
        const res = await adminApi.getPortfolio(params);
        if (res) {
          setApiCache(key, res);
        }
        return res;
      } finally {
        this._inflightRequests.delete(key);
      }
    })();

    this._inflightRequests.set(key, promise);
    return promise;
  }

  async createPortfolio(data: any) {
    const res = await adminApi.createPortfolio(data);
    invalidateApiCache(["portfolio", "admin_portfolio", "admin_stats"]);
    return res;
  }

  async updatePortfolio(id: string, data: any) {
    const res = await adminApi.updatePortfolio(id, data);
    invalidateApiCache(["portfolio", "admin_portfolio", "admin_stats"]);
    if (data.image || data.imageUrl || data.textureUrl) {
      invalidateMediaCache(data.image || data.imageUrl || data.textureUrl);
    }
    return res;
  }

  async deletePortfolio(id: string) {
    const res = await adminApi.deletePortfolio(id);
    invalidateApiCache(["portfolio", "admin_portfolio", "admin_stats"]);
    return res;
  }

  // 3D Studio
  async getThreeD(
    params?: { page?: number; limit?: number; search?: string; category?: string },
    forceRefresh = false
  ) {
    const key = this.getCacheKey("threed", params);

    if (!forceRefresh) {
      const cached = getApiCache<any>(key);
      if (cached) {
        return cached;
      }
      if (this._inflightRequests.has(key)) {
        return this._inflightRequests.get(key);
      }
    }

    const promise = (async () => {
      try {
        const res = await adminApi.getThreeD(params);
        if (res) {
          setApiCache(key, res);
        }
        return res;
      } finally {
        this._inflightRequests.delete(key);
      }
    })();

    this._inflightRequests.set(key, promise);
    return promise;
  }

  async createThreeD(data: any) {
    const res = await adminApi.createThreeD(data);
    invalidateApiCache(["threed", "admin_threed", "admin_stats"]);
    return res;
  }

  async updateThreeD(id: string, data: any) {
    const res = await adminApi.updateThreeD(id, data);
    invalidateApiCache(["threed", "admin_threed", "admin_stats"]);
    if (data.posterUrl || data.videoUrl) {
      invalidateMediaCache(data.posterUrl);
    }
    return res;
  }

  async deleteThreeD(id: string) {
    const res = await adminApi.deleteThreeD(id);
    invalidateApiCache(["threed", "admin_threed", "admin_stats"]);
    return res;
  }

  // Services
  async getServices(
    params?: { page?: number; limit?: number; search?: string },
    forceRefresh = false
  ) {
    const key = this.getCacheKey("services", params);

    if (!forceRefresh) {
      const cached = getApiCache<any>(key);
      if (cached) {
        return cached;
      }
      if (this._inflightRequests.has(key)) {
        return this._inflightRequests.get(key);
      }
    }

    const promise = (async () => {
      try {
        const res = await adminApi.getServices(params);
        if (res) {
          setApiCache(key, res);
        }
        return res;
      } finally {
        this._inflightRequests.delete(key);
      }
    })();

    this._inflightRequests.set(key, promise);
    return promise;
  }

  async createService(data: any) {
    const res = await adminApi.createService(data);
    invalidateApiCache(["services", "admin_services", "services_items", "admin_stats"]);
    return res;
  }

  async updateService(id: string, data: any) {
    const res = await adminApi.updateService(id, data);
    invalidateApiCache(["services", "admin_services", "services_items", "admin_stats"]);
    if (data.image) {
      invalidateMediaCache(data.image);
    }
    return res;
  }

  async deleteService(id: string) {
    const res = await adminApi.deleteService(id);
    invalidateApiCache(["services", "admin_services", "services_items", "admin_stats"]);
    return res;
  }

  // Team Members
  async getTeamMembers(
    params?: { page?: number; limit?: number; search?: string; column?: number | string; isActive?: boolean },
    forceRefresh = false
  ) {
    const key = this.getCacheKey("team", params);

    if (!forceRefresh) {
      const cached = getApiCache<any>(key);
      if (cached) {
        return cached;
      }
      if (this._inflightRequests.has(key)) {
        return this._inflightRequests.get(key);
      }
    }

    const promise = (async () => {
      try {
        const res = await adminApi.getTeam(params);
        if (res) {
          setApiCache(key, res);
        }
        return res;
      } finally {
        this._inflightRequests.delete(key);
      }
    })();

    this._inflightRequests.set(key, promise);
    return promise;
  }

  async createTeamMember(data: any) {
    const res = await adminApi.createTeamMember(data);
    invalidateApiCache(["team", "admin_team", "team_members", "admin_stats"]);
    return res;
  }

  async updateTeamMember(id: string, data: any) {
    const res = await adminApi.updateTeamMember(id, data);
    invalidateApiCache(["team", "admin_team", "team_members", "admin_stats"]);
    if (data.image) {
      invalidateMediaCache(data.image);
    }
    return res;
  }

  async deleteTeamMember(id: string) {
    const res = await adminApi.deleteTeamMember(id);
    invalidateApiCache(["team", "admin_team", "team_members", "admin_stats"]);
    return res;
  }

  // Founder Profile
  async getFounder(forceRefresh = false) {
    const key = "admin_founder_profile";
    if (!forceRefresh) {
      const cached = getApiCache<any>(key);
      if (cached) return cached;
    }
    const res = await adminApi.getFounder();
    if (res) {
      setApiCache(key, res);
      setApiCache("founder_profile", res);
    }
    return res;
  }

  async updateFounder(data: any) {
    const res = await adminApi.updateFounder(data);
    invalidateApiCache(["founder_profile", "admin_founder_profile"]);
    if (data.image) {
      invalidateMediaCache(data.image);
    }
    return res;
  }

  // Stories
  async getStories(
    params?: { page?: number; limit?: number; search?: string; category?: string; isActive?: boolean },
    forceRefresh = false
  ) {
    const key = this.getCacheKey("stories", params);

    if (!forceRefresh) {
      const cached = getApiCache<any>(key);
      if (cached) {
        return cached;
      }
      if (this._inflightRequests.has(key)) {
        return this._inflightRequests.get(key);
      }
    }

    const promise = (async () => {
      try {
        const res = await adminApi.getStories(params);
        if (res) {
          setApiCache(key, res);
        }
        return res;
      } finally {
        this._inflightRequests.delete(key);
      }
    })();

    this._inflightRequests.set(key, promise);
    return promise;
  }

  async createStory(data: any) {
    const res = await adminApi.createStory(data);
    invalidateApiCache(["stories", "admin_stories", "stories_items", "admin_stats"]);
    return res;
  }

  async updateStory(id: string, data: any) {
    const res = await adminApi.updateStory(id, data);
    invalidateApiCache(["stories", "admin_stories", "stories_items", "admin_stats"]);
    if (data.coverImage) {
      invalidateMediaCache(data.coverImage);
    }
    return res;
  }

  async deleteStory(id: string) {
    const res = await adminApi.deleteStory(id);
    invalidateApiCache(["stories", "admin_stories", "stories_items", "admin_stats"]);
    return res;
  }

  // Blogs
  async getBlogs(
    params?: { page?: number; limit?: number; search?: string; category?: string },
    forceRefresh = false
  ) {
    const key = this.getCacheKey("blogs", params);

    if (!forceRefresh) {
      const cached = getApiCache<any>(key);
      if (cached) {
        return cached;
      }
      if (this._inflightRequests.has(key)) {
        return this._inflightRequests.get(key);
      }
    }

    const promise = (async () => {
      try {
        const res = await adminApi.getBlogs(params);
        if (res) {
          setApiCache(key, res);
        }
        return res;
      } finally {
        this._inflightRequests.delete(key);
      }
    })();

    this._inflightRequests.set(key, promise);
    return promise;
  }

  async createBlog(data: any) {
    const res = await adminApi.createBlog(data);
    invalidateApiCache(["blogs", "admin_blogs", "blogs_items", "admin_stats"]);
    return res;
  }

  async updateBlog(id: string, data: any) {
    const res = await adminApi.updateBlog(id, data);
    invalidateApiCache(["blogs", "admin_blogs", "blogs_items", "admin_stats"]);
    if (data.image) {
      invalidateMediaCache(data.image);
    }
    return res;
  }

  async deleteBlog(id: string) {
    const res = await adminApi.deleteBlog(id);
    invalidateApiCache(["blogs", "admin_blogs", "blogs_items", "admin_stats"]);
    return res;
  }


  // Inquiries
  async getInquiries(
    params?: { status?: string; page?: number; limit?: number; search?: string },
    forceRefresh = false
  ) {
    const key = this.getCacheKey("inquiries", params);

    if (!forceRefresh) {
      const cached = getApiCache<any>(key);
      if (cached) {
        return cached;
      }
      if (this._inflightRequests.has(key)) {
        return this._inflightRequests.get(key);
      }
    }

    const promise = (async () => {
      try {
        const res = await adminApi.getInquiries(params);
        if (res) {
          setApiCache(key, res);
        }
        return res;
      } finally {
        this._inflightRequests.delete(key);
      }
    })();

    this._inflightRequests.set(key, promise);
    return promise;
  }

  async updateInquiryStatus(id: string, status: "NEW" | "CONTACTED" | "ARCHIVED") {
    const res = await adminApi.updateInquiryStatus(id, { status });
    invalidateApiCache(["inquiries", "admin_inquiries", "admin_stats"]);
    return res;
  }

  async deleteInquiry(id: string) {
    const res = await adminApi.deleteInquiry(id);
    invalidateApiCache(["inquiries", "admin_inquiries", "admin_stats"]);
    return res;
  }

  // Upload
  uploadMedia(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return adminApi.uploadMedia(formData);
  }

  // Admin User Management
  async getAdminUsers(forceRefresh = false) {
    const key = "admin_users_list";
    if (!forceRefresh) {
      const cached = getApiCache<any>(key);
      if (cached) return cached;
    }
    const res = await adminApi.getAdminUsers();
    if (res) {
      setApiCache(key, res);
    }
    return res;
  }

  async createAdminUser(data: { name: string; email: string; role?: string; password?: string }) {
    const res = await adminApi.createAdminUser(data);
    invalidateApiCache(["admin_users_list"]);
    return res;
  }

  async deleteAdminUser(id: string) {
    const res = await adminApi.deleteAdminUser(id);
    invalidateApiCache(["admin_users_list"]);
    return res;
  }
}

export const adminService = new AdminService();
