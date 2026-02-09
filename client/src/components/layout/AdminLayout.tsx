import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Settings, 
  LogOut, 
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock auth check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("monipack-admin-auth");
    if (!isAuthenticated && location !== "/admin/login") {
      setLocation("/admin/login");
    }
  }, [location, setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("monipack-admin-auth");
    setLocation("/admin/login");
  };

  const NavItems = () => (
    <>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-primary">
          monipack Admin
        </h2>
        <div className="space-y-1">
          <Link href="/admin">
            <Button variant={location === "/admin" ? "secondary" : "ghost"} className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/products">
            <Button variant={location === "/admin/products" ? "secondary" : "ghost"} className="w-full justify-start">
              <Package className="mr-2 h-4 w-4" />
              Products
            </Button>
          </Link>
          <Link href="/admin/categories">
            <Button variant={location === "/admin/categories" ? "secondary" : "ghost"} className="w-full justify-start">
              <Layers className="mr-2 h-4 w-4" />
              Categories
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant={location === "/admin/settings" ? "secondary" : "ghost"} className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-auto p-4">
         <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
         </Button>
      </div>
    </>
  );

  if (location === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-muted/10">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card h-screen sticky top-0">
        <NavItems />
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-card flex items-center px-4 z-50">
         <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 flex flex-col">
               <NavItems />
            </SheetContent>
         </Sheet>
         <span className="font-heading font-bold ml-4">Admin Panel</span>
      </div>

      <main className="flex-1 p-6 md:p-8 mt-16 md:mt-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
