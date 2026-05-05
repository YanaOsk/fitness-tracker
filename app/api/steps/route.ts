import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { format } from 'date-fns'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const date = url.searchParams.get('date')
  const from = url.searchParams.get('from')

  const debug = url.searchParams.get('debug')
  if (debug) {
    const all = await sql`SELECT user_id, steps, date, source FROM step_logs ORDER BY date DESC LIMIT 20`
    return Response.json({ session_user_id: session.user.id, rows: all })
  }

  if (from) {
    const rows = await sql`
      SELECT steps, date, source FROM step_logs
      WHERE user_id = ${session.user.id} AND date >= ${from}
      ORDER BY date
    `
    return Response.json(rows)
  }

  const targetDate = date || format(new Date(), 'yyyy-MM-dd')
  const rows = await sql`
    SELECT steps, date, source FROM step_logs
    WHERE user_id = ${session.user.id} AND date = ${targetDate}
  `
  return Response.json(rows[0] ?? { steps: 0, date: targetDate, source: 'manual' })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { steps, date } = await request.json()
  const targetDate = date || format(new Date(), 'yyyy-MM-dd')
  const stepCount = Math.max(0, parseInt(steps))

  const rows = await sql`
    INSERT INTO step_logs (user_id, steps, date, source)
    VALUES (${session.user.id}, ${stepCount}, ${targetDate}, 'manual')
    ON CONFLICT (user_id, date)
    DO UPDATE SET steps = ${stepCount}, logged_at = NOW()
    RETURNING *
  `
  return Response.json(rows[0])
}
