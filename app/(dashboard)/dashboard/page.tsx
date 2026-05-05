'use client'

import { useEffect, useState, useCallback } from 'react'
import { Profile, WaterLog, FoodLog, WorkoutSession } from '@/lib/types'
import { calculateDailyTargets } from '@/lib/nutrition-data'
import { getWorkoutsForUser } from '@/lib/workout-data'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Droplets, Flame, Dumbbell, Plus, AlertTriangle, TrendingUp,
  Footprints, X, Check, Loader2,
} from 'lucide-react'
import { format, startOfWeek, addDays, isToday, parseISO } from 'date-fns'
import { getPregnancyTip } from '@/lib/pregnancy-tips'

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const WATER_GLASS_ML = 250
const STEP_GOAL = 10000

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([])
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([])
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<WorkoutSession[]>([])
  const [todaySteps, setTodaySteps] = useState(0)
  const [weeklySteps, setWeeklySteps] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [stepsModalOpen, setStepsModalOpen] = useState(false)
  const [stepsInput, setStepsInput] = useState('')
  const [savingSteps, setSavingSteps] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 })
  const weekStartStr = format(weekStart, 'yyyy-MM-dd')

  const fetchData = useCallback(async () => {
    const [profileRes, foodRes, waterRes, workoutRes, stepsRes] = await Promise.all([
      fetch('/api/profile').then((r) => r.json()),
      fetch(`/api/food-logs?date=${today}`).then((r) => r.json()),
      fetch(`/api/water-logs?date=${today}`).then((r) => r.json()),
      fetch(`/api/workout-sessions?from=${weekStartStr}`).then((r) => r.json()),
      fetch(`/api/steps?from=${weekStartStr}`).then((r) => r.json()),
    ])

    if (profileRes) setProfile(profileRes as Profile)
    if (Array.isArray(foodRes)) setFoodLogs(foodRes as FoodLog[])
    if (Array.isArray(waterRes)) setWaterLogs(waterRes as WaterLog[])
    if (Array.isArray(workoutRes)) setWeeklyWorkouts(workoutRes as WorkoutSession[])
    if (Array.isArray(stepsRes)) {
      const stepsMap: Record<string, number> = {}
      stepsRes.forEach((s: { steps: number; date: string }) => {
        const dateKey = String(s.date).slice(0, 10)
        stepsMap[dateKey] = s.steps
      })
      setWeeklySteps(stepsMap)
      setTodaySteps(stepsMap[today] ?? 0)
    }

    setLoading(false)
  }, [today, weekStartStr])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') fetchData() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [fetchData])

  const addWater = async () => {
    await fetch('/api/water-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount_ml: WATER_GLASS_ML, date: today }),
    })
    fetchData()
  }

  const saveSteps = async () => {
    const steps = parseInt(stepsInput)
    if (isNaN(steps) || steps < 0) return
    setSavingSteps(true)
    await fetch('/api/steps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steps, date: today }),
    })
    await fetchData()
    setSavingSteps(false)
    setStepsModalOpen(false)
    setStepsInput('')
  }

  const targets = profile
    ? calculateDailyTargets(profile.gender, profile.is_pregnant, profile.activity_level)
    : { calories: 2000, protein: 125, carbs: 225, fat: 67, water_ml: 2700 }

  const totalCalories = foodLogs.reduce((sum, f) => sum + (f.calories ?? 0), 0)
  const totalWater = waterLogs.reduce((sum, w) => sum + w.amount_ml, 0)
  const todayWorkouts = weeklyWorkouts.filter((w) => isToday(parseISO(w.completed_at))).length

  const weeklyData = DAYS.map((day, i) => {
    const date = format(addDays(weekStart, i), 'yyyy-MM-dd')
    const workouts = weeklyWorkouts.filter((w) => w.completed_at.startsWith(date)).length
    const steps = weeklySteps[date] ?? 0
    return { day: day.slice(0, 3), workouts, steps: Math.round(steps / 1000) }
  })

  const caloriesPct = Math.min(100, Math.round((totalCalories / targets.calories) * 100))
  const waterPct = Math.min(100, Math.round((totalWater / targets.water_ml) * 100))
  const waterGlasses = Math.floor(totalWater / WATER_GLASS_ML)
  const targetGlasses = Math.ceil(targets.water_ml / WATER_GLASS_ML)
  const stepsPct = Math.min(100, Math.round((todaySteps / STEP_GOAL) * 100))
  const suggestedWorkout = profile ? getWorkoutsForUser(profile.gender, profile.is_pregnant, profile.pregnancy_week)[0] : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto pb-24">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          היי, {profile?.full_name?.split(' ')[0] ?? ''} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {profile?.is_pregnant && profile.pregnancy_week && (() => {
        const tip = getPregnancyTip(profile.pregnancy_week)
        return (
          <>
            <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-pink-800 font-medium text-sm">
                  הריון – שבוע {profile.pregnancy_week}{(profile as any).pregnancy_days_in_week > 0 ? ` ו-${(profile as any).pregnancy_days_in_week} ימים` : ''}
                  {profile.has_gestational_diabetes && ' | סוכרת הריון'}
                </p>
                <p className="text-pink-600 text-xs mt-1">זכרי להתייעץ עם הרופאה לפני כל שינוי בפעילות.</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🤰</span>
                <h2 className="font-bold text-pink-900 text-base">שבוע {profile.pregnancy_week}{(profile as any).pregnancy_days_in_week > 0 ? `+${(profile as any).pregnancy_days_in_week}` : ''} — מה קורה?</h2>
              </div>
              <p className="text-pink-700 text-sm mb-4 leading-relaxed">{tip.highlight}</p>
              <div className="space-y-3">
                <div className="bg-white/70 rounded-xl p-3 flex gap-3">
                  <span className="text-lg flex-shrink-0">🥗</span>
                  <div>
                    <p className="text-xs font-semibold text-pink-800 mb-0.5">תזונה השבוע</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{tip.nutrition}</p>
                  </div>
                </div>
                <div className="bg-white/70 rounded-xl p-3 flex gap-3">
                  <span className="text-lg flex-shrink-0">💪</span>
                  <div>
                    <p className="text-xs font-semibold text-pink-800 mb-0.5">אימון השבוע</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{tip.workout}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      })()}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard icon={<Flame className="w-5 h-5 text-orange-500" />} label="קלוריות" value={Math.round(totalCalories)} target={targets.calories} unit="קק״ל" pct={caloriesPct} color="orange" />
        <StatCard icon={<Droplets className="w-5 h-5 text-blue-500" />} label="מים" value={Math.round(totalWater / 100) / 10} target={targets.water_ml / 1000} unit="ליטר" pct={waterPct} color="blue" />
        <StatCard icon={<Dumbbell className="w-5 h-5 text-emerald-500" />} label="אימונים" value={todayWorkouts} target={1} unit="היום" pct={Math.min(100, todayWorkouts * 100)} color="emerald" />
        <StatCard icon={<Footprints className="w-5 h-5 text-purple-500" />} label="צעדים" value={todaySteps.toLocaleString('he-IL')} target={STEP_GOAL.toLocaleString('he-IL')} unit="" pct={stepsPct} color="purple"
          onClick={() => { setStepsInput(todaySteps.toString()); setStepsModalOpen(true) }} clickable />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />מעקב מים
            </h2>
            <span className="text-sm text-slate-500">{totalWater} / {targets.water_ml} מ"ל</span>
          </div>
          <div className="grid grid-cols-8 gap-1 mb-4">
            {Array.from({ length: Math.min(targetGlasses, 16) }).map((_, i) => (
              <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-base transition-all ${i < waterGlasses ? 'bg-blue-100 text-blue-500' : 'bg-slate-100 text-slate-300'}`}>💧</div>
            ))}
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: `${waterPct}%` }} />
          </div>
          <button onClick={addWater} className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-3 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /><span>הוסף כוס ({WATER_GLASS_ML} מ"ל)</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Footprints className="w-5 h-5 text-purple-500" />צעדים
            </h2>
            <button onClick={() => { setStepsInput(todaySteps.toString()); setStepsModalOpen(true) }} className="text-sm text-purple-600 hover:text-purple-700 font-medium">עדכן</button>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-4xl font-bold text-slate-800">{todaySteps.toLocaleString('he-IL')}</span>
            <span className="text-slate-400 text-sm">/ {STEP_GOAL.toLocaleString('he-IL')}</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div className={`h-full rounded-full transition-all duration-500 ${stepsPct >= 100 ? 'bg-purple-500' : 'bg-purple-400'}`} style={{ width: `${stepsPct}%` }} />
          </div>
          <p className="text-xs text-slate-400 mb-4">
            {stepsPct >= 100 ? '🎉 הגעת ליעד הצעדים היומי!' : `נותרו ${(STEP_GOAL - todaySteps).toLocaleString('he-IL')} צעדים`}
          </p>
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
            <p className="text-xs text-purple-600 font-medium mb-1">💡 Apple Health & Apple Watch</p>
            <p className="text-xs text-purple-500 leading-relaxed">הזן ידנית מהשעון או הטלפון</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5 text-emerald-500" />אימונים שבועיים</h2>
          <div dir="ltr" className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }} formatter={(v) => [`${v} אימונים`, '']} />
                <Bar dataKey="workouts" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4"><Footprints className="w-5 h-5 text-purple-500" />צעדים שבועיים</h2>
          <div dir="ltr" className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }} formatter={(v) => [`${v}k צעדים`, '']} />
                <Bar dataKey="steps" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {suggestedWorkout && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4"><Dumbbell className="w-5 h-5 text-emerald-500" />אימון להיום</h2>
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 mb-1">{suggestedWorkout.name}</h3>
              <p className="text-slate-500 text-sm mb-3">{suggestedWorkout.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">⏱ {suggestedWorkout.duration} דקות</span>
                <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full">🔥 {suggestedWorkout.calories} קק״ל</span>
              </div>
            </div>
            <a href="/workouts" className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap flex-shrink-0">לאימונים</a>
          </div>
        </div>
      )}

      {stepsModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-lg">עדכן צעדים</h3>
              <button onClick={() => setStepsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">כמה צעדים עשית היום?</p>
            <input type="number" min="0" max="100000" placeholder="לדוגמה: 8500" value={stepsInput}
              onChange={(e) => setStepsInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveSteps()} autoFocus
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-400 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setStepsModalOpen(false)} className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl text-sm font-medium">ביטול</button>
              <button onClick={saveSteps} disabled={!stepsInput || savingSteps}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2">
                {savingSteps ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                שמור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, target, unit, pct, color, onClick, clickable }: {
  icon: React.ReactNode; label: string; value: number | string; target: number | string
  unit: string; pct: number; color: 'orange' | 'blue' | 'emerald' | 'purple'; onClick?: () => void; clickable?: boolean
}) {
  const colorMap = { orange: 'bg-orange-500', blue: 'bg-blue-400', emerald: 'bg-emerald-500', purple: 'bg-purple-500' }
  const Tag = clickable ? 'button' : 'div'
  return (
    <Tag onClick={onClick} className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 ${clickable ? 'hover:border-purple-200 transition-colors cursor-pointer text-right' : ''}`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs font-medium text-slate-500">{label}</span></div>
      <div className="mb-1">
        <span className="text-xl font-bold text-slate-800">{value}</span>
        <span className="text-xs text-slate-400 mr-1">/ {target} {unit}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${colorMap[color]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </Tag>
  )
}
