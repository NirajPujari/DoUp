"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  LogOut,
  Sun,
  Moon,
  User,
  Pencil,
  Check,
  X,
  RepeatIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setUser(data.user);
      setNameInput(data.user.name);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveName = async () => {
    if (!nameInput.trim() || nameInput.trim() === user?.name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      if (!res.ok) throw new Error("Failed to update name");
      const data = await res.json();
      setUser(data.user);
      setEditingName(false);
      toast.success("Name updated!");
      router.refresh();
    } catch {
      toast.error("Failed to update name");
    } finally {
      setSavingName(false);
    }
  };

  const handleCancelEdit = () => {
    setNameInput(user?.name ?? "");
    setEditingName(false);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-6 pt-12 px-4 animate-pulse">
        <div className="h-24 w-24 rounded-3xl bg-muted/40 mx-auto" />
        <div className="h-8 w-48 bg-muted/40 rounded-xl mx-auto" />
        <div className="h-5 w-64 bg-muted/30 rounded-xl mx-auto" />
      </div>
    );
  }

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-lg mx-auto px-4 py-12 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center space-y-5 text-center">
        <div className="h-24 w-24 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 ring-4 ring-primary/10">
          <span className="text-primary-foreground text-3xl font-black tracking-tight">
            {initials}
          </span>
        </div>

        {/* Editable name */}
        {editingName ? (
          <div className="flex items-center gap-2 w-full max-w-xs">
            <Input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
                if (e.key === "Escape") handleCancelEdit();
              }}
              className="h-12 rounded-2xl text-center text-xl font-bold bg-muted/30 border-muted/60"
            />
            <Button
              size="icon"
              className="h-10 w-10 rounded-xl shrink-0"
              onClick={handleSaveName}
              disabled={savingName}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-xl shrink-0"
              onClick={handleCancelEdit}
              disabled={savingName}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight">{user?.name}</h1>
            <button
              onClick={() => setEditingName(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              aria-label="Edit name"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4 shrink-0" />
          <span className="text-sm font-semibold">{user?.email}</span>
        </div>
      </div>

      {/* Manage Features */}
      <Link
        href="/profile/repetitive"
        className="flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 border-muted/40 bg-muted/10 hover:border-muted/70 hover:bg-muted/20 hover:scale-[1.02]"
      >
        <div
          className={cn(
            "h-12 w-12 rounded-xl border flex items-center justify-center shadow-md",
            theme === "light"
              ? "bg-white border-zinc-200"
              : "bg-zinc-900 border-zinc-700",
          )}
        >
          <RepeatIcon className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-bold text-foreground">
            Repetitive Tasks
          </h3>
          <p className="text-xs font-semibold text-muted-foreground mt-0.5">
            Manage your recurring habits
          </p>
        </div>
      </Link>

      {/* Theme Switcher */}
      <div className="glass-morphism rounded-3xl p-6 space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Appearance
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTheme("light")}
            className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 ${
              theme === "light"
                ? "border-primary bg-primary/5 scale-[1.02] shadow-lg"
                : "border-muted/40 bg-muted/10 hover:border-muted/70 hover:bg-muted/20"
            }`}
          >
            <div className="h-12 w-12 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shadow-md">
              <Sun className="h-5 w-5 text-amber-500" />
            </div>
            <span
              className={`text-sm font-bold ${theme === "light" ? "text-primary" : "text-muted-foreground"}`}
            >
              Light
            </span>
          </button>

          <button
            onClick={() => setTheme("dark")}
            className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 ${
              theme === "dark"
                ? "border-primary bg-primary/5 scale-[1.02] shadow-lg"
                : "border-muted/40 bg-muted/10 hover:border-muted/70 hover:bg-muted/20"
            }`}
          >
            <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center shadow-md">
              <Moon className="h-5 w-5 text-indigo-400" />
            </div>
            <span
              className={`text-sm font-bold ${theme === "dark" ? "text-primary" : "text-muted-foreground"}`}
            >
              Dark
            </span>
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <Button
        variant="destructive"
        className="w-full h-12 rounded-2xl font-bold flex items-center gap-2"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}
