"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Calendar,
  CheckSquare,
  LayoutDashboard,
  LogOut,
  User,
  Repeat,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface UserSession {
  name: string;
  email: string;
  id: string;
}

interface SidebarContentProps {
  session: UserSession;
  pathname: string;
  isMobile?: boolean;
  onClose?: () => void;
}

const SidebarContent = ({
  session,
  pathname,
  isMobile = false,
  onClose,
}: SidebarContentProps) => {
  const navLinks = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/repeating", label: "Repeating", icon: Repeat },
  ];
  const navigate = useRouter();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <CheckSquare className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-extrabold text-2xl tracking-tighter text-foreground">
            Chronos
          </span>
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-xl transition-all"
          >
            <X className="h-6 w-6 text-muted-foreground" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => isMobile && onClose && onClose()}
              className={`
                flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group font-bold
                ${isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted/50 hover:text-primary"}
              `}
            >
              <Icon
                className={`h-6 w-6 ${isActive ? "scale-110" : "group-hover:scale-110"} transition-transform`}
              />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t border-border/50">
        <div className="flex items-center gap-4 px-2 mb-8">
          <div
            className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border border-border hover:cursor-pointer"
            onClick={() => {
              navigate.push("/profile");
            }}
          >
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex flex-col overflow-hidden text-foreground">
            <span className="font-bold truncate text-base">{session.name}</span>
            <span className="text-[10px] text-muted-foreground truncate lowercase tracking-widest font-black opacity-60 font-mono italic">
              {session.email}
            </span>
          </div>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all group font-bold"
          >
            <LogOut className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default function Sidebar({ session }: { session: UserSession }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 glass border-b border-border sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg tracking-tight text-foreground">
            Chronos
          </span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-muted rounded-xl transition-all"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Side Drawer */}
      <aside
        className={`
        fixed top-0 left-0 bottom-0 w-80 glass border-r border-border z-50 transform transition-transform duration-300 ease-in-out md:hidden
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="h-full p-6">
          <SidebarContent
            session={session}
            pathname={pathname}
            isMobile
            onClose={() => setIsOpen(false)}
          />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="w-72 glass border-r border-border hidden md:flex flex-col p-8 z-20">
        <SidebarContent session={session} pathname={pathname} />
      </aside>
    </>
  );
}
