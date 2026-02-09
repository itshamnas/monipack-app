import { storage } from "./storage";
import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
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
  }
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
      secret: process.env.SESSION_SECRET || "monipack-dev-secret-change-me",
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

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, pin } = req.body;

    if (!email || !pin) {
      return res.status(400).json({ message: "Email and PIN are required" });
    }

    const adminPin = process.env.ADMIN_PIN || "123456";
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || "").toLowerCase();
    const normalizedEmail = email.toLowerCase();

    if (pin !== adminPin) {
      return res.status(403).json({ message: "Invalid email or PIN" });
    }

    let admin = await storage.getAdminByEmail(normalizedEmail);

    if (!admin && normalizedEmail === superAdminEmail) {
      admin = await storage.createAdmin({
        email: normalizedEmail,
        name: email.split("@")[0],
        role: "SUPER_ADMIN",
        isActive: true,
      });
    }

    if (!admin) {
      return res.status(403).json({ message: "Invalid email or PIN" });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: "Account disabled. Contact a Super Admin." });
    }

    req.session.admin = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      otpVerified: true,
    };

    await storage.createAuditLog({
      adminId: admin.id,
      action: "LOGIN_SUCCESS",
      entity: "auth",
      details: `Admin logged in: ${admin.email}`,
      ipAddress: getIp(req),
    });

    res.json({
      message: "Authenticated",
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    });
  });

  app.get("/api/auth/session", (req: Request, res: Response) => {
    if (req.session.admin && req.session.admin.otpVerified) {
      return res.json({ authenticated: true, admin: req.session.admin });
    }
    res.json({ authenticated: false });
  });

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
