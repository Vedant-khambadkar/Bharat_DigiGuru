import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { db } from "../data/db.js";
import { AuthenticatedRequest, normalizeRole } from "../middleware/auth.js";
import { sendPasswordResetOtpEmail, sendAdminCredentialsEmail } from "../services/emailService.js";
import { emitEvent } from "../services/socketService.js";

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    // Query admin strictly from database
    const admin = (await db.getAdminUserByEmail(normalizedEmail)) || (await db.getAdminUser());

    if (!admin) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    // Validate email
    const isEmailValid = admin.email.toLowerCase() === normalizedEmail;
    if (!isEmailValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    // Validate password strictly via bcrypt against database passwordHash
    const isPasswordValid = bcrypt.compareSync(password, admin.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    const effectiveRole = normalizeRole(admin.role);
    const jwtSecret = process.env.JWT_SECRET || "bharat_digiguru_super_secure_jwt_token_key_2026";
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: effectiveRole,
        name: admin.name,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token,
      accessToken: token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: effectiveRole,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Login authentication error.",
    });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: "Email is required." });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    // Fetch administrator strictly from database
    const admin = await db.getAdminUserByEmail(normalizedEmail);

    if (!admin) {
      res.status(404).json({ success: false, message: "Admin account with this email not found in database." });
      return;
    }

    const targetEmail = admin.email;

    // Generate a secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.setAdminResetOtp(targetEmail, otp, expiresAt);

    // Dispatch email (or log to console if no SMTP configured)
    await sendPasswordResetOtpEmail({
      toEmail: targetEmail,
      otp,
      recipientName: admin.name || "Administrator",
    });

    res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${targetEmail}.`,
      email: targetEmail,
      devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to process forgot password request.",
    });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({
        success: false,
        message: "Email and OTP code are required.",
      });
      return;
    }

    const admin = await db.getAdminUserWithOtp(email);
    if (!admin) {
      res.status(404).json({ success: false, message: "Admin account not found." });
      return;
    }

    // Verify OTP
    if (!admin.resetPasswordOtp || String(admin.resetPasswordOtp).trim() !== String(otp).trim()) {
      res.status(400).json({ success: false, message: "Invalid verification code (OTP)." });
      return;
    }

    // Check expiration
    if (admin.resetPasswordExpires) {
      const expiresDate = new Date(admin.resetPasswordExpires);
      if (expiresDate.getTime() < Date.now()) {
        res.status(400).json({
          success: false,
          message: "Verification code (OTP) has expired. Please request a new one.",
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      message: "OTP code verified successfully. Please enter your new password.",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to verify OTP code.",
    });
  }
};

export const verifyOtpAndResetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are all required.",
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
      return;
    }

    const admin = await db.getAdminUserWithOtp(email);
    if (!admin) {
      res.status(404).json({ success: false, message: "Admin account not found." });
      return;
    }

    // Verify OTP
    if (!admin.resetPasswordOtp || String(admin.resetPasswordOtp).trim() !== String(otp).trim()) {
      res.status(400).json({ success: false, message: "Invalid verification code (OTP)." });
      return;
    }

    // Check expiration
    if (admin.resetPasswordExpires) {
      const expiresDate = new Date(admin.resetPasswordExpires);
      if (expiresDate.getTime() < Date.now()) {
        res.status(400).json({
          success: false,
          message: "Verification code (OTP) has expired. Please request a new one.",
        });
        return;
      }
    }

    // Hash new password and save
    const salt = bcrypt.genSaltSync(10);
    const newPasswordHash = bcrypt.hashSync(newPassword, salt);

    await db.resetAdminPassword(email, newPasswordHash);

    res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now log in with your new password.",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to reset password.",
    });
  }
};

export const getAdminProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userEmail = req.user?.email;
    const admin = userEmail ? await db.getAdminUserByEmail(userEmail) : await db.getAdminUser();

    if (!admin) {
      res.status(404).json({ success: false, message: "Admin profile not found." });
      return;
    }

    const effectiveRole = normalizeRole(admin.role || req.user?.role);
    res.status(200).json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: effectiveRole,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// ADMIN USER MANAGEMENT (SUPER ADMIN / MANAGED ADMIN)
// ==========================================

export const listAdminUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await db.getAdminUsers();
    const formatted = users.map((u: any) => ({
      ...u,
      role: normalizeRole(u.role),
    }));
    res.status(200).json({
      success: true,
      data: formatted,
      total: formatted.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const registerAdminUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const requesterRole = normalizeRole(req.user?.role);
    const requesterName = req.user?.name || req.user?.email || "Administrator";
    const { name, email, role = "admin", password } = req.body;

    if (!email || !name) {
      res.status(400).json({
        success: false,
        message: "Full name and email address are required.",
      });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const targetRole = normalizeRole(role);

    // Permission check:
    // - superAdmin can only create "admin"
    // - managedAdmin can create "superAdmin" or "admin"
    if (requesterRole === "superAdmin" && targetRole !== "admin") {
      res.status(403).json({
        success: false,
        message: "Super Admin is only permitted to create regular Admin accounts.",
      });
      return;
    }

    if (requesterRole !== "managedAdmin" && requesterRole !== "superAdmin") {
      res.status(403).json({
        success: false,
        message: "You do not have permission to create administrative accounts.",
      });
      return;
    }

    // Check if email already exists
    const existing = await db.getAdminUserByEmail(normalizedEmail);
    if (existing) {
      res.status(409).json({
        success: false,
        message: `An admin account with email "${normalizedEmail}" already exists.`,
      });
      return;
    }

    // Generate or use provided password
    let plainPassword = String(password || "").trim();
    if (!plainPassword) {
      // Auto-generate high-entropy readable password
      const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
      plainPassword = `BDG#${randomSuffix}!`;
    } else if (plainPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(plainPassword, salt);

    const createdAdmin = await db.createAdminUser({
      id: `admin-${Date.now()}`,
      email: normalizedEmail,
      name: String(name).trim(),
      role: targetRole,
      passwordHash,
      createdBy: req.user?.email,
    });

    // Send credentials to the registered email in proper format
    const emailResult = await sendAdminCredentialsEmail({
      toEmail: normalizedEmail,
      recipientName: name,
      password: plainPassword,
      role: targetRole,
      creatorName: requesterName,
    });

    const safeAdmin = {
      id: (createdAdmin as any).id,
      email: (createdAdmin as any).email,
      name: (createdAdmin as any).name,
      role: targetRole,
      createdAt: (createdAdmin as any).createdAt,
    };

    emitEvent("admin:created", safeAdmin);

    res.status(201).json({
      success: true,
      message: emailResult.sent
        ? `Admin account created! Credentials sent to ${normalizedEmail}.`
        : `Admin account created! Note: Email delivery notice: ${emailResult.message}`,
      user: safeAdmin,
      temporaryPassword: plainPassword,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to register admin account.",
    });
  }
};

