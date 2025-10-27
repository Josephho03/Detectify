"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/client";
import { LogOut, UserRound } from "lucide-react";

const supabase = supabaseBrowser();

export default function AuthButtons() {
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
      setLoading(false);

      const { data: sub } = supabase.auth.onAuthStateChange(
        (_evt: AuthChangeEvent, session: Session | null) => {
          setHasSession(!!session);
        }
      );
      unsub = () => sub.subscription.unsubscribe();
    })();

    return () => unsub();
  }, []);

  if (loading) return null;

  // --- Not logged in ---
  if (!hasSession) {
    return (
      <>
        <a
          href="/login"
          className="font-medium transition-colors hover:text-foreground text-muted-foreground text-sm cursor-pointer"
        >
          Log In
        </a>
        <a
          href="/signup"
          className="rounded-md font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] px-4 py-2 text-sm"
        >
          Sign Up
        </a>
      </>
    );
  }

  // --- Logged in ---
  return (
    <div className="flex items-center gap-3">
      {/* Manage Account */}
      <Link
        href="/account"
        aria-label="Manage account"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full 
                   bg-gradient-to-b from-orange-500 to-orange-600 shadow-md 
                   hover:scale-105 transition-transform duration-200"
        title="Manage account"
      >
        <UserRound className="h-4 w-4 text-white" />
      </Link>

      {/* Log Out */}
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/";
        }}
        aria-label="Log out"
        title="Log out"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full 
                   bg-gradient-to-b from-orange-500 to-orange-600 shadow-md 
                   hover:scale-105 transition-transform duration-200"
      >
        <LogOut className="h-4 w-4 text-white" />
      </button>
    </div>
  );
}
