import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import type { Banner } from "@/lib/types";

function StaticHero() {
  return (
    <section className="relative overflow-hidden bg-muted/30">
      <div className="container mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-primary/10 text-primary mb-6">
          Premium Packaging Solutions
        </div>
        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 max-w-4xl text-brand-gradient">
          Quality Packaging for Modern Brands
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Secure, sustainable, and stylish packaging solutions tailored for your business needs.
          From industrial shipping to retail display.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/products">
            <Button size="lg" className="h-12 px-8 text-base">
              Browse Catalogue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

export function Hero({ banners = [] }: { banners?: Banner[] }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [banners.length, next]);

  if (banners.length === 0) {
    return <StaticHero />;
  }

  const banner = banners[current];

  return (
    <section className="relative overflow-hidden bg-black" data-testid="hero-carousel">
      <div className="relative w-full aspect-[16/7] md:aspect-[16/6]">
        {banners.map((b, i) => (
          <div
            key={b.id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <img
              src={b.image}
              alt={b.title}
              className="w-full h-full object-cover"
              data-testid={`banner-image-${b.id}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
        ))}

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 md:pb-16 text-center z-10 px-4">
          <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white mb-3 max-w-4xl drop-shadow-lg" data-testid="banner-title">
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mb-6 drop-shadow" data-testid="banner-subtitle">
              {banner.subtitle}
            </p>
          )}
          {banner.linkUrl && (
            <Link href={banner.linkUrl}>
              <Button size="lg" className="h-12 px-8 text-base" data-testid="banner-cta">
                View More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {banners.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 transition-colors"
              data-testid="carousel-prev"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 transition-colors"
              data-testid="carousel-next"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? "bg-white w-6" : "bg-white/50 hover:bg-white/70"}`}
                  data-testid={`carousel-dot-${i}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
