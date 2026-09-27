import nodemailer from "nodemailer";

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
 * Sends a password reset OTP email to the requested administrator.
 */
export async function sendPasswordResetOtpEmail({ toEmail, otp, recipientName = "Administrator" }: SendOtpOptions): Promise<{ sent: boolean; message: string }> {
  // Always log OTP prominently in console for easy development & debugging
  console.log("\n=======================================================");
  console.log("🔐 [BHARAT DIGIGURU] PASSWORD RESET OTP GENERATED");
  console.log(`📧 Recipient: ${toEmail}`);
  console.log(`🔑 6-Digit OTP: >>> ${otp} <<<`);
  console.log(`⏳ Valid For: 10 Minutes`);
  console.log("=======================================================\n");

  const transporter = createTransporter();
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || `"Bharat DigiGuru Security" <no-reply@bharatdigiguru.com>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset OTP - Bharat DigiGuru</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c10; color: #ffffff; margin: 0; padding: 24px; }
        .container { max-width: 520px; margin: 0 auto; background: #12141c; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 36px 28px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); text-align: center; }
        .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; margin-bottom: 20px; }
        .logo span { color: #ff3b30; }
        .heading { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
        .desc { font-size: 14px; color: #9ca3af; line-height: 1.6; margin-bottom: 28px; }
        .otp-box { background: rgba(255, 59, 48, 0.08); border: 1px dashed #ff3b30; border-radius: 14px; padding: 18px 24px; margin: 0 auto 28px; display: inline-block; }
        .otp-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ff5247; text-shadow: 0 0 16px rgba(255,59,48,0.4); margin: 0; }
        .warning { font-size: 12px; color: #6b7280; line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.08); pt: 20px; margin-top: 24px; }
        .footer { font-size: 11px; color: #4b5563; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">bharat <span>DIGIGURU</span></div>
        <div class="heading">Admin Password Reset Request</div>
        <p class="desc">Hello <strong>${recipientName}</strong>,<br>We received a request to reset your admin console password. Use the verification code below to authorize the reset:</p>
        
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>

        <p class="desc" style="margin-bottom: 0; font-size: 13px;">This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        
        <div class="warning">
          If you did not request this password reset, you can safely ignore this email. Your admin account remains secure.
        </div>
        
        <div class="footer">
          &copy; ${new Date().getFullYear()} Bharat DigiGuru &bull; Next-Gen Digital Studio & Production
        </div>
      </div>
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
      subject: `[Bharat DigiGuru] ${otp} is your Admin Password Reset Code`,
      text: `Your Bharat DigiGuru Admin Password Reset Code is: ${otp}. It expires in 10 minutes.`,
      html: htmlContent,
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
 * Sends a notification email to admin when a new inquiry is received.
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
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER || process.env.GMAIL_USER || "contactbharatdigiguru@gmail.com";
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || `"Bharat DigiGuru Leads" <no-reply@bharatdigiguru.com>`;

  const servicesList = Array.isArray(inquiry.services)
    ? inquiry.services.join(", ")
    : inquiry.services || "General Inquiry";

  console.log("\n=======================================================");
  console.log("📬 [NEW INQUIRY RECEIVED]");
  console.log(`👤 Name: ${inquiry.name}`);
  console.log(`📧 Email: ${inquiry.email}`);
  console.log(`📱 Phone: ${inquiry.phone || "N/A"}`);
  console.log(`🏢 Company: ${inquiry.company || "N/A"}`);
  console.log(`🛠️ Services: ${servicesList}`);
  console.log(`💬 Message: ${inquiry.message}`);
  console.log("=======================================================\n");

  if (!transporter) {
    return;
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: adminEmail,
      subject: `[New Lead] Inquiry from ${inquiry.name} - Bharat DigiGuru`,
      html: `
        <h2>New Client Inquiry Received</h2>
        <p><strong>Name:</strong> ${inquiry.name}</p>
        <p><strong>Email:</strong> ${inquiry.email}</p>
        <p><strong>Phone:</strong> ${inquiry.phone || "Not provided"}</p>
        <p><strong>Company:</strong> ${inquiry.company || "Not provided"}</p>
        <p><strong>Services:</strong> ${servicesList}</p>
        <p><strong>Message:</strong></p>
        <p style="background:#f4f4f4;padding:12px;border-radius:6px;">${inquiry.message}</p>
      `,
    });
    console.log(`✅ [EMAIL NOTIFICATION] Inquiry sent to admin: ${adminEmail}`);
  } catch (err: any) {
    console.error("❌ [EMAIL NOTIFICATION ERROR]:", err.message);
  }
}

