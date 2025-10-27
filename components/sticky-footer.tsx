"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Instagram, MessageCircle, Mail, Github, Linkedin } from "lucide-react";
import Link from "next/link";

const CONTACT = {
  instagram: "https://www.instagram.com/joseph_ho1501/",
  whatsappNumber: "60167335171", // no "+"; country code + number
  whatsappText: "Hi Detectify team! I have a question.",
  email: "Tp063370@mail.apu.edu.my",
  linkedin: "https://www.linkedin.com/in/ho-feng-sheng/",
  github: "https://github.com/Josephho03",
};
/* ------------------------------ */

export function StickyFooter() {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          const h = window.innerHeight;
          const d = document.documentElement.scrollHeight;
          setIsAtBottom(y + h >= d - 200);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waHref = `https://wa.me/${CONTACT.whatsappNumber}${
    CONTACT.whatsappText ? `?text=${encodeURIComponent(CONTACT.whatsappText)}` : ""
  }`;

  return (
    <AnimatePresence>
      {isAtBottom && (
        <motion.div
          className="fixed z-40 bottom-0 left-0 w-full h-80 flex justify-center items-center"
          style={{ backgroundColor: "#ea580c" }}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div
            className="relative overflow-hidden w-full h-full flex flex-col justify-between px-8 sm:px-12 py-8"
            style={{ color: "#ffffff" }}
          >
            <motion.div
              className="flex flex-col sm:flex-row justify-between items-start gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Detectify</h3>
                <p className="text-sm opacity-90 max-w-xs">
                  AI-powered deepfake detection platform protecting digital authenticity worldwide.
                </p>
              </div>

              <div className="flex gap-12 sm:gap-16">
                <ul className="space-y-2">
                  <li className="font-semibold mb-3">Platform</li>
                  <li>
                    <a href="#features" className="hover:underline opacity-90 hover:opacity-100 text-sm">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#how-to-use" className="hover:underline opacity-90 hover:opacity-100 text-sm">
                      How to use
                    </a>
                  </li>
                  <li>
                    <Link href="/detect" className="hover:underline opacity-90 hover:opacity-100 text-sm">
                      Detect Now
                    </Link>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="font-semibold mb-3">Learn</li>
                  <li>
                    <Link href="/quiz" className="hover:underline opacity-90 hover:opacity-100 text-sm">
                      Quiz
                    </Link>
                  </li>
                  <li>
                    <a href="#news" className="hover:underline opacity-90 hover:opacity-100 text-sm">
                      News
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="hover:underline opacity-90 hover:opacity-100 text-sm">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Contact Us</h4>
                <div className="flex gap-3">
                  <a
                    href={CONTACT.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                    aria-label="Email"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                  <a
                    href={CONTACT.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                    aria-label="GitHub"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                  <a
                    href={CONTACT.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8 border-t border-white/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="text-sm opacity-75">© 2025 Detectify. All rights reserved.</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
