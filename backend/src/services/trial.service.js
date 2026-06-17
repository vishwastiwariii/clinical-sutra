import pool from "../config/db.js";


export async function getAllTrial(limit, cursor) {
    const result = await pool.query(
        `SELECT * FROM trials 
        WHERE id > $1 
        ORDER BY id 
        LIMIT $2`, 
        [cursor, limit]
    )

    return result.rows
}


export async function getTrialById({nct_id}) {
    const result = await pool.query(
        `SELECT t.id, t.nct_id, t.title, t.phase, t.status, t.summary AS "shortSummary",
                string_agg(DISTINCT c.name, ', ') AS condition,
                t.created_at
         FROM trials t
         LEFT JOIN trial_conditions tc ON t.id = tc.trial_id
         LEFT JOIN conditions c ON tc.condition_id = c.id
         WHERE t.nct_id = $1
         GROUP BY t.id, t.nct_id, t.title, t.phase, t.status, t.summary, t.created_at`,
        [nct_id]
    )

    return result.rows[0] || null
}