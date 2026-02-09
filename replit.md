# monipack - Product Catalogue

## Overview
A production-ready, SEO-friendly product catalogue for "monipack" packaging company. Features email + 6-digit PIN authentication with per-user PINs, role-based admin panel (SUPER_ADMIN / ADMIN), product/category/banner CRUD management, and WhatsApp inquiry integration (no payment processing).

## Recent Changes
- 2026-02-09: WhatsApp inquiry enhanced - product deep links, category, improved message format
- 2026-02-09: Share button added to ProductCard and ProductDetail (clipboard + native share)
- 2026-02-09: PDF export for inquiry list (jspdf + jspdf-autotable) with company header
- 2026-02-09: "Send PDF via WhatsApp" button with download fallback
- 2026-02-09: WhatsApp number set to +96879062219
- 2026-02-09: Added Retail Outlets and Warehouses modules (DB tables, CRUD API, admin pages, public pages)
- 2026-02-09: Search bar moved from Header to Products page only
- 2026-02-09: Navigation updated: Home, Products, Retail Outlets, Warehouses, Contact Us, Career
- 2026-02-09: Complete auth system rewrite - per-user bcrypt-hashed PINs, UUID-based admin IDs
- 2026-02-09: Removed Google OAuth and email OTP completely
- 2026-02-09: New admin user management: create admin with email+PIN, reset PIN, enable/disable
- 2026-02-09: Database schema restructured: admins/audit_logs use UUID PKs, removed otp_codes table
- 2026-02-09: All admin fetch calls use apiFetch/apiJson with credentials: "include"

## User Preferences
- Design: "Rich Red" branding theme (HSL 345 80% 45%)
- Fonts: Plus Jakarta Sans for headings, Inter for body text
- Mobile-first responsive design
- WhatsApp inquiry system instead of checkout/payment
- Products require minimum 3 images
- Categories and banners accept optional single images

## Project Architecture

### Stack
- **Frontend**: React + Vite + TypeScript, TanStack Query, wouter routing, shadcn/ui components, Tailwind CSS
- **Backend**: Express.js (v5), bcrypt for PIN hashing, express-session with connect-pg-simple
- **Database**: PostgreSQL with Drizzle ORM
- **File uploads**: multer → /uploads directory

### Key Files
- `shared/schema.ts` - Drizzle schema (admins [uuid], products, categories, banners, retail_outlets, warehouses, audit_logs [uuid])
- `server/storage.ts` - Storage interface with Drizzle queries
- `server/auth.ts` - Authentication (email+PIN with bcrypt, session management)
- `server/routes.ts` - Public and admin CRUD API routes + admin user management
- `server/db.ts` - Database connection (pg Pool + Drizzle)
- `client/src/lib/types.ts` - TypeScript types for frontend
- `client/src/lib/api.ts` - API helpers (apiFetch, apiJson) with credentials: "include"
- `client/src/App.tsx` - Router with public and admin route groups
- `client/src/hooks/useAuth.ts` - Authentication hook
- `client/src/context/CartContext.tsx` - Cart state with localStorage

### Auth System
- SUPER_ADMIN: auto-provisioned from SUPER_ADMIN_EMAIL + SUPER_ADMIN_PIN env vars
- ADMIN: created by SUPER_ADMIN via /api/admin/users with their own email + bcrypt-hashed PIN
- Session: HttpOnly cookie via connect-pg-simple, 24h expiry

### Role System
- **SUPER_ADMIN**: Full access - manage banners, retail outlets, warehouses, admin users, all products/categories, audit logs
- **ADMIN**: Can only manage products and categories (their own products only)

### Environment Variables
- `SUPER_ADMIN_EMAIL` - Super admin email (e.g. itshamnas@gmail.com)
- `SUPER_ADMIN_PIN` - Super admin 6-digit PIN (bcrypt hashed on first use)
- `ADMIN_PIN` - Fallback PIN if SUPER_ADMIN_PIN not set
- `WHATSAPP_NUMBER` - WhatsApp number for inquiry messages
- `SESSION_SECRET` - Express session secret (stored as secret)
- `DATABASE_URL` - PostgreSQL connection string (auto-set)

### API Structure
Public: GET /api/products, /api/products/:slug, /api/categories, /api/categories/:slug, /api/banners, /api/retail-outlets, /api/warehouses, /api/config
Auth: POST /api/auth/login, GET /api/auth/session, POST /api/auth/logout
Admin: GET/POST/PATCH /api/admin/products, /api/admin/categories, /api/admin/banners
Admin Outlets/Warehouses (SUPER_ADMIN): GET/POST/PATCH/DELETE /api/admin/retail-outlets, /api/admin/warehouses
Admin Users (SUPER_ADMIN only): GET/POST /api/admin/users, PUT /api/admin/users/:id/pin, PUT /api/admin/users/:id/status
Stats: GET /api/admin/stats, /api/admin/audit-logs
Upload: POST /api/admin/upload
