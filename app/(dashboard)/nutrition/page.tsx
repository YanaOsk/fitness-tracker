'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile, FoodLog, MealType, ExchangeType, FoodExchange } from '@/lib/types'
import {
  calculateDailyTargets,
  exchangeLists,
  exchangeTypeLabels,
  exchangeTypeColors,
  mealTypeLabels,
  validateGDMeal,
} from '@/lib/nutrition-data'
import { Plus, X, AlertTriangle, Apple } from 'lucide-react'
import { format } from 'date-fns'

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
const EXCHANGE_TYPES: ExchangeType[] = ['protein', 'carb', 'fat', 'vegetable', 'fruit', 'dairy']

export default function NutritionPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMeal, setModalMeal] = useState<MealType>('breakfast')
  const [modalCategory, setModalCategory] = useState<ExchangeType | null>(null)
  const [adding, setAdding] = useState(false)

  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [pRes, fRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('food_logs').select('*').eq('user_id', user.id).eq('date', today).order('logged_at'),
    ])
    if (pRes.data) setProfile(pRes.data as Profile)
    if (fRes.data) setFoodLogs(fRes.data as FoodLog[])
    setLoading(false)
  }, [today])

  useEffect(() => { fetchData() }, [fetchData])

  const addFood = async (food: FoodExchange, mealType: MealType) => {
    setAdding(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('food_logs').insert({
      user_id: user.id,
      meal_type: mealType,
      food_name: food.name,
      exchange_type: food.type,
      portions: 1,
      calories: food.calories,
      protein_g: food.protein_g,
      carbs_g: food.carbs_g,
      fat_g: food.fat_g,
      date: today,
    })
    await fetchData()
    setAdding(false)
    setModalOpen(false)
    setModalCategory(null)
  }

  const removeFood = async (id: string) => {
    await supabase.from('food_logs').delete().eq('id', id)
    fetchData()
  }

  const targets = profile
    ? calculateDailyTargets(profile.gender, profile.is_pregnant, profile.activity_level)
    : { calories: 2000, protein: 125, carbs: 225, fat: 67, water_ml: 2700 }

  const totalCalories = foodLogs.reduce((s, f) => s + (f.calories ?? 0), 0)
  const totalProtein = foodLogs.reduce((s, f) => s + (f.protein_g ?? 0), 0)
  const totalCarbs = foodLogs.reduce((s, f) => s + (f.carbs_g ?? 0), 0)
  const totalFat = foodLogs.reduce((s, f) => s + (f.fat_g ?? 0), 0)

  const gdWarnings = profile?.has_gestational_diabetes
    ? validateGDMeal(foodLogs)
    : []

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
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">מעקב תזונה</h1>
        <p className="text-slate-500 mt-1">{today}</p>
      </div>

      {/* GD Warnings */}
      {gdWarnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 text-sm mb-1">⚠️ סוכרת הריון – שים לב</p>
              {gdWarnings.map((w, i) => (
                <p key={i} className="text-amber-700 text-sm">{w}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Daily Summary */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
        <h2 className="font-semibold text-slate-800 mb-4">סיכום יומי</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'קלוריות', value: Math.round(totalCalories), target: targets.calories, unit: 'קק״ל', color: 'bg-orange-500' },
            { label: 'חלבון', value: Math.round(totalProtein), target: targets.protein, unit: 'גרם', color: 'bg-red-400' },
            { label: 'פחמימות', value: Math.round(totalCarbs), target: targets.carbs, unit: 'גרם', color: 'bg-amber-400' },
            { label: 'שומן', value: Math.round(totalFat), target: targets.fat, unit: 'גרם', color: 'bg-yellow-400' },
          ].map(({ label, value, target, unit, color }) => (
            <div key={label}>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs text-slate-500">{label}</span>
                <span className="text-xs text-slate-400">{value}/{target} {unit}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all`}
                  style={{ width: `${Math.min(100, (value / target) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-2xl font-bold text-slate-800">
          {Math.round(totalCalories)} <span className="text-sm font-normal text-slate-400">/ {targets.calories} קק״ל</span>
        </p>
      </div>

      {/* Meal sections */}
      {MEAL_TYPES.map((mealType) => {
        const items = foodLogs.filter((f) => f.meal_type === mealType)
        const mealCalories = items.reduce((s, f) => s + (f.calories ?? 0), 0)

        return (
          <div key={mealType} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">{mealTypeLabels[mealType]}</h3>
                {items.length > 0 && (
                  <p className="text-xs text-slate-400 mt-0.5">{Math.round(mealCalories)} קק״ל</p>
                )}
              </div>
              <button
                onClick={() => { setModalMeal(mealType); setModalOpen(true); setModalCategory(null) }}
                className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>הוסף</span>
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">לא נרשמה אכילה</p>
            ) : (
              <div className="space-y-2">
                {items.map((food) => (
                  <div key={food.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-700 text-sm truncate">{food.food_name}</p>
                      <div className="flex gap-3 text-xs text-slate-400 mt-0.5">
                        {food.calories && <span>{food.calories} קק״ל</span>}
                        {food.exchange_type && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${exchangeTypeColors[food.exchange_type as ExchangeType]}`}>
                            {exchangeTypeLabels[food.exchange_type as ExchangeType]}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFood(food.id)}
                      className="text-slate-300 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Add Food Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">
                הוסף לרשימה – {mealTypeLabels[modalMeal]}
              </h3>
              <button onClick={() => { setModalOpen(false); setModalCategory(null) }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5">
              {/* Category picker */}
              {!modalCategory ? (
                <div>
                  <p className="text-sm text-slate-500 mb-4">בחר קבוצת מזון:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {EXCHANGE_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => setModalCategory(type)}
                        className={`p-4 rounded-2xl border-2 text-center transition-all hover:shadow-sm ${exchangeTypeColors[type]} border-current/30`}
                      >
                        <div className="font-semibold text-sm">{exchangeTypeLabels[type]}</div>
                        <div className="text-xs opacity-70 mt-1">{exchangeLists[type].length} אפשרויות</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setModalCategory(null)}
                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
                  >
                    <Apple className="w-4 h-4" />
                    חזרה לקבוצות
                  </button>
                  <p className="text-sm font-medium text-slate-700 mb-3">
                    {exchangeTypeLabels[modalCategory]} – בחר מוצר:
                  </p>
                  <div className="space-y-2">
                    {exchangeLists[modalCategory].map((food) => (
                      <button
                        key={food.name}
                        onClick={() => !adding && addFood(food, modalMeal)}
                        disabled={adding}
                        className="w-full text-right flex items-center justify-between bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-xl px-4 py-3 transition-all disabled:opacity-60"
                      >
                        <div>
                          <p className="font-medium text-slate-700 text-sm">{food.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{food.portion}</p>
                        </div>
                        <div className="text-right text-xs text-slate-500 space-y-0.5">
                          <p className="font-semibold text-slate-700">{food.calories} קק״ל</p>
                          <p>ח: {food.protein_g}גר׳ | פ: {food.carbs_g}גר׳ | ש: {food.fat_g}גר׳</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
