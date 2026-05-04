import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { YANA_ID, DVIR_ID } from '@/lib/auth'

const USERS: Record<string, { id: string; name: string }> = {
  yana: { id: YANA_ID, name: 'יאנה' },
  dvir: { id: DVIR_ID, name: 'דביר' },
}

export async function POST(req: NextRequest) {
  const { user } = await req.json()
  const profile = USERS[user]
  if (!profile) return NextResponse.json({ error: 'Invalid user' }, { status: 400 })

  await sql`
    INSERT INTO profiles (id, full_name)
    VALUES (${profile.id}, ${profile.name})
    ON CONFLICT (id) DO NOTHING
  `

  const rows = await sql`SELECT setup_complete, height_cm, weight_kg FROM profiles WHERE id = ${profile.id} LIMIT 1`
  const p = rows[0]
  const setupComplete = p?.setup_complete === true || (p?.height_cm != null && p?.weight_kg != null)

  if (setupComplete && !p?.setup_complete) {
    await sql`UPDATE profiles SET setup_complete = true WHERE id = ${profile.id}`
  }

  const res = NextResponse.json({ ok: true, redirect: setupComplete ? '/dashboard' : '/setup' })
  res.cookies.set('fit_user', profile.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })
  return res
}
