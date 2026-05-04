import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { food_description } = await request.json()
    if (!food_description?.trim()) {
      return Response.json({ error: 'No food description' }, { status: 400 })
    }

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `אתה מומחה תזונה ישראלי. נתח את הערך התזונתי של המזון/משקה הבא:

"${food_description}"

החזר JSON בדיוק בפורמט הזה (מספרים בלבד ללא יחידות):
{
  "food_name": "שם המזון בעברית",
  "calories": 0,
  "protein_g": 0,
  "carbs_g": 0,
  "fat_g": 0,
  "serving_description": "תיאור המנה בעברית (לדוגמה: 1 כוס / 200 גרם)"
}

אם הכמות לא צוינה, הנח מנה ישראלית סבירה.
החזר רק JSON תקין ללא טקסט נוסף.`,
        },
      ],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')
    const result = JSON.parse(jsonMatch[0])

    return Response.json({
      food_name: result.food_name || food_description,
      calories: Math.round(Number(result.calories) || 0),
      protein_g: Math.round((Number(result.protein_g) || 0) * 10) / 10,
      carbs_g: Math.round((Number(result.carbs_g) || 0) * 10) / 10,
      fat_g: Math.round((Number(result.fat_g) || 0) * 10) / 10,
      serving_description: result.serving_description || '',
    })
  } catch (err) {
    console.error('estimate-calories error:', err)
    return Response.json(
      { food_name: 'לא ידוע', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, serving_description: '' },
      { status: 200 }
    )
  }
}
