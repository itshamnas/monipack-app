import { db } from "./db";
import { eq, desc, asc, like, and, or, sql } from "drizzle-orm";
import {
  admins, categories, products, banners, auditLogs, otpCodes,
  type Admin, type InsertAdmin,
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type Banner, type InsertBanner,
  type AuditLog, type InsertAuditLog,
} from "@shared/schema";

export interface IStorage {
  // Admins
  getAdminById(id: number): Promise<Admin | undefined>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  getAdminByGoogleId(googleId: string): Promise<Admin | undefined>;
  getAllAdmins(): Promise<Admin[]>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  updateAdmin(id: number, data: Partial<InsertAdmin>): Promise<Admin | undefined>;

  // OTP
  createOtp(adminId: number, codeHash: string, expiresAt: Date): Promise<void>;
  getValidOtp(adminId: number): Promise<{ id: number; codeHash: string } | undefined>;
  markOtpUsed(id: number): Promise<void>;

  // Categories
  getAllCategories(includeInactive?: boolean): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(cat: InsertCategory): Promise<Category>;
  updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | undefined>;

  // Products
  getAllProducts(includeInactive?: boolean): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined>;
  getProductsByAdmin(adminId: number): Promise<Product[]>;

  // Banners
  getAllBanners(includeInactive?: boolean): Promise<Banner[]>;
  getBannerById(id: number): Promise<Banner | undefined>;
  createBanner(banner: InsertBanner): Promise<Banner>;
  updateBanner(id: number, data: Partial<InsertBanner>): Promise<Banner | undefined>;
  deleteBanner(id: number): Promise<void>;

  // Audit Logs
  createAuditLog(log: InsertAuditLog): Promise<void>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  getAuditLogsByAdmin(adminId: number, limit?: number): Promise<AuditLog[]>;

  // Stats
  getAdminStats(adminId: number): Promise<{ totalProducts: number; activeProducts: number; disabledProducts: number; categoriesManaged: number }>;
  getGlobalStats(): Promise<{ totalProducts: number; activeProducts: number; totalCategories: number; activeCategories: number; totalAdmins: number }>;
}

export class DatabaseStorage implements IStorage {
  // Admins
  async getAdminById(id: number) {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin;
  }

