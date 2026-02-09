import { MapPin, Package, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const warehouses = [
  {
    id: 1,
    name: "Monipack Central Warehouse",
    address: "Rusayl Industrial Estate, Muscat, Oman",
    capacity: "50,000+ sq ft",
    features: "Temperature-controlled, 24/7 operations",
  },
  {
    id: 2,
    name: "Monipack South Warehouse",
    address: "Free Zone, Salalah, Oman",
    capacity: "30,000+ sq ft",
    features: "Export-ready, customs clearance",
  },
];

export default function Warehouses() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-bold mb-4">Our Warehouses</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Strategically located warehouses ensuring timely delivery of packaging solutions across the region.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {warehouses.map((wh) => (
          <Card key={wh.id} className="hover:shadow-lg transition-shadow" data-testid={`card-warehouse-${wh.id}`}>
            <CardContent className="p-8">
              <h3 className="font-heading text-2xl font-semibold mb-6">{wh.name}</h3>
              <div className="space-y-4 text-muted-foreground">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>{wh.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-primary shrink-0" />
                  <span>{wh.capacity}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary shrink-0" />
                  <span>{wh.features}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
