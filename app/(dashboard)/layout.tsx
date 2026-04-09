import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/shared/sidebar";

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
    <div className="flex min-h-screen bg-background transition-colors duration-500">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        <main className="flex-1 pb-32 md:pb-8 pt-8 px-4 md:px-12 w-full max-w-7xl mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
