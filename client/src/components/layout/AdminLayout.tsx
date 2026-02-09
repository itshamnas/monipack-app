import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Package, Layers, Image, Users, LogOut, Menu, Shield
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
    if (location !== "/admin/login" && location !== "/admin/verify-otp") {
      window.location.href = "/admin/login";
      return null;
    }
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    setLocation("/admin/login");
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, show: true },
    { href: "/admin/products", label: "Products", icon: Package, show: true },
    { href: "/admin/categories", label: "Categories", icon: Layers, show: true },
    { href: "/admin/banners", label: "Banners", icon: Image, show: isSuperAdmin },
    { href: "/admin/admins", label: "Admin Users", icon: Users, show: isSuperAdmin },
  ];

  const NavItems = () => (
    <>
      <div className="px-3 py-4">
        <Link href="/" className="font-heading font-bold text-xl tracking-tighter text-primary block mb-1">monipack</Link>
        <Badge variant={isSuperAdmin ? "default" : "secondary"} className="text-xs">
          <Shield className="h-3 w-3 mr-1" />{admin?.role}
        </Badge>
      </div>
      <div className="px-3 py-2 space-y-1">
        {navItems.filter(n => n.show).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Button
              variant={location === href ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Icon className="mr-2 h-4 w-4" />{label}
            </Button>
          </Link>
        ))}
      </div>
      <div className="mt-auto p-4 border-t">
        <p className="text-xs text-muted-foreground mb-2 truncate">{admin?.email}</p>
        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-muted/10">
      <aside className="hidden md:flex w-64 flex-col border-r bg-card h-screen sticky top-0"><NavItems /></aside>
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-card flex items-center px-4 z-50">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild><Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button></SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 flex flex-col"><NavItems /></SheetContent>
        </Sheet>
        <span className="font-heading font-bold ml-4">Admin Panel</span>
      </div>
      <main className="flex-1 p-6 md:p-8 mt-16 md:mt-0 overflow-auto">{children}</main>
      <Toaster />
    </div>
  );
}
