"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();

  const sidebarItems = [
    { name: "Today's Tasks", mobileName: "Today", href: "/dashboard", icon: LayoutDashboard },
    { name: "Calendar View", mobileName: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Profile & History", mobileName: "Profile", href: "/profile", icon: User },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r bg-card/40 backdrop-blur-md sticky top-0 h-screen p-6 space-y-8 animate-in slide-in-from-left duration-500">
        <div className="flex items-center space-x-2 px-2">
          <div className="h-24 w-24 rounded-2xl items-center justify-center shadow-lg overflow-hidden">
            <Image src="/logo.png" alt="DoUp Logo" width={100} height={100} className="w-full h-full object-cover" />
          </div>
          <span className="text-4xl font-bold tracking-tight">DoUp</span>
        </div>

        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start h-12 rounded-2xl px-4 text-md font-semibold transition-all group",
                    isActive ? "bg-primary/10 text-primary" : "hover:bg-primary/10 hover:text-primary active:scale-95"
                  )}
                >
                  <Icon className={cn("mr-3 h-5 w-5 transition-transform group-hover:scale-110", isActive && "scale-110")} />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="pt-8 border-t">
          <form action="/api/auth/logout" method="POST">
             <Button 
              variant="ghost" 
              className="w-full justify-start h-12 rounded-2xl px-4 text-md font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
             >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
             </Button>
          </form>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <div className="fixed bottom-6 inset-x-4 h-20 glass-morphism rounded-3xl border border-white/20 shadow-2xl md:hidden z-50 flex items-center justify-around px-6">
        {sidebarItems.map((item) => {
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
              <span className="text-[10px] font-semibold">{item.mobileName}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
