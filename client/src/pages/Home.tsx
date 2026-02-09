import { useQuery } from "@tanstack/react-query";
import type { Category, Banner } from "@/lib/types";
import { Hero } from "@/components/ui/Hero";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Sparkles, Package, ShieldCheck, Truck, Leaf, Eye, Target } from "lucide-react";
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
    <div className="flex flex-col pb-16">
      <Hero banners={banners} />

      <section className="container mx-auto px-4 py-16 text-center" data-testid="section-hero-intro">
        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
          Empowering Oman With Quality Products <br className="hidden sm:block" />
          <span className="text-primary">Since 2009</span>
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
          Morooj Nizwa International LLC is an Omani company dedicated to delivering reliable consumer, food, and packaging solutions. We focus on quality, service excellence, and consistent supply across the market.
        </p>
      </section>

      <section className="bg-muted/30 py-16" data-testid="section-about">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6">About Us</h2>
            <div className="space-y-4 text-muted-foreground text-base md:text-lg leading-relaxed">
              <p>
                Morooj Nizwa International LLC, established in 2009, provides a wide range of essential products for households, businesses, retail stores, and industries.
              </p>
              <p>
                Our commitment is centered on reliability, consistent availability, and strong logistics support through our warehouses and retail outlets across Oman.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16" data-testid="section-categories">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Star className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Explore</span>
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">Shop by Categories</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our complete product range by category.
          </p>
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
          <p className="text-muted-foreground text-center py-12">No categories yet. Check back soon!</p>
        )}

        <div className="text-center mt-8">
          <Link href="/products">
            <Button variant="outline" size="lg" className="group">
              Browse All Products <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/5 py-16" data-testid="section-brands">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">Our Brands</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Trusted product lines designed for everyday excellence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="h-2 bg-blue-500" />
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2">MoniClean</h3>
                <p className="text-muted-foreground text-sm">Cleaning and hygiene essentials designed for everyday use.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="h-2 bg-green-500" />
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2">MoniFood</h3>
                <p className="text-muted-foreground text-sm">Safe, high-quality food products for homes and businesses.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="h-2 bg-primary" />
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2">MoniPack</h3>
                <p className="text-muted-foreground text-sm">Reliable packaging solutions for retail, catering, and industrial needs.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16" data-testid="section-why-choose">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">Why Choose Us?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We deliver more than products — we deliver trust and reliability.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300 text-center">
            <CardContent className="p-6">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Truck className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground text-sm">Quick turnaround on all standard orders.</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300 text-center">
            <CardContent className="p-6">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-7 w-7 text-blue-500" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">Quality Guaranteed</h3>
              <p className="text-muted-foreground text-sm">Premium-quality materials and consistent performance.</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300 text-center">
            <CardContent className="p-6">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-7 w-7 text-green-500" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">Eco-Friendly Options</h3>
              <p className="text-muted-foreground text-sm">Environmentally responsible choices for a sustainable future.</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300 text-center">
            <CardContent className="p-6">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="h-7 w-7 text-purple-500" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">One-Stop Supplier</h3>
              <p className="text-muted-foreground text-sm">Cleaning, food, and packaging — everything in one place.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-muted/30 py-16" data-testid="section-vision-mission">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-none shadow-md overflow-hidden">
              <div className="h-1.5 bg-primary" />
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="font-heading text-2xl font-bold">Vision</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  To become a leading supplier in Oman by delivering dependable, innovative, and sustainable consumer and packaging solutions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden">
              <div className="h-1.5 bg-primary" />
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="font-heading text-2xl font-bold">Mission</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  To serve customers with excellence through high-quality products, efficient operations, and continuous improvement.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
