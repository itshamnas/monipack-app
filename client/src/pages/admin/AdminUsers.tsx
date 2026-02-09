import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Admin } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { apiJson, apiFetch } from "@/lib/api";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isResetPinOpen, setIsResetPinOpen] = useState(false);
  const [resetPinAdmin, setResetPinAdmin] = useState<Admin | null>(null);
  const [form, setForm] = useState({ email: "", pin: "" });
  const [resetPin, setResetPin] = useState("");

  const { data: admins = [], isLoading, isError, error } = useQuery<Admin[]>({
    queryKey: ["admin-users"],
    queryFn: () => apiJson<Admin[]>("/api/admin/users"),
  });

  const createMutation = useMutation({
    mutationFn: async (data: { email: string; pin: string }) => {
      const res = await apiFetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Create failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setIsCreateOpen(false);
      setForm({ email: "", pin: "" });
      toast({ title: "Admin created successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await apiFetch(`/api/admin/users/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Toggle failed");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const resetPinMutation = useMutation({
    mutationFn: async ({ id, pin }: { id: string; pin: string }) => {
      const res = await apiFetch(`/api/admin/users/${id}/pin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "PIN reset failed");
      }
      return res.json();
    },
    onSuccess: () => {
      setIsResetPinOpen(false);
      setResetPin("");
      setResetPinAdmin(null);
      toast({ title: "PIN updated successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const openResetPin = (admin: Admin) => {
    setResetPinAdmin(admin);
    setResetPin("");
    setIsResetPinOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-heading text-3xl font-bold" data-testid="text-title">Admin Users</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-admin"><Plus className="mr-2 h-4 w-4" /> Create Admin</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Admin User</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="admin@example.com"
                  required
                  data-testid="input-create-email"
                />
              </div>
              <div>
                <Label>6-Digit PIN *</Label>
                <Input
                  type="password"
                  value={form.pin}
                  onChange={e => setForm(p => ({ ...p, pin: e.target.value.replace(/\D/g, "") }))}
                  placeholder="Enter 6-digit PIN"
                  maxLength={6}
                  className="text-center tracking-widest text-lg"
                  required
                  data-testid="input-create-pin"
                />
                <p className="text-xs text-muted-foreground mt-1">This PIN will be used by the admin to log in</p>
              </div>
              {createMutation.isError && (
                <p className="text-sm text-destructive" data-testid="text-create-error">
                  {(createMutation.error as Error)?.message || "Create failed"}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={createMutation.isPending || form.pin.length !== 6} data-testid="button-create-admin">
                {createMutation.isPending ? "Creating..." : "Create Admin"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isResetPinOpen} onOpenChange={setIsResetPinOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset PIN for {resetPinAdmin?.email}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (resetPinAdmin) resetPinMutation.mutate({ id: resetPinAdmin.id, pin: resetPin });
          }} className="space-y-4">
            <div>
              <Label>New 6-Digit PIN *</Label>
              <Input
                type="password"
                value={resetPin}
                onChange={e => setResetPin(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter new 6-digit PIN"
                maxLength={6}
                className="text-center tracking-widest text-lg"
                required
                data-testid="input-reset-pin"
              />
            </div>
            {resetPinMutation.isError && (
              <p className="text-sm text-destructive" data-testid="text-reset-error">
                {(resetPinMutation.error as Error)?.message || "Reset failed"}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={resetPinMutation.isPending || resetPin.length !== 6} data-testid="button-reset-pin">
              {resetPinMutation.isPending ? "Resetting..." : "Reset PIN"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {isError ? (
        <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-center" data-testid="text-error-list">
          <p className="text-destructive font-medium">Failed to load admin users</p>
          <p className="text-sm text-muted-foreground mt-1">{(error as Error)?.message || "Unknown error"}</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id} data-testid={`row-admin-${admin.id}`}>
                  <TableCell className="font-medium" data-testid={`text-email-${admin.id}`}>{admin.email}</TableCell>
                  <TableCell>
                    <Badge variant={admin.role === "SUPER_ADMIN" ? "default" : "secondary"} data-testid={`badge-role-${admin.id}`}>{admin.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {admin.role !== "SUPER_ADMIN" ? (
                      <Switch
                        checked={admin.active}
                        onCheckedChange={(checked) => toggleMutation.mutate({ id: admin.id, active: checked })}
                        data-testid={`switch-active-${admin.id}`}
                      />
                    ) : (
                      <Badge variant="outline" className="text-green-600">Always Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : "Never"}
                  </TableCell>
                  <TableCell>
                    {admin.role !== "SUPER_ADMIN" && (
                      <Button variant="outline" size="sm" onClick={() => openResetPin(admin)} data-testid={`button-reset-pin-${admin.id}`}>
                        <KeyRound className="mr-1 h-3 w-3" /> Reset PIN
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
