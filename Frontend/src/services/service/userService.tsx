import { userApi } from "../api/userApi/userApi";

class UserService {
  getPortfolio() {
    return userApi.getPortfolio();
  }

  getThreeD() {
    return userApi.getThreeD();
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
