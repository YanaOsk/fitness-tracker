'use client'

import { useEffect, useState, useCallback } from 'react'
import { Profile, FoodLog, MealType, ExchangeType, FoodExchange } from '@/lib/types'
import {
  calculateDailyTargets, exchangeLists, exchangeTypeLabels, exchangeTypeColors,
  mealTypeLabels, validateGDMeal,
} from '@/lib/nutrition-data'
import {
  Plus, X, AlertTriangle, Sparkles, Zap, Coffee, Loader2,
  BookOpen, ChevronDown, ChevronUp, Star, UtensilsCrossed, Check,
} from 'lucide-react'
import { format } from 'date-fns'
import { getMealRecommendations, getDailyCalorieTarget, type MealOption } from '@/lib/meal-recommendations'

interface AiEstimate {
  food_name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; serving_description: string
}
interface GeneratedMeal {
  meal_type: string; food_name: string; description: string
  calories: number; protein_g: number; carbs_g: number; fat_g: number
}
interface QuickMeal {
  id: string; name: string; meal_type: string | null; total_calories: number
  items: { food_name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; exchange_type?: string }[]
}

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

type TabType = 'ai' | 'exchange' | 'quick' | 'menu'

export default function NutritionPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([])
  const [quickMeals, setQuickMeals] = useState<QuickMeal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('ai')
  const [freeText, setFreeText] = useState('')
  const [mealType, setMealType] = useState<MealType>('breakfast')
  const [aiResult, setAiResult] = useState<AiEstimate | null>(null)
  const [estimating, setEstimating] = useState(false)
  const [confirmingAi, setConfirmingAi] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMeal, setModalMeal] = useState<MealType>('breakfast')
  const [modalCategory, setModalCategory] = useState<ExchangeType | null>(null)
  const [adding, setAdding] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [quickMealName, setQuickMealName] = useState('')
  const [savingQuickMeal, setSavingQuickMeal] = useState(false)
  const [expandedLog, setExpandedLog] = useState<MealType | null>(null)
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const [planPrompt, setPlanPrompt] = useState('')
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedMeal[] | null>(null)
  const [savingPlan, setSavingPlan] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')

  const fetchData = useCallback(async () => {
    const [profileData, foodData, mealsData] = await Promise.all([
      fetch('/api/profile').then((r) => r.json()),
      fetch(`/api/food-logs?date=${today}`).then((r) => r.json()),
      fetch('/api/quick-meals').then((r) => r.json()),
    ])
    if (profileData) setProfile(profileData as Profile)
    if (Array.isArray(foodData)) setFoodLogs(foodData as FoodLog[])
    if (Array.isArray(mealsData)) setQuickMeals(mealsData as QuickMeal[])
    setLoading(false)
  }, [today])

  useEffect(() => { fetchData() }, [fetchData])

  const estimateCalories = async () => {
    if (!freeText.trim()) return
    setEstimating(true); setAiResult(null)
    try {
      const res = await fetch('/api/estimate-calories', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ food_description: freeText }),
      })
      setAiResult(await res.json())
    } catch {
      setAiResult({ food_name: freeText, calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, serving_description: '' })
    } finally { setEstimating(false) }
  }

  const confirmAiEntry = async () => {
    if (!aiResult) return
    setConfirmingAi(true)
    await fetch('/api/food-logs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meal_type: mealType, food_name: aiResult.food_name, calories: aiResult.calories, protein_g: aiResult.protein_g, carbs_g: aiResult.carbs_g, fat_g: aiResult.fat_g, date: today }),
    })
    setFreeText(''); setAiResult(null); setConfirmingAi(false)
    fetchData()
  }

  const addDrink = async (drink: (typeof QUICK_DRINKS)[0]) => {
    await fetch('/api/food-logs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meal_type: mealType, food_name: drink.name, calories: drink.calories, protein_g: drink.protein_g, carbs_g: drink.carbs_g, fat_g: drink.fat_g, date: today }),
    })
    fetchData()
  }

  const addFoodFromExchange = async (food: FoodExchange, mt: MealType) => {
    setAdding(true)
    await fetch('/api/food-logs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meal_type: mt, food_name: food.name, exchange_type: food.type, portions: 1, calories: food.calories, protein_g: food.protein_g, carbs_g: food.carbs_g, fat_g: food.fat_g, date: today }),
    })
    await fetchData(); setAdding(false); setModalOpen(false); setModalCategory(null)
  }

  const addQuickMeal = async (meal: QuickMeal) => {
    const items = meal.items.map((item) => ({
      meal_type: (meal.meal_type as MealType) || mealType,
      food_name: item.food_name, calories: item.calories, protein_g: item.protein_g, carbs_g: item.carbs_g, fat_g: item.fat_g,
      exchange_type: item.exchange_type || null, date: today,
    }))
    await fetch('/api/food-logs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(items),
    })
    fetchData()
  }

  const deleteQuickMeal = async (id: string) => {
    await fetch(`/api/quick-meals?id=${id}`, { method: 'DELETE' })
    fetchData()
  }

  const saveTodayAsMeal = async () => {
    if (!quickMealName.trim()) return
    setSavingQuickMeal(true)
    const items = foodLogs.map((f) => ({ food_name: f.food_name, calories: f.calories ?? 0, protein_g: f.protein_g ?? 0, carbs_g: f.carbs_g ?? 0, fat_g: f.fat_g ?? 0, exchange_type: f.exchange_type }))
    await fetch('/api/quick-meals', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: quickMealName, total_calories: items.reduce((s, i) => s + i.calories, 0), items }),
    })
    setQuickMealName(''); setSaveModalOpen(false); setSavingQuickMeal(false); fetchData()
  }

  const removeFood = async (id: string) => {
    await fetch(`/api/food-logs?id=${id}`, { method: 'DELETE' })
    fetchData()
  }

  const generatePlan = async () => {
    if (!planPrompt.trim()) return
    setGeneratingPlan(true); setGeneratedPlan(null)
    try {
      const res = await fetch('/api/generate-meal-plan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: planPrompt, profile }),
      })
      const data = await res.json()
      if (data.meals) setGeneratedPlan(data.meals)
    } catch { /* ignore */ } finally { setGeneratingPlan(false) }
  }

  const savePlan = async () => {
    if (!generatedPlan) return
    setSavingPlan(true)
    const items = generatedPlan.map((m) => ({
      meal_type: m.meal_type, food_name: m.food_name,
      calories: m.calories, protein_g: m.protein_g, carbs_g: m.carbs_g, fat_g: m.fat_g, date: today,
    }))
    await fetch('/api/food-logs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(items),
    })
    setSavingPlan(false); setPlanModalOpen(false); setGeneratedPlan(null); setPlanPrompt('')
    fetchData()
  }

  const targets = profile
    ? calculateDailyTargets(profile.gender, profile.is_pregnant, profile.activity_level)
    : { calories: 2000, protein: 125, carbs: 225, fat: 67, water_ml: 2700 }

  const totalCalories = foodLogs.reduce((s, f) => s + (f.calories ?? 0), 0)
  const totalProtein = foodLogs.reduce((s, f) => s + (f.protein_g ?? 0), 0)
  const totalCarbs = foodLogs.reduce((s, f) => s + (f.carbs_g ?? 0), 0)
  const totalFat = foodLogs.reduce((s, f) => s + (f.fat_g ?? 0), 0)
  const gdWarnings = profile?.has_gestational_diabetes ? validateGDMeal(foodLogs) : []

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto pb-28">
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">יומן תזונה</h1>
        <p className="text-slate-500 text-sm mt-0.5">{today}</p>
      </div>

      {gdWarnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm mb-1">⚠️ סוכרת הריון – שים לב</p>
            {gdWarnings.map((w, i) => <p key={i} className="text-amber-700 text-sm">{w}</p>)}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">יעדי יום</h2>
          <div className="text-right">
            <span className={`text-xl font-bold ${totalCalories > targets.calories ? 'text-red-500' : 'text-slate-800'}`}>{Math.round(totalCalories)}</span>
            <span className="text-sm text-slate-400"> / {targets.calories} קק״ל</span>
          </div>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-5">
          <div className={`h-full rounded-full transition-all duration-500 ${totalCalories > targets.calories ? 'bg-red-400' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (totalCalories / targets.calories) * 100)}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'חלבון', value: totalProtein, target: targets.protein, color: 'bg-red-400', textColor: 'text-red-600', bgColor: 'bg-red-50' },
            { label: 'פחמימות', value: totalCarbs, target: targets.carbs, color: 'bg-amber-400', textColor: 'text-amber-600', bgColor: 'bg-amber-50' },
            { label: 'שומן', value: totalFat, target: targets.fat, color: 'bg-yellow-400', textColor: 'text-yellow-600', bgColor: 'bg-yellow-50' },
          ].map(({ label, value, target, color, textColor, bgColor }) => {
            const remaining = Math.max(0, target - Math.round(value))
            const pct = Math.min(100, (value / target) * 100)
            const over = value > target
            return (
              <div key={label} className={`${bgColor} rounded-xl p-3`}>
                <div className="text-xs font-medium text-slate-600 mb-2">{label}</div>
                <div className={`text-lg font-bold ${over ? 'text-red-500' : 'text-slate-800'}`}>{Math.round(value)}<span className="text-xs font-normal text-slate-400">ג׳</span></div>
                <div className="text-xs text-slate-500 mb-1.5">יעד: <span className="font-medium">{target}ג׳</span></div>
                <div className="h-1.5 bg-white/70 rounded-full overflow-hidden mb-1.5">
                  <div className={`h-full ${over ? 'bg-red-400' : color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <div className={`text-xs font-medium ${over ? 'text-red-500' : textColor}`}>
                  {over ? `+${Math.round(value - target)}ג׳ חריגה` : `נותר ${remaining}ג׳`}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button
        onClick={() => setPlanModalOpen(true)}
        className="w-full mb-5 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-3.5 rounded-2xl font-semibold text-sm shadow-sm transition-all active:scale-98"
      >
        <Sparkles className="w-5 h-5" />
        ✨ יצרי לי תפריט יומי עם AI
      </button>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-5">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {MEAL_TYPES.map((mt) => (
            <button key={mt} onClick={() => setMealType(mt)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${mealType === mt ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {mealTypeLabels[mt]}
            </button>
          ))}
        </div>

        <div className="flex border-b border-slate-100 mb-4 overflow-x-auto">
          {[
            { id: 'ai' as TabType, label: 'הכנסה חופשית', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'menu' as TabType, label: 'תפריט מומלץ', icon: <UtensilsCrossed className="w-4 h-4" /> },
            { id: 'exchange' as TabType, label: 'החלפות', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'quick' as TabType, label: 'מהיר', icon: <Zap className="w-4 h-4" /> },
          ].map(({ id, label, icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${activeTab === id ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {icon}{label}
            </button>
          ))}
        </div>

        {activeTab === 'ai' && (
          <div>
            <p className="text-xs text-slate-500 mb-3">כתוב כל דבר שאכלת/שתית — ה-AI יחשב את הקלוריות</p>
            <div className="flex gap-2">
              <textarea rows={2} placeholder={`לדוגמה: "שתיתי כוס קפה עם חלב" או "אכלתי שניצל עם סלט"`}
                value={freeText} onChange={(e) => { setFreeText(e.target.value); if (aiResult) setAiResult(null) }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); estimateCalories() } }}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
              <button onClick={estimateCalories} disabled={!freeText.trim() || estimating}
                className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 text-sm font-medium transition-all">
                {estimating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{estimating ? 'מחשב...' : 'חשב'}</span>
              </button>
            </div>

            {aiResult && (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-800">{aiResult.food_name}</p>
                    {aiResult.serving_description && <p className="text-xs text-slate-500 mt-0.5">{aiResult.serving_description}</p>}
                  </div>
                  <button onClick={() => setAiResult(null)} className="text-slate-300 hover:text-slate-500"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[{ label: 'קלוריות', value: aiResult.calories, unit: '' }, { label: 'חלבון', value: aiResult.protein_g, unit: 'גר׳' }, { label: 'פחמימות', value: aiResult.carbs_g, unit: 'גר׳' }, { label: 'שומן', value: aiResult.fat_g, unit: 'גר׳' }].map(({ label, value, unit }) => (
                    <div key={label} className="bg-white rounded-xl p-2.5 text-center">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">{value}{unit}</p>
                    </div>
                  ))}
                </div>
                <button onClick={confirmAiEntry} disabled={confirmingAi}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {confirmingAi && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>הוסף ל{mealTypeLabels[mealType]}</span>
                </button>
              </div>
            )}

            <div className="mt-5">
              <div className="flex items-center gap-2 mb-3"><Coffee className="w-4 h-4 text-slate-400" /><p className="text-xs font-medium text-slate-500">שתייה מהירה</p></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {QUICK_DRINKS.map((drink) => (
                  <button key={drink.name} onClick={() => addDrink(drink)}
                    className="flex items-center gap-2 bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-xl px-3 py-2.5 transition-all text-right">
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

        {activeTab === 'menu' && (
          <MenuTab profile={profile} mealType={mealType} onAdd={async (option) => {
            await fetch('/api/food-logs', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ meal_type: mealType, food_name: option.name, calories: option.calories, protein_g: option.protein_g, carbs_g: option.carbs_g, fat_g: option.fat_g, date: today }),
            })
            fetchData()
          }} />
        )}

        {activeTab === 'exchange' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {EXCHANGE_TYPES.map((type) => (
              <button key={type} onClick={() => { setModalMeal(mealType); setModalCategory(type); setModalOpen(true) }}
                className={`p-4 rounded-2xl border-2 text-center transition-all hover:shadow-sm ${exchangeTypeColors[type]} border-current/30`}>
                <div className="font-semibold text-sm">{exchangeTypeLabels[type]}</div>
                <div className="text-xs opacity-70 mt-1">{exchangeLists[type].length} מוצרים</div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'quick' && (
          <div>
            {quickMeals.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm mb-4">עדיין אין ארוחות מהירות שמורות.<br />שמור את הצלחת של היום כתבנית!</p>
                <button onClick={() => setSaveModalOpen(true)} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700">שמור ארוחה מהירה מהיום</button>
              </div>
            ) : (
              <div className="space-y-3">
                <button onClick={() => setSaveModalOpen(true)}
                  className="w-full border-2 border-dashed border-emerald-200 text-emerald-600 hover:bg-emerald-50 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />שמור את הצלחת של היום
                </button>
                {quickMeals.map((meal) => (
                  <div key={meal.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-800">{meal.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{meal.total_calories} קק״ל | {meal.items.length} פריטים</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => addQuickMeal(meal)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg transition-all">הוסף</button>
                        <button onClick={() => deleteQuickMeal(meal.id)} className="text-slate-300 hover:text-red-400 p-1.5 rounded-lg transition-all"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {meal.items.slice(0, 4).map((item, i) => <span key={i} className="text-xs bg-white border border-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{item.food_name}</span>)}
                      {meal.items.length > 4 && <span className="text-xs text-slate-400">+{meal.items.length - 4} נוספים</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {MEAL_TYPES.map((mt) => {
          const items = foodLogs.filter((f) => f.meal_type === mt)
          if (items.length === 0) return null
          const mealCal = items.reduce((s, f) => s + (f.calories ?? 0), 0)
          const isExpanded = expandedLog === mt
          return (
            <div key={mt} className="bg-white rounded-2xl shadow-sm border border-slate-100">
              <button onClick={() => setExpandedLog(isExpanded ? null : mt)} className="w-full flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-800">{mealTypeLabels[mt]}</span>
                  <span className="text-sm text-slate-400">{Math.round(mealCal)} קק״ל</span>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{items.length} פריטים</span>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {items.map((food) => (
                    <div key={food.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-700 text-sm truncate">{food.food_name}</p>
                        <div className="flex gap-3 text-xs text-slate-400 mt-0.5">
                          {food.calories !== null && <span>{food.calories} קק״ל</span>}
                          {food.protein_g !== null && food.protein_g > 0 && <span>ח׳ {Math.round(food.protein_g)}גר׳</span>}
                          {food.carbs_g !== null && food.carbs_g > 0 && <span>פ׳ {Math.round(food.carbs_g)}גר׳</span>}
                        </div>
                      </div>
                      <button onClick={() => removeFood(food.id)} className="text-slate-300 hover:text-red-400 transition-colors p-1 flex-shrink-0"><X className="w-4 h-4" /></button>
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

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">{modalCategory ? exchangeTypeLabels[modalCategory] : 'בחר קבוצה'}{' – '}{mealTypeLabels[modalMeal]}</h3>
              <button onClick={() => { setModalOpen(false); setModalCategory(null) }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {modalCategory && exchangeLists[modalCategory].map((food) => (
                <button key={food.name} onClick={() => !adding && addFoodFromExchange(food, modalMeal)} disabled={adding}
                  className="w-full text-right flex items-center justify-between bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-xl px-4 py-3 transition-all disabled:opacity-60">
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

      {planModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">✨ יצרי תפריט יומי עם AI</h3>
                <p className="text-xs text-slate-400 mt-0.5">תארי מה אוהבת, מה יש בבית, מה להימנע</p>
              </div>
              <button onClick={() => { setPlanModalOpen(false); setGeneratedPlan(null); setPlanPrompt('') }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {!generatedPlan ? (
                <div>
                  <textarea
                    rows={4}
                    value={planPrompt}
                    onChange={(e) => setPlanPrompt(e.target.value)}
                    placeholder={'לדוגמה: "אני אוהבת אוכל ים תיכוני, יש לי בבית עוף וירקות, אל תכניסי גלוטן" או "תפריט מלא לעיצוב גוף, הרבה חלבון"'}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none mb-4"
                  />
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['אוכל ים תיכוני', 'הרבה חלבון', 'צמחוני', 'ללא גלוטן', 'אוכל ישראלי קלאסי'].map((s) => (
                      <button key={s} onClick={() => setPlanPrompt(s)}
                        className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-full hover:bg-violet-100 transition-colors">{s}</button>
                    ))}
                  </div>
                  <button onClick={generatePlan} disabled={!planPrompt.trim() || generatingPlan}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-3.5 rounded-xl font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2 transition-all">
                    {generatingPlan ? <><Loader2 className="w-5 h-5 animate-spin" />מכין תפריט...</> : <><Sparkles className="w-5 h-5" />יצרי תפריט</>}
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-500 mb-4">סך הכל: <span className="font-semibold text-slate-800">{generatedPlan.reduce((s, m) => s + m.calories, 0)} קל׳</span> | חלבון {generatedPlan.reduce((s, m) => s + m.protein_g, 0).toFixed(0)}ג׳ | פחמימות {generatedPlan.reduce((s, m) => s + m.carbs_g, 0).toFixed(0)}ג׳ | שומן {generatedPlan.reduce((s, m) => s + m.fat_g, 0).toFixed(0)}ג׳</p>
                  <div className="space-y-3 mb-5">
                    {generatedPlan.map((meal, i) => {
                      const labelMap: Record<string, string> = { breakfast: '🌅 ארוחת בוקר', snack: '🍎 ביניים', lunch: '☀️ ארוחת צהריים', dinner: '🌙 ארוחת ערב' }
                      return (
                        <div key={i} className="bg-slate-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-500">{labelMap[meal.meal_type] ?? meal.meal_type}</span>
                            <span className="text-xs font-semibold text-orange-600">{meal.calories} קל׳</span>
                          </div>
                          <p className="font-semibold text-slate-800 text-sm mb-0.5">{meal.food_name}</p>
                          {meal.description && <p className="text-xs text-slate-500 leading-relaxed">{meal.description}</p>}
                          <div className="flex gap-3 mt-2 text-xs text-slate-400">
                            <span>ח׳ {meal.protein_g}ג׳</span>
                            <span>פ׳ {meal.carbs_g}ג׳</span>
                            <span>ש׳ {meal.fat_g}ג׳</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setGeneratedPlan(null) }} className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl text-sm font-medium">יצרי מחדש</button>
                    <button onClick={savePlan} disabled={savingPlan}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                      {savingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      שמרי ביומן
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {saveModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-bold text-slate-800 text-lg mb-2">שמור ארוחה מהירה</h3>
            <p className="text-sm text-slate-500 mb-4">כל {foodLogs.length} הפריטים של היום יישמרו כתבנית</p>
            <input type="text" placeholder="שם לארוחה (לדוג׳: ״ארוחת בוקר שגרתית״)" value={quickMealName}
              onChange={(e) => setQuickMealName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setSaveModalOpen(false)} className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl text-sm font-medium">ביטול</button>
              <button onClick={saveTodayAsMeal} disabled={!quickMealName.trim() || savingQuickMeal || foodLogs.length === 0}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2">
                {savingQuickMeal && <Loader2 className="w-4 h-4 animate-spin" />}שמור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuTab({ profile, mealType, onAdd }: {
  profile: Profile | null
  mealType: MealType
  onAdd: (option: MealOption) => Promise<void>
}) {
  const slots = getMealRecommendations(profile)
  const dailyCal = getDailyCalorieTarget(profile)
  const isGDM = profile?.has_gestational_diabetes
  const [adding, setAdding] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(slots[0]?.type ?? null)

  const handleAdd = async (option: MealOption, slotType: string) => {
    setAdding(`${slotType}-${option.name}`)
    await onAdd(option)
    setAdding(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">תפריט יומי מומלץ • {dailyCal} קל׳ ביום</p>
        {isGDM && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">סוכרת הריון — בטוח מסומן ✓</span>}
      </div>

      <div className="space-y-3">
        {slots.map((slot) => {
          const isOpen = expanded === slot.type
          return (
            <div key={slot.type} className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : slot.type)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{slot.emoji}</span>
                  <span className="font-semibold text-slate-800 text-sm">{slot.label}</span>
                  <span className="text-xs text-slate-400">{slot.options.length} אפשרויות</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {isOpen && (
                <div className="divide-y divide-slate-100">
                  {slot.options.map((option) => {
                    const key = `${slot.type}-${option.name}`
                    const isAdding = adding === key
                    return (
                      <div key={option.name} className={`p-3 flex items-start gap-3 ${isGDM && option.gdm_safe ? 'bg-emerald-50/40' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 flex-wrap mb-1">
                            <p className="font-medium text-slate-800 text-sm">{option.name}</p>
                            {isGDM && option.gdm_safe && <span className="text-xs text-emerald-600">✓ GDM</span>}
                          </div>
                          <p className="text-xs text-slate-500 mb-2 leading-relaxed">{option.description}</p>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{option.calories} קל׳</span>
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">ח׳ {option.protein_g}גר׳</span>
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">פ׳ {option.carbs_g}גר׳</span>
                            {option.tags.filter(t => !t.startsWith('⭐')).slice(0, 2).map((tag) => (
                              <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{tag}</span>
                            ))}
                            {option.tags.find(t => t.startsWith('⭐')) && (
                              <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">⭐ הריון</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAdd(option, slot.type)}
                          disabled={!!adding}
                          className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs px-3 py-2 rounded-xl flex items-center gap-1 transition-all"
                        >
                          {isAdding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                          הוסף
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
