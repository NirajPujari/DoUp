"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Save, UserCircle, Briefcase, Hash, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    bio: "",
    avatarColor: "primary",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setFormData({
          ...formData,
          name: data.name || "",
          email: data.email || "",
          age: data.age?.toString() || "",
          bio: data.bio || "",
          avatarColor: data.avatarColor || "primary",
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load profile";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : undefined,
        }),
      });

      if (res.ok) {
        toast.success("Profile updated successfully");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Identity...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
            <UserCircle className="h-7 w-7" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic">Identity Matrix</h1>
        </div>
        <p className="text-muted-foreground font-medium text-lg max-w-2xl">
          Configure your biological data and security protocols.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Avatar Selection */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass p-8 rounded-[2.5rem] border border-border/50 text-center space-y-6">
             <div className="relative group mx-auto w-32 h-32">
                <div className={`w-full h-full rounded-full bg-${formData.avatarColor} flex items-center justify-center border-4 border-background shadow-2xl transition-all group-hover:scale-105`}>
                   <User className="h-16 w-16 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-2 right-0 h-10 w-10 bg-background rounded-xl border border-border flex items-center justify-center shadow-lg">
                   <UserCircle className="h-5 w-5 text-primary" />
                </div>
             </div>
             <div>
                <h3 className="text-xl font-bold">{formData.name}</h3>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{formData.email}</p>
             </div>
             
             <div className="pt-4 border-t border-border/30">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4">Aesthetic Tone</p>
                <div className="flex justify-center gap-3">
                   {['primary', 'indigo-500', 'emerald-500', 'amber-500', 'rose-500'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatarColor: color })}
                        className={`h-6 w-6 rounded-full border-2 border-background transition-all ${formData.avatarColor === color ? 'scale-125 ring-2 ring-primary/20 ring-offset-2 ring-offset-background' : 'opacity-40 hover:opacity-100'} bg-${color === 'primary' ? 'primary' : color}`}
                      />
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 space-y-8">
          <div className="glass p-10 rounded-[2.5rem] border border-border/50 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Legacy Name</label>
                <div className="relative">
                   <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                   <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background/50 border border-border/50 rounded-2xl py-4 pl-12 pr-4 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="space-y-2 opacity-50">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Universal Email</label>
                <div className="relative">
                   <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30" />
                   <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full bg-muted/20 border border-border/50 rounded-2xl py-4 pl-12 pr-4 font-bold cursor-not-allowed"
                    placeholder="email@chronos.io"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Biological Age</label>
                <div className="relative">
                   <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                   <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-background/50 border border-border/50 rounded-2xl py-4 pl-12 pr-4 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    placeholder="E.g. 25"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Manifesto / Bio</label>
              <div className="relative">
                 <Briefcase className="absolute left-4 top-6 h-5 w-5 text-muted-foreground/50" />
                 <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full bg-background/50 border border-border/50 rounded-3xl py-6 pl-12 pr-6 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner resize-none"
                  placeholder="Tell us about your mission..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 shadow-xl shadow-primary/20"
            >
              {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <>
                  <Save className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span>Execute Sync</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
