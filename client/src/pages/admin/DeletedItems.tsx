import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, RotateCcw, Package, Layers, Image, Store, Warehouse, MessageSquare, Briefcase } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiJson, apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface DeletedData {
  products: any[];
  categories: any[];
  banners: any[];
  retailOutlets: any[];
  warehouses: any[];
  contactMessages: any[];
  careerPosts: any[];
}

export default function DeletedItems() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<DeletedData>({
    queryKey: ["admin-deleted"],
    queryFn: () => apiJson<DeletedData>("/api/admin/deleted"),
  });

  const restoreMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: number }) => {
      const res = await apiFetch(`/api/admin/restore/${type}/${id}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to restore");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Restored successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin-deleted"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => {
      toast({ title: "Failed to restore", variant: "destructive" });
    },
  });

  const totalDeleted = data
    ? data.products.length + data.categories.length + data.banners.length + data.retailOutlets.length + data.warehouses.length + data.contactMessages.length + data.careerPosts.length
    : 0;

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
          <Trash2 className="h-7 w-7 text-destructive" /> Deleted Items
        </h1>
        <p className="text-muted-foreground">{totalDeleted} items in trash. Data is preserved and can be restored.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : totalDeleted === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Trash2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-lg">No deleted items</p>
            <p className="text-muted-foreground text-sm mt-1">All your data is active and visible</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {data!.products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5" /> Deleted Products
                  <Badge variant="destructive" className="ml-2">{data!.products.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data!.products.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between border rounded-lg p-3 bg-muted/30" data-testid={`deleted-product-${item.id}`}>
                      <div className="flex items-center gap-3">
                        {item.images?.[0] && <img src={item.images[0]} alt="" className="w-10 h-10 rounded object-cover" />}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Part: {item.partNumber} | Deleted: {item.deletedAt ? formatDate(item.deletedAt) : "N/A"}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreMutation.mutate({ type: "product", id: item.id })}
                        disabled={restoreMutation.isPending}
                        data-testid={`restore-product-${item.id}`}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" /> Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {data!.categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Layers className="h-5 w-5" /> Deleted Categories
                  <Badge variant="destructive" className="ml-2">{data!.categories.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data!.categories.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between border rounded-lg p-3 bg-muted/30" data-testid={`deleted-category-${item.id}`}>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Deleted: {item.deletedAt ? formatDate(item.deletedAt) : "N/A"}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreMutation.mutate({ type: "category", id: item.id })}
                        disabled={restoreMutation.isPending}
                        data-testid={`restore-category-${item.id}`}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" /> Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {data!.banners.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Image className="h-5 w-5" /> Deleted Banners
                  <Badge variant="destructive" className="ml-2">{data!.banners.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data!.banners.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between border rounded-lg p-3 bg-muted/30" data-testid={`deleted-banner-${item.id}`}>
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt="" className="w-16 h-10 rounded object-cover" />
                        <div>
                          <p className="font-medium">{item.title || "Untitled Banner"}</p>
                          <p className="text-xs text-muted-foreground">Deleted: {item.deletedAt ? formatDate(item.deletedAt) : "N/A"}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreMutation.mutate({ type: "banner", id: item.id })}
                        disabled={restoreMutation.isPending}
                        data-testid={`restore-banner-${item.id}`}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" /> Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {data!.retailOutlets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Store className="h-5 w-5" /> Deleted Retail Outlets
                  <Badge variant="destructive" className="ml-2">{data!.retailOutlets.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data!.retailOutlets.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between border rounded-lg p-3 bg-muted/30" data-testid={`deleted-outlet-${item.id}`}>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Deleted: {item.deletedAt ? formatDate(item.deletedAt) : "N/A"}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreMutation.mutate({ type: "retail-outlet", id: item.id })}
                        disabled={restoreMutation.isPending}
                        data-testid={`restore-outlet-${item.id}`}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" /> Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {data!.warehouses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Warehouse className="h-5 w-5" /> Deleted Warehouses
                  <Badge variant="destructive" className="ml-2">{data!.warehouses.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data!.warehouses.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between border rounded-lg p-3 bg-muted/30" data-testid={`deleted-warehouse-${item.id}`}>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Deleted: {item.deletedAt ? formatDate(item.deletedAt) : "N/A"}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreMutation.mutate({ type: "warehouse", id: item.id })}
                        disabled={restoreMutation.isPending}
                        data-testid={`restore-warehouse-${item.id}`}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" /> Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {data!.contactMessages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5" /> Deleted Messages
                  <Badge variant="destructive" className="ml-2">{data!.contactMessages.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data!.contactMessages.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between border rounded-lg p-3 bg-muted/30" data-testid={`deleted-message-${item.id}`}>
                      <div>
                        <p className="font-medium">{item.subject}</p>
                        <p className="text-xs text-muted-foreground">From: {item.name} ({item.email}) | Deleted: {item.deletedAt ? formatDate(item.deletedAt) : "N/A"}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreMutation.mutate({ type: "contact-message", id: item.id })}
                        disabled={restoreMutation.isPending}
                        data-testid={`restore-message-${item.id}`}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" /> Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {data!.careerPosts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="h-5 w-5" /> Deleted Career Posts
                  <Badge variant="destructive" className="ml-2">{data!.careerPosts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data!.careerPosts.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between border rounded-lg p-3 bg-muted/30" data-testid={`deleted-career-${item.id}`}>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.department} - {item.location} | Deleted: {item.deletedAt ? formatDate(item.deletedAt) : "N/A"}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreMutation.mutate({ type: "career-post", id: item.id })}
                        disabled={restoreMutation.isPending}
                        data-testid={`restore-career-${item.id}`}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" /> Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
