"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Menu } from "lucide-react";

export default function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex">
      {/* Mobile header (only < lg) */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-14 bg-black/80 backdrop-blur-md text-white z-50 flex items-center justify-between px-4 border-b border-white/10">
        <button onClick={() => setOpen(true)} className="p-1">
          <Menu size={22} />
        </button>
        <span className="font-semibold text-sm">Detectify Admin</span>
        <div className="w-6" />
      </div>

      {/* Sidebar (desktop + mobile slide-in) */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-black border-r border-white/10 transform transition-transform duration-300 z-40 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar />

        {/* Close button on mobile */}
        <button
          className="lg:hidden absolute top-4 right-4 text-xs text-white bg-white/10 px-3 py-1 rounded"
          onClick={() => setOpen(false)}
        >
          Close
        </button>
      </aside>

      {/* Overlay when sidebar open on mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main content */}
      <main
        className="
          flex-1 w-full
          lg:ml-64
          mt-20 lg:mt-10
          p-4 md:p-6 lg:p-10
          transition-all duration-300
          flex justify-center
        "
      >
        <div className="w-full max-w-[1500px]">
          {children}
        </div>
      </main>
    </div>
  );
}
