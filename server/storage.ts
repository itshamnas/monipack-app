import { db } from "./db";
import { eq, desc, asc, ilike, and, or, sql } from "drizzle-orm";
import {
  admins, categories, products, banners, auditLogs,
  type Admin, type InsertAdmin,
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type Banner, type InsertBanner,
  type AuditLog, type InsertAuditLog,
} from "@shared/schema";

export interface IStorage {
  getAdminById(id: string): Promise<Admin | undefined>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  getAllAdmins(): Promise<Admin[]>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  updateAdmin(id: string, data: Partial<InsertAdmin>): Promise<Admin | undefined>;
  updateLastLogin(id: string): Promise<void>;

  getAllCategories(includeInactive?: boolean): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(cat: InsertCategory): Promise<Category>;
  updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | undefined>;

  getAllProducts(includeInactive?: boolean): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  searchProducts(query: string, categoryId?: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined>;
  getProductsByAdmin(adminId: string): Promise<Product[]>;

  getAllBanners(includeInactive?: boolean): Promise<Banner[]>;
  getBannerById(id: number): Promise<Banner | undefined>;
  createBanner(banner: InsertBanner): Promise<Banner>;
  updateBanner(id: number, data: Partial<InsertBanner>): Promise<Banner | undefined>;
  deleteBanner(id: number): Promise<void>;

  createAuditLog(log: InsertAuditLog): Promise<void>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;

  getAdminStats(adminId: string): Promise<{ totalProducts: number; activeProducts: number; disabledProducts: number; categoriesManaged: number }>;
  getGlobalStats(): Promise<{ totalProducts: number; activeProducts: number; totalCategories: number; activeCategories: number; totalAdmins: number }>;
}

export class DatabaseStorage implements IStorage {
  async getAdminById(id: string) {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin;
  }

  async getAdminByEmail(email: string) {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email.toLowerCase()));
    return admin;
  }

  async getAllAdmins() {
    return db.select().from(admins).orderBy(asc(admins.createdAt));
  }

  async createAdmin(admin: InsertAdmin) {
    const [created] = await db.insert(admins).values({ ...admin, email: admin.email.toLowerCase() }).returning();
    return created;
  }

  async updateAdmin(id: string, data: Partial<InsertAdmin>) {
    const [updated] = await db.update(admins).set({ ...data, updatedAt: new Date() }).where(eq(admins.id, id)).returning();
    return updated;
  }

  async updateLastLogin(id: string) {
    await db.update(admins).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(admins.id, id));
  }

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

  async searchProducts(query: string, categoryId?: number) {
    const searchTerm = `%${query}%`;
    const matchingCats = await db.select({ id: categories.id }).from(categories).where(ilike(categories.name, searchTerm));
    const catIds = matchingCats.map(c => c.id);

    const conditions = [
      eq(products.isActive, true),
      or(
        ilike(products.name, searchTerm),
        ilike(products.partNumber, searchTerm),
        ilike(products.description, searchTerm),
        ...(catIds.length > 0 ? [sql`${products.categoryId} IN (${sql.join(catIds.map(id => sql`${id}`), sql`, `)})`] : [])
      ),
    ];
    if (categoryId !== undefined) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    return db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt));
  }

  async createProduct(product: InsertProduct) {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: number, data: Partial<InsertProduct>) {
    const [updated] = await db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id)).returning();
    return updated;
  }

  async getProductsByAdmin(adminId: string) {
    return db.select().from(products).where(eq(products.createdBy, adminId)).orderBy(desc(products.createdAt));
  }

  async getAllBanners(includeInactive = false) {
    if (includeInactive) {
      return db.select().from(banners).orderBy(asc(banners.sortOrder), desc(banners.createdAt));
    }
    return db.select().from(banners).where(eq(banners.isActive, true)).orderBy(asc(banners.sortOrder), desc(banners.createdAt));
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

  async createAuditLog(log: InsertAuditLog) {
    await db.insert(auditLogs).values(log);
  }

  async getAuditLogs(limit = 50) {
    return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }

  async getAdminStats(adminId: string) {
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
