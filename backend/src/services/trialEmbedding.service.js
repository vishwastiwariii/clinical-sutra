import createEmbeddings from "./embeddings.service.js"

export const TRIAL_EMBEDDING_FLOW = [
  "Clinical Trial",
  "Search Document",
  "OpenAI Embedding",
  "Metadata",
]

function compactText(value) {
  return String(value).replace(/\s+/g, " ").trim()
}

function toArray(value) {
  if (Array.isArray(value)) return value
  if (value === null || value === undefined || value === "") return []
  return [value]
}

function normalizeConditions(trial) {
  return toArray(trial.conditions ?? trial.condition)
    .map((condition) => compactText(condition))
    .filter(Boolean)
}

function normalizeInterventions(trial) {
  return toArray(trial.interventions)
    .map((intervention) => {
      if (typeof intervention === "string") {
        return compactText(intervention)
      }

      const name = compactText(intervention?.name || "")
      const type = compactText(intervention?.type || intervention?.interventionType || "")

      if (name && type) {
        return `${name} (${type})`
      }

      return name || type
    })
    .filter(Boolean)
}

export function buildTrialSearchDocument(trial) {
  const sections = []
  const title = compactText(trial.title || trial.briefTitle || "")
  const conditions = normalizeConditions(trial)
  const phase = compactText(trial.phase || "")
  const status = compactText(trial.status || "")
  const studyType = compactText(trial.studyType || trial.study_type || "")
  const summary = compactText(trial.summary || trial.briefSummary || "")
  const interventions = normalizeInterventions(trial)

  if (title) sections.push(`Title: ${title}`)
  if (conditions.length) sections.push(`Conditions: ${conditions.join(", ")}`)
  if (phase) sections.push(`Phase: ${phase}`)
  if (status) sections.push(`Status: ${status}`)
  if (studyType) sections.push(`Study Type: ${studyType}`)
  if (interventions.length) sections.push(`Interventions: ${interventions.join(", ")}`)
  if (summary) sections.push(`Summary: ${summary}`)

  return ["Clinical Trial", ...sections].join("\n")
}

function unwrapEmbedding(embeddingResponse) {
  return embeddingResponse?.data?.[0]?.embedding ?? []
}

export async function generateTrialEmbedding(trial, embedder = createEmbeddings) {
  const searchDocument = buildTrialSearchDocument(trial)
  const embeddingResponse = await embedder(searchDocument)
  const embedding = unwrapEmbedding(embeddingResponse)
  const metadata = buildTrialMetadata(trial)

  return {
    flow: TRIAL_EMBEDDING_FLOW,
    searchDocument,
    embedding,
    metadata,
  }
}

export function buildTrialMetadata(trial) {
  return {
    trialId: trial.id ?? trial.trialId ?? null,
    nctId: trial.nctId ?? trial.nct_id ?? null,
    title: trial.title ?? null,
    conditions: normalizeConditions(trial),
    phase: trial.phase ?? null,
    status: trial.status ?? null,
    studyType: trial.studyType ?? trial.study_type ?? null,
  }
}
