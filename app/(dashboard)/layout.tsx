import { getSession } from "@/lib/auth/jwt";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background text-foreground overflow-hidden">
      {/* Unified Responsive Sidebar */}
      <Sidebar session={session} />

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto relative scroll-smooth">
        <div className="p-6 md:p-12 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
