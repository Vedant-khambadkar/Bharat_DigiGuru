import { userApi } from "../api/userApi/userApi";
import { getApiCache, setApiCache } from "../../utils/apiCache";

class UserService {
  private _portfolioPromise: Promise<any> | null = null;
  private _threeDPromise: Promise<any> | null = null;
  private _servicesPromise: Promise<any> | null = null;
  private _teamPromise: Promise<any> | null = null;

  async getPortfolio(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = getApiCache<any>("portfolio_items");
      if (cached && (Array.isArray(cached) ? cached.length > 0 : true)) {
        // Trigger background revalidation if no request is currently pending
        if (!this._portfolioPromise) {
          this._portfolioPromise = this._fetchPortfolioDirect();
        }
        return cached;
      }
    }

    if (this._portfolioPromise) return this._portfolioPromise;
    this._portfolioPromise = this._fetchPortfolioDirect();
    return this._portfolioPromise;
  }

  private async _fetchPortfolioDirect() {
    try {
      const data = await userApi.getPortfolio();
      if (data) {
        const items = Array.isArray(data) ? data : data.items || data;
        if (Array.isArray(items) && items.length > 0) {
          setApiCache("portfolio_items", items);
        }
      }
      return data;
    } finally {
      this._portfolioPromise = null;
    }
  }

  async getThreeD(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = getApiCache<any>("threed_projects");
      if (cached && (Array.isArray(cached) ? cached.length > 0 : true)) {
        if (!this._threeDPromise) {
          this._threeDPromise = this._fetchThreeDDirect();
        }
        return cached;
      }
    }

    if (this._threeDPromise) return this._threeDPromise;
    this._threeDPromise = this._fetchThreeDDirect();
    return this._threeDPromise;
  }

  private async _fetchThreeDDirect() {
    try {
      const data = await userApi.getThreeD();
      if (data) {
        const items = Array.isArray(data) ? data : data.items || data;
        if (Array.isArray(items) && items.length > 0) {
          setApiCache("threed_projects", items);
        }
      }
      return data;
    } finally {
      this._threeDPromise = null;
    }
  }

  async getServices(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = getApiCache<any>("services_items");
      if (cached && (Array.isArray(cached) ? cached.length > 0 : true)) {
        if (!this._servicesPromise) {
          this._servicesPromise = this._fetchServicesDirect();
        }
        return cached;
      }
    }

    if (this._servicesPromise) return this._servicesPromise;
    this._servicesPromise = this._fetchServicesDirect();
    return this._servicesPromise;
  }

  private async _fetchServicesDirect() {
    try {
      const data = await userApi.getServices();
      if (data) {
        const items = Array.isArray(data) ? data : data.items || data;
        if (Array.isArray(items) && items.length > 0) {
          setApiCache("services_items", items);
        }
      }
      return data;
    } finally {
      this._servicesPromise = null;
    }
  }

  async getTeamMembers(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = getApiCache<any>("team_members");
      if (cached && (Array.isArray(cached) ? cached.length > 0 : true)) {
        if (!this._teamPromise) {
          this._teamPromise = this._fetchTeamDirect();
        }
        return cached;
      }
    }

    if (this._teamPromise) return this._teamPromise;
    this._teamPromise = this._fetchTeamDirect();
    return this._teamPromise;
  }

  private async _fetchTeamDirect() {
    try {
      const data = await userApi.getTeam();
      if (data) {
        const items = Array.isArray(data) ? data : data.items || data;
        if (Array.isArray(items) && items.length > 0) {
          setApiCache("team_members", items);
        }
      }
      return data;
    } finally {
      this._teamPromise = null;
    }
  }

  private _founderPromise: Promise<any> | null = null;

  async getFounder(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = getApiCache<any>("founder_profile");
      if (cached) {
        if (!this._founderPromise) {
          this._founderPromise = this._fetchFounderDirect();
        }
        return cached;
      }
    }

    if (this._founderPromise) return this._founderPromise;
    this._founderPromise = this._fetchFounderDirect();
    return this._founderPromise;
  }

  private async _fetchFounderDirect() {
    try {
      const data = await userApi.getFounder();
      if (data) {
        setApiCache("founder_profile", data);
      }
      return data;
    } finally {
      this._founderPromise = null;
    }
  }

  private _storiesPromise: Promise<any> | null = null;

  async getStories(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = getApiCache<any>("stories_items");
      if (cached && (Array.isArray(cached) ? cached.length > 0 : true)) {
        if (!this._storiesPromise) {
          this._storiesPromise = this._fetchStoriesDirect();
        }
        return cached;
      }
    }

    if (this._storiesPromise) return this._storiesPromise;
    this._storiesPromise = this._fetchStoriesDirect();
    return this._storiesPromise;
  }

  private async _fetchStoriesDirect() {
    try {
      const data = await userApi.getStories();
      if (data) {
        const items = Array.isArray(data) ? data : data.items || data;
        if (Array.isArray(items) && items.length > 0) {
          setApiCache("stories_items", items);
        }
      }
      return data;
    } finally {
      this._storiesPromise = null;
    }
  }

  private _blogsPromise: Promise<any> | null = null;

  async getBlogs(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = getApiCache<any>("blogs_items");
      if (cached && (Array.isArray(cached) ? cached.length > 0 : true)) {
        if (!this._blogsPromise) {
          this._blogsPromise = this._fetchBlogsDirect();
        }
        return cached;
      }
    }

    if (this._blogsPromise) return this._blogsPromise;
    this._blogsPromise = this._fetchBlogsDirect();
    return this._blogsPromise;
  }

  private async _fetchBlogsDirect() {
    try {
      const data = await userApi.getBlogs();
      if (data) {
        const items = Array.isArray(data) ? data : data.items || data;
        if (Array.isArray(items) && items.length > 0) {
          setApiCache("blogs_items", items);
        }
      }
      return data;
    } finally {
      this._blogsPromise = null;
    }
  }

  submitInquiry(data: {
    name?: string;
    fullName?: string;
    email: string;
    phone?: string;
    company?: string;
    services?: string[] | string;
    budget?: string;
    timeline?: string;
    message: string;
    [key: string]: any;
  }) {
    return userApi.submitInquiry(data);
  }
}

export const userService = new UserService();

