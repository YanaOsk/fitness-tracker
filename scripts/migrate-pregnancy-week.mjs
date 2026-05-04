import { Client } from '@neondatabase/serverless'

const client = new Client(process.env.DATABASE_URL)
await client.connect()

const migrations = [
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pregnancy_week_updated_at DATE`,
  `UPDATE profiles SET pregnancy_week_updated_at = CURRENT_DATE WHERE is_pregnant = true AND pregnancy_week IS NOT NULL AND pregnancy_week_updated_at IS NULL`,
]

for (const sql of migrations) {
  try {
    await client.query(sql)
    console.log('✓', sql.slice(0, 80))
  } catch (err) {
    console.log('✗', err.message)
  }
}

await client.end()
console.log('✅ Done!')
