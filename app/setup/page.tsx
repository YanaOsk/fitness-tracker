'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Activity, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { Goal, ActivityLevel } from '@/lib/types'

const GOALS: { value: Goal; label: string; icon: string }[] = [
  { value: 'weight_loss', label: 'ירידה במשקל', icon: '⚖️' },
  { value: 'muscle_gain', label: 'בניית שריר', icon: '💪' },
  { value: 'healthy_pregnancy', label: 'הריון בריא', icon: '🤰' },
  { value: 'general_health', label: 'בריאות כללית', icon: '❤️' },
  { value: 'endurance', label: 'שיפור סיבולת', icon: '🏃' },
]

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'sedentary', label: 'יושבני', desc: 'מעט מאוד פעילות גופנית' },
  { value: 'light', label: 'קל', desc: 'פעילות קלה 1-3 פעמים בשבוע' },
  { value: 'moderate', label: 'בינוני', desc: 'פעילות מתונה 3-5 פעמים בשבוע' },
  { value: 'active', label: 'פעיל', desc: 'פעילות עצימה 6-7 פעמים בשבוע' },
  { value: 'very_active', label: 'פעיל מאוד', desc: 'ספורטאי / עבודה פיזית' },
]

interface FormData {
  gender: 'male' | 'female' | ''
  birth_year: string
  height_cm: string
  weight_kg: string
  target_weight_kg: string
  is_pregnant: boolean
  pregnancy_week: string
  has_gestational_diabetes: boolean
  goals: Goal[]
  activity_level: ActivityLevel | ''
  medical_notes: string
}

const TOTAL_STEPS = 5

