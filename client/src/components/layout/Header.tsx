import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const [location] = useLocation();
  const { cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">Home</Link>
                <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">Products</Link>
                <Link href="/retail-outlets" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">Retail Outlets</Link>
                <Link href="/warehouses" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">Warehouses</Link>
                <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">Contact Us</Link>
                <Link href="/career" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">Career</Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="font-heading font-bold text-2xl tracking-tighter text-primary">monipack</Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
          <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">Products</Link>
          <Link href="/retail-outlets" className="text-muted-foreground hover:text-primary transition-colors">Retail Outlets</Link>
          <Link href="/warehouses" className="text-muted-foreground hover:text-primary transition-colors">Warehouses</Link>
          <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link>
          <Link href="/career" className="text-muted-foreground hover:text-primary transition-colors">Career</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative" data-testid="button-cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full">{cartCount}</Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
