'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile, WaterLog, FoodLog, WorkoutSession } from '@/lib/types'
import { calculateDailyTargets } from '@/lib/nutrition-data'
import { getWorkoutsForUser } from '@/lib/workout-data'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Droplets, Flame, Dumbbell, Plus, AlertTriangle, TrendingUp } from 'lucide-react'
import { format, startOfWeek, addDays, isToday, parseISO } from 'date-fns'

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const WATER_GLASS_ML = 250

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([])
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([])
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, foodRes, waterRes, workoutRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('food_logs').select('*').eq('user_id', user.id).eq('date', today),
      supabase.from('water_logs').select('*').eq('user_id', user.id).eq('date', today),
      supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', startOfWeek(new Date(), { weekStartsOn: 0 }).toISOString()),
    ])

    if (profileRes.data) setProfile(profileRes.data as Profile)
    if (foodRes.data) setFoodLogs(foodRes.data as FoodLog[])
    if (waterRes.data) setWaterLogs(waterRes.data as WaterLog[])
    if (workoutRes.data) setWeeklyWorkouts(workoutRes.data as WorkoutSession[])
    setLoading(false)
  }, [today])

  useEffect(() => { fetchData() }, [fetchData])

  const addWater = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('water_logs').insert({
      user_id: user.id,
      amount_ml: WATER_GLASS_ML,
      date: today,
    })
    fetchData()
  }

  const targets = profile
    ? calculateDailyTargets(profile.gender, profile.is_pregnant, profile.activity_level)
    : { calories: 2000, protein: 125, carbs: 225, fat: 67, water_ml: 2700 }

  const totalCalories = foodLogs.reduce((sum, f) => sum + (f.calories ?? 0), 0)
  const totalWater = waterLogs.reduce((sum, w) => sum + w.amount_ml, 0)
  const todayWorkouts = weeklyWorkouts.filter((w) => isToday(parseISO(w.completed_at))).length

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 })
  const weeklyData = DAYS.map((day, i) => {
    const date = format(addDays(weekStart, i), 'yyyy-MM-dd')
    const count = weeklyWorkouts.filter((w) => w.completed_at.startsWith(date)).length
    return { day: day.slice(0, 3), count }
  })

  const caloriesPct = Math.min(100, Math.round((totalCalories / targets.calories) * 100))
  const waterPct = Math.min(100, Math.round((totalWater / targets.water_ml) * 100))
  const waterGlasses = Math.floor(totalWater / WATER_GLASS_ML)
  const targetGlasses = Math.ceil(targets.water_ml / WATER_GLASS_ML)

  const suggestedWorkout = profile
    ? getWorkoutsForUser(profile.gender, profile.is_pregnant, profile.pregnancy_week)[0]
    : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          שלום, {profile?.full_name?.split(' ')[0] ?? 'שם משתמש'} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Pregnancy warning */}
      {profile?.is_pregnant && (
        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-pink-800 font-medium text-sm">
              מצב הריון: שבוע {profile.pregnancy_week}
              {profile.has_gestational_diabetes && ' | סוכרת הריון'}
            </p>
            <p className="text-pink-600 text-xs mt-1">
              כל האימונים והתפריטים מותאמים למצב שלך. תמיד התייעצי עם הרופא שלך.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          label="קלוריות"
          value={totalCalories}
          target={targets.calories}
          unit="קק״ל"
          pct={caloriesPct}
          color="orange"
        />
        <StatCard
          icon={<Droplets className="w-5 h-5 text-blue-500" />}
          label="מים"
          value={Math.round(totalWater / 100) / 10}
          target={targets.water_ml / 1000}
          unit="ליטר"
          pct={waterPct}
          color="blue"
        />
        <StatCard
          icon={<Dumbbell className="w-5 h-5 text-emerald-500" />}
          label="אימונים"
          value={todayWorkouts}
          target={1}
          unit="היום"
          pct={Math.min(100, todayWorkouts * 100)}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Water Tracker */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              מעקב מים
            </h2>
            <span className="text-sm text-slate-500">{totalWater} / {targets.water_ml} מ"ל</span>
          </div>
          <div className="grid grid-cols-8 gap-1 mb-4">
            {Array.from({ length: targetGlasses }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-lg flex items-center justify-center text-lg transition-all ${
                  i < waterGlasses ? 'bg-blue-100 text-blue-500' : 'bg-slate-100 text-slate-300'
                }`}
              >
                💧
              </div>
            ))}
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${waterPct}%` }}
            />
          </div>
          <button
            onClick={addWater}
            className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-3 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>הוסף כוס ({WATER_GLASS_ML} מ"ל)</span>
          </button>
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            פעילות שבועית
          </h2>
          <div dir="ltr" className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(v) => [`${v} אימונים`, '']}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            {weeklyWorkouts.length} אימונים הושלמו השבוע
          </p>
        </div>
      </div>

      {/* Suggested Workout */}
      {suggestedWorkout && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <Dumbbell className="w-5 h-5 text-emerald-500" />
            אימון מומלץ להיום
          </h2>
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 mb-1">{suggestedWorkout.name}</h3>
              <p className="text-slate-500 text-sm mb-3">{suggestedWorkout.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                  ⏱ {suggestedWorkout.duration} דקות
                </span>
                <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                  🔥 {suggestedWorkout.calories} קק״ל
                </span>
              </div>
            </div>
            <a
              href="/workouts"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap flex-shrink-0"
            >
              לכל האימונים
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon, label, value, target, unit, pct, color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  target: number
  unit: string
  pct: number
  color: 'orange' | 'blue' | 'emerald'
}) {
  const colorMap = {
    orange: 'bg-orange-500',
    blue: 'bg-blue-400',
    emerald: 'bg-emerald-500',
  }
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      <div className="mb-1">
        <span className="text-xl sm:text-2xl font-bold text-slate-800">{value}</span>
        <span className="text-xs text-slate-400 mr-1">/ {target} {unit}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorMap[color]} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
