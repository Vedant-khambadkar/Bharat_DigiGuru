import { api } from "../api";

class UserApi {
  getPortfolio() {
    return api._get("/portfolio");
  }

  getThreeD() {
    return api._get("/threed");
  }

  getServices() {
    return api._get("/services");
  }

  getTeam() {
    return api._get("/team");
  }

  getStories() {
    return api._get("/stories");
  }

  getBlogs() {
    return api._get("/blogs");
  }

  submitInquiry(data: any) {
    return api._post("/inquiries/submit", data);
  }

}

export const userApi = new UserApi();
