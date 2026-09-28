import { adminApi } from "../api/adminApi/adminApi";
import { invalidateApiCache } from "../../utils/apiCache";
import { invalidateMediaCache } from "../../utils/mediaCache";

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

  async createPortfolio(data: any) {
    const res = await adminApi.createPortfolio(data);
    invalidateApiCache("portfolio");
    return res;
  }

  async updatePortfolio(id: string, data: any) {
    const res = await adminApi.updatePortfolio(id, data);
    invalidateApiCache("portfolio");
    if (data.image || data.imageUrl || data.textureUrl) {
      invalidateMediaCache(data.image || data.imageUrl || data.textureUrl);
    }
    return res;
  }

  async deletePortfolio(id: string) {
    const res = await adminApi.deletePortfolio(id);
    invalidateApiCache("portfolio");
    return res;
  }

  // 3D Studio
  getThreeD(params?: { page?: number; limit?: number; search?: string; category?: string }) {
    return adminApi.getThreeD(params);
  }

  async createThreeD(data: any) {
    const res = await adminApi.createThreeD(data);
    invalidateApiCache("threed");
    return res;
  }

  async updateThreeD(id: string, data: any) {
    const res = await adminApi.updateThreeD(id, data);
    invalidateApiCache("threed");
    if (data.posterUrl || data.videoUrl) {
      invalidateMediaCache(data.posterUrl);
    }
    return res;
  }

  async deleteThreeD(id: string) {
    const res = await adminApi.deleteThreeD(id);
    invalidateApiCache("threed");
    return res;
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
