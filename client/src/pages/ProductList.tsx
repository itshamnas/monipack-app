import { PRODUCTS, CATEGORIES } from "@/lib/mock-data";
import { ProductCard } from "@/components/ui/ProductCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function ProductList() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialSearch = searchParams.get("search") || "";
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.partNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2">Product Catalogue</h1>
          <p className="text-muted-foreground">Browse our complete range of packaging solutions.</p>
        </div>
        
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-64">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
               placeholder="Search by name or P/N..." 
               className="pl-9"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            <Button 
               variant={selectedCategory === "all" ? "default" : "outline"} 
               onClick={() => setSelectedCategory("all")}
               className="whitespace-nowrap"
            >
              All
            </Button>
            {CATEGORIES.map(cat => (
               <Button 
                 key={cat.id}
                 variant={selectedCategory === cat.slug ? "default" : "outline"} 
                 onClick={() => setSelectedCategory(cat.slug)}
                 className="whitespace-nowrap"
               >
                 {cat.name}
               </Button>
            ))}
          </div>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-muted/30 rounded-lg">
           <h3 className="font-heading text-xl font-semibold mb-2">No products found</h3>
           <p className="text-muted-foreground">Try adjusting your search or filter.</p>
           <Button variant="link" onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}>Clear all filters</Button>
        </div>
      )}
    </div>
  );
}
