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
  createdBy: number | null;
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
  createdBy: number | null;
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
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: number;
  email: string;
  name: string;
  googleId: string | null;
  role: "SUPER_ADMIN" | "ADMIN";
  isActive: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  adminId: number | null;
  action: string;
  entity: string;
  entityId: number | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AuthSession {
  authenticated: boolean;
  pendingOtp?: boolean;
  admin?: {
    adminId: number;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN";
    otpVerified: boolean;
  };
}
