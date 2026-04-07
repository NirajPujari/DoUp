"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      
      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-linear-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="w-full max-w-md space-y-8 glass-morphism p-8 rounded-3xl shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">DoUp</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your day</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl text-md font-semibold mt-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" /> : "Sign In"}
          </Button>
        </form>

        <div className="text-center text-sm pt-4">
          <span className="text-muted-foreground text-md font-semibold">Don&apos;t have an account? </span>
          <Link href="/register" className="font-semibold text-md text-primary hover:underline underline-offset-4">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
