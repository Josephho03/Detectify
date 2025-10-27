"use client"

import { motion } from "framer-motion"
import { Calendar, ArrowLeft, TrendingUp, Clock, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export default function NewsPage() {
  const allNews = [
    {
      category: "Research",
      title: "New AI Model Achieves 99.5% Deepfake Detection Accuracy",
      excerpt:
        "Researchers develop breakthrough neural network architecture that significantly improves detection of sophisticated deepfakes.",
      content:
        "A team of researchers from leading universities has developed a new AI model that achieves unprecedented accuracy in detecting deepfakes. The model uses advanced neural network architecture and can identify even the most sophisticated manipulations.",
      date: "March 15, 2024",
      author: "Dr. Sarah Chen",
      readTime: "5 min read",
      image: "/ai-research-lab.png",
    },
    {
      category: "Security",
      title: "Major Social Media Platforms Adopt Deepfake Detection Tools",
      excerpt:
        "Leading platforms announce integration of AI-powered detection systems to combat misinformation and protect users.",
      content:
        "Major social media companies have announced the integration of advanced deepfake detection tools into their platforms. This move aims to combat the spread of misinformation and protect users from manipulated content.",
      date: "March 12, 2024",
      author: "Michael Rodriguez",
      readTime: "4 min read",
      image: "/social-media-security.png",
    },
    {
      category: "Policy",
      title: "New Regulations Target Malicious Use of Deepfake Technology",
      excerpt: "Governments worldwide introduce legislation to criminalize harmful deepfake creation and distribution.",
      content:
        "Governments around the world are introducing new legislation to address the malicious use of deepfake technology. These regulations aim to criminalize the creation and distribution of harmful deepfakes while protecting legitimate uses.",
      date: "March 8, 2024",
      author: "Jennifer Park",
      readTime: "6 min read",
      image: "/government-policy-meeting.jpg",
    },
    {
      category: "Industry",
      title: "Financial Sector Invests Billions in Deepfake Prevention",
      excerpt:
        "Banks and financial institutions deploy advanced verification systems to prevent deepfake-enabled fraud.",
      content:
        "The financial sector is investing billions of dollars in deepfake prevention technologies. Banks and financial institutions are deploying advanced verification systems to protect against deepfake-enabled fraud and identity theft.",
      date: "March 5, 2024",
      author: "David Thompson",
      readTime: "5 min read",
      image: "/financial-technology.png",
    },
    {
      category: "Technology",
      title: "Blockchain Technology Proposed for Media Authentication",
      excerpt:
        "New blockchain-based system aims to verify the authenticity of digital media from creation to distribution.",
      content:
        "Researchers propose using blockchain technology to create an immutable record of digital media authenticity. This system would track media from creation to distribution, making it easier to verify genuine content.",
      date: "March 1, 2024",
      author: "Alex Kumar",
      readTime: "7 min read",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      category: "Education",
      title: "Universities Launch Deepfake Awareness Programs",
      excerpt: "Educational institutions worldwide introduce courses on media literacy and deepfake detection.",
      content:
        "Universities are launching comprehensive programs to educate students about deepfakes and media literacy. These courses cover detection techniques, ethical implications, and the societal impact of synthetic media.",
      date: "February 28, 2024",
      author: "Prof. Emily Watson",
      readTime: "4 min read",
      image: "/placeholder.svg?height=400&width=600",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-foreground">Detectify</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <section className="relative py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-orange-500">Latest Updates</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance text-foreground sm:text-6xl mb-4">
              Deepfake News & Updates
            </h1>
            <p className="text-lg text-pretty text-muted-foreground max-w-2xl mx-auto">
              Stay informed about the latest developments in deepfake technology, detection methods, and security
              measures.
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto space-y-8">
            {allNews.map((item, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 aspect-video md:aspect-square overflow-hidden">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="md:col-span-2 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-4 mb-3 flex-wrap">
                          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                            {item.category}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {item.date}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            {item.author}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {item.readTime}
                          </div>
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                          {item.title}
                        </h2>
                        <p className="text-sm text-pretty text-muted-foreground mb-4">{item.excerpt}</p>
                        <p className="text-sm text-muted-foreground">{item.content}</p>
                      </div>
                      <Button variant="ghost" className="w-fit mt-4 text-orange-500 hover:text-orange-600">
                        Read Full Article →
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
