import { api } from "../api";

class UserApi {
  getPortfolio() {
    return api._get("/portfolio");
  }

  getThreeD() {
    return api._get("/threed");
  }

  submitInquiry(data: any) {
    return api._post("/inquiries/submit", data);
  }
}

export const userApi = new UserApi();
