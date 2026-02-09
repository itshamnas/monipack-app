import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@/lib/types";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const [location, setLocation] = useLocation();
  const { cartCount } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then(r => r.json()),
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q");
    if (query) { setLocation(`/products?search=${query}`); setIsSearchOpen(false); }
  };

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
                <div className="text-lg font-medium text-muted-foreground">Categories</div>
                <div className="pl-4 flex flex-col gap-2">
                  {categories.map((cat) => (
                    <Link key={cat.id} href={`/category/${cat.slug}`} onClick={() => setIsMobileMenuOpen(false)} className="text-foreground/80 hover:text-primary transition-colors">{cat.name}</Link>
                  ))}
                </div>
                <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium mt-2">All Products</Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="font-heading font-bold text-2xl tracking-tighter text-primary">monipack</Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm font-medium hover:text-primary transition-colors outline-none">Categories</DropdownMenuTrigger>
            <DropdownMenuContent>
              {categories.map((cat) => (
                <DropdownMenuItem key={cat.id} asChild><Link href={`/category/${cat.slug}`}>{cat.name}</Link></DropdownMenuItem>
              ))}
              <DropdownMenuItem asChild><Link href="/products">View All</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">Catalogue</Link>
        </nav>

        <div className="flex items-center gap-2">
          {isSearchOpen ? (
            <form onSubmit={handleSearch} className="absolute inset-x-0 top-0 h-16 bg-background flex items-center px-4 z-50 md:static md:w-64 md:h-auto md:p-0">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input name="q" placeholder="Search products..." className="pl-9 pr-8" autoFocus />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 md:hidden" onClick={() => setIsSearchOpen(false)}><X className="h-4 w-4" /></Button>
              </div>
            </form>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="md:hidden"><Search className="h-5 w-5" /></Button>
          )}
          <div className="hidden md:block w-64">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input name="q" placeholder="Search products..." className="pl-9 h-9" />
            </form>
          </div>
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
