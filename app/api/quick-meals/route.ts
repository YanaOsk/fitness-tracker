import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await sql`
    SELECT * FROM quick_meals
    WHERE user_id = ${session.user.id}
    ORDER BY created_at DESC
  `
  return Response.json(rows)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, meal_type, total_calories, description, items } = await request.json()

  const rows = await sql`
    INSERT INTO quick_meals (user_id, name, meal_type, total_calories, description, items)
    VALUES (
      ${session.user.id},
      ${name},
      ${meal_type ?? null},
      ${total_calories ?? 0},
      ${description ?? null},
      ${JSON.stringify(items ?? [])}
    )
    RETURNING *
  `
  return Response.json(rows[0])
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

  await sql`DELETE FROM quick_meals WHERE id = ${id} AND user_id = ${session.user.id}`
  return Response.json({ ok: true })
}
