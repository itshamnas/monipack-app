# monipack - Product Catalogue

## Overview
A production-ready, SEO-friendly product catalogue for "monipack" packaging company. Features Google OAuth + email OTP authentication, role-based admin panel, product/category/banner CRUD management, and WhatsApp inquiry integration (no payment processing).

## Recent Changes
- 2026-02-09: Full frontend rewrite - all pages now use real API calls via TanStack Query instead of mock data
- 2026-02-09: Admin panel pages complete: Dashboard, Products, Categories, Banners (SUPER_ADMIN), Admin Users (SUPER_ADMIN)
- 2026-02-09: Auth flow: Login → OTP verification → role-based dashboard
- 2026-02-09: Cart context with localStorage persistence and WhatsApp inquiry generation

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
- **Backend**: Express.js (v5), Passport.js (Google OAuth), express-session
- **Database**: PostgreSQL with Drizzle ORM
- **File uploads**: multer → /uploads directory

### Key Files
- `shared/schema.ts` - Drizzle schema (admins, products, categories, banners, audit_logs, otp_codes)
- `server/storage.ts` - Storage interface with Drizzle queries
- `server/auth.ts` - Authentication routes (Google OAuth, dev-login, OTP verification, session)
- `server/routes.ts` - Public and admin CRUD API routes
- `server/db.ts` - Database connection
- `client/src/lib/types.ts` - TypeScript types for frontend
- `client/src/App.tsx` - Router with public and admin route groups
- `client/src/hooks/useAuth.ts` - Authentication hook
- `client/src/context/CartContext.tsx` - Cart state with localStorage

### Role System
- **SUPER_ADMIN**: Full access - manage banners, admin users, all products/categories
- **ADMIN**: Can only manage their own products and categories

### Environment Variables
- `SUPER_ADMIN_EMAIL` - Admin login email (set by developer, e.g. itshamnas@gmail.com)
- `ADMIN_PIN` - 6-digit PIN for admin login (set by developer, default: 123456)
- `WHATSAPP_NUMBER` - WhatsApp number for inquiry messages
- `SESSION_SECRET` - Express session secret (stored as secret)
- `DATABASE_URL` - PostgreSQL connection string (auto-set)

### API Structure
Public: GET /api/products, /api/products/:slug, /api/categories, /api/categories/:slug, /api/banners
Auth: POST /api/auth/dev-login, /api/auth/verify-otp, /api/auth/request-otp, GET /api/auth/google, /api/auth/session, POST /api/auth/logout
Admin: GET/POST/PATCH /api/admin/products, /api/admin/categories, /api/admin/banners, /api/admin/admins, GET /api/admin/stats, /api/admin/audit-logs, POST /api/admin/upload
