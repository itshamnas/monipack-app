import { useQuery } from "@tanstack/react-query";
import type { Product, Category } from "@/lib/types";
import { ProductCard } from "@/components/ui/ProductCard";
import { useParams, Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryPage() {
  const params = useParams();

  const { data: category, isLoading: loadingCat } = useQuery<Category>({
    queryKey: ["category", params.slug],
    queryFn: () => fetch(`/api/categories/${params.slug}`).then(r => { if (!r.ok) throw new Error("Not found"); return r.json(); }),
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["products", "category", params.slug],
    queryFn: () => fetch(`/api/products?category=${params.slug}`).then(r => r.json()),
    enabled: !!category,
  });

  if (loadingCat) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto mb-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="aspect-square rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="font-heading text-2xl font-bold mb-2">Category not found</h1>
        <Link href="/products" className="text-primary hover:underline">Browse all products</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to All Products
        </Link>
      </div>
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="font-heading text-4xl font-bold mb-4">{category.name}</h1>
        {category.description && <p className="text-muted-foreground text-lg">{category.description}</p>}
      </div>
      {loadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="aspect-square rounded-lg" />)}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="text-center py-24 bg-muted/30 rounded-lg">
          <h3 className="font-heading text-xl font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground">There are no products currently listed in this category.</p>
        </div>
      )}
    </div>
  );
}
