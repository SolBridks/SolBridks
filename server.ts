import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Send Email OTP
  app.post("/api/send-email-otp", async (req, res) => {
    try {
      const { email, otp, name, portalType } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ error: "Email address and OTP code are required." });
      }

      const resendApiKey = process.env.RESEND_API_KEY;

      if (resendApiKey) {
        const resend = new Resend(resendApiKey);

        const portalLabel = portalType === 'specialist' ? 'SolBridks Specialist Portal' : 'SolBridks Client Portal';

        const emailResult = await resend.emails.send({
          from: "SolBridks Security <onboarding@resend.dev>",
          to: [email],
          subject: `${otp} is your verification code for ${portalLabel}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-rounded: 16px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #0f172a; margin: 0; font-size: 20px;">SolBridks On-Demand Expert Services</h2>
                <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Security Verification Code</p>
              </div>
              <p style="color: #334155; font-size: 14px; line-height: 1.5;">Hello ${name || 'User'},</p>
              <p style="color: #334155; font-size: 14px; line-height: 1.5;">Your one-time verification code (OTP) for account activation on the <strong>${portalLabel}</strong> is:</p>
              <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
                <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a;">${otp}</span>
              </div>
              <p style="color: #64748b; font-size: 12px; line-height: 1.5;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="color: #94a3b8; font-size: 11px; text-align: center;">&copy; 2026 SolBridks. All rights reserved.</p>
            </div>
          `
        });

        console.log("Real OTP email sent via Resend API:", emailResult);

        return res.json({
          success: true,
          mode: "live_email",
          message: `Verification code successfully sent to ${email}`,
          data: emailResult
        });
      } else {
        // Fallback when RESEND_API_KEY environment variable is not configured yet
        console.log(`[OTP DISPATCH] Real API Ready. Code ${otp} generated for ${email}. (Set RESEND_API_KEY in secrets to send live inbox emails for free).`);

        return res.json({
          success: true,
          mode: "simulated_ready",
          message: `OTP dispatched to ${email}. Set RESEND_API_KEY in project secrets to receive live emails in your inbox for free.`
        });
      }
    } catch (err: any) {
      console.error("Error sending OTP email:", err);
      return res.status(500).json({
        error: "Failed to deliver OTP email.",
        details: err?.message || String(err)
      });
    }
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
