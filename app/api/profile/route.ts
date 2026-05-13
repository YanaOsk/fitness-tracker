import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { countMondaysBetween } from '@/lib/pregnancy-tips'

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await sql`SELECT * FROM profiles WHERE id = ${session.user.id}`
  const profile = rows[0] ?? null
  if (!profile) return Response.json(null)

  // Auto-advance pregnancy week every Monday
  if (profile.is_pregnant && profile.pregnancy_week && profile.pregnancy_week_updated_at) {
    const setAt = new Date(profile.pregnancy_week_updated_at)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weeksToAdd = countMondaysBetween(setAt, today)

    if (weeksToAdd > 0) {
      const newWeek = Math.min(42, (profile.pregnancy_week as number) + weeksToAdd)
      await sql`
        UPDATE profiles
        SET pregnancy_week = ${newWeek},
            pregnancy_week_updated_at = CURRENT_DATE,
            updated_at = NOW()
        WHERE id = ${session.user.id}
      `
      profile.pregnancy_week = newWeek
      profile.pregnancy_week_updated_at = today.toISOString().split('T')[0]
    }
  }

  // Days since last Monday = days into current pregnancy week
  if (profile.is_pregnant && profile.pregnancy_week) {
    const dayOfWeek = new Date().getDay() // 0=Sun,1=Mon,...,6=Sat
    profile.pregnancy_days_in_week = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  }

  return Response.json(profile)
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
      gender                        = COALESCE(${gender ?? null}, gender),
      birth_year                    = COALESCE(${birth_year ?? null}, birth_year),
      height_cm                     = COALESCE(${height_cm ?? null}, height_cm),
      weight_kg                     = COALESCE(${weight_kg ?? null}, weight_kg),
      target_weight_kg              = ${target_weight_kg ?? null},
      is_pregnant                   = COALESCE(${is_pregnant ?? null}, is_pregnant),
      pregnancy_week                = ${pregnancy_week ?? null},
      pregnancy_week_updated_at     = CASE
                                        WHEN ${pregnancy_week ?? null} IS NOT NULL THEN CURRENT_DATE
                                        ELSE pregnancy_week_updated_at
                                      END,
      has_gestational_diabetes      = COALESCE(${has_gestational_diabetes ?? null}, has_gestational_diabetes),
      goals                         = COALESCE(${goals ?? null}, goals),
      activity_level                = COALESCE(${activity_level ?? null}, activity_level),
      medical_notes                 = ${medical_notes ?? null},
      setup_complete                = COALESCE(${setup_complete ?? null}, setup_complete),
      updated_at                    = NOW()
    WHERE id = ${session.user.id}
  `

  const rows = await sql`SELECT * FROM profiles WHERE id = ${session.user.id}`
  return Response.json(rows[0])
}
