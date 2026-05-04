import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { sql } from './db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        await sql`
          INSERT INTO profiles (id, email, full_name, avatar_url)
          VALUES (${token.sub}, ${token.email}, ${user.name}, ${user.image})
          ON CONFLICT (id) DO UPDATE
            SET email = EXCLUDED.email,
                full_name = EXCLUDED.full_name,
                avatar_url = EXCLUDED.avatar_url
        `
        const rows = await sql`SELECT setup_complete FROM profiles WHERE id = ${token.sub}`
        token.setup_complete = rows[0]?.setup_complete ?? false
      }
      if (trigger === 'update' && session?.setup_complete !== undefined) {
        token.setup_complete = session.setup_complete
      }
      return token
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub!,
          setup_complete: (token.setup_complete as boolean) ?? false,
        },
      }
    },
  },
})
