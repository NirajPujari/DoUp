import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/shared/bottom-nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Calendar, User, LogOut } from "lucide-react";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const sidebarItems = [
    { name: "Today's Tasks", href: "/dashboard", icon: LayoutDashboard },
    { name: "Calendar View", href: "/calendar", icon: Calendar },
    { name: "Profile & History", href: "/profile", icon: User },
  ];

  return (
    <div className="flex min-h-screen bg-background transition-colors duration-500">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r bg-card/40 backdrop-blur-md sticky top-0 h-screen p-6 space-y-8 animate-in slide-in-from-left duration-500">
        <div className="flex items-center space-x-2 px-2">
          <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">Luminous</span>
        </div>

        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start h-12 rounded-2xl px-4 text-md font-semibold transition-all hover:bg-primary/10 hover:text-primary active:scale-95 group"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" />
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        <main className="flex-1 pb-32 md:pb-8 pt-8 px-4 md:px-12 w-full max-w-7xl mx-auto overflow-y-auto">
          {children}
        </main>
        
        {/* Mobile Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
