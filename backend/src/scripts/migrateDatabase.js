import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pool from '../config/db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const schemaPath = path.resolve(__dirname, '../sql/schema.sql')

async function migrateDatabase() {
  const schemaSql = await fs.readFile(schemaPath, 'utf8')
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await client.query(schemaSql)
    await client.query('COMMIT')
    console.log('Database schema migration completed.')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Database schema migration failed:', error.message)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

migrateDatabase()
