import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function VerifyOtp() {
  const [, setLocation] = useLocation();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Verification failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-session"] });
      setLocation("/admin");
    },
    onError: (err: Error) => setError(err.message),
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/request-otp", { method: "POST" });
      if (!res.ok) throw new Error("Failed to resend");
      return res.json();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    verifyMutation.mutate(otp);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-heading font-bold text-primary">Verify OTP</CardTitle>
          <CardDescription>Check the server console for the 6-digit code (in production this would be sent to your email)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Enter 6-digit PIN"
              className="text-center text-2xl tracking-widest h-14"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              autoFocus
            />
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full h-12" disabled={verifyMutation.isPending || otp.length < 6}>
              {verifyMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Login"}
            </Button>
            <div className="flex justify-between">
              <Button variant="ghost" type="button" onClick={() => setLocation("/admin/login")}>Back to Login</Button>
              <Button variant="ghost" type="button" onClick={() => resendMutation.mutate()} disabled={resendMutation.isPending}>
                Resend Code
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
