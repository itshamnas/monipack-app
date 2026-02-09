import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuthSession } from "@/lib/types";
import { apiJson } from "@/lib/api";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useQuery<AuthSession>({
    queryKey: ["auth-session"],
    queryFn: () => apiJson<AuthSession>("/api/auth/session"),
    staleTime: 60000,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiJson("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.setQueryData(["auth-session"], { authenticated: false });
      queryClient.invalidateQueries({ queryKey: ["auth-session"] });
    },
  });

  return {
    session,
    isLoading,
    isAuthenticated: session?.authenticated || false,
    admin: session?.admin,
    isSuperAdmin: session?.admin?.role === "SUPER_ADMIN",
    logout: logoutMutation.mutate,
  };
}
