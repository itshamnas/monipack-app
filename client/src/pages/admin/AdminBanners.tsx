import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Banner } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminBanners() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ title: "", subtitle: "", image: "", linkUrl: "", sortOrder: 0, isActive: true });

  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ["admin-banners"],
    queryFn: () => fetch("/api/admin/banners").then(r => r.json()),
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editingBanner ? `/api/admin/banners/${editingBanner.id}` : "/api/admin/banners";
      const method = editingBanner ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Save failed"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: editingBanner ? "Banner updated" : "Banner created" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({ title: "Banner deleted" });
    },
  });

  const resetForm = () => {
    setForm({ title: "", subtitle: "", image: "", linkUrl: "", sortOrder: 0, isActive: true });
    setEditingBanner(null);
  };

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setForm({ title: banner.title, subtitle: banner.subtitle || "", image: banner.image, linkUrl: banner.linkUrl || "", sortOrder: banner.sortOrder, isActive: banner.isActive });
    setIsDialogOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const formData = new FormData();
    formData.append("images", files[0]);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    if (res.ok) {
      const { urls } = await res.json();
      setForm(prev => ({ ...prev, image: urls[0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ ...form, subtitle: form.subtitle || undefined, linkUrl: form.linkUrl || undefined });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-heading text-3xl font-bold">Banners Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Banner</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingBanner ? "Edit Banner" : "Add Banner"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
              <div><Label>Subtitle</Label><Input value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} /></div>
              <div>
                <Label>Image *</Label>
                <div className="flex gap-2 items-center mt-1">
                  {form.image && <img src={form.image} alt="" className="w-24 h-16 rounded object-cover border" />}
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>Upload</Button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </div>
              <div><Label>Link URL</Label><Input value={form.linkUrl} onChange={e => setForm(p => ({ ...p, linkUrl: e.target.value }))} placeholder="/products" /></div>
              <div><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} /></div>
              <div className="flex items-center gap-2"><Switch checked={form.isActive} onCheckedChange={v => setForm(p => ({ ...p, isActive: v }))} /><Label>Active</Label></div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : editingBanner ? "Update Banner" : "Create Banner"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2].map(i => <Skeleton key={i} className="h-48" />)}</div>
      ) : banners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden">
              <div className="aspect-[16/7] relative">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold text-lg">{banner.title}</h3>
                  {banner.subtitle && <p className="text-white/80 text-sm">{banner.subtitle}</p>}
                </div>
              </div>
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Switch checked={banner.isActive} onCheckedChange={(checked) => saveMutation.mutate({ ...banner, isActive: checked })} />
                  <span className="text-sm text-muted-foreground">{banner.isActive ? "Active" : "Inactive"}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(banner)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(banner.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">No banners yet. Create one to show on the homepage.</p>
        </div>
      )}
    </div>
  );
}
