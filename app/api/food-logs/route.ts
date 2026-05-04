import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { format } from 'date-fns'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const date = url.searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')

  const rows = await sql`
    SELECT * FROM food_logs
    WHERE user_id = ${session.user.id} AND date = ${date}
    ORDER BY logged_at
  `
  return Response.json(rows)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Support bulk insert (array) or single insert (object)
  if (Array.isArray(body)) {
    const today = format(new Date(), 'yyyy-MM-dd')
    const inserted = []
    for (const item of body) {
      const rows = await sql`
        INSERT INTO food_logs (user_id, meal_type, food_name, exchange_type, portions, calories, protein_g, carbs_g, fat_g, date)
        VALUES (
          ${session.user.id},
          ${item.meal_type ?? null},
          ${item.food_name},
          ${item.exchange_type ?? null},
          ${item.portions ?? 1},
          ${item.calories ?? null},
          ${item.protein_g ?? null},
          ${item.carbs_g ?? null},
          ${item.fat_g ?? null},
          ${item.date ?? today}
        )
        RETURNING *
      `
      inserted.push(rows[0])
    }
    return Response.json(inserted)
  }

  const { meal_type, food_name, exchange_type, portions, calories, protein_g, carbs_g, fat_g, date } = body
  const targetDate = date || format(new Date(), 'yyyy-MM-dd')

  const rows = await sql`
    INSERT INTO food_logs (user_id, meal_type, food_name, exchange_type, portions, calories, protein_g, carbs_g, fat_g, date)
    VALUES (
      ${session.user.id},
      ${meal_type ?? null},
      ${food_name},
      ${exchange_type ?? null},
      ${portions ?? 1},
      ${calories ?? null},
      ${protein_g ?? null},
      ${carbs_g ?? null},
      ${fat_g ?? null},
      ${targetDate}
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

  await sql`DELETE FROM food_logs WHERE id = ${id} AND user_id = ${session.user.id}`
  return Response.json({ ok: true })
}
