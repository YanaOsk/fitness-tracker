import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const date = url.searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')

  const { data } = await supabase
    .from('step_logs')
    .select('steps, date, source')
    .eq('user_id', user.id)
    .eq('date', date)
    .single()

  return Response.json(data ?? { steps: 0, date, source: 'manual' })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { steps, date } = await request.json()
  const targetDate = date || format(new Date(), 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('step_logs')
    .upsert(
      { user_id: user.id, steps: Math.max(0, parseInt(steps)), date: targetDate, source: 'manual' },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
