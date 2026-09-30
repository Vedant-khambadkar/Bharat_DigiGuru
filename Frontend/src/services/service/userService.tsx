import { userApi } from "../api/userApi/userApi";
import { getApiCache } from "../../utils/apiCache";

class UserService {
  private _portfolioPromise: Promise<any> | null = null;
  private _threeDPromise: Promise<any> | null = null;

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
        return data;
      } finally {
        this._threeDPromise = null;
      }
    })();

    return this._threeDPromise;
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
