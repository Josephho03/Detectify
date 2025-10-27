"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Brain } from "lucide-react"
import Link from "next/link"

export function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)

  const questions = [
    {
      question: "What is a deepfake?",
      options: [
        "A type of social media filter",
        "AI-generated synthetic media that appears authentic",
        "A video editing software",
        "A photography technique",
      ],
      correct: 1,
      explanation:
        "Deepfakes are synthetic media created using AI that can convincingly replace a person's likeness in video or images.",
    },
    {
      question: "Which technology is primarily used to create deepfakes?",
      options: ["Blockchain", "Deep Learning Neural Networks", "Cloud Computing", "Virtual Reality"],
      correct: 1,
      explanation:
        "Deep learning neural networks, particularly GANs (Generative Adversarial Networks), are the core technology behind deepfakes.",
    },
    {
      question: "What is a common sign of a deepfake video?",
      options: [
        "High video quality",
        "Unnatural blinking patterns or facial movements",
        "Clear audio",
        "Bright lighting",
      ],
      correct: 1,
      explanation:
        "Deepfakes often exhibit unnatural facial movements, irregular blinking, or inconsistent lighting and shadows.",
    },
    {
      question: "Why are deepfakes considered a security threat?",
      options: [
        "They use too much bandwidth",
        "They can be used for impersonation, fraud, and misinformation",
        "They are too expensive to create",
        "They require special equipment",
      ],
      correct: 1,
      explanation:
        "Deepfakes pose serious risks including identity theft, financial fraud, political manipulation, and spreading misinformation.",
    },
  ]

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    if (answerIndex === questions[currentQuestion].correct) {
      setScore(score + 1)
    }
    setShowResult(true)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      // Quiz completed
      setCurrentQuestion(0)
      setSelectedAnswer(null)
      setShowResult(false)
      setScore(0)
    }
  }

  const isQuizComplete = currentQuestion === questions.length - 1 && showResult

  return (
    <section id="quiz" className="relative py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
            <Brain className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Test Your Knowledge</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-balance text-foreground sm:text-5xl mb-4">
            Deepfake Awareness Quiz
          </h2>
          <p className="text-lg text-pretty text-muted-foreground max-w-2xl mx-auto">
            Test your understanding of deepfakes and learn how to identify manipulated media.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className="text-sm font-medium text-primary">Score: {score}</span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-6">{questions[currentQuestion].question}</h3>

            <div className="space-y-3 mb-6">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showResult && handleAnswer(index)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    showResult
                      ? index === questions[currentQuestion].correct
                        ? "border-green-500 bg-green-500/10"
                        : selectedAnswer === index
                          ? "border-red-500 bg-red-500/10"
                          : "border-border bg-background/50"
                      : selectedAnswer === index
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-background/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">{option}</span>
                    {showResult && index === questions[currentQuestion].correct && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {showResult && selectedAnswer === index && index !== questions[currentQuestion].correct && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6"
              >
                <p className="text-sm text-foreground">
                  <strong>Explanation:</strong> {questions[currentQuestion].explanation}
                </p>
              </motion.div>
            )}

            {showResult && (
              <Button onClick={handleNext} className="w-full" size="lg">
                {isQuizComplete ? `Finish Quiz (Final Score: ${score}/${questions.length})` : "Next Question"}
              </Button>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link href="/quiz">
              <Button
                size="lg"
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white bg-transparent"
              >
                More Quiz
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
