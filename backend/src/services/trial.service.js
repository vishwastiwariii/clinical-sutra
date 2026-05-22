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
        'SELECT * FROM trials WHERE nct_id = $1',
        [nct_id]
    )

    return result.rows[0] || null
}