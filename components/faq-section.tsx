"use client"

import { useState } from "react"
import { Plus, Minus, Mail, MessageCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const faqs = [
    {
      question: "How accurate is the deepfake detection?",
      answer:
        "Our AI-powered detection system achieves over 98% accuracy for video and image deepfakes. The system continuously learns from new deepfake techniques, improving accuracy over time through advanced machine learning algorithms.",
    },
    {
      question: "What types of media can Detectify analyze?",
      answer:
        "Detectify can analyze videos and images. Our multi-modal analysis examines facial movements, lighting inconsistencies, and digital artifacts to detect manipulation across all major media formats including MP4, AVI, JPG, PNG, and more.",
    },
    {
      question: "How fast is the detection process?",
      answer:
        "Real-time detection typically takes 2-5 seconds for images and 10-30 seconds for short videos. Enterprise plans include priority processing for even faster results with dedicated server resources.",
    },
    {
      question: "Can I use Detectify for legal purposes?",
      answer:
        "Yes! Our Professional and Enterprise plans include detailed forensic reports with evidence trails that are admissible in legal proceedings. The reports document all detection methods, confidence scores, and technical findings.",
    },
  ]

  return (
    <section id="faq" className="relative overflow-hidden pb-24 pt-24">
      {/* Background blur effects */}
      <div className="bg-primary/20 absolute top-1/2 -right-20 z-[-1] h-64 w-64 rounded-full opacity-80 blur-3xl"></div>
      <div className="bg-primary/20 absolute top-1/2 -left-20 z-[-1] h-64 w-64 rounded-full opacity-80 blur-3xl"></div>

      <div className="z-10 container mx-auto px-4">
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="border-primary/40 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 uppercase">
            <span>✶</span>
            <span className="text-sm">Faqs</span>
          </div>
        </motion.div>

        <motion.h2
          className="mx-auto mt-6 max-w-xl text-center text-4xl font-medium md:text-[54px] md:leading-[60px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Questions? We've got{" "}
          <span className="bg-gradient-to-b from-foreground via-rose-200 to-primary bg-clip-text text-transparent">
            answers
          </span>
        </motion.h2>

        <div className="mx-auto mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
          {/* FAQ Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="from-secondary/40 to-secondary/10 rounded-2xl border border-white/10 bg-gradient-to-b p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.1)_inset] transition-all duration-300 hover:border-white/20 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleItem(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    toggleItem(index)
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <h3 className="m-0 font-medium pr-4">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: openItems.includes(index) ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className=""
                  >
                    {openItems.includes(index) ? (
                      <Minus className="text-primary flex-shrink-0 transition duration-300" size={24} />
                    ) : (
                      <Plus className="text-primary flex-shrink-0 transition duration-300" size={24} />
                    )}
                  </motion.div>
                </div>
                <AnimatePresence>
                  {openItems.includes(index) && (
                    <motion.div
                      className="mt-4 text-muted-foreground leading-relaxed overflow-hidden"
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{
                        duration: 0.4,
                        ease: "easeInOut",
                        opacity: { duration: 0.2 },
                      }}
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Contact CTA section */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="sticky top-24 from-secondary/40 to-secondary/10 rounded-2xl border border-white/10 bg-gradient-to-b p-8 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.1)_inset]">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary uppercase">Contact</span>
              </div>

              <h3 className="text-2xl font-bold mb-2">
                Still Have <span className="italic font-serif">Questions?</span>
              </h3>

              <p className="text-muted-foreground mb-6 text-sm">
                Can't find the answer you're looking for? Our team is here to help you.
              </p>

              <Link
                href="/contact"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] px-6 py-3 text-sm"
              >
                <Mail className="h-4 w-4" />
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