  async getAdminByEmail(email: string) {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email.toLowerCase()));
    return admin;
  }

  async getAdminByGoogleId(googleId: string) {
    const [admin] = await db.select().from(admins).where(eq(admins.googleId, googleId));
    return admin;
  }

  async getAllAdmins() {
    return db.select().from(admins).orderBy(asc(admins.createdAt));
  }

  async createAdmin(admin: InsertAdmin) {
    const [created] = await db.insert(admins).values({ ...admin, email: admin.email.toLowerCase() }).returning();
    return created;
  }

  async updateAdmin(id: number, data: Partial<InsertAdmin>) {
    const [updated] = await db.update(admins).set(data).where(eq(admins.id, id)).returning();
    return updated;
  }

  // OTP
  async createOtp(adminId: number, codeHash: string, expiresAt: Date) {
    await db.insert(otpCodes).values({ adminId, codeHash, expiresAt });
  }

  async getValidOtp(adminId: number) {
    const [otp] = await db
      .select({ id: otpCodes.id, codeHash: otpCodes.codeHash })
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.adminId, adminId),
          sql`${otpCodes.expiresAt} > NOW()`,
          sql`${otpCodes.usedAt} IS NULL`
        )
      )
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);
    return otp;
  }

  async markOtpUsed(id: number) {
    await db.update(otpCodes).set({ usedAt: new Date() }).where(eq(otpCodes.id, id));
  }

  // Categories
  async getAllCategories(includeInactive = false) {
    if (includeInactive) {
      return db.select().from(categories).orderBy(asc(categories.sortOrder));
    }
    return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder));
  }

  async getCategoryById(id: number) {
    const [cat] = await db.select().from(categories).where(eq(categories.id, id));
    return cat;
  }

  async getCategoryBySlug(slug: string) {
    const [cat] = await db.select().from(categories).where(eq(categories.slug, slug));
    return cat;
  }

  async createCategory(cat: InsertCategory) {
    const [created] = await db.insert(categories).values(cat).returning();
    return created;
  }

  async updateCategory(id: number, data: Partial<InsertCategory>) {
    const [updated] = await db.update(categories).set({ ...data, updatedAt: new Date() }).where(eq(categories.id, id)).returning();
    return updated;
  }

  // Products
  async getAllProducts(includeInactive = false) {
    if (includeInactive) {
      return db.select().from(products).orderBy(desc(products.createdAt));
    }
    return db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
  }

  async getProductById(id: number) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySlug(slug: string) {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async getProductsByCategory(categoryId: number) {
    return db.select().from(products).where(and(eq(products.categoryId, categoryId), eq(products.isActive, true))).orderBy(desc(products.createdAt));
  }

  async searchProducts(query: string) {
    const searchTerm = `%${query}%`;
    return db.select().from(products).where(
      and(
        eq(products.isActive, true),
        or(
          like(products.name, searchTerm),
          like(products.partNumber, searchTerm),
          like(products.description, searchTerm)
        )
      )
    ).orderBy(desc(products.createdAt));
  }

  async createProduct(product: InsertProduct) {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: number, data: Partial<InsertProduct>) {
    const [updated] = await db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id)).returning();
    return updated;
  }

  async getProductsByAdmin(adminId: number) {
    return db.select().from(products).where(eq(products.createdBy, adminId)).orderBy(desc(products.createdAt));
  }

  // Banners
  async getAllBanners(includeInactive = false) {
    if (includeInactive) {
      return db.select().from(banners).orderBy(asc(banners.sortOrder));
    }
    return db.select().from(banners).where(eq(banners.isActive, true)).orderBy(asc(banners.sortOrder));
  }

  async getBannerById(id: number) {
    const [banner] = await db.select().from(banners).where(eq(banners.id, id));
    return banner;
  }

  async createBanner(banner: InsertBanner) {
    const [created] = await db.insert(banners).values(banner).returning();
    return created;
  }

  async updateBanner(id: number, data: Partial<InsertBanner>) {
    const [updated] = await db.update(banners).set({ ...data, updatedAt: new Date() }).where(eq(banners.id, id)).returning();
    return updated;
  }

  async deleteBanner(id: number) {
    await db.delete(banners).where(eq(banners.id, id));
  }

  // Audit Logs
  async createAuditLog(log: InsertAuditLog) {
    await db.insert(auditLogs).values(log);
  }

  async getAuditLogs(limit = 50) {
    return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }

  async getAuditLogsByAdmin(adminId: number, limit = 50) {
    return db.select().from(auditLogs).where(eq(auditLogs.adminId, adminId)).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }

  // Stats
  async getAdminStats(adminId: number) {
    const adminProducts = await db.select().from(products).where(eq(products.createdBy, adminId));
    const adminCategories = await db.select().from(categories).where(eq(categories.createdBy, adminId));
    return {
      totalProducts: adminProducts.length,
      activeProducts: adminProducts.filter(p => p.isActive).length,
      disabledProducts: adminProducts.filter(p => !p.isActive).length,
      categoriesManaged: adminCategories.length,
    };
  }

  async getGlobalStats() {
    const allProducts = await db.select().from(products);
    const allCategories = await db.select().from(categories);
    const allAdmins = await db.select().from(admins);
    return {
      totalProducts: allProducts.length,
      activeProducts: allProducts.filter(p => p.isActive).length,
      totalCategories: allCategories.length,
      activeCategories: allCategories.filter(c => c.isActive).length,
      totalAdmins: allAdmins.length,
    };
  }
}

export const storage = new DatabaseStorage();
