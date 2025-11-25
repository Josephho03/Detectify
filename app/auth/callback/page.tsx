"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [msg, setMsg] = useState("Finishing up verification…");

  useEffect(() => {
    const supabase = supabaseBrowser(); // create inside effect/component

    const handle = async () => {
      // 1. Parse hash for error (if any)
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const error = hash.get("error");
      const error_description = hash.get("error_description");

      // Clean the URL (remove hash and code from address bar)
      try {
        const clean = window.location.origin + window.location.pathname;
        window.history.replaceState(null, document.title, clean);
      } catch {}

      if (error) {
        setMsg(
          error_description
            ? `Oops: ${decodeURIComponent(error_description)}`
            : "Something went wrong while verifying. Redirecting to login…"
        );
        setTimeout(() => router.replace("/login"), 2500);
        return;
      }

      // 2. EXCHANGE CODE FOR SESSION (this is the missing piece)
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (exchangeError) {
        console.error("exchangeCodeForSession error:", exchangeError);
        setMsg("Could not complete verification. Redirecting to login…");
        setTimeout(() => router.replace("/login"), 2500);
        return;
      }

      // 3. After exchange, we should now have a session
      const { data: sessionData } = await supabase.auth.getSession();
      const hasSession = Boolean(sessionData?.session);

      const requestedNext = searchParams.get("next") || "/";
      const finalNext =
        requestedNext === "/login" && hasSession ? "/" : requestedNext;

      setMsg("Verification complete. Redirecting…");
      setTimeout(() => router.replace(finalNext), 1500);
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
