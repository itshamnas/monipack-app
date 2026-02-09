import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Layers, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuditLog } from "@/lib/types";
import { apiJson } from "@/lib/api";

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
              <div className="text-2xl font-bold">{globalStats?.totalProducts ?? personalStats?.totalProducts ?? 0}</div>
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
                      <p className="font-medium">{log.action}: {log.entity}</p>
                      <p className="text-muted-foreground">{log.details}</p>
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
            <Link href="/admin/products">
              <Button variant="outline" className="h-20 w-full flex flex-col gap-2">
                <Package className="h-6 w-6" /> Manage Products
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="outline" className="h-20 w-full flex flex-col gap-2">
                <Layers className="h-6 w-6" /> Manage Categories
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
