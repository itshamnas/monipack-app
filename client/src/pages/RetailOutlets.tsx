import { useQuery } from "@tanstack/react-query";
import type { RetailOutlet } from "@/lib/types";
import { MapPin, Clock, Phone, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiJson } from "@/lib/api";

export default function RetailOutlets() {
  const { data: outlets = [], isLoading } = useQuery<RetailOutlet[]>({
    queryKey: ["retail-outlets"],
    queryFn: () => apiJson<RetailOutlet[]>("/api/retail-outlets"),
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-bold mb-4">Our Retail Outlets</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Visit our retail outlets across Oman to explore our full range of packaging products.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 rounded-lg" />)}
        </div>
      ) : outlets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outlets.map((outlet) => (
            <Card key={outlet.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-outlet-${outlet.id}`}>
              {outlet.image && (
                <div className="aspect-video relative">
                  <img src={outlet.image} alt={outlet.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="font-heading text-xl font-semibold mb-4">{outlet.name}</h3>
                <div className="space-y-3 text-muted-foreground">
                  {outlet.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary shrink-0" />
                      <a href={`tel:${outlet.phone}`} className="hover:text-primary transition-colors">{outlet.phone}</a>
                    </div>
                  )}
                  {outlet.hours && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary shrink-0" />
                      <span>{outlet.hours}</span>
                    </div>
                  )}
                  {outlet.mapUrl && (
                    <Button asChild variant="outline" className="w-full mt-4" data-testid={`button-map-${outlet.id}`}>
                      <a href={outlet.mapUrl} target="_blank" rel="noopener noreferrer">
                        <MapPin className="h-4 w-4 mr-2" />
                        View on Google Maps
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-muted/30 rounded-lg">
          <h3 className="font-heading text-xl font-semibold mb-2">No retail outlets listed yet</h3>
          <p className="text-muted-foreground">Check back soon for our outlet locations.</p>
        </div>
      )}
    </div>
  );
}
