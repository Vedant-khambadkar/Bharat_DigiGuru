import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SendOtpOptions {
  toEmail: string;
  otp: string;
  recipientName?: string;
}

/**
 * Creates and returns a Nodemailer transporter based on available environment variables.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  if (user && pass && user.includes("@gmail.com")) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  return null;
}

/**
 * Resolves the company logo attachment if available on the filesystem.
 */
function getLogoAttachment(): { attachments: Array<{ filename: string; path: string; cid: string }>; logoSrc: string } {
  const possiblePaths = [
    path.join(__dirname, "../../assets/logo.png"),
    path.join(__dirname, "../assets/logo.png"),
    path.join(__dirname, "../../../Frontend/public/Logo/BDG Extended.png"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return {
        attachments: [
          {
            filename: "logo.png",
            path: p,
            cid: "bdg-logo",
          },
        ],
        logoSrc: "cid:bdg-logo",
      };
    }
  }

  // Fallback to hosted web logo URL
  return {
    attachments: [],
    logoSrc: "https://test.bharatdigiguru.com/Logo/BDG%20Extended.png",
  };
}

/**
 * Sends a password reset OTP email to the requested administrator.
 */
export async function sendPasswordResetOtpEmail({
  toEmail,
  otp,
  recipientName = "Administrator",
}: SendOtpOptions): Promise<{ sent: boolean; message: string }> {
  console.log("\n=======================================================");
  console.log("🔐 [BHARAT DIGIGURU] PASSWORD RESET OTP GENERATED");
  console.log(`📧 Recipient: ${toEmail}`);
  console.log(`🔑 6-Digit OTP: >>> ${otp} <<<`);
  console.log(`⏳ Valid For: 10 Minutes`);
  console.log("=======================================================\n");

  const transporter = createTransporter();
  const fromAddress =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    process.env.GMAIL_USER ||
    `"Bharat DigiGuru" <no-reply@bharatdigiguru.com>`;

  const { attachments, logoSrc } = getLogoAttachment();

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset your password</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0c0d12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #d1d5db;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c0d12; padding: 48px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background: #141620; border: 1px solid #232636; border-radius: 12px; overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #232636;">
                  <img src="${logoSrc}" alt="Bharat DigiGuru" style="height: 32px; width: auto; display: block;" />
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 32px;">
                  <h1 style="font-size: 19px; font-weight: 600; color: #ffffff; margin: 0 0 12px 0; letter-spacing: -0.2px;">
                    Password reset request
                  </h1>
                  
                  <p style="font-size: 14px; line-height: 1.55; color: #9ca3af; margin: 0 0 24px 0;">
                    Hello ${recipientName},<br>
                    Use the verification code below to complete your password reset. This code expires in 10 minutes.
                  </p>
                  
                  <!-- OTP Code -->
                  <div style="background: #0d0e15; border: 1px solid #2a2e42; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 24px 0;">
                    <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #ffffff; display: block;">
                      ${otp}
                    </span>
                  </div>

                  <p style="font-size: 13px; line-height: 1.5; color: #6b7280; margin: 0;">
                    If you didn't request this change, you can safely ignore this email. No changes will be made to your account.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background: #0f1017; padding: 20px 32px; border-top: 1px solid #1f2230;">
                  <p style="font-size: 12px; color: #6b7280; margin: 0;">
                    Bharat DigiGuru &bull; Studio & Production
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (!transporter) {
    return {
      sent: true,
      message: "OTP logged to server console (SMTP not configured in .env).",
    };
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `${otp} is your verification code - Bharat DigiGuru`,
      text: `Your password reset code is: ${otp}. It expires in 10 minutes.`,
      html: htmlContent,
      attachments,
    });

    console.log(`✅ [EMAIL SENT] Password reset OTP delivered to ${toEmail}`);
    return { sent: true, message: `OTP successfully sent to ${toEmail}` };
  } catch (error: any) {
    console.error("❌ [EMAIL SEND ERROR]:", error.message);
    return {
      sent: false,
      message: `Failed to deliver email: ${error.message}. Use console OTP to proceed.`,
    };
  }
}

