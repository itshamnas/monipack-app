import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Package, Layers, Image, Users, LogOut, Menu, Shield, Store, Warehouse, MessageSquare, Palette, Trash2, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, admin, isSuperAdmin, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!isAuthenticated) {
    if (location !== "/admin/login") {
      window.location.href = "/admin/login";
      return null;
    }
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    setLocation("/admin/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") return location === "/admin";
    return location.startsWith(href);
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, show: true },
    { href: "/admin/products", label: "Products", icon: Package, show: true },
    { href: "/admin/categories", label: "Categories", icon: Layers, show: true },
    { href: "/admin/banners", label: "Banners", icon: Image, show: isSuperAdmin },
    { href: "/admin/retail-outlets", label: "Retail Outlets", icon: Store, show: isSuperAdmin },
    { href: "/admin/warehouses", label: "Warehouses", icon: Warehouse, show: isSuperAdmin },
    { href: "/admin/brand-logos", label: "Brand Logos", icon: Palette, show: isSuperAdmin },
    { href: "/admin/career-posts", label: "Career Posts", icon: Briefcase, show: isSuperAdmin },
    { href: "/admin/admin-users", label: "Admin Users", icon: Users, show: isSuperAdmin },
    { href: "/admin/messages", label: "Messages", icon: MessageSquare, show: isSuperAdmin },
    { href: "/admin/deleted-items", label: "Deleted Items", icon: Trash2, show: isSuperAdmin },
  ];

  const NavItems = () => (
    <>
      <div className="px-3 py-4">
        <a href="/" className="block mb-1"><img src="/images/monipack-logo-clean.png" alt="monipack" className="h-8 w-auto" /></a>
        <Badge variant={isSuperAdmin ? "default" : "secondary"} className="text-xs">
          <Shield className="h-3 w-3 mr-1" />{admin?.role}
        </Badge>
      </div>
      <div className="px-3 py-2 space-y-1">
        {navItems.filter(n => n.show).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center w-full rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive(href)
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <Icon className="mr-2 h-4 w-4" />{label}
          </Link>
        ))}
      </div>
      <div className="mt-auto p-4 border-t">
        <p className="text-xs text-muted-foreground mb-2 truncate">{admin?.email}</p>
        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout} data-testid="button-logout">
          <LogOut className="mr-2 h-4 w-4" />Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-muted/10">
      <aside className="hidden md:flex w-64 flex-col border-r bg-card h-screen sticky top-0 z-40" style={{ pointerEvents: "auto" }}>
        <NavItems />
      </aside>
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-card flex items-center px-4 z-50">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild><Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button></SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 flex flex-col"><NavItems /></SheetContent>
        </Sheet>
        <span className="font-heading font-bold ml-4">Admin Panel</span>
      </div>
      <main className="flex-1 p-6 md:p-8 mt-16 md:mt-0 overflow-auto relative z-10">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
