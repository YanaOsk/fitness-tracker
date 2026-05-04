import { Client } from '@neondatabase/serverless'

const client = new Client(process.env.DATABASE_URL)
await client.connect()

const migrations = [
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sync_token UUID DEFAULT gen_random_uuid()`,
  `UPDATE profiles SET sync_token = gen_random_uuid() WHERE sync_token IS NULL`,
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
