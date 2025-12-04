"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/admin/ThemeContext";
import { supabaseBrowser } from "@/lib/supabase/client";

import {
  LayoutDashboard,
  ShieldAlert,
  Users,
  FileText,
  LogOut,
  ShieldCheck,
  Sun,
  Moon,
  BrainCircuit,       
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const pathname = usePathname();

  const handleSignOut = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    window.location.href = "/login";
    };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { href: "/admin/scans", label: "Scan Logs", icon: <ShieldAlert size={20} /> },
    { href: "/admin/users", label: "User Management", icon: <Users size={20} /> },
    { href: "/admin/content", label: "News Management", icon: <FileText size={20} /> },
    { href: "/admin/quiz", label: "Quiz Management", icon: <BrainCircuit size={20} /> }, // ⬅️ new
  ];

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <div className="w-64 h-screen bg-white dark:bg-[#050505] border-r border-gray-200 dark:border-white/10 flex flex-col fixed left-0 top-0 transition-colors duration-300 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white">
          <ShieldCheck size={20} fill="white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Detectify<span className="text-orange-600 dark:text-orange-500">.Admin</span>
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
              isActive(item.href)
                ? "bg-orange-50 dark:bg-orange-600/10 text-orange-600 dark:text-orange-500 border border-orange-200 dark:border-orange-500/20"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-white/10 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg.white/5 rounded-lg transition-colors text-sm font-medium"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>

        <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
            >
            <LogOut size={20} />
            Sign Out
        </button>

      </div>
    </div>
  );
};