/**
 * Sends a clean, professional notification email to admin when a new inquiry is received.
 */
export async function sendInquiryNotificationEmail(inquiry: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  services?: string[] | string;
  budget?: string;
  timeline?: string;
  message: string;
}): Promise<void> {
  const transporter = createTransporter();
  const adminEmail =
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.SMTP_USER ||
    process.env.GMAIL_USER ||
    "contactbharatdigiguru@gmail.com";
  const fromAddress =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    process.env.GMAIL_USER ||
    `"Bharat DigiGuru" <no-reply@bharatdigiguru.com>`;

  const rawServices = Array.isArray(inquiry.services)
    ? inquiry.services
    : typeof inquiry.services === "string" && inquiry.services.trim()
    ? [inquiry.services]
    : [];

  const servicesTextList = rawServices.join(", ") || "General";
  const firstName = inquiry.name ? inquiry.name.trim().split(" ")[0] : "Client";

  const { attachments, logoSrc } = getLogoAttachment();
  const formattedDate = new Date().toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Inquiry</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0b0c10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #e5e7eb;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0c10; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background: #13151f; border: 1px solid #222533; border-radius: 12px; overflow: hidden; text-align: left;">
              
              <!-- Header with Logo and Timestamp -->
              <tr>
                <td style="padding: 24px 32px; border-bottom: 1px solid #222533;">
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="left" valign="middle">
                        <img src="${logoSrc}" alt="Bharat DigiGuru" style="height: 30px; width: auto; display: block;" />
                      </td>
                      <td align="right" valign="middle" style="font-size: 12px; color: #6b7280; font-weight: 400;">
                        ${formattedDate}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Lead Title -->
              <tr>
                <td style="padding: 28px 32px 16px 32px;">
                  <h1 style="font-size: 20px; font-weight: 600; color: #ffffff; margin: 0 0 6px 0; letter-spacing: -0.2px;">
                    New inquiry from ${inquiry.name}
                  </h1>
                  <p style="font-size: 14px; color: #9ca3af; margin: 0;">
                    ${inquiry.company && inquiry.company !== "Not Specified" ? `${inquiry.company} &bull; ` : ""}${inquiry.email}
                  </p>
                </td>
              </tr>

              <!-- Client Message Box -->
              <tr>
                <td style="padding: 12px 32px 24px 32px;">
                  <div style="background: #0d0f17; border: 1px solid #1e2230; border-radius: 8px; padding: 18px 20px;">
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; margin-bottom: 8px;">
                      Message
                    </div>
                    <div style="font-size: 14px; line-height: 1.6; color: #f3f4f6; white-space: pre-wrap;">${inquiry.message}</div>
                  </div>
                </td>
              </tr>

              <!-- Inquiry Overview Details -->
              <tr>
                <td style="padding: 0 32px 28px 32px;">
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #1e2230;">
                    
                    <tr>
                      <td width="30%" style="padding: 12px 0; border-bottom: 1px solid #1e2230; font-size: 13px; color: #6b7280; font-weight: 500;">
                        Name
                      </td>
                      <td width="70%" style="padding: 12px 0; border-bottom: 1px solid #1e2230; font-size: 13px; color: #f3f4f6; font-weight: 500;">
                        ${inquiry.name}
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #1e2230; font-size: 13px; color: #6b7280; font-weight: 500;">
                        Email
                      </td>
                      <td style="padding: 12px 0; border-bottom: 1px solid #1e2230; font-size: 13px;">
                        <a href="mailto:${inquiry.email}" style="color: #60a5fa; text-decoration: none;">
                          ${inquiry.email}
                        </a>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #1e2230; font-size: 13px; color: #6b7280; font-weight: 500;">
                        Phone
                      </td>
                      <td style="padding: 12px 0; border-bottom: 1px solid #1e2230; font-size: 13px; color: #e5e7eb;">
                        ${
                          inquiry.phone && inquiry.phone !== "Not Provided"
                            ? `<a href="tel:${inquiry.phone}" style="color: #60a5fa; text-decoration: none;">${inquiry.phone}</a>`
                            : `<span style="color: #6b7280;">—</span>`
                        }
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #1e2230; font-size: 13px; color: #6b7280; font-weight: 500;">
                        Company
                      </td>
                      <td style="padding: 12px 0; border-bottom: 1px solid #1e2230; font-size: 13px; color: #e5e7eb;">
                        ${inquiry.company && inquiry.company !== "Not Specified" ? inquiry.company : `<span style="color: #6b7280;">—</span>`}
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 12px 0; border-bottom: ${inquiry.budget || inquiry.timeline ? "1px solid #1e2230" : "none"}; font-size: 13px; color: #6b7280; font-weight: 500; vertical-align: middle;">
                        Services
                      </td>
                      <td style="padding: 12px 0; border-bottom: ${inquiry.budget || inquiry.timeline ? "1px solid #1e2230" : "none"}; font-size: 13px; color: #e5e7eb;">
                        ${servicesTextList}
                      </td>
                    </tr>

                    ${
                      inquiry.budget
                        ? `
                    <tr>
                      <td style="padding: 12px 0; border-bottom: ${inquiry.timeline ? "1px solid #1e2230" : "none"}; font-size: 13px; color: #6b7280; font-weight: 500;">
                        Budget
                      </td>
                      <td style="padding: 12px 0; border-bottom: ${inquiry.timeline ? "1px solid #1e2230" : "none"}; font-size: 13px; color: #e5e7eb;">
                        ${inquiry.budget}
                      </td>
                    </tr>`
                        : ""
                    }

                    ${
                      inquiry.timeline
                        ? `
                    <tr>
                      <td style="padding: 12px 0; font-size: 13px; color: #6b7280; font-weight: 500;">
                        Timeline
                      </td>
                      <td style="padding: 12px 0; font-size: 13px; color: #e5e7eb;">
                        ${inquiry.timeline}
                      </td>
                    </tr>`
                        : ""
                    }

                  </table>
                </td>
              </tr>

              <!-- Primary Action Button -->
              <tr>
                <td style="padding: 0 32px 32px 32px;">
                  <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="border-radius: 6px; background: #ffffff;">
                        <a href="mailto:${inquiry.email}?subject=Re:%20Inquiry%20with%20Bharat%20DigiGuru" target="_blank" style="font-size: 13px; font-weight: 600; color: #0b0c10; text-decoration: none; padding: 10px 20px; display: inline-block; border-radius: 6px; letter-spacing: -0.1px;">
                          Reply to ${firstName} &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Clean Studio Footer -->
              <tr>
                <td style="background: #0e0f16; padding: 18px 32px; border-top: 1px solid #1e2230;">
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="left" style="font-size: 12px; color: #6b7280;">
                        Bharat DigiGuru &bull; Next-Gen Digital Studio
                      </td>
                      <td align="right" style="font-size: 12px;">
                        <a href="https://bharatdigiguru.com" style="color: #6b7280; text-decoration: none;">bharatdigiguru.com</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  console.log("\n=======================================================");
  console.log("📬 [NEW INQUIRY RECEIVED]");
  console.log(`👤 Name: ${inquiry.name}`);
  console.log(`📧 Email: ${inquiry.email}`);
  console.log(`📱 Phone: ${inquiry.phone || "N/A"}`);
  console.log(`🏢 Company: ${inquiry.company || "N/A"}`);
  console.log(`🛠️ Services: ${servicesTextList}`);
  console.log(`💬 Message: ${inquiry.message}`);
  console.log("=======================================================\n");

  if (!transporter) {
    return;
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: adminEmail,
      subject: `Inquiry from ${inquiry.name} (${servicesTextList})`,
      html: htmlContent,
      attachments,
    });
    console.log(`✅ [EMAIL NOTIFICATION] Inquiry sent to admin: ${adminEmail}`);
  } catch (err: any) {
    console.error("❌ [EMAIL NOTIFICATION ERROR]:", err.message);
  }
}

