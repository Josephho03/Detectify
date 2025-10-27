"use client"

import { motion } from "framer-motion"
import { Calendar, ArrowRight, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function News() {
  const newsItems = [
    {
      category: "Research",
      title: "New AI Model Achieves 99.5% Deepfake Detection Accuracy",
      excerpt:
        "Researchers develop breakthrough neural network architecture that significantly improves detection of sophisticated deepfakes.",
      date: "March 15, 2024",
      image: "/ai-research-lab.png",
    },
    {
      category: "Security",
      title: "Major Social Media Platforms Adopt Deepfake Detection Tools",
      excerpt:
        "Leading platforms announce integration of AI-powered detection systems to combat misinformation and protect users.",
      date: "March 12, 2024",
      image: "/social-media-security.png",
    },
    {
      category: "Policy",
      title: "New Regulations Target Malicious Use of Deepfake Technology",
      excerpt: "Governments worldwide introduce legislation to criminalize harmful deepfake creation and distribution.",
      date: "March 8, 2024",
      image: "/government-policy-meeting.jpg",
    },
    {
      category: "Industry",
      title: "Financial Sector Invests Billions in Deepfake Prevention",
      excerpt:
        "Banks and financial institutions deploy advanced verification systems to prevent deepfake-enabled fraud.",
      date: "March 5, 2024",
      image: "/financial-technology.png",
    },
  ]

  return (
    <section
      id="news"
      className="relative py-24 sm:py-32 bg-gradient-to-b from-transparent via-orange-950/5 to-transparent"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-orange-500">Latest Updates</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-balance text-foreground sm:text-5xl mb-4">
            Deepfake News & Updates
          </h2>
          <p className="text-lg text-pretty text-muted-foreground max-w-2xl mx-auto">
            Stay informed about the latest developments in deepfake technology, detection methods, and security
            measures.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
          {newsItems.map((item, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group cursor-pointer"
            >
              <div className="bg-card border border-border rounded-2xl overflow-hidden h-full hover:border-primary/50 transition-all duration-300">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {item.date}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-pretty text-muted-foreground mb-4">{item.excerpt}</p>
                  <div className="flex items-center gap-2 text-primary font-medium text-sm">
                    Read more
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/news">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
              More News
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
