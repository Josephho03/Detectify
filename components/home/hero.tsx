"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Scan } from "lucide-react"

export default function Hero() {
  const [mounted, setMounted] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <>
      <section className="relative overflow-hidden min-h-screen flex flex-col">
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(234, 88, 12, 0.15), transparent 50%)`,
            }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent" />

          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:64px_64px]" />

          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-orange-500/30 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                x: [null, Math.random() * window.innerWidth],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 py-24 sm:py-32 relative z-10 flex-1 flex flex-col">
          <div className="mx-auto max-w-4xl text-center flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold tracking-tight text-balance text-foreground sm:text-6xl lg:text-7xl">
                Protect Your Digital{" "}
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Identity
                </span>
                <br />
                from Deepfake Threats
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mb-12 max-w-2xl text-lg text-pretty text-muted-foreground"
            >
              Advanced AI and computer vision technology that analyzes facial features and patterns in real-time to
              detect manipulated media. Safeguard against scams, impersonation, and misinformation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a href="/detect">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group cursor-pointer border border-border bg-card gap-2 h-[60px] flex items-center p-[10px] rounded-full"
                >
                  <div className="border border-border bg-primary h-[40px] rounded-full flex items-center justify-center text-primary-foreground">
                    <p className="font-medium tracking-tight mr-3 ml-3 flex items-center gap-2 justify-center text-base">
                      <Scan className="h-5 w-5" />
                      Start Detection
                    </p>
                  </div>
                  <div className="text-muted-foreground group-hover:ml-4 ease-in-out transition-all size-[24px] flex items-center justify-center rounded-full border-2 border-border">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-arrow-right group-hover:rotate-180 ease-in-out transition-all"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </div>
                </motion.div>
              </a>

              <a href="#how-to-use">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-full border border-border bg-background/50 backdrop-blur-sm text-foreground font-medium hover:bg-background/80 transition-all"
                >
                  Learn How It Works
                </motion.button>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">99.2%</div>
                <div className="text-sm text-muted-foreground mt-1">Detection Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">&lt;2s</div>
                <div className="text-sm text-muted-foreground mt-1">Analysis Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">500K+</div>
                <div className="text-sm text-muted-foreground mt-1">Scans Protected</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
