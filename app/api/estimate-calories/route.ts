import OpenAI from 'openai'
import { auth } from '@/lib/auth'

const openai = new OpenAI({ apiKey: (process.env.OPENAI_API_KEY ?? '').replace(/^﻿/, '').trim() })

interface NutritionResult {
  food_name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  serving_description: string
  source?: 'openfoodfacts' | 'ai'
}

async function parseDescription(text: string): Promise<{ product: string; grams: number | null }> {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 128,
    response_format: { type: 'json_object' },
    messages: [{
      role: 'user',
      content: `Extract from this food description: "${text}"
Return JSON: {"product": "english product name (e.g. nutella, coca cola, bamba)", "grams": 30}
grams = estimated grams consumed, or null for generic foods.`,
    }],
  })
  try {
    const parsed = JSON.parse(res.choices[0].message.content ?? '{}')
    return { product: parsed.product || text, grams: parsed.grams || null }
  } catch {
    return { product: text, grams: null }
  }
}

async function searchOpenFoodFacts(query: string, grams: number | null): Promise<NutritionResult | null> {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=3&fields=product_name,nutriments,serving_size,serving_quantity&action=process&search_simple=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'FitLife-App/1.0 (fitness tracker)' },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return null

    const data = await res.json()
    const product = data.products?.[0]
    if (!product?.nutriments) return null

    const n = product.nutriments
    const cal100 = Number(n['energy-kcal_100g'] ?? n['energy_100g'] ?? 0) / (n['energy_100g'] && !n['energy-kcal_100g'] ? 4.184 : 1)
    if (!cal100 || cal100 > 900) return null

    const servingG = grams ?? (Number(product.serving_quantity) || 100)
    const factor = servingG / 100

    return {
      food_name: product.product_name || query,
      calories: Math.round(cal100 * factor),
      protein_g: Math.round((Number(n['proteins_100g'] ?? 0) * factor) * 10) / 10,
      carbs_g: Math.round((Number(n['carbohydrates_100g'] ?? 0) * factor) * 10) / 10,
      fat_g: Math.round((Number(n['fat_100g'] ?? 0) * factor) * 10) / 10,
      serving_description: `${servingG} גרם (מקור: Open Food Facts)`,
      source: 'openfoodfacts',
    }
  } catch {
    return null
  }
}

interface NutritionItem {
  food_name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number
}

async function estimateWithAI(food_description: string): Promise<NutritionResult & { items?: NutritionItem[] }> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1024,
    response_format: { type: 'json_object' },
    messages: [{
      role: 'user',
      content: `אתה מומחה תזונה ישראלי. פרק את התיאור הבא לפריטים נפרדים וחשב ערכים תזונתיים.

תיאור: "${food_description}"

כללים:
- אם המשתמש ציין קלוריות — השתמש בערך שציין
- מוצרים מותגים (נוטלה, ביסלי, במבה וכו') — ערכים מדויקים
- כמויות ריאליות לפי הישראלי הממוצע

החזר JSON: {"items": [{"food_name": "שם בעברית", "calories": 123, "protein_g": 5, "carbs_g": 20, "fat_g": 3}]}`,
    }],
  })

  const r = JSON.parse(response.choices[0].message.content ?? '{}')
  const items: NutritionItem[] = (r.items || []).map((item: NutritionItem) => ({
    food_name: item.food_name || '',
    calories: Math.round(Number(item.calories) || 0),
    protein_g: Math.round((Number(item.protein_g) || 0) * 10) / 10,
    carbs_g: Math.round((Number(item.carbs_g) || 0) * 10) / 10,
    fat_g: Math.round((Number(item.fat_g) || 0) * 10) / 10,
  }))

  const total = items.reduce((acc, item) => ({
    calories: acc.calories + item.calories,
    protein_g: Math.round((acc.protein_g + item.protein_g) * 10) / 10,
    carbs_g: Math.round((acc.carbs_g + item.carbs_g) * 10) / 10,
    fat_g: Math.round((acc.fat_g + item.fat_g) * 10) / 10,
  }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 })

  return {
    food_name: items.length === 1 ? items[0].food_name : food_description,
    ...total,
    serving_description: items.length > 1 ? `${items.length} פריטים` : '',
    source: 'ai',
    items: items.length > 1 ? items : undefined,
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { food_description } = await request.json()
    if (!food_description?.trim()) {
      return Response.json({ error: 'No food description' }, { status: 400 })
    }

    const [parsed, aiResult] = await Promise.all([
      parseDescription(food_description),
      estimateWithAI(food_description),
    ])

    const offResult = await searchOpenFoodFacts(parsed.product, parsed.grams)
    const result = (offResult && offResult.calories > 0) ? offResult : aiResult

    return Response.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('estimate-calories error:', msg)
    return Response.json(
      { food_name: 'לא ידוע', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, serving_description: '', _debug_error: msg },
      { status: 200 }
    )
  }
}
