import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let rows = await sql`SELECT sync_token FROM profiles WHERE id = ${session.user.id} LIMIT 1`
  if (!rows[0]?.sync_token) {
    rows = await sql`UPDATE profiles SET sync_token = gen_random_uuid() WHERE id = ${session.user.id} RETURNING sync_token`
  }
  return Response.json({ token: rows[0]?.sync_token ?? null })
}

// Regenerate token
export async function POST() {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await sql`
    UPDATE profiles SET sync_token = gen_random_uuid()
    WHERE id = ${session.user.id}
    RETURNING sync_token
  `
  return Response.json({ token: rows[0]?.sync_token ?? null })
}