export const deleteAdminUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const requesterRole = normalizeRole(req.user?.role);
    const requesterEmail = req.user?.email?.toLowerCase();
    const requesterId = req.user?.id;
    const targetId = String(req.params.id || "");

    if (!targetId) {
      res.status(400).json({ success: false, message: "Admin ID is required." });
      return;
    }

    const targetUser = await db.getAdminUserById(targetId);
    if (!targetUser) {
      res.status(404).json({ success: false, message: "Admin account not found." });
      return;
    }

    // Cannot delete oneself
    if (targetUser.id === requesterId || targetUser.email.toLowerCase() === requesterEmail) {
      res.status(400).json({
        success: false,
        message: "You cannot delete your own active administrator account.",
      });
      return;
    }

    const targetRole = normalizeRole(targetUser.role);

    // Permission check:
    // - superAdmin can only delete regular "admin"
    // - managedAdmin can delete "superAdmin" or "admin"
    if (requesterRole === "superAdmin" && targetRole !== "admin") {
      res.status(403).json({
        success: false,
        message: "Super Admin can only remove regular Admin accounts.",
      });
      return;
    }

    if (requesterRole !== "managedAdmin" && requesterRole !== "superAdmin") {
      res.status(403).json({
        success: false,
        message: "You do not have permission to delete admin accounts.",
      });
      return;
    }

    const deleted = await db.deleteAdminUser(targetId);
    if (!deleted) {
      res.status(500).json({ success: false, message: "Failed to delete admin account." });
      return;
    }

    emitEvent("admin:deleted", targetId);

    res.status(200).json({
      success: true,
      message: `Admin account (${targetUser.email}) removed successfully.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to delete admin." });
  }
};

