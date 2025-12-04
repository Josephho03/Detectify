import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { ThemeProvider } from "@/lib/admin/ThemeContext";
import AdminShell from "./AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = supabaseServer();

  // Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check role
  const {
    data: profile,
    error,
  } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") {
    redirect("/");
  }

  return (
    <ThemeProvider>
      <AdminShell>{children}</AdminShell>
    </ThemeProvider>
  );
}
