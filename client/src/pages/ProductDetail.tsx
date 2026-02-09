import { useQuery } from "@tanstack/react-query";
import type { Product, Category } from "@/lib/types";
import { ProductCard } from "@/components/ui/ProductCard";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ShoppingCart, Check, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiJson } from "@/lib/api";
import { ShareButton } from "@/components/ui/ShareButton";

export default function ProductDetail() {
  const params = useParams();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["product", params.slug],
    queryFn: () => apiJson<Product>(`/api/products/${params.slug}`),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => apiJson<Category[]>("/api/categories"),
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => apiJson<Product[]>("/api/products"),
    enabled: !!product,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="font-heading text-2xl font-bold mb-2">Product not found</h1>
        <Link href="/products"><Button>Back to Catalogue</Button></Link>
      </div>
    );
  }

  const category = categories.find(c => c.id === product.categoryId);
  const relatedProducts = allProducts.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Catalogue
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-xl overflow-hidden border">
            <img src={product.images?.[activeImage] || "/images/packaging_1.jpg"} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImage(idx)} className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-border'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {category && (
            <div className="mb-2">
              <Link href={`/category/${category.slug}`} className="text-primary font-medium text-sm uppercase tracking-wider hover:underline">{category.name}</Link>
            </div>
          )}
          <h1 className="font-heading text-4xl font-bold mb-2 text-balance">{product.name}</h1>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-mono bg-muted px-2 py-1 rounded text-muted-foreground">P/N: {product.partNumber}</span>
            {product.isActive ? (
              <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50"><Check className="h-3 w-3 mr-1" /> Available</Badge>
            ) : (
              <Badge variant="destructive">Unavailable</Badge>
            )}
          </div>
          {product.price && (
            <div className="text-3xl font-bold text-primary mb-6">${parseFloat(product.price).toFixed(2)}</div>
          )}
          <div className="prose text-muted-foreground mb-8"><p>{product.description}</p></div>
          <div className="mt-auto space-y-4">
            <div className="p-6 bg-muted/30 rounded-xl border border-border/50">
              <h3 className="font-heading font-semibold mb-4 flex items-center gap-2"><Package className="h-4 w-4" /> Add to Inquiry</h3>
              <div className="flex gap-4">
                <div className="w-24">
                  <Input type="number" min="1" value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 1)} className="bg-background" data-testid="input-quantity" />
                </div>
                <Button className="flex-1" size="lg" disabled={!product.isActive} onClick={() => addToCart(product, qty)} data-testid="button-add-to-cart">
                  <ShoppingCart className="mr-2 h-4 w-4" /> {product.isActive ? "Add to Cart" : "Unavailable"}
                </Button>
              </div>
            </div>
            <ShareButton product={product} variant="default" className="w-full" />
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section>
          <h2 className="font-heading text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
