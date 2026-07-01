'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrollVisibility } from '@/hooks/useScrollVisibility'
import GooseIcon from '@/components/GooseIcon'

type Role = 'user' | 'assistant'
interface Message {
  role: Role
  content: string
  isThinking?: boolean
}

const THINKING_PHRASE =
  "Whatever your expectations are for what's about to happen, lower them. This is some guy's glorified resume website."

const FALLBACK_DISCLOSURE = "Goose is an AI assistant."

function linkify(text: string) {
  // Matches markdown links to absolute (http/https) or relative (/…) URLs, plus bare URLs.
  const parts = text.split(/(\[[^\]]+\]\((?:https?:\/\/|\/)[^)]+\)|https?:\/\/[^\s]+)/g)
  return parts.map((part, i) => {
    const mdMatch = part.match(/^\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)]+)\)$/)
    const bareUrl = !mdMatch && part.match(/^https?:\/\//)
    if (!mdMatch && !bareUrl) return part
    const href = mdMatch ? mdMatch[2] : part
    const rawLabel = mdMatch ? mdMatch[1] : 'View'
    // Render a download affordance for the résumé / any PDF.
    const isDownload = /\.pdf($|\?)/i.test(href) || href.includes('/api/resume/download')
    const label = `${rawLabel} ${isDownload ? '↓' : '→'}`
    return (
      <a
        key={i}
        href={href}
        target={isDownload ? undefined : '_blank'}
        rel="noopener noreferrer"
        download={isDownload || undefined}
        className="underline underline-offset-2 transition-opacity duration-150"
        style={{ color: '#00d4aa' }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.7')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
      >
        {label}
      </a>
    )
  })
}

