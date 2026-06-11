import crypto from "node:crypto"
import { pathToFileURL } from "node:url"
import pool from "../config/db.js"
import qdrantClient from "../config/qdrant.js"
import createEmbeddings from "../services/embeddings.service.js"
import {
  buildTrialSearchDocument,
  buildTrialMetadata,
  generateTrialEmbedding,
  TRIAL_EMBEDDING_FLOW,
} from "../services/trialEmbedding.service.js"

export const QDRANT_TRIAL_COLLECTION = "clinical_trials"
export const QDRANT_VECTOR_SIZE = 1536
const POSTGRES_BATCH_SIZE = 100

export async function ensureTrialCollection(client = qdrantClient) {
  const exists = await client.collectionExists(QDRANT_TRIAL_COLLECTION)

  if (exists?.exists) {
    return {
      collection: QDRANT_TRIAL_COLLECTION,
      created: false,
    }
  }

  await client.createCollection(QDRANT_TRIAL_COLLECTION, {
    vectors: {
      size: QDRANT_VECTOR_SIZE,
      distance: "Cosine",
    },
    on_disk_payload: true,
  })

  return {
    collection: QDRANT_TRIAL_COLLECTION,
    created: true,
  }
}

export function createTrialPointId(trial) {
  const sourceId = trial.nctId ?? trial.nct_id ?? trial.id ?? trial.trialId

  if (!sourceId) {
    throw new Error("Trial is missing a stable id")
  }

  const hex = crypto.createHash("sha1").update(String(sourceId)).digest("hex").slice(0, 32)

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `5${hex.slice(13, 16)}`,
    `${((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16)}${hex.slice(18, 20)}`,
    hex.slice(20, 32),
  ].join("-")
}

export function buildTrialPoint({ trial, searchDocument, embedding }) {
  if (!Array.isArray(embedding) || embedding.length !== QDRANT_VECTOR_SIZE) {
    throw new Error(`Expected ${QDRANT_VECTOR_SIZE} embedding dimensions`)
  }

  return {
    id: createTrialPointId(trial),
    vector: embedding,
    payload: {
      ...buildTrialMetadata(trial),
      searchDocument,
      flow: TRIAL_EMBEDDING_FLOW,
    },
  }
}

export async function storeTrialPoints(points, client = qdrantClient) {
  if (!points.length) {
    return {
      status: "skipped",
      stored: 0,
    }
  }

  const result = await client.upsert(QDRANT_TRIAL_COLLECTION, {
    wait: true,
    points,
  })

  return {
    ...result,
    stored: points.length,
  }
}

export async function findExistingPointIds(pointIds, client = qdrantClient) {
  if (!pointIds.length) {
    return new Set()
  }

  const records = await client.retrieve(QDRANT_TRIAL_COLLECTION, {
    ids: pointIds,
    with_payload: false,
    with_vector: false,
  })

  return new Set(records.map((record) => String(record.id)))
}

export async function storeTrialEmbeddingBatch(batch, {
  client = qdrantClient,
  ensureCollection = true,
  skipExisting = true,
} = {}) {
  if (ensureCollection) {
    await ensureTrialCollection(client)
  }

  const points = batch.map((item) => buildTrialPoint(item))
  const existingPointIds = skipExisting
    ? await findExistingPointIds(points.map((point) => point.id), client)
    : new Set()
  const newPoints = points.filter((point) => !existingPointIds.has(String(point.id)))
  const result = await storeTrialPoints(newPoints, client)

  return {
    ...result,
    points,
    skipped: points.length - newPoints.length,
  }
}

export async function storeTrialEmbedding(trial, {
  client = qdrantClient,
  embedder,
} = {}) {
  const embeddingPayload = await generateTrialEmbedding(trial, embedder)
  const collectionInfo = await ensureTrialCollection(client)
  const point = buildTrialPoint({
    trial,
    searchDocument: embeddingPayload.searchDocument,
    embedding: embeddingPayload.embedding,
  })
  const result = await storeTrialPoints([point], client)

  return {
    ...embeddingPayload,
    ...result,
    collection: collectionInfo.collection,
    collectionCreated: collectionInfo.created,
    point,
  }
}

function extractEmbeddings(response) {
  return response?.data?.map((item) => item.embedding) ?? []
}

async function generateEmbeddingsForDocuments(searchDocuments) {
  const response = await createEmbeddings(searchDocuments)
  const embeddings = extractEmbeddings(response)

  if (embeddings.length !== searchDocuments.length) {
    throw new Error(`Expected ${searchDocuments.length} embeddings, received ${embeddings.length}`)
  }

  embeddings.forEach((embedding, index) => {
    if (embedding.length !== QDRANT_VECTOR_SIZE) {
      throw new Error(
        `Document ${index + 1}: expected ${QDRANT_VECTOR_SIZE} embedding dimensions, received ${embedding.length}`,
      )
    }
  })

  return embeddings
}

