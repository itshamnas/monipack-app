import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireSuperAdmin } from "./auth";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import sharp from "sharp";
import { sendContactEmail } from "./email";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { products, categories, banners, retailOutlets, warehouses, contactMessages, careerPosts } from "@shared/schema";

async function compressImage(filePath: string): Promise<void> {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const tempPath = filePath + ".tmp";

    if ([".jpg", ".jpeg"].includes(ext)) {
      await sharp(filePath).jpeg({ quality: 80, progressive: true }).toFile(tempPath);
    } else if (ext === ".png") {
      await sharp(filePath).png({ quality: 80, compressionLevel: 8 }).toFile(tempPath);
    } else if (ext === ".webp") {
      await sharp(filePath).webp({ quality: 80 }).toFile(tempPath);
    } else {
      return;
    }

    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error("[compress] Failed to compress image:", err);
  }
}

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
  limits: { fileSize: 10 * 1024 * 1024 },
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

  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(uploadDir, req.path);
    if (fs.existsSync(filePath)) {
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      res.set("Vary", "Accept-Encoding");
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  // ===== PUBLIC API =====

  app.get("/api/config", (_req: Request, res: Response) => {
    res.json({ whatsappNumber: process.env.WHATSAPP_NUMBER || "1234567890" });
  });

  app.get("/api/categories", async (_req: Request, res: Response) => {
    const cats = await storage.getAllCategories(false);
    res.json(cats);
  });

  app.get("/api/categories/:slug", async (req: Request, res: Response) => {
    const cat = await storage.getCategoryBySlug(param(req.params.slug));
    if (!cat || !cat.isActive) return res.status(404).json({ message: "Category not found" });
    res.json(cat);
  });

  app.get("/api/products", async (req: Request, res: Response) => {
    const { search, category } = req.query;
    let categoryId: number | undefined;
    if (category && typeof category === "string") {
      const cat = await storage.getCategoryBySlug(category);
      if (!cat) return res.json([]);
      categoryId = cat.id;
    }
    if (search && typeof search === "string") {
      const results = await storage.searchProducts(search, categoryId);
      return res.json(results);
    }
    if (categoryId) {
      const prods = await storage.getProductsByCategory(categoryId);
      return res.json(prods);
    }
    const prods = await storage.getAllProducts(false);
    res.json(prods);
  });

  app.get("/api/products/:slug", async (req: Request, res: Response) => {
    const product = await storage.getProductBySlug(param(req.params.slug));
    if (!product || !product.isActive) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.get("/api/banners", async (_req: Request, res: Response) => {
    const b = await storage.getAllBanners(false);
    res.json(b);
  });

  app.get("/api/retail-outlets", async (_req: Request, res: Response) => {
    const outlets = await storage.getAllRetailOutlets(false);
    res.json(outlets);
  });

  app.get("/api/warehouses", async (_req: Request, res: Response) => {
    const whs = await storage.getAllWarehouses(false);
    res.json(whs);
  });

  app.get("/api/career-posts", async (_req: Request, res: Response) => {
    const posts = await storage.getAllCareerPosts(false);
    res.json(posts);
  });

  // Contact form submission (public)
  app.post("/api/contact", async (req: Request, res: Response) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }
    try {
      await storage.createContactMessage({ name, email, subject, message });
      try {
        await sendContactEmail({ name, email, subject, message });
      } catch (emailErr) {
        console.error("Failed to send contact email:", emailErr);
      }
      res.json({ success: true, message: "Message sent successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // ===== ADMIN API =====

  app.post("/api/admin/upload", requireAuth, upload.array("images", 10), async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return res.status(400).json({ message: "No files uploaded" });

    await Promise.all(files.map(f => compressImage(f.path)));

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
      actorAdminId: req.session.admin!.adminId,
      action: "CATEGORY_CREATED",
      metaJson: { categoryId: cat.id, name: cat.name },
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
      actorAdminId: req.session.admin!.adminId,
      action: "CATEGORY_UPDATED",
      metaJson: { categoryId: id, name: updated?.name },
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
      actorAdminId: req.session.admin!.adminId,
      action: "PRODUCT_CREATED",
      metaJson: { productId: product.id, name: product.name },
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
      actorAdminId: admin.adminId,
      action: "PRODUCT_UPDATED",
      metaJson: { productId: id, name: updated?.name },
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
      title: z.string().optional(),
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
      title: parsed.data.title || null,
      subtitle: parsed.data.subtitle || null,
      linkUrl: parsed.data.linkUrl || null,
      sortOrder: parsed.data.sortOrder ?? 0,
      isActive: parsed.data.isActive ?? true,
      createdBy: req.session.admin!.adminId,
    });

    await storage.createAuditLog({
      actorAdminId: req.session.admin!.adminId,
      action: "BANNER_CREATED",
      metaJson: { bannerId: banner.id, title: banner.title },
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

    console.log("[DEBUG] Banner PATCH body:", JSON.stringify(req.body));
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      console.log("[DEBUG] Banner PATCH validation error:", JSON.stringify(flat));
      return res.status(400).json({ error: "Invalid input", fieldErrors: flat.fieldErrors, formErrors: flat.formErrors });
    }

    const updated = await storage.updateBanner(id, parsed.data);

    await storage.createAuditLog({
      actorAdminId: req.session.admin!.adminId,
      action: "BANNER_UPDATED",
      metaJson: { bannerId: id, title: updated?.title },
    });

    res.json(updated);
  });

  app.delete("/api/admin/banners/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    const id = parseInt(param(req.params.id));
    await storage.softDeleteBanner(id);
    await storage.createAuditLog({
      actorAdminId: req.session.admin!.adminId,
      action: "BANNER_DELETED",
      metaJson: { bannerId: id },
    });
    res.json({ message: "Deleted" });
  });

  // Admin retail outlets (SUPER_ADMIN only)
  app.get("/api/admin/retail-outlets", requireSuperAdmin, async (_req: Request, res: Response) => {
    const outlets = await storage.getAllRetailOutlets(true);
    res.json(outlets);
  });

  app.post("/api/admin/retail-outlets", requireSuperAdmin, async (req: Request, res: Response) => {
    const schema = z.object({
      name: z.string().min(1),
      image: z.string().optional(),
      mapUrl: z.string().optional(),
      phone: z.string().optional(),
      hours: z.string().optional(),
      isActive: z.boolean().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

    const outlet = await storage.createRetailOutlet({
      ...parsed.data,
      image: parsed.data.image || null,
      mapUrl: parsed.data.mapUrl || null,
      phone: parsed.data.phone || null,
      hours: parsed.data.hours || null,
      isActive: parsed.data.isActive ?? true,
      createdBy: req.session.admin!.adminId,
    });

    await storage.createAuditLog({
      actorAdminId: req.session.admin!.adminId,
      action: "RETAIL_OUTLET_CREATED",
      metaJson: { outletId: outlet.id, name: outlet.name },
    });

    res.status(201).json(outlet);
  });

  app.patch("/api/admin/retail-outlets/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    const id = parseInt(param(req.params.id));
    const outlet = await storage.getRetailOutletById(id);
    if (!outlet) return res.status(404).json({ message: "Retail outlet not found" });

    const schema = z.object({
      name: z.string().optional(),
      image: z.string().nullable().optional(),
      mapUrl: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      hours: z.string().nullable().optional(),
      isActive: z.boolean().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

    const updated = await storage.updateRetailOutlet(id, parsed.data);
    await storage.createAuditLog({
      actorAdminId: req.session.admin!.adminId,
      action: "RETAIL_OUTLET_UPDATED",
      metaJson: { outletId: id, name: updated?.name },
    });
    res.json(updated);
  });

  app.delete("/api/admin/retail-outlets/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    const id = parseInt(param(req.params.id));
    await storage.softDeleteRetailOutlet(id);
    await storage.createAuditLog({
      actorAdminId: req.session.admin!.adminId,
      action: "RETAIL_OUTLET_DELETED",
      metaJson: { outletId: id },
    });
    res.json({ message: "Deleted" });
  });

  // Admin warehouses (SUPER_ADMIN only)
  app.get("/api/admin/warehouses", requireSuperAdmin, async (_req: Request, res: Response) => {
    const whs = await storage.getAllWarehouses(true);
    res.json(whs);
  });

  app.post("/api/admin/warehouses", requireSuperAdmin, async (req: Request, res: Response) => {
    const schema = z.object({
      name: z.string().min(1),
      image: z.string().optional(),
      mapUrl: z.string().optional(),
      phone: z.string().optional(),
      hours: z.string().optional(),
      isActive: z.boolean().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

    const wh = await storage.createWarehouse({
      ...parsed.data,
      image: parsed.data.image || null,
      mapUrl: parsed.data.mapUrl || null,
      phone: parsed.data.phone || null,
      hours: parsed.data.hours || null,
      isActive: parsed.data.isActive ?? true,
      createdBy: req.session.admin!.adminId,
    });

    await storage.createAuditLog({
      actorAdminId: req.session.admin!.adminId,
      action: "WAREHOUSE_CREATED",
      metaJson: { warehouseId: wh.id, name: wh.name },
    });

    res.status(201).json(wh);
  });

  app.patch("/api/admin/warehouses/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    const id = parseInt(param(req.params.id));
    const wh = await storage.getWarehouseById(id);
    if (!wh) return res.status(404).json({ message: "Warehouse not found" });

    const schema = z.object({
      name: z.string().optional(),
      image: z.string().nullable().optional(),
      mapUrl: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      hours: z.string().nullable().optional(),
      isActive: z.boolean().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

    const updated = await storage.updateWarehouse(id, parsed.data);
    await storage.createAuditLog({
      actorAdminId: req.session.admin!.adminId,
      action: "WAREHOUSE_UPDATED",
      metaJson: { warehouseId: id, name: updated?.name },
    });
    res.json(updated);
  });

  app.delete("/api/admin/warehouses/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    const id = parseInt(param(req.params.id));
    await storage.softDeleteWarehouse(id);
    await storage.createAuditLog({
      actorAdminId: req.session.admin!.adminId,
      action: "WAREHOUSE_DELETED",
      metaJson: { warehouseId: id },
    });
    res.json({ message: "Deleted" });
  });

  // ===== ADMIN CAREER POSTS (SUPER_ADMIN only) =====
  app.get("/api/admin/career-posts", requireSuperAdmin, async (_req: Request, res: Response) => {
    const posts = await storage.getAllCareerPosts(true);
    res.json(posts);
  });

  app.post("/api/admin/career-posts", requireSuperAdmin, async (req: Request, res: Response) => {
    const schema = z.object({
      title: z.string().min(1),
      department: z.string().min(1),
      location: z.string().min(1),
      type: z.string().optional(),
      description: z.string().optional(),
      applyEmail: z.string().email().optional(),
      isActive: z.boolean().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

    const post = await storage.createCareerPost({
      ...parsed.data,
      type: parsed.data.type || "Full-time",
      description: parsed.data.description || null,
      applyEmail: parsed.data.applyEmail || null,
      isActive: parsed.data.isActive ?? true,
      createdBy: req.session.admin!.adminId,
    });

    await storage.createAuditLog({
      actorAdminId: req.session.admin!.adminId,
      action: "CAREER_POST_CREATED",
      metaJson: { postId: post.id, title: post.title },
    });

    res.status(201).json(post);
  });

  app.patch("/api/admin/career-posts/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    const id = parseInt(param(req.params.id));
    const post = await storage.getCareerPostById(id);
    if (!post) return res.status(404).json({ message: "Career post not found" });

    const schema = z.object({
      title: z.string().optional(),
      department: z.string().optional(),
      location: z.string().optional(),
      type: z.string().optional(),
      description: z.string().nullable().optional(),
      applyEmail: z.string().nullable().optional(),
      isActive: z.boolean().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

    const updated = await storage.updateCareerPost(id, parsed.data);
    await storage.createAuditLog({
      actorAdminId: req.session.admin!.adminId,
      action: "CAREER_POST_UPDATED",
      metaJson: { postId: id, title: updated?.title },
    });
    res.json(updated);
  });

  app.delete("/api/admin/career-posts/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    const id = parseInt(param(req.params.id));
    await storage.softDeleteCareerPost(id);
    await storage.createAuditLog({
      actorAdminId: req.session.admin!.adminId,
      action: "CAREER_POST_DELETED",
      metaJson: { postId: id },
    });
    res.json({ message: "Deleted" });
  });

  // ===== BRAND LOGOS (Public + SUPER_ADMIN) =====

  const defaultBrands = [
    { brandKey: "moniclean", name: "MoniClean", description: "Cleaning and hygiene essentials designed for everyday use in homes, offices, and commercial spaces.", image: "/images/moniclean-logo.png" },
    { brandKey: "monifood", name: "MoniFood", description: "Safe, high-quality food products sourced and distributed for homes, restaurants, and businesses.", image: "/images/monifood-logo.png" },
    { brandKey: "monipack", name: "MoniPack", description: "Reliable packaging solutions for retail, catering, industrial, and commercial needs.", image: "/images/monipack-logo.png" },
  ];
  for (const brand of defaultBrands) {
    const existing = await storage.getBrandLogoByKey(brand.brandKey);
    if (!existing) {
      await storage.upsertBrandLogo(brand);
    }
  }

  app.get("/api/brand-logos", async (_req: Request, res: Response) => {
    const logos = await storage.getAllBrandLogos();
    res.json(logos);
  });

  app.patch("/api/admin/brand-logos/:brandKey", requireSuperAdmin, async (req: Request, res: Response) => {
    const brandKey = param(req.params.brandKey);
    if (!["moniclean", "monifood", "monipack"].includes(brandKey)) {
      return res.status(400).json({ message: "Invalid brand key" });
    }

    const updateData: any = { brandKey };
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.image) updateData.image = req.body.image;

    const logo = await storage.upsertBrandLogo(updateData);
    await storage.createAuditLog({
      actorAdminId: req.session.admin!.adminId,
      action: "BRAND_LOGO_UPDATED",
      metaJson: { brandKey },
    });
    res.json(logo);
  });

  // ===== ADMIN USER MANAGEMENT (SUPER_ADMIN only) =====

  app.get("/api/admin/users", requireSuperAdmin, async (_req: Request, res: Response) => {
    const allAdmins = await storage.getAllAdmins();
    const safe = allAdmins.map(({ pinHash, ...rest }) => rest);
    res.json(safe);
  });

  app.post("/api/admin/users", requireSuperAdmin, async (req: Request, res: Response) => {
    const schema = z.object({
      email: z.string().email("Invalid email format"),
      pin: z.string().length(6, "PIN must be exactly 6 digits").regex(/^\d{6}$/, "PIN must be exactly 6 digits"),
      active: z.boolean().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || "Invalid input";
      return res.status(400).json({ message: firstError });
    }

    const { email, pin, active } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await storage.getAdminByEmail(normalizedEmail);
    if (existing) return res.status(409).json({ message: "Admin with this email already exists" });

    const pinHash = await bcrypt.hash(pin, 10);

    const admin = await storage.createAdmin({
      email: normalizedEmail,
      role: "ADMIN",
      pinHash,
      active: active ?? true,
      createdBy: req.session.admin!.adminId,
    });

    await storage.createAuditLog({
      actorAdminId: req.session.admin!.adminId,
      action: "ADMIN_CREATED",
      metaJson: { newAdminId: admin.id, email: normalizedEmail },
    });

    const { pinHash: _, ...safe } = admin;
    res.status(201).json(safe);
  });

  app.put("/api/admin/users/:id/pin", requireSuperAdmin, async (req: Request, res: Response) => {
    const id = param(req.params.id);

    const schema = z.object({
      pin: z.string().length(6, "PIN must be exactly 6 digits").regex(/^\d{6}$/, "PIN must be exactly 6 digits"),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || "Invalid input";
      return res.status(400).json({ message: firstError });
    }

    const admin = await storage.getAdminById(id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (admin.role === "SUPER_ADMIN") {
      return res.status(403).json({ message: "Cannot reset Super Admin PIN via this endpoint" });
    }

    const pinHash = await bcrypt.hash(parsed.data.pin, 10);
    await storage.updateAdmin(id, { pinHash });

    await storage.createAuditLog({
      actorAdminId: req.session.admin!.adminId,
      action: "PIN_RESET",
      metaJson: { targetAdminId: id, email: admin.email },
    });

    res.json({ message: "PIN updated successfully" });
  });

  app.put("/api/admin/users/:id/status", requireSuperAdmin, async (req: Request, res: Response) => {
    const id = param(req.params.id);

    const schema = z.object({
      active: z.boolean(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

    const admin = await storage.getAdminById(id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (admin.role === "SUPER_ADMIN") {
      return res.status(403).json({ message: "Cannot disable Super Admin" });
    }

    const updated = await storage.updateAdmin(id, { active: parsed.data.active });

    await storage.createAuditLog({
      actorAdminId: req.session.admin!.adminId,
      action: parsed.data.active ? "ADMIN_ENABLED" : "ADMIN_DISABLED",
      metaJson: { targetAdminId: id, email: admin.email },
    });

    const { pinHash: _, ...safe } = updated!;
    res.json(safe);
  });

  // Dashboard stats
  app.get("/api/admin/stats", requireAuth, async (req: Request, res: Response) => {
    const admin = req.session.admin!;
    if (admin.role === "SUPER_ADMIN") {
      const global = await storage.getGlobalStats();
      const allAdmins = await storage.getAllAdmins();
      const adminStats = await Promise.all(
        allAdmins.map(async (a) => ({
          admin: { id: a.id, email: a.email, role: a.role, active: a.active },
          stats: await storage.getAdminStats(a.id),
        }))
      );
      return res.json({ global, adminStats });
    }
    const stats = await storage.getAdminStats(admin.adminId);
    res.json({ personal: stats });
  });

  // Audit logs
  app.get("/api/admin/audit-logs", requireSuperAdmin, async (req: Request, res: Response) => {
    const logs = await storage.getAuditLogs(100);
    res.json(logs);
  });

  // Contact messages (SUPER_ADMIN)
  app.get("/api/admin/contact-messages", requireSuperAdmin, async (_req: Request, res: Response) => {
    const messages = await storage.getAllContactMessages();
    res.json(messages);
  });

  app.get("/api/admin/contact-messages/unread-count", requireAuth, async (_req: Request, res: Response) => {
    const count = await storage.getUnreadContactCount();
    res.json({ count });
  });

  app.put("/api/admin/contact-messages/:id/read", requireSuperAdmin, async (req: Request, res: Response) => {
    const id = parseInt(param(req.params.id));
    await storage.markContactMessageRead(id);
    res.json({ success: true });
  });

  app.delete("/api/admin/contact-messages/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    const id = parseInt(param(req.params.id));
    await storage.softDeleteContactMessage(id);
    res.json({ success: true });
  });

  // ===== DELETED ITEMS (SUPER_ADMIN only) =====
  app.get("/api/admin/deleted", requireSuperAdmin, async (_req: Request, res: Response) => {
    const [delProducts, delCategories, delBanners, delOutlets, delWarehouses, delMessages, delCareerPosts] = await Promise.all([
      db.select().from(products).where(eq(products.isDeleted, true)).orderBy(desc(products.deletedAt)),
      db.select().from(categories).where(eq(categories.isDeleted, true)).orderBy(desc(categories.deletedAt)),
      db.select().from(banners).where(eq(banners.isDeleted, true)).orderBy(desc(banners.deletedAt)),
      db.select().from(retailOutlets).where(eq(retailOutlets.isDeleted, true)).orderBy(desc(retailOutlets.deletedAt)),
      db.select().from(warehouses).where(eq(warehouses.isDeleted, true)).orderBy(desc(warehouses.deletedAt)),
      db.select().from(contactMessages).where(eq(contactMessages.isDeleted, true)).orderBy(desc(contactMessages.deletedAt)),
      db.select().from(careerPosts).where(eq(careerPosts.isDeleted, true)).orderBy(desc(careerPosts.deletedAt)),
    ]);
    res.json({ products: delProducts, categories: delCategories, banners: delBanners, retailOutlets: delOutlets, warehouses: delWarehouses, contactMessages: delMessages, careerPosts: delCareerPosts });
  });

  app.post("/api/admin/restore/:type/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    const type = param(req.params.type);
    const id = parseInt(param(req.params.id));
    switch (type) {
      case "product": await storage.restoreProduct(id); break;
      case "category": await storage.restoreCategory(id); break;
      case "banner": await storage.restoreBanner(id); break;
      case "retail-outlet": await storage.restoreRetailOutlet(id); break;
      case "warehouse": await storage.restoreWarehouse(id); break;
      case "contact-message": await storage.restoreContactMessage(id); break;
      case "career-post": await storage.restoreCareerPost(id); break;
      default: return res.status(400).json({ message: "Invalid type" });
    }
    await storage.createAuditLog({
      actorAdminId: req.session.admin!.adminId,
      action: `${type.toUpperCase().replace("-", "_")}_RESTORED`,
      metaJson: { id, type },
    });
    res.json({ message: "Restored successfully" });
  });

  // ===== SOFT DELETE PRODUCTS & CATEGORIES =====
  app.delete("/api/admin/products/:id", requireAuth, async (req: Request, res: Response) => {
    const admin = req.session.admin!;
    const id = parseInt(param(req.params.id));
    const product = await storage.getProductById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (admin.role !== "SUPER_ADMIN" && product.createdBy !== admin.adminId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await storage.softDeleteProduct(id);
    await storage.createAuditLog({
      actorAdminId: admin.adminId,
      action: "PRODUCT_DELETED",
      metaJson: { productId: id, name: product.name },
    });
    res.json({ message: "Deleted" });
  });

  app.delete("/api/admin/categories/:id", requireAuth, async (req: Request, res: Response) => {
    const admin = req.session.admin!;
    const id = parseInt(param(req.params.id));
    const category = await storage.getCategoryById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    if (admin.role !== "SUPER_ADMIN" && category.createdBy !== admin.adminId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await storage.softDeleteCategory(id);
    await storage.createAuditLog({
      actorAdminId: admin.adminId,
      action: "CATEGORY_DELETED",
      metaJson: { categoryId: id, name: category.name },
    });
    res.json({ message: "Deleted" });
  });

  return httpServer;
}
