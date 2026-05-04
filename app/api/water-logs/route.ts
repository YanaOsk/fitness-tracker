import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { format } from 'date-fns'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const date = url.searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')

  const rows = await sql`
    SELECT * FROM water_logs
    WHERE user_id = ${session.user.id} AND date = ${date}
    ORDER BY logged_at
  `
  return Response.json(rows)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { amount_ml, date } = await request.json()
  const targetDate = date || format(new Date(), 'yyyy-MM-dd')

  const rows = await sql`
    INSERT INTO water_logs (user_id, amount_ml, date)
    VALUES (${session.user.id}, ${amount_ml}, ${targetDate})
    RETURNING *
  `
  return Response.json(rows[0])
}
