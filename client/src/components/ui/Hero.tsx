import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-muted/30">
      <div className="container mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 mb-6">
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
          <Link href="/category/custom-boxes">
             <Button variant="outline" size="lg" className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm">
                Custom Solutions
             </Button>
          </Link>
        </div>
      </div>
      
      {/* Abstract Background Element */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
