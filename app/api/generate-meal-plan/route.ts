import OpenAI from 'openai'
import { auth } from '@/lib/auth'
import { Profile } from '@/lib/types'
import { calculateDailyTargets } from '@/lib/nutrition-data'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { prompt, profile }: { prompt: string; profile: Profile | null } = await request.json()
    if (!prompt?.trim()) return Response.json({ error: 'No prompt' }, { status: 400 })

    const targets = profile
      ? calculateDailyTargets(profile.gender, profile.is_pregnant, profile.activity_level)
      : { calories: 2000, protein: 125, carbs: 225, fat: 67, water_ml: 2700 }

    const profileContext = profile ? [
      profile.is_pregnant ? `בהריון שבוע ${profile.pregnancy_week ?? '?'}` : null,
      profile.has_gestational_diabetes ? 'סוכרת הריון (GDM) — חייב חלבון/שומן עם כל פחמימה, ללא סוכר מוסף' : null,
      profile.goals?.includes('weight_loss') ? 'מטרה: ירידה במשקל' : null,
      profile.goals?.includes('muscle_gain') ? 'מטרה: בניית שריר' : null,
    ].filter(Boolean).join(', ') : ''

    const systemPrompt = `אתה דיאטן ישראלי מקצועי. צור תפריט יומי מאוזן בעברית.

פרופיל: ${profileContext || 'כללי'}
יעדים יומיים: ${targets.calories} קל׳ | חלבון ${targets.protein}ג׳ | פחמימות ${targets.carbs}ג׳ | שומן ${targets.fat}ג׳

כללים:
- 5 ארוחות: ארוחת בוקר, ביניים בוקר, ארוחת צהריים, ביניים אחה"צ, ארוחת ערב
- הסכום הכולל חייב להיות קרוב ל-${targets.calories} קל׳
- ${profile?.has_gestational_diabetes ? 'לכל ארוחה עם פחמימות — חייב להיות חלבון או שומן. ללא מיצי פרי, דגנים מסוכרים.' : 'מזון אמיתי, ישראלי, מעשי'}
- השתמש במזון ישראלי נפוץ וזמין

החזר JSON בלבד, מבנה:
[
  {
    "meal_type": "breakfast",
    "food_name": "שם המנה",
    "description": "תיאור קצר ממה מורכבת המנה",
    "calories": 350,
    "protein_g": 15,
    "carbs_g": 45,
    "fat_g": 10
  }
]

meal_type חייב להיות אחד מ: breakfast, snack, lunch, dinner
יהיו בדיוק 5 פריטים (breakfast × 1, snack × 2, lunch × 1, dinner × 1).
החזר רק JSON תקין ללא טקסט נוסף.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1500,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    })

    const raw = response.choices[0].message.content ?? '[]'
    const jsonMatch = raw.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON array found')

    const meals = JSON.parse(jsonMatch[0])
    return Response.json({ meals, targets })
  } catch (err) {
    console.error('generate-meal-plan error:', err)
    return Response.json({ error: 'שגיאה בייצור התפריט' }, { status: 500 })
  }
}
