import { storage } from "./storage";
import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import bcrypt from "bcrypt";

const PgStore = connectPgSimple(session);

export type AdminSession = {
  adminId: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
};

declare module "express-session" {
  interface SessionData {
    admin?: AdminSession;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.admin || req.session.admin.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Forbidden: Super Admin access required" });
  }
  next();
}

async function ensureSuperAdmin() {
  const email = (process.env.SUPER_ADMIN_EMAIL || "").toLowerCase();
  const pin = process.env.SUPER_ADMIN_PIN || process.env.ADMIN_PIN || "123456";
  if (!email) return;

  const existing = await storage.getAdminByEmail(email);
  if (!existing) {
    const pinHash = await bcrypt.hash(pin, 10);
    await storage.createAdmin({
      email,
      role: "SUPER_ADMIN",
      pinHash,
      active: true,
      createdBy: null,
    });
    console.log(`[auth] Auto-provisioned SUPER_ADMIN: ${email}`);
  }
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

  ensureSuperAdmin().catch(err => console.error("[auth] Failed to ensure super admin:", err));

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, pin } = req.body;

    if (!email || !pin) {
      return res.status(400).json({ message: "Email and PIN are required" });
    }

    if (typeof pin !== "string" || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return res.status(400).json({ message: "PIN must be exactly 6 digits" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const admin = await storage.getAdminByEmail(normalizedEmail);
    if (!admin) {
      return res.status(403).json({ message: "Invalid email or PIN" });
    }

    if (!admin.active) {
      return res.status(403).json({ message: "Account disabled. Contact a Super Admin." });
    }

    const pinValid = await bcrypt.compare(pin, admin.pinHash);
    if (!pinValid) {
      await storage.createAuditLog({
        actorAdminId: admin.id,
        action: "LOGIN_FAIL",
        metaJson: { email: normalizedEmail, reason: "invalid_pin" },
      });
      return res.status(403).json({ message: "Invalid email or PIN" });
    }

    await storage.updateLastLogin(admin.id);

    req.session.admin = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    };

    await storage.createAuditLog({
      actorAdminId: admin.id,
      action: "LOGIN_SUCCESS",
      metaJson: { email: normalizedEmail },
    });

    res.json({
      message: "Authenticated",
      admin: { id: admin.id, email: admin.email, role: admin.role },
    });
  });

  app.get("/api/auth/session", (req: Request, res: Response) => {
    if (req.session.admin) {
      return res.json({ authenticated: true, admin: req.session.admin });
    }
    res.json({ authenticated: false });
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    if (req.session.admin) {
      await storage.createAuditLog({
        actorAdminId: req.session.admin.adminId,
        action: "LOGOUT",
        metaJson: { email: req.session.admin.email },
      });
    }
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out" });
    });
  });
}
