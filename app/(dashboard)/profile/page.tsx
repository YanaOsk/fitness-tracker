'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Profile, Goal, ActivityLevel } from '@/lib/types'
import { User, Save, LogOut, Check, Copy, RefreshCw, Smartphone } from 'lucide-react'

const GOALS: { value: Goal; label: string }[] = [
  { value: 'weight_loss', label: 'ירידה במשקל' },
  { value: 'muscle_gain', label: 'בניית שריר' },
  { value: 'healthy_pregnancy', label: 'הריון בריא' },
  { value: 'general_health', label: 'בריאות כללית' },
  { value: 'endurance', label: 'שיפור סיבולת' },
]

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'יושבני' },
  { value: 'light', label: 'קל' },
  { value: 'moderate', label: 'בינוני' },
  { value: 'active', label: 'פעיל' },
  { value: 'very_active', label: 'פעיל מאוד' },
]

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [syncToken, setSyncToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [form, setForm] = useState({
    height_cm: '', weight_kg: '', target_weight_kg: '', pregnancy_week: '',
    has_gestational_diabetes: false, skip_target_weight: false, goals: [] as Goal[], activity_level: '' as ActivityLevel | '', medical_notes: '',
  })

  useEffect(() => {
    fetch('/api/profile').then((r) => r.json()).then((data) => {
      if (data) {
        const p = data as Profile
        setProfile(p)
        setForm({
          height_cm: p.height_cm?.toString() ?? '',
          weight_kg: p.weight_kg?.toString() ?? '',
          target_weight_kg: p.target_weight_kg?.toString() ?? '',
          pregnancy_week: p.pregnancy_week?.toString() ?? '',
          has_gestational_diabetes: p.has_gestational_diabetes,
          skip_target_weight: p.is_pregnant && !p.target_weight_kg,
          goals: p.goals ?? [],
          activity_level: p.activity_level ?? '',
          medical_notes: p.medical_notes ?? '',
        })
      }
    }).catch(() => {})
    fetch('/api/steps/sync-token').then((r) => r.json()).then((d) => {
      if (d.token) setSyncToken(d.token)
    }).catch(() => {})
  }, [])

  const toggleGoal = (goal: Goal) => {
    setForm((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal) ? prev.goals.filter((g) => g !== goal) : [...prev.goals, goal],
    }))
  }

  const copyUrl = async () => {
    const url = `${window.location.origin}/api/steps/sync?token=${syncToken}&steps=`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const regenerateToken = async () => {
    setRegenerating(true)
    const res = await fetch('/api/steps/sync-token', { method: 'POST' })
    const data = await res.json()
    if (data.token) setSyncToken(data.token)
    setRegenerating(false)
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        height_cm: form.height_cm ? parseInt(form.height_cm) : null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        target_weight_kg: form.skip_target_weight ? null : (form.target_weight_kg ? parseFloat(form.target_weight_kg) : null),
        pregnancy_week: profile.is_pregnant && form.pregnancy_week ? parseInt(form.pregnancy_week) : null,
        has_gestational_diabetes: form.has_gestational_diabetes,
        goals: form.goals,
        activity_level: form.activity_level || null,
        medical_notes: form.medical_notes || null,
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">הפרופיל שלי</h1>
        <p className="text-slate-500 mt-1">עדכן פרטים</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-5 flex items-center gap-4">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
          <User className="w-7 h-7 text-emerald-600" />
        </div>
        <div>
          <p className="font-bold text-slate-800 text-lg">{profile.full_name}</p>
          <div className="flex gap-2 mt-1">
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{profile.gender === 'female' ? 'נקבה' : 'זכר'}</span>
            {profile.is_pregnant && <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">הריון שבוע {profile.pregnancy_week}{(profile as any).pregnancy_days_in_week > 0 ? `+${(profile as any).pregnancy_days_in_week} ימים` : ''}</span>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-5">
        <h2 className="font-semibold text-slate-800 mb-4">נתונים גופניים</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'גובה (ס"מ)', key: 'height_cm', placeholder: '170' },
            { label: 'משקל (ק"ג)', key: 'weight_kg', placeholder: '65' },
            ...(!form.skip_target_weight ? [{ label: 'משקל יעד (ק"ג)', key: 'target_weight_kg', placeholder: '60' }] : []),
            ...(profile.is_pregnant ? [{ label: 'שבוע הריון', key: 'pregnancy_week', placeholder: '24' }] : []),
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-sm font-medium text-slate-600 block mb-1">{label}</label>
              <input type="number" placeholder={placeholder} value={form[key as keyof typeof form] as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
          ))}
        </div>
        {profile.is_pregnant && (
          <label className="flex items-center gap-3 mt-4 cursor-pointer">
            <div onClick={() => setForm({ ...form, skip_target_weight: !form.skip_target_weight })}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form.skip_target_weight ? 'bg-pink-500 border-pink-500' : 'border-slate-300'}`}>
              {form.skip_target_weight && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-sm text-slate-700">בהריון - לא מתמקדת במשקל יעד כרגע</span>
          </label>
        )}
        {profile.is_pregnant && (
          <label className="flex items-center gap-3 mt-3 cursor-pointer">
            <div onClick={() => setForm({ ...form, has_gestational_diabetes: !form.has_gestational_diabetes })}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form.has_gestational_diabetes ? 'bg-pink-500 border-pink-500' : 'border-slate-300'}`}>
              {form.has_gestational_diabetes && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-sm text-slate-700">סוכרת הריון (GDM)</span>
          </label>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-5">
        <h2 className="font-semibold text-slate-800 mb-4">יעדים</h2>
        <div className="flex flex-wrap gap-2">
          {GOALS.filter(g => { if (g.value === 'healthy_pregnancy') return profile.is_pregnant; return true }).map(({ value, label }) => (
            <button key={value} onClick={() => toggleGoal(value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${form.goals.includes(value) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-5">
        <h2 className="font-semibold text-slate-800 mb-4">רמת פעילות</h2>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_LEVELS.map(({ value, label }) => (
            <button key={value} onClick={() => setForm({ ...form, activity_level: value })}
              className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${form.activity_level === value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-5">
        <h2 className="font-semibold text-slate-800 mb-3">הערות רפואיות</h2>
        <textarea placeholder="בעיות גב, לחץ דם, כאבי ברכיים..." value={form.medical_notes}
          onChange={(e) => setForm({ ...form, medical_notes: e.target.value })} rows={3}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Smartphone className="w-5 h-5 text-emerald-600" />
          <h2 className="font-semibold text-slate-800">סנכרון Apple Health</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">סנכרן צעדים יומיים אוטומטית מהאייפון דרך iOS Shortcuts</p>

        {syncToken ? (
          <>
            <div className="bg-slate-50 rounded-xl p-3 mb-3">
              <p className="text-xs text-slate-400 mb-1 font-medium">כתובת ה-Shortcut שלך:</p>
              <p className="text-xs text-slate-600 break-all font-mono leading-relaxed">
                {`${typeof window !== 'undefined' ? window.location.origin : ''}/api/steps/sync?token=${syncToken}&steps=`}
                <span className="text-emerald-600 font-bold">[STEPS]</span>
              </p>
            </div>

            <div className="flex gap-2 mb-5">
              <button onClick={copyUrl}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'הועתק!' : 'העתק כתובת'}
              </button>
              <button onClick={regenerateToken} disabled={regenerating}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-60">
                <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                חדש
              </button>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">הוראות הגדרה (צעד אחר צעד):</p>
              {[
                '📱 באפליקציית "קיצורי דרך" (Shortcuts) — לחצי על + למעלה ימין',
                '📱 באפליקציית "קיצורי דרך" — לחצי "הוסף פעולה", חפשי "health", בחרי "חפש דגימות בריאות". הגדירי: סוג = צעדים, תקופה = היום',
                '📱 באפליקציית "קיצורי דרך" — לחצי + שוב, חפשי "חשב סטטיסטיקות", בחרי "סכום". זה מחבר את כל הצעדים למספר אחד',
                '📱 באפליקציית "קיצורי דרך" — לחצי + שוב, חפשי "URL", הדביקי את הכתובת שהעתקת מכאן. לחצי על הכתובת ← בסוף אחרי steps= לחצי על הסוגר הכחול { } ← בחרי "תוצאה מחושבת"',
                '📱 באפליקציית "קיצורי דרך" — לחצי + שוב, חפשי "קבל תוכן של כתובת URL", בחרי אותה. זה שולח את הצעדים לאפליקציה',
                '📱 באפליקציית "קיצורי דרך" — לחצי על השם "קיצור דרך חדש" למעלה ← שני "הוסף לאוטומציה" ← "שעה ביום" ← הגדירי 23:00 כל יום ← כבי "שאל לפני הרצה"',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-sm text-slate-600">{step}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-6">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <button onClick={handleSave} disabled={saving}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all ${saved ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} disabled:opacity-60`}>
          {saving ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          <span>{saving ? 'שומר...' : saved ? 'נשמר!' : 'שמור שינויים'}</span>
        </button>
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-medium text-sm border-2 border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
          <LogOut className="w-5 h-5" /><span>החלף משתמש</span>
        </button>
      </div>
    </div>
  )
}
