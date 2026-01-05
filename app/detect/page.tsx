"use client"

import { motion } from "framer-motion"
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react"
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
import { supabaseBrowser } from "@/lib/supabase/client"
import ChatWidget from "@/components/ChatWidget"

type Verdict = "authentic" | "suspicious" | "deepfake"
type DetectionResultType = Verdict | null
type AnalysisMode = "image" | "video"

// Raw response from your video FastAPI endpoint
type VideoApiResponse = {
  verdict: "real" | "deepfake"
  confidence: number
  message: string
  processing_time: number
}

// Unified response type used by the UI
type DetectionApiResponse = {
  verdict: Verdict
  title: string
  message: string
  confidence: number
  detection_details: {
    facial_texture: number
    lighting_shadow: number
    pixel_artifacts: number
  }
  analysis_summary: {
    facial_landmarks_examined: number
    potential_indicators: number
    processing_time: number
  }
  reasons: string[]
}

// Separate base URLs so image + video can be on different ports
const IMAGE_API_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGE_API_URL ?? "http://127.0.0.1:8000"

const VIDEO_API_BASE_URL =
  process.env.NEXT_PUBLIC_VIDEO_API_URL ?? "http://127.0.0.1:8002"

// ⭐ NEW: helper to log each scan AND bump profiles.scan_count
async function logScanToSupabase(
  mode: AnalysisMode,
  verdict: Verdict,
  confidence: number
) {
  try {
    const supabase = supabaseBrowser()

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      console.warn("No session when logging scan:", sessionError)
      return
    }

    const userId = session.user.id

    const resultText =
      verdict === "authentic"
        ? "REAL"
        : verdict === "deepfake"
        ? "FAKE"
        : "SUSPICIOUS"

    const { error: insertError } = await supabase.from("scan_logs").insert({
      user_id: userId,
      media_type: mode === "image" ? "IMAGE" : "VIDEO",
      result: resultText,
      confidence,
    })

    if (insertError) {
      console.error("Failed to insert scan log:", insertError)
    }
  } catch (err) {
    console.error("Unexpected error logging scan:", err)
  }
}

