import { adminApi } from "../api/adminApi/adminApi";

class AdminService {
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
  getPortfolio(params?: { page?: number; limit?: number; search?: string; category?: string }) {
    return adminApi.getPortfolio(params);
  }

  createPortfolio(data: any) {
    return adminApi.createPortfolio(data);
  }

  updatePortfolio(id: string, data: any) {
    return adminApi.updatePortfolio(id, data);
  }

  deletePortfolio(id: string) {
    return adminApi.deletePortfolio(id);
  }

  // 3D Studio
  getThreeD(params?: { page?: number; limit?: number; search?: string; category?: string }) {
    return adminApi.getThreeD(params);
  }

  createThreeD(data: any) {
    return adminApi.createThreeD(data);
  }

  updateThreeD(id: string, data: any) {
    return adminApi.updateThreeD(id, data);
  }

  deleteThreeD(id: string) {
    return adminApi.deleteThreeD(id);
  }

  // Inquiries
  getInquiries(params?: { status?: string; page?: number; limit?: number; search?: string }) {
    return adminApi.getInquiries(params);
  }

  updateInquiryStatus(id: string, status: "NEW" | "CONTACTED" | "ARCHIVED") {
    return adminApi.updateInquiryStatus(id, { status });
  }

  deleteInquiry(id: string) {
    return adminApi.deleteInquiry(id);
  }

  // Upload
  uploadMedia(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return adminApi.uploadMedia(formData);
  }
}

export const adminService = new AdminService();
