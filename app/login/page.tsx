"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams?.get("redirectedFrom");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;
      if (data.session) {
        let target = "/";
        if (redirectedFrom && redirectedFrom.startsWith("/")) {
          target = redirectedFrom;
        } else {
          const { data: userData } = await supabase.auth.getUser();

          if (userData.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", userData.user.id)
              .single();

            if (profile?.role === "admin") {
              target = "/admin";
            } else {
              target = "/";
            }
          }
        }
        router.replace(target);
      }
    })();
    
    return () => {
      mounted = false;
    };
  }, [router, redirectedFrom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    try {
      const supabase = supabaseBrowser();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const msg = error.message?.toLowerCase() || "";
        if (msg.includes("confirm") || msg.includes("email_not_confirmed")) {
          setFormError("Please verify your email.");
        } else if (msg.includes("invalid") || msg.includes("credentials")) {
          setFormError("Invalid email or password.");
        } else {
          setFormError(error.message || "Login failed.");
        }
        setIsLoading(false);
        return;
      }

      const userId = data.user.id;

      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (updateErr) {
        console.error("Failed to update profile:", updateErr);
      }

      let target = "/";
      if (redirectedFrom && redirectedFrom.startsWith("/")) {
        target = redirectedFrom;
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        if (profile?.role === "admin") {
          target = "/admin";
        }
      }

      router.replace(target);
    } catch (err: any) {
      setFormError(err?.message || "Something went wrong.");
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setFormError(null);
    setOauthLoading(provider);
    try {
      const supabase = supabaseBrowser();
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            redirectedFrom && redirectedFrom.startsWith("/") ? redirectedFrom : "/"
          )}`,
          queryParams: { prompt: "consent" },
        },
      });
    } catch (err: any) {
      setFormError(err?.message || "Unable to start OAuth sign-in.");
      setOauthLoading(null);
    }
  };

  const canSubmit = email.length > 0 && password.length > 0 && !isLoading;

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4 transition-colors duration-300">
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 text-neutral-500 dark:text-zinc-400 hover:text-[#e78a53] transition-colors duration-200 flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Home</span>
      </Link>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Light mode subtle glow */}
        <div className="absolute top-0 left-1/4 w-full h-full bg-orange-50/50 dark:hidden" />
        {/* Dark mode gradient */}
        <div className="hidden dark:block absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
        
        {/* Shared Decorative elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#e78a53]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#e78a53]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-black dark:text-white">Detectify</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Welcome back</h1>
          <p className="text-neutral-500 dark:text-zinc-400">Sign in to your account to continue</p>
        </div>

        {/* Login Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="
            p-8 rounded-2xl border backdrop-blur-xl transition-all
            bg-white border-black/10 shadow-xl
            dark:bg-gradient-to-b dark:from-[#2a1408] dark:to-[#120805] dark:border-orange-500/20
          "
        >
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black dark:text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-neutral-50 border-black/10 text-black placeholder:text-neutral-400 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500 focus:border-[#e78a53] focus:ring-[#e78a53]/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-black dark:text-white">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-neutral-50 border-black/10 text-black placeholder:text-neutral-400 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500 focus:border-[#e78a53] focus:ring-[#e78a53]/20"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-neutral-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#e78a53] focus:ring-[#e78a53]/20"
                />
                <span className="text-neutral-600 dark:text-zinc-300">Remember me</span>
              </label>
              <Link href="/reset" className="text-sm text-[#e78a53] hover:underline">
                Forgot password?
              </Link>
            </div>

            {formError && <p className="text-sm text-red-500 dark:text-red-400 font-medium">{formError}</p>}

            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-neutral-500 dark:text-zinc-400">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#e78a53] hover:underline font-bold">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Social Login Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6"
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/5 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-black text-neutral-400 dark:text-zinc-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuth("google")}
              disabled={oauthLoading !== null}
              className="bg-white border-black/10 text-neutral-700 hover:border-orange-500/50 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-[#e78a53]/60 transition-all duration-200"
            >
              {/* Google Icon SVG */}
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>{oauthLoading === "google" ? "..." : "Google"}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuth("github")}
              disabled={oauthLoading !== null}
              className="bg-white border-black/10 text-neutral-700 hover:border-orange-500/50 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-[#e78a53]/60 transition-all duration-200"
            >
              {/* GitHub Icon SVG */}
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>{oauthLoading === "github" ? "..." : "GitHub"}</span>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}