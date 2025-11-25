"use client"

import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import {
  Upload,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Shield,
  ImageIcon,
  Video,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type DetectionResult = "authentic" | "suspicious" | "deepfake" | null
type AnalysisMode = "image" | "video"

export default function DetectPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<DetectionResult>(null)
  const [confidence, setConfidence] = useState(0)
  const [mode, setMode] = useState<AnalysisMode>("image")

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const uploadRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Clean up object URL when file changes / component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleModeChange = (nextMode: AnalysisMode) => {
    setMode(nextMode)
    setIsAnalyzing(false)
    setResult(null)
    setConfidence(0)
    setFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)

    // Smooth scroll to upload section
    setTimeout(() => {
      uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 150)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    // Optional: simple type guard
    if (mode === "image" && !selected.type.startsWith("image/")) {
      alert("Please upload a valid image file.")
      return
    }
    if (mode === "video" && !selected.type.startsWith("video/")) {
      alert("Please upload a valid video file.")
      return
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)

    const url = URL.createObjectURL(selected)
    setFile(selected)
    setPreviewUrl(url)
    setResult(null)
    setConfidence(0)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleUpload = () => {
    if (!file) {
      alert(`Please upload a ${mode === "image" ? "image" : "video"} before starting the analysis.`)
      return
    }

    setIsAnalyzing(true)
    setResult(null)

    // Simulate analysis
    setTimeout(() => {
      const outcomes: Array<Exclude<DetectionResult, null>> = ["authentic", "suspicious", "deepfake"]
      const randomResult = outcomes[Math.floor(Math.random() * outcomes.length)]
      setResult(randomResult)
      setConfidence(Math.floor(Math.random() * 30) + 70)
      setIsAnalyzing(false)
    }, 2500)
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
          description:
            mode === "image"
              ? "No signs of manipulation detected in this image. It appears to be genuine."
              : "No significant inconsistencies were detected across the video frames. It appears to be genuine.",
        }
      case "suspicious":
        return {
          icon: AlertTriangle,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/50",
          title: "Suspicious Content",
          description:
            mode === "image"
              ? "Some visual inconsistencies were detected. Manual verification is recommended."
              : "Temporal or visual inconsistencies were observed in the video. Manual verification is recommended.",
        }
      case "deepfake":
        return {
          icon: XCircle,
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/50",
          title: "Deepfake Detected",
          description:
            mode === "image"
              ? "Strong indicators of facial manipulation were found. This image is likely synthetic."
              : "Strong indicators of frame-level and motion manipulation were found. This video is likely synthetic.",
        }
      default:
        return null
    }
  }

  const getExplanationPoints = (): string[] => {
    if (!result) return []

    if (result === "authentic") {
      return [
        "No strong manipulation cues were detected across the analyzed regions.",
        "Facial landmarks, lighting patterns, and textures stayed within normal thresholds.",
        "Temporal and spatial consistency matched typical real-world behaviour.",
      ]
    }

    if (mode === "image") {
      if (result === "suspicious") {
        return [
          "Minor inconsistencies in skin texture and edge blending were detected.",
          "Lighting or shadow transitions around key facial regions appear slightly unusual.",
          "While not conclusive, these patterns often appear in lightly edited or compressed media.",
        ]
      }
      // deepfake + image
      return [
        "Notable texture inconsistencies were found around the cheeks, jawline, or forehead.",
        "Edge blending near the hairline and facial boundaries did not match natural image statistics.",
        "Facial landmark alignment showed abnormal symmetry or proportions typical of face-swapping.",
      ]
    } else {
      // video mode
      if (result === "suspicious") {
        return [
          "Subtle irregularities in frame-to-frame motion were detected.",
          "Blink rate or mouth movement patterns slightly deviated from typical human behaviour.",
          "Some frames contained minor artifacting that may come from editing or recompression.",
        ]
      }
      // deepfake + video
      return [
        "Inconsistent motion patterns were detected across frames (e.g., jittery head or eye movement).",
        "Blinking, mouth movement, or facial expression timing did not match natural rhythms.",
        "Temporal artifacts and boundary inconsistencies across frames strongly indicate synthetic generation.",
      ]
    }
  }

  const resultConfig = getResultConfig()
  const explanationPoints = getExplanationPoints()
  const isImageMode = mode === "image"

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
      <section className="relative py-16 sm:py-20">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold tracking-tight text-balance text-foreground sm:text-6xl mb-3">
              Detect Deepfakes Now
            </h1>
            <p className="text-lg text-pretty text-muted-foreground max-w-2xl mx-auto">
              Upload an image or video to analyze for deepfake manipulation. Choose your detection mode below and get
              instant results with confidence scores and forensic-style breakdowns.
            </p>

            {/* Mode toggle */}
            <div className="mt-5 flex justify-center">
              <div className="inline-flex items-center rounded-full bg-card border border-border px-1 py-1">
                <button
                  type="button"
                  onClick={() => handleModeChange("image")}
                  className={`px-4 py-2 text-sm rounded-full flex items-center gap-2 transition-all ${
                    isImageMode
                      ? "bg-orange-500 text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Image Model</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange("video")}
                  className={`px-4 py-2 text-sm rounded-full flex items-center gap-2 transition-all ${
                    !isImageMode
                      ? "bg-orange-500 text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Video className="h-4 w-4" />
                  <span>Video Model</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="bg-card border border-border rounded-xl p-6 text-center"
            >
              <ImageIcon className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Image Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Detect manipulated photos with facial feature analysis and pixel-level examination.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-card border border-border rounded-xl p-6 text-center"
            >
              <Video className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Video Detection</h3>
              <p className="text-sm text-muted-foreground">
                Frame-by-frame and temporal pattern analysis to identify deepfake videos and synthetic media.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="bg-card border border-border rounded-xl p-6 text-center"
            >
              <Shield className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Real-Time Results</h3>
              <p className="text-sm text-muted-foreground">
                Get instant detection results with confidence scores and human-friendly explanations.
              </p>
            </motion.div>
          </div>

          {/* Main card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="max-w-4xl mx-auto"
          >
            <div ref={uploadRef} className="bg-card border border-border rounded-2xl p-8 shadow-xl">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={isImageMode ? "image/*" : "video/*"}
                onChange={handleFileChange}
              />

              {!isAnalyzing && !result && (
                <div className="text-center">
                  <div
                    onClick={handleUploadClick}
                    className="cursor-pointer border-2 border-dashed border-border rounded-xl p-12 mb-6 hover:border-orange-500/60 transition-colors"
                  >
                    <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2 text-lg">
                      {file
                        ? `Selected: ${file.name}`
                        : isImageMode
                        ? "Click to upload an image"
                        : "Click to upload a video"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isImageMode
                        ? "JPG, PNG, WEBP (MAX. 20MB)"
                        : "MP4, MOV, AVI (recommended under 50MB)"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isImageMode
                        ? "The image model focuses on spatial artifacts such as texture, edges, and blending seams."
                        : "The video model focuses on frame sequences, motion consistency, and temporal anomalies."}
                    </p>
                  </div>

                  {/* Preview */}
                  {previewUrl && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-left">
                        Preview
                      </h4>
                      <div className="rounded-xl border border-border bg-background/40 p-3">
                        {isImageMode ? (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="mx-auto max-h-72 rounded-lg object-contain"
                          />
                        ) : (
                          <video
                            src={previewUrl}
                            className="mx-auto max-h-72 rounded-lg"
                            controls
                          />
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleUpload}
                    size="lg"
                    disabled={!file || isAnalyzing}
                    className="w-full sm:w-auto px-8 bg-orange-500 hover:bg-orange-600 disabled:opacity-60"
                  >
                    {file ? `Start ${isImageMode ? "Image" : "Video"} Analysis` : "Upload a file to start"}
                  </Button>
                </div>
              )}

              {isAnalyzing && (
                <div className="text-center py-12">
                  <Loader2 className="h-20 w-20 text-orange-500 mx-auto mb-6 animate-spin" />
                  <p className="text-foreground font-medium mb-2 text-lg">
                    Analyzing {isImageMode ? "image" : "video"}...
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our AI is examining{" "}
                    {isImageMode ? "facial features and pixel patterns" : "frame sequences and facial motion"} for signs
                    of manipulation.
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
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
                          <span className="text-muted-foreground">
                            {isImageMode ? "Facial Texture Analysis:" : "Frame Consistency:"}
                          </span>
                          <span className="font-medium">{Math.floor(Math.random() * 30) + 70}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {isImageMode ? "Lighting & Shadow Check:" : "Motion / Blink Pattern:"}
                          </span>
                          <span className="font-medium">{Math.floor(Math.random() * 30) + 70}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {isImageMode ? "Pixel-Level Artifacts:" : "Temporal Artifacts:"}
                          </span>
                          <span className="font-medium">{Math.floor(Math.random() * 30) + 70}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-background/50 rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-3">Analysis Summary</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>
                          • {Math.floor(Math.random() * 50) + 50}{" "}
                          {isImageMode ? "facial landmarks examined" : "frames analyzed with facial landmarks"}
                        </p>
                        <p>
                          • {Math.floor(Math.random() * 20) + 5} potential{" "}
                          {isImageMode ? "visual indicators" : "temporal inconsistencies"} found
                        </p>
                        <p>• Processing time: {(Math.random() * 2 + 1).toFixed(2)}s</p>
                      </div>
                    </div>
                  </div>

                  {/* Why this result? */}
                  {explanationPoints.length > 0 && (
                    <div className="bg-background/60 rounded-lg p-4 mb-6 border border-border/60">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-orange-500" />
                        <h4 className="text-sm font-semibold text-foreground">Why this result?</h4>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside text-left">
                        {explanationPoints.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      setResult(null)
                      setConfidence(0)
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Analyze Another {isImageMode ? "Image" : "Video"}
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
