import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await sql`SELECT * FROM profiles WHERE id = ${session.user.id}`
  return Response.json(rows[0] ?? null)
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    gender, birth_year, height_cm, weight_kg, target_weight_kg,
    is_pregnant, pregnancy_week, has_gestational_diabetes,
    goals, activity_level, medical_notes, setup_complete,
  } = body

  await sql`
    UPDATE profiles SET
      gender                   = COALESCE(${gender ?? null}, gender),
      birth_year               = COALESCE(${birth_year ?? null}, birth_year),
      height_cm                = COALESCE(${height_cm ?? null}, height_cm),
      weight_kg                = COALESCE(${weight_kg ?? null}, weight_kg),
      target_weight_kg         = ${target_weight_kg ?? null},
      is_pregnant              = COALESCE(${is_pregnant ?? null}, is_pregnant),
      pregnancy_week           = ${pregnancy_week ?? null},
      has_gestational_diabetes = COALESCE(${has_gestational_diabetes ?? null}, has_gestational_diabetes),
      goals                    = COALESCE(${goals ?? null}, goals),
      activity_level           = COALESCE(${activity_level ?? null}, activity_level),
      medical_notes            = ${medical_notes ?? null},
      setup_complete           = COALESCE(${setup_complete ?? null}, setup_complete),
      updated_at               = NOW()
    WHERE id = ${session.user.id}
  `

  const rows = await sql`SELECT * FROM profiles WHERE id = ${session.user.id}`
  return Response.json(rows[0])
}
