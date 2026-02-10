export interface Product {
  id: number;
  name: string;
  slug: string;
  partNumber: string;
  description: string;
  price: string | null;
  categoryId: number | null;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  image: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  active: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface AuditLog {
  id: string;
  actorAdminId: string | null;
  action: string;
  metaJson: any;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface RetailOutlet {
  id: number;
  name: string;
  image: string | null;
  mapUrl: string | null;
  phone: string | null;
  hours: string | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: number;
  name: string;
  image: string | null;
  mapUrl: string | null;
  phone: string | null;
  hours: string | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrandLogo {
  id: number;
  brandKey: string;
  name: string;
  description: string | null;
  image: string | null;
  updatedAt: string;
}

export interface CareerPost {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string | null;
  applyEmail: string | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  authenticated: boolean;
  admin?: {
    adminId: string;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN";
  };
}
