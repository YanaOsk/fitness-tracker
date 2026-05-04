'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const selectUser = async (user: 'yana' | 'dvir') => {
    setLoading(user)
    try {
      const res = await fetch('/api/auth/select-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user }),
      })
      const { redirect } = await res.json()
      router.push(redirect)
    } catch {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex flex-col items-center justify-center px-6" dir="rtl">
      <div className="w-full max-w-xs">
        <div className="flex items-center justify-center gap-3 mb-14">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <Activity className="w-7 h-7 text-emerald-600" />
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">FitLife</span>
        </div>

        <h1 className="text-white text-2xl font-bold text-center mb-2">מי נכנס?</h1>
        <p className="text-emerald-200 text-center text-sm mb-8">בחר/י את הפרופיל שלך</p>

        <div className="grid grid-cols-2 gap-4">
          {([
            { key: 'yana', name: 'יאנה', emoji: '👩' },
            { key: 'dvir', name: 'דביר', emoji: '💪' },
          ] as const).map(({ key, name, emoji }) => (
            <button
              key={key}
              onClick={() => selectUser(key)}
              disabled={loading !== null}
              className="bg-white/10 hover:bg-white/20 border-2 border-white/30 hover:border-white/60 backdrop-blur-sm text-white rounded-3xl p-8 flex flex-col items-center gap-3 transition-all duration-200 disabled:opacity-60 active:scale-95"
            >
              {loading === key ? (
                <div className="w-12 h-12 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="text-5xl">{emoji}</span>
              )}
              <span className="font-bold text-xl">{name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
