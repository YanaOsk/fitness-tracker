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
import {
  Plus, X, AlertTriangle, Sparkles, Zap, Coffee, Loader2,
  BookOpen, ChevronDown, ChevronUp, Star,
} from 'lucide-react'
import { format } from 'date-fns'

// ─── Types ──────────────────────────────────────────────────────────────────

interface AiEstimate {
  food_name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  serving_description: string
}

interface QuickMeal {
  id: string
  name: string
  meal_type: string | null
  total_calories: number
  items: {
    food_name: string
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
    exchange_type?: string
  }[]
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
const EXCHANGE_TYPES: ExchangeType[] = ['protein', 'carb', 'fat', 'vegetable', 'fruit', 'dairy']

const QUICK_DRINKS = [
  { name: 'קפה שחור', calories: 2, protein_g: 0, carbs_g: 0, fat_g: 0, emoji: '☕' },
  { name: 'קפה עם חלב שלם', calories: 55, protein_g: 3, carbs_g: 5, fat_g: 2, emoji: '☕' },
  { name: 'קפה עם חלב דל שומן', calories: 40, protein_g: 3, carbs_g: 4, fat_g: 1, emoji: '☕' },
  { name: 'תה שחור', calories: 2, protein_g: 0, carbs_g: 0, fat_g: 0, emoji: '🍵' },
  { name: 'תה ירוק', calories: 2, protein_g: 0, carbs_g: 0, fat_g: 0, emoji: '🍵' },
  { name: 'מיץ תפוזים טבעי (200 מ"ל)', calories: 90, protein_g: 1, carbs_g: 21, fat_g: 0, emoji: '🧃' },
  { name: 'מיץ תפוחים (200 מ"ל)', calories: 95, protein_g: 0, carbs_g: 24, fat_g: 0, emoji: '🧃' },
  { name: 'קולה (330 מ"ל)', calories: 140, protein_g: 0, carbs_g: 35, fat_g: 0, emoji: '🥤' },
  { name: 'קולה זירו (330 מ"ל)', calories: 1, protein_g: 0, carbs_g: 0, fat_g: 0, emoji: '🥤' },
  { name: 'בירה (330 מ"ל)', calories: 150, protein_g: 1, carbs_g: 13, fat_g: 0, emoji: '🍺' },
  { name: 'יין אדום (150 מ"ל)', calories: 125, protein_g: 0, carbs_g: 4, fat_g: 0, emoji: '🍷' },
  { name: 'יין לבן (150 מ"ל)', calories: 120, protein_g: 0, carbs_g: 3, fat_g: 0, emoji: '🥂' },
  { name: 'ווודקה/וויסקי (30 מ"ל)', calories: 65, protein_g: 0, carbs_g: 0, fat_g: 0, emoji: '🥃' },
  { name: 'מים מינרלים', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, emoji: '💧' },
  { name: 'חלב 3% (200 מ"ל)', calories: 120, protein_g: 6, carbs_g: 10, fat_g: 6, emoji: '🥛' },
  { name: 'שוקו (200 מ"ל)', calories: 160, protein_g: 5, carbs_g: 28, fat_g: 3, emoji: '🥛' },
]

// ─── Main Component ───────────────────────────────────────────────────────────

type TabType = 'ai' | 'exchange' | 'quick'

export default function NutritionPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([])
  const [quickMeals, setQuickMeals] = useState<QuickMeal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('ai')

  // AI entry state
  const [freeText, setFreeText] = useState('')
  const [mealType, setMealType] = useState<MealType>('breakfast')
  const [aiResult, setAiResult] = useState<AiEstimate | null>(null)
  const [estimating, setEstimating] = useState(false)
  const [confirmingAi, setConfirmingAi] = useState(false)

  // Exchange lists state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMeal, setModalMeal] = useState<MealType>('breakfast')
  const [modalCategory, setModalCategory] = useState<ExchangeType | null>(null)
  const [adding, setAdding] = useState(false)

  // Save quick meal modal
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [quickMealName, setQuickMealName] = useState('')
  const [savingQuickMeal, setSavingQuickMeal] = useState(false)

  // Expanded meals list in logs
  const [expandedLog, setExpandedLog] = useState<MealType | null>(null)

  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  const fetchData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const [pRes, fRes, qRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('logged_at'),
      supabase
        .from('quick_meals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ])

    if (pRes.data) setProfile(pRes.data as Profile)
    if (fRes.data) setFoodLogs(fRes.data as FoodLog[])
    if (qRes.data) setQuickMeals(qRes.data as QuickMeal[])
    setLoading(false)
  }, [today])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── AI Estimation ────────────────────────────────────────────────────────

