import type { Product } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Eye } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const mainImage = product.images?.[0] || "/images/packaging_1.jpg";

  return (
    <Card className="group overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300 border-none bg-card/50">
      <div className="relative aspect-square overflow-hidden bg-muted/20">
        <img src={mainImage} alt={product.name} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
        {product.isActive ? (
          product.isFeatured && <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">Featured</Badge>
        ) : (
          <Badge variant="destructive" className="absolute top-2 right-2">Inactive</Badge>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Link href={`/products/${product.slug}`}>
            <Button variant="secondary" size="icon" className="rounded-full h-10 w-10"><Eye className="h-5 w-5" /></Button>
          </Link>
          {product.isActive && (
            <Button size="icon" className="rounded-full h-10 w-10" onClick={() => addToCart(product, 1)} data-testid={`add-to-cart-${product.id}`}>
              <ShoppingCart className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      <CardContent className="p-4 flex-1">
        <div className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">{product.partNumber}</div>
        <Link href={`/products/${product.slug}`} className="hover:underline decoration-primary underline-offset-4">
          <h3 className="font-heading font-semibold text-lg leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        {product.price && (
          <div className="font-medium text-lg text-primary">${parseFloat(product.price).toFixed(2)}</div>
        )}
      </CardContent>
    </Card>
  );
}