export default function SetupPage() {
  const router = useRouter()
  const { update } = useSession()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormData>({
    gender: '',
    birth_year: '',
    height_cm: '',
    weight_kg: '',
    target_weight_kg: '',
    is_pregnant: false,
    pregnancy_week: '',
    has_gestational_diabetes: false,
    goals: [],
    activity_level: '',
    medical_notes: '',
  })

  const canProceed = (): boolean => {
    if (step === 1) return form.gender !== ''
    if (step === 2) return form.height_cm !== '' && form.weight_kg !== ''
    if (step === 3) {
      if (form.gender === 'female' && form.is_pregnant) return form.pregnancy_week !== ''
      return true
    }
    if (step === 4) return form.goals.length > 0
    if (step === 5) return form.activity_level !== ''
    return true
  }

  const toggleGoal = (goal: Goal) => {
    setForm((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal) ? prev.goals.filter((g) => g !== goal) : [...prev.goals, goal],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gender: form.gender,
        birth_year: form.birth_year ? parseInt(form.birth_year) : null,
        height_cm: form.height_cm ? parseInt(form.height_cm) : null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        target_weight_kg: form.target_weight_kg ? parseFloat(form.target_weight_kg) : null,
        is_pregnant: form.is_pregnant,
        pregnancy_week: form.is_pregnant && form.pregnancy_week ? parseInt(form.pregnancy_week) : null,
        has_gestational_diabetes: form.has_gestational_diabetes,
        goals: form.goals,
        activity_level: form.activity_level,
        medical_notes: form.medical_notes || null,
        setup_complete: true,
      }),
    })
    await update({ setup_complete: true })
    router.push('/dashboard')
  }

  const stepTitles = ['מגדר', 'פרטים אישיים', form.gender === 'female' ? 'הריון' : 'מצב בריאות', 'יעדים', 'רמת פעילות']

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center px-4 py-10" dir="rtl">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-800">FitLife</span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-slate-700">{stepTitles[step - 1]}</span>
              <span className="text-sm text-slate-400">שלב {step} מתוך {TOTAL_STEPS}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">מה המגדר שלך?</h2>
              <p className="text-slate-500 mb-6">נתאים את האימונים והתפריטים בהתאם</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ value: 'female', label: 'אישה', emoji: '👩' }, { value: 'male', label: 'גבר', emoji: '👨' }].map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    onClick={() => setForm({ ...form, gender: value as 'male' | 'female' })}
                    className={`p-6 rounded-2xl border-2 text-center transition-all ${form.gender === value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-slate-300 text-slate-700'}`}
                  >
                    <div className="text-4xl mb-2">{emoji}</div>
                    <div className="font-semibold">{label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">פרטים אישיים</h2>
              <p className="text-slate-500 mb-6">לחישוב צרכי קלוריות ומים מדויקים</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">גובה (ס"מ) *</label>
                    <input type="number" placeholder="170" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">משקל (ק"ג) *</label>
                    <input type="number" placeholder="65" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">שנת לידה</label>
                    <input type="number" placeholder="1990" value={form.birth_year} onChange={(e) => setForm({ ...form, birth_year: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">משקל יעד (ק"ג)</label>
                    <input type="number" placeholder="60" value={form.target_weight_kg} onChange={(e) => setForm({ ...form, target_weight_kg: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              {form.gender === 'female' ? (
                <>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">מצב הריון</h2>
                  <p className="text-slate-500 mb-6">חשוב להתאמת אימונים ותפריטים בטוחים</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setForm({ ...form, is_pregnant: false, pregnancy_week: '', has_gestational_diabetes: false })}
                        className={`p-5 rounded-2xl border-2 text-center transition-all ${!form.is_pregnant ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                        <div className="text-3xl mb-2">🌸</div>
                        <div className="font-semibold text-slate-700">לא בהריון</div>
                      </button>
                      <button onClick={() => setForm({ ...form, is_pregnant: true })}
                        className={`p-5 rounded-2xl border-2 text-center transition-all ${form.is_pregnant ? 'border-pink-500 bg-pink-50' : 'border-slate-200 hover:border-slate-300'}`}>
                        <div className="text-3xl mb-2">🤰</div>
                        <div className="font-semibold text-slate-700">בהריון</div>
                      </button>
                    </div>
                    {form.is_pregnant && (
                      <div className="bg-pink-50 rounded-2xl p-5 space-y-4 border border-pink-100">
                        <div>
                          <label className="text-sm font-medium text-slate-700 block mb-1">שבוע הריון *</label>
                          <input type="number" min="1" max="42" placeholder="24" value={form.pregnancy_week}
                            onChange={(e) => setForm({ ...form, pregnancy_week: e.target.value })}
                            className="w-full border border-pink-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <div onClick={() => setForm({ ...form, has_gestational_diabetes: !form.has_gestational_diabetes })}
                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${form.has_gestational_diabetes ? 'bg-pink-500 border-pink-500' : 'border-slate-300'}`}>
                            {form.has_gestational_diabetes && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <span className="text-slate-700 text-sm">יש לי סוכרת הריון (GDM)</span>
                        </label>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">הערות רפואיות</h2>
                  <p className="text-slate-500 mb-6">מידע שיעזור לנו להתאים את האימונים עבורך</p>
                  <textarea placeholder="לדוגמה: בעיות גב, לחץ דם גבוה, כאבי ברכיים..." value={form.medical_notes}
                    onChange={(e) => setForm({ ...form, medical_notes: e.target.value })} rows={5}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
                  <p className="text-slate-400 text-xs mt-2">שדה זה אינו חובה</p>
                </>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">מה היעדים שלך?</h2>
              <p className="text-slate-500 mb-6">ניתן לבחור יותר מיעד אחד</p>
              <div className="space-y-3">
                {GOALS.filter(g => {
                  if (g.value === 'healthy_pregnancy') return form.gender === 'female' && form.is_pregnant
                  if (g.value === 'muscle_gain') return form.gender === 'male' || !form.is_pregnant
                  return true
                }).map(({ value, label, icon }) => (
                  <button key={value} onClick={() => toggleGoal(value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-right ${form.goals.includes(value) ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <span className="text-2xl">{icon}</span>
                    <span className="font-medium text-slate-700">{label}</span>
                    {form.goals.includes(value) && <Check className="w-5 h-5 text-emerald-600 mr-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">רמת פעילות</h2>
              <p className="text-slate-500 mb-6">כמה אתה/ה פעיל/ה כרגע?</p>
              <div className="space-y-3">
                {ACTIVITY_LEVELS.map(({ value, label, desc }) => (
                  <button key={value} onClick={() => setForm({ ...form, activity_level: value })}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${form.activity_level === value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="text-right">
                      <div className="font-semibold text-slate-700">{label}</div>
                      <div className="text-sm text-slate-500">{desc}</div>
                    </div>
                    {form.activity_level === value && (
                      <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="w-5 h-5" />
              <span>הקודם</span>
            </button>

            {step < TOTAL_STEPS ? (
              <button onClick={() => setStep(step + 1)} disabled={!canProceed()}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <span>הבא</span>
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={handleSave} disabled={!canProceed() || saving}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                <span>{saving ? 'שומר...' : 'סיום וכניסה'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
