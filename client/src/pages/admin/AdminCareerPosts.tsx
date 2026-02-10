import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CareerPost } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Plus, Trash2, Briefcase, MapPin, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { apiJson, apiFetch } from "@/lib/api";

const defaultForm = { title: "", department: "", location: "", type: "Full-time", description: "", applyEmail: "", isActive: true };

export default function AdminCareerPosts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CareerPost | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: posts = [], isLoading } = useQuery<CareerPost[]>({
    queryKey: ["admin-career-posts"],
    queryFn: () => apiJson<CareerPost[]>("/api/admin/career-posts"),
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editing ? `/api/admin/career-posts/${editing.id}` : "/api/admin/career-posts";
      const method = editing ? "PATCH" : "POST";
      const res = await apiFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Save failed"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-career-posts"] });
      queryClient.invalidateQueries({ queryKey: ["career-posts"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: editing ? "Career post updated" : "Career post created" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiFetch(`/api/admin/career-posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-career-posts"] });
      queryClient.invalidateQueries({ queryKey: ["career-posts"] });
      toast({ title: "Career post updated" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiFetch(`/api/admin/career-posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-career-posts"] });
      queryClient.invalidateQueries({ queryKey: ["career-posts"] });
      toast({ title: "Career post deleted" });
    },
  });

  const resetForm = () => {
    setForm(defaultForm);
    setEditing(null);
  };

  const openEdit = (post: CareerPost) => {
    setEditing(post);
    setForm({
      title: post.title,
      department: post.department,
      location: post.location,
      type: post.type,
      description: post.description || "",
      applyEmail: post.applyEmail || "",
      isActive: post.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      title: form.title,
      department: form.department,
      location: form.location,
      type: form.type,
      description: form.description || undefined,
      applyEmail: form.applyEmail || undefined,
      isActive: form.isActive,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-heading text-3xl font-bold" data-testid="text-career-title">Career Posts</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild><Button data-testid="button-add-career"><Plus className="mr-2 h-4 w-4" /> Add Career Post</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Edit Career Post" : "Add Career Post"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Job Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required data-testid="input-career-title" /></div>
              <div><Label>Department *</Label><Input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} required data-testid="input-career-department" /></div>
              <div><Label>Location *</Label><Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} required placeholder="e.g. Muscat, Oman" data-testid="input-career-location" /></div>
              <div>
                <Label>Job Type</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger data-testid="select-career-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} placeholder="Job description, requirements, etc." data-testid="input-career-description" /></div>
              <div><Label>Application Email</Label><Input type="email" value={form.applyEmail} onChange={e => setForm(p => ({ ...p, applyEmail: e.target.value }))} placeholder="hr@monipack.com" data-testid="input-career-email" /></div>
              <div className="flex items-center gap-2"><Switch checked={form.isActive} onCheckedChange={v => setForm(p => ({ ...p, isActive: v }))} /><Label>Active</Label></div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending} data-testid="button-save-career">
                {saveMutation.isPending ? "Saving..." : editing ? "Update Career Post" : "Create Career Post"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}</div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className={`overflow-hidden ${!post.isActive ? "opacity-60" : ""}`} data-testid={`admin-career-${post.id}`}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-heading text-lg font-semibold">{post.title}</h3>
                      {!post.isActive && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1"><Briefcase className="h-4 w-4" /><span>{post.department}</span></div>
                      <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /><span>{post.location}</span></div>
                      <div className="flex items-center gap-1"><Clock className="h-4 w-4" /><Badge variant="secondary">{post.type}</Badge></div>
                    </div>
                    {post.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.description}</p>}
                    {post.applyEmail && <p className="text-xs text-muted-foreground mt-1">Apply to: {post.applyEmail}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={post.isActive} onCheckedChange={(checked) => toggleMutation.mutate({ id: post.id, isActive: checked })} />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(post)} data-testid={`button-edit-career-${post.id}`}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(post.id)} data-testid={`button-delete-career-${post.id}`}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No career posts yet. Add one to display on the careers page.</p>
        </div>
      )}
    </div>
  );
}