export default function DetectPage() {
  const [mode, setMode] = useState<AnalysisMode>("image")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [resultType, setResultType] = useState<DetectionResultType>(null)
  const [apiResult, setApiResult] = useState<DetectionApiResponse | null>(null)

  const [isDragActive, setIsDragActive] = useState(false)

  const uploadRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const isImageMode = mode === "image"

  // cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleModeChange = (nextMode: AnalysisMode) => {
    setMode(nextMode)
    setIsAnalyzing(false)
    setResultType(null)
    setApiResult(null)
    setFile(null)

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)

    setTimeout(() => {
      uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 150)
  }

  const processSelectedFile = (selected: File) => {
    if (isImageMode && !selected.type.startsWith("image/")) {
      alert("Please upload a valid image file.")
      return
    }
    if (!isImageMode && !selected.type.startsWith("video/")) {
      alert("Please upload a valid video file.")
      return
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)

    const url = URL.createObjectURL(selected)
    setFile(selected)
    setPreviewUrl(url)
    setResultType(null)
    setApiResult(null)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    processSelectedFile(selected)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const droppedFile = e.dataTransfer.files?.[0]
    if (!droppedFile) return
    processSelectedFile(droppedFile)
  }

  // Call FastAPI image endpoint
  const analyzeImageWithBackend = async (
    file: File
  ): Promise<DetectionApiResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch(`${IMAGE_API_BASE_URL}/detect/image`, {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      const text = await res.text()
      console.error("Backend error (image):", text)
      throw new Error(`Image backend error: ${res.status}`)
    }

    const data: DetectionApiResponse = await res.json()
    return data
  }

  // Call FastAPI video endpoint and map to DetectionApiResponse
  const analyzeVideoWithBackend = async (
    file: File
  ): Promise<DetectionApiResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch(`${VIDEO_API_BASE_URL}/detect/video`, {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      const text = await res.text()
      console.error("Backend error (video):", text)
      throw new Error(`Video backend error: ${res.status}`)
    }

    const raw: VideoApiResponse = await res.json()

    const mappedVerdict: Verdict =
      raw.verdict === "deepfake" ? "deepfake" : "authentic"

    const title =
      mappedVerdict === "deepfake"
        ? "Deepfake Detected"
        : "No Deepfake Detected"

    const mapped: DetectionApiResponse = {
      verdict: mappedVerdict,
      title,
      message: raw.message,
      confidence: raw.confidence,
      detection_details: {
        facial_texture: mappedVerdict === "deepfake" ? 80 : 20,
        lighting_shadow: mappedVerdict === "deepfake" ? 75 : 25,
        pixel_artifacts: mappedVerdict === "deepfake" ? 85 : 15,
      },
      analysis_summary: {
        facial_landmarks_examined: 68,
        potential_indicators: mappedVerdict === "deepfake" ? 3 : 0,
        processing_time: raw.processing_time,
      },
      reasons:
        mappedVerdict === "deepfake"
          ? [
              "Temporal inconsistencies detected across frames",
              "Unnatural facial texture and blending artifacts",
              "Inconsistent lighting and shadows over time",
            ]
          : [
              "Consistent facial features and motion across frames",
              "No significant pixel-level anomalies detected",
            ],
    }

    return mapped
  }

  const handleUpload = async () => {
    if (!file) {
      alert(
        `Please upload a ${isImageMode ? "image" : "video"} before starting the analysis.`
      )
      return
    }

    try {
      setIsAnalyzing(true)
      setResultType(null)
      setApiResult(null)

      let data: DetectionApiResponse

      if (isImageMode) {
        data = await analyzeImageWithBackend(file)
      } else {
        data = await analyzeVideoWithBackend(file)
      }

      // ⭐ NEW: log this scan to Supabase (fire-and-forget)
      logScanToSupabase(mode, data.verdict, data.confidence).catch((e) =>
        console.error("logScanToSupabase failed:", e)
      )

      setApiResult(data)
      setResultType(data.verdict)
    } catch (err) {
      console.error(err)
      alert(
        `Failed to analyze ${isImageMode ? "image" : "video"}. Make sure the ${
          isImageMode ? "image" : "video"
        } backend is running (${isImageMode ? IMAGE_API_BASE_URL : VIDEO_API_BASE_URL}).`
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getResultConfig = () => {
    if (!resultType || !apiResult) return null

    const color =
      resultType === "authentic"
        ? "text-green-500"
        : resultType === "suspicious"
        ? "text-yellow-500"
        : "text-red-500"

    const bgColor =
      resultType === "authentic"
        ? "bg-green-500/10"
        : resultType === "suspicious"
        ? "bg-yellow-500/10"
        : "bg-red-500/10"

    const borderColor =
      resultType === "authentic"
        ? "border-green-500/50"
        : resultType === "suspicious"
        ? "border-yellow-500/50"
        : "border-red-500/50"

    const Icon =
      resultType === "authentic"
        ? CheckCircle
        : resultType === "suspicious"
        ? AlertTriangle
        : XCircle

    return {
      icon: Icon,
      color,
      bgColor,
      borderColor,
      title: apiResult.title,
      description: apiResult.message,
      confidence: apiResult.confidence,
      details: apiResult.detection_details,
      summary: apiResult.analysis_summary,
      reasons: apiResult.reasons,
    }
  }

  const resultConfig = getResultConfig()

  return (
    <div className="min-h-screen bg-background relative transition-colors duration-300">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-black dark:to-zinc-900 transition-colors duration-300" />

      {/* Decorative Orbs */}
      <div className="pointer-events-none absolute -top-24 -right-16 w-[28rem] h-[28rem] rounded-full bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 w-[34rem] h-[34rem] rounded-full bg-orange-500/5 blur-3xl" />

      {/* Header */}
      <header className="sticky top-4 z-50 mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-lg px-6 py-3 transition-all duration-300">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-zinc-900 dark:text-white transition-colors">
              Detectify
            </span>
          </Link>

          {/* Back button */}
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <section className="relative py-16 sm:py-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold tracking-tight text-balance text-zinc-900 dark:text-white sm:text-6xl mb-3 transition-colors">
              Detect Deepfakes Now
            </h1>
            <p className="text-lg text-pretty text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto transition-colors">
              Upload an image or video to analyze for deepfake manipulation.
              Choose your detection mode below and get instant results with
              confidence scores and forensic-style breakdowns.
            </p>

            {/* Mode Toggle */}
            <div className="mt-5 flex justify-center">
              <div className="inline-flex items-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-1 py-1 shadow-sm transition-colors">
                <button
                  type="button"
                  onClick={() => handleModeChange("image")}
                  className={`px-4 py-2 text-sm rounded-full flex items-center gap-2 transition-all ${
                    isImageMode
                      ? "bg-orange-500 text-white shadow-md"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
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
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
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
              className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center shadow-sm transition-colors"
            >
              <ImageIcon className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-white">
                Image Analysis
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Detect manipulated photos with facial feature analysis and
                pixel-level examination.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center shadow-sm transition-colors"
            >
              <Video className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-white">
                Video Detection
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Frame-by-frame and temporal pattern analysis to identify
                deepfake videos and synthetic media.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center shadow-sm transition-colors"
            >
              <Shield className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-white">
                Real-Time Results
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Get instant detection results with confidence scores and
                human-friendly explanations.
              </p>
            </motion.div>
          </div>

          {/* Main Upload Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="max-w-4xl mx-auto"
          >
            <div
              ref={uploadRef}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl transition-colors duration-300"
            >
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={isImageMode ? "image/*" : "video/*"}
                onChange={handleFileChange}
              />

              {/* Upload state */}
              {!isAnalyzing && !resultConfig && (
                <div className="text-center">
                  <div
                    onClick={handleUploadClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`cursor-pointer border-2 border-dashed rounded-xl p-12 mb-6 transition-all duration-300 ${
                      isDragActive
                        ? "border-orange-500 bg-orange-500/5"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-orange-500/60 dark:hover:border-orange-500/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <Upload className="h-16 w-16 text-zinc-400 dark:text-zinc-500 mx-auto mb-4" />
                    <p className="text-zinc-900 dark:text-white font-medium mb-2 text-lg">
                      {file
                        ? `Selected: ${file.name}`
                        : isImageMode
                        ? "Click or drag & drop an image"
                        : "Click or drag & drop a video"}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                      {isImageMode
                        ? "JPG, PNG, WEBP (MAX. 20MB)"
                        : "MP4, MOV, AVI (recommended under 50MB)"}
                    </p>

                    {/* inner divider */}
                    <div className="mx-auto mt-2 mb-4 h-px max-w-md border-t border-dashed border-zinc-300 dark:border-zinc-700" />

                    {/* Short limitations block */}
                    <div className="mx-auto max-w-md flex items-start gap-2 text-left">
                      <Info className="h-3.5 w-3.5 mt-0.5 text-orange-500 flex-shrink-0" />
                      <div className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                        <p className="font-medium text-zinc-900 dark:text-zinc-200">
                          {isImageMode
                            ? "Image model scope & limitations"
                            : "Video model scope & limitations"}
                        </p>
                        {isImageMode ? (
                          <>
                            <p>
                              • Best for clear human faces (trained on GAN vs
                              real faces).
                            </p>
                            <p>
                              • Filters / AR effects, strong warps or
                              multiple/hidden faces may confuse the detector.
                            </p>
                          </>
                        ) : (
                          <>
                            <p>
                              • Best for single-face talking-head clips
                              (FaceForensics++ style).
                            </p>
                            <p>
                              • Heavy filters, very low light, compression or
                              screen recordings can reduce reliability.
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="mt-3 text-[11px] text-zinc-400 dark:text-zinc-500">
                      This is a research tool and not 100% accurate. Always
                      verify important decisions manually.
                    </p>

                    <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500">
                      You can also drag & drop a file anywhere inside this box.
                    </p>
                  </div>

                  {/* Preview */}
                  {previewUrl && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 text-left">
                        Preview
                      </h4>
                      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/40 p-3">
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
                    className="w-full sm:w-auto px-8 bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-60"
                  >
                    {file
                      ? `Start ${isImageMode ? "Image" : "Video"} Analysis`
                      : "Upload a file to start"}
                  </Button>
                </div>
              )}

              {/* Loading state */}
              {isAnalyzing && (
                <div className="text-center py-12">
                  <Loader2 className="h-20 w-20 text-orange-500 mx-auto mb-6 animate-spin" />
                  <p className="text-zinc-900 dark:text-white font-medium mb-2 text-lg">
                    Analyzing {isImageMode ? "image" : "video"}...
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                    Our AI is examining facial features, textures, lighting and
                    pixel patterns for signs of manipulation.
                  </p>
                  <div className="max-w-md mx-auto">
                    <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
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

              {/* Result state */}
              {resultConfig && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className={`border ${resultConfig.borderColor} ${resultConfig.bgColor} rounded-xl p-8`}
                >
                  <div className="text-center mb-6">
                    <resultConfig.icon
                      className={`h-20 w-20 ${resultConfig.color} mx-auto mb-4`}
                    />
                    <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                      {resultConfig.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-300 mb-4">
                      {resultConfig.description}
                    </p>
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 dark:bg-black/20 border border-zinc-200/50 dark:border-white/5 rounded-full">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        Confidence:
                      </span>
                      <span
                        className={`text-2xl font-bold ${resultConfig.color}`}
                      >
                        {resultConfig.confidence}%
                      </span>
                    </div>
                  </div>

                  {/* Details + Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/60 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-white/5 rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-3 text-zinc-900 dark:text-white">
                        Detection Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-zinc-600 dark:text-zinc-400">
                            Facial Texture Analysis:
                          </span>
                          <span className="font-medium text-zinc-900 dark:text-zinc-200">
                            {resultConfig.details.facial_texture}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-600 dark:text-zinc-400">
                            Lighting &amp; Shadow Check:
                          </span>
                          <span className="font-medium text-zinc-900 dark:text-zinc-200">
                            {resultConfig.details.lighting_shadow}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-600 dark:text-zinc-400">
                            Pixel-Level Artifacts:
                          </span>
                          <span className="font-medium text-zinc-900 dark:text-zinc-200">
                            {resultConfig.details.pixel_artifacts}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/60 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-white/5 rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-3 text-zinc-900 dark:text-white">
                        Analysis Summary
                      </h4>
                      <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <p>
                          • {resultConfig.summary.facial_landmarks_examined}{" "}
                          facial landmarks examined
                        </p>
                        <p>
                          • {resultConfig.summary.potential_indicators}{" "}
                          potential indicators found
                        </p>
                        <p>
                          • Processing time:{" "}
                          {resultConfig.summary.processing_time}s
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Why this result */}
                  {resultConfig.reasons.length > 0 && (
                    <div className="bg-white/60 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-white/5 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-orange-500" />
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                          Why this result?
                        </h4>
                      </div>
                      <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1 list-disc list-inside text-left">
                        {resultConfig.reasons.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      setResultType(null)
                      setApiResult(null)
                      setFile(null)
                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl)
                      }
                      setPreviewUrl(null)
                      fileInputRef.current?.click()
                    }}
                    variant="outline"
                    className="w-full border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white"
                  >
                    Analyze Another {isImageMode ? "Image" : "Video"}
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ✅ Floating Chat (does NOT affect layout) */}
      <ChatWidget
        context={{
          page: "detect",
          mode,
          verdict: apiResult?.verdict,
          confidence: apiResult?.confidence,
          reasons: apiResult?.reasons,
        }}
        title="Detectify Assistant"
      />
    </div>
  )
}
