"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Brain, ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"

export default function QuizPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)

  const categories = [
    {
      id: "basics",
      title: "Deepfake Basics",
      description: "Learn the fundamentals of deepfake technology",
      icon: "🎭",
      color: "from-orange-500 to-orange-600",
    },
    {
      id: "detection",
      title: "Detection Techniques",
      description: "Understand how to spot deepfakes",
      icon: "🔍",
      color: "from-red-500 to-red-600",
    },
    {
      id: "security",
      title: "Security & Privacy",
      description: "Protect yourself from deepfake threats",
      icon: "🛡️",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      id: "ethics",
      title: "Ethics & Law",
      description: "Legal and ethical implications",
      icon: "⚖️",
      color: "from-green-500 to-green-600",
    },
    {
      id: "scams",
      title: "Scams & Fraud",
      description: "Recognize deepfake-based scams",
      icon: "⚠️",
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "awareness",
      title: "Public Awareness",
      description: "Spread knowledge and stay informed",
      icon: "📢",
      color: "from-blue-500 to-blue-600",
    },
  ]

  const quizzes = {
    basics: [
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
        question: "When did deepfake technology first emerge?",
        options: ["2010", "2014", "2017", "2020"],
        correct: 2,
        explanation:
          "Deepfake technology first emerged around 2017 when AI-generated face-swapping videos became publicly accessible.",
      },
      {
        question: "What does GAN stand for in deepfake technology?",
        options: [
          "General Artificial Network",
          "Generative Adversarial Network",
          "Global Analysis Node",
          "Graphic Animation Network",
        ],
        correct: 1,
        explanation:
          "GAN stands for Generative Adversarial Network, which consists of two neural networks competing to create realistic synthetic media.",
      },
      {
        question: "Can deepfakes be created with just photos?",
        options: [
          "No, only with videos",
          "Yes, but quality is lower",
          "Yes, with similar quality to video-based deepfakes",
          "Only with 3D models",
        ],
        correct: 2,
        explanation:
          "Modern deepfake technology can create convincing videos from just a few photos using advanced AI algorithms.",
      },
    ],
    detection: [
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
        question: "Which facial feature is hardest for deepfakes to replicate accurately?",
        options: ["Eyes and blinking", "Nose shape", "Ear position", "Hair color"],
        correct: 0,
        explanation:
          "Eyes and natural blinking patterns are particularly difficult for deepfake algorithms to replicate convincingly.",
      },
      {
        question: "What should you look for in the background of a suspected deepfake?",
        options: ["Bright colors", "Inconsistencies and warping", "Clear focus", "Natural lighting"],
        correct: 1,
        explanation:
          "Deepfakes often show inconsistencies or warping in the background, especially around the edges of the face.",
      },
      {
        question: "How can audio help detect deepfakes?",
        options: [
          "Audio is always perfect in deepfakes",
          "Mismatched lip-sync and unnatural speech patterns",
          "Audio quality is too high",
          "Background noise is too clear",
        ],
        correct: 1,
        explanation:
          "Deepfakes may have mismatched lip-syncing, unnatural speech patterns, or audio that doesn't match the video quality.",
      },
      {
        question: "What is the best way to verify if a video is authentic?",
        options: [
          "Trust the source immediately",
          "Use multiple detection tools and verify with original sources",
          "Check video quality only",
          "Look at the thumbnail",
        ],
        correct: 1,
        explanation:
          "Always use multiple detection methods and verify with original, trusted sources before concluding authenticity.",
      },
    ],
    security: [
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
      {
        question: "What should you do if you suspect a video is a deepfake?",
        options: [
          "Share it immediately",
          "Verify through multiple sources and use detection tools",
          "Ignore it",
          "Delete your account",
        ],
        correct: 1,
        explanation:
          "Always verify suspicious content through multiple reliable sources and use deepfake detection tools before sharing.",
      },
      {
        question: "How can you protect your own images from being used in deepfakes?",
        options: [
          "Never post photos online",
          "Limit public photos and use privacy settings",
          "Only use black and white photos",
          "Wear sunglasses in all photos",
        ],
        correct: 1,
        explanation:
          "Limit publicly available photos, use strong privacy settings, and be mindful of what you share online.",
      },
      {
        question: "What is biometric authentication's role in fighting deepfakes?",
        options: [
          "It has no role",
          "It provides an additional layer of identity verification",
          "It creates deepfakes",
          "It makes deepfakes easier",
        ],
        correct: 1,
        explanation:
          "Biometric authentication adds an extra layer of security that's harder for deepfakes to bypass, like fingerprint or iris scanning.",
      },
      {
        question: "Should companies implement deepfake detection systems?",
        options: [
          "No, it's too expensive",
          "Yes, especially for security-sensitive operations",
          "Only large companies need them",
          "It's not necessary",
        ],
        correct: 1,
        explanation:
          "Companies, especially those handling sensitive information or financial transactions, should implement deepfake detection to prevent fraud.",
      },
    ],
    ethics: [
      {
        question: "Is creating deepfakes always illegal?",
        options: [
          "Yes, always illegal",
          "No, but using them maliciously can be illegal",
          "Only in certain countries",
          "Never illegal",
        ],
        correct: 1,
        explanation:
          "Creating deepfakes isn't inherently illegal, but using them for fraud, defamation, or non-consensual purposes can violate laws.",
      },
      {
        question: "What is the main ethical concern with deepfake technology?",
        options: [
          "It's too expensive",
          "Consent and potential for harm through misuse",
          "It requires too much computing power",
          "It's difficult to learn",
        ],
        correct: 1,
        explanation:
          "The primary ethical concern is the lack of consent and potential for harm through identity theft, fraud, and misinformation.",
      },
      {
        question: "Are there legitimate uses for deepfake technology?",
        options: [
          "No, all uses are harmful",
          "Yes, in entertainment, education, and accessibility",
          "Only for government use",
          "Only for research",
        ],
        correct: 1,
        explanation:
          "Deepfakes have legitimate uses in film production, education, creating accessibility tools, and artistic expression when used ethically.",
      },
      {
        question: "What is 'consent' in the context of deepfakes?",
        options: [
          "Not important",
          "Permission from the person whose likeness is being used",
          "Only needed for celebrities",
          "Only needed for commercial use",
        ],
        correct: 1,
        explanation:
          "Consent means obtaining explicit permission from individuals before using their likeness in any deepfake creation.",
      },
      {
        question: "How should social media platforms handle deepfakes?",
        options: [
          "Allow all content",
          "Implement detection, labeling, and removal policies",
          "Ban all videos",
          "Ignore the issue",
        ],
        correct: 1,
        explanation:
          "Platforms should use detection tools, clearly label synthetic media, and have policies to remove harmful deepfakes.",
      },
    ],
    scams: [
      {
        question: "How are deepfakes used in financial scams?",
        options: [
          "They're not used in scams",
          "Impersonating executives to authorize fraudulent transactions",
          "Only for entertainment",
          "To improve security",
        ],
        correct: 1,
        explanation:
          "Scammers use deepfakes to impersonate company executives or trusted individuals to authorize fraudulent wire transfers or access sensitive information.",
      },
      {
        question: "What is a 'CEO fraud' deepfake scam?",
        options: [
          "A scam targeting CEOs",
          "Using deepfake audio/video of a CEO to authorize fake payments",
          "CEOs creating scams",
          "A type of phishing email",
        ],
        correct: 1,
        explanation:
          "CEO fraud involves using deepfake technology to impersonate a company executive to trick employees into transferring money or sharing sensitive data.",
      },
      {
        question: "How can you verify a video call is not a deepfake?",
        options: [
          "You can't verify it",
          "Ask personal questions only the real person would know",
          "Check video quality",
          "Trust everyone",
        ],
        correct: 1,
        explanation:
          "Ask specific personal questions, use pre-arranged code words, or verify through a separate communication channel.",
      },
      {
        question: "What should companies do to prevent deepfake scams?",
        options: [
          "Nothing, it's not a real threat",
          "Implement multi-factor authentication and verification protocols",
          "Ban all video calls",
          "Only use email",
        ],
        correct: 1,
        explanation:
          "Companies should use multi-factor authentication, establish verification protocols for sensitive requests, and train employees to recognize deepfakes.",
      },
      {
        question: "Are romance scams using deepfakes becoming more common?",
        options: [
          "No, they don't exist",
          "Yes, scammers use deepfakes to create fake identities",
          "Only in movies",
          "They're decreasing",
        ],
        correct: 1,
        explanation:
          "Scammers increasingly use deepfakes to create convincing fake identities for romance scams, making them harder to detect.",
      },
    ],
    awareness: [
      {
        question: "Why is public awareness about deepfakes important?",
        options: [
          "It's not important",
          "To help people identify and protect against misinformation",
          "Only experts need to know",
          "It causes unnecessary panic",
        ],
        correct: 1,
        explanation:
          "Public awareness helps people critically evaluate media, recognize manipulation, and protect themselves from deepfake-related threats.",
      },
      {
        question: "How can you help spread awareness about deepfakes?",
        options: [
          "Keep the information secret",
          "Share educational resources and discuss with others",
          "Only talk to experts",
          "Ignore the issue",
        ],
        correct: 1,
        explanation:
          "Share reliable educational resources, discuss the topic with friends and family, and promote media literacy in your community.",
      },
      {
        question: "What role does media literacy play in combating deepfakes?",
        options: [
          "No role at all",
          "Critical - helps people question and verify information",
          "Only for journalists",
          "It makes things worse",
        ],
        correct: 1,
        explanation:
          "Media literacy empowers people to critically evaluate content, question sources, and verify information before believing or sharing it.",
      },
      {
        question: "Should schools teach about deepfakes?",
        options: [
          "No, students are too young",
          "Yes, as part of digital literacy education",
          "Only in universities",
          "It's not relevant to education",
        ],
        correct: 1,
        explanation:
          "Schools should include deepfake awareness in digital literacy curricula to prepare students for the modern media landscape.",
      },
      {
        question: "What is the best approach to deepfake awareness?",
        options: [
          "Fear-based warnings only",
          "Balanced education about risks and detection methods",
          "Ignore the technology",
          "Ban all AI technology",
        ],
        correct: 1,
        explanation:
          "A balanced approach that educates about both the risks and detection methods, while promoting critical thinking, is most effective.",
      },
    ],
  }

  const currentQuiz = selectedCategory ? quizzes[selectedCategory as keyof typeof quizzes] : []

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    if (answerIndex === currentQuiz[currentQuestion].correct) {
      setScore(score + 1)
    }
    setShowResult(true)
  }

  const handleNext = () => {
    if (currentQuestion < currentQuiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setCurrentQuestion(0)
      setSelectedAnswer(null)
      setShowResult(false)
      setScore(0)
      setSelectedCategory(null)
    }
  }

  const isQuizComplete = currentQuestion === currentQuiz.length - 1 && showResult

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
              <Brain className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-orange-500">Test Your Knowledge</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance text-foreground sm:text-6xl mb-4">
              Deepfake Awareness Quiz
            </h1>
            <p className="text-lg text-pretty text-muted-foreground max-w-2xl mx-auto">
              Choose a category and test your understanding of deepfakes. Learn how to identify and protect yourself
              from manipulated media.
            </p>
          </motion.div>

          {!selectedCategory ? (
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className="group relative bg-card border border-border rounded-2xl p-8 text-left hover:border-orange-500/50 transition-all hover:shadow-xl"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`text-4xl w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}
                    >
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-orange-500 transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedCategory(null)
                  setCurrentQuestion(0)
                  setScore(0)
                  setSelectedAnswer(null)
                  setShowResult(false)
                }}
                className="mb-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>

              <div className="bg-card border border-border rounded-2xl p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      Question {currentQuestion + 1} of {currentQuiz.length}
                    </span>
                    <span className="text-sm font-medium text-orange-500">Score: {score}</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / currentQuiz.length) * 100}%` }}
                    />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-6">{currentQuiz[currentQuestion].question}</h3>

                <div className="space-y-3 mb-6">
                  {currentQuiz[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => !showResult && handleAnswer(index)}
                      disabled={showResult}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        showResult
                          ? index === currentQuiz[currentQuestion].correct
                            ? "border-green-500 bg-green-500/10"
                            : selectedAnswer === index
                              ? "border-red-500 bg-red-500/10"
                              : "border-border bg-background/50"
                          : selectedAnswer === index
                            ? "border-orange-500 bg-orange-500/10"
                            : "border-border hover:border-orange-500/50 hover:bg-background/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">{option}</span>
                        {showResult && index === currentQuiz[currentQuestion].correct && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {showResult && selectedAnswer === index && index !== currentQuiz[currentQuestion].correct && (
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
                    className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6"
                  >
                    <p className="text-sm text-foreground">
                      <strong>Explanation:</strong> {currentQuiz[currentQuestion].explanation}
                    </p>
                  </motion.div>
                )}

                {showResult && (
                  <Button onClick={handleNext} className="w-full" size="lg">
                    {isQuizComplete ? `Finish Quiz (Final Score: ${score}/${currentQuiz.length})` : "Next Question"}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