  const estimateCalories = async () => {
    if (!freeText.trim()) return
    setEstimating(true)
    setAiResult(null)
    try {
      const res = await fetch('/api/estimate-calories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ food_description: freeText }),
      })
      const data = await res.json()
      setAiResult(data)
    } catch {
      setAiResult({ food_name: freeText, calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, serving_description: '' })
    } finally {
      setEstimating(false)
    }
  }

  const confirmAiEntry = async () => {
    if (!aiResult) return
    setConfirmingAi(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('food_logs').insert({
      user_id: user.id,
      meal_type: mealType,
      food_name: aiResult.food_name,
      calories: aiResult.calories,
      protein_g: aiResult.protein_g,
      carbs_g: aiResult.carbs_g,
      fat_g: aiResult.fat_g,
      date: today,
    })

    setFreeText('')
    setAiResult(null)
    setConfirmingAi(false)
    fetchData()
  }

  // ── Quick add drinks ─────────────────────────────────────────────────────

  const addDrink = async (drink: (typeof QUICK_DRINKS)[0]) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('food_logs').insert({
      user_id: user.id,
      meal_type: mealType,
      food_name: drink.name,
      calories: drink.calories,
      protein_g: drink.protein_g,
      carbs_g: drink.carbs_g,
      fat_g: drink.fat_g,
      date: today,
    })
    fetchData()
  }

  // ── Exchange lists ───────────────────────────────────────────────────────

  const addFoodFromExchange = async (food: FoodExchange, mt: MealType) => {
    setAdding(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('food_logs').insert({
      user_id: user.id,
      meal_type: mt,
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

  // ── Quick meals ──────────────────────────────────────────────────────────

  const addQuickMeal = async (meal: QuickMeal) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    const rows = meal.items.map((item) => ({
      user_id: user.id,
      meal_type: (meal.meal_type as MealType) || mealType,
      food_name: item.food_name,
      calories: item.calories,
      protein_g: item.protein_g,
      carbs_g: item.carbs_g,
      fat_g: item.fat_g,
      exchange_type: item.exchange_type || null,
      date: today,
    }))
    await supabase.from('food_logs').insert(rows)
    fetchData()
  }

  const deleteQuickMeal = async (id: string) => {
    await supabase.from('quick_meals').delete().eq('id', id)
    fetchData()
  }

  const saveTodayAsMeal = async () => {
    if (!quickMealName.trim()) return
    setSavingQuickMeal(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const items = foodLogs.map((f) => ({
      food_name: f.food_name,
      calories: f.calories ?? 0,
      protein_g: f.protein_g ?? 0,
      carbs_g: f.carbs_g ?? 0,
      fat_g: f.fat_g ?? 0,
      exchange_type: f.exchange_type,
    }))

    const totalCal = items.reduce((s, i) => s + i.calories, 0)

    await supabase.from('quick_meals').insert({
      user_id: user.id,
      name: quickMealName,
      total_calories: totalCal,
      items,
    })

    setQuickMealName('')
    setSaveModalOpen(false)
    setSavingQuickMeal(false)
    fetchData()
  }

  // ── Remove food log ──────────────────────────────────────────────────────

  const removeFood = async (id: string) => {
    await supabase.from('food_logs').delete().eq('id', id)
    fetchData()
  }

  // ── Computed values ──────────────────────────────────────────────────────

  const targets = profile
    ? calculateDailyTargets(profile.gender, profile.is_pregnant, profile.activity_level)
    : { calories: 2000, protein: 125, carbs: 225, fat: 67, water_ml: 2700 }

  const totalCalories = foodLogs.reduce((s, f) => s + (f.calories ?? 0), 0)
  const totalProtein = foodLogs.reduce((s, f) => s + (f.protein_g ?? 0), 0)
  const totalCarbs = foodLogs.reduce((s, f) => s + (f.carbs_g ?? 0), 0)
  const totalFat = foodLogs.reduce((s, f) => s + (f.fat_g ?? 0), 0)

  const gdWarnings =
    profile?.has_gestational_diabetes ? validateGDMeal(foodLogs) : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto pb-28">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">יומן תזונה</h1>
        <p className="text-slate-500 text-sm mt-0.5">{today}</p>
      </div>

      {/* GD warning */}
      {gdWarnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm mb-1">⚠️ סוכרת הריון – שים לב</p>
            {gdWarnings.map((w, i) => (
              <p key={i} className="text-amber-700 text-sm">{w}</p>
            ))}
          </div>
        </div>
      )}

      {/* Daily summary */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">סיכום יומי</h2>
          <span className="text-2xl font-bold text-slate-800">
            {Math.round(totalCalories)}{' '}
            <span className="text-sm font-normal text-slate-400">/ {targets.calories} קק״ל</span>
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              totalCalories > targets.calories ? 'bg-red-400' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, (totalCalories / targets.calories) * 100)}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'חלבון', value: totalProtein, target: targets.protein, color: 'bg-red-400' },
            { label: 'פחמימות', value: totalCarbs, target: targets.carbs, color: 'bg-amber-400' },
            { label: 'שומן', value: totalFat, target: targets.fat, color: 'bg-yellow-400' },
          ].map(({ label, value, target, color }) => (
            <div key={label} className="bg-slate-50 rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">{label}</div>
              <div className="text-sm font-bold text-slate-700">
                {Math.round(value)}
                <span className="font-normal text-slate-400">/{target}גר׳</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full`}
                  style={{ width: `${Math.min(100, (value / target) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meal type + tabs nav */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-5">
        {/* Meal type selector */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {MEAL_TYPES.map((mt) => (
            <button
              key={mt}
              onClick={() => setMealType(mt)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                mealType === mt
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mealTypeLabels[mt]}
            </button>
          ))}
        </div>

        {/* Input tabs */}
        <div className="flex border-b border-slate-100 mb-4">
          {[
            { id: 'ai' as TabType, label: 'הכנסה חופשית', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'exchange' as TabType, label: 'רשימות החלפה', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'quick' as TabType, label: 'מהיר', icon: <Zap className="w-4 h-4" /> },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                activeTab === id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab 1: AI Free Entry ───────────────────────────────────────── */}
        {activeTab === 'ai' && (
          <div>
            <p className="text-xs text-slate-500 mb-3">
              כתוב כל דבר שאכלת/שתית — ה-AI יחשב את הקלוריות
            </p>
            <div className="flex gap-2">
              <textarea
                rows={2}
                placeholder={`לדוגמה: "שתיתי כוס קפה עם חלב" או "אכלתי שנה שניה שניצל עם סלט"`}
                value={freeText}
                onChange={(e) => {
                  setFreeText(e.target.value)
                  if (aiResult) setAiResult(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    estimateCalories()
                  }
                }}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
              />
              <button
                onClick={estimateCalories}
                disabled={!freeText.trim() || estimating}
                className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 text-sm font-medium transition-all"
              >
                {estimating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{estimating ? 'מחשב...' : 'חשב'}</span>
              </button>
            </div>

            {/* AI result */}
            {aiResult && (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-800">{aiResult.food_name}</p>
                    {aiResult.serving_description && (
                      <p className="text-xs text-slate-500 mt-0.5">{aiResult.serving_description}</p>
                    )}
                  </div>
                  <button onClick={() => setAiResult(null)} className="text-slate-300 hover:text-slate-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: 'קלוריות', value: aiResult.calories, unit: '' },
                    { label: 'חלבון', value: aiResult.protein_g, unit: 'גר׳' },
                    { label: 'פחמימות', value: aiResult.carbs_g, unit: 'גר׳' },
                    { label: 'שומן', value: aiResult.fat_g, unit: 'גר׳' },
                  ].map(({ label, value, unit }) => (
                    <div key={label} className="bg-white rounded-xl p-2.5 text-center">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">
                        {value}{unit}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={confirmAiEntry}
                  disabled={confirmingAi}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {confirmingAi && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>הוסף ל{mealTypeLabels[mealType]}</span>
                </button>
              </div>
            )}

            {/* Quick drinks */}
            <div className="mt-5">
              <div className="flex items-center gap-2 mb-3">
                <Coffee className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-medium text-slate-500">שתייה מהירה</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {QUICK_DRINKS.map((drink) => (
                  <button
                    key={drink.name}
                    onClick={() => addDrink(drink)}
                    className="flex items-center gap-2 bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-xl px-3 py-2.5 transition-all text-right"
                  >
                    <span className="text-lg flex-shrink-0">{drink.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{drink.name}</p>
                      <p className="text-xs text-slate-400">{drink.calories} קק״ל</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Exchange Lists ──────────────────────────────────────── */}
        {activeTab === 'exchange' && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {EXCHANGE_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setModalMeal(mealType)
                    setModalCategory(type)
                    setModalOpen(true)
                  }}
                  className={`p-4 rounded-2xl border-2 text-center transition-all hover:shadow-sm ${exchangeTypeColors[type]} border-current/30`}
                >
                  <div className="font-semibold text-sm">{exchangeTypeLabels[type]}</div>
                  <div className="text-xs opacity-70 mt-1">{exchangeLists[type].length} מוצרים</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 3: Quick Meals ─────────────────────────────────────────── */}
        {activeTab === 'quick' && (
          <div>
            {quickMeals.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm mb-4">
                  עדיין אין ארוחות מהירות שמורות.
                  <br />
                  שמור את הצלחת של היום כתבנית לפעמים הבאות!
                </p>
                <button
                  onClick={() => setSaveModalOpen(true)}
                  className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700"
                >
                  שמור ארוחה מהירה מהיום
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => setSaveModalOpen(true)}
                  className="w-full border-2 border-dashed border-emerald-200 text-emerald-600 hover:bg-emerald-50 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  שמור את הצלחת של היום
                </button>
                {quickMeals.map((meal) => (
                  <div key={meal.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-800">{meal.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {meal.total_calories} קק״ל | {meal.items.length} פריטים
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addQuickMeal(meal)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg transition-all"
                        >
                          הוסף
                        </button>
                        <button
                          onClick={() => deleteQuickMeal(meal.id)}
                          className="text-slate-300 hover:text-red-400 p-1.5 rounded-lg transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {meal.items.slice(0, 4).map((item, i) => (
                        <span key={i} className="text-xs bg-white border border-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {item.food_name}
                        </span>
                      ))}
                      {meal.items.length > 4 && (
                        <span className="text-xs text-slate-400">+{meal.items.length - 4} נוספים</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Food log by meal type */}
      <div className="space-y-3">
        {MEAL_TYPES.map((mt) => {
          const items = foodLogs.filter((f) => f.meal_type === mt)
          if (items.length === 0) return null
          const mealCal = items.reduce((s, f) => s + (f.calories ?? 0), 0)
          const isExpanded = expandedLog === mt

          return (
            <div key={mt} className="bg-white rounded-2xl shadow-sm border border-slate-100">
              <button
                onClick={() => setExpandedLog(isExpanded ? null : mt)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-800">{mealTypeLabels[mt]}</span>
                  <span className="text-sm text-slate-400">{Math.round(mealCal)} קק״ל</span>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    {items.length} פריטים
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {items.map((food) => (
                    <div key={food.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-700 text-sm truncate">{food.food_name}</p>
                        <div className="flex gap-3 text-xs text-slate-400 mt-0.5">
                          {food.calories !== null && <span>{food.calories} קק״ל</span>}
                          {food.protein_g !== null && food.protein_g > 0 && (
                            <span>ח׳ {Math.round(food.protein_g)}גר׳</span>
                          )}
                          {food.carbs_g !== null && food.carbs_g > 0 && (
                            <span>פ׳ {Math.round(food.carbs_g)}גר׳</span>
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

        {foodLogs.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <p className="text-sm">לא נרשמה אכילה היום</p>
            <p className="text-xs mt-1">השתמש בטאב ״הכנסה חופשית״ להוסיף</p>
          </div>
        )}
      </div>

      {/* Exchange modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">
                {modalCategory ? exchangeTypeLabels[modalCategory] : 'בחר קבוצה'}
                {' – '}
                {mealTypeLabels[modalMeal]}
              </h3>
              <button
                onClick={() => { setModalOpen(false); setModalCategory(null) }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {modalCategory &&
                exchangeLists[modalCategory].map((food) => (
                  <button
                    key={food.name}
                    onClick={() => !adding && addFoodFromExchange(food, modalMeal)}
                    disabled={adding}
                    className="w-full text-right flex items-center justify-between bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-xl px-4 py-3 transition-all disabled:opacity-60"
                  >
                    <div>
                      <p className="font-medium text-slate-700 text-sm">{food.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{food.portion}</p>
                    </div>
                    <div className="text-xs text-slate-500 text-right space-y-0.5">
                      <p className="font-semibold text-slate-700">{food.calories} קק״ל</p>
                      <p>ח: {food.protein_g}  פ: {food.carbs_g}  ש: {food.fat_g}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Save quick meal modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-bold text-slate-800 text-lg mb-2">שמור ארוחה מהירה</h3>
            <p className="text-sm text-slate-500 mb-4">
              כל {foodLogs.length} הפריטים של היום יישמרו כתבנית
            </p>
            <input
              type="text"
              placeholder="שם לארוחה (לדוג׳: ״ארוחת בוקר שגרתית״)"
              value={quickMealName}
              onChange={(e) => setQuickMealName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setSaveModalOpen(false)}
                className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl text-sm font-medium"
              >
                ביטול
              </button>
              <button
                onClick={saveTodayAsMeal}
                disabled={!quickMealName.trim() || savingQuickMeal || foodLogs.length === 0}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {savingQuickMeal && <Loader2 className="w-4 h-4 animate-spin" />}
                שמור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
