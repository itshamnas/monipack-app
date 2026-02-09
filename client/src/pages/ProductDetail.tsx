import { PRODUCTS, CATEGORIES } from "@/lib/mock-data";
import { ProductCard } from "@/components/ui/ProductCard";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ShoppingCart, Check, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import NotFound from "./not-found";

export default function ProductDetail() {
  const params = useParams();
  const product = PRODUCTS.find(p => p.id === params.id);
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  if (!product) return <NotFound />;

  const category = CATEGORIES.find(c => c.slug === product.category);
  const relatedProducts = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
         <Link href="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Catalogue
         </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div className="space-y-4">
           <div className="aspect-square bg-muted rounded-xl overflow-hidden border">
              <img 
                src={product.images[activeImage]} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
           </div>
           <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-border'}`}
                >
                   <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
           </div>
        </div>
        
        {/* Info */}
        <div className="flex flex-col">
           <div className="mb-2">
              <Link href={`/category/${category?.slug}`} className="text-primary font-medium text-sm uppercase tracking-wider hover:underline">
                 {category?.name}
              </Link>
           </div>
           <h1 className="font-heading text-4xl font-bold mb-2 text-balance">{product.name}</h1>
           <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded text-muted-foreground">P/N: {product.partNumber}</span>
              {product.inStock ? (
                <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                  <Check className="h-3 w-3 mr-1" /> In Stock
                </Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
           </div>
           
           {product.price && (
             <div className="text-3xl font-bold text-primary mb-6">
               ${product.price.toFixed(2)}
             </div>
           )}
           
           <div className="prose text-muted-foreground mb-8">
             <p>{product.description}</p>
           </div>
           
           <div className="mt-auto p-6 bg-muted/30 rounded-xl border border-border/50">
              <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                 <Package className="h-4 w-4" /> Add to Inquiry
              </h3>
              <div className="flex gap-4">
                 <div className="w-24">
                   <Input 
                     type="number" 
                     min="1" 
                     value={qty} 
                     onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                     className="bg-background"
                   />
                 </div>
                 <Button 
                   className="flex-1" 
                   size="lg"
                   disabled={!product.inStock}
                   onClick={() => addToCart(product, qty)}
                 >
                   <ShoppingCart className="mr-2 h-4 w-4" /> 
                   {product.inStock ? "Add to Cart" : "Unavailable"}
                 </Button>
              </div>
           </div>
        </div>
      </div>
      
      {/* Related */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="font-heading text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
             {relatedProducts.map(p => (
               <ProductCard key={p.id} product={p} />
             ))}
          </div>
        </section>
      )}
    </div>
  );
}
