"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Mail,
  MessageCircle,
  ArrowLeft,
  Instagram,
  Linkedin,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/* ---------------------------- EDIT THESE ---------------------------- */
const CONTACT = {
  SUPPORT_EMAIL: "Tp063370@mail.apu.edu.my", 
  INSTAGRAM_URL: "https://www.instagram.com/joseph_ho1501/",     
  LINKEDIN_URL: "https://www.linkedin.com/in/ho-feng-sheng/",    
  WHATSAPP_NUMBER: "60167335171",            
};
/* ------------------------------------------------------------------- */

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    message: "",
    website: "", // honeypot (bots often fill this)
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<null | { ok: boolean; text: string }>(null);
  const [copied, setCopied] = useState(false);

  const isEmailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    [formData.email]
  );
  const canSubmit =
    formData.fullName.trim() &&
    isEmailValid &&
    formData.message.trim() &&
    !submitting;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // Block obvious spam submissions
    if (formData.website?.trim().length) return;

    setSubmitting(true);

    const subject = `Detectify contact • ${formData.fullName}`;
    const body = [
      `Name: ${formData.fullName}`,
      `Email: ${formData.email}`,
      "",
      "Message:",
      formData.message,
      "",
      `Sent from: ${window.location.href}`,
      `When: ${new Date().toLocaleString()}`,
    ].join("\n");

    const mailtoLink = `mailto:${encodeURIComponent(
      CONTACT.SUPPORT_EMAIL
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // UX hint + graceful fallback
    setToast({ ok: true, text: "Opening your email app…" });
    // Give the toast a moment to appear before navigation
    setTimeout(() => {
      window.location.href = mailtoLink;
      setSubmitting(false);
      // If the mail app didn’t open, the toast at least stays visible
      setTimeout(() => setToast(null), 3500);
    }, 250);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.SUPPORT_EMAIL);
      setCopied(true);
      setToast({ ok: true, text: "Support email copied" });
      setTimeout(() => setToast(null), 2000);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setToast({ ok: false, text: "Couldn’t copy email" });
      setTimeout(() => setToast(null), 2000);
    }
  };

  const waHref = `https://wa.me/${CONTACT.WHATSAPP_NUMBER}${
    formData.message
      ? `?text=${encodeURIComponent(`Hi Detectify, I’m ${formData.fullName || "(your name)"} — ${formData.message}`)}`
      : ""
  }`;

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-4 z-50 mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 shadow-lg px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-zinc-900 dark:text-white">Detectify</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* BG accents */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-black dark:to-zinc-900" />
      <div className="pointer-events-none absolute -top-24 -right-16 w-[28rem] h-[28rem] rounded-full bg-[#e78a53]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 w-[34rem] h-[34rem] rounded-full bg-[#e78a53]/5 blur-3xl" />

      {/* Main */}
      <div className="relative container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
            <MessageCircle className="h-4 w-4 text-orange-600 dark:text-orange-500" />
            <span className="text-sm font-medium text-orange-600 dark:text-orange-500 uppercase tracking-wide">
              Contact
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-zinc-900 dark:text-white">
            Reach Us <span className="italic text-orange-600 dark:text-orange-500 font-serif">Anytime</span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Have questions or need help? We’re here for you.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left – channels */}
          <div className="space-y-6">
            {/* Email card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 backdrop-blur shadow-sm dark:shadow-none"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-orange-500/10">
                  <Mail className="h-6 w-6 text-orange-600 dark:text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Email us</h3>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Facing technical challenges or product concerns? We’ll get back
                within 1–2 business days.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${CONTACT.SUPPORT_EMAIL}`}
                  className="text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 font-medium underline decoration-2 underline-offset-4"
                >
                  {CONTACT.SUPPORT_EMAIL}
                </a>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={copyEmail}
                  className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </motion.div>

            {/* Socials / IM */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 backdrop-blur shadow-sm dark:shadow-none"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-orange-500/10">
                  <MessageCircle className="h-6 w-6 text-orange-600 dark:text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Social Channels
                </h3>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                Connect via your preferred channel for quick updates.
              </p>
              <div className="flex gap-4">
                {[
                  { icon: Instagram, href: CONTACT.INSTAGRAM_URL, label: "Instagram" },
                  { icon: MessageCircle, href: waHref, label: "WhatsApp" },
                  { icon: Mail, href: `mailto:${CONTACT.SUPPORT_EMAIL}`, label: "Email" },
                  { icon: Linkedin, href: CONTACT.LINKEDIN_URL, label: "LinkedIn" },
                ].map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-orange-500/10 hover:bg-orange-500/20 dark:hover:bg-orange-500/20 flex items-center justify-center transition-all hover:-translate-y-1 border border-zinc-200 dark:border-orange-500/20 text-zinc-700 dark:text-orange-500 hover:text-orange-600"
                    aria-label={item.label}
                  >
                    <item.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right – form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur shadow-xl shadow-zinc-200/50 dark:shadow-none"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <MessageCircle className="h-5 w-5 text-orange-600 dark:text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                We’d love to help
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-zinc-700 dark:text-white">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Jane Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-700 dark:text-white">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-orange-500/20"
                />
                {!isEmailValid && formData.email.length > 0 && (
                  <p className="text-xs text-red-500">Please enter a valid email.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-zinc-700 dark:text-white">
                  How may we assist you?
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Give us more info…"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  required
                  className="bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-orange-500/20 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-6 shadow-lg shadow-orange-500/20 disabled:opacity-60 transition-all active:scale-[0.98]"
              >
                {submitting ? "Opening your email app…" : "Send Message"}
              </Button>

              <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
                Prefer email? Write to{" "}
                <a
                  className="underline decoration-dotted hover:text-orange-600 dark:hover:text-zinc-300 transition-colors"
                  href={`mailto:${CONTACT.SUPPORT_EMAIL}`}
                >
                  {CONTACT.SUPPORT_EMAIL}
                </a>
                .
              </p>
            </form>
          </motion.div>
        </div>

        {/* tiny toast */}
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 border backdrop-blur-md shadow-xl transition-colors ${
                toast.ok
                  ? "bg-emerald-50/90 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                  : "bg-red-50/90 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">{toast.text}</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}