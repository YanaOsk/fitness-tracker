'use client'

import { useEffect, useRef, useState } from 'react'
import { Profile } from '@/lib/types'
import { Send, Bot, Activity } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'איך מתחילים יוגה בהריון?',
  'מה מותר לאכול עם סוכרת הריון?',
  'כמה מים לשתות ביום?',
  'אילו תרגילים טובים לגב?',
  'איך שורפים שומן בטני?',
]

export default function ChatPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch('/api/profile').then((r) => r.json()).then((data) => { if (data) setProfile(data as Profile) }).catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return

    const userMessage: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)

    const assistantMessage: Message = { role: 'assistant', content: '' }
    setMessages([...newMessages, assistantMessage])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, profile }),
      })

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))

        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.text) {
              accumulated += parsed.text
              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: accumulated }
                return updated
              })
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: 'אירעה שגיאה. נסה שוב.' }
        return updated
      })
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  return (
    <div className="flex flex-col h-screen" dir="rtl">
      <div className="bg-white border-b border-slate-100 p-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
          <Bot className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="font-bold text-slate-800">FitLife AI</h1>
          <p className="text-xs text-slate-400">כושר ותזונה</p>
        </div>
        {streaming && (
          <div className="mr-auto flex items-center gap-1.5 text-xs text-emerald-600">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.1s]" />
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <Activity className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-xl mb-2">שאל/י אותי הכל</h2>
              <p className="text-slate-500 text-sm max-w-xs">כושר, תזונה, תרגילים בהריון — אני כאן.</p>
            </div>
            <div className="w-full max-w-sm space-y-2 mt-2">
              <p className="text-xs text-slate-400 mb-2">לדוגמה:</p>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="w-full text-right text-sm bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-600 px-4 py-2.5 rounded-xl transition-all">{s}</button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 ml-2 mt-1">
                  <Bot className="w-4 h-4 text-emerald-600" />
                </div>
              )}
              <div className={`max-w-[75%] sm:max-w-md rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-emerald-500 text-white rounded-tl-sm' : 'bg-white text-slate-800 rounded-tr-sm shadow-sm border border-slate-100'}`}>
                {msg.content}
                {msg.role === 'assistant' && msg.content === '' && streaming && (
                  <span className="inline-flex items-center gap-0.5 mr-1">
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="bg-white border-t border-slate-100 p-4 flex-shrink-0 pb-safe">
        <div className="flex items-end gap-3 max-w-3xl mx-auto">
          <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="שאל/י שאלה..." rows={1} disabled={streaming}
            className="flex-1 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none max-h-32 disabled:opacity-60"
            style={{ minHeight: '48px' }} />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || streaming}
            className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-xs text-slate-300 mt-2">AI עלול לטעות — תמיד התייעץ עם איש מקצוע</p>
      </div>
    </div>
  )
}
