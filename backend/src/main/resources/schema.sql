-- ============================================================
--  TESTBANK DATABASE SCHEMA
-- ============================================================


-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ROLES
CREATE TABLE IF NOT EXISTS role (
    role_id   SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO role(role_name) VALUES ('ADMIN'), ('FACULTY'), ('STUDENT') ON CONFLICT (role_name) DO NOTHING;

-- USERS
CREATE TABLE IF NOT EXISTS users (
    user_id       SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT NOW(),
    role_id       INT NOT NULL REFERENCES role(role_id)
);

-- CATEGORY
CREATE TABLE IF NOT EXISTS category (
    category_id   SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);

-- QUESTION
CREATE TABLE IF NOT EXISTS question (
    question_id    SERIAL PRIMARY KEY,
    question_text  TEXT NOT NULL,
    option_a       VARCHAR(500) NOT NULL,
    option_b       VARCHAR(500) NOT NULL,
    option_c       VARCHAR(500) NOT NULL,
    option_d       VARCHAR(500) NOT NULL,
    correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A','B','C','D')),
    difficulty     VARCHAR(10) NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
    default_marks  NUMERIC(5,2) NOT NULL DEFAULT 1.0,
    category_id    INT REFERENCES category(category_id) ON DELETE SET NULL,
    created_by     INT NOT NULL REFERENCES users(user_id)
);

-- TEST
CREATE TABLE IF NOT EXISTS test (
    test_id      SERIAL PRIMARY KEY,
    test_name    VARCHAR(200) NOT NULL,
    duration     INT NOT NULL,   -- minutes
    total_marks  NUMERIC(8,2) NOT NULL DEFAULT 0,
    is_randomized BOOLEAN DEFAULT FALSE,
    created_by   INT NOT NULL REFERENCES users(user_id),
    created_at   TIMESTAMP DEFAULT NOW()
);

-- TEST_QUESTION
CREATE TABLE IF NOT EXISTS test_question (
    test_id        INT NOT NULL REFERENCES test(test_id) ON DELETE CASCADE,
    question_id    INT NOT NULL REFERENCES question(question_id) ON DELETE CASCADE,
    marks          NUMERIC(5,2) NOT NULL DEFAULT 1.0,
    sequence_order INT NOT NULL,
    PRIMARY KEY (test_id, question_id)
);

-- ATTEMPT
CREATE TABLE IF NOT EXISTS attempt (
    attempt_id SERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(user_id),
    test_id    INT NOT NULL REFERENCES test(test_id),
    start_time TIMESTAMP NOT NULL DEFAULT NOW(),
    end_time   TIMESTAMP,
    status     VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS'
                  CHECK (status IN ('IN_PROGRESS','SUBMITTED','AUTO_SUBMITTED','EXPIRED'))
);

-- RESPONSE
CREATE TABLE IF NOT EXISTS response (
    response_id     SERIAL PRIMARY KEY,
    attempt_id      INT NOT NULL REFERENCES attempt(attempt_id) ON DELETE CASCADE,
    question_id     INT NOT NULL REFERENCES question(question_id),
    selected_option CHAR(1) CHECK (selected_option IN ('A','B','C','D')),
    is_correct      BOOLEAN,
    marks_awarded   NUMERIC(5,2) DEFAULT 0,
    UNIQUE(attempt_id, question_id)
);

-- RESULT
CREATE TABLE IF NOT EXISTS result (
    result_id     SERIAL PRIMARY KEY,
    attempt_id    INT NOT NULL UNIQUE REFERENCES attempt(attempt_id),
    score         NUMERIC(8,2) NOT NULL DEFAULT 0,
    rank_position INT
);

-- ============================================================
--  INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_question_category ON question(category_id);
CREATE INDEX IF NOT EXISTS idx_question_difficulty ON question(difficulty);
CREATE INDEX IF NOT EXISTS idx_attempt_user ON attempt(user_id);
CREATE INDEX IF NOT EXISTS idx_attempt_test ON attempt(test_id);
CREATE INDEX IF NOT EXISTS idx_response_attempt ON response(attempt_id);
CREATE INDEX IF NOT EXISTS idx_result_attempt ON result(attempt_id);
