"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Upload, Scan, FileCheck, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"

export function HowToUse() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      icon: Upload,
      title: "Upload Your Media",
      description: "Upload images or video frames that you want to verify. We support JPG, PNG, and MP4 formats.",
      details:
        "Simply drag and drop your files or click to browse. Our system accepts multiple file formats and processes them securely.",
    },
    {
      icon: Scan,
      title: "AI Analysis",
      description:
        "Our advanced AI analyzes facial features, patterns, and inconsistencies using computer vision techniques.",
      details:
        "Deep learning algorithms examine thousands of data points including facial landmarks, lighting consistency, and digital artifacts to detect manipulation.",
    },
    {
      icon: FileCheck,
      title: "Get Results",
      description:
        "Receive detailed detection results with confidence scores and visual indicators highlighting suspicious areas.",
      details:
        "View comprehensive reports with confidence percentages, risk levels, and highlighted areas of concern in an easy-to-understand format.",
    },
  ]

  const nextStep = () => {
    setActiveStep((prev) => (prev + 1) % steps.length)
  }

  const prevStep = () => {
    setActiveStep((prev) => (prev - 1 + steps.length) % steps.length)
  }

  return (
    <section
      id="how-to-use"
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
            <Sparkles className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-500">Process</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-balance text-foreground sm:text-5xl mb-4">
            Our Simple & <span className="italic font-serif">Smart Process</span>
          </h2>
          <p className="text-lg text-pretty text-muted-foreground max-w-2xl mx-auto">
            Everything you need to detect, analyze, and understand deepfakes, all in one place.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Step indicator dots */}
            <div className="flex justify-center gap-3 mb-12">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`transition-all duration-300 ${
                    activeStep === index
                      ? "w-12 h-3 bg-orange-500 rounded-full"
                      : "w-3 h-3 bg-border rounded-full hover:bg-orange-500/50"
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            {/* Main content card */}
            <div className="relative bg-card border border-border rounded-3xl p-8 md:p-12 shadow-xl overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left side - Icon and visual */}
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl" />
                        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-2xl">
                          {React.createElement(steps[activeStep].icon, {
                            className: "h-16 w-16 text-white",
                          })}
                        </div>
                      </div>

                      {/* Progress indicator */}
                      <div className="flex gap-2">
                        {steps.map((_, index) => (
                          <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              index <= activeStep ? "w-12 bg-orange-500" : "w-8 bg-border"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Right side - Content */}
                    <div className="space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
                        <span className="text-xs font-bold text-orange-500">STEP {activeStep + 1}</span>
                      </div>

                      <h3 className="text-3xl md:text-4xl font-bold text-foreground">{steps[activeStep].title}</h3>

                      <p className="text-lg text-muted-foreground leading-relaxed">{steps[activeStep].description}</p>

                      <p className="text-sm text-muted-foreground/80 leading-relaxed">{steps[activeStep].details}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows */}
              <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
                <button
                  onClick={prevStep}
                  className="pointer-events-auto w-12 h-12 rounded-full bg-background border border-border hover:border-orange-500 hover:bg-orange-500/10 flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110"
                  aria-label="Previous step"
                >
                  <ChevronLeft className="h-6 w-6 text-foreground" />
                </button>
                <button
                  onClick={nextStep}
                  className="pointer-events-auto w-12 h-12 rounded-full bg-background border border-border hover:border-orange-500 hover:bg-orange-500/10 flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110"
                  aria-label="Next step"
                >
                  <ChevronRight className="h-6 w-6 text-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
