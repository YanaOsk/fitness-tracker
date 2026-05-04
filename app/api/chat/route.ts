import Anthropic from '@anthropic-ai/sdk'
import { auth } from '@/lib/auth'
import { Profile } from '@/lib/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

    const stream = await anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: buildSystemPrompt(profile),
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
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
