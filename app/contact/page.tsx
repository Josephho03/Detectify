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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-4 z-50 mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between rounded-full bg-black/80 backdrop-blur-sm border border-zinc-800 shadow-lg px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white">Detectify</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* BG accents */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
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
            <MessageCircle className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-500 uppercase">
              Contact
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Reach Us <span className="italic">Anytime</span>
          </h1>
          <p className="text-lg text-zinc-400">
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
              className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-orange-500/10">
                  <Mail className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Email us</h3>
              </div>
              <p className="text-zinc-400 mb-4">
                Facing technical challenges or product concerns? We’ll get back
                within 1–2 business days.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${CONTACT.SUPPORT_EMAIL}`}
                  className="text-orange-500 hover:text-orange-400 font-medium underline"
                >
                  {CONTACT.SUPPORT_EMAIL}
                </a>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={copyEmail}
                  className="border-zinc-700 text-zinc-200 hover:bg-zinc-800 inline-flex gap-2"
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
              className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-orange-500/10">
                  <MessageCircle className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  You can reach us on these platforms
                </h3>
              </div>
              <p className="text-zinc-400 mb-6">
                Connect via your preferred channel.
              </p>
              <div className="flex gap-4">
                <a
                  href={CONTACT.INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-orange-500/10 hover:bg-orange-500/20 flex items-center justify-center transition-all hover:scale-110 border border-orange-500/20"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-orange-500" />
                </a>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-orange-500/10 hover:bg-orange-500/20 flex items-center justify-center transition-all hover:scale-110 border border-orange-500/20"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-5 w-5 text-orange-500" />
                </a>
                <a
                  href={`mailto:${CONTACT.SUPPORT_EMAIL}`}
                  className="w-12 h-12 rounded-full bg-orange-500/10 hover:bg-orange-500/20 flex items-center justify-center transition-all hover:scale-110 border border-orange-500/20"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5 text-orange-500" />
                </a>
                <a
                  href={CONTACT.LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-orange-500/10 hover:bg-orange-500/20 flex items-center justify-center transition-all hover:scale-110 border border-orange-500/20"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5 text-orange-500" />
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right – form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <MessageCircle className="h-5 w-5 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-white">
                We’d love to help — tell us more
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Honeypot (hidden) */}
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
                <Label htmlFor="fullName" className="text-white">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Jane Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#e78a53] focus:ring-[#e78a53]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
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
                  className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#e78a53] focus:ring-[#e78a53]/20"
                />
                {!isEmailValid && formData.email.length > 0 && (
                  <p className="text-xs text-red-400">Please enter a valid email.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-white">
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
                  className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#e78a53] focus:ring-[#e78a53]/20"
                />
              </div>

              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-6 disabled:opacity-60"
              >
                {submitting ? "Opening your email app…" : "Send your message"}
              </Button>

              <p className="text-xs text-zinc-500 text-center">
                Prefer email? Write to{" "}
                <a
                  className="underline decoration-dotted hover:text-zinc-300"
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
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div
              className={`flex items-center gap-2 rounded-full px-4 py-2 border backdrop-blur ${
                toast.ok
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                  : "bg-red-500/10 border-red-500/20 text-red-300"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">{toast.text}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
