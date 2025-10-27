"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Upload, Loader2, CheckCircle, XCircle, AlertTriangle, ArrowLeft, Shield, ImageIcon, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DetectPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<"authentic" | "suspicious" | "deepfake" | null>(null)
  const [confidence, setConfidence] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)

  const handleUpload = () => {
    setIsAnalyzing(true)
    setResult(null)

    // Simulate analysis
    setTimeout(() => {
      const outcomes: Array<"authentic" | "suspicious" | "deepfake"> = ["authentic", "suspicious", "deepfake"]
      const randomResult = outcomes[Math.floor(Math.random() * outcomes.length)]
      setResult(randomResult)
      setConfidence(Math.floor(Math.random() * 30) + 70)
      setIsAnalyzing(false)
    }, 3000)
  }

  const getResultConfig = () => {
    switch (result) {
      case "authentic":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/50",
          title: "Authentic Media",
          description: "No signs of manipulation detected. This media appears to be genuine.",
        }
      case "suspicious":
        return {
          icon: AlertTriangle,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/50",
          title: "Suspicious Content",
          description: "Some inconsistencies detected. Further verification recommended.",
        }
      case "deepfake":
        return {
          icon: XCircle,
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/50",
          title: "Deepfake Detected",
          description: "Strong indicators of manipulation found. This media is likely synthetic.",
        }
      default:
        return null
    }
  }

  const resultConfig = getResultConfig()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

      {/* Main Content */}
      <section className="relative py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl font-bold tracking-tight text-balance text-foreground sm:text-6xl mb-4">
              Detect Deepfakes Now
            </h1>
            <p className="text-lg text-pretty text-muted-foreground max-w-2xl mx-auto">
              Upload an image or video to analyze for deepfake manipulation. Get instant results with detailed
              confidence scores and forensic analysis.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card border border-border rounded-xl p-6 text-center"
            >
              <ImageIcon className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Image Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Detect manipulated photos with facial feature analysis and pixel-level examination
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card border border-border rounded-xl p-6 text-center"
            >
              <Video className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Video Detection</h3>
              <p className="text-sm text-muted-foreground">
                Frame-by-frame analysis to identify deepfake videos and synthetic media
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-card border border-border rounded-xl p-6 text-center"
            >
              <Shield className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Real-Time Results</h3>
              <p className="text-sm text-muted-foreground">
                Get instant detection results with confidence scores and detailed reports
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
              {!isAnalyzing && !result && (
                <div className="text-center">
                  <div className="border-2 border-dashed border-border rounded-xl p-16 mb-6 hover:border-orange-500/50 transition-colors">
                    <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2 text-lg">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground mb-4">JPG, PNG or MP4 (MAX. 50MB)</p>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: Images (JPG, PNG, WEBP) and Videos (MP4, MOV, AVI)
                    </p>
                  </div>
                  <Button
                    onClick={handleUpload}
                    size="lg"
                    className="w-full sm:w-auto px-8 bg-orange-500 hover:bg-orange-600"
                  >
                    Start Analysis
                  </Button>
                </div>
              )}

              {isAnalyzing && (
                <div className="text-center py-16">
                  <Loader2 className="h-20 w-20 text-orange-500 mx-auto mb-6 animate-spin" />
                  <p className="text-foreground font-medium mb-2 text-lg">Analyzing media...</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our AI is examining facial features and patterns for signs of manipulation
                  </p>
                  <div className="max-w-md mx-auto">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>Processing...</span>
                      <span>75%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                        initial={{ width: "0%" }}
                        animate={{ width: "75%" }}
                        transition={{ duration: 2 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {result && resultConfig && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`border ${resultConfig.borderColor} ${resultConfig.bgColor} rounded-xl p-8`}
                >
                  <div className="text-center mb-6">
                    <resultConfig.icon className={`h-20 w-20 ${resultConfig.color} mx-auto mb-4`} />
                    <h3 className="text-3xl font-bold text-foreground mb-2">{resultConfig.title}</h3>
                    <p className="text-muted-foreground mb-4">{resultConfig.description}</p>
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-background/50 rounded-full">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <span className={`text-2xl font-bold ${resultConfig.color}`}>{confidence}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-background/50 rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-3">Detection Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Facial Analysis:</span>
                          <span className="font-medium">{Math.floor(Math.random() * 30) + 70}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lighting Check:</span>
                          <span className="font-medium">{Math.floor(Math.random() * 30) + 70}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pixel Analysis:</span>
                          <span className="font-medium">{Math.floor(Math.random() * 30) + 70}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-background/50 rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-3">Analysis Summary</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• {Math.floor(Math.random() * 50) + 50} facial landmarks examined</p>
                        <p>• {Math.floor(Math.random() * 20) + 5} potential indicators found</p>
                        <p>• Processing time: {(Math.random() * 2 + 1).toFixed(2)}s</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setResult(null)
                      setConfidence(0)
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Analyze Another File
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
