import pool from '../../config/db.js'
import { mapKeyWordSearchResults } from './keywordSearch.mapper.js'
import { buildKeywordSearchQuery } from './keywordSearch.query.js'

export async function keywordSearch({
    q, 
    page, 
    limit, 
    status, 
    phase
}){

  const offset = (page - 1) * limit

  const {
    searchQuery,
    searchValues,
    countQuery,
    countValues
  } = buildKeywordSearchQuery({
    query: q,
    phase,
    status,
    limit,
    offset
  })


  const [searchResult, countResult] = await Promise.all([
    pool.query(searchQuery, searchValues),
    pool.query(countQuery, countValues)
  ])

  const results = mapKeyWordSearchResults(
    searchResult.rows
  )

  const total = Number(
    countResult.rows[0].total
  );

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(
      total / limit
    ),
    results
  }
}

