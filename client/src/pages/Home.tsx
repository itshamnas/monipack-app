import { useQuery } from "@tanstack/react-query";
import type { Category, Banner } from "@/lib/types";
import { Hero } from "@/components/ui/Hero";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, ShieldCheck, Leaf, Package, Eye, Target, Phone, ChevronRight } from "lucide-react";
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
    <div className="flex flex-col">
      <Hero banners={banners} />

      <section className="container mx-auto px-4 py-20" data-testid="section-hero-intro">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-4">Welcome to Monipack</span>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Empowering Oman With Quality Products{" "}
            <span className="text-primary">Since 2009</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto leading-relaxed mb-8">
            Morooj Nizwa International LLC is an Omani company dedicated to delivering reliable cleaning, food, and packaging solutions. We focus on quality, service excellence, and consistent supply across the market.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/products">
              <Button size="lg" className="h-12 px-8 text-base gap-2">
                Explore Products <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base gap-2">
                <Phone className="h-4 w-4" /> Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground py-12" data-testid="section-stats">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold font-heading">15+</div>
              <div className="text-sm mt-1 text-primary-foreground/80">Years of Experience</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold font-heading">3</div>
              <div className="text-sm mt-1 text-primary-foreground/80">Trusted Brands</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold font-heading">5000+</div>
              <div className="text-sm mt-1 text-primary-foreground/80">Products Available</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold font-heading">Oman</div>
              <div className="text-sm mt-1 text-primary-foreground/80">Wide Coverage</div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20" data-testid="section-about">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div>
            <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-3">About Us</span>
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6">A Trusted Name in Oman's Supply Chain</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Morooj Nizwa International LLC, established in 2009, provides a wide range of essential products for households, businesses, retail stores, and industries across Oman.
              </p>
              <p>
                Our commitment is centered on reliability, consistent availability, and strong logistics support through our warehouses and retail outlets strategically located across the country.
              </p>
              <p>
                We proudly operate three specialized brands — MoniClean, MoniFood, and MoniPack — each designed to meet the specific needs of our diverse customer base.
              </p>
            </div>
            <div className="flex gap-4 mt-8">
              <Link href="/retail-outlets">
                <Button variant="outline" size="sm" className="gap-1">
                  Our Outlets <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/warehouses">
                <Button variant="outline" size="sm" className="gap-1">
                  Warehouses <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-6">
                <img src="/images/moniclean-logo.png" alt="MoniClean" className="w-full object-contain" />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center p-6">
                <img src="/images/monifood-logo.png" alt="MoniFood" className="w-full object-contain" />
              </div>
            </div>
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl overflow-hidden aspect-square bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center p-6">
                <img src="/images/monipack-logo.png" alt="MoniPack" className="w-full object-contain" />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-6">
                <img src="/images/mni-logo.png" alt="MNI" className="w-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-20" data-testid="section-categories">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-3">Our Products</span>
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">Shop by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse our complete range of cleaning, food, and packaging products.
            </p>
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`}>
                  <Card
                    className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full"
                    data-testid={`card-category-${cat.id}`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <span className="text-5xl text-primary/30 font-heading font-bold">{cat.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-heading font-bold text-lg mb-1">{cat.name}</h3>
                      {cat.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
                      )}
                      <div className="flex items-center gap-1 text-primary text-sm font-medium mt-3 group-hover:gap-2 transition-all">
                        View Products <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">No categories yet. Check back soon!</p>
          )}

          <div className="text-center mt-10">
            <Link href="/products">
              <Button size="lg" className="gap-2">
                Browse All Products <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20" data-testid="section-brands">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-3">Our Portfolio</span>
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">Our Brands</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three specialized brands, each designed for everyday excellence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
              <CardContent className="p-8 text-center">
                <div className="w-28 h-28 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 rounded-2xl bg-blue-50 flex items-center justify-center p-4">
                  <img src="/images/moniclean-logo.png" alt="MoniClean" className="w-full h-full object-contain" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-3">MoniClean</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Cleaning and hygiene essentials designed for everyday use in homes, offices, and commercial spaces.</p>
              </CardContent>
            </Card>

            <Card className="border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
              <CardContent className="p-8 text-center">
                <div className="w-28 h-28 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 rounded-2xl bg-green-50 flex items-center justify-center p-4">
                  <img src="/images/monifood-logo.png" alt="MoniFood" className="w-full h-full object-contain" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-3">MoniFood</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Safe, high-quality food products sourced and distributed for homes, restaurants, and businesses.</p>
              </CardContent>
            </Card>

            <Card className="border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <CardContent className="p-8 text-center">
                <div className="w-28 h-28 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 rounded-2xl bg-red-50 flex items-center justify-center p-4">
                  <img src="/images/monipack-logo.png" alt="MoniPack" className="w-full h-full object-contain" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-3">MoniPack</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Reliable packaging solutions for retail, catering, industrial, and commercial needs.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-20" data-testid="section-why-choose">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-3">Our Strengths</span>
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">Why Choose Monipack?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We deliver more than products — we deliver trust and reliability.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300 text-center group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <Truck className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">Fast Delivery</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Quick turnaround on all orders with reliable logistics across Oman.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300 text-center group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">Quality Guaranteed</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Premium materials and rigorous quality checks on every product.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300 text-center group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <Leaf className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">Eco-Friendly</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Environmentally responsible choices for a sustainable future.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300 text-center group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <Package className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">One-Stop Supplier</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Cleaning, food, and packaging — everything you need in one place.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20" data-testid="section-vision-mission">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-3">Our Purpose</span>
            <h2 className="font-heading text-2xl md:text-3xl font-bold">Vision & Mission</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="h-1 bg-primary" />
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Eye className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold">Our Vision</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed text-base">
                  To become a leading supplier in Oman by delivering dependable, innovative, and sustainable consumer and packaging solutions that enhance everyday life.
                </p>
              </CardContent>
            </Card>

            <Card className="border shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="h-1 bg-primary" />
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Target className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold">Our Mission</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed text-base">
                  To serve customers with excellence through high-quality products, efficient operations, and continuous improvement while building lasting partnerships across Oman.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground py-16" data-testid="section-cta">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">Ready to Partner With Us?</h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8 text-lg">
            Whether you're a retailer, business, or individual — we're here to supply what you need.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/products">
              <Button size="lg" variant="secondary" className="h-12 px-8 text-base gap-2">
                Browse Products <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="https://api.whatsapp.com/send?phone=96879062219" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp Us
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
