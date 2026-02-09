import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireSuperAdmin } from "./auth";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

function getIp(req: Request): string | null {
  const ip = req.ip;
  if (!ip) return null;
  if (Array.isArray(ip)) return ip[0] || null;
  return ip;
}

const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function param(val: string | string[] | undefined): string {
  if (Array.isArray(val)) return val[0] || "";
  return val || "";
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  setupAuth(app);

  // Serve uploaded images
  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(uploadDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  // ===== PUBLIC API =====

  app.get("/api/config", (_req: Request, res: Response) => {
    res.json({ whatsappNumber: process.env.WHATSAPP_NUMBER || "1234567890" });
  });

  // Get active categories
  app.get("/api/categories", async (_req: Request, res: Response) => {
    const cats = await storage.getAllCategories(false);
    res.json(cats);
  });

  // Get category by slug
  app.get("/api/categories/:slug", async (req: Request, res: Response) => {
    const cat = await storage.getCategoryBySlug(param(req.params.slug));
    if (!cat || !cat.isActive) return res.status(404).json({ message: "Category not found" });
    res.json(cat);
  });

  // Get active products
  app.get("/api/products", async (req: Request, res: Response) => {
    const { search, category } = req.query;
    if (search && typeof search === "string") {
      const results = await storage.searchProducts(search);
      return res.json(results);
    }
    if (category && typeof category === "string") {
      const cat = await storage.getCategoryBySlug(category);
      if (!cat) return res.json([]);
      const prods = await storage.getProductsByCategory(cat.id);
      return res.json(prods);
    }
    const prods = await storage.getAllProducts(false);
    res.json(prods);
  });

  // Get product by slug
  app.get("/api/products/:slug", async (req: Request, res: Response) => {
    const product = await storage.getProductBySlug(param(req.params.slug));
    if (!product || !product.isActive) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  // Get active banners
  app.get("/api/banners", async (_req: Request, res: Response) => {
    const b = await storage.getAllBanners(false);
    res.json(b);
  });

  // ===== ADMIN API =====

  // Upload images
  app.post("/api/admin/upload", requireAuth, upload.array("images", 10), (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return res.status(400).json({ message: "No files uploaded" });
    const urls = files.map(f => `/uploads/${f.filename}`);
    res.json({ urls });
  });

  // Admin categories
  app.get("/api/admin/categories", requireAuth, async (req: Request, res: Response) => {
    const cats = await storage.getAllCategories(true);
    res.json(cats);
  });

  app.post("/api/admin/categories", requireAuth, async (req: Request, res: Response) => {
    const schema = z.object({
      name: z.string().min(1),
      slug: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

    const { name, slug, description, image, sortOrder, isActive } = parsed.data;
    const finalSlug = slug || slugify(name);

    const existing = await storage.getCategoryBySlug(finalSlug);
    if (existing) return res.status(409).json({ message: "Category with this slug already exists" });

    const cat = await storage.createCategory({
      name,
      slug: finalSlug,
      description: description || null,
      image: image || null,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true,
      createdBy: req.session.admin!.adminId,
    });

    await storage.createAuditLog({
      adminId: req.session.admin!.adminId,
      action: "CREATE",
      entity: "category",
      entityId: cat.id,
      details: `Created category: ${cat.name}`,
      ipAddress: getIp(req),
    });

    res.status(201).json(cat);
  });

  app.patch("/api/admin/categories/:id", requireAuth, async (req: Request, res: Response) => {
    const id = parseInt(param(req.params.id));
    const cat = await storage.getCategoryById(id);
    if (!cat) return res.status(404).json({ message: "Category not found" });

    const schema = z.object({
      name: z.string().optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

    const updated = await storage.updateCategory(id, parsed.data);

    await storage.createAuditLog({
      adminId: req.session.admin!.adminId,
      action: "UPDATE",
      entity: "category",
      entityId: id,
      details: `Updated category: ${updated?.name}`,
      ipAddress: getIp(req),
    });

    res.json(updated);
  });

  // Admin products
  app.get("/api/admin/products", requireAuth, async (req: Request, res: Response) => {
    const admin = req.session.admin!;
    if (admin.role === "SUPER_ADMIN") {
      const prods = await storage.getAllProducts(true);
      return res.json(prods);
    }
    const prods = await storage.getProductsByAdmin(admin.adminId);
    res.json(prods);
  });

  app.post("/api/admin/products", requireAuth, async (req: Request, res: Response) => {
    const schema = z.object({
      name: z.string().min(1),
      slug: z.string().optional(),
      partNumber: z.string().min(1),
      description: z.string().min(1),
      price: z.string().optional(),
      categoryId: z.number(),
      images: z.array(z.string()).min(3, "Minimum 3 images required"),
      isActive: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

    const { name, slug, partNumber, description, price, categoryId, images, isActive, isFeatured } = parsed.data;
    const finalSlug = slug || slugify(name);

    const existingSlug = await storage.getProductBySlug(finalSlug);
    if (existingSlug) return res.status(409).json({ message: "Product with this slug already exists" });

    const product = await storage.createProduct({
      name,
      slug: finalSlug,
      partNumber,
      description,
      price: price || null,
      categoryId,
      images,
      isActive: isActive ?? true,
      isFeatured: isFeatured ?? false,
      createdBy: req.session.admin!.adminId,
    });

    await storage.createAuditLog({
      adminId: req.session.admin!.adminId,
      action: "CREATE",
      entity: "product",
      entityId: product.id,
      details: `Created product: ${product.name}`,
      ipAddress: getIp(req),
    });

    res.status(201).json(product);
  });

  app.patch("/api/admin/products/:id", requireAuth, async (req: Request, res: Response) => {
    const id = parseInt(param(req.params.id));
    const product = await storage.getProductById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const admin = req.session.admin!;
    if (admin.role !== "SUPER_ADMIN" && product.createdBy !== admin.adminId) {
      return res.status(403).json({ message: "You can only edit products you created" });
    }

    const schema = z.object({
      name: z.string().optional(),
      slug: z.string().optional(),
      partNumber: z.string().optional(),
      description: z.string().optional(),
      price: z.string().nullable().optional(),
      categoryId: z.number().optional(),
      images: z.array(z.string()).min(3).optional(),
      isActive: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

    const updated = await storage.updateProduct(id, parsed.data);

    await storage.createAuditLog({
      adminId: admin.adminId,
      action: "UPDATE",
      entity: "product",
      entityId: id,
      details: `Updated product: ${updated?.name}`,
      ipAddress: getIp(req),
    });

    res.json(updated);
  });

  // Admin banners (SUPER_ADMIN only)
  app.get("/api/admin/banners", requireSuperAdmin, async (_req: Request, res: Response) => {
    const b = await storage.getAllBanners(true);
    res.json(b);
  });

  app.post("/api/admin/banners", requireSuperAdmin, async (req: Request, res: Response) => {
    const schema = z.object({
      title: z.string().min(1),
      subtitle: z.string().optional(),
      image: z.string().min(1),
      linkUrl: z.string().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

    const banner = await storage.createBanner({
      ...parsed.data,
      subtitle: parsed.data.subtitle || null,
      linkUrl: parsed.data.linkUrl || null,
      sortOrder: parsed.data.sortOrder ?? 0,
      isActive: parsed.data.isActive ?? true,
      createdBy: req.session.admin!.adminId,
    });

    await storage.createAuditLog({
      adminId: req.session.admin!.adminId,
      action: "CREATE",
      entity: "banner",
      entityId: banner.id,
      details: `Created banner: ${banner.title}`,
      ipAddress: getIp(req),
    });

    res.status(201).json(banner);
  });

  app.patch("/api/admin/banners/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    const id = parseInt(param(req.params.id));
    const banner = await storage.getBannerById(id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    const schema = z.object({
      title: z.string().optional(),
      subtitle: z.string().nullable().optional(),
      image: z.string().optional(),
      linkUrl: z.string().nullable().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

    const updated = await storage.updateBanner(id, parsed.data);

    await storage.createAuditLog({
      adminId: req.session.admin!.adminId,
      action: "UPDATE",
      entity: "banner",
      entityId: id,
      details: `Updated banner: ${updated?.title}`,
      ipAddress: getIp(req),
    });

    res.json(updated);
  });

  app.delete("/api/admin/banners/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    const id = parseInt(param(req.params.id));
    await storage.deleteBanner(id);
    await storage.createAuditLog({
      adminId: req.session.admin!.adminId,
      action: "DELETE",
      entity: "banner",
      entityId: id,
      details: `Deleted banner #${id}`,
      ipAddress: getIp(req),
    });
    res.json({ message: "Deleted" });
  });

  // Admin user management (SUPER_ADMIN only)
  app.get("/api/admin/admins", requireSuperAdmin, async (_req: Request, res: Response) => {
    const a = await storage.getAllAdmins();
    res.json(a);
  });

  app.post("/api/admin/admins", requireSuperAdmin, async (req: Request, res: Response) => {
    const schema = z.object({
      email: z.string().email(),
      name: z.string().min(1),
      role: z.enum(["SUPER_ADMIN", "ADMIN"]).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

    const existing = await storage.getAdminByEmail(parsed.data.email);
    if (existing) return res.status(409).json({ message: "Admin with this email already exists" });

    const admin = await storage.createAdmin({
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role || "ADMIN",
      isActive: true,
    });

    res.status(201).json(admin);
  });

  app.patch("/api/admin/admins/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    const id = parseInt(param(req.params.id));
    const admin = await storage.getAdminById(id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const schema = z.object({
      name: z.string().optional(),
      role: z.enum(["SUPER_ADMIN", "ADMIN"]).optional(),
      isActive: z.boolean().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

    const updated = await storage.updateAdmin(id, parsed.data);
    res.json(updated);
  });

  // Dashboard stats
  app.get("/api/admin/stats", requireAuth, async (req: Request, res: Response) => {
    const admin = req.session.admin!;
    if (admin.role === "SUPER_ADMIN") {
      const global = await storage.getGlobalStats();
      const allAdmins = await storage.getAllAdmins();
      const adminStats = await Promise.all(
        allAdmins.map(async (a) => ({
          admin: a,
          stats: await storage.getAdminStats(a.id),
        }))
      );
      return res.json({ global, adminStats });
    }
    const stats = await storage.getAdminStats(admin.adminId);
    res.json({ personal: stats });
  });

  // Audit logs
  app.get("/api/admin/audit-logs", requireAuth, async (req: Request, res: Response) => {
    const admin = req.session.admin!;
    if (admin.role === "SUPER_ADMIN") {
      const logs = await storage.getAuditLogs(100);
      return res.json(logs);
    }
    const logs = await storage.getAuditLogsByAdmin(admin.adminId, 50);
    res.json(logs);
  });

  return httpServer;
}
