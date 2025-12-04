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
      question: "How accurate is Detectify’s deepfake detection?",
      answer:
        "Detectify currently achieves above 90% accuracy on most image and video deepfake samples. While the system performs strongly on common manipulation techniques, new and highly sophisticated deepfakes may be harder to identify accurately. We continuously improve the model as new deepfake methods emerge.",
    },
    {
      question: "What types of media can Detectify analyze?",
      answer:
        "Detectify supports analysis for both images and short videos. It examines facial expressions, blinking patterns, lighting inconsistencies, compression artifacts, and other digital traces to flag possible manipulation. Supported formats include images (JPG, PNG) and videos (MP4, MOV).",
    },
    {
      question: "How fast does Detectify process a scan?",
      answer:
        "Image scans typically take 2–5 seconds, while short video scans may take around 10–30 seconds depending on file size and complexity. Processing times may vary based on your device and available network speed.",
    },
    {
      question: "Is Detectify suitable for legal or official investigations?",
      answer:
        "Detectify is designed primarily for learning, awareness, and personal verification. While results can offer useful insights, they are not intended to serve as official forensic evidence. For legal cases, we recommend consulting digital forensics professionals.",
    },
    {
      question: "Can Detectify guarantee 100% accuracy?",
      answer:
        "No deepfake detection tool can guarantee perfect accuracy. Deepfake techniques evolve rapidly, and some high-quality manipulations may appear very realistic. Detectify aims to help users identify suspicious content, but final judgement should always involve human review.",
    },
    {
      question: "Is Detectify safe and private to use?",
      answer:
        "Yes. Uploaded images and videos are processed securely and are not stored or shared. Media is used solely for the purpose of generating a detection result and is deleted immediately after scanning.",
    },
  ];

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
