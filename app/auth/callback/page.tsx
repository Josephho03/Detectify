"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

const supabase = supabaseBrowser();

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [msg, setMsg] = useState("Finishing up verification…");

  useEffect(() => {
    const handle = async () => {
      // 1. Parse URL + clean hash fragments
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const error = hash.get("error");
      const error_description = hash.get("error_description");

      // Clean the URL so it looks nice
      try {
        const clean = window.location.origin + window.location.pathname;
        window.history.replaceState(null, document.title, clean);
      } catch {}

      // 2. Handle email / OAuth errors
      if (error) {
        setMsg(
          error_description
            ? `Oops: ${decodeURIComponent(error_description)}`
            : "Something went wrong while verifying. Redirecting to login…"
        );
        setTimeout(() => router.replace("/login"), 2500);
        return;
      }

      // 3. Determine where to go
      const requestedNext = searchParams.get("next") || "/";
      await new Promise((r) => setTimeout(r, 400)); // give Supabase time to store session

      const { data: sessionData } = await supabase.auth.getSession();
      const hasSession = Boolean(sessionData?.session);

      const finalNext =
        requestedNext === "/login" && hasSession ? "/" : requestedNext;

      // Keep message consistent to avoid flicker
      setMsg("Verification complete. Redirecting…");
      setTimeout(() => router.replace(finalNext), 2500);
    };

    handle();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/70 text-center">
        <p className="text-zinc-300 text-lg">{msg}</p>
      </div>
    </div>
  );
}
