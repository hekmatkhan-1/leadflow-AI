import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "./header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Supabase may be unreachable — that is the same as having no session, and
  // must land on the login page rather than a crash.
  let user: User | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }

  if (!user) {
    redirect("/login");
  }

  const userEmail = user.email ?? "Unknown";
  const userName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.company_name as string | undefined) ??
    "there";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="lg:pl-60">
        <DashboardHeader userEmail={userEmail} userName={userName} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
