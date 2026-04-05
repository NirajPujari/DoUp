"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Welcome back!");
        router.push("/");
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to log in");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8 glass p-8 rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary">Luminous Chronos</h1>
          <p className="mt-2 text-muted-foreground text-sm uppercase tracking-widest">Sign In to Continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-muted/50 border-none rounded-lg px-4 py-3 placeholder-muted-foreground focus:ring-2 focus:ring-primary transition-all outline-none"
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-muted/50 border-none rounded-lg px-4 py-3 placeholder-muted-foreground focus:ring-2 focus:ring-primary transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Log In"}
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
