'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import {
  Activity,
  Apple,
  Baby,
  MessageCircle,
  TrendingUp,
  Dumbbell,
  Droplets,
} from 'lucide-react'

const features = [
  { icon: Baby, title: 'הריון בטוח', desc: 'אימונים מאושרים עם אזהרות בטיחות לפי שלב' },
  { icon: Dumbbell, title: 'אימונים מותאמים', desc: 'יוגה, פילאטיס, כוח ואירובי לפי הפרופיל שלך' },
  { icon: Apple, title: 'תזונה חכמה', desc: 'רשימות החלפה מלאות עם תמיכה בסוכרת הריון' },
  { icon: MessageCircle, title: 'צ׳אט AI', desc: 'מאמן אישי חכם שעונה בעברית 24/7' },
  { icon: TrendingUp, title: 'מעקב התקדמות', desc: 'גרפים שבועיים ותובנות אישיות' },
  { icon: Droplets, title: 'מעקב מים', desc: 'יעדי שתייה יומיים מותאמים אישית' },
]

export default function LandingPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <div className="flex-1 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex flex-col">
        <header className="px-6 py-5 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
              <Activity className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">FitLife</span>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="max-w-2xl w-full mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full mb-8 border border-white/20">
              <span>✨</span>
              <span>מותאם אישית לנשים בהריון, נשים וגברים</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5 leading-tight">
              כושר ותזונה
              <br />
              <span className="text-emerald-200">שמותאמים לך</span>
            </h1>

            <p className="text-emerald-100 text-lg sm:text-xl mb-10 max-w-lg mx-auto leading-relaxed">
              מעקב תזונה חכם, אימונים אישיים וצ׳אט AI — הכל במקום אחד, הכל בעברית
            </p>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="inline-flex items-center gap-3 bg-white text-slate-800 hover:bg-slate-50 font-semibold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span>{loading ? 'מתחבר...' : 'התחבר עם Google'}</span>
            </button>

            <p className="text-emerald-200/70 text-sm mt-4">מאובטח ופרטי. אין צורך בסיסמא.</p>
          </div>
        </main>

        <div className="w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" className="w-full block fill-slate-50">
            <path d="M0,60 C480,0 960,0 1440,60 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </div>

      <section className="bg-slate-50 py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-3">מה תמצא ב-FitLife?</h2>
          <p className="text-slate-500 text-center mb-10">הכל מותאם אישית — לא עוד אפליקציה גנרית</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow text-center"
              >
                <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-slate-800 font-semibold text-sm mb-1">{title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-50 border-t border-slate-100 py-6 text-center text-slate-400 text-sm">
        FitLife &copy; {new Date().getFullYear()} — מעקב כושר ותזונה חכם
      </footer>
    </div>
  )
}
