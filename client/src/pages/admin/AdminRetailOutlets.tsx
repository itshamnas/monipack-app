import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { RetailOutlet } from "@/lib/types";
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
import { ImageUpload } from "@/components/ui/image-upload";

export default function AdminRetailOutlets() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RetailOutlet | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ name: "", image: "", mapUrl: "", phone: "", hours: "", isActive: true });

  const { data: outlets = [], isLoading } = useQuery<RetailOutlet[]>({
    queryKey: ["admin-retail-outlets"],
    queryFn: () => apiJson<RetailOutlet[]>("/api/admin/retail-outlets"),
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editing ? `/api/admin/retail-outlets/${editing.id}` : "/api/admin/retail-outlets";
      const method = editing ? "PATCH" : "POST";
      const res = await apiFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Save failed"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-retail-outlets"] });
      queryClient.invalidateQueries({ queryKey: ["retail-outlets"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: editing ? "Outlet updated" : "Outlet created" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiFetch(`/api/admin/retail-outlets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Toggle failed"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-retail-outlets"] });
      queryClient.invalidateQueries({ queryKey: ["retail-outlets"] });
      toast({ title: "Outlet updated" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiFetch(`/api/admin/retail-outlets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-retail-outlets"] });
      queryClient.invalidateQueries({ queryKey: ["retail-outlets"] });
      toast({ title: "Outlet deleted" });
    },
  });

  const resetForm = () => {
    setForm({ name: "", image: "", mapUrl: "", phone: "", hours: "", isActive: true });
    setEditing(null);
  };

  const openEdit = (outlet: RetailOutlet) => {
    setEditing(outlet);
    setForm({
      name: outlet.name,
      image: outlet.image || "",
      mapUrl: outlet.mapUrl || "",
      phone: outlet.phone || "",
      hours: outlet.hours || "",
      isActive: outlet.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const formData = new FormData();
    formData.append("images", files[0]);
    const res = await apiFetch("/api/admin/upload", { method: "POST", body: formData });
    if (res.ok) {
      const { urls } = await res.json();
      setForm(prev => ({ ...prev, image: urls[0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      name: form.name,
      image: form.image || undefined,
      mapUrl: form.mapUrl || undefined,
      phone: form.phone || undefined,
      hours: form.hours || undefined,
      isActive: form.isActive,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-heading text-3xl font-bold">Retail Outlets</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Outlet</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Outlet" : "Add Outlet"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required data-testid="input-outlet-name" /></div>
              <div>
                <Label>Image</Label>
                <ImageUpload
                  value={form.image ? [form.image] : []}
                  onChange={(urls) => setForm((p) => ({ ...p, image: urls[0] || "" }))}
                  maxFiles={1}
                  className="mt-1"
                />
              </div>
              <div><Label>Google Maps URL</Label><Input value={form.mapUrl} onChange={e => setForm(p => ({ ...p, mapUrl: e.target.value }))} placeholder="https://maps.google.com/..." data-testid="input-outlet-map" /></div>
              <div><Label>Phone Number</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+968 1234 5678" data-testid="input-outlet-phone" /></div>
              <div><Label>Working Hours</Label><Input value={form.hours} onChange={e => setForm(p => ({ ...p, hours: e.target.value }))} placeholder="Sat-Thu 9:00 AM - 10:00 PM" data-testid="input-outlet-hours" /></div>
              <div className="flex items-center gap-2"><Switch checked={form.isActive} onCheckedChange={v => setForm(p => ({ ...p, isActive: v }))} /><Label>Active</Label></div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : editing ? "Update Outlet" : "Create Outlet"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2].map(i => <Skeleton key={i} className="h-48" />)}</div>
      ) : outlets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outlets.map((outlet) => (
            <Card key={outlet.id} className="overflow-hidden" data-testid={`admin-outlet-${outlet.id}`}>
              {outlet.image && (
                <div className="aspect-video relative">
                  <img src={outlet.image} alt={outlet.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{outlet.name}</h3>
                    {outlet.phone && <p className="text-sm text-muted-foreground">{outlet.phone}</p>}
                    {outlet.hours && <p className="text-sm text-muted-foreground">{outlet.hours}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(outlet)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(outlet.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Switch checked={outlet.isActive} onCheckedChange={(checked) => toggleMutation.mutate({ id: outlet.id, isActive: checked })} />
                  <span className="text-sm text-muted-foreground">{outlet.isActive ? "Active" : "Inactive"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">No retail outlets yet. Add one to display on the public page.</p>
        </div>
      )}
    </div>
  );
}
