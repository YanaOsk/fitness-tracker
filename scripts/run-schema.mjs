import { Client } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const schema = readFileSync(join(__dirname, '../db/schema.sql'), 'utf-8')

const client = new Client(process.env.DATABASE_URL)
await client.connect()

const cleaned = schema
  .split('\n')
  .filter(line => !line.trim().startsWith('--'))
  .join('\n')

const statements = cleaned
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 5)

console.log(`Running ${statements.length} SQL statements...\n`)

for (const stmt of statements) {
  const preview = stmt.replace(/\s+/g, ' ').slice(0, 70)
  try {
    await client.query(stmt)
    console.log('✓', preview)
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('⚠ already exists:', preview)
    } else {
      console.log('✗ ERROR:', err.message.slice(0, 80))
      console.log('  SQL:', preview)
    }
  }
}

await client.end()
console.log('\n✅ Done!')
