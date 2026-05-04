import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'

// Called by iOS Shortcuts — no session cookie, auth via sync_token
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const stepsParam = req.nextUrl.searchParams.get('steps')
  const date = req.nextUrl.searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  if (!token || !stepsParam) {
    return Response.json({ error: 'token and steps are required' }, { status: 400 })
  }

  const steps = parseInt(stepsParam)
  if (isNaN(steps) || steps < 0 || steps > 200000) {
    return Response.json({ error: 'invalid steps value' }, { status: 400 })
  }

  const rows = await sql`SELECT id FROM profiles WHERE sync_token = ${token}::uuid LIMIT 1`
  if (!rows[0]) {
    return Response.json({ error: 'invalid token' }, { status: 401 })
  }

  await sql`
    INSERT INTO step_logs (user_id, steps, date, source)
    VALUES (${rows[0].id}, ${steps}, ${date}, 'apple_health')
    ON CONFLICT (user_id, date)
    DO UPDATE SET steps = ${steps}, source = 'apple_health', logged_at = NOW()
  `

  return Response.json({ ok: true, steps, date })
}
