import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuthSession } from "@/lib/types";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useQuery<AuthSession>({
    queryKey: ["auth-session"],
    queryFn: () => fetch("/api/auth/session").then(r => r.json()),
    staleTime: 60000,
  });

  const logoutMutation = useMutation({
    mutationFn: () => fetch("/api/auth/logout", { method: "POST" }).then(r => r.json()),
    onSuccess: () => {
      queryClient.setQueryData(["auth-session"], { authenticated: false });
      queryClient.invalidateQueries({ queryKey: ["auth-session"] });
    },
  });

  return {
    session,
    isLoading,
    isAuthenticated: session?.authenticated || false,
    isPendingOtp: session?.pendingOtp || false,
    admin: session?.admin,
    isSuperAdmin: session?.admin?.role === "SUPER_ADMIN",
    logout: logoutMutation.mutate,
  };
}
