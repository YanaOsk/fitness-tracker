import { cookies } from 'next/headers'
import { sql } from './db'

export const YANA_ID = '00000000-0000-0000-0000-000000000001'
export const DVIR_ID = '00000000-0000-0000-0000-000000000002'

export async function auth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('fit_user')?.value
  if (userId !== YANA_ID && userId !== DVIR_ID) return null

  const rows = await sql`SELECT setup_complete FROM profiles WHERE id = ${userId} LIMIT 1`
  if (!rows[0]) return null

  return {
    user: {
      id: userId,
      setup_complete: (rows[0].setup_complete as boolean) ?? false,
    },
  }
}

export const handlers = {
  GET: async () => new Response(null, { status: 404 }),
  POST: async () => new Response(null, { status: 404 }),
}
export const signIn = async () => {}
export const signOut = async () => {}
