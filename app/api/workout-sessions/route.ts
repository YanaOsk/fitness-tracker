import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { format } from 'date-fns'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const from = url.searchParams.get('from')

  if (from) {
    const rows = await sql`
      SELECT * FROM workout_sessions
      WHERE user_id = ${session.user.id} AND completed_at >= ${from}
      ORDER BY completed_at DESC
    `
    return Response.json(rows)
  }

  const today = format(new Date(), 'yyyy-MM-dd')
  const rows = await sql`
    SELECT * FROM workout_sessions
    WHERE user_id = ${session.user.id} AND completed_at >= ${today + 'T00:00:00'}
    ORDER BY completed_at DESC
  `
  return Response.json(rows)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { workout_type, workout_name, duration_minutes, intensity, notes } = await request.json()

  const rows = await sql`
    INSERT INTO workout_sessions (user_id, workout_type, workout_name, duration_minutes, intensity, notes)
    VALUES (${session.user.id}, ${workout_type}, ${workout_name}, ${duration_minutes ?? null}, ${intensity ?? null}, ${notes ?? null})
    RETURNING *
  `
  return Response.json(rows[0])
}