export default function ChatWidget() {
  const visible = useScrollVisibility()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const [accessSubmitted, setAccessSubmitted] = useState(false)
  const [questions, setQuestions] = useState<string[]>([])
  const [disclosure, setDisclosure] = useState(FALLBACK_DISCLOSURE)
  const [accessForm, setAccessForm] = useState({ name: '', email: '', company: '', reason: '' })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const firstMessageSent = useRef(false)
  // Fresh conversation id per widget mount (= one conversation per session)
  const conversationId = useRef<string>(crypto.randomUUID())
  // Persistent anonymous visitor id, reused across reloads
  const visitorId = useRef<string>('')

  useEffect(() => {
    let stored = localStorage.getItem('goose_visitor_id')
    if (!stored) {
      stored = crypto.randomUUID()
      localStorage.setItem('goose_visitor_id', stored)
    }
    visitorId.current = stored
  }, [])

  useEffect(() => {
    fetch('/api/chat/questions')
      .then((r) => r.json())
      .then((d) => {
        setQuestions(d.questions ?? [])
        if (d.disclosure) setDisclosure(d.disclosure)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || streaming) return

    const isFirst = !firstMessageSent.current
    firstMessageSent.current = true

    const userMsg: Message = { role: 'user', content: trimmed }
    setMessages((prev) => [
      ...prev,
      userMsg,
      ...(isFirst ? [{ role: 'assistant' as Role, content: THINKING_PHRASE, isThinking: true }] : []),
    ])
    setInput('')
    setStreaming(true)

    const history = messages
      .filter((m) => !m.isThinking)
      .concat(userMsg)
      .map(({ role, content }) => ({ role, content }))

    // Always wait out the timer before fetching — guarantees thinking phrase
    // stays visible for the full duration even if the API errors instantly
    if (isFirst) await new Promise<void>((resolve) => setTimeout(resolve, 500))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          conversationId: conversationId.current,
          visitorId: visitorId.current,
        }),
      })

      if (res.status === 402) {
        setLimitReached(true)
        setStreaming(false)
        return
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Something went wrong' }))
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: err.error ?? 'Something went wrong. Try again.' },
        ])
        setStreaming(false)
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      // Append response below the thinking phrase (never remove it)
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        // Grow the last message straight from state — no mutable closure variable.
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          return [...prev.slice(0, -1), { role: 'assistant', content: (last?.content ?? '') + chunk }]
        })
      }
    } catch {
      // Append error below thinking phrase rather than replacing it
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Try again.' },
      ])
    } finally {
      setStreaming(false)
    }
  }

  async function submitAccessRequest() {
    const { name, email } = accessForm
    if (!name || !email) return
    await fetch('/api/chat/request-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accessForm),
    })
    setAccessSubmitted(true)
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
      {/* Invisible backdrop — closes panel when clicking outside on mobile */}
      {open && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setOpen(false)}
        />
      )}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
              width: 'min(440px, calc(100vw - 1.5rem))',
              height: 'min(580px, calc(100dvh - 120px))',
              background: 'rgba(6,10,19,0.96)',
              border: '1px solid rgba(0,212,170,0.18)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Header — entire bar closes the panel */}
            <div
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-4 py-3 shrink-0 cursor-pointer"
              style={{ borderBottom: '1px solid rgba(0,212,170,0.12)' }}
            >
              <div className="flex items-center gap-2.5">
                <GooseIcon size={28} />
                <span
                  className="font-light tracking-wide"
                  style={{ color: '#00d4aa', fontSize: '0.875rem' }}
                >
                  Goose <span style={{ fontSize: '0.8rem' }}>K9.AI</span>
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-xs transition-colors duration-150"
                style={{ color: 'rgba(100,116,139,0.6)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#00d4aa')}
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = 'rgba(100,116,139,0.6)')
                }
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            {/* AI Disclosure */}
            <div
              className="px-4 py-2 shrink-0 text-[10px] font-light tracking-wide"
              style={{
                color: 'rgba(100,116,139,0.7)',
                borderBottom: '1px solid rgba(0,212,170,0.06)',
              }}
            >
              {disclosure}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {messages.length === 0 && (
                <p
                  className="text-xs font-light text-center mt-6"
                  style={{ color: 'rgba(100,116,139,0.5)' }}
                >
                  Ask me anything about Andrew.
                </p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.isThinking ? (
                    <p
                      className="text-xs font-light italic leading-relaxed max-w-[90%] px-1"
                      style={{ color: 'rgba(0,212,170,0.75)' }}
                    >
                      {m.content}
                    </p>
                  ) : (
                    <div
                      className="rounded-xl px-3 py-2 text-sm font-light leading-relaxed max-w-[85%]"
                      style={
                        m.role === 'user'
                          ? {
                              background: 'rgba(0,212,170,0.12)',
                              color: 'rgba(203,213,225,0.9)',
                              border: '1px solid rgba(0,212,170,0.2)',
                            }
                          : {
                              background: 'rgba(0,40,50,0.5)',
                              color: 'rgba(203,213,225,0.9)',
                              border: '1px solid rgba(0,212,170,0.15)',
                            }
                      }
                    >
                      {m.content
                        ? m.role === 'assistant'
                          ? linkify(m.content)
                          : m.content
                        : <span style={{ color: 'rgba(0,212,170,0.5)' }}>▋</span>
                      }
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick question chips */}
            {questions.length > 0 && !limitReached && (
              <div
                className="px-4 py-2 flex gap-2 overflow-x-auto shrink-0 no-scrollbar"
                style={{ borderTop: '1px solid rgba(0,212,170,0.06)' }}
              >
                {questions.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    disabled={streaming}
                    className="shrink-0 text-[10px] tracking-wide px-3 py-1 rounded-full whitespace-nowrap transition-all duration-150"
                    style={{
                      color: 'rgba(0,212,170,0.75)',
                      border: '1px solid rgba(0,212,170,0.25)',
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = 'rgba(0,212,170,0.08)'
                      el.style.borderColor = 'rgba(0,212,170,0.5)'
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = 'transparent'
                      el.style.borderColor = 'rgba(0,212,170,0.25)'
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Token limit form */}
            {limitReached && (
              <div
                className="px-4 py-4 shrink-0 flex flex-col gap-3"
                style={{ borderTop: '1px solid rgba(0,212,170,0.1)' }}
              >
                {accessSubmitted ? (
                  <p className="text-xs font-light text-center" style={{ color: 'rgba(0,212,170,0.8)' }}>
                    Got it — Andrew will review your request.
                  </p>
                ) : (
                  <>
                    <p className="text-[11px] font-light" style={{ color: 'rgba(100,116,139,0.8)' }}>
                      You&apos;ve hit the limit. Want more? Drop your info:
                    </p>
                    <div className="flex flex-col gap-2">
                      {[
                        { key: 'name', placeholder: 'Name *' },
                        { key: 'email', placeholder: 'Email *' },
                        { key: 'company', placeholder: 'Company (optional)' },
                        { key: 'reason', placeholder: 'Want to leave a note for Andrew? (optional)' },
                      ].map(({ key, placeholder }) => (
                        <input
                          key={key}
                          placeholder={placeholder}
                          value={accessForm[key as keyof typeof accessForm]}
                          onChange={(e) =>
                            setAccessForm((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          className="w-full text-xs px-3 py-2 rounded-lg outline-none"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(0,212,170,0.15)',
                            color: 'rgba(203,213,225,0.85)',
                          }}
                        />
                      ))}
                      <button
                        onClick={submitAccessRequest}
                        className="text-xs py-2 rounded-lg transition-colors duration-150"
                        style={{
                          background: 'rgba(0,212,170,0.12)',
                          color: '#00d4aa',
                          border: '1px solid rgba(0,212,170,0.3)',
                        }}
                      >
                        Request Access
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Input */}
            {!limitReached && (
              <div
                className="px-4 py-3 shrink-0 flex gap-2 items-center"
                style={{ borderTop: '1px solid rgba(0,212,170,0.1)' }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send(input)}
                  placeholder="Ask me anything…"
                  disabled={streaming}
                  className="flex-1 text-sm outline-none bg-transparent"
                  style={{ color: 'rgba(203,213,225,0.9)' }}
                />
                <button
                  onClick={() => send(input)}
                  disabled={streaming || !input.trim()}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all duration-150"
                  style={{
                    background: input.trim() ? 'rgba(0,212,170,0.15)' : 'transparent',
                    color: input.trim() ? '#00d4aa' : 'rgba(100,116,139,0.4)',
                    border: '1px solid rgba(0,212,170,0.2)',
                  }}
                >
                  Send
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating icon + label */}
      <motion.div
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.7 }}
        className="flex flex-col items-center gap-1"
        style={{ pointerEvents: visible ? 'auto' : 'none' }}
      >
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Open Goose chat"
          className="transition-transform duration-150 active:scale-95"
        >
          <GooseIcon size={56} />
        </button>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-[9px] tracking-[0.2em] uppercase font-light transition-colors duration-150"
          style={{ color: 'rgba(0,212,170,0.55)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#00d4aa')}
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = 'rgba(0,212,170,0.55)')
          }
        >
          Goose
        </button>
      </motion.div>
    </div>
  )
}
