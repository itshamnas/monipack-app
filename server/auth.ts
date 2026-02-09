import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";
import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { randomInt, createHash } from "crypto";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

function getIp(req: Request): string | null {
  const ip = req.ip;
  if (!ip) return null;
  if (Array.isArray(ip)) return ip[0] || null;
  return ip;
}

const PgStore = connectPgSimple(session);

export type AdminSession = {
  adminId: number;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  otpVerified: boolean;
};

declare module "express-session" {
  interface SessionData {
    admin?: AdminSession;
    pendingAdminId?: number;
  }
}

function hashOtp(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function generateOtp(): string {
  return String(randomInt(100000, 999999));
}

function isAllowedEmail(email: string): boolean {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
  if (superAdminEmail && email.toLowerCase() === superAdminEmail) return true;

  const allowlist = process.env.ADMIN_ALLOWLIST?.split(",").map(e => e.trim().toLowerCase()) || [];
  if (allowlist.includes(email.toLowerCase())) return true;

  return false;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.admin || !req.session.admin.otpVerified) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.admin || !req.session.admin.otpVerified || req.session.admin.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Forbidden: Super Admin access required" });
  }
  next();
}

export function setupAuth(app: Express) {
  app.use(
    session({
      store: new PgStore({ pool, createTableIfMissing: true }),
      secret: process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET || "monipack-dev-secret-change-me",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "lax",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(null, false);

            let admin = await storage.getAdminByEmail(email);
            if (!admin) {
              if (!isAllowedEmail(email)) {
                return done(null, false);
              }
              const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
              const role = superAdminEmail && email.toLowerCase() === superAdminEmail ? "SUPER_ADMIN" : "ADMIN";
              admin = await storage.createAdmin({
                email: email.toLowerCase(),
                name: profile.displayName || email,
                googleId: profile.id,
                role,
                isActive: true,
              });
            } else {
              if (!admin.isActive) return done(null, false);
              if (!admin.googleId) {
                await storage.updateAdmin(admin.id, { googleId: profile.id });
              }
            }

            done(null, admin);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );
  }

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const admin = await storage.getAdminById(id);
      done(null, admin);
    } catch (err) {
      done(err);
    }
  });

  // Google OAuth routes
  app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/admin/login?error=unauthorized" }),
    async (req: Request, res: Response) => {
      const admin = req.user as any;
      if (!admin) return res.redirect("/admin/login?error=unauthorized");

      req.session.pendingAdminId = admin.id;

      // Generate and "send" OTP
      const otpCode = generateOtp();
      const otpHash = hashOtp(otpCode);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await storage.createOtp(admin.id, otpHash, expiresAt);

      // Log the OTP to console for dev (in production, send email)
      console.log(`[OTP] Code for ${admin.email}: ${otpCode}`);

      await storage.createAuditLog({
        adminId: admin.id,
        action: "OTP_REQUESTED",
        entity: "auth",
        details: `OTP sent to ${admin.email}`,
        ipAddress: getIp(req),
      });

      res.redirect("/admin/verify-otp");
    }
  );

  // Request OTP (for manual trigger)
  app.post("/api/auth/request-otp", async (req: Request, res: Response) => {
    const adminId = req.session.pendingAdminId;
    if (!adminId) return res.status(400).json({ message: "No pending authentication" });

    const admin = await storage.getAdminById(adminId);
    if (!admin) return res.status(400).json({ message: "Admin not found" });

    const otpCode = generateOtp();
    const otpHash = hashOtp(otpCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await storage.createOtp(admin.id, otpHash, expiresAt);

    console.log(`[OTP] Code for ${admin.email}: ${otpCode}`);

    res.json({ message: "OTP sent to your email" });
  });

  // Verify OTP
  app.post("/api/auth/verify-otp", async (req: Request, res: Response) => {
    const adminId = req.session.pendingAdminId;
    if (!adminId) return res.status(400).json({ message: "No pending authentication" });

    const { code } = req.body;
    if (!code || typeof code !== "string" || code.length !== 6) {
      return res.status(400).json({ message: "Invalid OTP format" });
    }

    const admin = await storage.getAdminById(adminId);
    if (!admin) return res.status(400).json({ message: "Admin not found" });

    const otp = await storage.getValidOtp(adminId);
    if (!otp) return res.status(400).json({ message: "OTP expired or not found" });

    const inputHash = hashOtp(code);
    if (inputHash !== otp.codeHash) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await storage.markOtpUsed(otp.id);

    req.session.admin = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      otpVerified: true,
    };
    delete req.session.pendingAdminId;

    await storage.createAuditLog({
      adminId: admin.id,
      action: "LOGIN_SUCCESS",
      entity: "auth",
      details: `Admin logged in: ${admin.email}`,
      ipAddress: getIp(req),
    });

    res.json({ message: "Authenticated", admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } });
  });

  // Dev login (no Google required)
  app.post("/api/auth/dev-login", async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ message: "Not available in production" });
    }

    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    let admin = await storage.getAdminByEmail(email);
    if (!admin) {
      if (!isAllowedEmail(email)) {
        return res.status(403).json({ message: "Email not authorized" });
      }
      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
      const role = superAdminEmail && email.toLowerCase() === superAdminEmail ? "SUPER_ADMIN" : "ADMIN";
      admin = await storage.createAdmin({
        email: email.toLowerCase(),
        name: email.split("@")[0],
        role,
        isActive: true,
      });
    }

    if (!admin.isActive) return res.status(403).json({ message: "Account disabled" });

    req.session.pendingAdminId = admin.id;

    const otpCode = generateOtp();
    const otpHash = hashOtp(otpCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await storage.createOtp(admin.id, otpHash, expiresAt);
    console.log(`[OTP] Code for ${admin.email}: ${otpCode}`);

    res.json({ message: "OTP sent", adminId: admin.id });
  });

  // Get current session
  app.get("/api/auth/session", (req: Request, res: Response) => {
    if (req.session.admin && req.session.admin.otpVerified) {
      return res.json({ authenticated: true, admin: req.session.admin });
    }
    if (req.session.pendingAdminId) {
      return res.json({ authenticated: false, pendingOtp: true });
    }
    res.json({ authenticated: false });
  });

  // Logout
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    if (req.session.admin) {
      await storage.createAuditLog({
        adminId: req.session.admin.adminId,
        action: "LOGOUT",
        entity: "auth",
        details: `Admin logged out: ${req.session.admin.email}`,
        ipAddress: getIp(req),
      });
    }
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out" });
    });
  });
}
