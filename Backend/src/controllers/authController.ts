import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../data/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { sendPasswordResetOtpEmail } from "../services/emailService.js";

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
    const admin = await db.getAdminUserByEmail(normalizedEmail) || (await db.getAdminUser());

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

    const jwtSecret = process.env.JWT_SECRET || "bharat_digiguru_super_secure_jwt_token_key_2026";
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
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
        role: admin.role,
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
    const admin = await db.getAdminUser();
    res.status(200).json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
