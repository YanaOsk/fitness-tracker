'use client'

import { useEffect, useState } from 'react'
import { Profile, WorkoutPlan } from '@/lib/types'
import { getWorkoutsForUser, workoutTypeLabels, workoutTypeColors, intensityLabels, intensityColors } from '@/lib/workout-data'
import { AlertTriangle, Clock, Flame, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function WorkoutsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [completing, setCompleting] = useState<string | null>(null)
  const [completedToday, setCompletedToday] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    const fetchData = async () => {
      const [profileData, sessionsData] = await Promise.all([
        fetch('/api/profile').then((r) => r.json()),
        fetch(`/api/workout-sessions?from=${today}T00:00:00`).then((r) => r.json()),
      ])

      if (profileData) {
        const p = profileData as Profile
        setProfile(p)
        setWorkouts(getWorkoutsForUser(p.gender, p.is_pregnant, p.pregnancy_week))
      }
      if (Array.isArray(sessionsData)) {
        setCompletedToday(sessionsData.map((s: { workout_name: string }) => s.workout_name))
      }
      setLoading(false)
    }
    fetchData()
  }, [today])

  const completeWorkout = async (workout: WorkoutPlan) => {
    setCompleting(workout.id)
    await fetch('/api/workout-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workout_type: workout.type,
        workout_name: workout.name,
        duration_minutes: workout.duration,
        intensity: workout.intensity,
      }),
    })
    setCompletedToday((prev) => [...prev, workout.name])
    setCompleting(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">תוכניות אימון</h1>
        <p className="text-slate-500 mt-1">{workouts.length} תוכניות לבחירה</p>
      </div>

      {profile?.is_pregnant && (
        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-pink-800 font-semibold text-sm mb-1">אימונים לשבוע {profile.pregnancy_week}</p>
              <ul className="text-pink-600 text-xs space-y-1">
                <li>• כל האימונים מסומנים כבטוחים להריון שלך</li>
                <li>• הפסיקי מיד אם מרגישה כאב, סחרחורת או קוצר נשימה</li>
                <li>• התייעצי עם הרופא לפני כל שינוי בשגרת הפעילות</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {workouts.map((workout) => {
          const isDone = completedToday.includes(workout.name)
          const isExpanded = expanded === workout.id

          return (
            <div key={workout.id} className={`bg-white rounded-2xl shadow-sm border transition-all ${isDone ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100'}`}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${workoutTypeColors[workout.type]}`}>{workoutTypeLabels[workout.type]}</span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${intensityColors[workout.intensity]}`}>{intensityLabels[workout.intensity]}</span>
                      {isDone && <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">✓ הושלם היום</span>}
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{workout.name}</h3>
                    <p className="text-slate-500 text-sm mt-1">{workout.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" />{workout.duration} דקות</span>
                  <span className="flex items-center gap-1.5"><Flame className="w-4 h-4 text-orange-400" />{workout.calories} קק״ל</span>
                  <span className="text-slate-400">{workout.exercises.length} תרגילים</span>
                </div>
              </div>

              {workout.safetyWarnings && workout.safetyWarnings.length > 0 && (
                <div className="mx-5 mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-amber-700 font-medium text-xs mb-1.5 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" />אזהרות בטיחות</p>
                  <ul className="space-y-1">
                    {workout.safetyWarnings.map((w: string, i: number) => <li key={i} className="text-amber-600 text-xs">• {w}</li>)}
                  </ul>
                </div>
              )}

              {isExpanded && (
                <div className="px-5 pb-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">תרגילים:</h4>
                  <div className="space-y-2">
                    {workout.exercises.map((ex: import('@/lib/types').WorkoutExercise, i: number) => (
                      <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
                        <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-700 text-sm">{ex.name}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {ex.sets && <span className="text-xs text-slate-500">{ex.sets} סטים</span>}
                            {ex.reps && <span className="text-xs text-slate-500">× {ex.reps}</span>}
                            {ex.duration && <span className="text-xs text-slate-500">{ex.duration}</span>}
                            {ex.rest && <span className="text-xs text-slate-400">מנוחה: {ex.rest}</span>}
                            {ex.notes && <span className="text-xs text-slate-400 italic">{ex.notes}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="px-5 pb-5 flex items-center gap-3">
                <button onClick={() => setExpanded(isExpanded ? null : workout.id)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                  {isExpanded ? <><ChevronUp className="w-4 h-4" />הסתר תרגילים</> : <><ChevronDown className="w-4 h-4" />הצג תרגילים</>}
                </button>
                <button onClick={() => !isDone && completeWorkout(workout)} disabled={isDone || completing === workout.id}
                  className={`mr-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${isDone ? 'bg-emerald-100 text-emerald-600 cursor-default' : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60'}`}>
                  {completing === workout.id ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : isDone ? <CheckCircle className="w-4 h-4" /> : null}
                  <span>{isDone ? 'הושלם!' : 'סיימתי אימון'}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
