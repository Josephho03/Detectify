"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, MailCheck, MailWarning, LogOut, Save, Check, AlertTriangle, ArrowLeft } from "lucide-react";

/* ---------- Password helpers (reuse from signup) ---------- */
type PwReqs = { length: boolean; upper: boolean; lower: boolean; number: boolean; special: boolean; noSpaces: boolean; };
const evalReqs = (pw: string): PwReqs => ({
  length: pw.length >= 8,
  upper: /[A-Z]/.test(pw),
  lower: /[a-z]/.test(pw),
  number: /\d/.test(pw),
  special: /[^A-Za-z0-9]/.test(pw),
  noSpaces: !/\s/.test(pw),
});
const strength = (r: PwReqs) => {
  const s = [r.length, r.upper, r.lower, r.number, r.special].filter(Boolean).length;
  const label = s <= 2 ? "Weak" : s === 3 ? "Fair" : s === 4 ? "Good" : "Strong";
  return { score: s, label };
};
const barColor = (s: number) => (s <= 2 ? "bg-red-500" : s === 3 ? "bg-amber-500" : s === 4 ? "bg-lime-500" : "bg-emerald-500");

export default function AccountPage() {
  const supabase = supabaseBrowser();

  // loading + toasts
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  // user + profile
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [hasEmailIdentity, setHasEmailIdentity] = useState<boolean>(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  // change password (only for email identity)
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const pwReqs = useMemo(() => evalReqs(newPw), [newPw]);
  const { score, label } = useMemo(() => strength(pwReqs), [pwReqs]);
  const allPwOk = pwReqs.length && pwReqs.upper && pwReqs.lower && pwReqs.number && pwReqs.special && pwReqs.noSpaces && newPw === confirmPw;

  // load user + profile
  useEffect(() => {
    (async () => {
        try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = "/login";
            return;
        }

        setUserId(user.id);
        setEmail(user.email ?? "");
        setEmailVerified(!!(user.user_metadata?.email_verified ?? user.email_confirmed_at));
        setHasEmailIdentity(!!user.identities?.some((i: any) => i?.provider === "email"));

        // 1) Try profiles first
        const { data: profile } = await supabase
            .from("profiles")
            .select("name,bio,email")
            .eq("id", user.id)
            .single();

        // 2) If profile missing name, fall back to user_metadata (covers email signup & OAuth)
        const meta = user.user_metadata || {};
        const metaName =
            meta.name ||
            meta.full_name ||
            meta.user_name ||
            meta.user ||
            ""; // providers vary on the key they use

        // 3) Final fallback: derive from email (before @)
        const emailName = (user.email || "").split("@")[0];

        const initialName = profile?.name ?? (metaName || emailName);


        if (profile?.name) setName(profile.name);
        else setName(initialName);

        if (profile?.bio) setBio(profile.bio);

        // 4) If there was no profile row yet, or it had no name, upsert once so next loads are instant
        if (!profile || !profile.name) {
            await supabase.from("profiles").upsert({
            id: user.id,
            email: user.email,
            name: initialName,
            bio: profile?.bio ?? ""
            }, { onConflict: "id" });
        }
        } finally {
        setLoading(false);
        }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  // save profile
  const save = async () => {
    setToast(null);
    setSaving(true);

    const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, name: name.trim(), bio: bio.trim(), email })
        .eq("id", userId);

    setSaving(false);

    if (error) {
        const friendly =
        error.code === "42P01"
            ? "Profiles table missing. Create `public.profiles` in Supabase."
            : error.message;
        setToast({ type: "err", msg: friendly });
        return;
    }
    setToast({ type: "ok", msg: "Profile saved" });
    };


  // change password
  const changePassword = async () => {
    if (!allPwOk) {
      setToast({ type: "err", msg: "Please meet all password requirements and confirm the password." });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) {
      setToast({ type: "err", msg: error.message });
      return;
    }
    setToast({ type: "ok", msg: "Password updated" });
    setNewPw("");
    setConfirmPw("");
  };

  // resend verification (visible if not verified)
  const resendVerification = async () => {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setToast(
      error
        ? { type: "err", msg: error.message }
        : { type: "ok", msg: "Verification email sent" }
    );
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
      <div className="absolute -top-24 -right-16 w-[28rem] h-[28rem] rounded-full bg-[#e78a53]/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-16 w-[34rem] h-[34rem] rounded-full bg-[#e78a53]/5 blur-3xl" />

      {/* Back to Home */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 text-zinc-400 hover:text-[#e78a53] transition-colors duration-200 flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-16">
        {/* header */}
        <div className="mb-8 flex items-center gap-3 text-white">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Account</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl"
        >
          {/* top stripe */}
          <div className="p-6 border-b border-zinc-800">
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center">
                <span className="text-lg font-semibold text-white">
                  {name?.trim()?.[0]?.toUpperCase() || (email ? email[0].toUpperCase() : "U")}
                </span>
              </div>
              <div className="flex-1 min-w-[220px]">
                <div className="text-white font-medium">{name || "Your name"}</div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-zinc-400">{email || "—"}</span>
                  {emailVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[11px]">
                      <MailCheck className="h-3.5 w-3.5" /> verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-400 px-2 py-0.5 text-[11px]">
                      <MailWarning className="h-3.5 w-3.5" /> not verified
                    </span>
                  )}
                </div>
              </div>

              {!emailVerified && (
                <Button
                  variant="outline"
                  onClick={resendVerification}
                  className="border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                >
                  Resend verification
                </Button>
              )}
            </div>
          </div>

          {/* profile form */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs uppercase tracking-wide text-zinc-400 mb-2">
                Email
              </label>
              <Input
                value={email}
                disabled
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-zinc-400 mb-2">
                Full name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#e78a53] focus:ring-[#e78a53]/20"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-zinc-400 mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Tell us a bit about yourself"
                className="w-full rounded-md bg-zinc-800/50 border border-zinc-700 text-white placeholder:text-zinc-500 px-3 py-2 focus:outline-none focus:border-[#e78a53]"
              />
            </div>

            <div className="col-span-1 md:col-span-2 flex flex-wrap gap-3">
              <Button
                onClick={save}
                disabled={saving || !name.trim()}
                className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white min-w-[130px] inline-flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save changes"}
              </Button>

              <Button
                variant="outline"
                onClick={logout}
                className="border-zinc-700 text-zinc-200 hover:bg-zinc-800 inline-flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>

          {/* change password (only for email identity) */}
          {hasEmailIdentity && (
            <div className="px-6 pb-6">
              <div className="mt-2 pt-6 border-t border-zinc-800">
                <h2 className="text-white font-medium mb-2">Change password</h2>
                <p className="text-sm text-zinc-400 mb-4">
                  This is available for accounts created with email & password.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-1">
                    <label className="block text-xs uppercase tracking-wide text-zinc-400 mb-2">
                      New password
                    </label>
                    <Input
                      type="password"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="Enter a new password"
                      className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#e78a53] focus:ring-[#e78a53]/20"
                      autoComplete="new-password"
                    />

                    {/* strength */}
                    <div className="mt-2">
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-2 ${barColor(score)} transition-all duration-300`}
                          style={{ width: `${(score / 5) * 100}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-zinc-400">Strength</span>
                        <span
                          className={`font-medium ${
                            score <= 2
                              ? "text-red-400"
                              : score === 3
                              ? "text-amber-400"
                              : score === 4
                              ? "text-lime-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    </div>

                    {/* requirements */}
                    <ul className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      {[
                        { ok: pwReqs.length, label: "At least 8 characters" },
                        { ok: pwReqs.upper, label: "Uppercase (A–Z)" },
                        { ok: pwReqs.lower, label: "Lowercase (a–z)" },
                        { ok: pwReqs.number, label: "Number (0–9)" },
                        { ok: pwReqs.special, label: "Special (!@#$…)" },
                        { ok: pwReqs.noSpaces, label: "No spaces" },
                      ].map((r, i) => (
                        <li key={i} className="flex items-center gap-2">
                          {r.ok ? (
                            <Check className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-zinc-500" />
                          )}
                          <span className={r.ok ? "text-zinc-300" : "text-zinc-500"}>{r.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-xs uppercase tracking-wide text-zinc-400 mb-2">
                      Confirm new password
                    </label>
                    <Input
                      type="password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="Re-enter new password"
                      className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#e78a53] focus:ring-[#e78a53]/20"
                      autoComplete="new-password"
                    />
                    {confirmPw.length > 0 && newPw !== confirmPw && (
                      <p className="text-xs text-red-400 mt-2">Passwords do not match.</p>
                    )}

                    <div className="mt-4">
                      <Button
                        onClick={changePassword}
                        disabled={!allPwOk}
                        className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                      >
                        Update password
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* toast */}
        {toast && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm
            border
            bg-zinc-900/70 backdrop-blur
            border-zinc-800
            text-zinc-200
          ">
            {toast.type === "ok" ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-400" />
            )}
            <span className={toast.type === "ok" ? "text-emerald-400" : "text-red-400"}>
              {toast.msg}
            </span>
          </div>
        )}
      </div>

      {/* loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-2 text-zinc-300">
            Loading account…
          </div>
        </div>
      )}
    </div>
  );
}
