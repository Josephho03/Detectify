"use client";
import { useState, useEffect } from "react";
import Hero from "@/components/home/hero";
import Features from "@/components/features";
import { HowToUse } from "@/components/how-to-use";
import { Quiz } from "@/components/quiz";
import { News } from "@/components/news";
import { FAQSection } from "@/components/faq-section";
import { StickyFooter } from "@/components/sticky-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { Shield } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import AuthButtons from "@/components/auth-buttons";
import ChatWidget from "@/components/ChatWidget"; 


export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMobileNavClick = (elementId: string) => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        const headerOffset = 120;
        const elementPosition =
          element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  const navItems = [
    { id: "features", label: "Features" },
    { id: "how-to-use", label: "How to use" },
    { id: "detect-now", label: "Detect Now" },
    { id: "quiz", label: "Quiz" },
    { id: "news", label: "News" },
    { id: "faq", label: "FAQ" },
  ];

  const cb = [0.22, 1, 0.36, 1] as const;

  const fadeInUpVariants: Variants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.1, ease: cb },
    },
  };

  const fadeInLeftVariants: Variants = {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 1.1, ease: cb },
    },
  };

  const fadeInRightVariants: Variants = {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 1.1, ease: cb },
    },
  };

  const scaleInVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1.1, ease: cb },
    },
  };

  return (
    <div className="min-h-screen w-full relative bg-background">
      {/* Pearl Mist Background with Top Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 35% at 50% 0%, rgba(234, 88, 12, 0.12), transparent 60%), var(--background)",
        }}
      />

      {/* Desktop Header */}
      <header
        className={`sticky top-0 z-[50] mx-auto hidden w-full flex-row items-center justify-between self-start rounded-full bg-background/80 md:flex backdrop-blur-sm border border-border/50 shadow-lg transition-all duration-300 ${
          isScrolled ? "max-w-4xl px-2" : "max-w-6xl px-4"
        } py-2`}
      >
        {/* Left: Logo */}
        <a
          href="/"
          className={`z-[60] flex items-center justify-center gap-2 transition-all duration-300 ${
            isScrolled ? "ml-4" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-foreground">Detectify</span>
          </div>
        </a>

        {/* Center Nav (now behind right buttons) */}
        <div className="absolute inset-0 flex items-center justify-center space-x-1 text-sm font-medium text-muted-foreground pointer-events-none z-[40]">
          <div className="flex gap-1 pointer-events-auto">
            {navItems.map((item) => (
              <a
                key={item.id}
                className="relative px-3 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  if (item.id === "detect-now") {
                    window.location.href = "/detect";
                    return;
                  }
                  const element = document.getElementById(item.id);
                  if (element) {
                    const headerOffset = 120;
                    const y =
                      element.getBoundingClientRect().top +
                      window.pageYOffset -
                      headerOffset;
                    window.scrollTo({ top: y, behavior: "smooth" });
                  }
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Right side: theme, login, signup */}
        <div className="flex items-center gap-4 z-[60] relative">
          <ThemeToggle />
          <AuthButtons />
        </div>
      </header>

      {/* Mobile Header */}
      <header className="sticky top-4 z-[9999] mx-4 flex w-auto flex-row items-center justify-between rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg md:hidden px-4 py-3">
        <a className="flex items-center justify-center gap-2" href="/">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-foreground text-sm">Detectify</span>
        </a>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-background/50 border border-border/50 transition-colors hover:bg-background/80"
            aria-label="Toggle menu"
          >
            <div className="flex flex-col items-center justify-center w-5 h-5 space-y-1">
              <span
                className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${
                  isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              ></span>
              <span
                className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${
                  isMobileMenuOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${
                  isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              ></span>
            </div>
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm md:hidden">
          <div className="absolute top-20 left-4 right-4 bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl p-6">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "detect-now") {
                      window.location.href = "/detect";
                      return;
                    }
                    handleMobileNavClick(item.id);
                  }}
                  className="text-left px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50"
                >
                  {item.label}
                </button>
              ))}
              <div className="border-t border-border/50 pt-4 mt-4 flex flex-col space-y-3">
                <a
                  href="/login"
                  className="px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50 cursor-pointer"
                >
                  Log In
                </a>
                <a
                  href="/signup"
                  className="px-4 py-3 text-lg font-bold text-center bg-gradient-to-b from-orange-500 to-orange-600 text-white rounded-lg shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  Sign Up
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <Hero />

      <motion.div
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUpVariants}
      >
        <Features />
      </motion.div>

      <motion.div
        id="how-to-use"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInLeftVariants}
      >
        <HowToUse />
      </motion.div>

      <motion.div
        id="quiz"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={scaleInVariants}
      >
        <Quiz />
      </motion.div>

      <motion.div
        id="news"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInRightVariants}
      >
        <News />
      </motion.div>

      <motion.div
        id="faq"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUpVariants}
        className="mb-[500px]"
      >
        <FAQSection />
      </motion.div>

      <StickyFooter />

      {/* ✅ NEW: Floating Chatbot (does not affect layout) */}
      <ChatWidget
        title="Detectify Assistant"
        context={{
          page: "home",
          sections: navItems.map((n) => n.label),
        }}
      />
    </div>
  );
}
