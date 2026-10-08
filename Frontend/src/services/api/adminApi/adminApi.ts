import { api } from "../api";

class AdminApi {
  // Auth
  login(data: any) {
    return api._post("/admin/login", data);
  }

  forgotPassword(email: string) {
    return api._post("/admin/forgot-password", { email });
  }

  verifyOtp(data: { email: string; otp: string }) {
    return api._post("/admin/verify-otp", data);
  }

  verifyOtpAndResetPassword(data: { email: string; otp: string; newPassword: string }) {
    return api._post("/admin/verify-otp-reset-password", data);
  }

  getMe() {
    return api._get("/admin/me");
  }

  // Portfolio
  getPortfolio(params?: any) {
    return api._get("/admin/portfolio", { params } as any);
  }

  createPortfolio(data: any) {
    return api._post("/admin/portfolio", data);
  }

  updatePortfolio(id: string, data: any) {
    return api._put(`/admin/portfolio/${id}`, data);
  }

  deletePortfolio(id: string) {
    return api._delete(`/admin/portfolio/${id}`);
  }

  // 3D Studio
  getThreeD(params?: any) {
    return api._get("/admin/threed", { params } as any);
  }

  createThreeD(data: any) {
    return api._post("/admin/threed", data);
  }

  updateThreeD(id: string, data: any) {
    return api._put(`/admin/threed/${id}`, data);
  }

  deleteThreeD(id: string) {
    return api._delete(`/admin/threed/${id}`);
  }

  // Services
  getServices(params?: any) {
    return api._get("/admin/services", { params } as any);
  }

  createService(data: any) {
    return api._post("/admin/services", data);
  }

  updateService(id: string, data: any) {
    return api._put(`/admin/services/${id}`, data);
  }

  deleteService(id: string) {
    return api._delete(`/admin/services/${id}`);
  }

  // Team Members
  getTeam(params?: any) {
    return api._get("/admin/team", { params } as any);
  }

  createTeamMember(data: any) {
    return api._post("/admin/team", data);
  }

  updateTeamMember(id: string, data: any) {
    return api._put(`/admin/team/${id}`, data);
  }

  deleteTeamMember(id: string) {
    return api._delete(`/admin/team/${id}`);
  }

  // Stories
  getStories(params?: any) {
    return api._get("/admin/stories", { params } as any);
  }

  createStory(data: any) {
    return api._post("/admin/stories", data);
  }

  updateStory(id: string, data: any) {
    return api._put(`/admin/stories/${id}`, data);
  }

  deleteStory(id: string) {
    return api._delete(`/admin/stories/${id}`);
  }

  // Blogs
  getBlogs(params?: any) {
    return api._get("/admin/blogs", { params } as any);
  }

  createBlog(data: any) {
    return api._post("/admin/blogs", data);
  }

  updateBlog(id: string, data: any) {
    return api._put(`/admin/blogs/${id}`, data);
  }

  deleteBlog(id: string) {
    return api._delete(`/admin/blogs/${id}`);
  }

  // Inquiries
  getInquiries(params?: any) {
    return api._get("/admin/inquiries", { params } as any);
  }


  updateInquiryStatus(id: string, data: any) {
    return api._patch(`/admin/inquiries/${id}/status`, data);
  }

  deleteInquiry(id: string) {
    return api._delete(`/admin/inquiries/${id}`);
  }

  // Media Upload
  uploadMedia(formData: FormData) {
    return api._postFormData("/admin/upload", formData);
  }

  // Admin User Management
  getAdminUsers() {
    return api._get("/admin/users");
  }

  createAdminUser(data: { name: string; email: string; role?: string; password?: string }) {
    return api._post("/admin/users", data);
  }

  deleteAdminUser(id: string) {
    return api._delete(`/admin/users/${id}`);
  }
}


export const adminApi = new AdminApi();
