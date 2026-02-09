import { Briefcase, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const openings = [
  {
    id: 1,
    title: "Sales Executive",
    department: "Sales",
    location: "Muscat, Oman",
    type: "Full-time",
  },
  {
    id: 2,
    title: "Warehouse Supervisor",
    department: "Operations",
    location: "Salalah, Oman",
    type: "Full-time",
  },
  {
    id: 3,
    title: "Delivery Driver",
    department: "Logistics",
    location: "Muscat, Oman",
    type: "Full-time",
  },
];

export default function Career() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-bold mb-4">Career at Monipack</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Join our growing team and help us deliver top-quality packaging solutions across the region.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="font-heading text-2xl font-semibold mb-6">Current Openings</h2>
        <div className="space-y-4">
          {openings.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow" data-testid={`card-job-${job.id}`}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-heading text-lg font-semibold mb-2">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{job.department}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <Badge variant="secondary">{job.type}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button asChild data-testid={`button-apply-${job.id}`}>
                    <a href={`mailto:careers@monipack.com?subject=Application: ${job.title}`}>Apply Now</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12">
          <CardContent className="p-8 text-center">
            <h3 className="font-heading text-xl font-semibold mb-3">Don't see a role that fits?</h3>
            <p className="text-muted-foreground mb-6">
              We're always looking for talented people. Send us your CV and we'll keep you in mind for future opportunities.
            </p>
            <Button asChild variant="outline" data-testid="button-general-apply">
              <a href="mailto:careers@monipack.com?subject=General Application">Send Your CV</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
