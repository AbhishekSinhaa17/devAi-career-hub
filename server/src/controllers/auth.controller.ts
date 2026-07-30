import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";
import { OAuthExchangeCode } from "../models/OAuthExchangeCode.js";
import { sendPasswordResetEmail } from "../services/email.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const SALT_ROUNDS = 10;

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next({ status: 409, code: "USER_EXISTS", message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      email,
      passwordHash,
      name,
      requiresPasswordReset: false,
    });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ status: "success", data: { token, user: { id: user._id, email: user.email, name: user.name, role: user.role } } });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next({ status: 401, code: "INVALID_CREDENTIALS", message: "Invalid email or password" });
    }

    if (user.requiresPasswordReset) {
      return next({ status: 403, code: "PASSWORD_RESET_REQUIRED", message: "Your account was migrated. Please reset your password." });
    }

    if (!user.passwordHash) {
      return next({ status: 403, code: "PASSWORD_RESET_REQUIRED", message: "Please set a password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return next({ status: 401, code: "INVALID_CREDENTIALS", message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ status: "success", data: { token, user: { id: user._id, email: user.email, name: user.name, role: user.role } } });
  } catch (error) {
    next(error);
  }
}

export async function requestPasswordReset(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
      await sendPasswordResetEmail(user.email, resetToken);
    }

    // Always return success even if user not found (security best practice)
    res.json({ status: "success", message: "If an account exists, a reset link has been sent." });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, newPassword } = req.body;

    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return next({ status: 400, code: "INVALID_TOKEN", message: "Token is invalid or expired" });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return next({ status: 404, code: "USER_NOT_FOUND", message: "User not found" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.requiresPasswordReset = false;
    await user.save();

    res.json({ status: "success", message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user?.id).select("-passwordHash");
    if (!user) {
      return next({ status: 404, code: "USER_NOT_FOUND", message: "User not found" });
    }
    const is_pro = user.role === "admin" || false;
    res.json({ status: "success", data: { ...user.toObject(), is_pro } });
  } catch (error) {
    next(error);
  }
}

export async function googleAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";

    if (!clientId) {
      return res.status(400).send(`
        <div style="font-family: system-ui, sans-serif; padding: 3rem; max-width: 600px; margin: auto; line-height: 1.5; background: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #334155; margin-top: 5vh;">
          <h2 style="color: #60a5fa; margin-top: 0;">Google OAuth Credentials Required</h2>
          <p>Google Client ID is missing. Please configure <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> in your <code>server/.env</code> file.</p>
          <hr style="border-color: #334155; margin: 1.5rem 0;" />
          <p style="font-size: 0.9rem; color: #94a3b8;">Whitelist this Authorized Redirect URI in Google Cloud Console:</p>
          <code style="background: #1e293b; padding: 0.5rem 0.75rem; border-radius: 6px; display: block; color: #38bdf8;">${redirectUri}</code>
        </div>
      `);
    }

    const state = crypto.randomBytes(32).toString("hex");
    res.cookie("devai_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent("openid email profile")}` +
      `&state=${encodeURIComponent(state)}` +
      `&prompt=select_account`;

    res.redirect(googleAuthUrl);
  } catch (error) {
    next(error);
  }
}

export async function googleAuthCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, state } = req.query;
    const storedState = req.cookies.devai_oauth_state;
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

    res.clearCookie("devai_oauth_state");

    // Two OAuth flows are supported:
    // 1. Server-initiated: /api/auth/google sets a cookie, state is validated here.
    // 2. Client-initiated: frontend builds the Google URL directly (faster on cold-start),
    //    state is stored in sessionStorage — no cookie. We pass it back for frontend validation.
    if (storedState) {
      // Server-initiated flow: validate state against cookie
      if (!state || state !== storedState) {
        return res.status(403).send("CSRF State Verification Failed. Please try logging in again.");
      }
    }
    // Client-initiated flow: no cookie → state will be validated by the frontend
    // against sessionStorage. The exchange code is one-use and expires in 60s.

    if (!code || typeof code !== "string") {
      return res.redirect(`${clientUrl}/login?error=oauth_failed`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      console.error("[Google OAuth] Token exchange failed:", await tokenRes.text());
      return res.redirect(`${clientUrl}/login?error=oauth_token_exchange_failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      return res.redirect(`${clientUrl}/login?error=oauth_profile_fetch_failed`);
    }

    const profile = (await profileRes.json()) as {
      id: string;
      email: string;
      name?: string;
      picture?: string;
    };

    if (!profile.email) {
      return res.redirect(`${clientUrl}/login?error=no_email_provided`);
    }

    let user = await User.findOne({
      $or: [{ googleId: profile.id }, { email: profile.email }],
    });

    if (user) {
      let modified = false;
      if (!user.googleId) {
        user.googleId = profile.id;
        modified = true;
      }
      if (user.requiresPasswordReset) {
        user.requiresPasswordReset = false;
        modified = true;
      }
      if (profile.picture && !user.avatarUrl) {
        user.avatarUrl = profile.picture;
        modified = true;
      }
      if (profile.name && !user.name) {
        user.name = profile.name;
        modified = true;
      }
      if (modified) await user.save();
    } else {
      user = await User.create({
        email: profile.email,
        googleId: profile.id,
        name: profile.name || profile.email.split("@")[0],
        avatarUrl: profile.picture,
        requiresPasswordReset: false,
      });
    }

    const exchangeCode = crypto.randomBytes(32).toString("hex");
    await OAuthExchangeCode.create({
      code: exchangeCode,
      userId: user._id,
      expiresAt: new Date(Date.now() + 60000),
      used: false,
    });

    // Include state in redirect so the frontend can validate it for client-initiated flows
    const stateParam = state ? `&oauth_state=${encodeURIComponent(state as string)}` : "";
    res.redirect(`${clientUrl}/login?oauth_code=${exchangeCode}${stateParam}`);
  } catch (error) {
    next(error);
  }
}

export async function exchangeGoogleCode(req: Request, res: Response, next: NextFunction) {
  try {
    const { code } = req.body;

    if (!code || typeof code !== "string") {
      return next({ status: 400, code: "INVALID_CODE", message: "Exchange code is required" });
    }

    const record = await OAuthExchangeCode.findOne({
      code,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return next({ status: 400, code: "INVALID_OR_EXPIRED_CODE", message: "Invalid or expired authorization code" });
    }

    record.used = true;
    await record.save();
    await OAuthExchangeCode.deleteOne({ _id: record._id });

    const user = await User.findById(record.userId);
    if (!user) {
      return next({ status: 404, code: "USER_NOT_FOUND", message: "User not found" });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      status: "success",
      data: {
        token,
        user: { id: user._id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl },
      },
    });
  } catch (error) {
    next(error);
  }
}

