import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Layers, Users, TrendingUp, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import type { AuditLog } from "@/lib/types";
import { apiJson } from "@/lib/api";

interface AdminStat {
  admin: { id: string; email: string; role: string; active: boolean };
  stats: { totalProducts: number; activeProducts: number; disabledProducts: number; categoriesManaged: number };
}

export default function AdminDashboard() {
  const { admin, isSuperAdmin } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => apiJson("/api/admin/stats"),
  });

  const { data: auditLogs = [] } = useQuery<AuditLog[]>({
    queryKey: ["admin-audit-logs"],
    queryFn: () => apiJson<AuditLog[]>("/api/admin/audit-logs"),
  });

  const globalStats = isSuperAdmin ? stats?.global : null;
  const personalStats = isSuperAdmin ? null : stats?.personal;
  const adminStats: AdminStat[] = isSuperAdmin ? stats?.adminStats || [] : [];
  const maxProducts = Math.max(...adminStats.map((a: AdminStat) => a.stats.totalProducts), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {admin?.email}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-products">{globalStats?.totalProducts ?? personalStats?.totalProducts ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                {globalStats ? `${globalStats.activeProducts} active` : `${personalStats?.activeProducts ?? 0} active`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{isSuperAdmin ? "All Categories" : "Your Categories"}</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats?.totalCategories ?? personalStats?.categoriesManaged ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                {globalStats ? `${globalStats.activeCategories} active` : "managed by you"}
              </p>
            </CardContent>
          </Card>

          {isSuperAdmin && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admins</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{globalStats?.totalAdmins ?? 0}</div>
                <p className="text-xs text-muted-foreground">Registered administrators</p>
              </CardContent>
            </Card>
          )}

          {isSuperAdmin && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats.filter((a: AdminStat) => a.admin.active).length}</div>
                <p className="text-xs text-muted-foreground">
                  {adminStats.filter((a: AdminStat) => !a.admin.active).length} disabled
                </p>
              </CardContent>
            </Card>
          )}

          {!isSuperAdmin && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disabled Products</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{personalStats?.disabledProducts ?? 0}</div>
                <p className="text-xs text-muted-foreground">Products turned off</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {isSuperAdmin && !isLoading && adminStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Products Uploaded by Each Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-admin-products">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Admin</th>
                    <th className="text-left py-3 px-2 font-medium">Role</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                    <th className="text-center py-3 px-2 font-medium">Total</th>
                    <th className="text-center py-3 px-2 font-medium">Active</th>
                    <th className="text-center py-3 px-2 font-medium">Disabled</th>
                    <th className="text-center py-3 px-2 font-medium">Categories</th>
                    <th className="text-left py-3 px-2 font-medium hidden md:table-cell">Upload Share</th>
                  </tr>
                </thead>
                <tbody>
                  {adminStats.map((item: AdminStat) => (
                    <tr key={item.admin.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors" data-testid={`row-admin-${item.admin.id}`}>
                      <td className="py-3 px-2">
                        <span className="font-medium">{item.admin.email}</span>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant={item.admin.role === "SUPER_ADMIN" ? "default" : "secondary"} className="text-xs">
                          {item.admin.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        {item.admin.active ? (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-300 bg-green-50">
                            <UserCheck className="h-3 w-3 mr-1" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-red-600 border-red-300 bg-red-50">
                            <UserX className="h-3 w-3 mr-1" /> Disabled
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="font-bold text-base">{item.stats.totalProducts}</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="text-green-600 font-medium">{item.stats.activeProducts}</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="text-red-600 font-medium">{item.stats.disabledProducts}</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="font-medium">{item.stats.categoriesManaged}</span>
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Progress value={(item.stats.totalProducts / maxProducts) * 100} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground w-8 text-right">
                            {globalStats?.totalProducts ? Math.round((item.stats.totalProducts / globalStats.totalProducts) * 100) : 0}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            {auditLogs.length > 0 ? (
              <div className="space-y-4">
                {auditLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center gap-4 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{log.action}</p>
                      <p className="text-muted-foreground">{log.metaJson?.email || log.metaJson?.name || ""}</p>
                    </div>
                    <div className="text-muted-foreground text-xs">{new Date(log.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No recent activity</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/admin/products"
              className="h-20 w-full flex flex-col items-center justify-center gap-2 rounded-md border border-input bg-background text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              data-testid="link-manage-products"
            >
              <Package className="h-6 w-6" /> Manage Products
            </Link>
            <Link href="/admin/categories"
              className="h-20 w-full flex flex-col items-center justify-center gap-2 rounded-md border border-input bg-background text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              data-testid="link-manage-categories"
            >
              <Layers className="h-6 w-6" /> Manage Categories
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
