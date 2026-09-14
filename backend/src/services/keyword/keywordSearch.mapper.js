export function mapKeyWordSearchResults(rows) {
    return rows.map(mapKeyWordSearchRow)
}

function mapKeyWordSearchRow(row) {
    return {
        trialId: row.id,
        nctId: row.nct_id,
        title: row.title,
        shortSummary: row.shortSummary,
        phase: row.phase,
        status: row.status,
        conditions: row.conditions ?? [],
        keywordScore: Number(row.rank),
        semanticScore: null,
        normalizedKeywordScore: null,  // Filled during hybrid ranking
        normalizedSemanticScore: null,
        source: "keyword"
    }
}