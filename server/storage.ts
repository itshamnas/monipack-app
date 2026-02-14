import { db } from "./db";
import { eq, desc, asc, ilike, and, or, sql } from "drizzle-orm";
import {
  admins,
  categories,
  products,
  banners,
  auditLogs,
  retailOutlets,
  warehouses,
  contactMessages,
  brandLogos,
  careerPosts,
  type Admin,
  type InsertAdmin,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Banner,
  type InsertBanner,
  type AuditLog,
  type InsertAuditLog,
  type RetailOutlet,
  type InsertRetailOutlet,
  type Warehouse,
  type InsertWarehouse,
  type BrandLogo,
  type InsertBrandLogo,
  type CareerPost,
  type InsertCareerPost,
  type ContactMessage,
  type InsertContactMessage,
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
  softDeleteBanner(id: number): Promise<void>;

  getAllRetailOutlets(includeInactive?: boolean): Promise<RetailOutlet[]>;
  getRetailOutletById(id: number): Promise<RetailOutlet | undefined>;
  createRetailOutlet(outlet: InsertRetailOutlet): Promise<RetailOutlet>;
  updateRetailOutlet(id: number, data: Partial<InsertRetailOutlet>): Promise<RetailOutlet | undefined>;
  deleteRetailOutlet(id: number): Promise<void>;
  softDeleteRetailOutlet(id: number): Promise<void>;

  getAllWarehouses(includeInactive?: boolean): Promise<Warehouse[]>;
  getWarehouseById(id: number): Promise<Warehouse | undefined>;
  createWarehouse(wh: InsertWarehouse): Promise<Warehouse>;
  updateWarehouse(id: number, data: Partial<InsertWarehouse>): Promise<Warehouse | undefined>;
  deleteWarehouse(id: number): Promise<void>;
  softDeleteWarehouse(id: number): Promise<void>;

  createAuditLog(log: InsertAuditLog): Promise<void>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;

  getAllBrandLogos(): Promise<BrandLogo[]>;
  getBrandLogoByKey(key: string): Promise<BrandLogo | undefined>;
  upsertBrandLogo(data: InsertBrandLogo): Promise<BrandLogo>;

  createContactMessage(msg: InsertContactMessage): Promise<ContactMessage>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  markContactMessageRead(id: number): Promise<void>;
  deleteContactMessage(id: number): Promise<void>;
  softDeleteContactMessage(id: number): Promise<void>;

  softDeleteProduct(id: number): Promise<void>;
  softDeleteCategory(id: number): Promise<void>;
  restoreProduct(id: number): Promise<void>;
  restoreCategory(id: number): Promise<void>;
  restoreBanner(id: number): Promise<void>;
  restoreRetailOutlet(id: number): Promise<void>;
  restoreWarehouse(id: number): Promise<void>;

  getAllCareerPosts(includeInactive?: boolean): Promise<CareerPost[]>;
  getCareerPostById(id: number): Promise<CareerPost | undefined>;
  createCareerPost(post: InsertCareerPost): Promise<CareerPost>;
  updateCareerPost(id: number, data: Partial<InsertCareerPost>): Promise<CareerPost | undefined>;
  softDeleteCareerPost(id: number): Promise<void>;
  restoreCareerPost(id: number): Promise<void>;

  restoreContactMessage(id: number): Promise<void>;
  getUnreadContactCount(): Promise<number>;

  getAdminStats(adminId: string): Promise<{
    totalProducts: number;
    activeProducts: number;
    disabledProducts: number;
    deletedProducts: number;
    categoriesManaged: number;
    deletedCategories: number;
  }>;

  getGlobalStats(): Promise<{
    totalProducts: number;
    activeProducts: number;
    deletedProducts: number;
    totalCategories: number;
    activeCategories: number;
    deletedCategories: number;
    totalBanners: number;
    deletedBanners: number;
    totalRetailOutlets: number;
    deletedRetailOutlets: number;
    totalWarehouses: number;
    deletedWarehouses: number;
    totalContactMessages: number;
    deletedContactMessages: number;
    totalAdmins: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getAdminById(id: string) {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin;
  }

  async getAdminByEmail(email: string) {
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email.toLowerCase()));
    return admin;
  }

  async getAllAdmins() {
    return db.select().from(admins).orderBy(asc(admins.createdAt));
  }

  // ✅ FIXED: keep ONLY ONE createAdmin, and no stray returns/braces
  async createAdmin(admin: InsertAdmin) {
    const [created] = await db
      .insert(admins)
      .values({ ...admin, email: admin.email.toLowerCase() })
      .returning();

    return created;
  }

  async updateAdmin(id: string, data: Partial<InsertAdmin>) {
    const [updated] = await db
      .update(admins)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(admins.id, id))
      .returning();
    return updated;
  }

  async updateLastLogin(id: string) {
    await db
      .update(admins)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(admins.id, id));
  }

  async getAllCategories(includeInactive = false) {
    if (includeInactive) {
      return db
        .select()
        .from(categories)
        .where(eq(categories.isDeleted, false))
        .orderBy(asc(categories.sortOrder));
    }
    return db
      .select()
      .from(categories)
      .where(and(eq(categories.isActive, true), eq(categories.isDeleted, false)))
      .orderBy(asc(categories.sortOrder));
  }

  async getCategoryById(id: number) {
    const [cat] = await db.select().from(categories).where(eq(categories.id, id));
    return cat;
  }

  async getCategoryBySlug(slug: string) {
    const [cat] = await db.select().from(categories).where(eq(categories.slug, slug));
    return cat;
  }

  // ✅ FIXED: this was missing in your file
  async createCategory(cat: InsertCategory) {
    const [created] = await db.insert(categories).values(cat).returning();
    return created;
  }

  async updateCategory(id: number, data: Partial<InsertCategory>) {
    const [updated] = await db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async getAllProducts(includeInactive = false) {
    if (includeInactive) {
      return db
        .select()
        .from(products)
        .where(eq(products.isDeleted, false))
        .orderBy(desc(products.createdAt));
    }
    return db
      .select()
      .from(products)
      .where(and(eq(products.isActive, true), eq(products.isDeleted, false)))
      .orderBy(desc(products.createdAt));
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
    return db
      .select()
      .from(products)
      .where(
        and(
          eq(products.categoryId, categoryId),
          eq(products.isActive, true),
          eq(products.isDeleted, false),
        ),
      )
      .orderBy(desc(products.createdAt));
  }

  async searchProducts(query: string, categoryId?: number) {
    const searchTerm = `%${query}%`;

    const matchingCats = await db
      .select({ id: categories.id })
      .from(categories)
      .where(ilike(categories.name, searchTerm));

    const catIds = matchingCats.map((c) => c.id);

    const conditions = [
      eq(products.isActive, true),
      eq(products.isDeleted, false),
      or(
        ilike(products.name, searchTerm),
        ilike(products.partNumber, searchTerm),
        ilike(products.description, searchTerm),
        ...(catIds.length > 0
          ? [
              sql`${products.categoryId} IN (${sql.join(
                catIds.map((id) => sql`${id}`),
                sql`, `,
              )})`,
            ]
          : []),
      ),
    ];

    if (categoryId !== undefined) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    return db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt));
  }

  async createProduct(product: InsertProduct) {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: number, data: Partial<InsertProduct>) {
    const [updated] = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async getProductsByAdmin(adminId: string) {
    return db
      .select()
      .from(products)
      .where(and(eq(products.createdBy, adminId), eq(products.isDeleted, false)))
      .orderBy(desc(products.createdAt));
  }

  async getAllBanners(includeInactive = false) {
    if (includeInactive) {
      return db
        .select()
        .from(banners)
        .where(eq(banners.isDeleted, false))
        .orderBy(asc(banners.sortOrder), desc(banners.createdAt));
    }
    return db
      .select()
      .from(banners)
      .where(and(eq(banners.isActive, true), eq(banners.isDeleted, false)))
      .orderBy(asc(banners.sortOrder), desc(banners.createdAt));
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
    const [updated] = await db
      .update(banners)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(banners.id, id))
      .returning();
    return updated;
  }

  async deleteBanner(id: number) {
    await this.softDeleteBanner(id);
  }

  async softDeleteBanner(id: number) {
    await db
      .update(banners)
      .set({ isDeleted: true, deletedAt: new Date(), isActive: false })
      .where(eq(banners.id, id));
  }

  async getAllRetailOutlets(includeInactive = false) {
    if (includeInactive) {
      return db
        .select()
        .from(retailOutlets)
        .where(eq(retailOutlets.isDeleted, false))
        .orderBy(desc(retailOutlets.createdAt));
    }
    return db
      .select()
      .from(retailOutlets)
      .where(and(eq(retailOutlets.isActive, true), eq(retailOutlets.isDeleted, false)))
      .orderBy(desc(retailOutlets.createdAt));
  }

  async getRetailOutletById(id: number) {
    const [outlet] = await db.select().from(retailOutlets).where(eq(retailOutlets.id, id));
    return outlet;
  }

  async createRetailOutlet(outlet: InsertRetailOutlet) {
    const [created] = await db.insert(retailOutlets).values(outlet).returning();
    return created;
  }

  async updateRetailOutlet(id: number, data: Partial<InsertRetailOutlet>) {
    const [updated] = await db
      .update(retailOutlets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(retailOutlets.id, id))
      .returning();
    return updated;
  }

  async deleteRetailOutlet(id: number) {
    await this.softDeleteRetailOutlet(id);
  }

  async softDeleteRetailOutlet(id: number) {
    await db
      .update(retailOutlets)
      .set({ isDeleted: true, deletedAt: new Date(), isActive: false })
      .where(eq(retailOutlets.id, id));
  }

  async getAllWarehouses(includeInactive = false) {
    if (includeInactive) {
      return db
        .select()
        .from(warehouses)
        .where(eq(warehouses.isDeleted, false))
        .orderBy(desc(warehouses.createdAt));
    }
    return db
      .select()
      .from(warehouses)
      .where(and(eq(warehouses.isActive, true), eq(warehouses.isDeleted, false)))
      .orderBy(desc(warehouses.createdAt));
  }

  async getWarehouseById(id: number) {
    const [wh] = await db.select().from(warehouses).where(eq(warehouses.id, id));
    return wh;
  }

  async createWarehouse(wh: InsertWarehouse) {
    const [created] = await db.insert(warehouses).values(wh).returning();
    return created;
  }

  async updateWarehouse(id: number, data: Partial<InsertWarehouse>) {
    const [updated] = await db
      .update(warehouses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(warehouses.id, id))
      .returning();
    return updated;
  }

  async deleteWarehouse(id: number) {
    await this.softDeleteWarehouse(id);
  }

  async softDeleteWarehouse(id: number) {
    await db
      .update(warehouses)
      .set({ isDeleted: true, deletedAt: new Date(), isActive: false })
      .where(eq(warehouses.id, id));
  }

  async createAuditLog(log: InsertAuditLog) {
    await db.insert(auditLogs).values(log);
  }

  async getAuditLogs(limit = 50) {
    return db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  async getAllBrandLogos() {
    return db.select().from(brandLogos);
  }

  async getBrandLogoByKey(key: string) {
    const [logo] = await db.select().from(brandLogos).where(eq(brandLogos.brandKey, key));
    return logo;
  }

  async upsertBrandLogo(data: InsertBrandLogo) {
    const existing = await this.getBrandLogoByKey(data.brandKey);

    if (existing) {
      const [updated] = await db
        .update(brandLogos)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(brandLogos.brandKey, data.brandKey))
        .returning();
      return updated;
    }

    const [created] = await db.insert(brandLogos).values(data).returning();
    return created;
  }

  async createContactMessage(msg: InsertContactMessage) {
    const [created] = await db.insert(contactMessages).values(msg).returning();
    return created;
  }

  async getAllContactMessages() {
    return db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.isDeleted, false))
      .orderBy(desc(contactMessages.createdAt));
  }

  async markContactMessageRead(id: number) {
    await db.update(contactMessages).set({ isRead: true }).where(eq(contactMessages.id, id));
  }

  async deleteContactMessage(id: number) {
    await this.softDeleteContactMessage(id);
  }

  async softDeleteContactMessage(id: number) {
    await db
      .update(contactMessages)
      .set({ isDeleted: true, deletedAt: new Date() })
      .where(eq(contactMessages.id, id));
  }

  async softDeleteProduct(id: number) {
    await db
      .update(products)
      .set({ isDeleted: true, deletedAt: new Date(), isActive: false, updatedAt: new Date() })
      .where(eq(products.id, id));
  }

  async softDeleteCategory(id: number) {
    await db
      .update(categories)
      .set({ isDeleted: true, deletedAt: new Date(), isActive: false, updatedAt: new Date() })
      .where(eq(categories.id, id));
  }

  async restoreProduct(id: number) {
    await db
      .update(products)
      .set({ isDeleted: false, deletedAt: null, isActive: true, updatedAt: new Date() })
      .where(eq(products.id, id));
  }

  async restoreCategory(id: number) {
    await db
      .update(categories)
      .set({ isDeleted: false, deletedAt: null, isActive: true, updatedAt: new Date() })
      .where(eq(categories.id, id));
  }

  async restoreBanner(id: number) {
    await db
      .update(banners)
      .set({ isDeleted: false, deletedAt: null, isActive: true, updatedAt: new Date() })
      .where(eq(banners.id, id));
  }

  async restoreRetailOutlet(id: number) {
    await db
      .update(retailOutlets)
      .set({ isDeleted: false, deletedAt: null, isActive: true, updatedAt: new Date() })
      .where(eq(retailOutlets.id, id));
  }

  async restoreWarehouse(id: number) {
    await db
      .update(warehouses)
      .set({ isDeleted: false, deletedAt: null, isActive: true, updatedAt: new Date() })
      .where(eq(warehouses.id, id));
  }

  async restoreContactMessage(id: number) {
    await db
      .update(contactMessages)
      .set({ isDeleted: false, deletedAt: null })
      .where(eq(contactMessages.id, id));
  }

  async getAllCareerPosts(includeInactive = false) {
    if (includeInactive) {
      return db
        .select()
        .from(careerPosts)
        .where(eq(careerPosts.isDeleted, false))
        .orderBy(desc(careerPosts.createdAt));
    }
    return db
      .select()
      .from(careerPosts)
      .where(and(eq(careerPosts.isActive, true), eq(careerPosts.isDeleted, false)))
      .orderBy(desc(careerPosts.createdAt));
  }

  async getCareerPostById(id: number) {
    const [post] = await db.select().from(careerPosts).where(eq(careerPosts.id, id));
    return post;
  }

  async createCareerPost(post: InsertCareerPost) {
    const [created] = await db.insert(careerPosts).values(post).returning();
    return created;
  }

  async updateCareerPost(id: number, data: Partial<InsertCareerPost>) {
    const [updated] = await db
      .update(careerPosts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(careerPosts.id, id))
      .returning();
    return updated;
  }

  async softDeleteCareerPost(id: number) {
    await db
      .update(careerPosts)
      .set({ isDeleted: true, deletedAt: new Date(), isActive: false })
      .where(eq(careerPosts.id, id));
  }

  async restoreCareerPost(id: number) {
    await db
      .update(careerPosts)
      .set({ isDeleted: false, deletedAt: null, isActive: true, updatedAt: new Date() })
      .where(eq(careerPosts.id, id));
  }

  async getUnreadContactCount() {
    const unread = await db
      .select()
      .from(contactMessages)
      .where(and(eq(contactMessages.isRead, false), eq(contactMessages.isDeleted, false)));
    return unread.length;
  }

  async getAdminStats(adminId: string) {
    const adminProducts = await db.select().from(products).where(eq(products.createdBy, adminId));
    const adminCategories = await db.select().from(categories).where(eq(categories.createdBy, adminId));

    const nonDeleted = adminProducts.filter((p) => !p.isDeleted);

    return {
      totalProducts: nonDeleted.length,
      activeProducts: nonDeleted.filter((p) => p.isActive).length,
      disabledProducts: nonDeleted.filter((p) => !p.isActive).length,
      deletedProducts: adminProducts.filter((p) => p.isDeleted).length,
      categoriesManaged: adminCategories.filter((c) => !c.isDeleted).length,
      deletedCategories: adminCategories.filter((c) => c.isDeleted).length,
    };
  }

  async getGlobalStats() {
    const allProducts = await db.select().from(products);
    const allCategories = await db.select().from(categories);
    const allBanners = await db.select().from(banners);
    const allOutlets = await db.select().from(retailOutlets);
    const allWarehouses = await db.select().from(warehouses);
    const allMessages = await db.select().from(contactMessages);
    const allAdmins = await db.select().from(admins);

    return {
      totalProducts: allProducts.filter((p) => !p.isDeleted).length,
      activeProducts: allProducts.filter((p) => p.isActive && !p.isDeleted).length,
      deletedProducts: allProducts.filter((p) => p.isDeleted).length,

      totalCategories: allCategories.filter((c) => !c.isDeleted).length,
      activeCategories: allCategories.filter((c) => c.isActive && !c.isDeleted).length,
      deletedCategories: allCategories.filter((c) => c.isDeleted).length,

      totalBanners: allBanners.filter((b) => !b.isDeleted).length,
      deletedBanners: allBanners.filter((b) => b.isDeleted).length,

      totalRetailOutlets: allOutlets.filter((o) => !o.isDeleted).length,
      deletedRetailOutlets: allOutlets.filter((o) => o.isDeleted).length,

      totalWarehouses: allWarehouses.filter((w) => !w.isDeleted).length,
      deletedWarehouses: allWarehouses.filter((w) => w.isDeleted).length,

      totalContactMessages: allMessages.filter((m) => !m.isDeleted).length,
      deletedContactMessages: allMessages.filter((m) => m.isDeleted).length,

      totalAdmins: allAdmins.length,
    };
  }
}

export const storage = new DatabaseStorage();
