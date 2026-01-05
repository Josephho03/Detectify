"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  CheckCircle,
  CircleX,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

const supabase = supabaseBrowser();

/* ---------- Simple toast-style Modal ---------- */
function Modal({
  open,
  onClose,
  title,
  message,
  type = "success",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error";
}) {
  if (!open) return null;
  const Icon = type === "success" ? CheckCircle2 : AlertTriangle;
  const accent =
    type === "success"
      ? "from-emerald-500 to-emerald-600"
      : "from-red-500 to-red-600";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-2xl">
        <div className={`rounded-t-2xl bg-gradient-to-b ${accent} p-4`}>
          <div className="flex items-center gap-2 text-white">
            <Icon className="h-5 w-5" />
            <h3 className="font-semibold">{title}</h3>
          </div>
        </div>
        <div className="p-5">
          <p className="text-zinc-600 dark:text-zinc-200 whitespace-pre-line">{message}</p>
          <div className="mt-5 flex justify-end">
            <Button
              onClick={onClose}
              className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
            >
              OK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Scrollable Terms / Privacy Modal ---------- */
function DocsModal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-2xl">
        <div className="rounded-t-2xl bg-gradient-to-b from-orange-500 to-orange-600 p-4">
          <div className="flex items-center gap-2 text-white">
            <h3 className="font-semibold">{title}</h3>
          </div>
        </div>
        <div className="p-5">
          <div className="text-zinc-700 dark:text-zinc-200 max-h-[60vh] overflow-y-auto pr-1">
            {children}
          </div>
          <div className="mt-5 flex justify-end">
            <Button
              onClick={onClose}
              className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Password helpers ---------- */
type PasswordRequirements = {
  length: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  special: boolean;
  noSpaces: boolean;
};

function evaluateRequirements(pw: string): PasswordRequirements {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /\d/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
    noSpaces: !/\s/.test(pw),
  };
}

function strengthScore(reqs: PasswordRequirements): {
  score: number;
  label: string;
} {
  const baseChecks = [
    reqs.length,
    reqs.upper,
    reqs.lower,
    reqs.number,
    reqs.special,
  ];
  const score = baseChecks.filter(Boolean).length;

  let label = "Weak";
  if (score <= 2) label = "Weak";
  else if (score === 3) label = "Fair";
  else if (score === 4) label = "Good";
  else if (score === 5) label = "Strong";

  return { score, label };
}

