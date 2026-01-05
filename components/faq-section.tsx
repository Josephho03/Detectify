"use client"

import { useState } from "react"
import { Plus, Minus, Mail, MessageCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const faqs = [
    {
      question: "How accurate is Detectify’s deepfake detection?",
      answer:
        "Detectify currently achieves above 90% accuracy on most image and video deepfake samples. While the system performs strongly on common manipulation techniques, new and highly sophisticated deepfakes may be harder to identify accurately.",
    },
    {
      question: "What types of media can Detectify analyze?",
      answer:
        "Detectify supports analysis for both images and short videos. It examines facial expressions, blinking patterns, lighting inconsistencies, compression artifacts, and other digital traces.",
    },
    {
      question: "How fast does Detectify process a scan?",
      answer:
        "Image scans typically take 2–5 seconds, while short video scans may take around 10–30 seconds depending on file size.",
    },
    {
      question: "Is Detectify suitable for legal or official investigations?",
      answer:
        "Detectify is designed primarily for learning and awareness, not as official forensic evidence.",
    },
    {
      question: "Can Detectify guarantee 100% accuracy?",
      answer:
        "No detection system can guarantee perfect accuracy. Human review is always recommended.",
    },
    {
      question: "Is Detectify safe and private to use?",
      answer:
        "Yes. Media is processed securely and deleted immediately after scanning.",
    },
  ]

  return (
    <section id="faq" className="relative overflow-hidden pb-24 pt-24">
      {/* Background glow – DARK MODE ONLY */}
      <div className="pointer-events-none absolute inset-0 hidden dark:block">
        <div className="absolute top-1/2 -right-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute top-1/2 -left-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Badge */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 uppercase border-orange-500/40 text-orange-500">
            <span>✶</span>
            <span className="text-sm">Faqs</span>
          </div>
        </motion.div>

        {/* ✅ Title – BOLD */}
        <motion.h2
          className="mx-auto mt-6 max-w-xl text-center text-4xl font-bold md:text-[54px] md:leading-[60px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <span className="text-black dark:text-white">
            Questions? We&apos;ve got{" "}
          </span>
          <span className="text-orange-500">
            answers
          </span>
        </motion.h2>

        <div className="mx-auto mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
          {/* FAQ Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                onClick={() => toggleItem(index)}
                className="
                  cursor-pointer rounded-2xl p-6 transition-all duration-150
                  border bg-white border-black/10 hover:border-orange-400
                  dark:bg-gradient-to-b dark:from-[#2a1408] dark:to-[#120805]
                  dark:border-orange-500/20
                  dark:hover:border-orange-500 dark:hover:shadow-[0_0_20px_rgba(255,115,0,0.35)]
                "
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-medium pr-4 text-black dark:text-white">
                    {faq.question}
                  </h3>

                  <motion.div
                    animate={{ rotate: openItems.includes(index) ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {openItems.includes(index) ? (
                      <Minus className="text-orange-500" size={22} />
                    ) : (
                      <Plus className="text-orange-500" size={22} />
                    )}
                  </motion.div>
                </div>

                <AnimatePresence>
                  {openItems.includes(index) && (
                    <motion.div
                      className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-orange-100/80"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* ✅ CTA – content centered inside border */}
          <div
            className="
              sticky top-24 rounded-2xl border p-8
              bg-white border-black/10
              dark:bg-gradient-to-b dark:from-[#2a1408] dark:to-[#120805]
              dark:border-orange-500/20
              flex flex-col justify-center
            "
          >
            <div className="flex items-center gap-2 mb-4 text-orange-500 justify-center">
              <MessageCircle size={18} />
              <span className="text-sm uppercase">Contact</span>
            </div>

            <h3 className="text-2xl font-bold text-black dark:text-white mb-2 text-center">
              Still Have <span className="italic">Questions?</span>
            </h3>

            <p className="text-neutral-600 dark:text-orange-100/70 mb-6 text-sm text-center">
              Can't find the answer you're looking for? Our team is here to help.
            </p>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl
                         bg-orange-500 hover:bg-orange-600 text-white font-bold
                         px-6 py-3 transition self-center"
            >
              <Mail size={16} />
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