export async function countPostgresTrials(db = pool) {
  const result = await db.query("SELECT COUNT(*)::int AS total FROM trials")

  return result.rows[0]?.total ?? 0
}

export async function fetchPostgresTrialBatch({
  cursor = 0,
  limit = POSTGRES_BATCH_SIZE,
  db = pool,
} = {}) {
  const result = await db.query(
    `
    SELECT
      t.id,
      t.nct_id AS "nctId",
      t.title,
      t.summary,
      t.phase,
      t.status,
      t.study_type AS "studyType",
      COALESCE(
        array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL),
        '{}'
      ) AS conditions,
      COALESCE(
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'name', i.name,
            'type', i.intervention_type
          )
        ) FILTER (WHERE i.name IS NOT NULL),
        '[]'
      ) AS interventions
    FROM trials t
    LEFT JOIN trial_conditions tc
      ON t.id = tc.trial_id
    LEFT JOIN conditions c
      ON tc.condition_id = c.id
    LEFT JOIN trial_interventions ti
      ON t.id = ti.trial_id
    LEFT JOIN interventions i
      ON ti.intervention_id = i.id
    WHERE t.id > $1
    GROUP BY t.id
    ORDER BY t.id
    LIMIT $2
    `,
    [cursor, limit],
  )

  return result.rows
}

export async function storePostgresTrialsInQdrant({
  batchSize = POSTGRES_BATCH_SIZE,
  db = pool,
  client = qdrantClient,
} = {}) {
  let cursor = 0
  let processed = 0
  let stored = 0
  let skipped = 0
  let batchNumber = 1

  console.log("Starting Postgres to Qdrant indexing")
  console.log(`Batch size: ${batchSize}`)
  console.log("Flow: Fetch Postgres trials -> Build search documents -> Generate embeddings -> Store in Qdrant")

  const total = await countPostgresTrials(db)
  console.log(`Total trials available in Postgres: ${total}`)

  const collectionInfo = await ensureTrialCollection(client)
  console.log(
    `Qdrant collection ready: ${collectionInfo.collection} (${collectionInfo.created ? "created" : "existing"})`,
  )

  while (processed < total) {
    console.log(`\nBatch ${batchNumber}: fetching up to ${batchSize} trials from Postgres...`)

    const trials = await fetchPostgresTrialBatch({
      cursor,
      limit: batchSize,
      db,
    })

    if (!trials.length) {
      console.log(`No trials returned for batch ${batchNumber}. Stopping.`)
      break
    }

    console.log(`Batch ${batchNumber}: fetched ${trials.length} trials`)

    const searchDocuments = trials.map((trial) => buildTrialSearchDocument(trial))

    console.log(`Batch ${batchNumber}: built ${searchDocuments.length} search documents`)
    console.log(`Batch ${batchNumber}: generating embeddings...`)

    const embeddings = await generateEmbeddingsForDocuments(searchDocuments)

    console.log(`Batch ${batchNumber}: storing ${embeddings.length} embeddings in Qdrant...`)

    const storeResult = await storeTrialEmbeddingBatch(
      trials.map((trial, index) => ({
        trial,
        searchDocument: searchDocuments[index],
        embedding: embeddings[index],
      })),
      {
        client,
        ensureCollection: false,
      },
    )

    processed += trials.length
    stored += storeResult.stored
    skipped += storeResult.skipped
    cursor = trials[trials.length - 1].id

    console.log(`Batch ${batchNumber}: stored ${storeResult.stored} embeddings in Qdrant`)
    console.log(`Batch ${batchNumber}: skipped ${storeResult.skipped} existing trials`)
    console.log(`Batch ${batchNumber}: ${processed} processed out of ${total} trials available`)

    batchNumber += 1
  }

  console.log(`\nQdrant indexing complete: ${processed} processed out of ${total} trials available`)
  console.log(`Stored: ${stored}`)
  console.log(`Skipped existing: ${skipped}`)

  return {
    completed: processed,
    processed,
    stored,
    skipped,
    total,
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  storePostgresTrialsInQdrant()
    .then(async () => {
      await pool.end()
      process.exit(0)
    })
    .catch((error) => {
      console.error(`Qdrant trial store failed: ${error.message}`)
      pool.end()
        .finally(() => process.exit(1))
    })
}
