"use client"

import { useTheme } from "next-themes"
import ScrambleHover from "./ui/scramble"
import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { geist } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { Shield, Zap, BarChart3, GraduationCap, Video, ImageIcon } from "lucide-react"

export default function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const { theme } = useTheme()
  const [isHovering, setIsHovering] = useState(false)
  const [isCliHovering, setIsCliHovering] = useState(false)
  const [isFeature3Hovering, setIsFeature3Hovering] = useState(false)
  const [isFeature4Hovering, setIsFeature4Hovering] = useState(false)

  return (
    <motion.section
      id="features"
      className="text-foreground relative overflow-hidden py-12 sm:py-24 md:py-32"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="bg-primary absolute -top-10 left-1/2 h-16 w-44 -translate-x-1/2 rounded-full opacity-40 blur-3xl select-none"></div>
      <div className="via-primary/50 absolute top-0 left-1/2 h-px w-3/5 -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent transition-all ease-in-out"></div>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5, delay: 0 }}
        className="container mx-auto flex flex-col items-center gap-6 sm:gap-12"
      >
        <h2
          className={cn(
            "via-foreground mb-8 bg-gradient-to-b from-zinc-800 to-zinc-700 dark:from-zinc-200 dark:to-zinc-400 bg-clip-text text-center text-4xl font-semibold tracking-tighter text-transparent md:text-[54px] md:leading-[60px]",
            geist.className,
          )}
        >
          Main Features
        </h2>
        <div className="cursor-none">
          <div className="grid grid-cols-12 gap-4 justify-center">
            <motion.div
              className="group border-primary/40 text-card-foreground relative col-span-12 flex flex-col overflow-hidden rounded-xl border-2 p-6 shadow-xl transition-all ease-in-out md:col-span-6 xl:col-span-6 xl:col-start-2"
              onMouseEnter={() => setIsCliHovering(true)}
              onMouseLeave={() => setIsCliHovering(false)}
              ref={ref}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{
                scale: 1.02,
                borderColor: "rgba(234, 88, 12, 0.6)",
                boxShadow: "0 0 30px rgba(234, 88, 12, 0.2)",
              }}
              style={{ transition: "all 0s ease-in-out" }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl leading-none font-semibold tracking-tight">
                    Deepfake Image and Video Detection
                  </h3>
                </div>
                <div className="text-md text-muted-foreground flex flex-col gap-2 text-sm">
                  <p className="max-w-[460px]">
                    Advanced computer vision algorithms analyze facial features, lighting patterns, and pixel-level
                    inconsistencies to identify manipulated media with high accuracy.
                  </p>
                </div>
              </div>
              <div className="flex grow items-center justify-center select-none relative min-h-[300px] p-8">
                <div className="relative flex items-center justify-center gap-12">
                  {/* Left side - Media types */}
                  <div className="flex flex-col gap-4">
                    <motion.div
                      className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
                      whileHover={{ scale: 1.05, borderColor: "rgba(234, 88, 12, 0.4)" }}
                      animate={isCliHovering ? { x: [0, -10, 0] } : {}}
                      transition={{ duration: 2, repeat: isCliHovering ? Number.POSITIVE_INFINITY : 0 }}
                    >
                      <Video className="h-6 w-6 text-primary" />
                      <span className="font-medium">Video</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
                      whileHover={{ scale: 1.05, borderColor: "rgba(234, 88, 12, 0.4)" }}
                      animate={isCliHovering ? { x: [0, -10, 0] } : {}}
                      transition={{ duration: 2, delay: 0.2, repeat: isCliHovering ? Number.POSITIVE_INFINITY : 0 }}
                    >
                      <ImageIcon className="h-6 w-6 text-primary" />
                      <span className="font-medium">Image</span>
                    </motion.div>
                  </div>

                  {/* Center - Shield icon */}
                  <motion.div
                    className="p-8 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-2 border-orange-500/30"
                    animate={isCliHovering ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                    transition={{ duration: 2, repeat: isCliHovering ? Number.POSITIVE_INFINITY : 0 }}
                  >
                    <Shield className="h-16 w-16 text-primary" />
                  </motion.div>

                  {/* Right side - Detection results */}
                  <div className="flex flex-col gap-4">
                    {[
                      { label: "Authentic", color: "text-green-500", icon: "✓" },
                      { label: "Suspicious", color: "text-yellow-500", icon: "⚠" },
                      { label: "Fake", color: "text-red-500", icon: "✕" },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border min-w-[140px]"
                        whileHover={{ scale: 1.05, borderColor: "rgba(234, 88, 12, 0.4)" }}
                        animate={isCliHovering ? { x: [0, 10, 0] } : {}}
                        transition={{
                          duration: 2,
                          delay: index * 0.1,
                          repeat: isCliHovering ? Number.POSITIVE_INFINITY : 0,
                        }}
                      >
                        <span className={`text-xl ${item.color}`}>{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="group border-primary/40 text-card-foreground relative col-span-12 flex flex-col overflow-hidden rounded-xl border-2 p-6 shadow-xl transition-all ease-in-out md:col-span-6 xl:col-span-6 xl:col-start-8"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              ref={ref}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{
                scale: 1.02,
                borderColor: "rgba(234, 88, 12, 0.6)",
                boxShadow: "0 0 30px rgba(234, 88, 12, 0.2)",
              }}
              style={{ transition: "all 0s ease-in-out" }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl leading-none font-semibold tracking-tight">Real Time Analysis</h3>
                </div>
                <div className="text-md text-muted-foreground flex flex-col gap-2 text-sm">
                  <p className="max-w-[460px]">
                    Process and analyze media in real-time with instant results. Get immediate feedback on uploaded
                    content with millisecond response times.
                  </p>
                </div>
              </div>
              <div className="flex min-h-[300px] grow items-center justify-center select-none relative">
                <h1 className="text-center text-5xl leading-[100%] font-semibold sm:leading-normal lg:text-6xl">
                  <span className='bg-background relative inline-block w-fit rounded-md border px-1.5 py-0.5 before:absolute before:top-0 before:left-0 before:z-10 before:h-full before:w-full before:bg-[url("/noise.gif")] before:opacity-[0.09] before:content-[""]'>
                    <ScrambleHover
                      text="Detectify"
                      scrambleSpeed={70}
                      maxIterations={20}
                      useOriginalCharsOnly={false}
                      className="cursor-pointer bg-gradient-to-t from-orange-500 to-orange-600 bg-clip-text text-transparent"
                      isHovering={isHovering}
                      setIsHovering={setIsHovering}
                      characters="abcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;':\,./<>?"
                    />
                  </span>
                </h1>
                <div className="absolute top-1/2 w-full translate-y-20 scale-x-[1.2] opacity-70 transition-all duration-1000 group-hover:translate-y-8 group-hover:opacity-100">
                  <div className="from-primary/50 to-primary/0 absolute left-1/2 h-[256px] w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] bg-radial from-10% to-60% opacity-20 sm:h-[512px] dark:opacity-100"></div>
                  <div className="from-primary/30 to-primary/0 absolute left-1/2 h-[128px] w-[40%] -translate-x-1/2 scale-200 rounded-[50%] bg-radial from-10% to-60% opacity-20 sm:h-[256px] dark:opacity-100"></div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="group border-primary/40 text-card-foreground relative col-span-12 flex flex-col overflow-hidden rounded-xl border-2 p-6 shadow-xl transition-all ease-in-out md:col-span-6 xl:col-span-6 xl:col-start-2"
              onMouseEnter={() => setIsFeature3Hovering(true)}
              onMouseLeave={() => setIsFeature3Hovering(false)}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              whileHover={{
                scale: 1.02,
                borderColor: "rgba(234, 88, 12, 0.5)",
                boxShadow: "0 0 30px rgba(234, 88, 12, 0.2)",
              }}
              style={{ transition: "all 0s ease-in-out" }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl leading-none font-semibold tracking-tight">Confidence Score Indicator</h3>
                </div>
                <div className="text-md text-muted-foreground flex flex-col gap-2 text-sm">
                  <p className="max-w-[460px]">
                    Clear visual indicators showing detection confidence levels with color-coded risk alerts. Understand
                    the likelihood of manipulation at a glance.
                  </p>
                </div>
              </div>
              <div className="flex grow items-center justify-center select-none relative min-h-[300px] p-4">
                <div className="w-full max-w-md space-y-6">
                  <div className="text-center">
                    <motion.div
                      className="text-6xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"
                      animate={isFeature3Hovering ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                      transition={{ duration: 0.6 }}
                    >
                      87.3%
                    </motion.div>
                    <p className="text-sm text-muted-foreground mt-2">Confidence Score</p>
                  </div>

                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                        initial={{ width: "0%" }}
                        animate={isFeature3Hovering ? { width: "87.3%" } : { width: "0%" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Low Risk</span>
                      <span>High Risk</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Authentic", color: "bg-green-500", value: "12.7%" },
                      { label: "Suspicious", color: "bg-yellow-500", value: "0%" },
                      { label: "Fake", color: "bg-red-500", value: "87.3%" },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className="p-3 rounded-lg border border-border bg-card text-center"
                        whileHover={{ scale: 1.05 }}
                        animate={isFeature3Hovering && index === 2 ? { borderColor: "rgba(234, 88, 12, 0.6)" } : {}}
                      >
                        <div className={`w-3 h-3 ${item.color} rounded-full mx-auto mb-2`} />
                        <div className="text-xs font-medium">{item.label}</div>
                        <div className="text-sm font-bold mt-1">{item.value}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="group border-primary/40 text-card-foreground relative col-span-12 flex flex-col overflow-hidden rounded-xl border-2 p-6 shadow-xl transition-all ease-in-out md:col-span-6 xl:col-span-6 xl:col-start-8"
              onMouseEnter={() => setIsFeature4Hovering(true)}
              onMouseLeave={() => setIsFeature4Hovering(false)}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(234, 88, 12, 0.3)",
                borderColor: "rgba(234, 88, 12, 0.6)",
              }}
              style={{ transition: "all 0s ease-in-out" }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl leading-none font-semibold tracking-tight">Deepfake Awareness & Education</h3>
                </div>
                <div className="text-md text-muted-foreground flex flex-col gap-2 text-sm">
                  <p className="max-w-[460px]">
                    Educational feedback explaining why content is flagged with examples of common manipulation risks
                    related to scams, impersonation, and misinformation.
                  </p>
                </div>
              </div>
              <div className="flex grow items-center justify-center select-none relative min-h-[300px] p-4">
                <div className="w-full max-w-md space-y-4">
                  {[
                    {
                      icon: "🎭",
                      title: "Impersonation",
                      desc: "Learn to spot fake celebrity or authority figure videos",
                    },
                    {
                      icon: "💰",
                      title: "Financial Scams",
                      desc: "Identify deepfake videos used in investment fraud",
                    },
                    {
                      icon: "📰",
                      title: "Misinformation",
                      desc: "Detect manipulated news and political content",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-all"
                      initial={{ opacity: 1, x: 0 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{item.icon}</div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  )
}
