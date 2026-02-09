import { useQuery } from "@tanstack/react-query";
import type { Category, Banner } from "@/lib/types";
import { Hero } from "@/components/ui/Hero";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { apiJson } from "@/lib/api";

export default function Home() {
  const { data: categories = [], isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => apiJson<Category[]>("/api/categories"),
  });

  const { data: banners = [] } = useQuery<Banner[]>({
    queryKey: ["banners"],
    queryFn: () => apiJson<Banner[]>("/api/banners"),
    staleTime: 0,
  });

  return (
    <div className="flex flex-col gap-16 pb-16">
      <Hero banners={banners} />

      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-2xl md:text-3xl font-bold">Our Categories</h2>
          <Link href="/products">
            <Button variant="ghost" className="group">
              All Products <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
        {loadingCategories ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Card
                key={cat.id}
                className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-card/50"
                data-testid={`card-category-${cat.id}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <span className="text-4xl text-primary/30 font-heading font-bold">{cat.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                  <h3 className="font-heading font-bold text-lg">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
                  )}
                  <Link href={`/category/${cat.slug}`}>
                    <Button variant="default" size="sm" className="mt-1 gap-1.5" data-testid={`button-view-category-${cat.id}`}>
                      View Products <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-12">No categories yet. Add some in the admin panel.</p>
        )}
      </section>

      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-3xl my-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-2xl">⚡</span></div>
            <h3 className="font-heading font-bold text-lg mb-2">Fast Delivery</h3>
            <p className="text-muted-foreground">Quick turnaround on all standard orders.</p>
          </div>
          <div className="p-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-2xl">🛡️</span></div>
            <h3 className="font-heading font-bold text-lg mb-2">Quality Guaranteed</h3>
            <p className="text-muted-foreground">Premium materials for maximum protection.</p>
          </div>
          <div className="p-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-2xl">🌱</span></div>
            <h3 className="font-heading font-bold text-lg mb-2">Eco-Friendly</h3>
            <p className="text-muted-foreground">Sustainable options for a greener planet.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
