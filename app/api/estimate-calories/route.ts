import Anthropic from '@anthropic-ai/sdk'
import { auth } from '@/lib/auth'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface NutritionResult {
  food_name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  serving_description: string
  source?: 'openfoodfacts' | 'ai'
}

// Extract a searchable product name + quantity from Hebrew/mixed text
async function parseDescription(text: string): Promise<{ product: string; grams: number | null }> {
  const res = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 128,
    messages: [{
      role: 'user',
      content: `Extract from this food description:
"${text}"

Return JSON only:
{"product": "english product name or transliteration (e.g. nutella, coca cola, bamba, bisli)", "grams": 30}

- product: the main food/product name in English for database search
- grams: estimated grams consumed (null if only a generic food like "salad")
Return only JSON, no text.`,
    }],
  })
  try {
    const raw = res.content[0].type === 'text' ? res.content[0].text : '{}'
    const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? '{}')
    return { product: parsed.product || text, grams: parsed.grams || null }
  } catch {
    return { product: text, grams: null }
  }
}

// Search OpenFoodFacts for a product
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
    if (!cal100 || cal100 > 900) return null // sanity check

    const servingG = grams ?? Number(product.serving_quantity) || 100
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

// Fallback: Claude estimates from training knowledge
async function estimateWithClaude(food_description: string): Promise<NutritionResult> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `אתה מומחה תזונה ישראלי. נתח את הערך התזונתי של המזון/משקה הבא:

"${food_description}"

עבור מוצרים מותגים ידועים (נוטלה, ביסלי, במבה, קוקה קולה, דנונה וכו') — השתמש בערכים המדויקים שידועים לך.
עבור שאר המזונות — הנח מנה ישראלית סבירה.

החזר JSON בלבד:
{
  "food_name": "שם המזון בעברית",
  "calories": 0,
  "protein_g": 0,
  "carbs_g": 0,
  "fat_g": 0,
  "serving_description": "תיאור המנה בעברית"
}`,
    }],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON')
  const r = JSON.parse(jsonMatch[0])

  return {
    food_name: r.food_name || food_description,
    calories: Math.round(Number(r.calories) || 0),
    protein_g: Math.round((Number(r.protein_g) || 0) * 10) / 10,
    carbs_g: Math.round((Number(r.carbs_g) || 0) * 10) / 10,
    fat_g: Math.round((Number(r.fat_g) || 0) * 10) / 10,
    serving_description: r.serving_description || '',
    source: 'ai',
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

    // Step 1: parse product name + quantity in parallel with Claude fallback
    const [parsed, claudeResult] = await Promise.all([
      parseDescription(food_description),
      estimateWithClaude(food_description),
    ])

    // Step 2: try OpenFoodFacts with the extracted product name
    const offResult = await searchOpenFoodFacts(parsed.product, parsed.grams)

    // Step 3: prefer OpenFoodFacts if it found something with valid calories
    const result = (offResult && offResult.calories > 0) ? offResult : claudeResult

    return Response.json(result)
  } catch (err) {
    console.error('estimate-calories error:', err)
    return Response.json(
      { food_name: 'לא ידוע', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, serving_description: '' },
      { status: 200 }
    )
  }
}
