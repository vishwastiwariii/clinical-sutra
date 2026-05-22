CREATE TABLE trials (
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


CREATE TABLE conditions (
    id  SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);


CREATE TABLE trial_conditions (
    trial_id INT REFERENCES trials(id) on DELETE CASCADE, 

    condition_id  INT REFERENCES  conditions(id) on DELETE CASCADE, 

    PRIMARY KEY (trial_id, condition_id)
);


CREATE TABLE interventions (
    id  SERIAL PRIMARY KEY, 
    
    name TEXT NOT NULL, 
    intervention_type  VARCHAR(100),

    UNIQUE(name, intervention_type)
);


CREATE TABLE trial_interventions (
    trial_id INT REFERENCES trials(id) on DELETE CASCADE, 

    intervention_id INT REFERENCES interventions(id) on DELETE CASCADE, 

    PRIMARY KEY (trial_id, intervention_id)
);


CREATE TABLE eligibility (
    id  SERIAL PRIMARY KEY,
    trial_id INT UNIQUE REFERENCES trials(id) on DELETE CASCADE, 
    criteria TEXT,
    gender TEXT, 
    minimum_age  VARCHAR(50),
    maximum_age VARCHAR(50)
);


CREATE TABLE locations (
    id SERIAL PRIMARY KEY, 

    trial_id INT REFERENCES trials(id) on DELETE CASCADE, 

    facility_name TEXT, 

    city  VARCHAR(255), 

    country  VARCHAR(255)
);


CREATE INDEX idx_trials_nct_id

ON trials(nct_id);

CREATE INDEX idx_trials_phase

ON trials(phase);

CREATE INDEX idx_trials_status

ON trials(status);

CREATE INDEX idx_conditions_name

ON conditions(name);