"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  Shield,
  X,
  Send,
  Loader2,
  Sparkles,
  MessageCircle,
  Minus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type Role = "user" | "assistant"

type ChatMessage = {
  role: Role
  content: string
}

type ChatWidgetProps = {
  title?: string
  context?: Record<string, any>
}

const STORAGE_KEY = "detectify_chat_messages_v2"

const STARTER: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "**TL;DR:** Ask me anything about results, confidence, or safety.\n\n### What I can do\n- Explain **authentic / suspicious / deepfake**\n- Explain what **confidence %** means\n- Give **safe verification steps** (no blame / no accusations)\n\n### Quick start\n1. Tell me your result (verdict + confidence)\n2. Ask your question\n\n### Reminder\n- Research tool — always verify important decisions.",
  },
]

function shouldClamp(content: string) {
  if (!content) return false
  const len = content.length
  const headings = (content.match(/^###\s/gm) || []).length
  return len > 650 || headings >= 2
}

function AssistantBubble({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false)
  const clamp = shouldClamp(content)

  return (
    <div className="max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed bg-white/10 text-zinc-100 border border-white/10 shadow-sm">
      <div className={clamp && !expanded ? "line-clamp-7" : ""}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h3: ({ children }) => (
              <h3 className="mt-3 mb-1 text-[13px] font-semibold text-white">
                {children}
              </h3>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-white">{children}</strong>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-5 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-5 space-y-1">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-zinc-100/95">{children}</li>
            ),
            p: ({ children }) => (
              <p className="text-zinc-100/95 mb-2 last:mb-0">{children}</p>
            ),
            a: ({ children, href }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-orange-300 hover:text-orange-200 underline underline-offset-2"
              >
                {children}
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {clamp && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-[11px] text-orange-300 hover:text-orange-200 transition"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  )
}

export default function ChatWidget({
  title = "Detectify Assistant",
  context = {},
}: ChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)

  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const listRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Load chat history
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setMessages(JSON.parse(raw))
      else setMessages(STARTER)
    } catch {
      setMessages(STARTER)
    }
  }, [])

  // Save chat history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {}
  }, [messages])

  // Scroll to bottom on new messages/open
  useEffect(() => {
    if (!open || minimized) return
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, open, minimized])

  // Focus input when opening
  useEffect(() => {
    if (open && !minimized) setTimeout(() => textareaRef.current?.focus(), 80)
  }, [open, minimized])

  // ESC to close
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const quickChips = useMemo(
    () => [
      "What does ‘suspicious’ mean?",
      "What does the confidence % actually mean?",
      "What is deepfake?",
      "What should I do if I got a deepfake result?",
    ],
    []
  )

  // nicer mode label
  const modeLabel = useMemo(() => {
    const m = String(context?.mode || "")
    if (m === "image") return "Image model"
    if (m === "video") return "Video model"
    return null
  }, [context?.mode])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const nextUserMsg: ChatMessage = { role: "user", content: trimmed }
    const nextMessages = [...messages, nextUserMsg]

    setMessages(nextMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          context,
          history: nextMessages.slice(-8),
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || `HTTP ${res.status}`)
      }

      const data = await res.json()
      const reply = data?.reply ?? "Sorry — I couldn’t generate a reply."

      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "**TL;DR:** Something went wrong.\n\n### What it means\n- I couldn’t reach the assistant API.\n\n### What to do next\n1. Check your `/api/assistant` route.\n2. Confirm `OPENAI_API_KEY` is set.\n3. Retry.\n\n### Notes\n- If this keeps happening, show the terminal error.",
        },
      ])
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-5 right-5 z-[60]">
        <button
          onClick={() => {
            setOpen(true)
            setMinimized(false)
          }}
          className="group relative flex items-center gap-2 rounded-full bg-orange-500 text-white px-4 py-3 shadow-xl hover:bg-orange-600 transition"
          aria-label="Open chat"
        >
          <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center">
            <MessageCircle className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline font-semibold">Chat</span>
          <span className="pointer-events-none absolute -inset-1 rounded-full bg-orange-500/25 blur-xl opacity-0 group-hover:opacity-100 transition" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: minimized ? 0 : 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className={`fixed inset-0 z-[70] bg-black/40 backdrop-blur-[2px] ${
                minimized ? "pointer-events-none" : ""
              }`}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="
                fixed z-[80]
                bottom-5 right-5
                w-[92vw] sm:w-[420px]
                rounded-2xl
                border border-white/10
                bg-zinc-950/75
                backdrop-blur-xl
                shadow-2xl
                overflow-hidden
              "
              style={{ maxHeight: minimized ? "64px" : "78vh" }}
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                      Structured help for results & safety
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Minimize */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setMinimized((v) => !v)
                    }}
                    className="rounded-lg p-2 hover:bg-white/5 transition"
                    aria-label="Minimize chat"
                    title={minimized ? "Expand" : "Minimize"}
                  >
                    <Minus className="h-4 w-4 text-zinc-300" />
                  </button>

                  {/* Close */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setOpen(false)
                    }}
                    className="rounded-lg p-2 hover:bg-white/5 transition"
                    aria-label="Close chat"
                    title="Close"
                  >
                    <X className="h-5 w-5 text-zinc-300" />
                  </button>
                </div>
              </div>

              {!minimized && (
                <>
                  {/* Mode badge */}
                  {modeLabel && (
                    <div className="px-4 pt-3">
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-zinc-200">
                        Mode: {modeLabel}
                      </span>
                    </div>
                  )}

                  {/* Messages */}
                  <div
                    ref={listRef}
                    className="px-4 py-3 space-y-3 overflow-y-auto"
                    style={{ maxHeight: "calc(78vh - 190px)" }}
                  >
                    {messages.map((m, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          m.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {m.role === "user" ? (
                          <div className="max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed bg-orange-500 text-white shadow-sm">
                            {m.content}
                          </div>
                        ) : (
                          <AssistantBubble content={m.content} />
                        )}
                      </div>
                    ))}

                    {loading && (
                      <div className="flex justify-start">
                        <div className="rounded-2xl px-3 py-2 text-sm bg-white/10 text-zinc-100 border border-white/10 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                          Thinking…
                        </div>
                      </div>
                    )}

                    {messages.length <= 2 && !loading && (
                      <div className="pt-1 flex flex-wrap gap-2">
                        {quickChips.map((chip) => (
                          <button
                            key={chip}
                            onClick={() => send(chip)}
                            className="text-[11px] px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10 transition"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="px-4 py-3 border-t border-white/10 bg-black/20">
                    <div className="flex items-end gap-2">
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            send(input)
                          }
                        }}
                        rows={2}
                        placeholder="Ask something… (Shift+Enter for a new line)"
                        className="
                          w-full resize-none rounded-xl px-3 py-2 text-sm
                          bg-white/5 border border-white/10
                          text-zinc-100 placeholder:text-zinc-500
                          focus:outline-none focus:ring-2 focus:ring-orange-500/60
                        "
                      />

                      <Button
                        onClick={() => send(input)}
                        disabled={!input.trim() || loading}
                        className="bg-orange-500 hover:bg-orange-600 text-white h-10 px-3"
                        aria-label="Send"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="mt-2 text-[10px] text-zinc-500">
                      Research tool — not 100% accurate. Always verify important
                      decisions.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
