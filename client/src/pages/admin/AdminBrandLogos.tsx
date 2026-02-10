import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { BrandLogo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/ui/image-upload";
import { apiJson, apiFetch } from "@/lib/api";
import { Save, ImageIcon } from "lucide-react";

const BRAND_COLORS: Record<string, { bg: string; border: string; accent: string }> = {
  moniclean: { bg: "bg-blue-50", border: "border-blue-200", accent: "text-blue-600" },
  monifood: { bg: "bg-green-50", border: "border-green-200", accent: "text-green-600" },
  monipack: { bg: "bg-red-50", border: "border-red-200", accent: "text-red-600" },
};

const BRAND_ORDER = ["moniclean", "monifood", "monipack"];

export default function AdminBrandLogos() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: logos = [], isLoading } = useQuery<BrandLogo[]>({
    queryKey: ["brand-logos"],
    queryFn: () => apiJson<BrandLogo[]>("/api/brand-logos"),
  });

  const sortedLogos = BRAND_ORDER.map(key => logos.find(l => l.brandKey === key)).filter(Boolean) as BrandLogo[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Brand Logos</h1>
        <p className="text-muted-foreground mt-1">Upload and manage the three brand logos displayed on the homepage.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedLogos.map(logo => (
            <BrandLogoCard key={logo.brandKey} logo={logo} />
          ))}
        </div>
      )}
    </div>
  );
}

function BrandLogoCard({ logo }: { logo: BrandLogo }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const colors = BRAND_COLORS[logo.brandKey] || BRAND_COLORS.monipack;

  const [name, setName] = useState(logo.name);
  const [description, setDescription] = useState(logo.description || "");
  const [image, setImage] = useState(logo.image || "");
  const [isDirty, setIsDirty] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body: any = { name, description };
      if (image) body.image = image;

      const res = await apiFetch(`/api/admin/brand-logos/${logo.brandKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Save failed"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-logos"] });
      setIsDirty(false);
      toast({ title: `${name} updated successfully` });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleImageChange = (urls: string[]) => {
    setImage(urls[0] || "");
    setIsDirty(true);
  };

  return (
    <Card className={`overflow-hidden border ${colors.border}`}>
      <div className={`${colors.bg} p-6 flex flex-col items-center`}>
        {image ? (
          <div className="w-32 h-32 flex items-center justify-center">
            <img src={image} alt={name} className="max-w-full max-h-full object-contain" />
          </div>
        ) : (
          <div className="w-32 h-32 flex items-center justify-center border-2 border-dashed rounded-xl border-muted-foreground/30">
            <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <CardContent className="p-5 space-y-4">
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Brand Name</Label>
          <Input
            value={name}
            onChange={e => { setName(e.target.value); setIsDirty(true); }}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</Label>
          <Textarea
            value={description}
            onChange={e => { setDescription(e.target.value); setIsDirty(true); }}
            className="mt-1"
            rows={3}
          />
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Logo Image</Label>
          <ImageUpload
            value={image ? [image] : []}
            onChange={handleImageChange}
            maxFiles={1}
            className="mt-1"
          />
        </div>
        <Button
          className="w-full gap-2"
          onClick={() => saveMutation.mutate()}
          disabled={!isDirty || saveMutation.isPending}
        >
          <Save className="h-4 w-4" />
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
