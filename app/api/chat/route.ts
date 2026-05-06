import OpenAI from 'openai'
import { auth } from '@/lib/auth'
import { Profile } from '@/lib/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function buildSystemPrompt(profile: Profile | null): string {
  let prompt =
    'אתה FitLife AI, מאמן כושר ותזונה מקצועי ואמפתי. תמיד ענה בעברית בצורה ידידותית, ברורה ומקצועית.\n\n'

  if (!profile) return prompt + 'עזור למשתמש עם שאלות כושר ותזונה כלליות.'

  prompt += 'פרופיל המשתמש:\n'
  prompt += `- מגדר: ${profile.gender === 'female' ? 'נקבה' : 'זכר'}\n`

  if (profile.is_pregnant) {
    prompt += `- בהריון: כן, שבוע ${profile.pregnancy_week ?? 'לא ידוע'}\n`
    if (profile.has_gestational_diabetes) prompt += '- סוכרת הריון: כן\n'
  }

  if (profile.goals?.length) {
    const goalMap: Record<string, string> = {
      weight_loss: 'ירידה במשקל', muscle_gain: 'בניית שריר',
      healthy_pregnancy: 'הריון בריא', general_health: 'בריאות כללית', endurance: 'סיבולת',
    }
    prompt += `- יעדים: ${profile.goals.map((g) => goalMap[g] ?? g).join(', ')}\n`
  }

  if (profile.activity_level) {
    const levelMap: Record<string, string> = {
      sedentary: 'יושבני', light: 'קל', moderate: 'בינוני', active: 'פעיל', very_active: 'פעיל מאוד',
    }
    prompt += `- רמת פעילות: ${levelMap[profile.activity_level] ?? profile.activity_level}\n`
  }

  prompt += '\nהנחיות חשובות:\n'
  prompt += '- עבור נשים בהריון: הדגש תמיד בטיחות והמלץ להתייעץ עם רופא\n'
  prompt += '- עבור סוכרת הריון: תמיד הזכר שפחמימות חייבות להיאכל עם חלבון או שומן\n'
  prompt += '- היה תמציתי ומעשי – תן עצות ישימות\n'
  prompt += '- אל תתן עצות רפואיות ספציפיות – הפנה לרופא לגבי מצבים רפואיים'

  return prompt
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { messages, profile } = await request.json()

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: 'system', content: buildSystemPrompt(profile) },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? ''
          if (text) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            )
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
