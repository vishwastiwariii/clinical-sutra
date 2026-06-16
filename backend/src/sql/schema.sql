CREATE TABLE IF NOT EXISTS trials (
    id    SERIAL PRIMARY KEY, 
    nct_id VARCHAR(50) UNIQUE NOT NULL, 
    title   TEXT NOT NULL, 
    summary  TEXT, 
    phase    TEXT, 
    status   TEXT, 
    study_type VARCHAR(100),
    raw_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS conditions (
    id  SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS trial_conditions (
    trial_id INT REFERENCES trials(id) on DELETE CASCADE, 

    condition_id  INT REFERENCES  conditions(id) on DELETE CASCADE, 

    PRIMARY KEY (trial_id, condition_id)
);


CREATE TABLE IF NOT EXISTS interventions (
    id  SERIAL PRIMARY KEY, 
    
    name TEXT NOT NULL, 
    intervention_type  VARCHAR(100),

    UNIQUE(name, intervention_type)
);


CREATE TABLE IF NOT EXISTS trial_interventions (
    trial_id INT REFERENCES trials(id) on DELETE CASCADE, 

    intervention_id INT REFERENCES interventions(id) on DELETE CASCADE, 

    PRIMARY KEY (trial_id, intervention_id)
);


CREATE TABLE IF NOT EXISTS eligibility (
    id  SERIAL PRIMARY KEY,
    trial_id INT UNIQUE REFERENCES trials(id) on DELETE CASCADE, 
    criteria TEXT,
    gender TEXT, 
    minimum_age  VARCHAR(50),
    maximum_age VARCHAR(50)
);


CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY, 

    trial_id INT REFERENCES trials(id) on DELETE CASCADE, 

    facility_name TEXT, 

    city  VARCHAR(255), 

    country  VARCHAR(255)
);


CREATE INDEX IF NOT EXISTS idx_trials_nct_id

ON trials(nct_id);

CREATE INDEX IF NOT EXISTS idx_trials_phase

ON trials(phase);

CREATE INDEX IF NOT EXISTS idx_trials_status

ON trials(status);

CREATE INDEX IF NOT EXISTS idx_conditions_name

ON conditions(name);



ALTER TABLE trials
ADD COLUMN IF NOT EXISTS search_vector tsvector; 


UPDATE trials
SET search_vector =
    to_tsvector(
        'english',
        COALESCE(title, '') || ' ' ||
        COALESCE(summary, '')
    )
WHERE search_vector IS NULL;


CREATE INDEX IF NOT EXISTS idx_trials_search_vector
on trials
USING GIN(search_vector);


CREATE OR REPLACE FUNCTION update_trial_search_vector()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        to_tsvector(
            'english',
            COALESCE(NEW.title, '') || ' ' ||
            COALESCE(NEW.summary, '')
        );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



DROP TRIGGER IF EXISTS trial_search_vector_trigger ON trials;

CREATE TRIGGER trial_search_vector_trigger
BEFORE INSERT OR UPDATE
ON trials
FOR EACH ROW
EXECUTE FUNCTION update_trial_search_vector();
