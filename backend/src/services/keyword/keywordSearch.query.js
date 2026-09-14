export function buildKeywordSearchQuery({
    query,
    phase,
    status,
    limit,
    offset
}) {

    const values = [];
    const whereClauses = [];

    let paramIndex = 1;

    // Full Text Search
    if (query) {
        whereClauses.push(`
            t.search_vector @@ plainto_tsquery(
                'english',
                $${paramIndex}
            )
        `);

        values.push(query);
        paramIndex++;
    }

    // Phase Filter
    if (phase) {
        whereClauses.push(`
            t.phase = $${paramIndex}
        `);

        values.push(phase);
        paramIndex++;
    }

    // Status Filter
    if (status) {
        whereClauses.push(`
            t.status = $${paramIndex}
        `);

        values.push(status);
        paramIndex++;
    }

    const whereSQL =
        whereClauses.length > 0
            ? `WHERE ${whereClauses.join(" AND ")}`
            : "";

    const rankSQL = query
        ? `
            ts_rank(
                t.search_vector,
                plainto_tsquery(
                    'english',
                    $1
                )
            )
        `
        : "0";

    const orderSQL = query
        ? "ORDER BY rank DESC, created_at DESC"
        : "ORDER BY created_at DESC";

    // Paginate trials first, then attach conditions to just that page —
    // grouping the full join would aggregate every matching trial per request.
    const searchQuery = `
        WITH page AS (

            SELECT

                t.id,

                t.nct_id,

                t.title,

                t.phase,

                t.status,

                t.summary,

                t.created_at,

                ${rankSQL} AS rank

            FROM trials t

            ${whereSQL}

            ${orderSQL}

            LIMIT $${paramIndex}

            OFFSET $${paramIndex + 1}

        )

        SELECT

            p.id,

            p.nct_id,

            p.title,

            p.phase,

            p.status,

            p.summary AS "shortSummary",

            array_remove(
                array_agg(DISTINCT c.name),
                NULL
            ) AS conditions,

            p.created_at,

            p.rank

        FROM page p

        LEFT JOIN trial_conditions tc
            ON tc.trial_id = p.id

        LEFT JOIN conditions c
            ON c.id = tc.condition_id

        GROUP BY
            p.id,
            p.nct_id,
            p.title,
            p.phase,
            p.status,
            p.summary,
            p.created_at,
            p.rank

        ORDER BY
            p.rank DESC,
            p.created_at DESC
    `;

    values.push(limit);
    values.push(offset);

    // The where clauses only touch trials columns, so the count
    // needs no joins.
    const countQuery = `
        SELECT COUNT(*) AS total

        FROM trials t

        ${whereSQL}
    `;

    const countValues = values.slice(0, values.length - 2);

    return {
        searchQuery,
        countQuery,
        searchValues: values,
        countValues
    };
}
