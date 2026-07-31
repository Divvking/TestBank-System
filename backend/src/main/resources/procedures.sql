-- ============================================================
--  PROCEDURES, TRIGGERS, VIEWS
-- ============================================================

-- ------------------------------------------------------------
-- FUNCTION: calculate_result(attempt_id)
-- Computes and upserts result for a given attempt.
-- Called from Java (ResultService) after submission.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_result(p_attempt_id INT)
RETURNS NUMERIC AS $$
DECLARE
    v_score NUMERIC(8,2);
BEGIN
    SELECT COALESCE(SUM(marks_awarded), 0)
      INTO v_score
      FROM response
     WHERE attempt_id = p_attempt_id;

    INSERT INTO result(attempt_id, score)
    VALUES (p_attempt_id, v_score)
    ON CONFLICT (attempt_id)
    DO UPDATE SET score = EXCLUDED.score;

    RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- FUNCTION: compute_rank(test_id)
-- Recomputes rank_position for all submitted results of a test.
-- Called from Java (ResultService) after submission.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION compute_rank(p_test_id INT)
RETURNS VOID AS $$
BEGIN
    WITH ranked AS (
        SELECT r.result_id,
               RANK() OVER (ORDER BY r.score DESC) AS rk
          FROM result r
          JOIN attempt a ON a.attempt_id = r.attempt_id
         WHERE a.test_id = p_test_id
           AND a.status IN ('SUBMITTED','AUTO_SUBMITTED')
    )
    UPDATE result
       SET rank_position = ranked.rk
      FROM ranked
     WHERE result.result_id = ranked.result_id;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- TRIGGER FUNCTION: fn_auto_grade_response
-- Fires BEFORE INSERT OR UPDATE on response.
-- Looks up the correct_option from question and the allocated
-- marks from test_question (falls back to question.default_marks),
-- then sets is_correct and marks_awarded automatically.
-- Java only needs to INSERT/UPDATE selected_option — grading
-- is handled entirely here in the database.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_auto_grade_response()
RETURNS TRIGGER AS $$
DECLARE
    v_correct_option CHAR(1);
    v_test_id        INT;
    v_marks          NUMERIC(5,2);
BEGIN
    -- Get the correct answer for this question
    SELECT correct_option
      INTO v_correct_option
      FROM question
     WHERE question_id = NEW.question_id;

    -- Get the test_id for this attempt (needed to look up per-test marks)
    SELECT test_id
      INTO v_test_id
      FROM attempt
     WHERE attempt_id = NEW.attempt_id;

    -- Look up marks allocated for this question in this test;
    -- fall back to the question's default_marks if not found
    SELECT COALESCE(
               (SELECT marks FROM test_question
                 WHERE test_id = v_test_id
                   AND question_id = NEW.question_id),
               (SELECT default_marks FROM question
                 WHERE question_id = NEW.question_id)
           )
      INTO v_marks;

    -- Grade the response
    IF NEW.selected_option IS NOT NULL AND NEW.selected_option = v_correct_option THEN
        NEW.is_correct    := TRUE;
        NEW.marks_awarded := v_marks;
    ELSE
        NEW.is_correct    := FALSE;
        NEW.marks_awarded := 0;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate so this script is idempotent (safe to re-run)
DROP TRIGGER IF EXISTS trg_auto_grade_response ON response;

CREATE TRIGGER trg_auto_grade_response
    BEFORE INSERT OR UPDATE OF selected_option ON response
    FOR EACH ROW
    EXECUTE FUNCTION fn_auto_grade_response();

-- ------------------------------------------------------------
-- VIEW: leaderboard_view
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT
    t.test_id,
    t.test_name,
    u.user_id,
    u.name   AS student_name,
    u.email,
    r.score,
    r.rank_position,
    a.end_time AS submitted_at
FROM result r
JOIN attempt a ON a.attempt_id = r.attempt_id
JOIN users   u ON u.user_id    = a.user_id
JOIN test    t ON t.test_id    = a.test_id
WHERE a.status IN ('SUBMITTED','AUTO_SUBMITTED')
ORDER BY t.test_id, r.rank_position;

-- ------------------------------------------------------------
-- VIEW: question_performance_view
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW question_performance_view AS
SELECT
    q.question_id,
    q.question_text,
    c.category_name,
    q.difficulty,
    COUNT(resp.response_id)                                          AS total_attempts,
    COUNT(CASE WHEN resp.is_correct THEN 1 END)                      AS correct_count,
    ROUND(
        COUNT(CASE WHEN resp.is_correct THEN 1 END)::NUMERIC /
        NULLIF(COUNT(resp.response_id),0) * 100, 2
    )                                                                AS accuracy_pct
FROM question q
LEFT JOIN category  c    ON c.category_id  = q.category_id
LEFT JOIN response  resp ON resp.question_id = q.question_id
GROUP BY q.question_id, q.question_text, c.category_name, q.difficulty;
