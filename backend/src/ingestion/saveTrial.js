import pool from '../config/db.js'

export async function saveTrial(trial) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // =========================================
    // 1. Insert main trial
    // =========================================

    const trialResult = await client.query(
      `
      INSERT INTO trials (
        nct_id,
        title,
        summary,
        phase,
        status,
        study_type,
        raw_json,
        updated_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())

      ON CONFLICT (nct_id)
      DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        phase = EXCLUDED.phase,
        status = EXCLUDED.status,
        study_type = EXCLUDED.study_type,
        raw_json = EXCLUDED.raw_json,
        updated_at = NOW()

      RETURNING id
      `,
      [
        trial.nctId,
        trial.title,
        trial.summary,
        trial.phase,
        trial.status,
        trial.studyType,
        JSON.stringify(trial.rawJson),
      ]
    );

    const trialId = trialResult.rows[0].id;

    // =========================================
    // 2. Conditions
    // =========================================

    await client.query(
      `DELETE FROM trial_conditions WHERE trial_id = $1`,
      [trialId]
    );

    for (const conditionName of trial.conditions || []) {

      // insert/get condition
      const conditionResult = await client.query(
        `
        INSERT INTO conditions(name)
        VALUES($1)

        ON CONFLICT(name)
        DO UPDATE SET name = EXCLUDED.name

        RETURNING id
        `,
        [conditionName]
      );

      const conditionId = conditionResult.rows[0].id;

      // create relationship
      await client.query(
        `
        INSERT INTO trial_conditions(
          trial_id,
          condition_id
        )
        VALUES($1,$2)

        ON CONFLICT DO NOTHING
        `,
        [trialId, conditionId]
      );
    }

    // =========================================
    // 3. Interventions
    // =========================================

    await client.query(
      `DELETE FROM trial_interventions WHERE trial_id = $1`,
      [trialId]
    );

    for (const intervention of trial.interventions || []) {

      const interventionResult = await client.query(
        `
        INSERT INTO interventions(
          name,
          intervention_type
        )
        VALUES($1,$2)

        ON CONFLICT(name, intervention_type)
        DO UPDATE SET name = EXCLUDED.name

        RETURNING id
        `,
        [
          intervention.name,
          intervention.type,
        ]
      );

      const interventionId =
        interventionResult.rows[0].id;

      await client.query(
        `
        INSERT INTO trial_interventions(
          trial_id,
          intervention_id
        )
        VALUES($1,$2)

        ON CONFLICT DO NOTHING
        `,
        [trialId, interventionId]
      );
    }

    // =========================================
    // 4. Eligibility
    // =========================================

    await client.query(
      `
      INSERT INTO eligibility(
        trial_id,
        criteria,
        gender,
        minimum_age,
        maximum_age
      )
      VALUES($1,$2,$3,$4,$5)

      ON CONFLICT(trial_id)
      DO UPDATE SET
        criteria = EXCLUDED.criteria,
        gender = EXCLUDED.gender,
        minimum_age = EXCLUDED.minimum_age,
        maximum_age = EXCLUDED.maximum_age
      `,
      [
        trialId,
        trial.eligibility?.criteria,
        trial.eligibility?.gender,
        trial.eligibility?.minimumAge,
        trial.eligibility?.maximumAge,
      ]
    );

    // =========================================
    // 5. Locations
    // =========================================

    await client.query(
      `DELETE FROM locations WHERE trial_id = $1`,
      [trialId]
    );

    for (const location of trial.locations || []) {

      await client.query(
        `
        INSERT INTO locations(
          trial_id,
          facility_name,
          city,
          country
        )
        VALUES($1,$2,$3,$4)
        `,
        [
          trialId,
          location.facility,
          location.city,
          location.country,
        ]
      );
    }

    await client.query("COMMIT");

    return trialId;

  } catch (err) {

    await client.query("ROLLBACK");

    console.error(err);

    throw err;

  } finally {

    client.release();
  }
}