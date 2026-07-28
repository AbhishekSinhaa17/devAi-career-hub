import { Resend } from "resend";
import dotenv from "dotenv";
import pino from "pino";

dotenv.config();

const logger = pino();
// Fallback to a dummy key if not provided, to prevent crash on startup
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_to_prevent_startup_crash");
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@devai-career-hub.com";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const resetLink = `${FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

  try {
    const data = await resend.emails.send({
      from: `DevAI Career Hub <${FROM_EMAIL}>`,
      to,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your DevAI Career Hub account.</p>
          <p>Click the button below to set a new password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      `,
    });

    logger.info({ messageId: data.data?.id, to }, "Password reset email sent");
    return data;
  } catch (error) {
    logger.error({ err: error, to }, "Failed to send password reset email");
    throw new Error("Failed to send password reset email");
  }
}
