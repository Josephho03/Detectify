"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Mail } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 via-white to-zinc-200 dark:from-zinc-900 dark:via-black dark:to-zinc-900" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-[#e78a53]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#e78a53]/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                Detectify
              </span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Reset password
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            We’ll email you a secure reset link
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl"
        >
          {success ? (
            <div className="text-center space-y-4">
              <Mail className="h-10 w-10 mx-auto text-emerald-500" />
              <p className="text-zinc-700 dark:text-zinc-300">
                If an account exists for <b>{email}</b>, a reset link has been sent.
              </p>
              <Link
                href="/login"
                className="inline-block text-[#e78a53] font-semibold hover:underline"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-zinc-700 dark:text-white">Email</Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:border-[#e78a53] focus:ring-[#e78a53]/20"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90 text-white py-3 rounded-xl shadow-lg"
              >
                {loading ? "Sending..." : "Send reset link"}
              </Button>

              <p className="text-center text-sm text-zinc-500">
                Remembered your password?{" "}
                <Link href="/login" className="text-[#e78a53] hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
