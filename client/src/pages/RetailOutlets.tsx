import { MapPin, Clock, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const outlets = [
  {
    id: 1,
    name: "Monipack Muscat Outlet",
    address: "Al Khuwair, Muscat, Oman",
    phone: "+968 1234 5678",
    hours: "Sat–Thu: 8:00 AM – 8:00 PM",
  },
  {
    id: 2,
    name: "Monipack Salalah Outlet",
    address: "Al Saada, Salalah, Oman",
    phone: "+968 2345 6789",
    hours: "Sat–Thu: 8:00 AM – 8:00 PM",
  },
  {
    id: 3,
    name: "Monipack Sohar Outlet",
    address: "Industrial Area, Sohar, Oman",
    phone: "+968 3456 7890",
    hours: "Sat–Thu: 8:00 AM – 6:00 PM",
  },
];

export default function RetailOutlets() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-bold mb-4">Our Retail Outlets</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Visit our retail outlets across Oman to explore our full range of packaging products.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {outlets.map((outlet) => (
          <Card key={outlet.id} className="hover:shadow-lg transition-shadow" data-testid={`card-outlet-${outlet.id}`}>
            <CardContent className="p-6">
              <h3 className="font-heading text-xl font-semibold mb-4">{outlet.name}</h3>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>{outlet.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <span>{outlet.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary shrink-0" />
                  <span>{outlet.hours}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
