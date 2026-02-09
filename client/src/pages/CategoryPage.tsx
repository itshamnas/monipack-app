import { PRODUCTS, CATEGORIES } from "@/lib/mock-data";
import { ProductCard } from "@/components/ui/ProductCard";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import NotFound from "./not-found";

export default function CategoryPage() {
  const params = useParams();
  const category = CATEGORIES.find(c => c.slug === params.slug);

  if (!category) return <NotFound />;

  const products = PRODUCTS.filter(p => p.category === category.slug);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
         <Link href="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to All Products
         </Link>
      </div>

      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="font-heading text-4xl font-bold mb-4">{category.name}</h1>
        <p className="text-muted-foreground text-lg">{category.description}</p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
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