interface SendAdminCredentialsOptions {
  toEmail: string;
  recipientName: string;
  password: string;
  role: string;
  creatorName?: string;
}

/**
 * Sends a welcome email containing admin login credentials to a newly created admin.
 */
export async function sendAdminCredentialsEmail({
  toEmail,
  recipientName,
  password,
  role,
  creatorName = "Super Administrator",
}: SendAdminCredentialsOptions): Promise<{ sent: boolean; message: string }> {
  const normalizedRole = role.toLowerCase().includes("managed")
    ? "Managed Administrator"
    : role.toLowerCase().includes("super")
    ? "Super Administrator"
    : "Administrator";

  const roleBadgeColor = role.toLowerCase().includes("managed")
    ? "#9333ea"
    : role.toLowerCase().includes("super")
    ? "#ff3b30"
    : "#2563eb";

  console.log("\n=======================================================");
  console.log("🚀 [BHARAT DIGIGURU] NEW ADMIN CREDENTIALS GENERATED");
  console.log(`👤 Recipient: ${recipientName} (${toEmail})`);
  console.log(`🛡️ Assigned Role: ${normalizedRole}`);
  console.log(`🔑 Temporary Password: >>> ${password} <<<`);
  console.log(`👨‍💼 Created By: ${creatorName}`);
  console.log("=======================================================\n");

  const transporter = createTransporter();
  const fromAddress =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    process.env.GMAIL_USER ||
    `"Bharat DigiGuru" <no-reply@bharatdigiguru.com>`;

  const { attachments, logoSrc } = getLogoAttachment();
  const portalUrl =
    process.env.ADMIN_PORTAL_URL ||
    process.env.FRONTEND_URL ||
    "https://bharatdigiguru.com/admin/login";

  const formattedDate = new Date().toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Portal Credentials</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #08090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #e5e7eb;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #08090e; padding: 48px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background: #11131c; border: 1px solid #232738; border-radius: 16px; overflow: hidden; text-align: left; box-shadow: 0 20px 60px rgba(0,0,0,0.6);">
              
              <!-- Header with Logo -->
              <tr>
                <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #232738; background: #141724;">
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="left" valign="middle">
                        <img src="${logoSrc}" alt="Bharat DigiGuru" style="height: 32px; width: auto; display: block;" />
                      </td>
                      <td align="right" valign="middle">
                        <span style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.8px;">
                          ${formattedDate}
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body Title & Greeting -->
              <tr>
                <td style="padding: 32px 32px 12px 32px;">
                  <div style="display: inline-block; padding: 4px 12px; background: ${roleBadgeColor}20; border: 1px solid ${roleBadgeColor}50; border-radius: 9999px; margin-bottom: 16px;">
                    <span style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; font-weight: 700; color: ${roleBadgeColor}; letter-spacing: 1px; text-transform: uppercase;">
                      ${normalizedRole}
                    </span>
                  </div>

                  <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 10px 0; letter-spacing: -0.3px;">
                    Welcome to Bharat DigiGuru Admin Portal
                  </h1>
                  
                  <p style="font-size: 14px; line-height: 1.6; color: #9ca3af; margin: 0 0 20px 0;">
                    Hello <strong style="color: #ffffff;">${recipientName}</strong>,<br>
                    An administrative account has been created for you by <strong style="color: #e5e7eb;">${creatorName}</strong>. You now have access to manage the Bharat DigiGuru platform.
                  </p>
                </td>
              </tr>

              <!-- Credentials Card -->
              <tr>
                <td style="padding: 0 32px 24px 32px;">
                  <div style="background: #090a10; border: 1px solid #1f2333; border-radius: 12px; padding: 20px 24px;">
                    
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 14px; font-family: ui-monospace, monospace;">
                      Your Account Credentials
                    </div>

                    <!-- Email Field -->
                    <div style="margin-bottom: 14px;">
                      <div style="font-size: 11px; color: #9ca3af; margin-bottom: 4px; text-transform: uppercase; font-family: ui-monospace, monospace; letter-spacing: 0.5px;">
                        Login Email
                      </div>
                      <div style="font-size: 15px; font-weight: 600; color: #ffffff; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;">
                        ${toEmail}
                      </div>
                    </div>

                    <!-- Password Field -->
                    <div style="padding-top: 12px; border-top: 1px solid #191c29;">
                      <div style="font-size: 11px; color: #9ca3af; margin-bottom: 4px; text-transform: uppercase; font-family: ui-monospace, monospace; letter-spacing: 0.5px;">
                        Assigned Password
                      </div>
                      <div style="display: inline-block; background: #131622; border: 1px solid #282d42; border-radius: 6px; padding: 8px 14px;">
                        <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 16px; font-weight: 700; color: #60a5fa; letter-spacing: 1.5px;">
                          ${password}
                        </span>
                      </div>
                    </div>

                  </div>
                </td>
              </tr>

              <!-- Action Button -->
              <tr>
                <td style="padding: 0 32px 28px 32px;">
                  <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
                    <tr>
                      <td align="center" style="border-radius: 8px; background: #ff3b30;">
                        <a href="${portalUrl}" target="_blank" style="display: block; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; text-align: center; letter-spacing: 0.2px; text-transform: uppercase; font-family: ui-monospace, monospace;">
                          Log In to Admin Console &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Security Advice Box -->
              <tr>
                <td style="padding: 0 32px 28px 32px;">
                  <div style="background: #151824; border-left: 3px solid #ff3b30; border-radius: 0 8px 8px 0; padding: 14px 18px;">
                    <div style="font-size: 12px; font-weight: 600; color: #f3f4f6; margin-bottom: 4px;">
                      Security Recommendation
                    </div>
                    <div style="font-size: 12px; line-height: 1.5; color: #9ca3af;">
                      We recommend changing your password after your first login via the "Forgot Password" or profile settings option. Never share these credentials with anyone.
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background: #0d0e15; padding: 20px 32px; border-top: 1px solid #1c202d;">
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="left" style="font-size: 12px; color: #6b7280;">
                        Bharat DigiGuru &bull; Next-Gen Digital Studio
                      </td>
                      <td align="right" style="font-size: 12px;">
                        <a href="https://bharatdigiguru.com" style="color: #6b7280; text-decoration: none;">bharatdigiguru.com</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (!transporter) {
    return {
      sent: true,
      message: "Admin credentials logged to server console (SMTP not configured in .env).",
    };
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `Your Bharat DigiGuru Admin Portal Credentials - ${normalizedRole}`,
      text: `Hello ${recipientName},\n\nYour admin account has been created with role: ${normalizedRole}.\n\nLogin Email: ${toEmail}\nPassword: ${password}\n\nLogin URL: ${portalUrl}\n\nPlease keep these credentials secure.`,
      html: htmlContent,
      attachments,
    });

    console.log(`✅ [EMAIL SENT] Admin credentials delivered to ${toEmail}`);
    return { sent: true, message: `Credentials successfully sent to ${toEmail}` };
  } catch (error: any) {
    console.error("❌ [EMAIL SEND ERROR]:", error.message);
    return {
      sent: false,
      message: `Failed to deliver email: ${error.message}. Use console credentials to log in.`,
    };
  }
}

