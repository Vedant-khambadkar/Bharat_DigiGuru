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
        return cached;
      }
      if (this._portfolioPromise) return this._portfolioPromise;
    }

    this._portfolioPromise = (async () => {
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
    })();

    return this._portfolioPromise;
  }

  async getThreeD(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = getApiCache<any>("threed_projects");
      if (cached && (Array.isArray(cached) ? cached.length > 0 : true)) {
        return cached;
      }
      if (this._threeDPromise) return this._threeDPromise;
    }

    this._threeDPromise = (async () => {
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
    })();

    return this._threeDPromise;
  }

  async getServices(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = getApiCache<any>("services_items");
      if (cached && (Array.isArray(cached) ? cached.length > 0 : true)) {
        return cached;
      }
      if (this._servicesPromise) return this._servicesPromise;
    }

    this._servicesPromise = (async () => {
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
    })();

    return this._servicesPromise;
  }

  async getTeamMembers(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = getApiCache<any>("team_members");
      if (cached && (Array.isArray(cached) ? cached.length > 0 : true)) {
        return cached;
      }
      if (this._teamPromise) return this._teamPromise;
    }

    this._teamPromise = (async () => {
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
    })();

    return this._teamPromise;
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
