"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Today", href: "/dashboard", icon: LayoutDashboard },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-6 inset-x-4 h-20 glass-morphism rounded-3xl border border-white/20 shadow-2xl md:hidden z-50 flex items-center justify-around px-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 transition-all duration-300",
              isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className={cn("h-6 w-6", isActive && "fill-primary/20")} />
            <span className="text-[10px] font-semibold">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