function barColor(score: number): string {
  if (score <= 2) return "bg-red-500";
  if (score === 3) return "bg-amber-500";
  if (score === 4) return "bg-lime-500";
  return "bg-emerald-500";
}

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [docsOpen, setDocsOpen] = useState(false);
  const [docsTitle, setDocsTitle] =
    useState<"Terms of Service" | "Privacy Policy">("Terms of Service");
  const [docsBody, setDocsBody] = useState<React.ReactNode>(null);

  const openModal = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalOpen(true);
  };

  const showDocs = (which: "tos" | "privacy") => {
    if (which === "tos") {
      setDocsTitle("Terms of Service");
      setDocsBody(
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            Welcome to <b>Detectify</b>. By creating an account, you agree to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-300">
            <li>Use the service only for lawful purposes.</li>
            <li>Not disrupt, abuse, or reverse-engineer our systems.</li>
            <li>Respect intellectual property and the rights of others.</li>
            <li>Follow any additional guidelines we publish.</li>
          </ul>
          <p className="text-zinc-500 dark:text-zinc-400">
            These terms may be updated. Continued use after changes means you
            accept the updated terms. If you disagree, please discontinue use.
          </p>
        </div>
      );
    } else {
      setDocsTitle("Privacy Policy");
      setDocsBody(
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            We collect the minimum data needed to provide Detectify (e.g.,
            email, name, login metadata). We do not sell your data.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-300">
            <li>Authentication is handled securely by Supabase.</li>
            <li>We may store logs for security/troubleshooting.</li>
            <li>You can request data export or deletion at any time.</li>
          </ul>
          <p className="text-zinc-500 dark:text-zinc-400">
            For questions, contact us via the email on our site. This summary
            is for convenience; the full policy governs.
          </p>
        </div>
      );
    }
    setDocsOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const pwReqs = useMemo(
    () => evaluateRequirements(formData.password),
    [formData.password]
  );
  const { score, label } = useMemo(() => strengthScore(pwReqs), [pwReqs]);

  const allReqsPass =
    pwReqs.length &&
    pwReqs.upper &&
    pwReqs.lower &&
    pwReqs.number &&
    pwReqs.special &&
    pwReqs.noSpaces;

  const passwordsMatch =
    formData.password.length > 0 &&
    formData.password === formData.confirmPassword;

  const canSubmit = acceptTerms && allReqsPass && passwordsMatch && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    if (!acceptTerms) {
      openModal("error", "Action required", "Please agree to the Terms of Service and Privacy Policy.");
      return;
    }
    if (!allReqsPass) {
      openModal("error", "Password requirements", "Please meet all password requirements before continuing.");
      return;
    }
    if (!passwordsMatch) {
      openModal("error", "Password mismatch", "Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/login`,
        data: { name: formData.name },
      },
    });

    setIsLoading(false);

    if (error) {
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("already registered") || msg.includes("user already exists")) {
        openModal("error", "Email already registered", `The email ${formData.email} is already associated with an account.`);
      } else {
        openModal("error", "Signup failed", error.message || "Please try again.");
      }
      return;
    }

    if (!data.session) {
      openModal("success", "Verify your email", `We’ve sent a verification link to ${formData.email}.`);
      return;
    }

    router.push("/");
  };

  const handleOAuth = async (provider: "google" | "github") => {
    if (!supabase || oauthLoading) return;
    try {
      setOauthLoading(provider);
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/`,
          queryParams: { prompt: "consent" },
        },
      });
    } catch (err: any) {
      setOauthLoading(null);
      openModal("error", "OAuth error", err?.message || "Unable to start OAuth sign-in.");
    }
  };

  return (
    <>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={modalTitle} message={modalMessage} type={modalType} />
      <DocsModal open={docsOpen} onClose={() => setDocsOpen(false)} title={docsTitle}>{docsBody}</DocsModal>

      {/* Main Container */}
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4 transition-colors duration-300">
        <Link
          href="/"
          className="absolute top-6 left-6 z-20 text-zinc-500 dark:text-zinc-400 hover:text-[#e78a53] transition-colors duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to Home</span>
        </Link>

        {/* Background gradient (Dark Mode Only) */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 via-white to-zinc-200 dark:from-zinc-900 dark:via-black dark:to-zinc-900" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#e78a53]/10 rounded-full blur-3xl opacity-50 dark:opacity-100" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#e78a53]/5 rounded-full blur-3xl opacity-50 dark:opacity-100" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center justify-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">Detectify</span>
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Create account</h1>
            <p className="text-zinc-600 dark:text-zinc-400">Join the fight against deepfakes</p>
          </div>

          {/* Signup Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-700 dark:text-white">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-[#e78a53] focus:ring-[#e78a53]/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-700 dark:text-white">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-[#e78a53] focus:ring-[#e78a53]/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-700 dark:text-white">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-[#e78a53] focus:ring-[#e78a53]/20"
                  required
                  autoComplete="new-password"
                />

                {/* Strength bar */}
                <div className="mt-2">
                  <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-2 ${barColor(score)} transition-all duration-300`}
                      style={{ width: `${(score / 5) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400">Strength</span>
                    <span className={`font-medium ${score <= 2 ? "text-red-500" : score === 3 ? "text-amber-500" : score === 4 ? "text-lime-500" : "text-emerald-500"}`}>
                      {label}
                    </span>
                  </div>
                </div>

                {/* Requirements checklist */}
                <ul className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  {[
                    { ok: pwReqs.length, label: "At least 8 characters" },
                    { ok: pwReqs.upper, label: "Uppercase letter (A–Z)" },
                    { ok: pwReqs.lower, label: "Lowercase letter (a–z)" },
                    { ok: pwReqs.number, label: "Number (0–9)" },
                    { ok: pwReqs.special, label: "Special character (!@#$…)" },
                    { ok: pwReqs.noSpaces, label: "No spaces" },
                  ].map((r, i) => (
                    <li key={i} className="flex items-center gap-2">
                      {r.ok ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <CircleX className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                      )}
                      <span className={r.ok ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-500"}>
                        {r.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-zinc-700 dark:text-white">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-[#e78a53] focus:ring-[#e78a53]/20"
                  required
                  autoComplete="new-password"
                />
                {formData.confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#e78a53] focus:ring-[#e78a53]/20"
                  required
                />
                <label htmlFor="terms" className="text-sm text-zinc-600 dark:text-zinc-300">
                  I agree to the{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); showDocs("tos"); }} className="text-[#e78a53] hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); showDocs("privacy"); }} className="text-[#e78a53] hover:underline">Privacy Policy</a>.
                </label>
              </div>

              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-60"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-zinc-600 dark:text-zinc-400">
                Already have an account?{" "}
                <Link href="/login" className="text-[#e78a53] hover:text-[#e78a53]/80 font-semibold">Sign in</Link>
              </p>
            </div>
          </motion.div>

          {/* Social Signup */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zinc-50 dark:bg-black text-zinc-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuth("google")}
                disabled={oauthLoading !== null}
                className="bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-[#e78a53]/60 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>{oauthLoading === "google" ? "Redirecting…" : "Google"}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuth("github")}
                disabled={oauthLoading !== null}
                className="bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-[#e78a53]/60 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>{oauthLoading === "github" ? "Redirecting…" : "GitHub"}</span>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}