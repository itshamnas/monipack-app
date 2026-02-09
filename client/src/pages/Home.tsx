import { CATEGORIES, PRODUCTS } from "@/lib/mock-data";
import { ProductCard } from "@/components/ui/ProductCard";
import { Hero } from "@/components/ui/Hero";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const featuredProducts = PRODUCTS.filter(p => p.featured);

  return (
    <div className="flex flex-col gap-16 pb-16">
      <Hero />
      
      {/* Categories */}
      <section className="container mx-auto px-4">
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8 flex items-center gap-2">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} href={`/category/${cat.slug}`}>
              <div className="group relative overflow-hidden rounded-lg aspect-[4/5] cursor-pointer bg-muted">
                <img 
                  src={cat.image} 
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                  <h3 className="text-white font-heading font-bold text-xl group-hover:translate-x-1 transition-transform">{cat.name}</h3>
                  <p className="text-white/80 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">{cat.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
           <h2 className="font-heading text-2xl md:text-3xl font-bold">Featured Products</h2>
           <Link href="/products">
             <Button variant="ghost" className="group">
               View All <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
             </Button>
           </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      
      {/* Value Props */}
      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-3xl my-8">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-4">
               <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="text-2xl">⚡</span>
               </div>
               <h3 className="font-heading font-bold text-lg mb-2">Fast Delivery</h3>
               <p className="text-muted-foreground">Quick turnaround on all standard orders.</p>
            </div>
            <div className="p-4">
               <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="text-2xl">🛡️</span>
               </div>
               <h3 className="font-heading font-bold text-lg mb-2">Quality Guaranteed</h3>
               <p className="text-muted-foreground">Premium materials for maximum protection.</p>
            </div>
            <div className="p-4">
               <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="text-2xl">🌱</span>
               </div>
               <h3 className="font-heading font-bold text-lg mb-2">Eco-Friendly</h3>
               <p className="text-muted-foreground">Sustainable options for a greener planet.</p>
            </div>
         </div>
      </section>
    </div>
  );
}
