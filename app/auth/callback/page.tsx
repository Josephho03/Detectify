"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [msg, setMsg] = useState("Completing authentication...");
  const hasRun = useRef(false);

  // Helper: decide final redirect based on `next` + user's role
  const redirectWithRole = async (
    supabase: ReturnType<typeof supabaseBrowser>,
    nextParam: string | null
  ) => {
    const safeNext =
      nextParam && nextParam.startsWith("/") ? nextParam : "/";

    // If next is something specific (like /admin), just go there.
    if (safeNext !== "/") {
      window.location.href = safeNext;
      return;
    }

    // If next is "/" (or missing), check role to maybe send admin to /admin
    const { data: userData } = await supabase.auth.getUser();

    if (userData.user) {
      const { data: profile } = await supabase
        .from("profiles") // your profiles table
        .select("role")
        .eq("id", userData.user.id)
        .single();

      if (profile?.role === "admin") {
        window.location.href = "/admin";
        return;
      }
    }

    // Fallback: normal users or unknown role → "/"
    window.location.href = safeNext;
  };

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handle = async () => {
      const supabase = supabaseBrowser();

      try {
        // Check if we already have a valid session
        const {
          data: { session: existingSession },
        } = await supabase.auth.getSession();

        if (existingSession) {
          const next = searchParams?.get("next") || "/";
          setMsg("Already authenticated! Redirecting...");
          setTimeout(() => {
            redirectWithRole(supabase, next);
          }, 300);
          return;
        }

        // Check for errors in hash
        const hash = new URLSearchParams(
          window.location.hash.replace(/^#/, "")
        );
        const hashError = hash.get("error");
        const hashErrorDesc = hash.get("error_description");

        if (hashError) {
          console.error("OAuth error:", hashError, hashErrorDesc);
          setMsg("Authentication failed");
          setTimeout(() => router.replace("/login"), 2000);
          return;
        }

        // Get the code from URL params
        const code = searchParams?.get("code");

        if (!code) {
          router.replace("/login");
          return;
        }

        // Try to exchange code for session
        const { data, error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        // If exchange fails, wait and check session again
        if (exchangeError) {
          console.warn("Exchange error, retrying:", exchangeError.message);
          await new Promise((resolve) => setTimeout(resolve, 500));

          const {
            data: { session: retrySession },
          } = await supabase.auth.getSession();

          if (retrySession) {
            const next = searchParams?.get("next") || "/";
            setMsg("Success! Redirecting...");
            setTimeout(() => {
              redirectWithRole(supabase, next);
            }, 300);
            return;
          }

          setMsg("Authentication failed");
          setTimeout(() => router.replace("/login"), 2000);
          return;
        }

        // Success
        setMsg("Success! Redirecting...");
        const next = searchParams?.get("next") || "/";
        setTimeout(() => {
          redirectWithRole(supabase, next);
        }, 300);
      } catch (err) {
        console.error("Auth callback error:", err);
        // Last resort - check if we have a session anyway
        try {
          const supabase = supabaseBrowser();
          const {
            data: { session: finalSession },
          } = await supabase.auth.getSession();

          if (finalSession) {
            const next = searchParams?.get("next") || "/";
            redirectWithRole(supabase, next);
            return;
          }
        } catch {
          // ignore
        }

        setMsg("Something went wrong");
        setTimeout(() => router.replace("/login"), 2000);
      }
    };

    handle();
  }, [router, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/70 text-center space-y-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-[#e78a53]"></div>
        </div>
        <p className="text-zinc-300 text-lg">{msg}</p>
      </div>
    </div>
  );
}
