import 'dotenv/config'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'
import pool from '../config/db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const backupPath = path.resolve(__dirname, '../../..', 'backup.sql')
const schemaPath = path.resolve(__dirname, '../sql/schema.sql')

const TABLES = [
  {
    name: 'conditions',
    columns: ['id', 'name'],
    batchSize: 5000,
  },
  {
    name: 'interventions',
    columns: ['id', 'name', 'intervention_type'],
    batchSize: 5000,
  },
  {
    name: 'trials',
    // sourceColumns = full column order in the backup COPY block
    // columns = subset we actually insert (raw_json excluded to stay under Neon 512 MB limit)
    sourceColumns: [
      'id',
      'nct_id',
      'title',
      'summary',
      'phase',
      'status',
      'study_type',
      'raw_json',      // present in backup but skipped in insert
      'created_at',
      'updated_at',
      'search_vector',
    ],
    columns: [
      'id',
      'nct_id',
      'title',
      'summary',
      'phase',
      'status',
      'study_type',
      'created_at',
      'updated_at',
      'search_vector',
    ],
    castColumns: {
      search_vector: 'tsvector',
    },
    batchSize: 500,
  },
  {
    name: 'eligibility',
    columns: ['id', 'trial_id', 'criteria', 'gender', 'minimum_age', 'maximum_age'],
    batchSize: 2000,
  },
  {
    name: 'locations',
    columns: ['id', 'trial_id', 'facility_name', 'city', 'country'],
    batchSize: 5000,
  },
  {
    name: 'trial_conditions',
    columns: ['trial_id', 'condition_id'],
    batchSize: 5000,
  },
  {
    name: 'trial_interventions',
    columns: ['trial_id', 'intervention_id'],
    batchSize: 5000,
  },
]

const SEQUENCES = [
  ['conditions_id_seq', 'conditions', 'id'],
  ['eligibility_id_seq', 'eligibility', 'id'],
  ['interventions_id_seq', 'interventions', 'id'],
  ['locations_id_seq', 'locations', 'id'],
  ['trials_id_seq', 'trials', 'id'],
]

function decodeCopyValue(value) {
  if (value === '\\N') return null

  let output = ''

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i]

    if (char !== '\\') {
      output += char
      continue
    }

    i += 1
    const escaped = value[i]

    switch (escaped) {
      case 'b':
        output += '\b'
        break
      case 'f':
        output += '\f'
        break
      case 'n':
        output += '\n'
        break
      case 'r':
        output += '\r'
        break
      case 't':
        output += '\t'
        break
      case 'v':
        output += '\v'
        break
      case '\\':
        output += '\\'
        break
      default:
        output += escaped ?? ''
        break
    }
  }

  return output
}

function parseCopyLine(line, expectedColumns) {
  const values = line.split('\t').map(decodeCopyValue)

  if (values.length !== expectedColumns) {
    throw new Error(`Expected ${expectedColumns} columns, got ${values.length}`)
  }

  return values
}

function buildInsertQuery(table, rowCount) {
  const { name: tableName, columns, castColumns = {} } = table
  const quotedColumns = columns.map((column) => `"${column}"`).join(', ')
  const values = []
  let parameterIndex = 1

  for (let row = 0; row < rowCount; row += 1) {
    const placeholders = columns.map((column) => {
      const placeholder = `$${parameterIndex++}`
      return castColumns[column] ? `${placeholder}::${castColumns[column]}` : placeholder
    })
    values.push(`(${placeholders.join(', ')})`)
  }

  return `INSERT INTO public.${tableName} (${quotedColumns}) VALUES ${values.join(', ')}`
}

async function insertBatch(client, table, batch) {
  if (!batch.length) return

  const query = buildInsertQuery(table, batch.length)
  const values = batch.flat()
  await client.query(query, values)
}

async function restoreTable(client, table) {
  const sourceColumns = table.sourceColumns ?? table.columns
  const copyHeader = `COPY public.${table.name} (`
  const input = fs.createReadStream(backupPath)
  const rl = readline.createInterface({ input, crlfDelay: Infinity })
  let inCopy = false
  let batch = []
  let restored = 0

  for await (const line of rl) {
    if (!inCopy) {
      inCopy = line.startsWith(copyHeader)
      continue
    }

    if (line === '\\.') {
      break
    }

    const sourceValues = parseCopyLine(line, sourceColumns.length)
    const values = table.sourceColumns
      ? table.columns.map((column) => sourceValues[sourceColumns.indexOf(column)])
      : sourceValues

    batch.push(values)

    if (batch.length >= table.batchSize) {
      await insertBatch(client, table, batch)
      restored += batch.length
      batch = []
      process.stdout.write(`\r${table.name}: ${restored.toLocaleString()} rows`)
    }
  }

  await insertBatch(client, table, batch)
  restored += batch.length
  process.stdout.write(`\r${table.name}: ${restored.toLocaleString()} rows\n`)

  if (!inCopy) {
    throw new Error(`Could not find COPY block for public.${table.name}`)
  }
}

async function resetSequences(client) {
  for (const [sequence, table, column] of SEQUENCES) {
    await client.query(
      `
      SELECT setval(
        $1::regclass,
        COALESCE((SELECT MAX(${column}) FROM public.${table}), 1),
        (SELECT COUNT(*) > 0 FROM public.${table})
      )
      `,
      [`public.${sequence}`]
    )
  }
}

async function prepareBulkLoad(client) {
  await client.query('DROP TRIGGER IF EXISTS trial_search_vector_trigger ON public.trials')
  await client.query('DROP INDEX IF EXISTS public.idx_trials_search_vector')
}

async function finishBulkLoad(client) {
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_trials_search_vector
    ON public.trials
    USING GIN(search_vector)
  `)

  await client.query(`
    DROP TRIGGER IF EXISTS trial_search_vector_trigger ON public.trials
  `)

  await client.query(`
    CREATE TRIGGER trial_search_vector_trigger
    BEFORE INSERT OR UPDATE
    ON public.trials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_trial_search_vector()
  `)
}

async function logCounts(client) {
  const counts = await Promise.all(
    TABLES.map(async ({ name }) => {
      const result = await client.query(`SELECT COUNT(*)::int AS count FROM public.${name}`)
      return `${name}=${result.rows[0].count.toLocaleString()}`
    })
  )

  console.log(`Counts: ${counts.join(', ')}`)
}

async function restoreBackup() {
  await fsPromises.access(backupPath)

  const schemaSql = await fsPromises.readFile(schemaPath, 'utf8')
  const client = await pool.connect()

  try {
    console.log('Ensuring schema exists...')
    await client.query(schemaSql)

    console.log('Preparing target tables for bulk load...')
    await prepareBulkLoad(client)

    console.log('Clearing target tables...')
    await client.query(`
      TRUNCATE TABLE
        public.trial_interventions,
        public.trial_conditions,
        public.locations,
        public.eligibility,
        public.interventions,
        public.conditions,
        public.trials
      RESTART IDENTITY CASCADE
    `)

    for (const table of TABLES) {
      await restoreTable(client, table)
    }

    console.log('Resetting sequences...')
    await resetSequences(client)

    console.log('Rebuilding search index and trigger...')
    await finishBulkLoad(client)

    console.log('Verifying row counts...')
    await logCounts(client)

    console.log('Backup restore completed.')
  } finally {
    client.release()
    await pool.end()
  }
}

restoreBackup().catch((error) => {
  console.error(`Backup restore failed: ${error.message}`)
  process.exitCode = 1
})
