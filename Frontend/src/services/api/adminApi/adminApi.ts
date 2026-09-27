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
}

export const adminApi = new AdminApi();
