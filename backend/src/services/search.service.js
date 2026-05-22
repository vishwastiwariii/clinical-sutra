import pool from '../config/db.js'

export async function searchTrialService({
    query: q, 
    page, 
    limit, 
    status, 
    phase
}){
    const offset = (page - 1) * limit; 

    const values = []
    let paramCount = 1

    let whereClauses = []

    //search query 
    if(q){
        whereClauses.push(
            `(
            t.title ILIKE $${paramCount}
            OR c.name ILIKE $${paramCount}
            )`
        ); 

        values.push(`%${q}%`); 

        paramCount++
    }

    //phase filter

    if(phase){
        whereClauses.push(`(
            t.phase = $${paramCount}
            )`)

            values.push(phase);
            paramCount++
    }

    //status filter

    if(status){
        whereClauses.push(`
        (
            t.status = $${paramCount}
        )
        `)

        values.push(status);
        paramCount++
    }

    const whereSQL = whereClauses.length > 0 
             ? `WHERE ${whereClauses.join(" AND ")}`
             : "" ; 

    
    const searchQuery = `

    SELECT DISTINCT

      t.id,

      t.nct_id,

      t.title,

      t.phase,

      t.status,

      t.created_at

    FROM trials t

    LEFT JOIN trial_conditions tc

      ON t.id = tc.trial_id

    LEFT JOIN conditions c

      ON tc.condition_id = c.id

    ${whereSQL}

    ORDER BY t.created_at DESC

    LIMIT $${paramCount}

    OFFSET $${paramCount + 1}

  `;

  values.push(limit, offset);


  const countQuery = `

    SELECT COUNT(DISTINCT t.id) AS total

    FROM trials t

    LEFT JOIN trial_conditions tc

      ON t.id = tc.trial_id

    LEFT JOIN conditions c

      ON tc.condition_id = c.id

    ${whereSQL}

  `;

  const [results, countResult] = await Promise.all([

    pool.query(searchQuery, values),

    pool.query(

      countQuery,

      values.slice(0, values.length - 2)

    ),

  ]);

  const total = parseInt(

    countResult.rows[0].total

  );

  return {

    page,

    limit,

    total,

    totalPages: Math.ceil(total / limit),

    results: results.rows,

  };

}